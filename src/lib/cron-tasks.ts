/**
 * Tareas ejecutables por cron para automatizar todo el flujo:
 * 1) Renovar token AliExpress
 * 2) Reintentar envío a proveedor de pedidos PAID sin providerOrderId
 * 3) Sincronizar tracking y marcar SHIPPED (devuelve datos para enviar email al cliente)
 */
import { prisma } from "@/lib/prisma";
import { getOrderStatus } from "@/lib/dropshipping";
import { submitOrderToProvider } from "@/lib/dropshipping/submitOrderToProvider";
import { refreshAliExpressProviderToken } from "@/lib/aliexpress-refresh";

const TRACKING_TIMEOUT_MS = 15_000;

/** Renueva access_token de todos los proveedores AliExpress activos. */
export async function refreshAliExpressTokens(): Promise<{
  refreshed: number;
  total: number;
  results: { id: string; name: string; ok: boolean; error?: string }[];
}> {
  const providers = await prisma.dropshippingProvider.findMany({
    where: {
      code: "aliexpress",
      refreshToken: { not: null },
      apiKey: { not: null },
      apiSecret: { not: null },
      isActive: true,
    },
    select: { id: true, name: true },
  });

  const results: { id: string; name: string; ok: boolean; error?: string }[] = [];
  for (const p of providers) {
    const result = await refreshAliExpressProviderToken(p.id);
    results.push({
      id: p.id,
      name: p.name,
      ok: result.ok,
      ...(result.ok ? {} : { error: result.error }),
    });
  }
  return {
    refreshed: results.filter((r) => r.ok).length,
    total: providers.length,
    results,
  };
}

/** Reintenta enviar al proveedor los pedidos PAID que aún no tienen providerOrderId. */
export async function retryFailedDropshipping(): Promise<{
  retried: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      providerOrderId: null,
    },
    select: { id: true, orderNumber: true },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  let success = 0;
  const errors: string[] = [];

  for (const order of orders) {
    try {
      const result = await submitOrderToProvider(order.id, {
        attemptNumber: 1,
        skipIfAlreadySent: false,
      });
      if (result.success) success++;
      else errors.push(`${order.orderNumber}: ${result.error ?? "Error"}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${order.orderNumber}: ${msg}`);
    }
  }

  return {
    retried: orders.length,
    success,
    failed: orders.length - success,
    errors: errors.slice(0, 30),
  };
}

export type ShippedOrderInfo = {
  email: string;
  orderNumber: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  customerName: string | null;
};

/** Sincroniza tracking con el proveedor y marca pedidos como SHIPPED. Devuelve los enviados para notificar por email. */
export async function syncTracking(): Promise<{
  checked: number;
  updated: number;
  shipped: ShippedOrderInfo[];
  errors: string[];
}> {
  const orders = await prisma.order.findMany({
    where: {
      providerOrderId: { not: null },
      trackingNumber: null,
      status: { in: ["PROCESSING", "PAID", "PENDING"] },
    },
    include: {
      items: { take: 1, include: { product: { include: { provider: true } } } },
      user: { select: { name: true } },
    },
  });

  const shipped: ShippedOrderInfo[] = [];
  const errors: string[] = [];
  let updated = 0;

  for (const order of orders) {
    try {
      const provider = order.items[0]?.product?.provider;
      if (!provider?.apiKey || !order.providerOrderId) continue;

      const config = {
        id: provider.id,
        name: provider.name,
        code: provider.code,
        apiKey: provider.apiKey,
        apiSecret: provider.apiSecret ?? null,
        accessToken: (provider as { accessToken?: string | null }).accessToken ?? null,
        baseUrl: provider.baseUrl ?? null,
        isActive: provider.isActive,
      };

      const status = await Promise.race([
        getOrderStatus(config, order.providerOrderId),
        new Promise<undefined>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout 15s")), TRACKING_TIMEOUT_MS)
        ),
      ]);

      if (status && typeof status === "object" && (status.trackingNumber || status.trackingUrl)) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            ...(status.trackingNumber && { trackingNumber: status.trackingNumber }),
            ...(status.trackingUrl && { trackingUrl: status.trackingUrl }),
            ...(status.trackingNumber && { status: "SHIPPED" }),
          },
        });
        updated++;
        if (order.email) {
          shipped.push({
            email: order.email,
            orderNumber: order.orderNumber,
            trackingNumber: status.trackingNumber ?? null,
            trackingUrl: status.trackingUrl ?? null,
            customerName: order.user?.name ?? null,
          });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${order.orderNumber}: ${msg}`);
    }
  }

  return {
    checked: orders.length,
    updated,
    shipped,
    errors: errors.slice(0, 20),
  };
}
