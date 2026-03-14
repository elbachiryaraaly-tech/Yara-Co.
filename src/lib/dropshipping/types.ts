/**
 * Tipos para la integración con proveedores de dropshipping.
 * Cuando tengas las APIs reales, los adaptadores traducirán entre estos tipos y los de cada proveedor.
 */

export interface DropshippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone: string;
}

export interface DropshippingOrderItem {
  /** ID del producto en nuestra base de datos */
  productId: string;
  /** ID del producto en el catálogo del proveedor (obligatorio para enviar pedido) */
  providerProductId: string;
  /** SKU o variante en el proveedor si aplica */
  providerSku?: string;
  /** CJ: vid (UUID) o SKU de variante. Tiene prioridad sobre providerProductId/providerSku al enviar a CJ. */
  providerVariantId?: string;
  quantity: number;
  /** Precio unitario en el pedido (referencia) */
  price: number;
}

export interface PlaceOrderParams {
  /** Número de pedido interno (ej. YL-2025-123456) */
  orderNumber: string;
  /** ID del pedido en nuestra BD */
  orderId: string;
  items: DropshippingOrderItem[];
  shipping: DropshippingAddress;
  /** Notas opcionales para el proveedor */
  notes?: string;
}

export interface PlaceOrderResult {
  success: boolean;
  /** ID del pedido en el sistema del proveedor */
  providerOrderId?: string;
  /** Número de seguimiento si el proveedor lo devuelve de inmediato */
  trackingNumber?: string;
  /** URL de seguimiento si está disponible */
  trackingUrl?: string;
  /** Mensaje de error si success === false */
  error?: string;
  /** Datos crudos por si hay que guardarlos o depurar */
  raw?: unknown;
  /** Token nuevo obtenido (ej. CJ); el llamador puede persistirlo para no volver a llamar getAccessToken */
  newAccessToken?: string;
}

export interface DropshippingProviderConfig {
  id: string;
  name: string;
  code: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  accessToken: string | null;
  baseUrl: string | null;
  isActive: boolean;
}

export interface IDropshippingAdapter {
  /** Código del adaptador (ej. "cj", "aliexpress") */
  readonly code: string;
  /** Envía el pedido al proveedor. Sin API key configurada puede devolver success: false con error descriptivo. */
  placeOrder(config: DropshippingProviderConfig, params: PlaceOrderParams): Promise<PlaceOrderResult>;
  /** Opcional: obtiene el estado o tracking de un pedido ya enviado */
  getOrderStatus?(
    config: DropshippingProviderConfig,
    providerOrderId: string
  ): Promise<{ trackingNumber?: string; trackingUrl?: string; status?: string }>;
}
