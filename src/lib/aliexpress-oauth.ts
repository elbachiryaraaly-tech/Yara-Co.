/**
 * OAuth de AliExpress Open Platform: autorización y canje de code por token.
 * Documentación: openservice.aliexpress.com, Auth Management.
 */

// Authorize en api-sg (openservice). Token: DropShip API usa /rest + /auth/token/create
const ALIEXPRESS_AUTHORIZE_URL = "https://api-sg.aliexpress.com/oauth/authorize";
const ALIEXPRESS_REST_BASE = "https://api-sg.aliexpress.com/rest";
const ALIEXPRESS_TOKEN_URLS = [
  "https://api-sg.aliexpress.com/oauth/token",
  "https://api-sg.aliexpress.com/sync/oauth/token",
  "https://oauth.aliexpress.com/token",
];

export function getAliExpressAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state?: string;
  /** Si true, usa response_type=token: el token vendrá en la URL (#access_token=...) al redirigir */
  tokenInUrl?: boolean;
}): string {
  const url = new URL(ALIEXPRESS_AUTHORIZE_URL);
  url.searchParams.set("response_type", params.tokenInUrl ? "token" : "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("view", "web");
  url.searchParams.set("sp", "ae");
  url.searchParams.set("redirect_auth", "true");
  if (!params.tokenInUrl) url.searchParams.set("force_auth", "true");
  // Forzar pantalla de vendedor (seller). Sin esto a veces solo aparece "Buyer login".
  url.searchParams.set("account_platform", "seller_center");
  if (params.state) url.searchParams.set("state", params.state);
  return url.toString();
}

export interface AliExpressTokenResponse {
  access_token: string;
  refresh_token?: string;
  expire_time?: string;
  refresh_token_valid_time?: string;
}

function parseTokenResponse(
  text: string,
  resStatus: number
): { success: true; data: AliExpressTokenResponse } | { success: false; error: string } {
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    const preview = text.slice(0, 120).replace(/\s+/g, " ").trim() || "(vacío)";
    return { success: false, error: `Token no es JSON (HTTP ${resStatus}). Respuesta: ${preview}` };
  }
  const err =
    (json.error_msg as string) ??
    (json.error_description as string) ??
    (json.error as string) ??
    (json as { error_response?: { msg?: string; code?: string } }).error_response?.msg;
  const errCode = (json.error_code as string) ?? (json as { error_response?: { code?: string } }).error_response?.code;
  if (err) {
    return { success: false, error: errCode ? `[${errCode}] ${err}` : String(err) };
  }
  const tokenObj = (json.token_result as Record<string, unknown>) ?? (json.result as Record<string, unknown>) ?? json;
  const rawToken =
    tokenObj.access_token ?? tokenObj.accessToken ?? json.access_token ?? json.accessToken ?? json.token;
  const access_token = typeof rawToken === "string" ? rawToken : undefined;
  if (!access_token) {
    return {
      success: false,
      error: `Falta access_token. Claves: ${Object.keys(json).join(", ")}`,
    };
  }
  return {
    success: true,
    data: {
      access_token,
      refresh_token: (tokenObj.refresh_token ?? tokenObj.refreshToken ?? json.refresh_token) as string | undefined,
      expire_time: (tokenObj.expire_time ?? json.expire_time) as string | undefined,
      refresh_token_valid_time: (tokenObj.refresh_token_valid_time ?? json.refresh_token_valid_time) as string | undefined,
    },
  };
}

/**
 * Formato timestamp GMT+8 "yyyy-MM-dd HH:mm:ss" (usado en doc Alibaba/TOP).
 */
