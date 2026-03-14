"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Package, Tag, Truck } from "lucide-react";

const imageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  order: z.number().optional(),
});

const variantSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  sku: z.string().optional(),
  providerVariantId: z.string().optional(),
  price: z.coerce.number().min(0, "Precio ≥ 0"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().min(0).optional(),
  options: z.record(z.string()).optional(),
  imageUrl: z.string().optional().nullable(),
});

const formSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0, "Precio ≥ 0"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  sku: z.string().optional(),
  stock: z.coerce.number().min(0).optional(),
  trackInventory: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().optional(),
  badges: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  weight: z.coerce.number().min(0).optional().nullable(),
  providerId: z.string().optional(),
  providerProductId: z.string().optional(),
  images: z.array(imageSchema).min(1, "Al menos una imagen"),
  variants: z.array(variantSchema).optional(),
});

type FormData = z.infer<typeof formSchema>;

type CategoryItem = { id: string; name: string; slug: string; children?: CategoryItem[] };
type ProviderItem = { id: string; name: string };

export type ProductForForm = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  stock: number;
  trackInventory: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string | null;
  badges: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  weight?: number | null;
  providerId?: string | null;
  providerProductId?: string | null;
  images: { url: string; alt?: string | null; order: number }[];
  variants: { name: string; sku?: string | null; providerVariantId?: string | null; price: number; compareAtPrice?: number | null; stock: number; options?: Record<string, string>; imageUrl?: string | null }[];
};

function getDefaultValues(product?: ProductForForm | null): FormData {
  if (!product) {
    return {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: 0,
      compareAtPrice: null,
      costPrice: null,
      sku: "",
      stock: 0,
      trackInventory: true,
      isActive: true,
      isFeatured: false,
      categoryId: "",
      badges: "",
      metaTitle: "",
      metaDescription: "",
      weight: null,
      providerId: "",
      providerProductId: "",
      images: [{ url: "", alt: "", order: 0 }],
      variants: [],
    };
  }
  const sortedImages = [...product.images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice != null ? Number(product.compareAtPrice) : null,
    costPrice: product.costPrice != null ? Number(product.costPrice) : null,
    sku: product.sku ?? "",
    stock: product.stock ?? 0,
    trackInventory: product.trackInventory ?? true,
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,
    categoryId: product.categoryId ?? "",
    badges: Array.isArray(product.badges) ? product.badges.join(", ") : "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    weight: product.weight != null ? Number(product.weight) : null,
    providerId: product.providerId ?? "",
    providerProductId: product.providerProductId ?? "",
    images: sortedImages.length > 0 ? sortedImages.map((img) => ({ url: img.url, alt: img.alt ?? "", order: img.order ?? 0 })) : [{ url: "", alt: "", order: 0 }],
    variants: (product.variants || []).map((v) => ({
      name: v.name,
      sku: v.sku ?? "",
      providerVariantId: v.providerVariantId ?? "",
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
      stock: v.stock ?? 0,
      options: v.options ?? {},
      imageUrl: v.imageUrl ?? null,
    })),
  };
}

