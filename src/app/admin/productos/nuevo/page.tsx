import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminProductoNuevoForm } from "@/components/admin/AdminProductoNuevoForm";
import { getCategories } from "@/lib/products";
import { getAdminProviders } from "@/lib/admin";

export default async function AdminProductoNuevoPage() {
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

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[{ label: "Productos", href: "/admin/productos" }, { label: "Nuevo producto" }]}
      />
      <AdminProductoNuevoForm
        categories={categoriesFlat}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
