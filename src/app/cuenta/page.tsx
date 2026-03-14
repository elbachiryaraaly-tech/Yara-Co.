import Link from "next/link";
import { Package, ChevronRight, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CuentaPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">Mi cuenta</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
          Bienvenido de nuevo
        </h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Gestiona tus pedidos, tu perfil y tu lista de deseos desde aquí.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/cuenta/pedidos"
          className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--gold)]/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--gold)]/10 p-3 text-[var(--gold)]">
              <Package className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
            Mis pedidos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Historial, seguimiento y facturas
          </p>
        </Link>

        <Link
          href="/cuenta/perfil"
          className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--gold)]/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--gold)]/10 p-3 text-[var(--gold)]">
              <User className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
            Mi perfil
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Datos personales y direcciones
          </p>
        </Link>

        <Link
          href="/cuenta/wishlist"
          className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--gold)]/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-[var(--gold)]/10 p-3 text-[var(--gold)]">
              <Heart className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
            Lista de deseos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus productos guardados
          </p>
        </Link>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 lg:p-8">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
          Últimos pedidos
        </h2>
        <p className="text-muted-foreground mb-6">
          Aún no tienes pedidos. Cuando realices tu primera compra, aparecerá aquí.
        </p>
        <Button asChild>
          <Link href="/productos">Explorar colección</Link>
        </Button>
      </section>
    </div>
  );
}
