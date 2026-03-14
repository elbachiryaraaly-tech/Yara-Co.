import { NextResponse } from "next/server";
import { getShippingCost } from "@/lib/shipping";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitOrderToProvider } from "@/lib/dropshipping/submitOrderToProvider";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";
import { getAppBaseUrl } from "@/lib/get-base-url";

const bodySchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  address2: z.string().optional(),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(9),
  shippingMethod: z.enum(["standard", "express"]),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Inicia sesión para finalizar la compra" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const role = (session.user as { role?: string }).role;
  if (role === "CUSTOMER") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });
    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: "Verifica tu correo antes de finalizar la compra" },
        { status: 403 }
      );
    }
  }

  const where = { userId };

  try {
    const body = await req.json();
    const data = bodySchema.parse(body);

    const cartItems = await prisma.cartItem.findMany({
      where,
      include: {
        product: true,
        variant: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "El carrito está vacío" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    const orderItems: { productId: string; variantId: string | null; quantity: number; price: number; total: number }[] = [];
    for (const item of cartItems) {
      const price = item.variant ? Number(item.variant.price) : Number(item.product.price);
      const total = price * item.quantity;
      subtotal += total;
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price,
        total,
      });
    }

    const shippingCost = getShippingCost(data.country, data.shippingMethod, subtotal);
    const total = subtotal + shippingCost;

    const addr = await prisma.shippingAddress.create({
      data: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address,
        address2: data.address2 ?? undefined,
        city: data.city,
        zip: data.postalCode,
        country: data.country,
        phone: data.phone,
      },
    });

    const orderNumber = `YL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        email: (session.user as { email?: string }).email ?? userId,
        status: "PENDING",
        subtotal,
        discount: 0,
        shipping: shippingCost,
        tax: 0,
        total,
        currency: "EUR",
        shippingAddressId: addr.id,
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            total: i.total,
          })),
        },
      },
    });

    if (stripeEnabled && stripe) {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Pedido ${order.orderNumber}`,
                description: `${orderItems.length} producto(s) · Yara & Co.`,
                images: [],
              },
              unit_amount: Math.round(total * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: (session.user as { email?: string }).email ?? undefined,
        metadata: { orderId: order.id, userId },
        success_url: `${getAppBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getAppBaseUrl()}/checkout`,
      });
      return NextResponse.json({
        ok: true,
        url: checkoutSession.url,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    // Si Stripe no está habilitado, marcar como PAID y crear Payment manual
    if (!stripeEnabled || !stripe) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        }),
        prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            provider: "manual",
            providerPaymentId: `manual-${order.id}`,
            status: "COMPLETED",
            metadata: JSON.stringify({ source: "checkout-without-stripe" }),
          },
        }),
      ]);
    }

    await prisma.cartItem.deleteMany({ where });

    // Enviar al proveedor y email solo si el pedido está PAID
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
        user: { select: { name: true } },
      },
    });
    if (updatedOrder?.status === "PAID") {
      try {
        await submitOrderToProvider(order.id, { attemptNumber: 1, skipIfAlreadySent: true });
      } catch (e) {
        console.error("[Dropshipping] Error en envío automático para pedido", order.orderNumber, e);
      }
      // Enviar email de confirmación
      if (updatedOrder.email) {
        try {
          await sendOrderConfirmationEmail({
            to: updatedOrder.email,
            orderNumber: updatedOrder.orderNumber,
            customerName: updatedOrder.user?.name ?? null,
            total: Number(updatedOrder.total),
            currency: updatedOrder.currency,
            items: updatedOrder.items.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              price: Number(i.price),
            })),
            shippingAddress: updatedOrder.shippingAddress
              ? {
                address1: updatedOrder.shippingAddress.address1,
                city: updatedOrder.shippingAddress.city,
                zip: updatedOrder.shippingAddress.zip,
                country: updatedOrder.shippingAddress.country,
              }
              : null,
          });
        } catch (e) {
          console.error("[Checkout] Error al enviar email de confirmación", order.orderNumber, e);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Error al crear el pedido" },
      { status: 500 }
    );
  }
}
