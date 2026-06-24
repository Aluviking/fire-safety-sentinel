import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Heart, ClipboardCheck, BookOpen, ThumbsUp,
  GraduationCap, X, Images,
  HardHat, Zap, Lock, BarChart2, Eye, Scale,
  ShieldCheck, Brain, AlertCircle,
} from "lucide-react";

const WA_NUMBER = "573181800010";

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

/* ── Servicios principales (5 líneas SISO) ── */
const mainServices = [
  {
    id: "svc-consultoria",
    icon: Heart,
    title: "CONSULTORÍA",
    subtitle: "Gestión en Salud, Riesgo y Amenazas",
    description:
      "Diagnóstico, diseño e implementación de programas para proteger la salud de su talento humano y controlar los riesgos en el entorno laboral.",
    tags: ["Gestión en Salud", "Vigilancia Epidemiológica", "Gestión del Riesgo", "Planes de Emergencia", "Gestión de Amenazas"],
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
    tagColor: "bg-[hsl(43_92%_64%/0.08)] text-accent/80 border-[hsl(43_92%_64%/0.2)]",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Consultoría* en Gestión en Salud, Riesgo y Amenazas. ¿Me podrían brindar más información?",
    campusHref: null,
  },
  {
    id: "svc-auditoria",
    icon: ClipboardCheck,
    title: "AUDITORÍA",
    subtitle: "Evaluación y Mejora Continua",
    description:
      "Verificación sistemática del cumplimiento normativo por auditores certificados. Desde el diagnóstico inicial hasta el seguimiento post-auditoría.",
    tags: ["Auditorías Internas", "Auditorías Externas", "Ciberseguridad", "Seguimiento y Mejora"],
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
    tagColor: "bg-[hsl(43_78%_50%/0.1)] text-primary/80 border-[hsl(43_78%_50%/0.2)]",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Auditoría* (Interna, Externa y Seguimiento). ¿Me podrían brindar más información?",
    campusHref: null,
  },
  {
    id: "svc-formacion",
    icon: BookOpen,
    title: "FORMACIÓN",
    subtitle: "",
    description:
      "Capacitación certificada en SST, gestión de riesgos y normativa laboral, disponible presencial y en nuestra plataforma de Campus Virtual.",
    tags: ["Cursos", "Diplomados", "Seminarios", "Técnico Laboral"],
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
    tagColor: "bg-[hsl(43_92%_64%/0.08)] text-accent/80 border-[hsl(43_92%_64%/0.2)]",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Formación* (Cursos, Diplomados y Seminarios). ¿Me podrían brindar más información?",
    campusHref: "https://site2.q10.com/login?ReturnUrl=%2F&aplentId=0d310659-db68-4e7b-af78-aa3ab62eb1f2",
  },
  {
    id: "svc-bienestar",
    icon: ThumbsUp,
    title: "BIENESTAR",
    subtitle: "Clima Laboral & Salud Integral",
    description:
      "Programas que fortalecen la cultura del autocuidado, mejoran el clima organizacional y potencian el desempeño del equipo humano.",
    tags: ["Coaching Indoor", "Coaching Outdoor", "Clima Laboral", "Salud Mental", "Riesgo Psicosocial"],
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
    tagColor: "bg-[hsl(43_78%_50%/0.1)] text-primary/80 border-[hsl(43_78%_50%/0.2)]",
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Bienestar Empresarial* (Coaching Indoor y Outdoor). ¿Me podrían brindar más información?",
    campusHref: null,
  },
];

