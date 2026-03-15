import type { Locale } from "@/lib/i18n";
import { es } from "./es";
import { en } from "./en";

export const messages: Record<Locale, typeof es> = { es, en } as unknown as Record<Locale, typeof es>;

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function getMessage(locale: Locale, key: string): string {
  const obj = messages[locale] as Record<string, unknown>;
  const value = getNested(obj, key);
  if (value !== undefined) return value;
  const fallback = getNested(es as Record<string, unknown>, key);
  return fallback ?? key;
}
