import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "../types";

/**
 * Normaliza string para comparación (quita acentos en NFD, lowercase).
 */
function normalizeForMatch(s: string): string {
  return (s ?? "")
    .trim()
    .normalize("NFD")
    .replace(/\u0307/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Convierte nombre de país (ej. "España") a código ISO 3166-1 alpha-2 (ej. "ES").
 * CJDropshipping exige countryCode en formato ISO de 2 letras.
 */
function toCountryCode(country: string | null | undefined): string {
  const raw = (country ?? "").trim();
  if (!raw) return "";
  if (raw.length === 2 && /^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  const normalized = normalizeForMatch(raw).replace(/\s+/g, " ");
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
    "paises bajos": "NL",
    belgium: "BE",
    belgica: "BE",
    poland: "PL",
    polonia: "PL",
    austria: "AT",
    switzerland: "CH",
    suiza: "CH",
    canada: "CA",
    australia: "AU",
  };
  let code = map[normalized] ?? "";
  if (!code && (normalized.includes("espana") || normalized.includes("spain"))) code = "ES";
  if (!code && normalized.includes("portugal")) code = "PT";
  if (!code && normalized.includes("reino unido")) code = "GB";
  return code;
}

/** Cache in-memory del token de CJ (válido 15 días). Evita superar el límite 1 req/300s de getAccessToken. */
const cjTokenCache = new Map<string, { token: string; expiresAt: number }>();
const CJ_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

function getCachedCjToken(apiKey: string): string | null {
  const entry = cjTokenCache.get(apiKey);
  if (!entry || Date.now() >= entry.expiresAt) return null;
  return entry.token;
}

function setCachedCjToken(apiKey: string, token: string): void {
  cjTokenCache.set(apiKey, { token, expiresAt: Date.now() + CJ_TOKEN_TTL_MS });
}

/**
 * Adaptador para CJDropshipping.
 * Documentación API: https://developers.cjdropshipping.com/
 * Límite API: getAccessToken solo 1 vez cada 300 segundos; se cachea el token.
 */
export const cjAdapter: IDropshippingAdapter = {
  code: "cj",
  async placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult> {
    const apiKey = config.apiKey?.trim();
    if (!apiKey) {
      return {
        success: false,
        error: "CJDropshipping requiere API Key. Obténla en https://www.cjdropshipping.com/myCJ.html#/apikey",
      };
    }

    const baseUrl = (config.baseUrl?.trim() || "https://developers.cjdropshipping.com/api2.0").replace(/\/$/, "");

    try {
      // Usar token guardado en BD, luego caché (getAccessToken solo 1 vez cada 300 s)
      let token: string | null =
        (config.accessToken?.trim() || null) || getCachedCjToken(apiKey);
      let tokenFetchedThisRequest = false;

      if (!token) {
        const response = await fetch(`${baseUrl}/v1/authentication/getAccessToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        });

        if (!response.ok) {
          const text = await response.text();
          const is429 = response.status === 429;
          const errMsg = is429
            ? "CJ limita getAccessToken a 1 vez cada 5 minutos. Espera 5 min y pulsa «Reenviar al proveedor» una sola vez; tras el primer envío correcto el token se guardará y no volverá a pasar."
            : `CJ auth failed: ${response.status} ${text.slice(0, 200)}`;
          return {
            success: false,
            error: errMsg,
            raw: { status: response.status, body: text },
          };
        }

        const authData = (await response.json()) as { data?: { accessToken?: string } };
        token = authData?.data?.accessToken ?? null;
        if (!token) {
          return {
            success: false,
            error: "CJDropshipping no devolvió token de acceso. Revisa API Key.",
            raw: authData,
          };
        }
        setCachedCjToken(apiKey, token);
        tokenFetchedThisRequest = true;
      }

      // Código ISO de 2 letras; si country está vacío, extraer de city o address1; fallback ES si parece España (zip 28xxx, MADRID, etc.)
      let countryCode =
        toCountryCode(params.shipping.country) ||
        toCountryCode(params.shipping.city) ||
        toCountryCode(params.shipping.address1);
      countryCode = (countryCode || "").trim().toUpperCase();
      const looksSpanish =
        /^(28|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52)/.test((params.shipping.zip || "").trim()) ||
        /madrid|barcelona|valencia|sevilla|españa|espana|spain/i.test((params.shipping.city || "") + (params.shipping.address1 || "") + (params.shipping.country || ""));
      if (!countryCode || countryCode.length !== 2) {
        if (looksSpanish) countryCode = "ES";
        else {
          return {
            success: false,
            error: `País no válido para CJ: "${(params.shipping.country || "").slice(0, 50)}". Indica el país (ej. España) o código ISO (ES, PT).`,
            raw: { country: params.shipping.country, city: params.shipping.city },
          };
        }
      }

      // CJ exige recipient.countryCode (y a veces recipient.country); nunca enviar vacío
      let finalCountryCode = String(countryCode).trim().toUpperCase().slice(0, 2) || "ES";
      if (finalCountryCode.length !== 2) finalCountryCode = "ES";
      const customerName = `${params.shipping.firstName} ${params.shipping.lastName}`.trim();

      // createOrderV2 con payType=2: CJ cobra automáticamente del balance y procesa el pedido (sin paso manual de pago)
      // Si no hay CJ_DEFAULT_LOGISTIC_NAME, usar logística por defecto según destino para evitar el endpoint v1 (countryCode error)
      const fromCountryCode = (process.env.CJ_FROM_COUNTRY_CODE?.trim() || "CN").toUpperCase().slice(0, 2);
      const defaultLogisticByDest: Record<string, string> = {
        ES: "YunExpress Spain Direct Line",
        US: "USPS",
        GB: "Yodel",
        DE: "YunExpress Germany Direct Line",
        FR: "La Poste",
        IT: "YunExpress Italy Direct Line",
        NL: "PostNL",
        PT: "PostNL",
      };
      const logisticName =
        process.env.CJ_DEFAULT_LOGISTIC_NAME?.trim() ||
        defaultLogisticByDest[finalCountryCode] ||
        "PostNL";

      if (logisticName && fromCountryCode) {
        const shippingCountryName = (params.shipping.country || "").trim() || (finalCountryCode === "ES" ? "Spain" : finalCountryCode);
        const products = params.items.map((item, idx) => {
          const cjId = (item.providerVariantId || "").trim() || null;
          const useVid = cjId && /^[0-9a-fA-F-]{36}$/.test(cjId);
          const useSku = cjId && !useVid;
          const fallbackUuid = item.providerProductId && /^[0-9a-fA-F-]{36}$/.test(item.providerProductId);
          const fallbackSku = (item.providerSku || item.providerProductId || "").trim();
          let vid: string | undefined;
          let sku: string | undefined;
          if (useVid) vid = cjId!;
          else if (useSku) sku = cjId!;
          else if (fallbackUuid) vid = item.providerProductId!;
          else if (fallbackSku) sku = fallbackSku;
          return { vid, sku, quantity: item.quantity, storeLineItemId: `${params.orderId}-${idx}` };
        });
        const missingVariant = products.find((p) => !p.vid && !p.sku);
        if (missingVariant) {
          return {
            success: false,
            error:
              "CJ requiere el ID de variante (vid o SKU) por cada producto. Edita el producto en Admin → Productos: en cada variante rellena «ID variante proveedor» con el vid (UUID) o el SKU exacto de CJDropshipping.",
            raw: { productsCount: params.items.length },
          };
        }
        const cjOrderV2 = {
          orderNumber: params.orderNumber,
          shippingZip: (params.shipping.zip || "").trim() || "",
          shippingCountryCode: finalCountryCode,
          shippingCountry: shippingCountryName,
          shippingProvince: (params.shipping.state || "").trim() || "",
          shippingCity: (params.shipping.city || "").trim() || "",
          shippingCounty: "",
          shippingPhone: (params.shipping.phone || "").trim() || "",
          shippingCustomerName: (customerName || "Customer").trim() || "Customer",
          shippingAddress: (params.shipping.address1 || "").trim() || " ",
          shippingAddress2: (params.shipping.address2 || "").trim() || "",
          // payType omitido para NO cobrar del monedero automáticamente. El pedido quedará "Awaiting Payment".
          logisticName,
          fromCountryCode,
          platform: "Api",
          shopLogisticsType: 2,
          remark: [params.orderNumber, params.notes].filter(Boolean).join(" | ") || undefined,
          products: products.map((p) => ({
            ...(p.vid ? { vid: p.vid } : {}),
            ...(p.sku ? { sku: p.sku } : {}),
            quantity: p.quantity,
            storeLineItemId: p.storeLineItemId,
          })),
        };

        const orderResV2 = await fetch(`${baseUrl}/v1/shopping/order/createOrderV2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "CJ-Access-Token": token,
          },
          body: JSON.stringify(cjOrderV2),
        });

        const orderJsonV2 = (await orderResV2.json().catch(() => ({}))) as {
          result?: boolean;
          code?: number;
          data?: { orderId?: string; trackingNumber?: string; trackingLink?: string };
          message?: string;
        };

        if (orderResV2.ok && orderJsonV2?.result === true && (orderJsonV2?.code === 200 || orderJsonV2?.code == null)) {
          return {
            success: true,
            providerOrderId: orderJsonV2.data?.orderId,
            trackingNumber: orderJsonV2.data?.trackingNumber,
            trackingUrl: orderJsonV2.data?.trackingLink,
            raw: orderJsonV2,
            ...(tokenFetchedThisRequest && token ? { newAccessToken: token } : {}),
          };
        }
        // Si V2 falla por parámetros (logística, etc.), continuamos con createOrder v1
        if (orderResV2.status !== 400 && orderResV2.status !== 422) {
          if (orderResV2.status === 401) cjTokenCache.delete(apiKey);
          const msg = orderJsonV2?.message || `CJ createOrderV2: ${orderResV2.status}`;
          const skuHint = /no variants found|skus?/i.test(msg)
            ? " Usa el vid (UUID de la variante) o el SKU exacto de la variante en CJ, no el ID de producto. En Admin → Productos, edita el producto y rellena «ID variante CJ (vid o SKU)» en cada variante."
            : "";
          return {
            success: false,
            error: msg + skuHint,
            raw: orderJsonV2,
          };
        }
      }

      // createOrder v1 (legacy): enviar todos los códigos de país posibles (destino + origen) por si la API valida cualquiera como "countryCode"
      const safeCountryCode = (finalCountryCode && finalCountryCode.length === 2) ? finalCountryCode : "ES";
      const fromCode = (process.env.CJ_FROM_COUNTRY_CODE?.trim() || "CN").toUpperCase().slice(0, 2);
      const recipientCountryName = (params.shipping.country || "").trim() || (safeCountryCode === "ES" ? "Spain" : safeCountryCode);
      const cjOrder = {
        expectedWeight: 0,
        countryCode: safeCountryCode,
        fromCountryCode: fromCode,
        shippingCountryCode: safeCountryCode,
        shippingCountry: recipientCountryName,
        recipient: {
          countryCode: safeCountryCode,
          country: recipientCountryName,
          province: String(params.shipping.state || "").trim() || " ",
          city: String(params.shipping.city || "").trim() || " ",
          address: String([params.shipping.address1, params.shipping.address2].filter(Boolean).join(", ") || " ").trim() || " ",
          zipCode: String(params.shipping.zip || "").trim() || " ",
          name: String(customerName || "Customer").trim() || "Customer",
          phone: String(params.shipping.phone || "").trim() || " ",
        },
        productList: params.items.map((item) => ({
          productId: item.providerProductId,
          quantity: item.quantity,
          ...(item.providerSku && { specId: item.providerSku }),
        })),
        remark: [params.orderNumber, params.notes].filter(Boolean).join(" | ") || undefined,
      };

      const orderRes = await fetch(`${baseUrl}/v1/shopping/order/createOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CJ-Access-Token": token,
        },
        body: JSON.stringify(cjOrder),
      });

      const orderJson = (await orderRes.json().catch(() => ({}))) as {
        result?: boolean;
        code?: number;
        data?: { orderId?: string; trackingNumber?: string; trackingLink?: string };
        message?: string;
      };

      if (!orderRes.ok || !orderJson?.result) {
        if (orderRes.status === 401) cjTokenCache.delete(apiKey);
        // Log para depurar "countryCode must not be empty"
        if (orderJson?.message?.toLowerCase().includes("countrycode")) {
          console.warn("[CJ createOrder v1] Error país. Payload enviado:", JSON.stringify({ ...cjOrder, recipient: { ...cjOrder.recipient } }));
          console.warn("[CJ createOrder v1] Respuesta:", orderRes.status, orderJson);
        }
        return {
          success: false,
          error: orderJson?.message || `CJ create order: ${orderRes.status}`,
          raw: orderJson,
        };
      }

      return {
        success: true,
        providerOrderId: orderJson.data?.orderId,
        trackingNumber: orderJson.data?.trackingNumber,
        trackingUrl: orderJson.data?.trackingLink,
        raw: orderJson,
        ...(tokenFetchedThisRequest && token ? { newAccessToken: token } : {}),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `CJDropshipping: ${message}`,
        raw: err,
      };
    }
  },

  async getOrderStatus(
    config: DropshippingProviderConfig,
    providerOrderId: string
  ): Promise<{ trackingNumber?: string; trackingUrl?: string; status?: string }> {
    const apiKey = config.apiKey?.trim();
    if (!apiKey) return {};

    const baseUrl = (config.baseUrl?.trim() || "https://developers.cjdropshipping.com/api2.0").replace(/\/$/, "");
    try {
      let token = (config.accessToken?.trim() || null) || getCachedCjToken(apiKey);
      if (!token) {
        const authRes = await fetch(`${baseUrl}/v1/authentication/getAccessToken`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey }),
        });
        if (!authRes.ok) return {};
        const authData = (await authRes.json()) as { data?: { accessToken?: string } };
        token = authData?.data?.accessToken ?? null;
        if (token) setCachedCjToken(apiKey, token);
      }
      if (!token) return {};

      const res = await fetch(
        `${baseUrl}/v1/shopping/order/getOrderDetail?orderId=${encodeURIComponent(providerOrderId)}`,
        { headers: { "CJ-Access-Token": token } }
      );
      if (!res.ok) return {};
      const data = (await res.json()) as { data?: { trackingNumber?: string; trackingLink?: string; orderStatus?: string } };
      return {
        trackingNumber: data.data?.trackingNumber,
        trackingUrl: data.data?.trackingLink,
        status: data.data?.orderStatus,
      };
    } catch {
      return {};
    }
  },
};
