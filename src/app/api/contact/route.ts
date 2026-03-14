import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactFormEmail, sendContactAutoReply } from "@/lib/email";

const bodySchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email no válido"),
  asunto: z.string().min(2, "Asunto requerido"),
  mensaje: z.string().min(10, "Mensaje demasiado corto"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, asunto, mensaje } = bodySchema.parse(body);

    const to = process.env.CONTACT_EMAIL ?? "contacto@yaraandco.com";

    await sendContactFormEmail({
      to,
      nombre,
      email,
      asunto,
      mensaje,
    });

    await sendContactAutoReply({ to: email, nombre });

    return NextResponse.json({ ok: true, message: "Mensaje enviado correctamente. Te contestaremos pronto." });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.errors.map((x) => x.message).join(". ") },
        { status: 400 }
      );
    }
    console.error("POST /api/contact", e);
    return NextResponse.json(
      { error: "Error al enviar el mensaje. Inténtalo de nuevo o escribe a contacto@yaraandco.com." },
      { status: 500 }
    );
  }
}
