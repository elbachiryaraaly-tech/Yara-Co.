"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: 2000, suffix: "+", label: "Clientes satisfechos", duration: 2 },
  { value: 24, suffix: "h", label: "Envío express disponible", duration: 1.5 },
  { value: 4.9, suffix: "", label: "Valoración media", duration: 1.5 },
  { value: 100, suffix: "%", label: "Productos auténticos", duration: 1.5 },
];

function AnimatedNumber({ 
  value, 
  suffix, 
  duration 
}: { 
  value: number; 
  suffix: string; 
  duration: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <span ref={ref} className="inline-block">
      {isInView ? (
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {value % 1 === 0 ? value.toLocaleString() : value.toFixed(1)}
          {suffix && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: duration * 0.7, duration: 0.3 }}
              className="text-[var(--gold)]"
            >
              {suffix}
            </motion.span>
          )}
        </motion.span>
      ) : (
        <span className="opacity-0">0{suffix}</span>
      )}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative border-y border-[var(--border)] bg-gradient-to-b from-[var(--card)] to-[var(--ink)] py-16 lg:py-20 overflow-hidden">
      {/* Efecto de fondo sutil */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[var(--gold)]/20 to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-[var(--gold)]/20 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-[var(--gold)]/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {},
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center lg:text-left relative group"
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 20 },
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05 }}
            >
              {/* Efecto de brillo en hover */}
              <motion.div
                className="absolute -inset-2 bg-[var(--gold)]/0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                whileHover={{ opacity: 0.3 }}
              />
              
              <div className="relative">
                <p className="text-stat flex items-baseline gap-1">
                  <AnimatedNumber 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    duration={stat.duration}
                  />
                </p>
                <motion.p 
                  className="mt-2 text-xs text-muted-foreground uppercase tracking-wider font-medium"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {stat.label}
                </motion.p>
              </div>
              
              {/* Línea decorativa */}
              <motion.div
                className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-[var(--gold)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
