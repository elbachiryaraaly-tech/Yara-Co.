import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/lib/admin";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  Euro,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminChart } from "@/components/admin/AdminChart";
import { AdminRecentOrders } from "@/components/admin/AdminRecentOrders";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <AdminBreadcrumb items={[{ label: "Dashboard" }]} />
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Resumen de tu tienda y actividad reciente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas hoy
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center">
              <Euro className="h-4 w-4 text-[var(--gold)]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {formatPrice(stats.todayRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Hoy
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas esta semana
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {formatPrice(stats.weekRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos pendientes
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats.pendingOrdersCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Por procesar / enviar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Productos
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-[var(--gold)]/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-[var(--gold)]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stats.productsCount}
            </p>
            <Link
              href="/admin/productos"
              className="text-xs text-[var(--gold)] hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              Gestionar <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">
              Ventas recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <AdminChart weekRevenue={stats.weekRevenue} todayRevenue={stats.todayRevenue} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[var(--foreground)]">Resumen rápido</CardTitle>
            <Link
              href="/admin/pedidos"
              className="text-sm text-[var(--gold)] hover:underline flex items-center gap-1"
            >
              Ver todo <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total pedidos</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {stats.ordersCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Clientes</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {stats.customersCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[var(--foreground)]">
            Últimos pedidos
          </CardTitle>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[var(--gold)] hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <AdminRecentOrders orders={stats.recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
