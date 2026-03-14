import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contacto",
  description: "Contacta con Yara & Co. — Atención al cliente, Sevilla. Formulario, email, teléfono y dirección.",
};

export default function ContactoPage() {
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
          Contacto
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-14">
          Estamos en Sevilla para atenderte. Escríbenos por formulario, email o teléfono y te responderemos lo antes posible.
        </p>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] text-lg">Dónde estamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Yara & Co.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sevilla, España
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dirección de oficina disponible bajo cita previa.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Email</p>
                    <a
                      href="mailto:contacto@yaraandco.com"
                      className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
                    >
                      contacto@yaraandco.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Teléfono</p>
                    <a
                      href="tel:+34900000000"
                      className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
                    >
                      +34 900 000 000
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Atención al cliente</p>
                    <p className="text-sm text-muted-foreground">
                      Lunes a Viernes: 9:00 – 18:00
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sábados: 10:00 – 14:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] text-lg">Envíanos un mensaje</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Rellena el formulario y te contestaremos en un plazo máximo de 24–48 horas laborables.
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
