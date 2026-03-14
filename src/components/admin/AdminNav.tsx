"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Tag,
  Mail,
  Truck,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/cupones", label: "Cupones", icon: Tag },
  { href: "/admin/suscriptores", label: "Newsletter", icon: Mail },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30"
                : "text-muted-foreground hover:text-[var(--foreground)] hover:bg-[var(--elevated)] border border-transparent"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
