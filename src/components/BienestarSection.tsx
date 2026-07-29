import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const bienestarItems = [
  "Salidas Pedagógicas",
  "Cabalgatas Guiadas",
  "Caminatas Ecológicas",
  "Jornadas Outdoor",
  "Coaching Empresarial",
  "Rumba Aeróbica",
  "Match Empresarial",
  "Olimpiadas Empresariales",
];

const BienestarSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="svc-bienestar" className="section-padding relative overflow-hidden" ref={ref}>
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
          <h2
            className="font-display text-foreground leading-[0.9] mb-5 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
          >
            BIEN<span className="text-gradient-gold">ESTAR</span>
          </h2>

          <p className="font-body text-muted-foreground text-[15px] sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Diseño, promoción e implementación de políticas, estrategias, programas y acciones
            encaminadas a mejorar la salud física, mental, emocional y social de sus trabajadores,
            favoreciendo un entorno laboral seguro, saludable, inclusivo y motivador que contribuya
            a mejorar la calidad de vida, el compromiso, la productividad y el logro de los
            objetivos organizacionales.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {bienestarItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 font-body text-xs sm:text-sm font-semibold px-2 text-primary/80"
            >
              <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BienestarSection;
