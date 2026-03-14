import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { z } from "zod";
import { getAppBaseUrl } from "@/lib/get-base-url";

const schema = z.object({ orderId: z.string() });

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!stripeEnabled || !stripe) {
        return NextResponse.json({ error: "Stripe no está configurado" }, { status: 503 });
    }

    try {
        const { orderId } = schema.parse(await req.json());

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } }
            }
        });

        if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

        const role = (session.user as any).role;
        if (order.userId !== session.user.id && role !== "ADMIN") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        if (order.status !== "PENDING") {
            return NextResponse.json({ error: "El pedido ya ha sido pagado o cancelado" }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: order.currency.toLowerCase(),
                        product_data: {
                            name: `Pedido ${order.orderNumber}`,
                            description: `Completar pago de ${order.items.length} producto(s) · Yara & Co.`,
                        },
                        unit_amount: Math.round(Number(order.total) * 100),
                    },
                    quantity: 1,
                },
            ],
            customer_email: order.email,
            metadata: { orderId: order.id, userId: order.userId },
            success_url: `${getAppBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${getAppBaseUrl()}/cuenta/pedidos/${order.id}`,
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (e) {
        console.error("[Retry Payment Error]", e);
        return NextResponse.json({ error: "Error al generar el enlace de pago" }, { status: 500 });
    }
}
