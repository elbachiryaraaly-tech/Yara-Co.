"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const footerLinks = {
  comprar: [
    { href: "/productos", label: "Tienda" },
    { href: "/productos?categoria=perfumes", label: "Perfumes" },
    { href: "/productos?categoria=relojes", label: "Relojes" },
    { href: "/productos?categoria=joyeria", label: "Joyería" },
  ],
  ayuda: [
    { href: "/contacto", label: "Contacto" },
    { href: "/envios", label: "Envíos" },
    { href: "/devoluciones", label: "Devoluciones" },
  ],
  legal: [
    { href: "/privacidad", label: "Privacidad" },
    { href: "/terminos", label: "Términos" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
          <div>
            <Logo href="/" variant="footer" className="block" />
            <p className="mt-6 text-sm text-muted-foreground max-w-[200px]">
              Lujo redefinido. Perfumes, relojes y joyería de élite.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[var(--gold)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:contacto@yaraandco.com"
                className="text-muted-foreground hover:text-[var(--gold)] transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Comprar</p>
            <ul className="space-y-3">
              {footerLinks.comprar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Ayuda</p>
            <ul className="space-y-3">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">Legal</p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            © {new Date().getFullYear()} Yara & Co. Todos los derechos reservados.
          </p>
          <span className="font-display text-sm tracking-[0.2em] text-[var(--foreground)]/60 uppercase">
            Sevilla, España
          </span>
        </div>
      </div>
    </footer>
  );
}
