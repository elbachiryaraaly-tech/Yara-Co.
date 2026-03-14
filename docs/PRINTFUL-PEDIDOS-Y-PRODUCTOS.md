# Printful: pedidos, tracking e importar productos

## Cómo funcionan los pedidos (no se “importan”)

En YaraLuxe **los pedidos no se importan desde Printful**. El flujo es al revés:

1. **El cliente compra en tu tienda** (YaraLuxe) y paga (Stripe).
2. **Se crea el pedido en tu base de datos** con estado PAID.
3. **Tu app envía ese pedido a Printful** por API (envío automático tras el pago o al procesar el pedido).
4. Printful fabrica y envía; tú puedes **sincronizar el tracking** de vuelta a YaraLuxe.

No hace falta “importar pedidos” desde Printful: todos los pedidos nacen en tu tienda y tú los envías a Printful.

---

## Qué tienes que hacer tú

### 1. Productos con variant_id de Printful

Cada producto que quieras que se envíe a Printful debe:

- Tener **Proveedor = Printful** (en Admin → Productos → editar producto).
- En **cada variante**, rellenar el **ID de variante** (o el campo que guarde `providerVariantId`) con el **variant_id numérico** del catálogo de Printful.

Cómo obtener el variant_id en Printful:

- En el [Dashboard de Printful](https://www.printful.com/dashboard/) → Productos → elegir producto → pestaña de variantes, o
- Usar la API: `GET https://api.printful.com/products` y `GET https://api.printful.com/products/variant/{id}` (con tu Private Token en `Authorization: Bearer ...`).

### 2. Envío del pedido a Printful

- **Automático:** Tras el pago con Stripe, el checkout llama a `submitOrderToProvider` y se envía el pedido a Printful si todos los ítems son de ese proveedor.
- **Manual:** Admin → Pedidos → abrir el pedido → botón **Reenviar a proveedor** (o “Reintentar dropshipping”) para volver a intentar el envío.

### 3. Reintentos automáticos (cron)

Si un pedido queda en PAID y sin `providerOrderId`, el cron de **reintento de dropshipping** lo vuelve a intentar:

- Configura un cron (o Vercel Cron) que llame a `GET /api/cron/run` (o solo `/api/cron/retry-dropshipping`) con `Authorization: Bearer <CRON_SECRET>` o `?secret=<CRON_SECRET>`.
- Variable de entorno: `CRON_SECRET` en `.env`.

### 4. Sincronizar tracking (Printful → YaraLuxe)

Cuando Printful envíe el paquete, puedes actualizar el número de seguimiento en YaraLuxe:

- **Automático:** El mismo cron `/api/cron/run` incluye la tarea **sync-tracking**: consulta a cada proveedor (incluido Printful) por los pedidos con `providerOrderId` y sin tracking, y actualiza `trackingNumber` / `trackingUrl` y marca el pedido como SHIPPED.
- Para Printful se usa el **Access Token** (no API Key); ya está soportado en `cron-tasks.ts`.

---

## Resumen rápido

| Acción | Dónde |
|--------|--------|
| Crear pedidos | Se crean solos cuando el cliente paga en tu tienda |
| Enviar pedidos a Printful | Automático al pagar o manual en Admin → Pedidos → Reenviar a proveedor |
| Reintentar envíos fallidos | Cron a `/api/cron/retry-dropshipping` o `/api/cron/run` |
| Actualizar tracking | Cron a `/api/cron/run` (incluye sync-tracking para Printful) |
| Añadir productos de Printful | Crear producto en Admin asignado a Printful y poner el variant_id en cada variante |

---

## Importar productos desde Printful (catálogo)

Hoy **no hay** un botón “Importar desde Printful” como el de CJ. Opciones:

1. **Manual:** En Printful ves el producto y su variant_id; en YaraLuxe creas el producto, asignas proveedor Printful y pegas el variant_id en la variante.
2. **Futuro:** Se podría añadir una ruta tipo `/api/admin/products/import/printful` y un botón en Admin → Productos que liste productos/variantes de la API de Printful y cree el producto en YaraLuxe con el variant_id ya rellenado (similar a la importación de CJ).

Si quieres que implementemos la importación de productos desde Printful, dilo y se puede diseñar el flujo y la API.
