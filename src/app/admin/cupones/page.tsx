import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { getAdminCoupons } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Percent, Euro } from "lucide-react";

export default async function AdminCuponesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const { coupons, total, totalPages } = await getAdminCoupons(page, 15);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Cupones" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Cupones
          </h1>
          <p className="text-muted-foreground mt-1">{total} cupones creados</p>
        </div>
        <Button asChild className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] shrink-0">
          <Link href="/admin/cupones/nuevo" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear cupón
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Aún no hay cupones. Crea uno para ofrecer descuentos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-6 font-medium">Código</th>
                    <th className="pb-3 px-6 font-medium">Tipo</th>
                    <th className="pb-3 px-6 font-medium">Valor</th>
                    <th className="pb-3 px-6 font-medium">Usos</th>
                    <th className="pb-3 px-6 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50"
                    >
                      <td className="py-4 px-6 font-mono font-semibold text-[var(--foreground)]">
                        {c.code}
                      </td>
                      <td className="py-4 px-6 flex items-center gap-2 text-muted-foreground">
                        {c.type === "PERCENTAGE" ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <Euro className="h-4 w-4" />
                        )}
                        {c.type === "PERCENTAGE" ? "Porcentaje" : "Fijo"}
                      </td>
                      <td className="py-4 px-6 text-[var(--gold)] font-medium">
                        {c.type === "PERCENTAGE"
                          ? `${Number(c.value)}%`
                          : `${Number(c.value)} €`}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">
                        {c.maxUses ? `${c.usedCount} / ${c.maxUses}` : c.usedCount}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            c.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--muted)]/30 text-muted-foreground"
                          }`}
                        >
                          {c.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
