import { prisma } from "@/lib/prisma";
import { validatePlaceOrderParams } from "./validate";
import { placeOrderWithRetry } from "./placeOrderWithRetry";
import type { DropshippingProviderConfig, PlaceOrderParams } from "./types";
import {
  refreshAliExpressProviderToken,
  isTokenRelatedError,
} from "@/lib/aliexpress-refresh";

const MAX_RAW_RESPONSE_LENGTH = 2000;

function truncateForLog(raw: unknown): string | null {
  if (raw == null) return null;
  try {
    const str = typeof raw === "string" ? raw : JSON.stringify(raw);
    return str.length > MAX_RAW_RESPONSE_LENGTH ? str.slice(0, MAX_RAW_RESPONSE_LENGTH) + "…" : str;
  } catch {
    return null;
  }
}

/**
 * Flujo completo: validar → enviar al proveedor con reintentos → registrar en DropshippingLog → actualizar Order.
 * Si algo falla, el pedido sigue existiendo; el log guarda el error para reintento manual o cron.
 */
export async function submitOrderToProvider(
  orderId: string,
  options?: { attemptNumber?: number; skipIfAlreadySent?: boolean }
): Promise<{ success: boolean; logId: string; error?: string }> {
  const skipIfAlreadySent = options?.skipIfAlreadySent ?? true;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { provider: true, variants: { select: { providerVariantId: true } } } },
          variant: true,
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) return { success: false, logId: "", error: "Pedido no encontrado" };
  if (!order.shippingAddress) return { success: false, logId: "", error: "Pedido sin dirección de envío" };
  if (!order.items.length) return { success: false, logId: "", error: "Pedido sin ítems" };

  const providerIds = Array.from(new Set(order.items.map((i) => i.product.providerId).filter(Boolean)));
  const singleProviderId = providerIds.length === 1 ? providerIds[0]! : null;
  const allHaveProviderProductId = order.items.every((i) => i.product.providerId && i.product.providerProductId);

  if (!singleProviderId || !allHaveProviderProductId) {
    return { success: false, logId: "", error: "Pedido no es elegible para dropshipping (varios proveedores o sin ID de producto)" };
  }

  const lastAttempt = await prisma.dropshippingLog.findFirst({
    where: { orderId },
    orderBy: { attemptedAt: "desc" },
    select: { attemptNumber: true },
  });
  const attemptNumber = options?.attemptNumber ?? (lastAttempt ? lastAttempt.attemptNumber + 1 : 1);

  let provider = order.items[0]!.product.provider;
  if (!provider) return { success: false, logId: "", error: "Proveedor no encontrado" };

  // Re-obtener proveedor con accessToken (AliExpress OAuth; CJ/Printful para token)
  const code = provider.code?.toLowerCase();
  if (code === "aliexpress" || code === "cj" || code === "printful") {
    const fresh = await prisma.dropshippingProvider.findUnique({
      where: { id: provider.id },
      select: {
        id: true,
        name: true,
        code: true,
        apiKey: true,
        apiSecret: true,
        accessToken: true,
        refreshToken: true,
        baseUrl: true,
        isActive: true,
      },
    });
    if (fresh) provider = fresh;
  }

  if (!provider.isActive) return { success: false, logId: "", error: "Proveedor inactivo" };
  if (!provider.apiKey?.trim() && !provider.code?.trim()) {
    return { success: false, logId: "", error: "Proveedor sin API configurada" };
  }
  if (code === "printful" && !(provider as { accessToken?: string | null }).accessToken?.trim()) {
    return {
      success: false,
      logId: "",
      error: "Printful: falta Access Token. Ve a Admin → Proveedores → Configurar API y pega tu Private Token en Access Token (desde https://developers.printful.com/ → Your tokens).",
    };
  }
  if (provider.code?.toLowerCase() === "aliexpress" && !(provider as { accessToken?: string | null }).accessToken?.trim()) {
    return {
      success: false,
      logId: "",
      error: "AliExpress: falta Access Token. Ve a Admin → Proveedores → Conectar con AliExpress y autoriza de nuevo.",
    };
  }

  if (skipIfAlreadySent && order.providerOrderId) {
    return { success: true, logId: "", error: undefined };
  }

  const addr = order.shippingAddress;
  const countryRaw = (addr.country || "").trim();
  const zip = (addr.zip || "").trim();
  const cityAndAddr = `${addr.city || ""} ${addr.address1 || ""}`.toLowerCase();
  const looksSpain =
    /^(28|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52)/.test(zip) ||
    /madrid|barcelona|valencia|sevilla|españa|espana|spain/i.test(cityAndAddr);
  const country = countryRaw || (looksSpain ? "España" : "");

  const itemsWithCjVariant = order.items.map((i) => {
    const fromVariant = (i.variant as { providerVariantId?: string | null; sku?: string | null; name?: string | null } | null)?.providerVariantId?.trim();
    const productVariants = (i.product as { variants?: { providerVariantId?: string | null }[] }).variants ?? [];
    const fromProductVariants = !fromVariant
      ? (productVariants.find((v) => v.providerVariantId?.trim())?.providerVariantId?.trim() ?? undefined)
      : undefined;
    const providerVariantId = fromVariant || fromProductVariants || undefined;
    return {
      productId: i.productId,
      providerProductId: i.product.providerProductId!,
      providerSku: i.variant?.sku ?? undefined,
      providerVariantId,
      quantity: i.quantity,
      price: Number(i.price),
      productName: i.product.name,
      variantName: i.variant?.name ?? null,
    };
  });

  // CJ exige vid o SKU de variante por ítem; si falta, indicar qué producto editar
  if (provider.code?.toLowerCase() === "cj") {
    const missing = itemsWithCjVariant.filter((i) => !i.providerVariantId?.trim());
    if (missing.length > 0) {
      const names = missing.map((i) => i.variantName ? i.productName + " (" + i.variantName + ")" : i.productName).join(", ");
      return {
        success: false,
        logId: "",
        error: "Falta el ID de variante CJ en: " + names + ". Ve a Admin -> Productos, edita el producto y en cada variante rellena 'ID variante CJ (vid o SKU)' con el valor de la ficha del producto en CJDropshipping.",
      };
    }
  }

  // Printful exige variant_id numérico por producto (desde catálogo Printful)
  if (code === "printful") {
    const missing = itemsWithCjVariant.filter((i) => {
      const v = i.providerVariantId?.trim() || i.providerProductId?.trim();
      const n = v ? parseInt(v, 10) : NaN;
      return !Number.isInteger(n) || n <= 0;
    });
    if (missing.length > 0) {
      const names = missing.map((i) => i.variantName ? i.productName + " (" + i.variantName + ")" : i.productName).join(", ");
      return {
        success: false,
        logId: "",
        error: "Printful: falta variant_id numérico en: " + names + ". En Admin → Productos, en cada variante rellena 'ID variante' (o ID de producto) con el variant_id del catálogo Printful.",
      };
    }
  }

  const params: PlaceOrderParams = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    items: itemsWithCjVariant.map(({ productName: _pn, variantName: _vn, ...item }) => item),
    shipping: {
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2 ?? undefined,
      city: addr.city,
      state: addr.state ?? undefined,
      zip: addr.zip,
      country,
      phone: addr.phone ?? "",
    },
  };

  const validation = validatePlaceOrderParams(params);
  if (!validation.ok) {
    const log = await prisma.dropshippingLog.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        status: "failed",
        errorMessage: validation.error,
        attemptNumber,
        attemptedAt: new Date(),
        completedAt: new Date(),
      },
    });
    return { success: false, logId: log.id, error: validation.error };
  }

  // CJ: permitir API Key desde .env si no está en el proveedor (CJ_API_KEY)
  const cjApiKeyFromEnv =
    provider.code?.toLowerCase() === "cj" ? process.env.CJ_API_KEY?.trim() : null;
  const resolvedApiKey = (provider.apiKey?.trim() || cjApiKeyFromEnv) ?? null;

  let config: DropshippingProviderConfig = {
    id: provider.id,
    name: provider.name,
    code: provider.code,
    apiKey: resolvedApiKey,
    apiSecret: provider.apiSecret,
    accessToken: provider.accessToken ?? null,
    baseUrl: provider.baseUrl,
    isActive: provider.isActive,
  };

  let result = await placeOrderWithRetry(config, validation.params);

  // Guardar token de CJ en BD si el adaptador lo devolvió (evita 429 en siguientes envíos)
  const newCjToken = (result as { newAccessToken?: string }).newAccessToken;
  if (result.success && newCjToken && provider.code?.toLowerCase() === "cj") {
    await prisma.dropshippingProvider.update({
      where: { id: provider.id },
      data: { accessToken: newCjToken },
    });
  }

  // Si falla por token y tenemos refresh_token (AliExpress), renovar y reintentar una vez
  if (
    !result.success &&
    provider.code?.toLowerCase() === "aliexpress" &&
    (provider as { refreshToken?: string | null }).refreshToken &&
    isTokenRelatedError(result.error)
  ) {
    const refreshed = await refreshAliExpressProviderToken(provider.id);
    if (refreshed.ok) {
      const updated = await prisma.dropshippingProvider.findUnique({
        where: { id: provider.id },
        select: { accessToken: true },
      });
      if (updated?.accessToken) {
        config = { ...config, accessToken: updated.accessToken };
        result = await placeOrderWithRetry(config, validation.params);
      }
    }
  }

  const log = await prisma.dropshippingLog.create({
    data: {
      orderId: order.id,
      providerId: provider.id,
      status: result.success ? "sent" : "failed",
      providerOrderId: result.providerOrderId ?? undefined,
      trackingNumber: result.trackingNumber ?? undefined,
      trackingUrl: result.trackingUrl ?? undefined,
      errorMessage: result.error ?? undefined,
      attemptNumber,
      rawResponse: truncateForLog(result.raw) ?? undefined,
      attemptedAt: new Date(),
      completedAt: new Date(),
    },
  });

  if (result.success) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        providerOrderId: result.providerOrderId ?? undefined,
        trackingNumber: result.trackingNumber ?? undefined,
        trackingUrl: result.trackingUrl ?? undefined,
      },
    });
  }

  return {
    success: result.success,
    logId: log.id,
    error: result.error,
  };
}
