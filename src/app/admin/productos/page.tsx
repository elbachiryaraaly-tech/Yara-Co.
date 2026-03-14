import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminProductosTable } from "@/components/admin/AdminProductosTable";
import { Button } from "@/components/ui/button";
import { getAdminProducts } from "@/lib/admin";
import { Plus } from "lucide-react";
import { AdminImportCjButton } from "@/components/admin/AdminImportCjButton";
import { AdminImportPrintfulButton } from "@/components/admin/AdminImportPrintfulButton";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const search = searchParams.q?.trim() || undefined;
  const { products, total, totalPages } = await getAdminProducts(page, 20, search);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Productos" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Productos
          </h1>
          <p className="text-muted-foreground mt-1">
            {total} producto{total !== 1 ? "s" : ""} en el catálogo
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AdminImportCjButton />
          <AdminImportPrintfulButton />
          <Button asChild className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]">
            <Link href="/admin/productos/nuevo" className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir producto
            </Link>
          </Button>
        </div>
      </div>

      <AdminProductosTable
        products={products}
        total={total}
        page={page}
        totalPages={totalPages}
        initialSearch={search}
      />
    </div>
  );
}
