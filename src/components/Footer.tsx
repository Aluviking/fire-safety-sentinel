import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const navLinks = [
  { label: "Servicios",       href: "#servicios" },
  { label: "Programas",       href: "#programas" },
  { label: "Auditorías",      href: "#auditorias" },
  { label: "Certificaciones", href: "#certificaciones" },
  { label: "Testimonios",     href: "#testimonios" },
];

const services = [
  "Formación de Brigadas",
  "Salud Laboral",
  "Asesoría en SIG",
  "Bienestar Empresarial",
  "Campus Virtual",
  "Protección Incendios",
];

const Footer = () => {
  return (
    <footer className="relative border-t border-[hsl(35_10%_12%)] bg-[hsl(30_8%_4%)]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-12 sm:pt-16 pb-8 sm:pb-10">

        {/* Grid: 1 col mobile → 2 col sm → 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-3 mb-5 group w-fit min-h-0">
              <img
                src={sisoLogo}
                alt="SISO Logo"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span
                  className="font-display text-[20px] sm:text-[22px] tracking-[0.1em] block leading-none bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
                >
                  SISO
                </span>
                <span className="text-[9px] font-body text-muted-foreground tracking-[0.12em] uppercase mt-0.5 block">
                  20 Años · 2006–2026
                </span>
              </div>
            </a>

            <p className="font-body text-[13px] text-muted-foreground leading-relaxed max-w-[220px] mb-5">
              Asesoría y Gestión Empresarial SAS. Expertos en SST, cumplimiento normativo y gestión integrada del riesgo.
            </p>

            <div className="space-y-2.5">
              <a href="tel:+573000000000" className="flex items-center gap-2.5 text-[12px] font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Phone className="w-3.5 h-3.5 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                +57 300 000 0000
              </a>
              <a href="mailto:info@siso.com.co" className="flex items-center gap-2.5 text-[12px] font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Mail className="w-3.5 h-3.5 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                info@siso.com.co
              </a>
              <div className="flex items-center gap-2.5 text-[12px] font-body text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                Colombia
              </div>
            </div>
          </div>

          {/* ── Navegación ── */}
          <div>
            <p className="font-body font-semibold text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group min-h-0 py-0.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary transition-all duration-200 overflow-hidden shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Servicios ── */}
          <div>
            <p className="font-body font-semibold text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">
              Servicios
            </p>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s}>
                  <a
                    href="#servicios"
                    className="font-body text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 min-h-0 py-0.5 block"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CTA Card ── */}
          <div>
            <p className="font-body font-semibold text-[10px] tracking-[0.18em] uppercase text-foreground/40 mb-4">
              Contáctenos
            </p>
            <div className="glass-card rounded-2xl p-5 border border-[hsl(43_78%_50%/0.1)]">
              <div className="h-[1px] w-full bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)] mb-4 rounded-full" />
              <p className="font-body text-[13px] text-muted-foreground leading-relaxed mb-4">
                ¿Listo para proteger su organización? Hablemos hoy.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 bg-gradient-fire text-primary-foreground px-4 py-2.5 rounded-lg font-body font-bold text-xs hover:opacity-90 active:scale-95 transition-all glow-gold-sm w-full justify-center touch-manipulation min-h-0"
              >
                Solicitar Asesoría
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(35_10%_16%)] to-transparent mb-6 sm:mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="font-body text-[11px] text-muted-foreground/50 text-center sm:text-left">
            © {new Date().getFullYear()} SISO — Asesoría y Gestión Empresarial SAS. Todos los derechos reservados.
          </p>
          <p className="font-body text-[11px] text-muted-foreground/30 text-center sm:text-right">
            SST · Colombia · 20 Años
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
