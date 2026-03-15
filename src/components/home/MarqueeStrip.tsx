"use client";

import { motion } from "framer-motion";

const words = [
  "Perfumes",
  "Relojes",
  "Joyería",
  "Accesorios",
  "Lujo",
  "Exclusivo",
  "Auténtico",
  "Premium",
  "Élite",
  "Elegante",
];

function StripSegment({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="flex shrink-0 gap-12 lg:gap-20 pr-12 lg:pr-20">
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="font-display text-2xl lg:text-4xl font-bold text-[var(--foreground)]/12 hover:text-[var(--gold)]/40 uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-400"
          whileHover={{ scale: 1.1, color: "var(--gold)" }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <section className="relative border-y border-[var(--gold)]/10 py-8 lg:py-10 overflow-hidden bg-[var(--ink)]">
      {/* Fade en bordes para continuidad con hero */}
      <div className="absolute inset-y-0 left-0 w-24 lg:w-32 bg-gradient-to-r from-[var(--ink)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 lg:w-32 bg-gradient-to-l from-[var(--ink)] to-transparent z-10 pointer-events-none" />
      
      <div className="flex w-max">
        <motion.div
          className="flex"
          animate={{
            x: [0, -50 + "%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          <StripSegment />
          <StripSegment />
          <StripSegment />
        </motion.div>
      </div>
      
      {/* Segunda línea en dirección opuesta */}
      <div className="absolute top-1/2 left-0 w-full mt-8 flex w-max">
        <motion.div
          className="flex"
          animate={{
            x: [0, 50 + "%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 45,
              ease: "linear",
            },
          }}
        >
          <StripSegment reverse />
          <StripSegment reverse />
          <StripSegment reverse />
        </motion.div>
      </div>
    </section>
  );
}
