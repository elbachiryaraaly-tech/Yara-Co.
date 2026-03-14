import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "./types";
import { noopAdapter } from "./adapters/noop";
import { cjAdapter } from "./adapters/cj";
import { aliexpressAdapter } from "./adapters/aliexpress";
import { printfulAdapter } from "./adapters/printful";

const adapters: IDropshippingAdapter[] = [cjAdapter, aliexpressAdapter, printfulAdapter];

export type { DropshippingAddress, DropshippingOrderItem, PlaceOrderParams, PlaceOrderResult, DropshippingProviderConfig } from "./types";
export { validatePlaceOrderParams } from "./validate";
export type { ValidationResult, ValidationError } from "./validate";

/**
 * Devuelve el adaptador que corresponde al proveedor (por code).
 * Si no hay code o no hay adaptador, se usa noop (no hace llamada real).
 */
export function getAdapter(config: DropshippingProviderConfig): IDropshippingAdapter {
  const code = (config.code || "").trim().toLowerCase();
  if (!code) return noopAdapter;
  const found = adapters.find((a) => a.code.toLowerCase() === code);
  return found || noopAdapter;
}

/**
 * Envía el pedido al proveedor usando el adaptador adecuado.
 * Si el proveedor no tiene API configurada o el adaptador falla, devuelve success: false con mensaje.
 */
export async function placeOrder(
  config: DropshippingProviderConfig,
  params: PlaceOrderParams
): Promise<PlaceOrderResult> {
  const adapter = getAdapter(config);
  return adapter.placeOrder(config, params);
}

/**
 * Obtiene el estado/tracking de un pedido ya enviado al proveedor (si el adaptador lo soporta).
 */
export async function getOrderStatus(
  config: DropshippingProviderConfig,
  providerOrderId: string
): Promise<{ trackingNumber?: string; trackingUrl?: string; status?: string }> {
  const adapter = getAdapter(config);
  if (adapter.getOrderStatus) {
    return adapter.getOrderStatus(config, providerOrderId);
  }
  return {};
}
