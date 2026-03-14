# YaraLuxe — Tienda de Lujo para Dropshipping

Tienda online premium para dropshipping de perfumes, relojes, joyería y accesorios de lujo. Next.js 14, TypeScript, Tailwind, Prisma, Stripe.

## Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Radix UI
- **Backend**: Next.js API Routes, Prisma, PostgreSQL
- **Auth**: NextAuth.js (configurable)
- **Pagos**: Stripe
- **Email**: Resend (configurable)

## Requisitos

- Node.js 18+
- PostgreSQL (o Supabase)
- Cuenta Stripe (test/producción)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con DATABASE_URL, NEXTAUTH_*, STRIPE_*, etc.

# Generar cliente Prisma y aplicar schema
npx prisma generate
npx prisma db push

# (Opcional) Poblar datos de ejemplo
npm run db:seed

# Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura principal

- `src/app` — Rutas (home, productos, carrito, checkout, cuenta, admin)
- `src/components` — UI, layout, shop, home, auth, admin
- `src/lib` — Prisma, productos, utils, auth
- `prisma/schema.prisma` — Modelos (User, Product, Order, Category, etc.)

## Scripts

- `npm run dev` — Servidor de desarrollo
- `npm run build` — Build de producción
- `npm run start` — Servidor de producción
- `npm run db:push` — Aplicar schema a la BD
- `npm run db:seed` — Seed de categorías y productos de ejemplo

## Diseño

- Tema oscuro por defecto, paleta oro/negro/blanco
- Tipografía: Playfair Display (títulos), Montserrat (cuerpo)
- Componentes con glassmorphism y animaciones suaves (Framer Motion)

## Próximos pasos

1. Configurar NextAuth con proveedores (Google, email).
2. Conectar Stripe Checkout y webhooks.
3. Integrar API de dropshipping (AliExpress/CJDropshipping).
4. Configurar Resend para emails transaccionales.
5. Añadir panel admin completo (CRUD productos, pedidos, reportes).

---

**YaraLuxe** — Lujo redefinido.
