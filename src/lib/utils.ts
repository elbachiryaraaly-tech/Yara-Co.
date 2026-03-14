import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(price) || 0)
}

export function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return [];
  if (str.startsWith("[") || str.startsWith('["') || str.startsWith("['")) {
    try {
      const parsed = JSON.parse(str.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [str];
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80";
  const arr = parseJsonArray(url);
  return arr.length > 0 ? arr[0] : url;
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Limpia el HTML de una descripción para mostrarlo como texto plano
 * Elimina etiquetas HTML pero mantiene el formato básico (párrafos, saltos de línea)
 */
export function cleanHtmlDescription(html: string | null | undefined): string {
  if (!html) return "";
  
  return html
    // Reemplazar etiquetas de párrafo por saltos de línea
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    // Reemplazar <br> y <br/> por saltos de línea
    .replace(/<br\s*\/?>/gi, '\n')
    // Reemplazar listas por viñetas
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    // Eliminar el resto de etiquetas HTML
    .replace(/<[^>]*>/g, '')
    // Decodificar entidades HTML comunes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Limpiar espacios en blanco múltiples
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
