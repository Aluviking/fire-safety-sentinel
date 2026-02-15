import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const certs = ["ISO", "RUC", "OHSAS", "IADC RIG PASS", "BASC"];

const CertificationsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="certificaciones" className="py-20 px-6 relative" ref={ref}>
      <div className="absolute inset-0 bg-secondary/30" />
      <div className="relative max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
            Respaldo internacional
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-3 mb-4 text-foreground">
            CERTIFICACIONES <span className="text-gradient-fire">DE EXCELENCIA</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto mb-14">
            Cinco sellos que representan nuestra excelencia y compromiso con la seguridad, la calidad y el cumplimiento normativo.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative w-40 h-40 rounded-2xl bg-gradient-card border border-border hover:border-primary/40 transition-all duration-500 flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-primary/10 to-transparent" />
              <span className="font-display text-3xl text-gradient-fire relative z-10">{cert}</span>
              <span className="text-xs font-body text-muted-foreground mt-1 relative z-10">Certificado</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
