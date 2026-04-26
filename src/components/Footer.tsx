import { Phone, Mail, MapPin, ArrowUpRight, Shield, FileText, HelpCircle } from "lucide-react";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import sisoLogo from "@/assets/siso-logo.png";

const normativaLinks = [
  { label: "Política de Privacidad",             href: "#privacidad" },
  { label: "Política de Tratamiento de Datos",   href: "#datos" },
  { label: "Términos y Condiciones",             href: "#terminos" },
  { label: "Reglamento Interno SST",             href: "#reglamento" },
  { label: "Política de SST",                    href: "#politica-sst" },
];

const faqLinks = [
  { label: "¿Qué es el SG-SST?",             href: "#faq" },
  { label: "¿Quién debe implementar SST?",    href: "#faq" },
  { label: "Formación de Brigadas",           href: "#faq" },
  { label: "Batería de Riesgo Psicosocial",   href: "#faq" },
  { label: "Más preguntas frecuentes →",      href: "#faq" },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-[hsl(35_10%_12%)] bg-[hsl(30_8%_4%)]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-14 sm:pt-20 pb-8 sm:pb-10">

        {/* Grid: 1 col mobile → 2 col sm → 4 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-12 sm:mb-16">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-3 mb-5 group w-fit min-h-0">
              <img
                src={sisoLogo}
                alt="SISO Logo"
                className="w-14 h-14 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span
                  className="font-display text-[26px] sm:text-[30px] tracking-[0.1em] block leading-none bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
                >
                  SISO
                </span>
                <span className="text-[11px] font-body text-muted-foreground tracking-[0.12em] uppercase mt-1 block">
                  20 Años · 2006–2026
                </span>
              </div>
            </a>

            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-[240px] mb-5">
              Asesoría y Gestión Empresarial SAS. Expertos en SST, cumplimiento normativo y gestión integrada del riesgo.
            </p>

            <div className="space-y-3 mb-6">
              <a href="tel:+573000000000" className="flex items-center gap-2.5 text-sm font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Phone className="w-4 h-4 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                +57 300 000 0000
              </a>
              <a href="mailto:info@siso.com.co" className="flex items-center gap-2.5 text-sm font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Mail className="w-4 h-4 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                info@siso.com.co
              </a>
              <div className="flex items-center gap-2.5 text-sm font-body text-muted-foreground">
                <MapPin className="w-4 h-4 text-[hsl(43_78%_50%/0.6)] shrink-0" />
                Colombia
              </div>
            </div>

            {/* Social media */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram SISO"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(43_78%_50%/0.2)] text-muted-foreground hover:text-primary hover:border-[hsl(43_78%_50%/0.45)] transition-all text-[13px] font-body"
              >
                <IconInstagram />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook SISO"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(43_78%_50%/0.2)] text-muted-foreground hover:text-primary hover:border-[hsl(43_78%_50%/0.45)] transition-all text-[13px] font-body"
              >
                <IconFacebook />
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* ── Normativa ── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-primary/60" />
              <p className="font-body font-semibold text-[11px] tracking-[0.18em] uppercase text-foreground/40">
                Normativa &amp; Legal
              </p>
            </div>
            <ul className="space-y-2.5">
              {normativaLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group min-h-0 py-0.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary transition-all duration-200 overflow-hidden shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── FAQ ── */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <HelpCircle className="w-4 h-4 text-primary/60" />
              <p className="font-body font-semibold text-[11px] tracking-[0.18em] uppercase text-foreground/40">
                Preguntas Frecuentes
              </p>
            </div>
            <ul className="space-y-2.5">
              {faqLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group min-h-0 py-0.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary transition-all duration-200 overflow-hidden shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CTA Card ── */}
          <div>
            <p className="font-body font-semibold text-[11px] tracking-[0.18em] uppercase text-foreground/40 mb-5">
              Contáctenos
            </p>
            <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.15)]">
              <div className="h-[1px] w-full bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)] mb-5 rounded-full" />
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
                ¿Listo para proteger su organización? Hablemos hoy y diseñamos una solución a su medida.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 bg-gradient-fire text-primary-foreground px-5 py-3 rounded-lg font-body font-bold text-sm hover:opacity-90 active:scale-95 transition-all glow-gold-sm w-full justify-center touch-manipulation min-h-0"
              >
                Solicitar Asesoría
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </a>
              <div className="mt-4 pt-4 border-t border-[hsl(43_78%_50%/0.1)] flex items-start gap-2">
                <FileText className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                <p className="font-body text-[12px] text-muted-foreground/60 leading-relaxed">
                  Sus datos están protegidos bajo nuestra política de tratamiento de la información.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(35_10%_16%)] to-transparent mb-6 sm:mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-3 sm:gap-2">
          <p className="font-body text-xs text-muted-foreground/50 text-center">
            © {new Date().getFullYear()} SISO — Asesoría y Gestión Empresarial SAS. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <a href="#datos" className="font-body text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors min-h-0">
              Política de Datos
            </a>
            <span className="text-muted-foreground/20">·</span>
            <a href="#terminos" className="font-body text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors min-h-0">
              Términos
            </a>
            <span className="text-muted-foreground/20">·</span>
            <span className="font-body text-xs text-muted-foreground/30">
              SST · Colombia · 20 Años
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
