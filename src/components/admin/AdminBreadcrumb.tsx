import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Item = { label: string; href?: string };

export function AdminBreadcrumb({ items }: { items: Item[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/admin" className="hover:text-[var(--gold)] transition-colors">
        Admin
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-[var(--border)]" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--gold)] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--foreground)] font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
