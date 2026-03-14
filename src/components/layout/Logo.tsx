"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  variant?: "header" | "admin" | "footer";
  className?: string;
};

/** Ampersand: tipografía serif clásica (Georgia) — forma elegante y legible */
function AmpersandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <text
        x="12"
        y="22"
        textAnchor="middle"
        dominantBaseline="alphabetic"
        fill="currentColor"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 26, fontWeight: 400 }}
      >
        &
      </text>
    </svg>
  );
}

/** Monograma: doble anillo + Y, estilo sello de lujo */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="0.9" fill="none" className="opacity-70" />
      <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <path
        d="M20 9v9.2m0 0l-7.2 12.8m7.2-12.8l7.2 12.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 18.2v12.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", variant = "header", className }: LogoProps) {
  const isHeader = variant === "header";
  const isAdmin = variant === "admin";

  const content = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          "shrink-0 text-[var(--gold)] transition-transform duration-200 group-hover:scale-105",
          isHeader && "h-9 w-9 sm:h-10 sm:w-10",
          isAdmin && "h-8 w-8",
          variant === "footer" && "h-8 w-8 text-[var(--gold)]/90"
        )}
      >
        <LogoMark className="h-full w-full" />
      </span>
      <span
        className={cn(
          "font-display font-semibold leading-none whitespace-nowrap inline-flex items-center gap-0.5",
          isHeader && "text-foreground text-[0.9rem] sm:text-[1rem] tracking-[0.06em]",
          isAdmin && "text-[var(--foreground)] text-[0.9rem] tracking-[0.05em]",
          variant === "footer" && "text-foreground text-[0.85rem] tracking-[0.05em]"
        )}
      >
        Yara
        <span className="inline-flex items-center justify-center text-[var(--gold)] shrink-0 w-[0.6em] h-[1em] align-middle">
          <AmpersandIcon className="h-full w-auto max-h-[1em]" />
        </span>
        Co.
      </span>
    </span>
  );

  const wrapperClass = cn(
    "inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn("group", wrapperClass)}>
        {content}
      </Link>
    );
  }

  return <span className={wrapperClass}>{content}</span>;
}
