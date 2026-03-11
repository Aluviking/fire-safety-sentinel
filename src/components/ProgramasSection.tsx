import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Car, CheckSquare, UserCheck, Flame, ArrowRight } from "lucide-react";

const programs = [
  {
    icon: AlertTriangle,
    title: "Gestión del Riesgo y Trabajo en Alto Riesgo",
    description:
      "Identificación, evaluación y control de riesgos laborales con énfasis en actividades críticas: trabajo en alturas, espacios confinados y energías peligrosas.",
    tag: "SST",
  },
  {
    icon: Car,
    title: "Plan Estratégico de Seguridad Vial (PESV)",
    description:
      "Diseño e implementación del PESV conforme a la normativa colombiana. Reducimos accidentes de tránsito y garantizamos cumplimiento ante el Ministerio de Transporte.",
    tag: "Vial",
  },
  {
    icon: CheckSquare,
    title: "Sistema Integrado de Gestión (SIG)",
    description:
      "Implementación integrada de ISO 9001, ISO 14001 e ISO 45001. Una sola estructura de gestión para calidad, medio ambiente y seguridad.",
    tag: "ISO",
  },
  {
    icon: UserCheck,
    title: "Seguridad Humana",
    description:
      "Planes de emergencia, evacuación y respuesta ante desastres. Cumplimiento de la normativa de seguridad humana en edificaciones empresariales.",
    tag: "Emergencias",
  },
  {
    icon: Flame,
    title: "Protección Contra Incendios",
    description:
      "Análisis de riesgo de incendio, planes de acción, selección y mantenimiento de equipos contra incendios, y formación de brigadas especializadas.",
    tag: "Incendios",
  },
];

const ProgramasSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="programas" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(30_8%_7%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />

      {/* Orb dorado lateral */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[hsl(43_78%_50%/0.04)] blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14"
        >
          <span className="section-label mb-4 block">
            <span className="w-6 h-px bg-primary" />
            Soluciones especializadas
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9]">
            NUESTROS{" "}
            <span className="text-gradient-gold">PROGRAMAS</span>
          </h2>
          <p className="font-body text-muted-foreground mt-4 text-sm md:text-base max-w-lg leading-relaxed">
            Programas diseñados para cumplir la normativa colombiana e internacional, adaptados a las necesidades de su organización.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program, i) => {
            const Icon = program.icon;
            return (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                className={`group relative glass-card rounded-2xl overflow-hidden hover:glass-card-hover transition-all duration-300 flex flex-col${
                  i === 4 ? " lg:col-start-2" : ""
                }`}
              >
                {/* Top gold accent bar */}
                <div className="h-[2px] bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)] group-hover:via-[hsl(43_78%_60%)] transition-all duration-300" />

                <div className="relative z-10 flex flex-col flex-1 p-7">
                  {/* Tag + Icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-block text-[10px] font-body font-bold px-3 py-1 rounded-full bg-[hsl(43_78%_50%/0.12)] text-primary tracking-[0.12em] uppercase">
                      {program.tag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[hsl(43_78%_50%/0.1)] flex items-center justify-center group-hover:bg-[hsl(43_78%_50%/0.2)] transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg md:text-xl text-foreground mb-3 tracking-wide leading-tight">
                    {program.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
                    {program.description}
                  </p>

                  <a
                    href="#contacto"
                    className="mt-6 inline-flex items-center gap-1.5 text-primary font-body font-semibold text-[13px] hover:gap-2.5 transition-all"
                  >
                    Solicitar información
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProgramasSection;
