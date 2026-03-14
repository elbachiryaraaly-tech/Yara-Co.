import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getUserOrderById } from "@/lib/user";
import { RetryPaymentButton } from "@/components/checkout/RetryPaymentButton";

export default async function PedidoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getUserOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-10">
      <Link
        href="/cuenta/pedidos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis pedidos
      </Link>

      <div>
        <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">
          Pedido {order.orderNumber}
        </p>
        <h1 className="font-display text-4xl font-bold text-[var(--foreground)] tracking-tight">
          Detalle del pedido
        </h1>
        <p className="mt-2 text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString("es-ES")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--gold)]" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-3 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <Link
                      href={`/productos/${item.product.slug}`}
                      className="font-medium text-[var(--foreground)] hover:text-[var(--gold)]"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatPrice(Number(item.price))}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--gold)]">
                    {formatPrice(Number(item.total))}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[var(--gold)]" />
                  Seguimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--foreground)] font-mono text-sm">
                  {order.trackingNumber ?? "—"}
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Estado: <span className="text-[var(--gold)]">{order.status}</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] sticky top-28">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span>{Number(order.shipping) === 0 ? "Gratis" : formatPrice(Number(order.shipping))}</span>
              </div>
              <div className="border-t border-[var(--border)] pt-4 flex justify-between text-lg font-semibold text-[var(--foreground)]">
                <span>Total</span>
                <span className="text-[var(--gold)]">{formatPrice(Number(order.total))}</span>
              </div>
              {order.status === "PENDING" && (
                <RetryPaymentButton orderId={order.id} />
              )}
              <Button asChild variant="outline" className={`w-full rounded-lg ${order.status === "PENDING" ? "mt-2" : "mt-4"} border-[var(--border)] text-muted-foreground hover:text-[var(--foreground)]`}>
                <Link href="/cuenta/pedidos">Ver todos los pedidos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
