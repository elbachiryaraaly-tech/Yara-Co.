import Link from "next/link";
import { ArrowLeft, Truck, Package, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Envíos",
  description: "Información de envíos de Yara & Co.: plazos, zonas, precios y seguimiento. Envío gratis en pedidos +50€.",
};

export default function EnviosPage() {
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
          Envíos
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-14">
          Enviamos a toda España y Portugal con la máxima seguridad. Tu pedido es nuestra prioridad desde que lo realizas hasta que llega a tus manos.
        </p>

        <div className="space-y-8">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--gold)]" />
                Envío estándar (España y Portugal)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Envío gratuito</strong> en pedidos superiores a 50€ (península). Para pedidos inferiores, el coste de envío es de 5,95€.
              </p>
              <p>
                Los pedidos se preparan en nuestras instalaciones en Sevilla y se envían en un plazo de <strong className="text-foreground">1–3 días laborables</strong>. La entrega suele realizarse en <strong className="text-foreground">3–5 días laborables</strong> desde la salida del pedido, según la zona.
              </p>
              <p>
                Recibirás un email con el número de seguimiento cuando tu pedido haya sido enviado para que puedas localizarlo en todo momento.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--gold)]" />
                Envío express (24–48 h)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Opción de <strong className="text-foreground">entrega urgente</strong> para península: 9,95€. Entrega en 24–48 horas laborables desde la expedición (según disponibilidad del transportista).
              </p>
              <p>
                Canarias, Baleares, Ceuta y Melilla: plazos y costes pueden variar. Te mostraremos el importe y el plazo estimado en el proceso de compra antes de confirmar el pedido.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--gold)]" />
                Plazos de preparación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Procesamos los pedidos de lunes a viernes. Los pedidos realizados antes de las 14:00 (hora peninsular) suelen enviarse el mismo día laborable; después de esa hora, al día laborable siguiente.
              </p>
              <p>
                En fechas de alta demanda (Black Friday, rebajas, Navidad) los plazos pueden extenderse. Te informaremos por email si hubiera algún retraso.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--gold)]" />
                Embalaje y seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Todos los productos se empaquetan con cuidado en material protector y en caja rígida para que lleguen en perfectas condiciones. Los artículos de mayor valor pueden incluir embalaje reforzado y seguro.
              </p>
              <p>
                Si el paquete llegara dañado o con signos de manipulación, puedes rechazarlo en el momento de la entrega y contactarnos para gestionar un reenvío o reembolso.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          ¿Dudas sobre tu envío? <Link href="/contacto" className="text-[var(--gold)] hover:underline">Contacta con nosotros</Link>.
        </p>
      </div>
    </div>
  );
}
