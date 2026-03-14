import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden bg-[var(--ink)] border-r border-[var(--border)]">
        <div className="absolute inset-0 grain opacity-50" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 text-[var(--gold)] text-sm uppercase tracking-[0.25em] mb-4">
              <Shield className="h-4 w-4" />
              Acceso restringido
            </div>
            <h1 className="font-display text-4xl xl:text-5xl font-bold text-[var(--foreground)] tracking-tight max-w-md">
              Panel de administración
            </h1>
            <p className="mt-6 text-muted-foreground max-w-sm text-lg leading-relaxed">
              Introduce las credenciales de administrador para acceder al panel de control de Yara & Co.
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Solo personal autorizado. ¿Problemas?{" "}
            <a href="mailto:contacto@yaraandco.com" className="text-[var(--gold-soft)] hover:text-[var(--gold)] transition-colors">
              Contactar soporte
            </a>
          </p>
        </div>
      </aside>

      <main className="w-full lg:w-[50%] xl:w-[45%] flex items-center justify-center p-6 sm:p-10 bg-[var(--elevated)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la tienda
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 text-[var(--gold)] text-xs uppercase tracking-[0.2em] mb-2">
            <Shield className="h-3.5 w-3.5" />
            Acceso administrador
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Iniciar sesión (admin)
          </h2>
          <p className="text-muted-foreground mb-8">
            Email y contraseña de la cuenta de administrador.
          </p>
          <Suspense fallback={<div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />}>
            <LoginForm defaultCallbackUrl="/admin" />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
