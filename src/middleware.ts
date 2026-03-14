import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Checkout: solo usuarios autenticados (tras login vuelven a /checkout)
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.sub) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", "/checkout");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Proteger todas las rutas /admin/* y /dashboard/*
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay sesión, redirigir al login de admin
    if (!token?.sub) {
      return NextResponse.redirect(new URL("/login/admin", request.url));
    }

    // Verificar rol ADMIN en el token (el layout también verificará en BD como fallback)
    const role = token.role as string | undefined;
    if (role && role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "admin_forbidden");
      return NextResponse.redirect(homeUrl);
    }
    // Si role no está en token, dejamos pasar y el layout lo verificará en BD
  }

  // Redirigir /dashboard a /admin (alias)
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};
