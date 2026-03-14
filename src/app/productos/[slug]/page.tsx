import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { ProductDetail } from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug).catch(() => null);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
