import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown, Building2, GraduationCap } from "lucide-react";
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
  {
    label: "ASESORÍA",
    href: "#servicios",
    subitems: [
      { label: "Sistema Integrados de Gestión", href: "#servicios" },
    ],
  },
  {
    label: "CONSULTORÍA",
    href: "#servicios",
    subitems: [
      { label: "Gestión en Salud", href: "#servicios" },
      { label: "Gestión del Riesgo", href: "#servicios" },
      { label: "Gestión de Amenazas", href: "#servicios" },
    ],
  },
  {
    label: "AUDITORÍA",
    href: "#auditorias",
    subitems: [
      { label: "Auditorías Internas y Externas de Seguridad", href: "#auditorias" },
    ],
  },
  {
    label: "FORMACIÓN",
    href: "#programas",
    subitems: [
      { label: "Cursos", href: "#programas" },
      { label: "Diplomados", href: "#programas" },
      { label: "Seminarios", href: "#programas" },
    ],
  },
  {
    label: "BIENESTAR",
    href: "#servicios",
    subitems: [
      { label: "Empresarial", href: "#servicios" },
    ],
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-[hsl(30_8%_5%/0.97)] backdrop-blur-2xl border-b border-[hsl(43_78%_50%/0.18)] shadow-xl shadow-black/50"
          : "bg-[hsl(30_8%_5%/0.7)] backdrop-blur-md"
      }`}
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between h-[64px] sm:h-[72px] lg:h-[80px]">

        {/* ── Logo ── */}
        <a href="#inicio" className="flex items-center gap-2 sm:gap-3 min-h-0 group shrink-0">
          <img
            src={sisoLogo}
            alt="SISO Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="leading-none min-w-0">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display text-[20px] sm:text-[26px] lg:text-[30px] tracking-[0.1em] text-gradient-gold block leading-none">
                SISO
              </span>
              <span className="hidden sm:inline-block text-[9px] font-body font-bold text-[hsl(43_78%_50%/0.7)] tracking-[0.12em] uppercase border border-[hsl(43_78%_50%/0.3)] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                20 AÑOS
              </span>
            </div>
            <span className="hidden xl:block text-[10px] text-muted-foreground font-body tracking-[0.08em] uppercase mt-0.5 truncate max-w-[200px]">
              Asesoría &amp; Gestión · 2006–2026
            </span>
          </div>
        </a>

        {/* ── Desktop nav ── */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-1 justify-center mx-4">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <motion.a
                href={item.href}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
                className="flex items-center gap-1 px-3 xl:px-4 py-2.5 font-display text-[12px] xl:text-[13px] tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors duration-150 whitespace-nowrap"
              >
                {item.label}
                <ChevronDown
                  className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                    activeDropdown === item.label ? "rotate-180 text-primary" : "text-muted-foreground/60"
                  }`}
                />
              </motion.a>

              {/* ── Dropdown ── */}
              <AnimatePresence>
                {activeDropdown === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 3, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[230px] bg-[#0d0d0d] border border-[hsl(43_78%_50%/0.22)] rounded-2xl shadow-2xl shadow-black/70 overflow-hidden"
                  >
                    {/* Gold top accent line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.6)] to-transparent" />
                    {item.subitems.map((sub, idx) => (
                      <a
                        key={idx}
                        href={sub.href}
                        className="flex items-center gap-3 px-4 py-3 text-[12px] font-body text-muted-foreground hover:text-primary hover:bg-[hsl(43_78%_50%/0.07)] transition-all duration-150 border-b border-[hsl(43_78%_50%/0.07)] last:border-0"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(43_78%_50%/0.5)] shrink-0 group-hover:bg-primary" />
                        {sub.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── Portal Empresarial + Campus (xl+) ── */}
        <div className="hidden xl:flex items-center gap-1.5 border-l border-[hsl(43_78%_50%/0.2)] pl-3 shrink-0">
          <a
            href="#portal"
            className="flex items-center gap-1.5 bg-[hsl(43_78%_50%)] text-black px-3 py-1.5 rounded-lg font-body font-bold text-[11px] hover:bg-[hsl(43_78%_57%)] active:scale-95 transition-all shadow-[0_2px_12px_hsl(43_78%_50%/0.4)] whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            Portal Empresarial
          </a>
          <a
            href="#campus"
            className="flex items-center gap-1.5 bg-[hsl(43_78%_50%)] text-black px-3 py-1.5 rounded-lg font-body font-bold text-[11px] hover:bg-[hsl(43_78%_57%)] active:scale-95 transition-all shadow-[0_2px_12px_hsl(43_78%_50%/0.4)] whitespace-nowrap"
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            Campus
          </a>
        </div>

        {/* ── Right: social + CTA ── */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 border-l border-[hsl(43_78%_50%/0.2)] pl-3 shrink-0">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram SISO"
              className="w-8 h-8 rounded-lg border border-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.5)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
            >
              <IconInstagram />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook SISO"
              className="w-8 h-8 rounded-lg border border-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.5)] flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
            >
              <IconFacebook />
            </a>
          </div>
          <a
            href="#contacto"
            className="relative flex items-center gap-1.5 bg-gradient-fire text-primary-foreground px-4 xl:px-5 py-2 rounded-lg font-body font-bold text-[12px] xl:text-[13px] hover:opacity-90 active:scale-95 transition-all overflow-hidden btn-shimmer glow-gold-sm whitespace-nowrap shrink-0"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            Contáctenos
          </a>
        </div>

        {/* ── Mobile right ── */}
        <div className="lg:hidden flex items-center gap-2 shrink-0">
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hidden sm:flex w-9 h-9 rounded-lg border border-[hsl(43_78%_50%/0.2)] items-center justify-center text-muted-foreground hover:text-primary transition-all"
          >
            <IconInstagram />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hidden sm:flex w-9 h-9 rounded-lg border border-[hsl(43_78%_50%/0.2)] items-center justify-center text-muted-foreground hover:text-primary transition-all"
          >
            <IconFacebook />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-10 h-10 rounded-xl border border-[hsl(43_78%_50%/0.25)] hover:border-[hsl(43_78%_50%/0.5)] active:scale-95 flex items-center justify-center text-foreground transition-all touch-manipulation"
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
            className="lg:hidden bg-[#0a0a0a] border-b border-[hsl(43_78%_50%/0.12)] overflow-hidden"
          >
            <nav className="px-4 sm:px-6 py-3 flex flex-col gap-0.5 max-h-[80svh] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() =>
                      setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-[14px] tracking-[0.12em] text-muted-foreground hover:text-primary hover:bg-[hsl(43_78%_50%/0.07)] active:bg-[hsl(43_78%_50%/0.12)] transition-all touch-manipulation"
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        mobileExpanded === item.label ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {mobileExpanded === item.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="overflow-hidden pl-4 border-l-2 border-[hsl(43_78%_50%/0.2)] ml-6 mb-1"
                      >
                        {item.subitems.map((sub, idx) => (
                          <a
                            key={idx}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-body text-muted-foreground hover:text-primary transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(43_78%_50%/0.5)] shrink-0" />
                            {sub.label}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Portal + Campus móvil */}
              <div className="grid grid-cols-2 gap-2 mt-2 mb-1">
                <a
                  href="#portal"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[hsl(43_78%_50%)] text-black px-3 py-2.5 rounded-xl font-body font-bold text-[13px] hover:bg-[hsl(43_78%_57%)] active:scale-95 transition-all shadow-[0_2px_12px_hsl(43_78%_50%/0.38)]"
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  Portal Empresarial
                </a>
                <a
                  href="#campus"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-[hsl(43_78%_50%)] text-black px-3 py-2.5 rounded-xl font-body font-bold text-[13px] hover:bg-[hsl(43_78%_57%)] active:scale-95 transition-all shadow-[0_2px_12px_hsl(43_78%_50%/0.38)]"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  Campus
                </a>
              </div>

              {/* Mobile social */}
              <div className="sm:hidden flex items-center gap-3 px-4 py-2 border-t border-[hsl(43_78%_50%/0.08)] mt-1">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-body text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconInstagram /> Instagram
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] font-body text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconFacebook /> Facebook
                </a>
              </div>

              <a
                href="#contacto"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 bg-gradient-fire text-primary-foreground px-5 py-3 rounded-xl font-body font-bold text-[14px] active:opacity-80 transition-all touch-manipulation"
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
