import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { Logo } from "@/components/layout/Logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login/admin");
  }

  // Verificar rol: primero en sesión, luego en BD
  let role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });
      if (dbUser?.role === "ADMIN") {
        role = "ADMIN";
      }
    } catch (e) {
      console.error("[AdminLayout] Error verificando rol:", e);
    }
  }

  if (role !== "ADMIN") {
    redirect("/?error=admin_forbidden");
  }

  return (
    <div className="min-h-screen bg-[var(--ink)] flex">
      <aside className="w-64 xl:w-72 shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col">
        <div className="p-6 border-b border-[var(--border)]">
          <Logo href="/admin" variant="admin" className="block" />
          <p className="text-muted-foreground text-[10px] mt-3 uppercase tracking-[0.2em]">
            Panel de control
          </p>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium tracking-wider">
            Admin
          </p>
        </div>
        <AdminNav />
        <div className="mt-auto p-4 border-t border-[var(--border)] space-y-3">
          <AdminLogoutButton />
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors block"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 xl:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
