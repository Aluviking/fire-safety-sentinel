import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Car, CheckSquare, UserCheck, Flame } from "lucide-react";

const WA_NUMBER = "573181800010";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const programs = [
  {
    icon: AlertTriangle,
    title: "Gestión del Riesgo y Trabajo en Alto Riesgo",
    description:
      "Identificación, evaluación y control de riesgos laborales con énfasis en actividades críticas: trabajo en alturas, espacios confinados y energías peligrosas.",
    tag: "SST",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en el programa de *Gestión del Riesgo y Trabajo en Alto Riesgo*. ¿Me podrían brindar más información?",
  },
  {
    icon: Car,
    title: "Plan Estratégico de Seguridad Vial (PESV)",
    description:
      "Diseño e implementación del PESV conforme a la normativa colombiana. Reducimos accidentes de tránsito y garantizamos cumplimiento ante el Ministerio de Transporte.",
    tag: "Vial",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en el *Plan Estratégico de Seguridad Vial (PESV)*. ¿Me podrían brindar más información?",
  },
  {
    icon: CheckSquare,
    title: "Sistema Integrado de Gestión (SIG)",
    description:
      "Implementación integrada de ISO 9001, ISO 14001 e ISO 45001. Una sola estructura de gestión para calidad, medio ambiente y seguridad.",
    tag: "ISO",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en el *Sistema Integrado de Gestión (SIG)* con ISO 9001, 14001 y 45001. ¿Me podrían brindar más información?",
  },
  {
    icon: UserCheck,
    title: "Seguridad Humana",
    description:
      "Planes de emergencia, evacuación y respuesta ante desastres. Cumplimiento de la normativa de seguridad humana en edificaciones empresariales.",
    tag: "Emergencias",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en el programa de *Seguridad Humana* (planes de emergencia y evacuación). ¿Me podrían brindar más información?",
  },
  {
    icon: Flame,
    title: "Protección Contra Incendios",
    description:
      "Análisis de riesgo de incendio, planes de acción, selección y mantenimiento de equipos contra incendios, y formación de brigadas especializadas.",
    tag: "Incendios",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en el programa de *Protección Contra Incendios* y formación de brigadas. ¿Me podrían brindar más información?",
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
          <p className="font-body text-muted-foreground mt-4 text-sm md:text-base whitespace-nowrap">
            Programas diseñados para cumplir la normativa colombiana e internacional, adaptados a las necesidades de su organización.
          </p>
        </motion.div>

        {/* Grid — 6 col: primeras 3 en col-span-2, últimas 2 en col-span-3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {programs.map((program, i) => {
            const Icon = program.icon;
            return (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                className={`group relative glass-card rounded-2xl overflow-hidden hover:glass-card-hover transition-all duration-300 flex flex-col ${
                  i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                {/* Top gold accent bar */}
                <div className="h-[2px] bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)] group-hover:via-[hsl(43_78%_60%)] transition-all duration-300" />

                <div className="relative z-10 flex flex-col flex-1 p-7">
                  {/* Tag + Icon row */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-block text-xs font-body font-bold px-3 py-1 rounded-full bg-[hsl(43_78%_50%/0.12)] text-primary tracking-[0.12em] uppercase">
                      {program.tag}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-[hsl(43_78%_50%/0.1)] flex items-center justify-center group-hover:bg-[hsl(43_78%_50%/0.2)] transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 tracking-wide leading-tight">
                    {program.title}
                  </h3>
                  <p className="font-body text-base text-muted-foreground leading-relaxed flex-1">
                    {program.description}
                  </p>

                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(program.waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                               font-body font-bold text-sm text-primary
                               border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                               hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                               transition-all duration-200"
                  >
                    <WhatsAppIcon />
                    Escríbenos al WhatsApp
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
