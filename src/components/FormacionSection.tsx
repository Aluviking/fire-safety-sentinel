import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, X, Award } from "lucide-react";
import heroImage from "@/assets/hero-firefighter.jpg";

const WA_NUMBER = "573181800010";
const WA_MESSAGE = "Hola, buenas tardes. Estoy interesado/a en los programas de *Formación* (Cursos, Diplomados, Seminarios o Técnico Laboral). ¿Me podrían brindar más información?";
const CAMPUS_URL = "https://site2.q10.com/login?ReturnUrl=%2F&aplentId=0d310659-db68-4e7b-af78-aa3ab62eb1f2";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type TagModalContent = {
  title: string;
  description: string;
  items: { name: string; desc: string }[];
};

const formacionTagModals: Record<string, TagModalContent> = {
  "Cursos": {
    title: "Cursos de Formación",
    description: "Programas cortos de capacitación con certificación en SST y normativa laboral.",
    items: [
      { name: "Primeros Auxilios",        desc: "Atención pre-hospitalaria y soporte vital básico certificado por organismo avalado." },
      { name: "Trabajo en Alturas",       desc: "Certificación obligatoria según Resolución 4272 de 2021 para trabajo seguro en alturas." },
      { name: "Brigadas de Emergencia",   desc: "Formación de brigadistas para respuesta ante incendios, evacuación y primeros auxilios." },
      { name: "Riesgo Eléctrico (RETIE)", desc: "Identificación y control del riesgo eléctrico en instalaciones industriales y comerciales." },
      { name: "Espacios Confinados",      desc: "Protocolos de seguridad para acceso, permanencia y rescate en espacios confinados." },
      { name: "Manejo Manual de Cargas",  desc: "Técnicas ergonómicas para la manipulación segura de cargas y prevención de lesiones." },
    ],
  },
  "Diplomados": {
    title: "Diplomados",
    description: "Programas intensivos de mayor profundidad técnica y académica en SST.",
    items: [
      { name: "Diplomado en SST",                  desc: "Formación integral de 120 horas en Sistema de Gestión de Seguridad y Salud en el Trabajo." },
      { name: "Diplomado Sistemas de Gestión ISO",  desc: "Diseño, implementación y auditoría de sistemas integrados ISO 9001, 14001 y 45001." },
      { name: "Diplomado Gestión del Riesgo",       desc: "Metodologías para identificación, valoración y control de riesgos laborales." },
    ],
  },
  "Seminarios": {
    title: "Seminarios",
    description: "Eventos académicos de actualización normativa y mejores prácticas del sector.",
    items: [
      { name: "Actualización Normativa SST",     desc: "Novedades en legislación de seguridad laboral colombiana y tendencias internacionales." },
      { name: "Gestión de Emergencias",           desc: "Planificación, simulacros y respuesta efectiva ante emergencias empresariales." },
      { name: "Liderazgo y Cultura Preventiva",   desc: "Herramientas para construir una sólida cultura de autocuidado en la organización." },
    ],
  },
  "Técnico Laboral": {
    title: "Técnico Laboral",
    description: "Programas técnicos en 1 año con metodología PAT (Presencialidad Asistida por Tecnología). Titulación oficial reconocida.",
    items: [
      { name: "TAE · Técnico Laboral en Auxiliar de Enfermería", desc: "Con énfasis en APH (Atención Prehospitalaria). Formación para soporte vital básico y atención de urgencias." },
      { name: "TSST · Técnico en Seguridad y Salud en el Trabajo", desc: "Con énfasis en TAR (Tareas de Alto Riesgo). Gestión integral del SG-SST y control de riesgos laborales." },
      { name: "TAF · Técnico Auxiliar en Servicios Farmacéuticos", desc: "Formación en dispensación, almacenamiento y control de medicamentos en establecimientos farmacéuticos." },
      { name: "TAEC · Técnico Auxiliar en Cosmetología y Estética", desc: "Técnicas y protocolos de belleza, cuidado corporal y estética profesional con aval institucional." },
    ],
  },
};

const formacionTags = ["Cursos", "Diplomados", "Seminarios", "Técnico Laboral"];

const certificaciones = [
  { title: "RCP y DEA", issuer: "Certificado por ACES INTERNACIONAL" },
  { title: "Stop the Bleed", issuer: "Certificado por el Colegio Americano de Cirujanos" },
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
            <span className="section-label mb-4 block">
              <span className="w-6 h-px bg-primary" />
              Capacitación Certificada en SST
            </span>
            <h2
              className="font-display mt-3 mb-5 text-foreground leading-[0.9] whitespace-nowrap"
              style={{ fontSize: "clamp(1.9rem, 5.2vw, 3.75rem)" }}
            >
              FORMA<span className="text-gradient-gold">CIÓN</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-5 text-[14px] sm:text-[15px]">
              Proceso educativo continuo, sistemático y participativo de manera presencial
              como virtual en nuestra plataforma Q10, que desarrolla habilidades y
              competencias para promover, proteger y mantener la salud y el bienestar de
              las personas. Con certificaciones internacionales como:
            </p>

            {/* Certificaciones internacionales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
              {certificaciones.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 glass-card rounded-xl p-3.5 border border-[hsl(43_78%_50%/0.12)]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-foreground leading-tight">
                      {cert.title}
                    </p>
                    <p className="font-body text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {cert.issuer}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tag buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              {formacionTags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, y: 8 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                  onClick={() => setActiveModal(tag)}
                  className="inline-flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-full border
                             bg-[hsl(43_78%_50%/0.1)] text-primary/80 border-[hsl(43_78%_50%/0.2)]
                             hover:bg-[hsl(43_78%_50%/0.2)] hover:border-[hsl(43_78%_50%/0.45)] hover:text-primary
                             transition-all duration-200 cursor-pointer"
                >
                  {tag}
                  <span className="text-primary/60 text-[10px]">↗</span>
                </motion.button>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                           font-body font-bold text-sm text-primary
                           border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                           hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                           transition-all duration-200"
              >
                <WhatsAppIcon />
                Escríbenos al WhatsApp
              </a>

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

            {/* Floating badges */}
            <motion.div
              className="hidden sm:flex absolute -bottom-5 left-4 md:left-8 glass-card rounded-2xl px-5 py-4 border border-[hsl(43_78%_50%/0.3)] glow-gold-sm flex-col"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-display text-3xl text-gradient-gold leading-none">SST</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Certificado</p>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-5 right-4 md:right-8 glass-card rounded-xl px-4 py-3 border border-[hsl(43_78%_50%/0.15)] items-center gap-3"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-base text-gradient-gold leading-none">PAT</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Metodología</p>
              </div>
            </motion.div>
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
                <div className="overflow-y-auto p-5 space-y-3 flex-1">
                  {modal.items.map((item) => (
                    <div key={item.name} className="glass-card rounded-xl p-4 border border-[hsl(43_78%_50%/0.1)]">
                      <p className="font-body text-sm font-semibold text-foreground mb-1">{item.name}</p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
