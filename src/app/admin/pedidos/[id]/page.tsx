import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { RetryDropshippingButton } from "@/components/admin/RetryDropshippingButton";
import { ArrowLeft, User, MapPin, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              providerId: true,
              provider: { select: { name: true } },
            },
          },
        },
      },
      shippingAddress: true,
      dropshippingLogs: {
        orderBy: { attemptedAt: "desc" },
        take: 5,
        include: { provider: { select: { name: true } } },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-8">
      <AdminBreadcrumb
        items={[{ label: "Pedidos", href: "/admin/pedidos" }, { label: order.orderNumber }]}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Pedido {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleString("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${
            order.status === "CANCELLED" || order.status === "REFUNDED"
              ? "bg-red-500/20 text-red-400"
              : order.status === "DELIVERED"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[var(--gold)]/20 text-[var(--gold)]"
          }`}
        >
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--gold)]" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    <span className="font-semibold text-[var(--gold)]">
                      {formatPrice(Number(item.total))}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[var(--gold)]" />
                  Dirección de envío
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm space-y-1">
                <p className="text-[var(--foreground)] font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>
                  {order.shippingAddress.zip} {order.shippingAddress.city},{" "}
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--gold)]" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-[var(--foreground)] font-medium">
                {order.user?.name ?? "—"}
              </p>
              <p className="text-muted-foreground">{order.email}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envío</span>
                <span>{formatPrice(Number(order.shipping))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Descuento</span>
                  <span>-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="border-t border-[var(--border)] pt-3 flex justify-between font-semibold text-[var(--foreground)]">
                <span>Total</span>
                <span className="text-[var(--gold)]">{formatPrice(Number(order.total))}</span>
              </div>
              {order.trackingNumber && (
                <div className="pt-3 border-t border-[var(--border)]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Seguimiento
                  </p>
                  <p className="font-mono text-sm text-[var(--foreground)]">
                    {order.trackingNumber}
                  </p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--gold)] hover:underline text-sm mt-1 inline-block"
                    >
                      Ver seguimiento
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {order.items.some((i) => i.product.providerId) && (
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <Truck className="h-5 w-5 text-[var(--gold)]" />
                  Dropshipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.providerOrderId ? (
                  <p className="text-sm text-muted-foreground">
                    ID en proveedor: <span className="font-mono text-[var(--foreground)]">{order.providerOrderId}</span>
                  </p>
                ) : null}
                {order.dropshippingLogs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Últimos intentos</p>
                    {order.dropshippingLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 text-sm py-1.5 px-2 rounded-lg bg-[var(--elevated)]"
                      >
                        {log.status === "sent" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : log.status === "failed" ? (
                          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-[var(--foreground)]">{log.provider.name}</span>
                          {" · "}
                          <span className="text-muted-foreground">
                            {new Date(log.attemptedAt).toLocaleString("es-ES")}
                          </span>
                          {log.status === "failed" && log.errorMessage && (
                            <p className="text-red-400 text-xs mt-1">{log.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {(order.items.every((i) => i.product.providerId) && order.items.length > 0) && (
                  <RetryDropshippingButton orderId={order.id} />
                )}
              </CardContent>
            </Card>
          )}

          <Button variant="outline" className="w-full rounded-xl border-[var(--border)]" asChild>
            <Link href="/admin/pedidos" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a pedidos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
