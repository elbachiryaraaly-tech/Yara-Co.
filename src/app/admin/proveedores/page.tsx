import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminAddProvider } from "@/components/admin/AdminAddProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditProvider";
import { getAdminProviders } from "@/lib/admin";
import { getAppBaseUrl } from "@/lib/get-base-url";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Key, Check, X, Link2, AlertCircle } from "lucide-react";

type SearchParams = Promise<{ aliexpress?: string; error?: string; message?: string }>;

export default async function AdminProveedoresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const providers = await getAdminProviders();
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <AdminBreadcrumb items={[{ label: "Proveedores" }]} />
      {params.aliexpress === "connected" && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-3 text-sm">
          Token de AliExpress guardado correctamente. Los pedidos se enviarán al proveedor de forma automática.
        </div>
      )}
      {params.error?.startsWith("aliexpress") && params.error !== "aliexpress_manual_token" && (
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
      {params.error === "aliexpress_manual_token" && (
        <div className="rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 px-4 py-3 text-sm space-y-2">
          <p className="font-medium">Configura el token de AliExpress manualmente</p>
          <p className="text-muted-foreground text-xs">
            Con apps de openservice.aliexpress.com el token no se obtiene desde aquí. Sigue estos pasos y luego pulsa <strong>Configurar API</strong> en la tarjeta de AliExpress para pegar el token.
          </p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Entra en <strong>openservice.aliexpress.com</strong> → tu app → Auth Management o Documentation.</li>
            <li>Usa la opción &quot;Get token&quot; / &quot;Obtain token&quot; y copia el <strong>access_token</strong>.</li>
            <li>Aquí: <strong>Configurar API</strong> en la tarjeta de AliExpress → pega en <strong>Access Token</strong> → Guarda.</li>
          </ol>
          <p className="text-muted-foreground text-xs mt-2">El token puede caducar (p. ej. 30 días); cuando la API lo pida, repite el proceso o usa &quot;Renovar token&quot; si está disponible.</p>
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
                        {p.apiKey ? (
                          <>
                            <Key className="h-3.5 w-3 text-emerald-400" />
                            API conectada
                            {(p as { accessToken?: string | null }).accessToken &&
                             p.code?.toLowerCase() === "aliexpress" && (
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
