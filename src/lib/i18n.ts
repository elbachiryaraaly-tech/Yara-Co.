/**
 * Internacionalización ES/EN. Locale en cookie para persistir entre sesiones.
 */

export type Locale = "es" | "en";

export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año
export const LOCALE_COOKIE_PATH = "/";

export function getLocaleFromCookie(cookieHeader: string | null): Locale {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const match = cookieHeader.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim().toLowerCase();
  return value === "en" ? "en" : "es";
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=${LOCALE_COOKIE_PATH}; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getLocaleFromDocument(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim().toLowerCase();
  return value === "en" ? "en" : "es";
}
