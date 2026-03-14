"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, User, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { Logo } from "@/components/layout/Logo";

const navLinks = [
  { href: "/productos", label: "Tienda" },
  { href: "/productos?categoria=perfumes", label: "Perfumes" },
  { href: "/productos?categoria=relojes", label: "Relojes" },
  { href: "/productos?categoria=joyeria", label: "Joyería" },
  { href: "/productos?categoria=accesorios", label: "Accesorios" },
];

export function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items: cartItems } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    if (q) router.push(`/productos?q=${encodeURIComponent(q)}`);
    else router.push("/productos");
  };

  const closeDropdown = () => setDropdownOpen(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        scrolled
          ? "glass-effect border-b border-[var(--gold)]/10"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-6 lg:px-12 h-20 lg:h-24 flex items-center justify-between">
        <Logo href="/" variant="header" className="flex items-center" />

        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-foreground/80 hover:text-foreground tracking-[0.08em] link-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            className="relative p-2.5 text-muted-foreground hover:text-gold transition-colors rounded-full hover:bg-[var(--gold)]/10"
            aria-label="Buscar"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className="h-4 w-4" />
          </motion.button>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/cuenta/wishlist"
              className="relative p-2.5 text-muted-foreground hover:text-gold transition-colors rounded-full hover:bg-[var(--gold)]/10 block"
              aria-label="Lista de deseos"
            >
              <Heart className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/carrito"
              className="relative p-2.5 text-muted-foreground hover:text-gold transition-colors rounded-full hover:bg-[var(--gold)]/10 block"
              aria-label="Carrito"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <motion.span
                  className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[var(--gold)] text-[var(--ink)] text-[10px] font-semibold flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </Link>
          </motion.div>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Cuenta"
              >
                <User className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-none border-[var(--border)] bg-[var(--card)]">
              <DropdownMenuItem asChild>
                <Link
                  href="/cuenta"
                  onClick={closeDropdown}
                  className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-sm outline-none focus:bg-[var(--elevated)] focus:text-[var(--foreground)]"
                >
                  Mi cuenta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/cuenta/pedidos"
                  onClick={closeDropdown}
                  className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-sm outline-none focus:bg-[var(--elevated)] focus:text-[var(--foreground)]"
                >
                  Mis pedidos
                </Link>
              </DropdownMenuItem>
              {status === "authenticated" ? (
                <DropdownMenuItem
                  onClick={() => { closeDropdown(); signOut({ callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/` : "/" }); }}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm outline-none focus:bg-[var(--elevated)] focus:text-[var(--foreground)]"
                >
                  Cerrar sesión
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link
                    href="/login"
                    onClick={closeDropdown}
                    className="block w-full cursor-pointer rounded-lg px-2 py-1.5 text-sm outline-none focus:bg-[var(--elevated)] focus:text-[var(--foreground)]"
                  >
                    Iniciar sesión
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className="lg:hidden p-2.5 text-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] bg-[var(--ink)]"
          >
            <form onSubmit={handleSearch} className="container mx-auto px-6 py-4">
              <Input
                type="search"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xl mx-auto rounded-none border-[var(--border)] bg-transparent focus-visible:ring-[var(--gold)]"
                autoFocus
              />
              <button type="submit" className="sr-only">
                Buscar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 glass-effect border-t border-[var(--gold)]/20"
          >
            <nav className="container mx-auto px-6 py-8 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className="block text-foreground/90 hover:text-[var(--gold)] text-sm tracking-wider uppercase py-2 transition-colors border-b border-[var(--border)]/30 hover:border-[var(--gold)]/30"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
              >
                <Link
                  href="/cuenta"
                  onClick={closeMobile}
                  className="block text-foreground/90 hover:text-[var(--gold)] text-sm tracking-wider uppercase py-2 transition-colors border-b border-[var(--border)]/30 hover:border-[var(--gold)]/30"
                >
                  Mi cuenta
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
