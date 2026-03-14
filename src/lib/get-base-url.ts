/**
 * Obtiene la URL base de la app desde la petición (para que funcione con ngrok,
 * proxy inverso o localhost sin cambiar NEXTAUTH_URL).
 */
export function getBaseUrlFromRequest(req: Request): string {
  const proto = req.headers.get("x-forwarded-proto") || req.headers.get("x-forwarded-protocol") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const base = `${proto === "https" ? "https" : "http"}://${host}`.replace(/\/$/, "");
  return ensureHttpForLocalhost(base);
}

/**
 * Para localhost/127.0.0.1 siempre devuelve http (evita ERR_SSL_PROTOCOL_ERROR en desarrollo).
 * Usar para success_url, cancel_url, redirects y NEXTAUTH_URL en runtime.
 */
export function ensureHttpForLocalhost(url: string): string {
  const u = url.trim().replace(/\/$/, "");
  try {
    const parsed = new URL(u);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return `http://${parsed.host}${parsed.pathname}`.replace(/\/$/, "") || `http://${parsed.host}`;
  } catch {
    // no-op
  }
  return u;
}

/** URL base para redirects y Stripe: prioriza SITE_URL, luego NEXTAUTH_URL, y fuerza http en localhost. */
export function getAppBaseUrl(): string {
  // For production, return the new Vercel domain
  if (process.env.NODE_ENV === "production") {
    return "https://yaraandco.vercel.app";
  }

  // For development, try environment variable or localhost fallback
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return "http://localhost:3000";
}
