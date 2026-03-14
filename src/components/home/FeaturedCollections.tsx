"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const DEFAULT_COLLECTIONS = [
  { href: "/productos?categoria=perfumes", title: "Perfumes", subtitle: "Fragancias exclusivas", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80" },
  { href: "/productos?categoria=relojes", title: "Relojes", subtitle: "Tiempo de lujo", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80" },
  { href: "/productos?categoria=joyeria", title: "Joyería", subtitle: "Brillo eterno", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" },
  { href: "/productos?categoria=accesorios", title: "Accesorios", subtitle: "Detalles que marcan", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80" },
];

type Collection = { href: string; title: string; subtitle: string; image: string };

export function FeaturedCollections({ collections = DEFAULT_COLLECTIONS }: { collections?: Collection[] }) {
  const list = collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
  return (
    <section className="py-24 lg:py-32 border-t border-[var(--border)]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="mb-16 lg:mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[var(--gold)] text-sm uppercase tracking-[0.2em] mb-3">
            Categorías
          </p>
          <h2 className="font-display text-display-sm text-[var(--foreground)] tracking-tighter">
            Colecciones
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
          {list.map((col, i) => (
            <motion.div
              key={col.href}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={col.href}
                className="group block relative aspect-[3/4] overflow-hidden bg-[var(--card)]"
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-800 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/95 via-[var(--ink)]/30 to-transparent transition-opacity duration-500 group-hover:from-[var(--ink)]/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-[var(--gold)] text-xs uppercase tracking-[0.2em] mb-1">
                    {col.subtitle}
                  </span>
                  <span className="font-display text-2xl font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                    {col.title}
                  </span>
                  <span className="mt-2 text-foreground/60 text-sm group-hover:text-foreground/90 transition-colors">
                    Ver colección →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
