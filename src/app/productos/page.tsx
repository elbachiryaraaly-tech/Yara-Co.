import { getProducts, getCategories } from "@/lib/products";
import { CatalogPage } from "@/components/shop/CatalogPage";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const category = typeof searchParams.categoria === "string" ? searchParams.categoria : undefined;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const sort = typeof searchParams.orden === "string" ? searchParams.orden : "newest";
  const page = typeof searchParams.pagina === "string" ? parseInt(searchParams.pagina, 10) : 1;

  const [result, categories] = await Promise.all([
    getProducts({ category, search, sort, page, limit: 12 }).catch(() => ({
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    })),
    getCategories().catch(() => []),
  ]);

  return (
    <CatalogPage
      products={result.products}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      categories={categories}
      currentCategory={category}
      currentSort={sort}
      currentSearch={search}
    />
  );
}
