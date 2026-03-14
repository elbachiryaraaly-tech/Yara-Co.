"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

// Pega aquí la URL de tu video o usa NEXT_PUBLIC_HERO_VIDEO_URL en .env.local
const HERO_VIDEO_SRC = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? "";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden grain">
      {/* Video de fondo (opcional) */}
      {HERO_VIDEO_SRC && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-110"
            src={HERO_VIDEO_SRC}
          />
        </motion.div>
      )}
      {/* Fondo sólido + overlay mejorado */}
      <div className="absolute inset-0 bg-[var(--ink)] z-[1]" />
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ opacity }}
      >
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: HERO_VIDEO_SRC
              ? "linear-gradient(135deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.6) 40%, rgba(8,8,8,0.3) 70%, transparent 100%), radial-gradient(ellipse 120% 100% at 50% 100%, rgba(0,0,0,0.8) 0%, transparent 60%)"
              : "radial-gradient(ellipse 100% 80% at 60% 30%, rgba(184, 168, 138, 0.12) 0%, transparent 50%), radial-gradient(ellipse 120% 120% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 50%), linear-gradient(135deg, rgba(8,8,8,0.4) 0%, transparent 50%)",
          }}
        />
        {/* Efecto de luz dorada animada */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 60% 30%, rgba(184, 168, 138, 0.15) 0%, transparent 50%)",
          }}
          animate={{
            background: [
              "radial-gradient(circle at 60% 30%, rgba(184, 168, 138, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 65% 35%, rgba(184, 168, 138, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 30%, rgba(184, 168, 138, 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Floating orbs mejorados con más profundidad */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full border border-[var(--gold)]/15"
          style={{ top: "5%", right: "-15%" }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-[var(--gold)]/8 blur-xl"
          style={{ bottom: "15%", left: "-8%" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full border border-[var(--gold)]/10"
          style={{ top: "50%", right: "10%" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Partículas de brillo sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[var(--gold)] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="container relative z-10 mx-auto px-6 lg:px-12"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center min-h-[100vh] py-32">
          {/* Copy mejorado */}
          <div className="lg:col-span-7 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-8"
            >
              <motion.div
                className="h-px w-12 bg-[var(--gold)]"
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
              <motion.p
                className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] font-body font-medium"
              >
                Colección 2025
              </motion.p>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-[var(--gold)]/30"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="font-display font-bold tracking-tighter text-foreground"
              style={{
                fontSize: "clamp(3.5rem, 11vw, 9rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Lujo
              </motion.span>
              <motion.span
                className={cn(
                  "block text-gradient-gold text-gradient-gold-animate relative"
                )}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                Redefinido
                <motion.span
                  className="absolute -right-4 top-0 text-[var(--gold)]/20"
                  animate={{
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦
                </motion.span>
              </motion.span>
            </motion.h1>

            <motion.p
              className="mt-10 text-lg lg:text-xl text-foreground/80 max-w-md font-body font-light leading-relaxed"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Perfumes, relojes y joyería de élite. Envío gratis y autenticidad garantizada.
            </motion.p>

            <motion.div
              className="mt-14 flex flex-wrap items-center gap-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              <Link
                href="/productos"
                className="group relative inline-flex items-center gap-3 text-foreground font-medium rounded-full border border-[var(--paper)]/30 px-8 py-4 overflow-hidden hover:border-[var(--gold)] transition-all duration-500"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/20 to-[var(--gold)]/10"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10">Explorar colección</span>
                <motion.span
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--paper)]/10 group-hover:bg-[var(--gold)]/20 transition-all duration-300"
                  whileHover={{ rotate: 45 }}
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.span>
              </Link>
              <Link
                href="/productos?destacados=1"
                className="text-foreground/60 hover:text-[var(--gold)] text-sm uppercase tracking-widest transition-all duration-300 relative group"
              >
                Ver destacados
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--gold)] transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>

            <motion.div
              className="mt-24 pt-10 border-t border-[var(--border)] flex flex-wrap gap-x-10 gap-y-2 text-xs text-foreground/50 uppercase tracking-[0.15em]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {["Envío gratis +50€", "Garantía 2 años", "Pago seguro"].map((text, i) => (
                <motion.span
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[var(--gold)]">✦</span>
                  {text}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Hero image - editorial mejorado */}
          <motion.div
            className="hidden lg:block lg:col-span-5 relative perspective-3d"
            initial={{ opacity: 0, x: 40, rotateY: -15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative aspect-[4/5] overflow-hidden rounded-sm transform-3d hover-lift"
              whileHover={{ rotateY: 2, rotateX: 2 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=85"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 0vw, 40vw"
                priority
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/60 via-[var(--ink)]/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              />
              {/* Efecto de brillo sutil */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--gold)]/5 to-transparent"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-6 left-6 right-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <p className="font-display text-xl lg:text-2xl text-foreground mb-3">
                  Fragancias que definen momentos
                </p>
                <Link
                  href="/productos?categoria=perfumes"
                  className="group inline-flex items-center gap-2 text-[var(--gold)] text-sm uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  <span>Descubrir</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
              {/* Borde dorado sutil en hover */}
              <motion.div
                className="absolute inset-0 border border-[var(--gold)]/0 pointer-events-none"
                whileHover={{ borderColor: "rgba(184, 168, 138, 0.3)" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator mejorado */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-[1px] bg-gradient-to-b from-[var(--gold)]/40 to-transparent rounded-full" />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
