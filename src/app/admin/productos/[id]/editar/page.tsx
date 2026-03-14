import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminProductoNuevoForm } from "@/components/admin/AdminProductoNuevoForm";
import type { ProductForForm } from "@/components/admin/AdminProductoNuevoForm";
import { getCategories } from "@/lib/products";
import { getAdminProviders } from "@/lib/admin";
import { parseJsonArray } from "@/lib/utils";

export default async function AdminProductoEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });
  if (!product) notFound();

  const [categories, providers] = await Promise.all([
    getCategories(),
    getAdminProviders(),
  ]);

  const categoriesFlat = categories.flatMap((c) => [
    { id: c.id, name: c.name, slug: c.slug, children: undefined },
    ...(c.children || []).map((child) => ({
      id: child.id,
      name: `${c.name} › ${child.name}`,
      slug: child.slug,
      children: undefined as undefined,
    })),
  ]);

  const productForForm: ProductForForm = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice != null ? Number(product.costPrice) : null,
    sku: product.sku,
    stock: product.stock,
    trackInventory: product.trackInventory,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId,
    badges: parseJsonArray(product.badges),
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    weight: product.weight != null ? Number(product.weight) : null,
    providerId: product.providerId,
    providerProductId: product.providerProductId,
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      order: img.order,
    })),
    variants: product.variants.map((v) => ({
      name: v.name,
      sku: v.sku,
      providerVariantId: v.providerVariantId ?? "",
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
      stock: v.stock,
      options: (typeof v.options === "string" ? (() => { try { return JSON.parse(v.options) as Record<string, string>; } catch { return {}; } })() : (v.options as Record<string, string>)) ?? {},
      imageUrl: v.imageUrl,
    })),
  };

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Productos", href: "/admin/productos" },
          { label: product.name, href: `/admin/productos/${id}/editar` },
        ]}
      />
      <AdminProductoNuevoForm
        categories={categoriesFlat}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
        product={productForForm}
      />
    </div>
  );
}
