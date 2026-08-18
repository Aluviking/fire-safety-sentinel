import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, X } from "lucide-react";
import heroImage from "@/assets/hero-firefighter.jpg";
import logoAces from "@/assets/certificaciones/aces.jpeg";
import logoAcs from "@/assets/certificaciones/acs.jpeg";
import logoAider from "@/assets/certificaciones/aider.jpeg";
import logoNaemt from "@/assets/certificaciones/naemt.jpeg";
import logoOmnibvs from "@/assets/certificaciones/omnibvs.jpeg";
import logoSaveALife from "@/assets/certificaciones/save-a-life.jpeg";
import logoStopTheBleed from "@/assets/certificaciones/stop-the-bleed.jpeg";

const CAMPUS_URL = "/campus-virtual/";

type ModalItem = { name: string; desc?: string };
type ModalGroup = { heading?: string; items: ModalItem[] };
type TagModalContent = {
  title: string;
  description: string;
  groups: ModalGroup[];
};

const formacionTagModals: Record<string, TagModalContent> = {
  "Cursos": {
    title: "Cursos de Formación",
    description: "Programas cortos de capacitación con certificación en SST y normativa laboral.",
    groups: [
      {
        heading: "En Salud",
        items: [
          { name: "(SBA) Soporte Básico de Vida" },
          { name: "(SVA) Soporte Vital Avanzado" },
          { name: "(APH) Atención Pre Hospitalaria" },
          { name: "(APAA) Asistente en Primeros Auxilios Avanzados" },
        ],
      },
      {
        heading: "En Seguridad",
        items: [
          { name: "Primer Respondiente en Seguridad Vial" },
          { name: "Manejo de Materiales Peligrosos" },
          { name: "Brigada Contraincendios" },
          { name: "Brigada Integral" },
          { name: "Sistema Comando de Incidentes" },
          { name: "Ejercicios de Simulación según Amenaza" },
          { name: "TEC – Trabajo en Espacios Confinados" },
          { name: "TA – Trabajo en Alturas", desc: "Administrativo · Avanzado · Reentrenamiento · Coordinador" },
          { name: "Trabajo en Energías Peligrosas" },
        ],
      },
    ],
  },
  "Diplomados": {
    title: "Diplomados",
    description: "Programas intensivos de mayor profundidad técnica y académica en SST.",
    groups: [
      {
        items: [
          { name: "Atención Pre Hospitalaria", desc: "Básico y Avanzado" },
          { name: "Sistemas de Gestión Integrado" },
          { name: "Seguridad y Salud en el Trabajo" },
        ],
      },
    ],
  },
  "Seminarios": {
    title: "Seminarios",
    description: "Eventos académicos de actualización normativa y mejores prácticas del sector.",
    groups: [
      {
        items: [
          { name: "Gestión del Riesgo" },
          { name: "Legislación y Cumplimiento Legal" },
          { name: "Actores de Seguridad Vial" },
          { name: "Tareas de Alto Riesgo" },
        ],
      },
    ],
  },
  "Técnico Laboral": {
    title: "Técnico Laboral",
    description: "Programas técnicos en 1 año con metodología PAT (Presencialidad Asistida por Tecnología). Titulación oficial reconocida.",
    groups: [
      {
        items: [
          { name: "TAE · Técnico Laboral en Auxiliar de Enfermería", desc: "Con énfasis en APH (Atención Prehospitalaria). Formación para soporte vital básico y atención de urgencias." },
          { name: "TSST · Técnico en Seguridad y Salud en el Trabajo", desc: "Con énfasis en TAR (Tareas de Alto Riesgo). Gestión integral del SG-SST y control de riesgos laborales." },
          { name: "TAF · Técnico Auxiliar en Servicios Farmacéuticos", desc: "Formación en dispensación, almacenamiento y control de medicamentos en establecimientos farmacéuticos." },
          { name: "TAEC · Técnico Auxiliar en Cosmetología y Estética", desc: "Técnicas y protocolos de belleza, cuidado corporal y estética profesional con aval institucional." },
        ],
      },
    ],
  },
};

const formacionTags = ["Cursos", "Diplomados", "Seminarios", "Técnico Laboral"];

const certificaciones = [
  { name: "ACES", logo: logoAces },
  { name: "ACS Committee on Trauma", logo: logoAcs },
  { name: "AIDER International", logo: logoAider },
  { name: "NAEMT", logo: logoNaemt },
  { name: "American College of Surgeons", logo: logoOmnibvs },
  { name: "Hartford Consensus · Save a Life", logo: logoSaveALife },
  { name: "Stop the Bleed", logo: logoStopTheBleed },
];

const FormacionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modal = activeModal ? formacionTagModals[activeModal] : null;

  return (
    <section id="formacion" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(35_9%_7%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="hidden md:block absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.05)] blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Content (left on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <h2
              className="font-display mb-5 text-foreground leading-[0.9] whitespace-nowrap"
              style={{ fontSize: "clamp(1.9rem, 5.2vw, 3.75rem)" }}
            >
              FORMA<span className="text-gradient-gold">CIÓN</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-5 text-justify text-[14px] sm:text-[15px]">
              Proceso educativo continuo, sistemático y participativo de manera presencial
              como virtual en nuestra plataforma Q10, que desarrolla habilidades y
              competencias para promover, proteger y mantener la salud y el bienestar de
              las personas. Con certificaciones internacionales como:
            </p>

            {/* Certificaciones internacionales — carrusel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative mb-7"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-10 z-10 bg-gradient-to-r from-[hsl(35_9%_7%)] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-10 z-10 bg-gradient-to-l from-[hsl(35_9%_7%)] to-transparent" />

              <div className="flex overflow-hidden py-1">
                <div
                  className="flex gap-3"
                  style={{ animation: "marquee-formacion 20s linear infinite", width: "max-content" }}
                >
                  {[...certificaciones, ...certificaciones].map((cert, i) => (
                    <div
                      key={i}
                      className="shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-xl p-2.5 border border-[hsl(43_78%_50%/0.12)]"
                      title={cert.name}
                    >
                      <img
                        src={cert.logo}
                        alt={cert.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <style>{`
              @keyframes marquee-formacion {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>

            {/* Tag buttons — siempre en una sola fila; si no caben en pantallas angostas, se desliza (con fade) en vez de partirse */}
            <div className="relative mb-8">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-3 z-10 bg-gradient-to-r from-[hsl(35_9%_7%)] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-3 z-10 bg-gradient-to-l from-[hsl(35_9%_7%)] to-transparent" />

              <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 px-3
                              [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {formacionTags.map((tag, i) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, y: 8 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                    onClick={() => setActiveModal(tag)}
                    className="inline-flex items-center justify-center gap-1.5 font-body font-semibold rounded-full border shrink-0
                               text-[13.5px] px-3.5 py-[7px]
                               bg-[hsl(43_78%_50%/0.1)] text-primary/80 border-[hsl(43_78%_50%/0.2)]
                               hover:bg-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.45)] hover:text-primary
                               transition-all duration-200 cursor-pointer whitespace-nowrap"
                  >
                    {tag}
                    <span className="text-primary/60 text-[11px]">↗</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href={CAMPUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                           font-body font-bold text-sm text-background
                           bg-gradient-to-r from-[hsl(43_78%_50%)] to-[hsl(43_78%_42%)]
                           hover:from-[hsl(43_78%_56%)] hover:to-[hsl(43_78%_48%)]
                           shadow-[0_0_18px_hsl(43_78%_50%/0.35)]
                           transition-all duration-200"
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                Ir al Campus Virtual
              </a>
            </div>
          </motion.div>

          {/* ── Image (right on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="rounded-2xl overflow-hidden glow-gold">
              <img
                src={heroImage}
                alt="Formación en Seguridad y Salud en el Trabajo"
                className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_8%_5%/0.45)] via-transparent to-transparent rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(43_78%_50%/0.04)] to-transparent rounded-2xl" />
              <div className="absolute inset-0 ring-1 ring-[hsl(43_78%_50%/0.12)] rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activeModal && modal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Centering wrapper — plain (non-motion) so it isn't fighting the
                inline transform Framer Motion puts on the sheet below for its
                y-slide animation; centering here is done with flexbox instead
                of top/left + translate, which used to collide with that inline
                transform and left the modal pinned off-center on desktop. */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
              {/* Sheet / Card */}
              <motion.div
                key="modal"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="pointer-events-auto w-full rounded-t-2xl
                           sm:w-full sm:max-w-lg sm:rounded-2xl sm:mx-4
                           bg-[hsl(30_8%_10%)] border border-[hsl(43_78%_50%/0.18)]
                           shadow-[0_0_60px_hsl(43_78%_50%/0.12)]
                           max-h-[85vh] flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-white/5 shrink-0">
                  <div>
                    <h3 className="font-display text-xl text-gradient-gold">{modal.title}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1">{modal.description}</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="ml-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Items */}
                <div className="overflow-y-auto p-5 space-y-5 flex-1">
                  {modal.groups.map((group, gi) => (
                    <div key={group.heading ?? gi}>
                      {group.heading && (
                        <p className="font-body text-xs font-bold text-primary/80 uppercase tracking-[0.12em] mb-2.5">
                          {group.heading}
                        </p>
                      )}
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <div key={item.name} className="glass-card rounded-xl p-4 border border-[hsl(43_78%_50%/0.1)]">
                            <p className="font-body text-sm font-semibold text-foreground leading-snug">{item.name}</p>
                            {item.desc && (
                              <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 shrink-0">
                  <a
                    href={CAMPUS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                               font-body font-bold text-sm text-background
                               bg-gradient-to-r from-[hsl(43_78%_50%)] to-[hsl(43_78%_42%)]
                               hover:from-[hsl(43_78%_56%)] hover:to-[hsl(43_78%_48%)]
                               transition-all duration-200"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Ir al Campus Virtual
                  </a>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FormacionSection;
