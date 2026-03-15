/**
 * Plantillas HTML premium para emails de Yara & Co.
 * Estilo: fondo oscuro, acentos champagne/dorado, tipografía elegante.
 * Compatible con clientes de correo (tablas e inline styles).
 */

const BRAND = "Yara & Co.";
const TAGLINE = "Lujo redefinido";
const GOLD = "#b8a88a";
const GOLD_SOFT = "#ddd4c4";
const INK = "#0a0a0a";
const PAPER = "#f5f2eb";
const MUTED = "#8a8580";
const BORDER = "1px solid rgba(184, 168, 138, 0.25)";

/** URL base del sitio para enlaces e imágenes en emails (logo). */
function getEmailBaseUrl(): string {
  const u = process.env.SITE_URL || process.env.NEXTAUTH_URL || "https://yaraandco.vercel.app";
  return u.replace(/\/$/, "");
}

function baseWrapper(content: string, preheader = ""): string {
  const baseUrl = getEmailBaseUrl();
  const logoUrl = `${baseUrl}/logo.png`;
  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>`
    : "";
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND}</title>
  <!--[if mso]>
  <noscript><meta http-equiv="X-UA-Compatible" content="IE=edge"></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Georgia,'Times New Roman',serif;">
  ${preheaderBlock}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#1a1a1a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
          <!-- Header con logo -->
          <tr>
            <td style="padding-bottom:32px;border-bottom:${BORDER};">
              <img src="${logoUrl}" alt="${BRAND}" width="160" height="64" style="display:block;max-width:160px;height:auto;margin:0 auto;" />
              <p style="margin:10px 0 0 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED};">
                ${TAGLINE}
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 0 32px 0;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;border-top:${BORDER};">
              <p style="margin:0;font-size:12px;color:${MUTED};letter-spacing:0.05em;">
                ${BRAND} · ${TAGLINE}
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:${MUTED};opacity:0.8;">
                Este correo se ha enviado porque así lo has solicitado o tienes relación con nuestra tienda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/** Email de verificación de cuenta */
export function verificationEmailHtml(params: {
  greeting: string;
  verifyUrl: string;
}): string {
  const content = `
    <p style="margin:0 0 24px 0;font-size:17px;line-height:1.6;color:${PAPER};">
      ${params.greeting},
    </p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:${PAPER};opacity:0.92;">
      Gracias por registrarte en ${BRAND}. Para activar tu cuenta y acceder a tu espacio personal, verifica tu correo haciendo clic en el botón siguiente.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
      <tr>
        <td style="border-radius:4px;background:linear-gradient(135deg,${GOLD} 0%,#9a8b6a 100%);">
          <a href="${params.verifyUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 32px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${INK};text-decoration:none;">
            Verificar mi correo
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:14px;color:${MUTED};">
      Si no has creado una cuenta con nosotros, puedes ignorar este correo con total seguridad.
    </p>
  `;
  return baseWrapper(content, "Verifica tu correo para activar tu cuenta en Yara & Co.");
}

/** Email de recuperación de contraseña */
export function passwordResetEmailHtml(params: {
  greeting: string;
  resetUrl: string;
}): string {
  const content = `
    <p style="margin:0 0 24px 0;font-size:17px;line-height:1.6;color:${PAPER};">
      ${params.greeting},
    </p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:${PAPER};opacity:0.92;">
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ${BRAND}.
      Si has sido tú, utiliza el botón siguiente para elegir una nueva contraseña de forma segura.
    </p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0;">
      <tr>
        <td style="border-radius:4px;background:linear-gradient(135deg,${GOLD} 0%,#9a8b6a 100%);">
          <a href="${params.resetUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:16px 32px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${INK};text-decoration:none;">
            Restablecer contraseña
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px 0;font-size:14px;color:${MUTED};">
      Por seguridad, este enlace caduca pasadas unas horas y solo puede usarse una vez.
    </p>
    <p style="margin:8px 0 0 0;font-size:13px;color:${MUTED};">
      Si no has solicitado este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.
    </p>
  `;
  return baseWrapper(content, "Restablece tu contraseña de acceso a Yara & Co.");
}

/** Email de confirmación de pedido */
export function orderConfirmationEmailHtml(params: {
  orderNumber: string;
  customerName?: string | null;
  total: string;
  currency: string;
  items: { name: string; quantity: number; price: string }[];
  shippingAddress?: { line1: string; city: string; zip: string; country: string } | null;
}): string {
  const greeting = params.customerName ? `Hola, ${params.customerName}` : "Hola";
  const itemsRows = params.items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:${BORDER};font-size:15px;color:${PAPER};">
        ${i.name} × ${i.quantity}
      </td>
      <td style="padding:12px 0;border-bottom:${BORDER};font-size:15px;color:${GOLD};text-align:right;white-space:nowrap;">
        ${i.price}
      </td>
    </tr>
  `
    )
    .join("");

  const addressBlock = params.shippingAddress
    ? `
    <p style="margin:24px 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">
      Dirección de envío
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${PAPER};opacity:0.9;">
      ${params.shippingAddress.line1}<br>
      ${params.shippingAddress.city} ${params.shippingAddress.zip}<br>
      ${params.shippingAddress.country}
    </p>
  `
    : "";

  const content = `
    <p style="margin:0 0 8px 0;font-size:17px;line-height:1.6;color:${PAPER};">
      ${greeting},
    </p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:${PAPER};opacity:0.92;">
      Gracias por tu compra. Tu pedido <strong style="color:${GOLD};">#${params.orderNumber}</strong> ha sido confirmado y estamos preparándolo con cuidado.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:${BORDER};border-radius:4px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">
            Resumen del pedido
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${itemsRows}
          </table>
          <p style="margin:20px 0 0 0;font-size:16px;font-weight:600;color:${GOLD};text-align:right;">
            Total: ${params.total} ${params.currency}
          </p>
        </td>
      </tr>
    </table>
    ${addressBlock}
    <p style="margin:28px 0 0 0;font-size:14px;color:${MUTED};">
      Recibirás un correo con el número de seguimiento cuando tu pedido haya sido enviado.
    </p>
  `;
  return baseWrapper(
    content,
    `Tu pedido #${params.orderNumber} está confirmado. Total: ${params.total} ${params.currency}`
  );
}

