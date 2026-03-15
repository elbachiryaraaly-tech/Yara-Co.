"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Award, HeadphonesIcon } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

const pillars = [
  { icon: Award, label: "01", titleKey: "home.why.quality", descKey: "home.why.qualityDesc" },
  { icon: Truck, label: "02", titleKey: "home.why.shipping", descKey: "home.why.shippingDesc" },
  { icon: Shield, label: "03", titleKey: "home.why.warranty", descKey: "home.why.warrantyDesc" },
  { icon: HeadphonesIcon, label: "04", titleKey: "home.why.support", descKey: "home.why.supportDesc" },
];

export function WhyYaraCo() {
  const { t } = useLocale();
  return (
    <section className="relative py-24 lg:py-32 border-t border-[var(--gold)]/10 bg-gradient-to-b from-[var(--elevated)] to-[var(--ink)] overflow-hidden">
      {/* Orbes sutiles (como hero) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--gold)]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--gold)]/8 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--gold)]/10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          {pillars.map((item, i) => (
            <motion.div
              key={item.titleKey}
              className="group relative bg-[var(--ink)] p-10 lg:p-12 flex flex-col hover-lift perspective-3d"
              variants={{
                visible: { opacity: 1, y: 0, rotateX: 0 },
                hidden: { opacity: 0, y: 30, rotateX: -10 },
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ 
                y: -4,
                rotateY: 2,
                transition: { duration: 0.3 }
              }}
            >
              {/* Borde dorado en hover */}
              <motion.div
                className="absolute inset-0 border border-[var(--gold)]/0 pointer-events-none"
                whileHover={{ borderColor: "rgba(184, 168, 138, 0.3)" }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Número con efecto */}
              <motion.span 
                className="text-[var(--gold)]/60 font-display text-4xl lg:text-5xl font-bold tracking-tighter relative"
                whileHover={{ scale: 1.1, color: "var(--gold)" }}
                transition={{ duration: 0.3 }}
              >
                {item.label}
                <motion.span
                  className="absolute -top-2 -right-2 text-[var(--gold)]/20"
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦
                </motion.span>
              </motion.span>
              
              {/* Icono mejorado */}
              <motion.div 
                className="mt-6 mb-4 text-[var(--gold)] relative"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <item.icon className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={1.5} />
                {/* Efecto de brillo */}
                <motion.div
                  className="absolute inset-0 bg-[var(--gold)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              <h3 className="font-display text-lg lg:text-xl font-semibold text-[var(--foreground)] mb-3 group-hover:text-[var(--gold)] transition-colors duration-300">
                {t(item.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                {t(item.descKey)}
              </p>
              
              {/* Línea decorativa (hero style) */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
