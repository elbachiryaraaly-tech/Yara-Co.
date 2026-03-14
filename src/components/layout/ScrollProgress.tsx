"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[var(--ink)]/50">
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--gold)] via-[var(--gold-soft)] to-[var(--gold)] origin-left relative overflow-hidden"
        style={{ scaleX }}
      >
        {/* Efecto de brillo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            x: {
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
