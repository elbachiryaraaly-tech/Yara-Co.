/**
 * Serializa productos de Prisma para componentes cliente.
 * Convierte todos los Decimal a number y badges/tags de string JSON a array,
 * para evitar "Decimal objects are not supported" al pasar a Client Components.
 */
import { parseJsonArray } from "./utils";

type WithDecimals = {
  price: unknown;
  compareAtPrice?: unknown | null;
  costPrice?: unknown | null;
  rating?: unknown | null;
  weight?: unknown | null;
  badges?: unknown;
  tags?: unknown;
  [k: string]: unknown;
};

function toNum(v: unknown): number;
function toNum(v: unknown, allowNull: true): number | null;
function toNum(v: unknown, allowNull?: boolean): number | null {
  if (v == null) return allowNull ? null : 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : allowNull ? null : 0;
}

export function serializeProduct<T extends WithDecimals>(product: T): T & { price: number; compareAtPrice: number | null; costPrice: number | null; rating: number | null; weight: number | null; badges: string[]; tags: string[] } {
  const { price, compareAtPrice, costPrice, rating, weight, badges, tags, ...rest } = product;
  return {
    ...rest,
    price: toNum(price),
    compareAtPrice: toNum(compareAtPrice, true),
    costPrice: toNum(costPrice, true),
    rating: toNum(rating, true),
    weight: toNum(weight, true),
    badges: parseJsonArray(badges as string | null | undefined),
    tags: parseJsonArray(tags as string | null | undefined),
  } as T & { price: number; compareAtPrice: number | null; costPrice: number | null; rating: number | null; weight: number | null; badges: string[]; tags: string[] };
}

export function serializeProducts<T extends WithDecimals>(products: T[]): Array<T & { price: number; compareAtPrice: number | null; costPrice: number | null; rating: number | null; weight: number | null; badges: string[]; tags: string[] }> {
  return products.map(serializeProduct);
}
