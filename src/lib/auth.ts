import { getServerSession as getNextAuthServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ensureHttpForLocalhost } from "@/lib/get-base-url";

// Evitar que NextAuth redirija a https en localhost (ERR_SSL_PROTOCOL_ERROR)
if (typeof process.env.NEXTAUTH_URL === "string") {
  process.env.NEXTAUTH_URL = ensureHttpForLocalhost(process.env.NEXTAUTH_URL);
}

export const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user?.password) return null;
          const ok = await verifyPassword(credentials.password, user.password);
          if (!ok) return null;
          if (user.role === "CUSTOMER" && !user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? undefined;
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      const role = (user as unknown as { role?: string })?.role;
      if (role) token.role = role;
      return token;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getServerSession() {
  return getNextAuthServerSession(authOptions);
}