/** Email de contacto (para el equipo / admin) */
export function contactFormEmailHtml(params: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}): string {
  const content = `
    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">
      Nuevo mensaje de contacto
    </p>
    <p style="margin:0 0 24px 0;font-size:17px;color:${PAPER};">
      ${params.nombre} &lt;${params.email}&gt;
    </p>
    <p style="margin:0 0 8px 0;font-size:13px;color:${GOLD};">
      Asunto: ${params.asunto}
    </p>
    <div style="margin:24px 0;padding:20px;border:${BORDER};border-radius:4px;background:rgba(0,0,0,0.2);">
      <p style="margin:0;font-size:15px;line-height:1.7;color:${PAPER};opacity:0.95;white-space:pre-wrap;">${params.mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    </div>
    <p style="margin:0;font-size:13px;color:${MUTED};">
      Responde directamente a este correo para contestar al cliente.
    </p>
  `;
  return baseWrapper(content, `Contacto: ${params.asunto}`);
}

/** Respuesta automática al usuario que envió el formulario de contacto */
export function contactAutoReplyEmailHtml(params: { nombre: string }): string {
  const content = `
    <p style="margin:0 0 24px 0;font-size:17px;line-height:1.6;color:${PAPER};">
      ${params.nombre ? `Hola, ${params.nombre}.` : "Hola."}
    </p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:${PAPER};opacity:0.92;">
      Hemos recibido tu mensaje. Nuestro equipo te responderá en la mayor brevedad posible.
    </p>
    <p style="margin:0;font-size:14px;color:${MUTED};">
      Gracias por contactar con ${BRAND}.
    </p>
  `;
  return baseWrapper(content, "Hemos recibido tu mensaje");
}

/** Email cuando el pedido tiene número de seguimiento (enviado) */
export function trackingShippedEmailHtml(params: {
  orderNumber: string;
  customerName?: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}): string {
  const greeting = params.customerName ? `Hola, ${params.customerName}` : "Hola";
  const trackingBlock =
    params.trackingNumber || params.trackingUrl
      ? `
    <p style="margin:16px 0 8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">
      Seguimiento
    </p>
    <p style="margin:0 0 12px 0;font-size:15px;color:${PAPER};">
      ${params.trackingNumber ? `Número: <strong style="color:${GOLD};">${params.trackingNumber}</strong>` : ""}
    </p>
    ${
      params.trackingUrl
        ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0;">
      <tr>
        <td style="border-radius:4px;background:linear-gradient(135deg,${GOLD} 0%,#9a8b6a 100%);">
          <a href="${params.trackingUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:600;letter-spacing:0.08em;color:${INK};text-decoration:none;">
            Ver estado del envío
          </a>
        </td>
      </tr>
    </table>
    `
        : ""
    }
  `
      : "";

  const content = `
    <p style="margin:0 0 24px 0;font-size:17px;line-height:1.6;color:${PAPER};">
      ${greeting},
    </p>
    <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:${PAPER};opacity:0.92;">
      Tu pedido <strong style="color:${GOLD};">#${params.orderNumber}</strong> ya ha sido enviado.
    </p>
    ${trackingBlock}
    <p style="margin:24px 0 0 0;font-size:14px;color:${MUTED};">
      Gracias por confiar en ${BRAND}.
    </p>
  `;
  return baseWrapper(
    content,
    `Tu pedido #${params.orderNumber} ha sido enviado${params.trackingNumber ? `. Seguimiento: ${params.trackingNumber}` : ""}`
  );
}
