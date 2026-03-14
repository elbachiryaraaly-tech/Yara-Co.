import { Resend } from "resend";
import {
  verificationEmailHtml,
  orderConfirmationEmailHtml,
  contactFormEmailHtml,
  contactAutoReplyEmailHtml,
  trackingShippedEmailHtml,
  passwordResetEmailHtml,
} from "./email-templates";

import { getAppBaseUrl } from "@/lib/get-base-url";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(params: {
  to: string;
  token: string;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada; correo de verificación no enviado.", params.to);
    return { ok: true };
  }
  const verifyUrl = `${getAppBaseUrl()}/verificar-email?token=${encodeURIComponent(params.token)}`;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const greeting = params.name ? `Hola, ${params.name}` : "Hola";

  try {
    await resend.emails.send({
      from: `Yara & Co. <${from}>`,
      to: [params.to],
      subject: "Verifica tu correo — Yara & Co.",
      html: verificationEmailHtml({ greeting, verifyUrl }),
      text: `${greeting},\n\nGracias por registrarte en Yara & Co. Verifica tu correo abriendo este enlace:\n${verifyUrl}\n\nSi no creaste una cuenta, ignora este correo.`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendVerificationEmail", e);
    return { ok: false, error: "Error al enviar el correo" };
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada; correo de recuperación no enviado.", params.to);
    return { ok: true };
  }
  const resetUrl = `${getAppBaseUrl()}/recuperar?token=${encodeURIComponent(params.token)}`;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const greeting = params.name ? `Hola, ${params.name}` : "Hola";

  try {
    await resend.emails.send({
      from: `Yara & Co. <${from}>`,
      to: [params.to],
      subject: "Restablece tu contraseña — Yara & Co.",
      html: passwordResetEmailHtml({ greeting, resetUrl }),
      text: `${greeting},\n\nHas solicitado restablecer tu contraseña en Yara & Co. Abre este enlace para elegir una nueva contraseña:\n${resetUrl}\n\nSi no has solicitado este cambio, puedes ignorar este correo.`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendPasswordResetEmail", e);
    return { ok: false, error: "Error al enviar el correo" };
  }
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  customerName?: string | null;
  total: number;
  currency: string;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress?: { address1: string; city: string; zip: string; country: string } | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn("RESEND_API_KEY no configurada; correo de confirmación de pedido no enviado.", params.to);
    return { ok: true };
  }
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const formatMoney = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: params.currency }).format(n);

  try {
    await resend.emails.send({
      from: `Yara & Co. <${from}>`,
      to: [params.to],
      subject: `Pedido #${params.orderNumber} confirmado — Yara & Co.`,
      html: orderConfirmationEmailHtml({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        total: formatMoney(params.total),
        currency: params.currency,
        items: params.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: formatMoney(i.price * i.quantity),
        })),
        shippingAddress: params.shippingAddress
          ? {
              line1: params.shippingAddress.address1,
              city: params.shippingAddress.city,
              zip: params.shippingAddress.zip,
              country: params.shippingAddress.country,
            }
          : null,
      }),
      text: `Tu pedido #${params.orderNumber} ha sido confirmado. Total: ${formatMoney(params.total)}. Gracias por tu compra.`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendOrderConfirmationEmail", e);
    return { ok: false, error: "Error al enviar el correo" };
  }
}

export async function sendContactFormEmail(params: {
  to: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: true };
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  try {
    await resend.emails.send({
      from: `Yara & Co. Contacto <${from}>`,
      to: [params.to],
      replyTo: params.email,
      subject: `[Contacto] ${params.asunto}`,
      html: contactFormEmailHtml({
        nombre: params.nombre,
        email: params.email,
        asunto: params.asunto,
        mensaje: params.mensaje,
      }),
      text: `Nombre: ${params.nombre}\nEmail: ${params.email}\nAsunto: ${params.asunto}\n\n${params.mensaje}`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendContactFormEmail", e);
    return { ok: false, error: "Error al enviar" };
  }
}

export async function sendContactAutoReply(params: {
  to: string;
  nombre: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: true };
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  try {
    await resend.emails.send({
      from: `Yara & Co. <${from}>`,
      to: [params.to],
      subject: "Hemos recibido tu mensaje — Yara & Co.",
      html: contactAutoReplyEmailHtml({ nombre: params.nombre }),
      text: `Hola${params.nombre ? `, ${params.nombre}` : ""}. Hemos recibido tu mensaje. Te responderemos pronto.`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendContactAutoReply", e);
    return { ok: false };
  }
}

/** Notifica al cliente que su pedido tiene tracking (enviado). */
export async function sendTrackingShippedEmail(params: {
  to: string;
  orderNumber: string;
  customerName?: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: true };
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  try {
    await resend.emails.send({
      from: `Yara & Co. <${from}>`,
      to: [params.to],
      subject: `Tu pedido #${params.orderNumber} ha sido enviado — Yara & Co.`,
      html: trackingShippedEmailHtml({
        orderNumber: params.orderNumber,
        customerName: params.customerName,
        trackingNumber: params.trackingNumber,
        trackingUrl: params.trackingUrl,
      }),
      text: `Tu pedido #${params.orderNumber} ha sido enviado.${params.trackingNumber ? ` Número de seguimiento: ${params.trackingNumber}` : ""}${params.trackingUrl ? ` Rastrear: ${params.trackingUrl}` : ""}`,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendTrackingShippedEmail", e);
    return { ok: false, error: "Error al enviar" };
  }
}
