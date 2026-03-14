import { getCurrentUser } from "@/lib/user";
import { PerfilForm } from "@/components/cuenta/PerfilForm";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-10">
      <div>
        <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">Mi perfil</p>
        <h1 className="font-display text-4xl font-bold text-[var(--foreground)] tracking-tight">
          Datos personales
        </h1>
        <p className="mt-2 text-muted-foreground">
          Actualiza tu nombre, email y contraseña.
        </p>
      </div>
      <PerfilForm
        initialData={{
          name: user?.name ?? "",
          email: user?.email ?? "",
        }}
      />
    </div>
  );
}
