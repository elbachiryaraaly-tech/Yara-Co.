"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, Heart, LayoutDashboard, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/cuenta", label: "Resumen", icon: LayoutDashboard },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/perfil", label: "Mi perfil", icon: User },
  { href: "/cuenta/wishlist", label: "Lista de deseos", icon: Heart },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-28 space-y-1">
      {nav.map((item) => {
        const isActive = item.href === "/cuenta" ? pathname === "/cuenta" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors group",
              isActive
                ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                : "text-foreground/80 hover:bg-[var(--elevated)] hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0 opacity-80" />
            {item.label}
            <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity lg:hidden" />
          </Link>
        );
      })}
    </nav>
  );
}
