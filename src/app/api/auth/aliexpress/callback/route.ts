import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken } from "@/lib/aliexpress-oauth";
import { getBaseUrlFromRequest, getAppBaseUrl } from "@/lib/get-base-url";

const FALLBACK_BASE = getAppBaseUrl();

export async function GET(req: Request) {
  const baseUrl = getBaseUrlFromRequest(req) || FALLBACK_BASE;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login/admin", baseUrl));
    }
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // provider id
    if (!code) {
      return NextResponse.redirect(
        new URL("/admin/proveedores?error=aliexpress_no_code", baseUrl)
      );
    }
    const providerId = state?.trim() || undefined;
    const provider = providerId
      ? await prisma.dropshippingProvider.findUnique({
          where: { id: providerId, code: "aliexpress" },
        })
      : await prisma.dropshippingProvider.findFirst({
          where: { code: "aliexpress" },
        });
    if (!provider?.apiKey?.trim() || !provider.apiSecret?.trim()) {
      return NextResponse.redirect(
        new URL("/admin/proveedores?error=aliexpress_no_credentials", baseUrl)
      );
    }
    const redirectUri = `${baseUrl}/api/auth/aliexpress/callback`;
    const result = await exchangeCodeForToken({
      code,
      clientId: provider.apiKey.trim(),
      clientSecret: provider.apiSecret,
      redirectUri,
    });
    if (!result.success) {
      console.error("[AliExpress callback] exchangeCodeForToken failed:", result.error);
      const isAppkeyError = /appkey|app_key|param-appkey/i.test(result.error);
      const q = isAppkeyError
        ? "error=aliexpress_manual_token"
        : "error=aliexpress_token&message=" + encodeURIComponent(result.error);
      return NextResponse.redirect(new URL(`/admin/proveedores?${q}`, baseUrl));
    }
    await prisma.dropshippingProvider.update({
      where: { id: provider.id },
      data: {
        accessToken: result.data.access_token,
        // Mantener refresh_token anterior si la API no devuelve uno nuevo
        refreshToken: result.data.refresh_token ?? (provider as { refreshToken?: string | null }).refreshToken ?? undefined,
      },
    });
    return NextResponse.redirect(new URL("/admin/proveedores?aliexpress=connected", baseUrl));
  } catch (e) {
    console.error("GET /api/auth/aliexpress/callback", e);
    return NextResponse.redirect(
      new URL("/admin/proveedores?error=aliexpress_callback", baseUrl)
    );
  }
}
