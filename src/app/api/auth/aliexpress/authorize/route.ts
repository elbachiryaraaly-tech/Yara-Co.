import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAliExpressAuthUrl } from "@/lib/aliexpress-oauth";
import { getBaseUrlFromRequest, getAppBaseUrl } from "@/lib/get-base-url";

const FALLBACK_BASE = getAppBaseUrl();

export async function GET(req: Request) {
  const baseUrl = getBaseUrlFromRequest(req) || FALLBACK_BASE;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login/admin", baseUrl));
    }
    const provider = await prisma.dropshippingProvider.findFirst({
      where: { code: "aliexpress" },
    });
    if (!provider?.apiKey?.trim()) {
      return NextResponse.redirect(
        new URL("/admin/proveedores?error=aliexpress_no_config", baseUrl)
      );
    }
    // Flujo code: AliExpress redirige a /api/auth/aliexpress/callback?code=...; el servidor canjea el code por token.
    // Se intenta primero api-sg/oauth/token (openservice) y luego oauth.aliexpress.com/token.
    const redirectUri = `${baseUrl}/api/auth/aliexpress/callback`;
    const authUrl = getAliExpressAuthUrl({
      clientId: provider.apiKey.trim(),
      redirectUri,
      state: provider.id,
      tokenInUrl: false,
    });
    return NextResponse.redirect(authUrl);
  } catch (e) {
    console.error("GET /api/auth/aliexpress/authorize", e);
    return NextResponse.redirect(
      new URL("/admin/proveedores?error=aliexpress_authorize", baseUrl)
    );
  }
}