export function AdminProductoNuevoForm({
  categories,
  providers,
  product,
}: {
  categories: CategoryItem[];
  providers: ProviderItem[];
  product?: ProductForForm | null;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const isEdit = Boolean(product?.id);

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Error al subir");
      setValue(`images.${index}.url`, data.url);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error al subir la imagen");
    } finally {
      setUploadingIndex(null);
    }
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(product),
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");
  const syncSlug = () => {
    if (!slugValue && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", slug);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    const images = data.images.filter((i) => i.url?.trim());
    if (images.length === 0) {
      setSubmitError("Añade al menos una imagen con URL válida.");
      return;
    }
    const payload = {
      name: data.name.trim(),
      slug: data.slug?.trim() || undefined,
      description: data.description?.trim() || undefined,
      shortDescription: data.shortDescription?.trim() || undefined,
      price: Number(data.price) || 0,
      compareAtPrice: data.compareAtPrice != null ? Number(data.compareAtPrice) : undefined,
      costPrice: data.costPrice != null ? Number(data.costPrice) : undefined,
      sku: data.sku?.trim() || undefined,
      stock: Number(data.stock) || 0,
      trackInventory: data.trackInventory ?? true,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      categoryId: data.categoryId?.trim() || undefined,
      badges: data.badges
        ? data.badges.split(",").map((b) => b.trim()).filter(Boolean)
        : [],
      metaTitle: data.metaTitle?.trim() || undefined,
      metaDescription: data.metaDescription?.trim() || undefined,
      weight: data.weight != null ? Number(data.weight) : undefined,
      providerId: data.providerId?.trim() || undefined,
      providerProductId: data.providerProductId?.trim() || undefined,
      images: images.map((img, i) => ({
        url: img.url.trim(),
        alt: img.alt?.trim() || null,
        order: i,
      })),
      variants: (data.variants || []).map((v) => ({
        name: v.name.trim(),
        sku: v.sku?.trim() || null,
        providerVariantId: v.providerVariantId?.trim() || null,
        price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
        stock: Number(v.stock) ?? 0,
        options: v.options || {},
        imageUrl: v.imageUrl?.trim() || null,
      })),
    };

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSubmitError(json.error ?? (isEdit ? "Error al guardar" : "Error al crear el producto"));
      return;
    }
    if (isEdit) {
      router.refresh();
    } else {
      router.push(`/admin/productos/${json.id}/editar`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {submitError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {submitError}
        </div>
      )}

      {/* Básicos */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--gold)]" />
            Datos básicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Nombre *</Label>
              <Input
                {...register("name")}
                placeholder="Ej: Eau de Parfum Midnight Oud"
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Slug (URL)</Label>
              <div className="flex gap-2">
                <Input
                  {...register("slug")}
                  placeholder="Se genera del nombre"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  onBlur={syncSlug}
                />
                <Button type="button" variant="outline" size="sm" onClick={syncSlug} className="shrink-0 border-[var(--border)]">
                  Generar
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Descripción corta</Label>
            <Input
              {...register("shortDescription")}
              placeholder="Una línea para listados"
              className="bg-[var(--elevated)] border-[var(--border)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Descripción</Label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Descripción completa del producto"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Precios e inventario */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">Precio e inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Precio (€) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
              {errors.price && (
                <p className="text-sm text-red-400">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Precio comparación (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("compareAtPrice")}
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Coste (€)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("costPrice")}
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">SKU</Label>
              <Input
                {...register("sku")}
                placeholder="Código único"
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Stock</Label>
              <Input
                type="number"
                min="0"
                {...register("stock", { valueAsNumber: true })}
                className="bg-[var(--elevated)] border-[var(--border)]"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-[var(--foreground)] cursor-pointer">
              <input type="checkbox" {...register("trackInventory")} className="rounded border-[var(--border)]" />
              Controlar inventario
            </label>
            <label className="flex items-center gap-2 text-[var(--foreground)] cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="rounded border-[var(--border)]" />
              Activo (visible en tienda)
            </label>
            <label className="flex items-center gap-2 text-[var(--foreground)] cursor-pointer">
              <input type="checkbox" {...register("isFeatured")} className="rounded border-[var(--border)]" />
              Destacado
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Categoría y badges */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <Tag className="h-5 w-5 text-[var(--gold)]" />
            Categoría y etiquetas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Categoría</Label>
            <select
              {...register("categoryId")}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Badges (separados por coma)</Label>
            <Input
              {...register("badges")}
              placeholder="NUEVO, EXCLUSIVO, -20%"
              className="bg-[var(--elevated)] border-[var(--border)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Imágenes */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[var(--gold)]" />
            Imágenes *
          </CardTitle>
          <p className="text-sm text-muted-foreground">URL o sube una imagen desde tu ordenador (máx. 5 MB, JPG/PNG/WebP/GIF).</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start p-4 rounded-xl bg-[var(--elevated)] border border-[var(--border)]">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    {...register(`images.${index}.url`)}
                    placeholder="https://... o sube un archivo abajo"
                    className="bg-[var(--card)] border-[var(--border)]"
                  />
                  <Input
                    {...register(`images.${index}.alt`)}
                    placeholder="Texto alternativo"
                    className="bg-[var(--card)] border-[var(--border)]"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploadingIndex !== null}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(index, f);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)]/30 transition-colors">
                    {uploadingIndex === index ? "Subiendo…" : "Subir desde el ordenador"}
                  </span>
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-400 hover:bg-red-400/10 shrink-0"
                onClick={() => removeImage(index)}
                disabled={imageFields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-[var(--border)]"
            onClick={() => appendImage({ url: "", alt: "", order: imageFields.length })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir imagen
          </Button>
          {errors.images?.message && (
            <p className="text-sm text-red-400">{errors.images.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Variantes */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">Variantes (opcional)</CardTitle>
          <p className="text-sm text-muted-foreground">Tallas, capacidades, colores, etc.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {variantFields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-xl bg-[var(--elevated)] border border-[var(--border)] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[var(--foreground)]">Variante {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-400/10"
                  onClick={() => removeVariant(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  {...register(`variants.${index}.name`)}
                  placeholder="Nombre (ej: 40ml)"
                  className="bg-[var(--card)] border-[var(--border)]"
                />
                <Input
                  {...register(`variants.${index}.sku`)}
                  placeholder="SKU variante"
                  className="bg-[var(--card)] border-[var(--border)]"
                />
                <Input
                  {...register(`variants.${index}.providerVariantId`)}
                  placeholder="ID variante CJ (vid o SKU)"
                  title="CJDropshipping: vid (UUID) o SKU exacto de la variante. Obligatorio para enviar pedidos a CJ."
                  className="bg-[var(--card)] border-[var(--border)]"
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`variants.${index}.price`)}
                  placeholder="Precio"
                  className="bg-[var(--card)] border-[var(--border)]"
                />
                <Input
                  type="number"
                  min="0"
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                  placeholder="Stock"
                  className="bg-[var(--card)] border-[var(--border)]"
                />
              </div>
              <Input
                {...register(`variants.${index}.imageUrl`)}
                placeholder="URL imagen variante (opcional)"
                className="bg-[var(--card)] border-[var(--border)]"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="border-[var(--border)]"
            onClick={() =>
              appendVariant({
                name: "",
                sku: "",
                providerVariantId: "",
                price: 0,
                compareAtPrice: null,
                stock: 0,
                options: {},
                imageUrl: null,
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir variante
          </Button>
        </CardContent>
      </Card>

      {/* Proveedor (importar) */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
            <Truck className="h-5 w-5 text-[var(--gold)]" />
            Importar desde proveedor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Opcional. Vincula este producto con un producto de un proveedor dropshipping.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-xl bg-[var(--elevated)] border border-[var(--border)] p-4">
              No hay proveedores configurados.{" "}
              <Link href="/admin/proveedores" className="text-[var(--gold)] hover:underline">
                Añade uno en Admin → Proveedores
              </Link>{" "}
              para poder vincular productos.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Proveedor</Label>
                <select
                  {...register("providerId")}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                >
                  <option value="">Ninguno</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">ID producto en proveedor</Label>
                <Input
                  {...register("providerProductId")}
                  placeholder="ID externo del producto en el proveedor"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO (opcional) */}
      <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">SEO (opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Meta título</Label>
            <Input
              {...register("metaTitle")}
              className="bg-[var(--elevated)] border-[var(--border)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Meta descripción</Label>
            <textarea
              {...register("metaDescription")}
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--foreground)]">Peso (kg)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("weight")}
              className="bg-[var(--elevated)] border-[var(--border)] max-w-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-wrap gap-4">
        <Button
          type="submit"
          className="rounded-xl bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button variant="outline" className="rounded-xl border-[var(--border)]" asChild size="lg">
          <Link href="/admin/productos" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>
        </Button>
      </div>
    </form>
  );
}
