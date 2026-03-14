import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la web y de compra de Yara & Co.",
};

export default function TerminosPage() {
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

        <h1 className="font-display text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-4">
          Términos y Condiciones
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Última actualización: febrero 2025
        </p>
        <p className="text-muted-foreground max-w-2xl mb-14">
          Al acceder y utilizar el sitio web y los servicios de Yara & Co. («el sitio»), con sede en Sevilla, España, aceptas los siguientes términos y condiciones. Te recomendamos leerlos con atención.
        </p>

        <div className="space-y-8">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">1. Objeto y aceptación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Estos términos regulan el uso del sitio y la compra de productos ofrecidos por Yara & Co. La navegación y, en su caso, el registro y la realización de pedidos implican la aceptación de los presentes términos y de nuestra <Link href="/privacidad" className="text-[var(--gold)] hover:underline">Política de Privacidad</Link>.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">2. Información general y disponibilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Nos esforzamos por que la información y las imágenes de los productos sean fieles. No obstante, no garantizamos la ausencia de errores ni que la disponibilidad sea permanente. Nos reservamos el derecho a limitar cantidades y a corregir errores u omisiones (incluso después de enviar el pedido) sin que ello comporte obligación alguna para el usuario más allá del reembolso si procede.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">3. Precios y ofertas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Los precios mostrados incluyen IVA cuando sea de aplicación y se expresan en euros (€). Los costes de envío se indican antes de confirmar el pedido. Las ofertas y promociones son válidas en los plazos y condiciones que se indiquen y pueden no ser acumulables con otras.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">4. Proceso de compra y contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Al completar el proceso de compra y recibir la confirmación del pedido por email, se entiende celebrado el contrato de compraventa. Es responsabilidad del usuario facilitar datos correctos. La aceptación del pedido queda sujeta a disponibilidad y, en su caso, a verificación de pago o de identidad para prevenir fraudes.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">5. Formas de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Aceptamos los métodos de pago indicados en el checkout (tarjeta, etc.). El cobro se realiza al confirmar el pedido. En caso de pago rechazado o impago, nos reservamos el derecho a cancelar el pedido y a contactarte para regularizar el pago si procede.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">6. Envíos y entregas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Los plazos y costes de envío se detallan en la página de <Link href="/envios" className="text-[var(--gold)] hover:underline">Envíos</Link>. El riesgo del producto se transmite en el momento de la entrega. Es responsabilidad del usuario facilitar una dirección correcta y asegurar que alguien pueda recibir el pedido; en caso de fallos reiterados de entrega, podremos cancelar o facturar gastos adicionales según corresponda.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">7. Devoluciones y desistimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Las condiciones de devolución y derecho de desistimiento se describen en la página de <Link href="/devoluciones" className="text-[var(--gold)] hover:underline">Devoluciones</Link>, que forman parte de estos términos.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">8. Propiedad intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Todo el contenido del sitio (textos, imágenes, logotipos, diseño, marcas) es propiedad de Yara & Co. o de sus licenciantes. Queda prohibida la reproducción, distribución o uso comercial sin autorización expresa.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">9. Uso del sitio y conducta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>El usuario se compromete a usar el sitio de forma lícita y a no realizar acciones que dañen, sobrecarguen o comprometan el funcionamiento o la seguridad, ni a suplantar identidades ni a utilizar datos de terceros sin consentimiento.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">10. Limitación de responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Yara & Co. no será responsable de daños indirectos, pérdida de beneficios o de datos derivados del uso del sitio o de la imposibilidad de uso, salvo en los casos en que la ley imponga lo contrario. En la medida permitida por la ley, nuestra responsabilidad se limitará al importe del pedido afectado.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] text-lg">11. Modificaciones y ley aplicable</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Nos reservamos el derecho a modificar estos términos; los cambios serán efectivos desde su publicación en el sitio. El uso continuado del sitio tras las modificaciones implica su aceptación. Para litigios, las partes se someten a los juzgados y tribunales del domicilio del consumidor o de Sevilla, con sujeción a la normativa española y, en su caso, a la normativa de consumo aplicable.</p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          <Link href="/contacto" className="text-[var(--gold)] hover:underline">Contacto</Link> · <Link href="/privacidad" className="text-[var(--gold)] hover:underline">Política de Privacidad</Link>
        </p>
      </div>
    </div>
  );
}
