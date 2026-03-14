"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { Order, User } from "@prisma/client";

type OrderWithUser = Order & { user: Pick<User, "name" | "email"> | null };

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

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
];

export function AdminPedidosTable({
  orders,
  total,
  page,
  totalPages,
  currentStatus = "",
}: {
  orders: OrderWithUser[];
  total: number;
  page: number;
  totalPages: number;
  currentStatus?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === 1) next.delete(k);
      else next.set(k, String(v));
    });
    router.push(`/admin/pedidos?${next.toString()}`);
  };

  return (
    <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={currentStatus}
              onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
              className="bg-[var(--elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay pedidos con los filtros seleccionados.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-6 font-medium">Pedido</th>
                    <th className="pb-3 px-6 font-medium">Fecha</th>
                    <th className="pb-3 px-6 font-medium">Cliente</th>
                    <th className="pb-3 px-6 font-medium">Total</th>
                    <th className="pb-3 px-6 font-medium">Estado</th>
                    <th className="pb-3 px-6 font-medium w-24" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-[var(--foreground)]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                          Ver <ChevronRight className="h-4 w-4 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-[var(--border)]"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: page - 1 })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-[var(--border)]"
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: page + 1 })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
