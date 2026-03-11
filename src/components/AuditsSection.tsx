import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, ArrowRight, Award } from "lucide-react";
import auditImage from "@/assets/audit-image.jpg";

const auditFeatures = [
  "Auditorías internas y externas en Sistemas de Gestión Integrados",
  "Cumplimiento normativo ISO 9001, ISO 14001, ISO 45001, RUC, OHSAS y BASC",
  "Implementación de SIG: calidad, medio ambiente y seguridad unificados",
  "Reducción de costos y optimización de procesos organizacionales",
  "Informes detallados con planes de acción y seguimiento",
];

const AuditsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="auditorias" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(35_9%_9%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="hidden md:block absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.05)] blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Image ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-gold">
              <img
                src={auditImage}
                alt="Auditoría de seguridad industrial"
                className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_8%_5%/0.45)] via-transparent to-transparent rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(43_78%_50%/0.04)] to-transparent rounded-2xl" />
              <div className="absolute inset-0 ring-1 ring-[hsl(43_78%_50%/0.12)] rounded-2xl" />
            </div>

            {/* Floating badges — hidden on mobile to avoid overflow */}
            <motion.div
              className="hidden sm:flex absolute -bottom-5 right-4 md:right-8 glass-card rounded-2xl px-5 py-4 border border-[hsl(43_78%_50%/0.3)] glow-gold-sm flex-col"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-display text-3xl text-gradient-gold leading-none">ISO</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Certificaciones</p>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-5 left-4 md:left-8 glass-card rounded-xl px-4 py-3 border border-[hsl(43_78%_50%/0.15)] items-center gap-3"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-base text-gradient-gold leading-none">100%</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Cumplimiento</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="section-label mb-4 block">
              <span className="w-6 h-px bg-primary" />
              Excelencia comprobada
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 mb-5 text-foreground leading-[0.9]">
              ASESORÍA &amp;{" "}
              <span className="text-gradient-gold">AUDITORÍAS</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-7 text-[14px] sm:text-[15px]">
              En SISO asesoramos la implementación de Sistemas de Gestión Integrados
              (SIG) que unifican calidad, medio ambiente y SST en una sola estructura.
              Ejecutamos auditorías internas y externas garantizando el
              cumplimiento normativo y la mejora continua de su organización.
            </p>

            <ul className="space-y-3 mb-8">
              {auditFeatures.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.4 + i * 0.07 }}
                  className="flex items-start gap-3 font-body text-[13px] sm:text-[14px] text-foreground/85"
                >
                  <div className="w-5 h-5 rounded-full bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {feature}
                </motion.li>
              ))}
            </ul>

            <a
              href="#contacto"
              className="group relative inline-flex items-center gap-2 bg-gradient-fire text-primary-foreground px-7 py-3.5 rounded-xl font-body font-bold text-sm hover:opacity-90 active:scale-95 transition-all glow-gold-sm overflow-hidden btn-shimmer"
            >
              Solicitar Auditoría
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuditsSection;
