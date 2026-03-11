import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, MapPin, ArrowRight, MessageCircle } from "lucide-react";

const contacts = [
  { icon: Phone,  label: "Llámenos",  value: "+57 300 000 0000", href: "tel:+573000000000" },
  { icon: Mail,   label: "Escríbanos", value: "info@siso.com.co", href: "mailto:info@siso.com.co" },
  { icon: MapPin, label: "Ubicación",  value: "Colombia",         href: "#" },
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
            return (
              <a
                key={item.label}
                href={item.href}
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
            href="https://wa.me/573000000000"
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
