import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminPedidosTable } from "@/components/admin/AdminPedidosTable";
import { getAdminOrders } from "@/lib/admin";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const status = searchParams.status || undefined;
  const { orders, total, totalPages } = await getAdminOrders(page, 20, status);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Pedidos" }]} />
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Pedidos
        </h1>
        <p className="text-muted-foreground mt-1">
          {total} pedido{total !== 1 ? "s" : ""}
        </p>
      </div>

      <AdminPedidosTable
        orders={orders}
        total={total}
        page={page}
        totalPages={totalPages}
        currentStatus={status}
      />
    </div>
  );
}
