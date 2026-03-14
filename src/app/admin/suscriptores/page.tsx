import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { getAdminSubscribers } from "@/lib/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default async function AdminSuscriptoresPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const { subscribers, total, totalPages } = await getAdminSubscribers(page, 25);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Newsletter" }]} />
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Suscriptores
        </h1>
        <p className="text-muted-foreground mt-1">
          {total} suscriptor{total !== 1 ? "es" : ""} activo{total !== 1 ? "s" : ""}
        </p>
      </div>

      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[var(--elevated)] flex items-center justify-center">
                <Mail className="h-7 w-7 text-[var(--gold)]" />
              </div>
              <p>Aún no hay suscriptores a la newsletter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-6 font-medium">Email</th>
                    <th className="pb-3 px-6 font-medium">Fecha alta</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50"
                    >
                      <td className="py-4 px-6 font-medium text-[var(--foreground)]">
                        {s.email}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(s.createdAt).toLocaleDateString("es-ES", {
                          dateStyle: "medium",
                        })}
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
