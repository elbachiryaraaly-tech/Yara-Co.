import type {
  DropshippingProviderConfig,
  IDropshippingAdapter,
  PlaceOrderParams,
  PlaceOrderResult,
} from "../types";

/**
 * Convierte nombre de país a código ISO 3166-1 alpha-2.
 */
function toCountryCode(country: string | null | undefined): string {
  const raw = (country ?? "").trim();
  if (!raw) return "";
  if (raw.length === 2 && /^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
  const map: Record<string, string> = {
    espana: "ES",
    spain: "ES",
    portugal: "PT",
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
    mexico: "MX",
    argentina: "AR",
    colombia: "CO",
    chile: "CL",
    peru: "PE",
    brasil: "BR",
    brazil: "BR",
    netherlands: "NL",
    holanda: "NL",
    belgium: "BE",
    poland: "PL",
    austria: "AT",
    switzerland: "CH",
    canada: "CA",
    australia: "AU",
  };
  return map[normalized] ?? raw.slice(0, 2).toUpperCase();
}

/**
 * Adaptador para SHEIN (Open Platform).
 * Documentación: https://open.sheincorp.com/
 * Configura en Admin → Proveedores: code = "shein", API Key (o Access Token), URL base.
 */
export const sheinAdapter: IDropshippingAdapter = {
  code: "shein",

  async placeOrder(
    config: DropshippingProviderConfig,
    params: PlaceOrderParams
  ): Promise<PlaceOrderResult> {
    const apiKey = config.apiKey?.trim() || config.accessToken?.trim();
    if (!apiKey) {
      return {
        success: false,
        error:
          "Shein requiere API Key o Access Token. Configúralo en Admin → Proveedores (Open Platform).",
      };
    }

    const baseUrl = (
      config.baseUrl?.trim() ||
      "https://openapi.sheincorp.com"
    ).replace(/\/$/, "");

    const countryCode =
      toCountryCode(params.shipping.country) ||
      (params.shipping.zip?.match(/^(28|0[1-5]|1[0-9]|2[0-9]|3[0-9]|4[0-5]|5[0-2])/) ? "ES" : "") ||
      "US";

    const customerName = `${params.shipping.firstName} ${params.shipping.lastName}`.trim();

    const orderPayload = {
      order_number: params.orderNumber,
      shipping: {
        name: customerName || "Customer",
        phone: params.shipping.phone,
        address1: params.shipping.address1,
        address2: params.shipping.address2 || "",
        city: params.shipping.city,
        state: params.shipping.state || "",
        zip: params.shipping.zip,
        country_code: countryCode.toUpperCase(),
      },
      items: params.items.map((item, idx) => ({
        product_id: item.providerProductId,
        variant_id: item.providerVariantId || item.providerSku || undefined,
        quantity: item.quantity,
        line_item_id: `${params.orderId}-${idx}`,
      })),
      notes: [params.orderNumber, params.notes].filter(Boolean).join(" | ") || undefined,
    };

    try {
      const res = await fetch(`${baseUrl}/openapi/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        code?: number;
        data?: { order_id?: string; tracking_number?: string; tracking_url?: string };
        message?: string;
      };

      if (res.ok && (data.code === 200 || data.code === 0)) {
        return {
          success: true,
          providerOrderId: data.data?.order_id,
          trackingNumber: data.data?.tracking_number,
          trackingUrl: data.data?.tracking_url,
          raw: data,
        };
      }

      return {
        success: false,
        error: data.message || `Shein API: ${res.status}`,
        raw: data,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Shein: ${message}`,
        raw: err,
      };
    }
  },

  async getOrderStatus(
    config: DropshippingProviderConfig,
    providerOrderId: string
  ): Promise<{ trackingNumber?: string; trackingUrl?: string; status?: string }> {
    const apiKey = config.apiKey?.trim() || config.accessToken?.trim();
    if (!apiKey) return {};

    const baseUrl = (
      config.baseUrl?.trim() ||
      "https://openapi.sheincorp.com"
    ).replace(/\/$/, "");

    try {
      const res = await fetch(
        `${baseUrl}/openapi/order/detail?order_id=${encodeURIComponent(providerOrderId)}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      if (!res.ok) return {};
      const data = (await res.json()) as {
        data?: {
          tracking_number?: string;
          tracking_url?: string;
          order_status?: string;
        };
      };
      return {
        trackingNumber: data.data?.tracking_number,
        trackingUrl: data.data?.tracking_url,
        status: data.data?.order_status,
      };
    } catch {
      return {};
    }
  },
};
