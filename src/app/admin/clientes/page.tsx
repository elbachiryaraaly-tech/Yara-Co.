import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminClientesTable } from "@/components/admin/AdminClientesTable";
import { getAdminCustomers } from "@/lib/admin";

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.q?.trim() || undefined;
  const { users, total, totalPages } = await getAdminCustomers(page, 20, search);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Clientes" }]} />
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Clientes
        </h1>
        <p className="text-muted-foreground mt-1">
          {total} cliente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
        </p>
      </div>

      <AdminClientesTable
        users={users}
        total={total}
        page={page}
        totalPages={totalPages}
        initialSearch={search}
      />
    </div>
  );
}
