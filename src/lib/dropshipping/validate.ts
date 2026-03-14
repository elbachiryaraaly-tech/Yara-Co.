import type { PlaceOrderParams, DropshippingAddress, DropshippingOrderItem } from "./types";

function validateAddress(addr: DropshippingAddress): { ok: true; address: DropshippingAddress } | { ok: false; error: string } {
  const firstName = (addr.firstName || "").trim();
  const lastName = (addr.lastName || "").trim();
  const address1 = (addr.address1 || "").trim();
  const city = (addr.city || "").trim();
  const zip = (addr.zip || "").trim();
  const country = (addr.country || "").trim();
  const phone = (addr.phone || "").trim();

  if (firstName.length < 2) return { ok: false, error: "Nombre demasiado corto" };
  if (lastName.length < 2) return { ok: false, error: "Apellido demasiado corto" };
  if (address1.length < 5) return { ok: false, error: "Dirección demasiado corta" };
  if (city.length < 2) return { ok: false, error: "Ciudad requerida" };
  if (zip.length < 3) return { ok: false, error: "Código postal requerido" };
  if (country.length < 2) return { ok: false, error: "País requerido" };
  if (phone.length < 6) return { ok: false, error: "Teléfono requerido" };

  return {
    ok: true,
    address: {
      ...addr,
      firstName,
      lastName,
      address1,
      address2: (addr.address2 || "").trim() || undefined,
      city,
      state: (addr.state || "").trim() || undefined,
      zip,
      country: country.length > 50 ? country.slice(0, 50) : country,
      phone,
    },
  };
}

function validateItem(item: DropshippingOrderItem, index: number): { ok: true; item: DropshippingOrderItem } | { ok: false; error: string } {
  const providerProductId = (item.providerProductId || "").trim();
  if (!providerProductId) return { ok: false, error: `Producto ${index + 1}: falta ID en el proveedor` };
  if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
    return { ok: false, error: `Producto ${index + 1}: cantidad inválida` };
  }
  return {
    ok: true,
    item: { ...item, providerProductId, quantity: Math.floor(Number(item.quantity)) },
  };
}

export interface ValidationResult {
  ok: true;
  params: PlaceOrderParams;
}
export interface ValidationError {
  ok: false;
  error: string;
}

/**
 * Valida y normaliza los parámetros antes de enviar al proveedor.
 * Evita enviar datos inválidos que provoquen rechazo de la API.
 */
export function validatePlaceOrderParams(params: PlaceOrderParams): ValidationResult | ValidationError {
  const addrResult = validateAddress(params.shipping);
  if (!addrResult.ok) return { ok: false, error: addrResult.error };

  if (!params.items?.length) return { ok: false, error: "No hay ítems en el pedido" };
  const items: DropshippingOrderItem[] = [];
  for (let i = 0; i < params.items.length; i++) {
    const itemResult = validateItem(params.items[i], i);
    if (!itemResult.ok) return { ok: false, error: itemResult.error };
    items.push(itemResult.item);
  }

  const orderNumber = (params.orderNumber || "").trim();
  const orderId = (params.orderId || "").trim();
  if (!orderNumber || !orderId) return { ok: false, error: "Falta orderNumber u orderId" };

  return {
    ok: true,
    params: {
      orderNumber,
      orderId,
      items,
      shipping: addrResult.address,
      notes: (params.notes || "").trim() || undefined,
    },
  };
}
