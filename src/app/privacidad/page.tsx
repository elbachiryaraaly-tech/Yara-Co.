import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de Yara & Co. RGPD, cookies y derechos del usuario.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a inicio
        </Link>

        <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
          Política de Privacidad
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Última actualización: febrero 2025
        </p>
        <p className="text-muted-foreground max-w-2xl mb-14">
          Yara & Co. («nosotros», «nuestro») con sede en Sevilla, España, se compromete a proteger tu privacidad. Esta política describe qué datos recogemos, para qué los usamos y cuáles son tus derechos conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos.
        </p>

        <div className="space-y-8">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">1. Responsable del tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong className="text-foreground">Identidad:</strong> Yara & Co.</p>
              <p><strong className="text-foreground">Ubicación:</strong> Sevilla, España.</p>
              <p><strong className="text-foreground">Contacto:</strong> contacto@yaraandco.com (para asuntos de privacidad y ejercicio de derechos).</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">2. Datos que recogemos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Podemos tratar, según el uso que hagas de la web y de nuestros servicios:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-foreground">Datos de cuenta:</strong> nombre, email, contraseña (encriptada), dirección de envío y facturación cuando realizas un pedido o te registras.</li>
                <li><strong className="text-foreground">Datos de pedidos:</strong> productos, importes, direcciones y datos de pago necesarios para procesar la compra (los datos de tarjeta son gestionados por el proveedor de pagos y no los almacenamos completos).</li>
                <li><strong className="text-foreground">Comunicación:</strong> mensajes que nos envíes por formulario de contacto o email.</li>
                <li><strong className="text-foreground">Newsletter:</strong> dirección de correo si te suscribes.</li>
                <li><strong className="text-foreground">Uso técnico:</strong> dirección IP, tipo de navegador, páginas visitadas y cookies (ver sección de cookies).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">3. Finalidad y base legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-foreground">Ejecución del contrato:</strong> gestión de pedidos, envíos, facturación y atención al cliente.</li>
                <li><strong className="text-foreground">Consentimiento:</strong> envío de newsletter y comunicaciones comerciales si te suscribes.</li>
                <li><strong className="text-foreground">Interés legítimo:</strong> mejora de la web, seguridad y prevención del fraude.</li>
                <li><strong className="text-foreground">Obligación legal:</strong> conservación de datos para facturación y obligaciones fiscales.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">4. Conservación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Conservamos los datos mientras sea necesario para las finalidades indicadas (por ejemplo, durante la relación comercial y los años exigidos por ley para documentación fiscal). Los datos de newsletter se mantienen hasta que solicites la baja.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">5. Destinatarios y transferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Podemos compartir datos con proveedores necesarios para el servicio: pasarela de pago, transporte, hosting y email. No vendemos tus datos. Si algún proveedor está fuera del EEE, se garantizan medidas adecuadas (cláusulas tipo, etc.).</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Utilizamos cookies y tecnologías similares para sesión, preferencias, análisis de uso y seguridad. Puedes configurar tu navegador para rechazar o limitar cookies; parte del sitio podría no funcionar igual.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">7. Tus derechos (RGPD)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Puedes dirigirte a contacto@yaraandco.com para ejercer:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong className="text-foreground">Acceso</strong> a tus datos.</li>
                <li><strong className="text-foreground">Rectificación</strong> de datos inexactos o incompletos.</li>
                <li><strong className="text-foreground">Supresión</strong> cuando ya no sean necesarios o retires el consentimiento.</li>
                <li><strong className="text-foreground">Limitación</strong> del tratamiento en los casos previstos.</li>
                <li><strong className="text-foreground">Portabilidad</strong> de los datos que nos hayas facilitado.</li>
                <li><strong className="text-foreground">Oposición</strong> al tratamiento basado en interés legítimo o al envío de comunicaciones comerciales.</li>
              </ul>
              <p className="mt-4">Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que el tratamiento no se ajusta a la normativa.</p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          <Link href="/contacto" className="text-[var(--gold)] hover:underline">Contacto</Link> · <Link href="/terminos" className="text-[var(--gold)] hover:underline">Términos y condiciones</Link>
        </p>
      </div>
    </div>
  );
}
