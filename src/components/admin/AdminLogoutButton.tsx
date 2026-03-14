"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/login/admin` : "/login/admin" })}
      className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-red-400 transition-colors"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Cerrar sesión
    </button>
  );
}
