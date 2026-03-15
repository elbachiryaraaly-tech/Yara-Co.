"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";

const testimonialKeys = [
  { quoteKey: "home.testimonial1", authorKey: "home.testimonial1Author" },
  { quoteKey: "home.testimonial2", authorKey: "home.testimonial2Author" },
  { quoteKey: "home.testimonial3", authorKey: "home.testimonial3Author" },
];

export function Testimonials() {
  const { t } = useLocale();
  return (
    <section className="relative py-24 lg:py-32 border-t border-[var(--gold)]/10 bg-gradient-to-b from-[var(--ink)] to-[var(--elevated)] overflow-hidden">
      {/* Ambiente sutil (continuidad hero) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.span
              className="h-px w-8 bg-[var(--gold)]"
              initial={{ width: 0 }}
              whileInView={{ width: 32 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            Testimonios
          </motion.p>
          <motion.h2
            className="font-display text-display-sm text-[var(--foreground)] tracking-tighter mb-16 lg:mb-24"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Lo que dicen nuestros clientes
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {testimonialKeys.map((item, i) => (
            <motion.blockquote
              key={item.authorKey}
              className="group relative border-l-2 border-[var(--gold)]/25 hover:border-[var(--gold)]/70 pl-8 pr-4 py-4 transition-all duration-500 hover:bg-[var(--ink)]/40 rounded-r-sm"
              initial={{ opacity: 0, y: 30, x: -20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 8, scale: 1.02 }}
            >
              {/* Comillas decorativas */}
              <motion.div
                className="absolute -top-4 -left-2 text-6xl text-[var(--gold)]/10 font-display"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                &ldquo;
              </motion.div>
              
              <motion.p
                className="font-display text-xl lg:text-2xl text-[var(--foreground)] leading-snug italic mb-6 relative z-10"
                whileHover={{ color: "var(--gold)" }}
                transition={{ duration: 0.3 }}
              >
                {t(item.quoteKey)}
              </motion.p>
              
              <motion.footer
                className="text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <motion.span
                  className="text-[var(--gold)]"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  ✦
                </motion.span>
                {t(item.authorKey)}
              </motion.footer>
              
              {/* Línea decorativa inferior */}
              <motion.div
                className="absolute bottom-0 left-8 right-0 h-px bg-gradient-to-r from-[var(--gold)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
