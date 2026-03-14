import type { DropshippingProviderConfig, IDropshippingAdapter, PlaceOrderParams, PlaceOrderResult } from "../types";

/**
 * Adaptador que no hace llamadas reales. Se usa cuando el proveedor no tiene API key
 * o cuando el código del proveedor no coincide con ningún adaptador concreto.
 */
export const noopAdapter: IDropshippingAdapter = {
  code: "noop",
  async placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult> {
    const hasCredentials = !!(config.apiKey?.trim());
    if (!hasCredentials) {
      return {
        success: false,
        error: `Proveedor "${config.name}" sin API configurada. Añade API Key en Admin → Proveedores para envío automático.`,
      };
    }
    return {
      success: false,
      error: `No hay adaptador configurado para el proveedor "${config.name}". Asigna un "code" (cj, aliexpress) en la edición del proveedor.`,
    };
  },
};
