import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import auditImage from "@/assets/audit-image.jpg";

const auditFeatures = [
  "Auditorías internas y externas en sistemas de gestión",
  "Cumplimiento normativo ISO, RUC, OHSAS, BASC",
  "Seguimiento y mejora continua",
  "Equipo auditor altamente calificado",
  "Informes detallados con plan de acción",
];

const AuditsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="auditorias" className="section-padding relative" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-fire">
              <img
                src={auditImage}
                alt="Auditoría de seguridad industrial"
                className="w-full h-[400px] object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating badge */}
            <motion.div
              className="absolute -bottom-6 -right-4 md:right-8 bg-card border border-primary/20 rounded-xl px-6 py-4 glow-fire-sm"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <p className="font-display text-3xl text-gradient-fire">ISO</p>
              <p className="font-body text-xs text-muted-foreground">Certificado</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
              Excelencia comprobada
            </span>
            <h2 className="font-display text-5xl md:text-6xl mt-3 mb-6 text-foreground">
              AUDITORÍAS DE{" "}
              <span className="text-gradient-fire">SEGURIDAD</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-8">
              En SISO contamos con amplia experiencia en la planeación, ejecución y
              seguimiento de auditorías en Sistemas de Gestión, garantizando el
              cumplimiento normativo y fortaleciendo la cultura organizacional de la
              seguridad.
            </p>

            <ul className="space-y-4 mb-10">
              {auditFeatures.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3 font-body text-foreground"
                >
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            <a
              href="#contacto"
              className="inline-flex items-center gap-2 bg-gradient-fire text-primary-foreground px-8 py-4 rounded-lg font-body font-bold hover:opacity-90 transition-all glow-fire-sm group"
            >
              Solicitar Auditoría
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuditsSection;
