"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn("flex items-center rounded-full border border-[var(--gold)]/20 bg-[var(--ink)]/80 p-0.5", className)}
      role="group"
      aria-label={t("nav.menu")}
    >
      {(["es", "en"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => setLocale(loc)}
          className={cn(
            "relative min-w-[2.25rem] py-1.5 px-2.5 text-xs font-medium uppercase tracking-wider transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            locale === loc
              ? "text-[var(--ink)] bg-[var(--gold)]"
              : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--gold)]/10"
          )}
          aria-pressed={locale === loc}
          aria-label={loc === "es" ? t("locale.es") : t("locale.en")}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
