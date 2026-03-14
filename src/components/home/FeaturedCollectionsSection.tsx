import { getCategories } from "@/lib/products";
import { FeaturedCollections } from "./FeaturedCollections";

const DEFAULT_IMAGES: Record<string, string> = {
  perfumes: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
  relojes: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
  joyeria: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  accesorios: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
};

export async function FeaturedCollectionsSection() {
  const categories = await getCategories().catch(() => []);
  const collections = categories.slice(0, 4).map((c) => ({
    href: `/productos?categoria=${c.slug}`,
    title: c.name,
    subtitle: c.description ?? "",
    image: c.image ?? DEFAULT_IMAGES[c.slug] ?? DEFAULT_IMAGES.perfumes,
  }));
  return <FeaturedCollections collections={collections} />;
}
