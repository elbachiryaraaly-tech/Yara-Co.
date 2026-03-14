import { prisma } from "@/lib/prisma";
import { refreshAliExpressToken } from "./aliexpress-oauth";

/**
 * Renueva el access_token de un proveedor AliExpress usando refresh_token.
 * Actualiza accessToken (y refreshToken si la API devuelve uno nuevo) en la BD.
 */
export async function refreshAliExpressProviderToken(
  providerId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const provider = await prisma.dropshippingProvider.findUnique({
    where: { id: providerId },
    select: { id: true, apiKey: true, apiSecret: true, refreshToken: true },
  });
  if (!provider?.apiKey?.trim() || !provider.apiSecret?.trim() || !provider.refreshToken?.trim()) {
    return { ok: false, error: "Proveedor sin refresh_token o credenciales" };
  }
  const result = await refreshAliExpressToken({
    clientId: provider.apiKey.trim(),
    clientSecret: provider.apiSecret,
    refreshToken: provider.refreshToken.trim(),
  });
  if (!result.success) {
    return { ok: false, error: result.error };
  }
  await prisma.dropshippingProvider.update({
    where: { id: providerId },
    data: {
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token ?? undefined,
    },
  });
  return { ok: true };
}

export function isTokenRelatedError(error: string | undefined): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return (
    lower.includes("access_token") ||
    lower.includes("access token") ||
    (lower.includes("token") &&
      (lower.includes("expired") || lower.includes("invalid") || lower.includes("not supplied")))
  );
}
