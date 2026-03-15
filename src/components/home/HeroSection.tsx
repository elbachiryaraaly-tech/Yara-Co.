"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const SLIDE_DURATION_MS = 5000;

// Rutas por defecto para despliegue (sin env vars): public/videos/slideN.mp4
const DEFAULT_HERO_VIDEOS = ["/videos/slide1.mp4", "/videos/slide2.mp4", "/videos/slide3.mp4", "/videos/slide4.mp4"];

function getHeroSlides() {
  const raw = [
    process.env.NEXT_PUBLIC_HERO_VIDEO_1 ?? process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? DEFAULT_HERO_VIDEOS[0],
    process.env.NEXT_PUBLIC_HERO_VIDEO_2 ?? DEFAULT_HERO_VIDEOS[1],
    process.env.NEXT_PUBLIC_HERO_VIDEO_3 ?? DEFAULT_HERO_VIDEOS[2],
    process.env.NEXT_PUBLIC_HERO_VIDEO_4 ?? DEFAULT_HERO_VIDEOS[3],
  ].filter(Boolean);
  return raw.length > 0 ? raw.map((video) => ({ video })) : [{ video: "" }];
}

export function HeroSection() {
  const { t } = useLocale();
  const SLIDES = useMemo(() => getHeroSlides(), []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const activeIndex = SLIDES.length > 0 ? currentSlide % SLIDES.length : 0;

  // Avanzar cada 5 segundos
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(t);
  }, [SLIDES.length]);

  // Al cambiar de slide, reproducir el video activo y pausar el resto (rAF para que el ref del 4.º esté asignado)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const activeVideo = videoRefs.current[activeIndex];
      if (activeVideo) {
        activeVideo.currentTime = 0;
        activeVideo.play().catch(() => {});
      }
      videoRefs.current.forEach((el, i) => {
        if (el && i !== activeIndex) el.pause();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [activeIndex]);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden grain">
      {/* Slider de clips: cada slide es un video de 5s */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait" initial={false}>
          {SLIDES.map((slide, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ pointerEvents: isActive ? "auto" : "none" }}
              >
                {slide.video ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[i] = el;
                    }}
                    autoPlay={isActive}
                    muted
                    playsInline
                    loop
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                    src={slide.video}
                  />
                ) : (
                  <div
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      background:
                        "radial-gradient(ellipse 100% 80% at 60% 30%, rgba(184, 168, 138, 0.18) 0%, transparent 50%), radial-gradient(ellipse 120% 120% at 50% 100%, rgba(0,0,0,0.7) 0%, transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #1a1816 100%)",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-[var(--ink)]/70 z-[1]" />
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ opacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.5) 45%, rgba(8,8,8,0.2) 70%, transparent 100%), radial-gradient(ellipse 120% 100% at 50% 100%, rgba(0,0,0,0.85) 0%, transparent 55%)",
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 55% 35%, rgba(184, 168, 138, 0.12) 0%, transparent 45%)",
          }}
          animate={{
            opacity: [0.8, 1.2, 0.8],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Degradado inferior: por ENCIMA de vídeos y overlay para transición suave a la siguiente sección */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[4] pointer-events-none"
        style={{
          height: "38%",
          minHeight: "280px",
          background: "linear-gradient(to top, rgb(8,8,8) 0%, rgb(8,8,8) 15%, rgba(8,8,8,0.98) 32%, rgba(8,8,8,0.75) 52%, rgba(8,8,8,0.35) 75%, transparent 100%)",
          transform: "translateZ(0)",
        }}
        aria-hidden
      />

      {/* Orbes decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full border border-[var(--gold)]/12"
          style={{ top: "5%", right: "-15%" }}
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.15, 0.25, 0.15],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-[var(--gold)]/6 blur-2xl"
          style={{ bottom: "20%", left: "-5%" }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Contenido principal */}
      <motion.div
        className="container relative z-10 mx-auto px-6 lg:px-12"
        style={{ opacity }}
      >
        <div className="min-h-[100vh] py-32 flex flex-col justify-center max-w-2xl">
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
            <motion.p className="text-[var(--gold)] text-sm uppercase tracking-[0.25em] font-body font-medium">
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
            className="font-display font-bold tracking-tighter text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
            style={{
              fontSize: "clamp(3.5rem, 11vw, 8.5rem)",
              lineHeight: 0.92,
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
              {t("home.hero.title1")}
            </motion.span>
            <motion.span
              className={cn("block text-gradient-gold text-gradient-gold-animate relative")}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              {t("home.hero.title2")}
              <motion.span
                className="absolute -right-4 top-0 text-[var(--gold)]/20"
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✦
              </motion.span>
            </motion.span>
          </motion.h1>

          <motion.p
            className="mt-10 text-lg lg:text-xl text-foreground/85 max-w-md font-body font-light leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {t("home.hero.subtitle")}
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
              <span className="relative z-10">{t("home.hero.cta")}</span>
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
            className="mt-24 pt-10 border-t border-[var(--gold)]/15 flex flex-wrap gap-x-10 gap-y-2 text-xs text-foreground/55 uppercase tracking-[0.18em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {[t("home.hero.badge1"), t("home.hero.badge2"), t("home.hero.badge3")].map((text, i) => (
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
      </motion.div>

      {/* Indicador de slides (dots) y scroll: alineados, mismo lenguaje visual */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center gap-6 pb-10">
        {SLIDES.length > 1 && (
          <div className="flex items-center gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className="group p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <motion.div
                  className={cn(
                    "h-0.5 rounded-full transition-all duration-300",
                    i === activeIndex
                      ? "w-7 bg-[var(--gold)]"
                      : "w-1.5 bg-[var(--gold)]/35 group-hover:bg-[var(--gold)]/55"
                  )}
                  animate={i === activeIndex ? { scaleX: [1, 1.03, 1] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </button>
            ))}
          </div>
        )}
        <motion.div
          className="flex flex-col items-center gap-1.5"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-10 w-px bg-gradient-to-b from-[var(--gold)]/50 to-transparent rounded-full" />
          <motion.div
            className="w-1 h-1 rounded-full bg-[var(--gold)]/80"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </section>
  );
}
