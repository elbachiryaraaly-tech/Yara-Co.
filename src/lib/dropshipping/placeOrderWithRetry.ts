import type { DropshippingProviderConfig, PlaceOrderParams, PlaceOrderResult } from "./types";
import { placeOrder } from "./index";

const DEFAULT_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000];

function isRetryable(error: string, status?: number): boolean {
  if (status && status >= 400 && status < 500 && status !== 408) return false;
  const lower = error.toLowerCase();
  if (lower.includes("timeout") || lower.includes("econnreset") || lower.includes("network") || lower.includes("fetch")) return true;
  if (status && status >= 500) return true;
  return false;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout después de ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

/**
 * Envía el pedido al proveedor con timeout y reintentos solo en fallos recuperables.
 * No reintenta en 4xx (salvo 408) ni en errores de validación.
 */
export async function placeOrderWithRetry(
  config: DropshippingProviderConfig,
  params: PlaceOrderParams,
  options?: { timeoutMs?: number; maxRetries?: number }
): Promise<PlaceOrderResult & { attemptCount: number }> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = Math.min(options?.maxRetries ?? MAX_RETRIES, 5);
  let lastResult: PlaceOrderResult | null = null;
  let attempt = 0;

  for (let i = 0; i <= maxRetries; i++) {
    attempt = i + 1;
    try {
      const result = await withTimeout(placeOrder(config, params), timeoutMs);
      lastResult = result;
      if (result.success) return { ...result, attemptCount: attempt };
      const status = (result.raw as { status?: number })?.status;
      if (!isRetryable(result.error ?? "", status)) return { ...result, attemptCount: attempt };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      lastResult = { success: false, error: message, raw: err };
      if (!isRetryable(message, undefined)) return { ...lastResult, attemptCount: attempt };
    }
    if (i < maxRetries) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[i] ?? 4000));
    }
  }

  return {
    ...(lastResult ?? { success: false, error: "Error desconocido tras reintentos" }),
    attemptCount: attempt,
  };
}
