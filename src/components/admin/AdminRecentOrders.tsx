import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { Order, User, OrderItem } from "@prisma/client";

type OrderWithUser = Order & {
  user: Pick<User, "name" | "email"> | null;
  items: OrderItem[];
};

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

export function AdminRecentOrders({ orders }: { orders: OrderWithUser[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Aún no hay pedidos. Los pedidos aparecerán aquí cuando los clientes compren.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="pb-3 px-6 font-medium">Pedido</th>
            <th className="pb-3 px-6 font-medium">Cliente</th>
            <th className="pb-3 px-6 font-medium">Total</th>
            <th className="pb-3 px-6 font-medium">Estado</th>
            <th className="pb-3 px-6 font-medium w-10" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50 transition-colors"
            >
              <td className="py-4 px-6">
                <span className="font-medium text-[var(--foreground)]">{order.orderNumber}</span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </td>
              <td className="py-4 px-6">
                <span className="text-[var(--foreground)]">
                  {order.user?.name ?? "—"}
                </span>
                <span className="block text-xs text-muted-foreground">{order.email}</span>
              </td>
              <td className="py-4 px-6 font-semibold text-[var(--gold)]">
                {formatPrice(Number(order.total))}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusClass[order.status] ?? "bg-[var(--elevated)] text-muted-foreground"
                  }`}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </td>
              <td className="py-4 px-6">
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="inline-flex items-center text-[var(--gold)] hover:underline text-sm"
                >
                  Ver <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