function timestampGmt8(): string {
  const d = new Date();
  const gmt8 = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${gmt8.getUTCFullYear()}-${pad(gmt8.getUTCMonth() + 1)}-${pad(gmt8.getUTCDate())} ${pad(gmt8.getUTCHours())}:${pad(gmt8.getUTCMinutes())}:${pad(gmt8.getUTCSeconds())}`;
}

/**
 * Canje de code por token usando la API REST de DropShippers (/auth/token/create).
 * Doc: openservice.aliexpress.com → DropShippers API Developer → Create token.
 * Prueba varias variantes de parámetros y firma según documentación Alibaba/TOP.
 */
async function exchangeCodeViaDropShipRest(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ success: true; data: AliExpressTokenResponse } | { success: false; error: string }> {
  const crypto = await import("crypto");
  let lastRestError = "Unknown error";
  const variants: { methodKey: string; timestamp: string; appKeyParam: "app_key" | "appkey" }[] = [
    { methodKey: "method", timestamp: new Date().toISOString().replace(/[-:]/g, "").slice(0, 14), appKeyParam: "app_key" },
    { methodKey: "api_name", timestamp: new Date().toISOString().replace(/[-:]/g, "").slice(0, 14), appKeyParam: "app_key" },
    { methodKey: "method", timestamp: timestampGmt8(), appKeyParam: "app_key" },
    { methodKey: "api_name", timestamp: timestampGmt8(), appKeyParam: "app_key" },
    { methodKey: "method", timestamp: timestampGmt8(), appKeyParam: "appkey" },
    { methodKey: "api_name", timestamp: timestampGmt8(), appKeyParam: "appkey" },
  ];

  for (const { methodKey, timestamp, appKeyParam } of variants) {
    const payload: Record<string, string> = {
      [methodKey]: "/auth/token/create",
      [appKeyParam]: params.clientId,
      code: params.code,
      redirect_uri: params.redirectUri,
      sign_method: "hmac-sha256",
      timestamp,
    };
    const sortedKeys = Object.keys(payload).sort();
    const signStr = sortedKeys.map((k) => `${k}${payload[k]}`).join("");
    payload.sign = crypto.createHmac("sha256", params.clientSecret).update(signStr).digest("hex").toUpperCase();

    const res = await fetch(ALIEXPRESS_REST_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams(payload).toString(),
    });
    const text = await res.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text);
    } catch {
      continue;
    }
    const errCode = (json.gopErrorCode as string) ?? (json.code as string);
    const errMsg = (json.gopErrorMsg as string) ?? (json.msg as string) ?? (json.message as string) ?? String(errCode || "Unknown");
    if (errCode && String(errCode) !== "0") {
      lastRestError = `[${errCode}] ${errMsg}`;
      continue;
    }
    const bodyStr = (json.gopResponseBody as string) ?? text;
    let body: Record<string, unknown>;
    try {
      body = typeof bodyStr === "string" ? (JSON.parse(bodyStr) as Record<string, unknown>) : (bodyStr as Record<string, unknown>);
    } catch {
      body = json;
    }
    const access_token = (body.access_token as string) ?? (json.access_token as string);
    if (!access_token) continue;
    return {
      success: true,
      data: {
        access_token,
        refresh_token: (body.refresh_token as string) ?? (json.refresh_token as string),
        expire_time: (body.expire_time as string) ?? (json.expire_time as string),
        refresh_token_valid_time: (body.refresh_token_valid_time as string) ?? (json.refresh_token_valid_time as string),
      },
    };
  }

  return { success: false, error: lastRestError };
}

export async function exchangeCodeForToken(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ success: true; data: AliExpressTokenResponse } | { success: false; error: string }> {
  const restResult = await exchangeCodeViaDropShipRest(params);
  if (restResult.success) return restResult;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    app_key: params.clientId,
    app_secret: params.clientSecret,
    redirect_uri: params.redirectUri,
    sp: "ae",
    view: "web",
  });
  const doPost = async (url: string) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    const text = await res.text();
    return { res, text };
  };
  let lastError: string = restResult.error;
  for (const tokenUrl of ALIEXPRESS_TOKEN_URLS) {
    const { res, text } = await doPost(tokenUrl);
    const parsed = parseTokenResponse(text, res.status);
    if (parsed.success) return parsed;
    if (!parsed.success) lastError = parsed.error;
  }
  return { success: false, error: lastError };
}

/**
 * Renovar token con REST /auth/token/refi (DropShip). Doc: Refresh token /auth/token/refi.
 */
async function refreshTokenViaDropShipRest(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{ success: true; data: AliExpressTokenResponse } | { success: false; error: string }> {
  const crypto = await import("crypto");
  const timestamp = timestampGmt8();
  const payload: Record<string, string> = {
    api_name: "/auth/token/refi",
    app_key: params.clientId,
    refresh_token: params.refreshToken,
    sign_method: "hmac-sha256",
    timestamp,
  };
  const sortedKeys = Object.keys(payload).sort();
  const signStr = sortedKeys.map((k) => `${k}${payload[k]}`).join("");
  payload.sign = crypto.createHmac("sha256", params.clientSecret).update(signStr).digest("hex").toUpperCase();

  const res = await fetch(ALIEXPRESS_REST_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(payload).toString(),
  });
  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    return { success: false, error: `REST refresh: no JSON (HTTP ${res.status})` };
  }
  const errCode = (json.gopErrorCode as string) ?? (json.code as string);
  if (errCode && String(errCode) !== "0") {
    const errMsg = (json.gopErrorMsg as string) ?? (json.msg as string) ?? String(errCode);
    return { success: false, error: `[${errCode}] ${errMsg}` };
  }
  const bodyStr = (json.gopResponseBody as string) ?? text;
  let body: Record<string, unknown>;
  try {
    body = typeof bodyStr === "string" ? (JSON.parse(bodyStr) as Record<string, unknown>) : (bodyStr as Record<string, unknown>);
  } catch {
    body = json;
  }
  const access_token = (body.access_token as string) ?? (json.access_token as string);
  if (!access_token) return { success: false, error: "Falta access_token en respuesta refresh" };
  return {
    success: true,
    data: {
      access_token,
      refresh_token: (body.refresh_token as string) ?? params.refreshToken,
      expire_time: (body.expire_time as string) as string | undefined,
      refresh_token_valid_time: (body.refresh_token_valid_time as string) as string | undefined,
    },
  };
}

export async function refreshAliExpressToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{ success: true; data: AliExpressTokenResponse } | { success: false; error: string }> {
  const restRefresh = await refreshTokenViaDropShipRest(params);
  if (restRefresh.success) return restRefresh;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    app_key: params.clientId,
    app_secret: params.clientSecret,
    sp: "ae",
    view: "web",
  });
  for (const tokenUrl of ALIEXPRESS_TOKEN_URLS) {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    const text = await res.text();
    if (!res.ok) continue;
    const parsed = parseTokenResponse(text, res.status);
    if (parsed.success) {
      return {
        success: true,
        data: {
          ...parsed.data,
          refresh_token: parsed.data.refresh_token ?? params.refreshToken,
        },
      };
    }
  }
  return { success: false, error: restRefresh.error || "No se pudo renovar el token" };
}
