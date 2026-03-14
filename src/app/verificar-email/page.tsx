import Link from "next/link";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerificarEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)] mb-4">
          Verificar correo
        </h1>
        <VerifyEmailClient token={token ?? null} />
        <p className="mt-6 text-sm text-muted-foreground">
          <Link href="/login" className="text-[var(--gold)] hover:underline">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
