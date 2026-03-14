import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  Package,
  Mail,
  Shield,
} from "lucide-react";

export default function AdminConfiguracionPage() {
  return (
    <div className="space-y-8">
      <AdminBreadcrumb items={[{ label: "Configuración" }]} />
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--foreground)] tracking-tight">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          Control total de tu tienda: general, pagos, envíos y proveedores.
        </p>
      </div>

      <section className="space-y-6">
        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Settings className="h-5 w-5 text-[var(--gold)]" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Nombre de la tienda</Label>
                <Input
                  placeholder="YaraLuxe"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  defaultValue="Yara & Co."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Email de contacto</Label>
                <Input
                  type="email"
                  placeholder="hola@yaraluxe.com"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Moneda</Label>
              <select className="w-full h-11 rounded-md border border-[var(--border)] bg-[var(--elevated)] px-4 text-sm text-[var(--foreground)]">
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <Button className="rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]">
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Store className="h-5 w-5 text-[var(--gold)]" />
              Tienda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Envío gratis desde (€)</Label>
              <Input
                type="number"
                placeholder="150"
                className="bg-[var(--elevated)] border-[var(--border)] max-w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="reviews" className="rounded border-[var(--border)]" />
              <Label htmlFor="reviews" className="text-[var(--foreground)]">
                Permitir reseñas de clientes
              </Label>
            </div>
            <Button className="rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]">
              Guardar
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--gold)]" />
              Pagos (Stripe)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configura tu <code className="text-[var(--gold)]">STRIPE_SECRET_KEY</code> y{" "}
              <code className="text-[var(--gold)]">STRIPE_WEBHOOK_SECRET</code> en las variables
              de entorno. Los pagos se procesarán automáticamente en el checkout.
            </p>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--elevated)] p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Las claves nunca se muestran aquí por seguridad.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Truck className="h-5 w-5 text-[var(--gold)]" />
              Envíos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Envío estándar (€)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Envío express (€)</Label>
                <Input
                  type="number"
                  placeholder="9.99"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                />
              </div>
            </div>
            <Button className="rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)]">
              Guardar
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--gold)]" />
              Dropshipping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Añade proveedores (AliExpress, CJDropshipping, etc.) en la sección{" "}
              <a href="/admin/proveedores" className="text-[var(--gold)] hover:underline">
                Proveedores
              </a>
              . Aquí podrás programar sincronización de inventario y reenvío de pedidos.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
              <Mail className="h-5 w-5 text-[var(--gold)]" />
              Newsletter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Los suscriptores se gestionan en{" "}
              <Link href="/admin/suscriptores" className="text-[var(--gold)] hover:underline">
                Newsletter
              </Link>
              . Integra Resend o Mailchimp con tu API para envíos masivos.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
