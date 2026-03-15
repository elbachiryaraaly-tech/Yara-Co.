import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://yaraandco.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yara & Co. | Lujo Redefinido - Perfumes, Relojes, Joyería",
    template: "%s | Yara & Co.",
  },
  description:
    "Tienda de lujo online. Perfumes exclusivos, relojes premium, joyería y accesorios de élite. Envío gratis. Garantía de autenticidad.",
  keywords: ["lujo", "perfumes", "relojes", "joyería", "accesorios", "premium", "Yara & Co."],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("dark", "font-sans")}>
      <body className={`${playfair.variable} ${montserrat.variable} font-body min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <SessionProvider>
          <LocaleProvider>
            <CartProvider>
              <SiteShell>{children}</SiteShell>
              <Toaster />
            </CartProvider>
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
