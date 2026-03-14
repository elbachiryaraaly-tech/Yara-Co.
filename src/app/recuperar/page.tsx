import { ForgotPasswordClient } from "@/components/auth/ForgotPasswordClient";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RecuperarPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-4">
        <ForgotPasswordClient token={token ?? null} />
        <p className="mt-4 text-sm text-muted-foreground">
          <a href="/login" className="text-[var(--gold)] hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </div>
  );
}

