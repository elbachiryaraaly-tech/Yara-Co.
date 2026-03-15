import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "../types";

const BIGBUY_API_BASE = "https://api.bigbuy.eu/rest";

/**
 * Convierte nombre de país a código ISO 3166-1 alpha-2 (2 letras).
 * BigBuy exige código de país ISO.
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
 * Adaptador para BigBuy (mayorista/dropshipping EU).
 * Documentación: https://api.bigbuy.eu/rest/doc
 * Auth: API Key (token) en Header Authorization: Bearer {token}.
 * Se guarda en Admin → Proveedores → Configurar API → API Key (o Access Token).
 */
export const bigbuyAdapter: IDropshippingAdapter = {
  code: "bigbuy",
  async placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult> {
    const token = (config.accessToken ?? config.apiKey)?.trim();
    if (!token) {
      return {
        success: false,
        error:
          "BigBuy requiere API Key (token). Obténla en tu panel de BigBuy → API / Desarrolladores y pégalo en Admin → Proveedores → Configurar API → API Key.",
      };
    }

    const countryCode = toCountryCode(params.shipping.country);
    if (!countryCode) {
      return {
        success: false,
        error: `BigBuy necesita código de país de 2 letras (ej. ES, FR). Valor recibido: "${params.shipping.country}"`,
      };
    }

    // BigBuy usa SKU por línea de pedido (o product id según su doc)
    const products: { sku: string; quantity: number }[] = [];
    for (const item of params.items) {
      const sku = item.providerVariantId?.trim() || item.providerSku?.trim() || item.providerProductId?.trim();
      if (!sku) {
        return {
          success: false,
          error: `BigBuy exige SKU o ID de producto por ítem. Edita el producto y rellena "ID variante" o "ID de producto" con el SKU de BigBuy.`,
        };
      }
      products.push({ sku, quantity: item.quantity });
    }

    // Formato según documentación BigBuy Orders API
    const body = {
      shippingAddress: {
        firstname: params.shipping.firstName,
        lastname: params.shipping.lastName,
        address: params.shipping.address1,
        address2: params.shipping.address2 || undefined,
        postcode: params.shipping.zip,
        city: params.shipping.city,
        country: countryCode,
        phone: params.shipping.phone || undefined,
        state: (params.shipping.state ?? "").trim() || undefined,
      },
      products,
      internalReference: params.orderNumber,
      ...(params.notes ? { customerComment: params.notes } : {}),
    };

    const res = await fetch(`${BIGBUY_API_BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: { id?: number; orderId?: number; message?: string; error?: string } | null = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // no JSON
    }

    if (!res.ok) {
      const msg =
        json?.message ?? json?.error ?? (typeof json === "object" && json !== null ? String(json) : null) ?? text.slice(0, 300);
      return {
        success: false,
        error: `BigBuy: ${msg}`,
        raw: json ?? text,
      };
    }

    const orderId = json?.id ?? json?.orderId;
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

    const res = await fetch(`${BIGBUY_API_BASE}/orders/${providerOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return {};
    const json = (await res.json()) as {
      trackingNumber?: string;
      trackingUrl?: string;
      status?: number;
      shippingStatus?: string;
    };
    return {
      trackingNumber: json.trackingNumber,
      trackingUrl: json.trackingUrl,
      status: json.shippingStatus ?? (json.status != null ? String(json.status) : undefined),
    };
  },
};
