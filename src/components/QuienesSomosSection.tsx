import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const QuienesSomosSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="quienes-somos" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(30_8%_6%)]" />
      <div className="absolute inset-0 dot-pattern opacity-35" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(43_78%_50%/0.06)] blur-[130px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(43_78%_50%/0.25)] bg-[hsl(43_78%_50%/0.07)] mb-5 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-primary font-body font-bold text-[10px] sm:text-xs tracking-[0.15em] uppercase whitespace-nowrap">
              Quiénes Somos
            </span>
          </div>

          <h2
            className="font-display text-foreground leading-[0.9] mb-5 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            QUIÉNES <span className="text-gradient-gold">SOMOS</span>
          </h2>

          <p className="font-body text-muted-foreground text-[15px] sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Somos una empresa al servicio de las Entidades Públicas y Privadas que fortalece
            el diseño, implementación y evaluación de los Sistemas de Gestión integral de los
            diferentes sectores económicos.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuienesSomosSection;
