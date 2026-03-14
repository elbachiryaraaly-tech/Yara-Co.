import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "../types";

/**
 * Adaptador para AliExpress Dropshipping / AliExpress API.
 * AliExpress suele usar Open Platform (OAuth) o Dropshipping Center API.
 * Cuando tengas app key, app secret y access token, las llamadas reales se harán aquí.
 */
export const aliexpressAdapter: IDropshippingAdapter = {
  code: "aliexpress",
  async placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult> {
    const apiKey = config.apiKey?.trim();
    if (!apiKey) {
      return {
        success: false,
        error: "AliExpress requiere API Key. Configúrala en Admin → Proveedores.",
      };
    }
    const accessToken = config.accessToken?.trim();
    if (!accessToken) {
      return {
        success: false,
        error: 'AliExpress requiere Access Token (OAuth). Añádelo en Admin → Proveedores → AliExpress → "Access Token".',
      };
    }

    const baseUrl = config.baseUrl?.trim() || "https://api-sg.aliexpress.com/sync";

    try {
      const payload: Record<string, string> = {
        method: "aliexpress.ds.order.create",
        app_key: apiKey,
        access_token: accessToken,
        timestamp: new Date().toISOString().replace(/[-:]/g, "").slice(0, 14),
        sign_method: "hmac-sha256",
      };
      if (config.apiSecret) {
        // En producción: ordenar params, concatenar, firmar con apiSecret
        const sortedKeys = Object.keys(payload).sort();
        const signStr = sortedKeys.map((k) => `${k}${payload[k]}`).join("");
        const crypto = await import("crypto");
        payload.sign = crypto.createHmac("sha256", config.apiSecret).update(signStr).digest("hex").toUpperCase();
      }

      // Parámetros de negocio del pedido (formato real depende de la API de AliExpress que uses)
      const orderParams = {
        param_place_order_request: JSON.stringify({
          out_order_id: params.orderNumber,
          shipping_address: {
            contact_person: `${params.shipping.firstName} ${params.shipping.lastName}`,
            address: params.shipping.address1,
            address2: params.shipping.address2,
            zip: params.shipping.zip,
            city: params.shipping.city,
            province: params.shipping.state,
            country: params.shipping.country,
            phone: params.shipping.phone,
          },
          product_items: params.items.map((i) => ({
            product_id: i.providerProductId,
            quantity: i.quantity,
            sku: i.providerSku,
          })),
          remark: params.notes,
        }),
      };

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ...payload, ...orderParams }).toString(),
      });

      const text = await response.text();
      let json: { result?: { order_id?: string; tracking_no?: string }; error_response?: { msg?: string } };
      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: false,
          error: `AliExpress: respuesta no JSON (${response.status})`,
          raw: text.slice(0, 500),
        };
      }

      if (json.error_response) {
        return {
          success: false,
          error: json.error_response.msg || "Error AliExpress",
          raw: json,
        };
      }

      const orderId = json.result?.order_id;
      return {
        success: true,
        providerOrderId: orderId,
        trackingNumber: json.result?.tracking_no,
        raw: json,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `AliExpress: ${message}`,
        raw: err,
      };
    }
  },
};
