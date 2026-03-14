# Dropshipping automático — Yara & Co.

**Antes de usar**: si acabas de actualizar el proyecto, ejecuta `npx prisma generate` y luego `npx prisma db push` (o `npx prisma migrate dev`) para aplicar los campos `code` y `baseUrl` en la tabla de proveedores.

Este documento explica cómo dejar **todo el dropshipping automático**: envío de pedidos al proveedor al confirmar la compra y cómo **conseguir y configurar las APIs** de los proveedores.

---

## Cómo funciona en la tienda

1. **Al confirmar un pedido** (checkout): si todos los productos del carrito son del **mismo proveedor** y ese proveedor tiene **API configurada** (API Key y, si aplica, código de adaptador), el sistema:
   - Crea el pedido en tu base de datos.
   - **Envía automáticamente** el pedido a la API del proveedor.
   - Guarda en el pedido: `providerOrderId`, y si el proveedor lo devuelve al momento: `trackingNumber` y `trackingUrl`.
   - Pasa el estado del pedido a **Procesando**.

2. **Sincronización de tracking**: muchos proveedores no devuelven el número de seguimiento al crear el pedido. Para actualizarlo después:
   - Hay una ruta interna que consulta el estado del pedido en el proveedor y actualiza `trackingNumber` / `trackingUrl` en tu BD.
   - Puedes llamarla con un **cron** (por ejemplo cada 1–2 horas). Ver más abajo.

3. **Sin API**: si un proveedor no tiene API Key configurada, el pedido se crea igual en tu tienda pero **no** se envía al proveedor; tendrás que crear el pedido en el panel del proveedor a mano (o configurar la API más adelante).

---

## Cómo conseguir las APIs de los proveedores

### CJDropshipping

- **Documentación**: [developers.cjdropshipping.com](https://developers.cjdropshipping.com) (también [developers.cjdropshipping.cn](https://developers.cjdropshipping.cn/en/api/)).
- **Dónde obtener la API Key**:
  1. Entra en tu cuenta: [cjdropshipping.com](https://www.cjdropshipping.com).
  2. Ve a **Mi CJ** → **API Key**: [cjdropshipping.com/myCJ.html#/apikey](https://www.cjdropshipping.com/myCJ.html#/apikey).
  3. Pulsa **Generate** para generar una API Key.
- **Formato**: suele ser algo como `CJUserNum@api@xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.
- **Qué configurar en Yara & Co.**:
  - En **Admin → Proveedores**, edita el proveedor “CJDropshipping” (o créalo).
  - **Código del adaptador**: `cj`.
  - **API Key**: la clave que generaste (solo necesitas esta; no hace falta API Secret para CJ).
  - **URL base** (opcional): por defecto se usa `https://developers.cjdropshipping.com/api2.0`. Solo cámbiala si CJ te indica otra.
- **Permisos**: al generar la API Key en CJ, asegúrate de tener permisos para crear pedidos y consultar pedidos/tracking (suelen venir por defecto).

---

### AliExpress (Open Platform / Dropshipping)

- **Documentación**: [AliExpress Open Platform](https://openservice.aliexpress.com/doc/api.htm). Algunas APIs de dropshipping pueden estar en transición; revisa la documentación actual.
- **Dónde obtener App Key y Secret**:
  1. Cuenta en [AliExpress](https://www.aliexpress.com).
  2. Entra en la consola de desarrollador: [console.aliexpress.com](https://console.aliexpress.com) (con la misma cuenta o la de AliExpress Portals).
  3. Acepta los términos de uso de la API.
  4. Completa el perfil de desarrollador (el email suele tener que coincidir con tu cuenta AliExpress).
  5. Crea una aplicación (“Create App”) y elige el tipo que corresponda (por ejemplo Affiliate API o Dropshipping, según lo que ofrezca la consola).
  6. En la app verás **App Key** y **App Secret**.
- **Qué configurar en Yara & Co.**:
  - En **Admin → Proveedores**, edita el proveedor “AliExpress” (o créalo).
  - **Código del adaptador**: `aliexpress`.
  - **API Key**: App Key de la aplicación.
  - **API Secret**: App Secret de la aplicación.
  - **URL base** (opcional): según la documentación que uses (ej. `https://api-sg.aliexpress.com/sync` u otra que indique AliExpress).

Nota: si la API de dropshipping de AliExpress ha cambiado o está deprecada, la consola y la documentación actual te dirán el flujo correcto (OAuth, otro endpoint, etc.). El adaptador en código está preparado para conectarse cuando tengas la API activa.

---

## Dónde se configuran las APIs en el proyecto

1. **Variables de entorno**  
   No es obligatorio guardar las claves en `.env`; en este proyecto se guardan en base de datos por proveedor.

2. **Panel Admin**  
   - **Admin → Proveedores**: listado de proveedores.  
   - **Editar** un proveedor (botón “Configurar” o similar): ahí se guardan:
     - **Nombre**: nombre visible (ej. “CJDropshipping”, “AliExpress”).
     - **Código**: `cj` o `aliexpress` para que el sistema use el adaptador correcto.
     - **API Key** (y **API Secret** si el proveedor lo pide).
     - **URL base** (opcional).
     - **Activo**: si está desactivado, no se enviarán pedidos a ese proveedor.

3. **Productos**  
   En **Admin → Productos** (crear/editar), cada producto puede tener:
   - **Proveedor**: el proveedor de dropshipping.
   - **ID de producto en el proveedor**: el ID que usa el proveedor para ese producto (obligatorio para que el pedido se envíe automáticamente).

---

## Sincronizar el tracking (cron)

Para pedidos que ya tienen `providerOrderId` pero aún no tienen `trackingNumber`, hay una ruta que consulta al proveedor y actualiza el seguimiento:

- **URL**: `GET /api/cron/sync-tracking`
- **Protección**: en el servidor se usa la variable de entorno `CRON_SECRET`. Debes enviarla en la petición:
  - Header: `Authorization: Bearer <CRON_SECRET>`
  - O query: `?secret=<CRON_SECRET>`
- **Configuración**:
  1. En tu `.env` (o en el panel de tu hosting) añade:  
     `CRON_SECRET=una_clave_larga_y_secreta`
  2. En tu hosting (Vercel Cron, cron de servidor, etc.) programa una llamada cada 1–2 horas, por ejemplo:
     - `https://tu-dominio.com/api/cron/sync-tracking`
     - Con header `Authorization: Bearer una_clave_larga_y_secreta`

Si `CRON_SECRET` no está definido, la ruta responde que no hay nada que ejecutar y no hace cambios.

---

## Resumen de pasos para ti

1. **Crear proveedores** en Admin → Proveedores (ej. “CJDropshipping”, “AliExpress”).
2. **Conseguir API Key** (y Secret si aplica) en la web de cada proveedor (enlaces arriba).
3. **Editar cada proveedor** en Admin y rellenar: código (`cj` / `aliexpress`), API Key, API Secret (si hace falta), URL base (si te la dan).
4. **Vincular productos**: en cada producto, elegir proveedor e **ID de producto en el proveedor**.
5. **Opcional**: configurar `CRON_SECRET` y el cron a `/api/cron/sync-tracking` para que el tracking se actualice solo.

Cuando todo esté configurado, los pedidos que sean 100% de un solo proveedor con API se enviarán solos al finalizar el checkout y, con el cron, el tracking se irá rellenando cuando el proveedor lo proporcione.
