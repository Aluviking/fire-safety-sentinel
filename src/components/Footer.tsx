import { Phone, Mail, MapPin, Shield } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const WA_NUMBER = "573181800010";
const WA_MESSAGE = "Hola, buenas tardes. Estoy interesado/a en los servicios de SISO. ¿Me podrían brindar más información?";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

const normativaLinks = [
  { label: "Política de Privacidad",             href: "#privacidad" },
  { label: "Política de Tratamiento de Datos",   href: "#datos" },
  { label: "Términos y Condiciones",             href: "#terminos" },
  { label: "Reglamento Interno SST",             href: "#reglamento" },
  { label: "Política de SST",                    href: "#politica-sst" },
];

const colLabel = "font-body font-semibold text-[11px] tracking-[0.18em] uppercase text-foreground/50 mb-5 flex items-center gap-2";

const Footer = () => {
  return (
    <footer className="relative border-t border-[hsl(35_10%_12%)] bg-[hsl(30_8%_4%)]">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-14 sm:pt-20 pb-8 sm:pb-10">

        {/* Grid: 1 col mobile → 3 equal cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-8 mb-12 sm:mb-16">

          {/* ── Col 1: Brand ── */}
          <div>
            <a href="#inicio" className="flex items-center gap-3 mb-5 group w-fit min-h-0">
              <img
                src={sisoLogo}
                alt="SISO Logo"
                className="w-12 h-12 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span
                  className="font-display text-[24px] tracking-[0.1em] block leading-none bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
                >
                  SISO
                </span>
                <span className="text-[11px] font-body text-muted-foreground tracking-[0.12em] uppercase mt-1 block">
                  20 Años · 2006–2026
                </span>
              </div>
            </a>

            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
              Asesoría y Gestión Empresarial S.A.S. Expertos en SST, cumplimiento normativo y gestión integrada del riesgo en Colombia.
            </p>

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

          {/* ── Col 2: Contacto ── */}
          <div>
            <p className={colLabel}>
              <Phone className="w-3.5 h-3.5 text-primary/60" />
              Contacto
            </p>

            <div className="space-y-3.5 mb-6">
              <a href="tel:+573181800010" className="flex items-center gap-2.5 text-sm font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Phone className="w-4 h-4 text-[hsl(43_78%_50%/0.7)] shrink-0" />
                +57 318 180 0010
              </a>
              <a href="mailto:info@siso.com.co" className="flex items-center gap-2.5 text-sm font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Mail className="w-4 h-4 text-[hsl(43_78%_50%/0.7)] shrink-0" />
                info@siso.com.co
              </a>
              <div className="flex items-center gap-2.5 text-sm font-body text-muted-foreground">
                <MapPin className="w-4 h-4 text-[hsl(43_78%_50%/0.7)] shrink-0" />
                Colombia
              </div>
            </div>

            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                         font-body font-bold text-xs text-primary
                         border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                         hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                         transition-all duration-200"
            >
              <WhatsAppIcon />
              Escríbenos al WhatsApp
            </a>
          </div>

          {/* ── Col 3: Normativa ── */}
          <div>
            <p className={colLabel}>
              <Shield className="w-3.5 h-3.5 text-primary/60" />
              Normativa &amp; Legal
            </p>
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

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(35_10%_18%)] to-transparent mb-5" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Left: copyright + quick links */}
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-[13px] text-muted-foreground/80">
              © {new Date().getFullYear()} SISO — Asesoría y Gestión Empresarial S.A.S.
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <a href="#datos" className="font-body text-[12px] text-muted-foreground/65 hover:text-muted-foreground transition-colors">
                Política de Datos
              </a>
              <span className="text-muted-foreground/35">·</span>
              <a href="#terminos" className="font-body text-[12px] text-muted-foreground/65 hover:text-muted-foreground transition-colors">
                Términos
              </a>
              <span className="text-muted-foreground/35">·</span>
              <span className="font-body text-[12px] text-muted-foreground/55">
                SST · Colombia · 20 Años
              </span>
            </div>
          </div>

          {/* Right: Powered by */}
          <p className="font-body text-[12px] text-muted-foreground/60 shrink-0">
            Powered by{" "}
            <a
              href="https://www.rubikcontroldigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#9B1B30] hover:text-[#C0253F] transition-colors"
            >
              Rubik Control Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
