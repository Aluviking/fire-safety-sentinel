import { Phone, MapPin } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";
import { buildWhatsAppLink, WhatsAppIcon } from "@/lib/whatsapp";

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-[hsl(30_8%_4%)] relative overflow-hidden flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 dot-pattern opacity-35" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(43_78%_50%/0.08)] blur-[130px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />

      <div className="relative max-w-lg w-full text-center">
        <img
          src={sisoLogo}
          alt="SISO Logo"
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover glow-gold-sm mx-auto mb-6"
        />
        <span
          className="font-display text-3xl sm:text-4xl tracking-[0.1em] block leading-none bg-clip-text text-transparent mb-2"
          style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
        >
          SISO
        </span>
        <p className="font-body text-[11px] text-muted-foreground tracking-[0.12em] uppercase mb-10">
          20 Años · 2006–2026
        </p>

        <h1 className="font-display text-foreground leading-[0.95] mb-5" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
          ¡HOLA, <span className="text-gradient-gold">BIENVENIDOS!</span>
        </h1>

        <p className="font-body text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-10">
          Estamos realizando mantenimiento en nuestro sitio web para ofrecerte una
          mejor experiencia. Volvemos muy pronto. Mientras tanto, escríbenos o
          síguenos en nuestras redes.
        </p>

        <div className="flex flex-col items-center gap-3">
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                       font-body font-bold text-sm text-primary
                       border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                       hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                       transition-all duration-200"
          >
            <WhatsAppIcon />
            +57 318 180 0010
          </a>

          <div className="flex items-center gap-3 mt-1">
            <a
              href="tel:+573181800010"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(43_78%_50%/0.2)] text-muted-foreground hover:text-primary hover:border-[hsl(43_78%_50%/0.45)] transition-all text-[13px] font-body"
            >
              <Phone className="w-4 h-4 shrink-0" />
              Llámenos
            </a>
            <a
              href="https://www.instagram.com/sisoasesoria?igsh=c3dkZzJhNW1qaDF2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram SISO"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[hsl(43_78%_50%/0.2)] text-muted-foreground hover:text-primary hover:border-[hsl(43_78%_50%/0.45)] transition-all text-[13px] font-body"
            >
              <IconInstagram />
              Instagram
            </a>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70 font-body mt-4">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            Colombia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
