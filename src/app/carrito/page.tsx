import { CartContent } from "@/components/shop/CartContent";

export default function CarritoPage() {
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))]">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="mb-10">
          <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-2">
            Tu compra
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-tight">
            Carrito
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Revisa tu selección y continúa al checkout cuando estés listo.
          </p>
        </div>
        <CartContent />
      </div>
    </div>
  );
}
