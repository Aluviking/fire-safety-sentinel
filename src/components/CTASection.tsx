import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, MapPin, ArrowRight, MessageCircle } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className ?? "w-5 h-5 shrink-0"}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WA_HREF = "https://wa.me/573181800010?text=" + encodeURIComponent("Hola, buenas tardes. Estoy interesado/a en los servicios de SISO. ¿Me podrían brindar más información?");

const contacts = [
  { icon: Phone,        label: "Llámenos",    value: "+57 318 180 0010",  href: WA_HREF },
  { icon: WhatsAppIcon, label: "Escríbanos",  value: "+57 318 180 0010",  href: WA_HREF },
  { icon: MapPin,       label: "Ubicación",   value: "Colombia",          href: "#" },
];

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="contacto" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(30_8%_6%)]" />
      <div className="absolute inset-0 dot-pattern opacity-35" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(43_78%_50%/0.06)] blur-[130px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(43_78%_50%/0.25)] bg-[hsl(43_78%_50%/0.07)] mb-5 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-primary font-body font-bold text-[10px] sm:text-xs tracking-[0.15em] uppercase whitespace-nowrap">
              20 Años de Excelencia · 2006–2026
            </span>
          </div>

          <h2
            className="font-display text-foreground leading-[0.88]"
            style={{ fontSize: "clamp(2.4rem, 8vw, 5.5rem)" }}
          >
            ¿LISTO PARA{" "}
            <span className="text-gradient-gold">PROTEGER</span>
            <br />
            SU ORGANIZACIÓN?
          </h2>
          <p className="font-body text-muted-foreground mt-5 text-[14px] sm:text-base max-w-md mx-auto leading-relaxed">
            Contáctenos hoy y reciba una asesoría personalizada sin costo. Nuestro equipo responde en menos de 24 horas.
          </p>
        </motion.div>

        {/* Contact cards */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 sm:mb-10"
        >
          {contacts.map((item) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith("http");
            return (
              <a
                key={item.label}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group glass-card rounded-2xl p-5 sm:p-6 hover:glass-card-hover border border-[hsl(43_78%_50%/0.08)] hover:border-[hsl(43_78%_50%/0.25)] active:scale-[0.98] transition-all duration-300 flex items-center sm:flex-col sm:items-center gap-4 sm:gap-3 touch-manipulation"
              >
                <div className="w-11 h-11 rounded-xl bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)] transition-colors flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left sm:text-center">
                  <p className="font-body text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5">
                    {item.label}
                  </p>
                  <p className="font-body font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {item.value}
                  </p>
                </div>
              </a>
            );
          })}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 bg-gradient-fire text-primary-foreground px-7 sm:px-10 py-4 sm:py-5 rounded-2xl font-body font-bold text-base sm:text-lg hover:opacity-90 active:scale-95 transition-all glow-gold overflow-hidden btn-shimmer pulse-glow touch-manipulation w-full sm:w-auto justify-center"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            Quiero Capacitarme Ahora
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
          </a>

          <p className="text-sm text-muted-foreground font-body flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Respuesta en menos de 24 horas · Sin compromiso
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
