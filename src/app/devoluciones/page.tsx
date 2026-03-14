import Link from "next/link";
import { ArrowLeft, RotateCcw, FileText, CreditCard, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Devoluciones",
  description: "Política de devoluciones de Yara & Co.: plazos, condiciones y proceso de reembolso.",
};

export default function DevolucionesPage() {
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
          Devoluciones
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-14">
          Queremos que estés completamente satisfecho con tu compra. Si no es así, puedes devolver el producto en las condiciones que se detallan a continuación.
        </p>

        <div className="space-y-8">
          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[var(--gold)]" />
                Plazo y condiciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Tienes <strong className="text-[var(--foreground)]">14 días naturales</strong> desde la recepción del pedido para ejercer tu derecho de desistimiento, conforme a la normativa de consumo aplicable.
              </p>
              <p>
                El producto debe devolverse <strong className="text-[var(--foreground)]">sin usar</strong>, en su embalaje original y con etiquetas, si las tuviera. No se aceptarán devoluciones de productos que muestren signos de uso, alteración o que no estén en condiciones de reventa.
              </p>
              <p>
                Productos de higiene personal (por ejemplo, perfumes abiertos), productos personalizados o sellados que hayan sido abiertos pueden quedar excluidos del derecho de devolución por razones de higiene o naturaleza del producto. En la ficha de cada artículo se indicará cuando aplique.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--gold)]" />
                Cómo devolver un producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <strong className="text-[var(--foreground)]">Comunica tu intención de devolución</strong> escribiendo a <a href="mailto:devoluciones@yaraandco.com" className="text-[var(--gold)] hover:underline">devoluciones@yaraandco.com</a> o desde el área de cuenta si el pedido está asociado a tu usuario. Indica número de pedido y motivo (opcional).
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Embalaje</strong>: envuelve el producto con cuidado, preferiblemente en su caja original, y asegúrate de que no sufra daños en tránsito.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Envío</strong>: te indicaremos la dirección de devolución (Sevilla). Los gastos de envío de la devolución corren por tu cuenta, salvo que la devolución sea por defecto o error nuestro.
                </li>
                <li>
                  <strong className="text-[var(--foreground)]">Recepción e inspección</strong>: una vez recibido y comprobado el estado del artículo, procederemos al reembolso en el mismo medio de pago utilizado, en un plazo máximo de 14 días desde la aceptación de la devolución.
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--gold)]" />
                Reembolsos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                El importe reembolsado será el abonado por el producto (o la parte proporcional en pedidos parcialmente devueltos). Los costes de envío inicial solo se reembolsan cuando la devolución es por defecto o error de Yara & Co.
              </p>
              <p>
                El reembolso se realizará en la misma tarjeta o método de pago utilizado. Los plazos de aparición del importe en tu cuenta dependen de tu entidad bancaria y suelen ser de 5–10 días laborables.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                <Mail className="h-5 w-5 text-[var(--gold)]" />
                Producto defectuoso o error en el pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Si recibes un artículo defectuoso o no corresponde a tu pedido, contacta de inmediato en <a href="mailto:contacto@yaraandco.com" className="text-[var(--gold)] hover:underline">contacto@yaraandco.com</a> con el número de pedido y, si es posible, fotos del producto o del error. Nos haremos cargo del envío de sustitución o de la recogida para reembolso y de los costes asociados.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Más información en <Link href="/contacto" className="text-[var(--gold)] hover:underline">Contacto</Link> o en <Link href="/terminos" className="text-[var(--gold)] hover:underline">Términos y condiciones</Link>.
        </p>
      </div>
    </div>
  );
}
