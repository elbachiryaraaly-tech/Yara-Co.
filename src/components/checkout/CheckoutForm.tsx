"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCart } from "@/components/providers/CartProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { formatPrice } from "@/lib/utils";
import { Truck, MapPin, CreditCard, Lock, Globe } from "lucide-react";
import { countriesConfig as countries, FREE_SHIPPING_THRESHOLD, getShippingCost } from "@/lib/shipping";

// Schema mejorado para envíos internacionales
const addressSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  address: z.string().min(5, "Dirección completa"),
  address2: z.string().optional(),
  city: z.string().min(2, "Ciudad"),
  state: z.string().min(2, "Estado/Provincia requerido"), // Ahora obligatorio
  postalCode: z.string().min(3, "Código postal válido"),
  country: z.string().min(2, "País"),
  phone: z.string().min(6, "Teléfono válido con código de país"),
  email: z.string().email("Email válido").optional(), // Para confirmaciones
});

type AddressFormData = z.infer<typeof addressSchema>;



export function CheckoutForm() {
  const { items, isLoading, refreshCart } = useCart();
  const router = useRouter();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // España por defecto

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Calcular coste de envío con lógica de envío gratuito
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD; // Envío gratuito a partir del threshold
  const shippingCost = getShippingCost(selectedCountry.code, shippingMethod, subtotal);

  const total = subtotal + shippingCost;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "ES",
    },
  });

  // Watch para detectar cambios en el país
  const watchedCountry = watch("country");

  // Actualizar país seleccionado cuando cambia el selector
  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode) || countries[0];
    setSelectedCountry(country);
    setValue("country", countryCode);
  };

  const onSubmit = async (data: AddressFormData) => {
    setSubmitError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        shippingMethod,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    if (res.status === 403) {
      setSubmitError(
        json.error ?? "Verifica tu correo antes de finalizar la compra. Puedes reenviar el enlace desde la página de inicio de sesión."
      );
      return;
    }
    if (!res.ok) {
      setSubmitError(json.error ?? "Error al crear el pedido");
      return;
    }
    if (json.url) {
      window.location.href = json.url;
      return;
    }
    await refreshCart();
    router.push(`/cuenta/pedidos/${json.orderId}`);
    router.refresh();
  };

  if (!isLoading && items.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-12 text-center">
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-6">
          Añade productos al carrito para poder finalizar la compra.
        </p>
        <Button asChild className="rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium">
          <Link href="/carrito">Ir al carrito</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        {/* Banner de envío gratuito */}
        <div className={`rounded-xl p-4 text-center ${hasFreeShipping
            ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
            : "bg-gradient-to-r from-[var(--gold)]/10 to-amber-500/10 border border-[var(--gold)]/20"
          }`}>
          {hasFreeShipping ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-green-500 font-semibold text-lg">¡ENVÍO GRATIS CONSEGUIDO!</p>
                <p className="text-sm text-muted-foreground">Tu pedido tiene envío gratuito estándar y express</p>
              </div>
              <span className="text-2xl">🎉</span>
            </div>
          ) : (
            <div>
              <p className="text-[var(--gold)] font-semibold text-lg">
                🚚 ENVÍO GRATIS en pedidos +150€
              </p>
              <p className="text-sm text-muted-foreground">
                Te faltan solo {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} para conseguirlo
              </p>
            </div>
          )}
        </div>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--gold)]" />
              Dirección de envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input
                  placeholder="Nombre"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Apellidos</Label>
                <Input
                  placeholder="Apellidos"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Dirección</Label>
              <Input
                placeholder="Calle, número, piso"
                className="bg-[var(--elevated)] border-[var(--border)]"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-400">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Complemento (opcional)</Label>
              <Input
                placeholder="Apartamento, suite, etc."
                className="bg-[var(--elevated)] border-[var(--border)]"
                {...register("address2")}
              />
            </div>

            {/* Campo de País con selector desplegable */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                País
              </Label>
              <select
                {...register("country")}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full rounded-lg bg-[var(--elevated)] border-[var(--border)] px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-sm text-red-400">{errors.country.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Ciudad</Label>
                <Input
                  placeholder="Ciudad"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-red-400">{errors.city.message}</p>
                )}
              </div>

              {/* Campo de Estado/Provincia obligatorio */}
              <div className="space-y-2">
                <Label className="text-foreground">Estado/Provincia *</Label>
                <Input
                  placeholder="Estado o provincia"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  {...register("state")}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedCountry.code === "US" ? "Ej: California, Texas" :
                    selectedCountry.code === "CA" ? "Ej: Ontario, Quebec" :
                      selectedCountry.code === "ES" ? "Ej: Madrid, Barcelona, Valencia" :
                        selectedCountry.code === "FR" ? "Ej: Île-de-France, Provence" :
                          selectedCountry.code === "DE" ? "Ej: Baviera, Berlín" :
                            selectedCountry.code === "IT" ? "Ej: Lombardía, Lazio" :
                              "Requerido para todos los países"}
                </p>
                {errors.state && (
                  <p className="text-sm text-red-400">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Código postal</Label>
                <Input
                  placeholder="Código postal"
                  className="bg-[var(--elevated)] border-[var(--border)]"
                  {...register("postalCode")}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-400">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Teléfono</Label>
              <PhoneInput
                value={watch("phone") || ""}
                onChange={(phone) => setValue("phone", phone)}
                selectedCountry={watch("country")}
                className="w-full"
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Email de contacto</Label>
              <Input
                type="email"
                placeholder="tu@email.com"
                className="bg-[var(--elevated)] border-[var(--border)]"
                {...register("email")}
              />
              <p className="text-xs text-muted-foreground">
                Para confirmaciones y seguimiento del pedido
              </p>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-[var(--gold)]" />
              Método de envío
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Envío estándar */}
            <label
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${shippingMethod === "standard"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
                }`}
            >
              <div className="flex-1">
                <span className="text-foreground font-medium block">
                  Envío estándar {hasFreeShipping && <span className="text-green-500 text-sm ml-2">GRATIS</span>}
                </span>
                <span className="text-sm text-muted-foreground">
                  {selectedCountry.code === "ES" || selectedCountry.code === "PT" ||
                    selectedCountry.code === "FR" || selectedCountry.code === "IT" ||
                    selectedCountry.code === "DE" ? "7-14 días" :
                    selectedCountry.code === "US" || selectedCountry.code === "CA" ? "10-20 días" :
                      "10-25 días"}
                </span>
                {hasFreeShipping && (
                  <p className="text-xs text-green-500 mt-1">¡Envío gratuito en pedidos +150€!</p>
                )}
              </div>
              <span className="text-[var(--gold)] font-semibold">
                {hasFreeShipping ? "GRATIS" : formatPrice(selectedCountry.shippingStandard)}
              </span>
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="sr-only"
              />
            </label>

            {/* Envío express */}
            <label
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${shippingMethod === "express"
                  ? "border-[var(--gold)] bg-[var(--gold)]/10"
                  : "border-[var(--border)] hover:border-[var(--muted)]"
                }`}
            >
              <div className="flex-1">
                <span className="text-foreground font-medium block">
                  Envío express {hasFreeShipping && <span className="text-green-500 text-sm ml-2">GRATIS</span>}
                </span>
                <span className="text-sm text-muted-foreground">
                  {selectedCountry.code === "ES" || selectedCountry.code === "PT" ||
                    selectedCountry.code === "FR" || selectedCountry.code === "IT" ||
                    selectedCountry.code === "DE" ? "4-7 días" :
                    selectedCountry.code === "US" || selectedCountry.code === "CA" ? "5-10 días" :
                      "5-12 días"}
                </span>
                {hasFreeShipping && (
                  <p className="text-xs text-green-500 mt-1">¡Envío express gratuito en pedidos +150€!</p>
                )}
              </div>
              <span className="text-[var(--gold)] font-semibold">
                {hasFreeShipping ? "GRATIS" : formatPrice(selectedCountry.shippingExpress)}
              </span>
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingMethod === "express"}
                onChange={() => setShippingMethod("express")}
                className="sr-only"
              />
            </label>

            {/* Información adicional y barra de progreso */}
            <div className="rounded-lg bg-[var(--elevated)] p-4 text-sm text-muted-foreground">
              {!hasFreeShipping && (
                <div className="space-y-3">
                  <div>
                    <p className="text-foreground font-medium mb-2">¡Aprovecha el envío gratuito!</p>
                    <p className="text-xs">Añade {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} más a tu carrito para obtener envío GRATIS</p>
                  </div>
                  <div className="w-full bg-[var(--border)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[var(--gold)] to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right">{formatPrice(subtotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
                </div>
              )}

              {hasFreeShipping && (
                <div className="flex items-center gap-2 text-green-500">
                  <span className="text-lg">🎉</span>
                  <span className="font-medium">¡Felicidades! Tienes envío GRATIS en este pedido</span>
                </div>
              )}

              <p className="mt-3 text-xs">
                Los tiempos de entrega son estimados y pueden variar según aduanas y logística local.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[var(--gold)]" />
              Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-[var(--border)] p-6 bg-[var(--elevated)] flex items-center gap-4">
              <Lock className="h-6 w-6 text-[var(--gold)] shrink-0" />
              <div>
                <p className="text-foreground font-medium">Pago seguro</p>
                <p className="text-sm text-muted-foreground">
                  Al confirmar serás redirigido a Stripe para pagar con tarjeta de forma segura (3D Secure, PCI compliant).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-28 rounded-2xl border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="text-foreground">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, i) => (
              <div
                key={item.id ?? i}
                className="flex justify-between text-sm py-2 border-b border-[var(--border)] last:border-0"
              >
                <span className="text-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                Envío {hasFreeShipping && <span className="text-green-500 text-sm">(GRATIS)</span>}
              </span>
              <span className={hasFreeShipping ? "text-green-500 font-medium" : ""}>
                {hasFreeShipping ? "GRATIS" : formatPrice(shippingCost)}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-4 flex justify-between text-lg font-semibold text-foreground">
              <span>Total</span>
              <span className="text-[var(--gold)]">
                {formatPrice(total)}
              </span>
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--gold-soft)] font-medium"
              size="lg"
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? "Procesando…" : "Continuar al pago"}
            </Button>
            <Button variant="outline" asChild className="w-full rounded-lg border-[var(--border)]">
              <Link href="/carrito">Volver al carrito</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
