import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Shield } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";
import { buildWhatsAppLink, WhatsAppIcon } from "@/lib/whatsapp";

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
  { label: "Política de Tratamiento de Datos",   href: "/politica-tratamiento-datos" },
  { label: "Política de SST",                    href: "/politica-sst" },
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
            <a href="#inicio" className="flex items-center gap-4 mb-6 group w-fit min-h-0">
              <img
                src={sisoLogo}
                alt="SISO Logo"
                className="w-24 h-24 rounded-full object-cover glow-gold-sm shrink-0 group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <span
                  className="font-display text-[34px] tracking-[0.1em] block leading-none bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
                >
                  SISO
                </span>
                <span className="text-[11px] font-body text-muted-foreground tracking-[0.12em] uppercase mt-1 block">
                  20 Años · 2006–2026
                </span>
              </div>
            </a>

            {/* Social media */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/sisoasesoria?igsh=c3dkZzJhNW1qaDF2"
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

          {/* ── Col 2: Normativa ── */}
          <div>
            <p className={colLabel}>
              <Shield className="w-3.5 h-3.5 text-primary/60" />
              Normativa &amp; Legal
            </p>
            <ul className="space-y-2.5">
              {normativaLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group min-h-0 py-0.5"
                  >
                    <span className="w-0 group-hover:w-2.5 h-px bg-primary transition-all duration-200 overflow-hidden shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Contacto ── */}
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
              <a href="mailto:gerencia@siso.com.co" className="flex items-center gap-2.5 text-sm font-body text-muted-foreground hover:text-primary active:text-primary/70 transition-colors min-h-0">
                <Mail className="w-4 h-4 text-[hsl(43_78%_50%/0.7)] shrink-0" />
                gerencia@siso.com.co
              </a>
              <div className="flex items-center gap-2.5 text-sm font-body text-muted-foreground">
                <MapPin className="w-4 h-4 text-[hsl(43_78%_50%/0.7)] shrink-0" />
                Colombia
              </div>
            </div>

            <a
              href={buildWhatsAppLink()}
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

        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(35_10%_18%)] to-transparent mb-5" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <p className="font-body text-[13px] text-muted-foreground/80">
            © {new Date().getFullYear()} SISO — Asesoría y Gestión Empresarial S.A.S. Todos los derechos reservados.
          </p>

          <p className="font-body text-[12px] text-muted-foreground/60">
            Powered by{" "}
            <a
              href="https://www.rubikcontroldigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:text-white/80 transition-colors"
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
