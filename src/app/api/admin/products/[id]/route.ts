import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ImageInput = { url: string; alt?: string | null; order?: number };
type VariantInput = {
  name: string;
  sku?: string | null;
  providerVariantId?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock?: number;
  options?: Record<string, string>;
  imageUrl?: string | null;
};

type Body = {
  name: string;
  slug?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  stock?: number;
  trackInventory?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: string | null;
  badges?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  weight?: number | null;
  providerId?: string | null;
  providerProductId?: string | null;
  images: ImageInput[];
  variants?: VariantInput[];
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const body = (await req.json()) as Body;
    const {
      name,
      slug: slugInput,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      sku,
      stock = 0,
      trackInventory = true,
      isActive = true,
      isFeatured = false,
      categoryId,
      badges = [],
      metaTitle,
      metaDescription,
      weight,
      providerId,
      providerProductId,
      images,
      variants = [],
    } = body;

    if (!name || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Nombre y precio son obligatorios. El precio debe ser ≥ 0." },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Añade al menos una imagen (URL)." },
        { status: 400 }
      );
    }

    let slug = slugInput?.trim() || existing.slug;
    if (slug !== existing.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug } });
      if (conflict) {
        return NextResponse.json(
          { error: "Ya existe otro producto con ese slug." },
          { status: 400 }
        );
      }
    }

    if (sku?.trim() && sku.trim() !== existing.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim() } });
      if (existingSku) {
        return NextResponse.json({ error: "Ya existe un producto con ese SKU." }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          shortDescription: shortDescription?.trim() || null,
          price,
          compareAtPrice: compareAtPrice ?? null,
          costPrice: costPrice ?? null,
          sku: sku?.trim() || null,
          stock: Math.max(0, Number(stock) || 0),
          trackInventory: !!trackInventory,
          isActive: !!isActive,
          isFeatured: !!isFeatured,
          categoryId: categoryId?.trim() || null,
          badges: JSON.stringify(Array.isArray(badges) ? badges.filter(Boolean) : []),
          metaTitle: metaTitle?.trim() || null,
          metaDescription: metaDescription?.trim() || null,
          weight: weight != null && String(weight).trim() !== "" ? Number(weight) : null,
          providerId: providerId?.trim() || null,
          providerProductId: providerProductId?.trim() || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: images.slice(0, 20).map((img, i) => ({
          productId: id,
          url: img.url?.trim() || "",
          alt: img.alt?.trim() || null,
          order: typeof img.order === "number" ? img.order : i,
        })),
      });

      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            productId: id,
            name: v.name?.trim() || "Variante",
            sku: v.sku?.trim() || null,
            providerVariantId: v.providerVariantId?.trim() || null,
            price: Number(v.price) || 0,
            compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
            stock: Math.max(0, Number(v.stock) ?? 0),
            options: JSON.stringify((v.options && typeof v.options === "object") ? v.options : {}),
            imageUrl: v.imageUrl?.trim() || null,
          })),
        });
      }
    });

    return NextResponse.json({ id, slug });
  } catch (e) {
    console.error("PATCH /api/admin/products/[id]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar si el producto existe
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Delete all related records in the correct order to avoid foreign key constraints
    await prisma.$transaction([
      // Delete from tables that reference Product
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      // Delete product-specific data
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      // Finally delete the product
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
