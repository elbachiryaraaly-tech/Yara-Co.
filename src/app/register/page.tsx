import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] flex">
      <aside className="hidden lg:flex lg:w-[50%] xl:w-[55%] relative overflow-hidden bg-[var(--elevated)] border-r border-[var(--border)]">
        <div className="absolute inset-0 grain" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a YaraLuxe
          </Link>
          <div>
            <p className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] mb-4">
              Únete a Yara & Co.
            </p>
            <h1 className="font-display text-4xl xl:text-5xl font-bold text-[var(--foreground)] tracking-tight max-w-md">
              Crea tu cuenta y disfruta de ventajas exclusivas.
            </h1>
            <p className="mt-6 text-muted-foreground max-w-sm text-lg leading-relaxed">
              Seguimiento de pedidos, lista de deseos y ofertas solo para miembros.
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Al registrarte aceptas nuestra{" "}
            <Link href="/privacidad" className="text-[var(--gold-soft)] hover:text-[var(--gold)] transition-colors">
              política de privacidad
            </Link>
            .
          </p>
        </div>
      </aside>

      <main className="w-full lg:w-[50%] xl:w-[45%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex flex-col gap-4">
            <Logo href="/" variant="header" className="block w-fit" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
          <p className="text-[var(--gold)] text-xs uppercase tracking-[0.2em] mb-2 lg:hidden">
            Crear cuenta
          </p>
          <h2 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Crear cuenta
          </h2>
          <p className="text-muted-foreground mb-8">
            Rellena los datos para registrarte. ¿Ya tienes cuenta? Inicia sesión.
          </p>
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
