"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  ordersCount: number;
  totalSpent: number;
};

export function AdminClientesTable({
  users,
  total,
  page,
  totalPages,
  initialSearch = "",
}: {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  const updateParams = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === 1) next.delete(k);
      else next.set(k, String(v));
    });
    router.push(`/admin/clientes?${next.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: search, page: 1 });
  };

  return (
    <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[var(--border)]">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
            <Button type="submit" variant="outline" className="rounded-lg border-[var(--border)]">
              Buscar
            </Button>
          </form>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay clientes que coincidan.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 px-6 font-medium">Cliente</th>
                    <th className="pb-3 px-6 font-medium">Pedidos</th>
                    <th className="pb-3 px-6 font-medium">Total gastado</th>
                    <th className="pb-3 px-6 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--elevated)]/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-medium text-[var(--foreground)]">
                          {u.name ?? "—"}
                        </span>
                        <span className="block text-sm text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="py-4 px-6">{u.ordersCount}</td>
                      <td className="py-4 px-6 font-semibold text-[var(--gold)]">
                        {formatPrice(u.totalSpent)}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(u.createdAt).toLocaleDateString("es-ES")}
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
