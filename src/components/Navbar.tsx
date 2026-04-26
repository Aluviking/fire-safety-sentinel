import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const navItems = [
  { label: "Inicio",          href: "#inicio" },
  { label: "Servicios",       href: "#servicios" },
  { label: "Formación",       href: "#programas" },
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
          ? "bg-[hsl(30_8%_5%/0.95)] backdrop-blur-2xl border-b border-[hsl(43_78%_50%/0.15)] shadow-xl shadow-black/40"
          : "bg-[hsl(30_8%_5%/0.6)] backdrop-blur-md"
      }`}
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between h-[64px] sm:h-[76px] lg:h-[84px]">

        {/* ── Logo ── */}
        <a href="#inicio" className="flex items-center gap-2 sm:gap-3 min-h-0 group shrink-0">
          <img
            src={sisoLogo}
            alt="SISO Logo"
            className="w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="leading-none min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display text-[22px] sm:text-[28px] lg:text-[32px] tracking-[0.1em] text-gradient-gold block leading-none">
                SISO
              </span>
              <span className="hidden sm:inline-block text-[9px] font-body font-bold text-[hsl(43_78%_50%/0.7)] tracking-[0.12em] uppercase border border-[hsl(43_78%_50%/0.3)] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                20 AÑOS
              </span>
            </div>
            <span className="hidden lg:block text-[11px] text-muted-foreground font-body tracking-[0.08em] uppercase mt-0.5 truncate max-w-[220px]">
              Asesoría &amp; Gestión Empresarial · 2006–2026
            </span>
          </div>
        </a>

        {/* ── Desktop nav ── */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-5 flex-1 justify-end ml-6">
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

          {/* Social icons */}
          <div className="flex items-center gap-1.5 border-l border-[hsl(43_78%_50%/0.2)] pl-4 shrink-0">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram SISO"
              className="w-8 h-8 rounded-lg border border-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.5)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all min-h-0"
            >
              <IconInstagram />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook SISO"
              className="w-8 h-8 rounded-lg border border-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.5)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all min-h-0"
            >
              <IconFacebook />
            </a>
          </div>

          <a
            href="#contacto"
            className="relative flex items-center gap-1.5 bg-gradient-fire text-primary-foreground px-4 xl:px-5 py-2 rounded-lg font-body font-bold text-[12px] xl:text-[13px] hover:opacity-90 active:scale-95 transition-all overflow-hidden btn-shimmer glow-gold-sm whitespace-nowrap min-h-0 shrink-0"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            Contáctenos
          </a>
        </div>

        {/* ── Mobile right side: social + hamburger ── */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hidden sm:flex w-9 h-9 rounded-lg border border-[hsl(43_78%_50%/0.2)] items-center justify-center text-muted-foreground hover:text-primary transition-all min-h-0"
          >
            <IconInstagram />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hidden sm:flex w-9 h-9 rounded-lg border border-[hsl(43_78%_50%/0.2)] items-center justify-center text-muted-foreground hover:text-primary transition-all min-h-0"
          >
            <IconFacebook />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl border border-[hsl(43_78%_50%/0.25)] hover:border-[hsl(43_78%_50%/0.5)] active:scale-95 flex items-center justify-center text-foreground transition-all touch-manipulation min-h-0"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
            <nav className="px-4 sm:px-6 py-3 flex flex-col gap-1 max-h-[80svh] overflow-y-auto">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-[15px] font-body text-muted-foreground hover:text-foreground hover:bg-[hsl(43_78%_50%/0.07)] active:bg-[hsl(43_78%_50%/0.12)] transition-all touch-manipulation min-h-0"
                >
                  {item.label}
                </a>
              ))}
              {/* Social media – mobile only */}
              <div className="sm:hidden flex items-center gap-3 px-4 py-2 border-t border-[hsl(43_78%_50%/0.08)] mt-1">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[14px] font-body text-muted-foreground hover:text-primary transition-colors min-h-0"
                >
                  <IconInstagram /> Instagram
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[14px] font-body text-muted-foreground hover:text-primary transition-colors min-h-0"
                >
                  <IconFacebook /> Facebook
                </a>
              </div>
              <a
                href="#contacto"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 bg-gradient-fire text-primary-foreground px-5 py-3 rounded-xl font-body font-bold text-[15px] active:opacity-80 transition-all touch-manipulation min-h-0"
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
