import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const navItems = [
  { label: "Inicio",          href: "#inicio" },
  { label: "Servicios",       href: "#servicios" },
  { label: "Programas",       href: "#programas" },
  { label: "Auditorías",      href: "#auditorias" },
  { label: "Certificaciones", href: "#certificaciones" },
  { label: "Testimonios",     href: "#testimonios" },
  { label: "Contacto",        href: "#contacto" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-[hsl(30_8%_5%/0.92)] backdrop-blur-2xl border-b border-[hsl(43_78%_50%/0.1)] shadow-xl shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[68px] sm:h-[76px]">

        {/* ── Logo ── */}
        <a href="#inicio" className="flex items-center gap-2 sm:gap-3 min-h-0 group">
          <img
            src={sisoLogo}
            alt="SISO Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="leading-none min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display text-[20px] sm:text-[24px] tracking-[0.1em] text-gradient-gold block leading-none">
                SISO
              </span>
              <span className="hidden xs:inline-block text-[8px] sm:text-[9px] font-body font-bold text-[hsl(43_78%_50%/0.7)] tracking-[0.12em] uppercase border border-[hsl(43_78%_50%/0.3)] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                20 AÑOS
              </span>
            </div>
            <span className="hidden md:block text-[9px] text-muted-foreground font-body tracking-[0.1em] uppercase mt-0.5 truncate">
              Asesoría &amp; Gestión Empresarial · 2006–2026
            </span>
          </div>
        </a>

        {/* ── Desktop nav ── */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[12px] xl:text-[13px] font-body font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group py-1 min-h-0 whitespace-nowrap"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300 ease-out" />
            </a>
          ))}
          <a
            href="#contacto"
            className="relative flex items-center gap-2 bg-gradient-fire text-primary-foreground px-4 xl:px-5 py-2 rounded-lg font-body font-bold text-[12px] xl:text-[13px] hover:opacity-90 active:scale-95 transition-all overflow-hidden btn-shimmer glow-gold-sm whitespace-nowrap min-h-0"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            Contáctenos
          </a>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-11 h-11 rounded-xl border border-[hsl(43_78%_50%/0.25)] hover:border-[hsl(43_78%_50%/0.5)] active:scale-95 flex items-center justify-center text-foreground transition-all touch-manipulation shrink-0"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="lg:hidden bg-[hsl(30_8%_5%/0.98)] backdrop-blur-2xl border-b border-[hsl(43_78%_50%/0.1)] overflow-hidden"
          >
            <nav className="px-4 sm:px-6 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3.5 rounded-xl text-[15px] font-body text-muted-foreground hover:text-foreground hover:bg-[hsl(43_78%_50%/0.07)] active:bg-[hsl(43_78%_50%/0.12)] transition-all touch-manipulation min-h-0"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 bg-gradient-fire text-primary-foreground px-5 py-3.5 rounded-xl font-body font-bold text-sm active:opacity-80 transition-all touch-manipulation min-h-0"
              >
                <Phone className="w-4 h-4 shrink-0" />
                Contáctenos
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
