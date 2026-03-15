import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--background)]">
      <Logo href="/" variant="header" className="mb-12" />
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--foreground)] tracking-tight text-center mb-4">
        404
      </h1>
      <p className="text-muted-foreground text-lg text-center max-w-md mb-10">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-[var(--gold)] text-[var(--ink)] font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
