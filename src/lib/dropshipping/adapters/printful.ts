import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "../types";

const PRINTFUL_API_BASE = "https://api.printful.com";

/**
 * Convierte nombre de país a código ISO 3166-1 alpha-2 (2 letras).
 * Printful exige country_code en formato ISO.
 */
function toCountryCode(country: string | null | undefined): string {
  const raw = (country ?? "").trim();
  if (!raw) return "";
  if (raw.length === 2 && /^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  const n = raw.toLowerCase().replace(/\s+/g, " ");
  const map: Record<string, string> = {
    spain: "ES",
    españa: "ES",
    "united states": "US",
    "estados unidos": "US",
    usa: "US",
    "united kingdom": "GB",
    "reino unido": "GB",
    uk: "GB",
    germany: "DE",
    alemania: "DE",
    france: "FR",
    francia: "FR",
    italy: "IT",
    italia: "IT",
    portugal: "PT",
    mexico: "MX",
    méxico: "MX",
    argentina: "AR",
    colombia: "CO",
    chile: "CL",
    peru: "PE",
    brasil: "BR",
    brazil: "BR",
    netherlands: "NL",
    canada: "CA",
    australia: "AU",
    belgium: "BE",
    poland: "PL",
    austria: "AT",
    switzerland: "CH",
  };
  return map[n] ?? "";
}

/**
 * Adaptador para Printful (print-on-demand / productos con tu marca).
 * API: https://developers.printful.com/docs/
 * Auth: Private Token en Header Authorization: Bearer {token}. El token se guarda en Access Token.
 */
export const printfulAdapter: IDropshippingAdapter = {
  code: "printful",
  async placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult> {
    const token = (config.accessToken ?? config.apiKey)?.trim();
    if (!token) {
      return {
        success: false,
        error: "Printful requiere Access Token (Private Token). Obténlo en https://developers.printful.com/ → Your tokens y pégalo en Admin → Proveedores → Configurar API → Access Token.",
      };
    }

    const countryCode = toCountryCode(params.shipping.country);
    if (!countryCode) {
      return {
        success: false,
        error: `Printful necesita código de país de 2 letras (ej. ES, US). Valor recibido: "${params.shipping.country}"`,
      };
    }

    const items: { variant_id: number; quantity: number }[] = [];
    for (const item of params.items) {
      const variantId = item.providerVariantId?.trim() || item.providerProductId?.trim();
      const num = variantId ? parseInt(variantId, 10) : NaN;
      if (!Number.isInteger(num) || num <= 0) {
        return {
          success: false,
          error: `Printful exige variant_id numérico por producto. Producto con providerVariantId o providerProductId: "${variantId}" no es válido. Usa el ID de variante del catálogo Printful.`,
        };
      }
      items.push({ variant_id: num, quantity: item.quantity });
    }

    const body = {
      recipient: {
        name: `${params.shipping.firstName} ${params.shipping.lastName}`.trim(),
        address1: params.shipping.address1,
        address2: params.shipping.address2 || undefined,
        city: params.shipping.city,
        state_code: (params.shipping.state ?? "").trim() || undefined,
        country_code: countryCode,
        zip: params.shipping.zip,
        phone: params.shipping.phone || undefined,
      },
      items,
      external_id: params.orderNumber,
      ...(params.notes ? { notes: params.notes } : {}),
    };

    const res = await fetch(`${PRINTFUL_API_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: { code?: number; result?: { id?: number; external_id?: string }; error?: { message?: string } };
    try {
      json = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: `Printful: respuesta no JSON (${res.status}). ${text.slice(0, 200)}`,
        raw: text,
      };
    }

    if (res.status >= 400 || (json.code && json.code >= 400)) {
      const msg = json.error?.message ?? (typeof json.result === "string" ? json.result : "") ?? text.slice(0, 300);
      return {
        success: false,
        error: `Printful: ${msg}`,
        raw: json,
      };
    }

    const orderId = json.result?.id ?? (json as { result?: { order?: { id?: number } } }).result?.order?.id;
    return {
      success: true,
      providerOrderId: orderId != null ? String(orderId) : undefined,
      raw: json,
    };
  },

  async getOrderStatus(
    config: DropshippingProviderConfig,
    providerOrderId: string
  ): Promise<{ trackingNumber?: string; trackingUrl?: string; status?: string }> {
    const token = (config.accessToken ?? config.apiKey)?.trim();
    if (!token) return {};

    const res = await fetch(`${PRINTFUL_API_BASE}/orders/${providerOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return {};
    const json = (await res.json()) as {
      result?: { shipments?: Array<{ tracking_number?: string; tracking_url?: string }>; status?: string };
    };
    const shipments = json.result?.shipments ?? [];
    const first = shipments[0];
    return {
      trackingNumber: first?.tracking_number,
      trackingUrl: first?.tracking_url,
      status: json.result?.status,
    };
  },
};