/* ── Catálogo por categorías ── */
const catalog = [
  {
    category: "GESTIÓN & CONSULTORÍA",
    color: "hsl(43 78% 50%)",
    colorMuted: "hsl(43 78% 50% / 0.12)",
    icon: ShieldCheck,
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Gestión & Consultoría* (SG-SST, Auditorías, Planes de Emergencia). ¿Me podrían brindar más información?",
    services: [
      { icon: ClipboardCheck, name: "Diseño SG-SST",         desc: "Diseño e implementación del Sistema de Gestión en Seguridad y Salud en el Trabajo." },
      { icon: BarChart2,      name: "Auditorías Internas",   desc: "Evaluación sistemática del cumplimiento normativo y mejora continua de procesos." },
      { icon: AlertCircle,    name: "Planes de Emergencia",  desc: "Protocolos estructurados de respuesta ante emergencias y evacuación." },
      { icon: Brain,          name: "Batería de Riesgo Psicosocial", desc: "Aplicamos y validamos la batería oficial para evaluar el riesgo psicosocial en su empresa." },
    ],
  },
  {
    category: "SEGURIDAD INDUSTRIAL",
    color: "hsl(25 80% 55%)",
    colorMuted: "hsl(25 80% 55% / 0.12)",
    icon: HardHat,
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Seguridad Industrial* (Trabajo en Alturas, Espacios Confinados, Riesgo Eléctrico). ¿Me podrían brindar más información?",
    services: [
      { icon: HardHat,  name: "Trabajo en Alturas",        desc: "Certificación y entrenamiento para trabajo seguro en alturas según norma RETIE." },
      { icon: Lock,     name: "Espacios Confinados",       desc: "Protocolos de entrada, rescate y permisos para espacios de acceso restringido." },
      { icon: Zap,      name: "Riesgo Eléctrico (RETIE)",  desc: "Identificación, control y mitigación del riesgo eléctrico en instalaciones industriales." },
      { icon: Lock,     name: "Bloqueo y Etiquetado",      desc: "Procedimientos LOTO para el control de energías peligrosas durante mantenimiento." },
    ],
  },
  {
    category: "BIENESTAR LABORAL",
    color: "hsl(160 60% 40%)",
    colorMuted: "hsl(160 60% 40% / 0.12)",
    icon: Heart,
    waMessage: "Hola, buenas tardes. Estoy interesado/a en los servicios de *Bienestar Laboral* (Ergonomía, Vigilancia Epidemiológica, Capacitación). ¿Me podrían brindar más información?",
    services: [
      { icon: BarChart2,      name: "Estudios de Puestos de Trabajo", desc: "Análisis ergonómico y de condiciones de trabajo para optimizar el ambiente laboral." },
      { icon: Eye,            name: "Sistemas de Vigilancia",         desc: "Vigilancia epidemiológica y seguimiento de indicadores de salud ocupacional." },
      { icon: Scale,          name: "Ergonomía",                      desc: "Evaluación y mejora de las condiciones físicas del puesto de trabajo." },
      { icon: GraduationCap,  name: "Capacitación",                   desc: "Formación continua en SST, normativa laboral y cultura del autocuidado." },
    ],
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  /* ── Highlight al navegar desde el hero ── */
  const [highlightId, setHighlightId] = useState<string | null>(null);

  /* ── Modal de formación ── */
  const [openModal, setOpenModal] = useState<TagModalContent | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const applyHash = () => {
      if (observer) { observer.disconnect(); observer = null; }

      const hash = window.location.hash.slice(1);
      if (mainServices.some((s) => s.id === hash)) {
        setHighlightId(hash);

        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (!el) return;

          let hasBeenVisible = false;
          observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                hasBeenVisible = true;
              } else if (hasBeenVisible) {
                setHighlightId(null);
                observer?.disconnect();
                observer = null;
              }
            },
            { threshold: 0.15 }
          );
          observer.observe(el);
        });
      }
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
    <section
      id="servicios"
      className="section-padding relative overflow-hidden"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[hsl(35_9%_9%)]" />
      <div className="absolute inset-0 dot-pattern opacity-50" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.2)] to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.04)] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6"
        >
          <div>
            <span className="section-label mb-4 block">
              <span className="w-6 h-px bg-primary" />
              Qué hacemos
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[0.9]">
              NUESTROS{" "}
              <span className="text-gradient-gold">SERVICIOS</span>
            </h2>
          </div>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm leading-relaxed md:text-right hidden md:block">
            Oferta integral en Seguridad y Salud en el Trabajo para empresas de todos los sectores.
          </p>
        </motion.div>

        {/* ── Main services grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
          {mainServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={`group relative glass-card border-l-2 ${service.accent} rounded-2xl p-7 sm:p-8
                            hover:glass-card-hover transition-all duration-700 overflow-hidden
                            lg:col-span-3
                            ${highlightId === service.id
                              ? "ring-2 ring-[hsl(43_90%_60%/0.8)] shadow-[0_0_0_1px_hsl(43_90%_60%/0.3),0_0_55px_hsl(43_78%_50%/0.45)] scale-[1.012]"
                              : ""}`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[hsl(43_78%_50%/0.05)] to-transparent" />
                {/* Glow de navegación desde el hero */}
                <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 bg-gradient-to-br from-[hsl(43_78%_50%/0.12)] via-[hsl(43_78%_50%/0.06)] to-transparent
                                 ${highlightId === service.id ? "opacity-100" : "opacity-0"}`} />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-4 transition-colors duration-300`}>
                    <Icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>

                  {/* Title + subtitle */}
                  <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight tracking-wide">
                    {service.title}
                  </h3>
                  {service.subtitle && (
                    <p className="font-body text-sm text-primary/60 font-semibold tracking-[0.12em] uppercase mt-0.5 mb-3">
                      {service.subtitle}
                    </p>
                  )}

                  {/* Tags de formación — van ANTES de la descripción */}
                  {service.id === "svc-formacion" && (
                    <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                      {service.tags.map((tag) => {
                        const modal = formacionTagModals[tag];
                        return modal ? (
                          <button
                            key={tag}
                            onClick={() => setOpenModal(modal)}
                            className={`inline-flex items-center gap-1 font-body text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer
                                        transition-all duration-150 hover:scale-105 active:scale-95
                                        ${service.tagColor}`}
                          >
                            {tag}
                            <span className="opacity-60 text-[10px]">↗</span>
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Description */}
                  <p className="font-body text-base text-muted-foreground leading-relaxed flex-1">
                    {service.description}
                  </p>

                  {/* Sub-category tags (todas las demás cards) */}
                  {service.id !== "svc-formacion" && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-block font-body text-xs font-medium px-2.5 py-0.5 rounded-full border ${service.tagColor}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-5 flex flex-col gap-2">
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(service.waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                 font-body font-bold text-sm text-primary
                                 border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                                 hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                                 transition-all duration-200"
                    >
                      <WhatsAppIcon />
                      Escríbenos al WhatsApp
                    </a>
                    {service.campusHref && (
                      <a
                        href={service.campusHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                                   font-body font-bold text-sm text-black
                                   bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                                   hover:brightness-105 transition-all duration-200
                                   shadow-[0_3px_14px_hsl(43_78%_50%/0.3)]"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Ir al Campus Virtual
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Catalog ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 sm:mt-16"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.2)] to-transparent mb-10" />

          <div className="text-center mb-8 px-0">
            <span className="section-label mb-3 inline-flex">
              <span className="w-6 h-px bg-primary" />
              Catálogo completo
            </span>
            <h3 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[0.9] mt-2">
              NUESTRO <span className="text-gradient-gold">CATÁLOGO</span>
            </h3>
            <p className="font-body text-muted-foreground text-sm sm:text-base mt-3 max-w-lg mx-auto">
              Explore nuestra oferta integral diseñada para cubrir cada aspecto de la seguridad laboral.
            </p>
          </div>

          {/* Catalog categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {catalog.map((cat, ci) => {
              const CatIcon = cat.icon;
              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.6 + ci * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  {/* Category header */}
                  <div
                    className="px-6 py-5 flex items-center gap-3"
                    style={{ background: `linear-gradient(135deg, ${cat.colorMuted}, transparent)`, borderBottom: `1px solid ${cat.color}30` }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cat.colorMuted }}
                    >
                      <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <span
                      className="font-display text-base sm:text-lg tracking-wide"
                      style={{ color: cat.color }}
                    >
                      {cat.category}
                    </span>
                  </div>

                  {/* Services list */}
                  <div className="p-5 space-y-3">
                    {cat.services.map((svc) => {
                      const SvcIcon = svc.icon;
                      return (
                        <div
                          key={svc.name}
                          className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-[hsl(43_78%_50%/0.06)] transition-colors cursor-default"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: cat.colorMuted }}
                          >
                            <SvcIcon className="w-4 h-4" style={{ color: cat.color }} />
                          </div>
                          <div>
                            <p className="font-body font-semibold text-base text-foreground leading-tight">
                              {svc.name}
                            </p>
                            <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">
                              {svc.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    <a
                      href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(cat.waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
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
        </motion.div>
      </div>
    </section>

      {/* ── Modal de formación ── */}
      <AnimatePresence mode="wait">
        {openModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6"
            onClick={() => setOpenModal(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Panel */}
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full sm:max-w-lg
                         bg-[hsl(35_9%_10%)] border border-[hsl(43_78%_50%/0.25)]
                         rounded-t-3xl sm:rounded-2xl
                         max-h-[88vh] sm:max-h-[80vh] flex flex-col
                         shadow-[0_0_80px_hsl(43_78%_50%/0.12)]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-[hsl(43_78%_50%/0.15)]">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground leading-tight">
                    {openModal.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">
                    {openModal.description}
                  </p>
                </div>
                <button
                  onClick={() => setOpenModal(null)}
                  className="shrink-0 w-8 h-8 rounded-full
                             bg-[hsl(43_78%_50%/0.08)] border border-[hsl(43_78%_50%/0.2)]
                             flex items-center justify-center text-primary
                             hover:bg-[hsl(43_78%_50%/0.18)] transition-colors duration-150"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items */}
              <div className="overflow-y-auto p-6 space-y-3">
                {openModal.items.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl bg-[hsl(43_78%_50%/0.05)] border border-[hsl(43_78%_50%/0.12)]
                               hover:bg-[hsl(43_78%_50%/0.09)] transition-colors duration-150"
                  >
                    <p className="font-body font-semibold text-sm text-foreground">{item.name}</p>
                    <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-[hsl(43_78%_50%/0.15)]">
                <a
                  href="#galeria"
                  onClick={() => setOpenModal(null)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                             font-body font-bold text-sm text-primary
                             border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.07)]
                             hover:bg-[hsl(43_78%_50%/0.15)] hover:border-[hsl(43_78%_50%/0.65)]
                             transition-all duration-200"
                >
                  <Images className="w-4 h-4 shrink-0" />
                  Ver galería
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServicesSection;
