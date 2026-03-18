import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminAddProvider } from "@/components/admin/AdminAddProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditProvider";
import { getAdminProviders } from "@/lib/admin";
import { getAppBaseUrl } from "@/lib/get-base-url";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Key, Check, X, Link2, AlertCircle } from "lucide-react";

type SearchParams = Promise<{ aliexpress?: string; error?: string; message?: string; key_hint?: string }>;
const decode = (s: string | undefined) => (s ? decodeURIComponent(s) : "");

export default async function AdminProveedoresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const providers = await getAdminProviders();
  const params = await searchParams;
  const hasAliExpressToken = providers.some(
    (p) => p.code?.toLowerCase() === "aliexpress" && (p as { accessToken?: string | null }).accessToken?.trim()
  );

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Proveedores" }]} />
      {params.aliexpress === "connected" && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-3 text-sm">
          Token de AliExpress guardado correctamente. Los pedidos se enviarán al proveedor de forma automática.
        </div>
      )}
      {params.error?.startsWith("aliexpress") &&
        params.error !== "aliexpress_manual_token" &&
        !hasAliExpressToken && (
        <div className="rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {params.error === "aliexpress_no_config"
              ? "Configura antes API Key y API Secret en AliExpress (Configurar API)."
              : params.error === "aliexpress_no_code"
                ? "AliExpress no devolvió código de autorización. Vuelve a intentarlo."
                : params.error === "aliexpress_no_credentials"
                  ? "Faltan API Key o API Secret del proveedor."
                  : params.error === "aliexpress_token" && params.message
                    ? decodeURIComponent(params.message)
                    : "Error al conectar con AliExpress. Vuelve a intentarlo."}
          </span>
        </div>
      )}
      {params.error === "aliexpress_manual_token" && !hasAliExpressToken && (
        <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 px-4 py-3 text-sm space-y-2">
          <p className="font-medium">No se pudo obtener el token automáticamente</p>
          {params.message && (
            <p className="text-xs font-mono bg-black/20 rounded px-2 py-1 break-all">
              Error de AliExpress: {decode(params.message)}
            </p>
          )}
          {params.key_hint && (
            <p className="text-xs bg-[var(--elevated)] rounded px-2 py-1">
              App Key que está usando el sistema: <strong>{decode(params.key_hint)}</strong> (ej. 52**86 = 529586). Si no es la que configuraste, entra en <strong>Configurar API</strong>, escribe de nuevo la App Key y el App Secret y guarda.
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Opción 1: Con apps de openservice.aliexpress.com puedes intentar obtener el token manualmente. Entra en tu app → Auth Management o Documentation → &quot;Get token&quot; / &quot;Obtain token&quot; → copia el <strong>access_token</strong> y pégalo aquí en <strong>Configurar API</strong> → Access Token.
          </p>
          <p className="text-muted-foreground text-xs">
            Opción 2: Si el error dice <strong>&quot;appkey not exists&quot;</strong>: (1) Confirma que en <strong>Configurar API</strong> has guardado la App Key correcta (ej. 529586) y el App Secret. (2) Si tu app está en estado <strong>Test</strong> en AliExpress, pásala a <strong>Online</strong> en la consola (App Overview → Apply Offline/Edit o solicitar go live).
          </p>
          <p className="text-muted-foreground text-xs">
            Opción 3: Si el error habla de &quot;code&quot; o &quot;expired&quot;, vuelve a pulsar <strong>Conectar con AliExpress</strong> e inicia sesión y autoriza de nuevo (el código caduca en unos minutos).
          </p>
          <p className="text-muted-foreground text-xs mt-2">El token puede caducar (p. ej. 30 días); cuando la API lo pida, repite el proceso o usa &quot;Renovar token&quot;.</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Proveedores dropshipping
          </h1>
          <p className="text-muted-foreground mt-1">
            Conecta AliExpress, CJDropshipping u otros para sincronizar inventario y pedidos.
          </p>
        </div>
        <AdminAddProvider />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {providers.length === 0 ? (
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)] p-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay proveedores configurados. Añade uno para poder vincular productos en Nuevo producto.
            </p>
            <AdminAddProvider />
          </Card>
        ) : (
          providers.map((p) => (
            <Card
              key={p.id}
              className="rounded-2xl border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-[var(--elevated)] flex items-center justify-center">
                      <Truck className="h-6 w-6 text-[var(--gold)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">{p.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        {p.apiKey || (p.code?.toLowerCase() === "printful" && (p as { accessToken?: string | null }).accessToken?.trim()) || (p.code?.toLowerCase() === "bigbuy" && ((p as { accessToken?: string | null }).accessToken?.trim() || p.apiKey?.trim())) ? (
                          <>
                            <Key className="h-3.5 w-3 text-emerald-400" />
                            API conectada
                            {(p as { accessToken?: string | null }).accessToken &&
                             (p.code?.toLowerCase() === "aliexpress" || p.code?.toLowerCase() === "printful") && (
                              <> · <span className="text-emerald-400">Token OK</span></>
                            )}
                          </>
                        ) : (
                          <>
                            <Key className="h-3.5 w-3 text-amber-400" />
                            Sin configurar
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--muted)]/30 text-muted-foreground"
                    }`}
                  >
                    {p.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {p.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
                  {p.code?.toLowerCase() === "aliexpress" && p.apiKey?.trim() && (
                    <>
                      <Button variant="outline" size="sm" className="border-[var(--border)] gap-1.5" asChild>
                        <a
                          href={`${getAppBaseUrl()}/api/auth/aliexpress/authorize`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center"
                        >
                          <Link2 className="h-3.5 w-3" />
                          {(p as { accessToken?: string | null }).accessToken ? "Renovar token" : "Conectar con AliExpress"}
                        </a>
                      </Button>
                      <p className="text-[10px] text-muted-foreground w-full mt-1">
                        Se abrirá una pestaña nueva. Inicia sesión como <strong>vendedor</strong> (no comprador), autoriza y cierra la pestaña. Luego actualiza esta página (F5).
                      </p>
                      <p className="text-[10px] text-muted-foreground w-full">
                        Si el botón no abre: copia y pega en el navegador:{" "}
                        <code className="bg-[var(--elevated)] px-1 rounded break-all">
                          {getAppBaseUrl()}/api/auth/aliexpress/authorize
                        </code>
                      </p>
                      <p className="text-[11px] text-amber-200/90 bg-amber-500/15 border border-amber-500/30 rounded-lg p-2 w-full mt-1">
                        Si <strong>solo aparece &quot;Buyer login&quot;</strong> y no hay opción de vendedor: tu app en AliExpress puede ser tipo Affiliate/Buyer. Entra en <strong>openservice.aliexpress.com</strong> → crea una <strong>nueva app</strong> bajo <strong>Overseas Developers → Seller Authorization / Dropshipper</strong>, configura la Callback URL y usa la nueva App Key y App Secret aquí en Configurar API.
                      </p>
                    </>
                  )}
                  {p.code?.toLowerCase() === "cj" && !p.apiKey?.trim() && (
                    <p className="text-[10px] text-muted-foreground w-full mb-1">
                      Solo necesitas la <strong>API Key</strong> de CJDropshipping. Obténla en{" "}
                      <a
                        href="https://www.cjdropshipping.com/myCJ.html#/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gold)] hover:underline"
                      >
                        Mi CJ → API Key
                      </a>
                      .
                    </p>
                  )}
                  {p.code?.toLowerCase() === "printful" && !(p as { accessToken?: string | null }).accessToken?.trim() && (
                    <p className="text-[10px] text-muted-foreground w-full mb-1">
                      Printful usa <strong>Access Token</strong> (Private Token). Obténlo en{" "}
                      <a
                        href="https://developers.printful.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gold)] hover:underline"
                      >
                        developers.printful.com → Your tokens
                      </a>
                      y pégalo en Configurar API → Access Token.
                    </p>
                  )}
                  {p.code?.toLowerCase() === "bigbuy" && !p.apiKey?.trim() && !(p as { accessToken?: string | null }).accessToken?.trim() && (
                    <p className="text-[10px] text-muted-foreground w-full mb-1">
                      BigBuy usa <strong>API Key (token)</strong>. Obténla en tu{" "}
                      <a
                        href="https://www.bigbuy.eu/es/account/api.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gold)] hover:underline"
                      >
                        panel BigBuy → API
                      </a>
                      y pégalo en Configurar API → API Key.
                    </p>
                  )}
                  {p.code?.toLowerCase() === "shein" && !p.apiKey?.trim() && !(p as { accessToken?: string | null }).accessToken?.trim() && (
                    <p className="text-[10px] text-muted-foreground w-full mb-1">
                      Shein Open Platform: obtén <strong>API Key o Access Token</strong> en{" "}
                      <a
                        href="https://open.sheincorp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--gold)] hover:underline"
                      >
                        open.sheincorp.com
                      </a>
                      . Para <strong>importar productos por ID</strong> añade <code className="text-[10px] bg-[var(--elevated)] px-1 rounded">SEARCHAPI_API_KEY</code> en .env (SearchAPI.io).
                    </p>
                  )}
                  <AdminEditProvider providerId={p.id}>
                    <Button type="button" variant="outline" size="sm" className="border-[var(--border)] gap-1.5">
                      Configurar API
                    </Button>
                  </AdminEditProvider>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
