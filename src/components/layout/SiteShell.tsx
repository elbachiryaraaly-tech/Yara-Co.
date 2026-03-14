"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isAdminLogin = pathname === "/login/admin";

  if (isAdmin || isAdminLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="min-h-screen pt-20 lg:pt-24">{children}</main>
      <Footer />
    </>
  );
}
