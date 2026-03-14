import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getUserOrders } from "@/lib/user";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  PROCESSING: "Procesando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusClass: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400",
  PAID: "bg-emerald-500/20 text-emerald-400",
  PROCESSING: "bg-blue-500/20 text-blue-400",
  SHIPPED: "bg-[var(--gold)]/20 text-[var(--gold)]",
  DELIVERED: "bg-emerald-500/20 text-emerald-400",
  CANCELLED: "bg-red-500/20 text-red-400",
  REFUNDED: "bg-[var(--muted)]/30 text-muted-foreground",
};

export default async function PedidosPage() {
  const orders = await getUserOrders(50);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">Mis pedidos</p>
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
          Historial de pedidos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Revisa el estado y el seguimiento de tus compras.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Aún no tienes pedidos
            </h2>
            <p className="text-muted-foreground text-center max-w-sm mb-8">
              Cuando realices tu primera compra, aparecerá aquí con el estado y el número de seguimiento.
            </p>
            <Button asChild>
              <Link href="/productos">Explorar colección</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4 border-b border-[var(--border)]">
                <div>
                  <CardTitle className="text-foreground font-display text-lg">
                    Pedido {order.orderNumber}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString("es-ES")} ·{" "}
                    {order.items?.length ?? 0} producto{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    statusClass[order.status] ?? "bg-[var(--elevated)] text-muted-foreground"
                  }`}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-[var(--elevated)] p-3">
                      <Truck className="h-5 w-5 text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Seguimiento: {order.trackingNumber ?? "—"}
                      </p>
                      <p className="text-2xl font-semibold text-[var(--gold)] mt-1">
                        {formatPrice(Number(order.total))}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 rounded-lg" asChild>
                    <Link href={`/cuenta/pedidos/${order.id}`} className="gap-2">
                      Ver detalle
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
