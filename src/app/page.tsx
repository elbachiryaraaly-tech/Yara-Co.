import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { MarqueeStrip } from "@/components/home/MarqueeStrip";
import { FeaturedCollectionsSection } from "@/components/home/FeaturedCollectionsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyYaraCo } from "@/components/home/WhyYaraCo";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const showAdminForbidden = params?.error === "admin_forbidden";

  return (
    <>
      {showAdminForbidden && (
        <div className="sticky top-0 z-50 bg-[var(--ink)] border-b border-[var(--gold)]/20 text-[var(--paper)]/90 px-4 py-3 flex items-center justify-center gap-4 flex-wrap text-center text-sm">
          <span>
            No tienes permiso para acceder al panel de administración. Inicia sesión con la cuenta
            de administrador.
          </span>
          <Link
            href="/login?callbackUrl=/admin"
            className="font-medium text-[var(--gold)] hover:text-[var(--gold-soft)] transition-colors whitespace-nowrap"
          >
            Iniciar sesión como admin →
          </Link>
        </div>
      )}
      <HeroSection />
      <StatsBar />
      <MarqueeStrip />
      <FeaturedCollectionsSection />
      <FeaturedProducts />
      <WhyYaraCo />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
