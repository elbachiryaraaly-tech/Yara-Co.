"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Mail } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useLocale } from "@/components/providers/LocaleProvider";

const footerLinks = {
  comprar: [
    { href: "/productos", key: "nav.shop" },
    { href: "/productos?categoria=perfumes", key: "nav.perfumes" },
    { href: "/productos?categoria=relojes", key: "nav.watches" },
    { href: "/productos?categoria=joyeria", key: "nav.jewelry" },
  ],
  ayuda: [
    { href: "/contacto", key: "footer.contact" },
    { href: "/envios", key: "footer.shipping" },
    { href: "/devoluciones", key: "footer.returns" },
  ],
  legal: [
    { href: "/privacidad", key: "footer.privacy" },
    { href: "/terminos", key: "footer.terms" },
  ],
};

export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-[var(--gold)]/10 bg-[var(--ink)]">
      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
          <div>
            <Logo href="/" variant="footer" className="block" />
            <p className="mt-6 text-sm text-[var(--foreground)]/55 max-w-[200px] leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--foreground)]/55 hover:text-[var(--gold)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:contacto@yaraandco.com"
                className="text-[var(--foreground)]/55 hover:text-[var(--gold)] transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--foreground)]/50 mb-6">{t("footer.buy")}</p>
            <ul className="space-y-3">
              {footerLinks.comprar.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--foreground)]/50 mb-6">{t("footer.help")}</p>
            <ul className="space-y-3">
              {footerLinks.ayuda.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--foreground)]/50 mb-6">{t("footer.legal")}</p>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground)]/80 hover:text-[var(--gold)] transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-[var(--gold)]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--foreground)]/50 uppercase tracking-[0.15em]">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <span className="font-display text-sm tracking-[0.2em] text-[var(--foreground)]/60 uppercase">
            {t("footer.location")}
          </span>
        </div>
      </div>
    </footer>
  );
}
