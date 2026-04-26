import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BookOpen, HeartPulse, Layers, Users, Monitor, Flame,
  ShieldCheck, ArrowRight,
  HardHat, Zap, Lock, BarChart2, Eye, Scale, GraduationCap,
  ClipboardCheck, AlertCircle, Brain,
} from "lucide-react";

/* ── Servicios principales ── */
const mainServices = [
  {
    icon: BookOpen,
    title: "FORMACIÓN DE BRIGADAS",
    description:
      "Procesos formativos estructurados para fortalecer la capacidad de respuesta ante emergencias, alineados con la normativa vigente y las mejores prácticas en gestión del riesgo.",
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
  },
  {
    icon: HeartPulse,
    title: "CONSULTORÍA EN SALUD LABORAL",
    description:
      "Bienestar físico, mental y emocional: pausas activas, jornadas de salud, batería de riesgo psicosocial e implementación de Sistemas de Vigilancia Epidemiológica.",
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
  },
  {
    icon: Layers,
    title: "ASESORÍA EN SIG",
    description:
      "Sistemas de Gestión Integrados que unifican Calidad, Medio Ambiente y SST en una sola estructura, optimizando operaciones y garantizando cumplimiento normativo.",
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "BIENESTAR EMPRESARIAL",
    description:
      "Programas que fortalecen la cultura del autocuidado, mejoran el clima laboral y potencian el desempeño del equipo humano de su organización.",
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
  },
  {
    icon: Monitor,
    title: "CAMPUS VIRTUAL",
    description:
      "Plataforma e-learning con cursos especializados en SST, gestión de riesgos y normativa laboral, accesibles en cualquier momento y lugar.",
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
  },
  {
    icon: Flame,
    title: "PROTECCIÓN CONTRA INCENDIOS",
    description:
      "Planes de evacuación, protocolos de respuesta y formación de equipos para actuar de manera coordinada y eficiente ante emergencias por incendio.",
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
  },
];

/* ── Catálogo por categorías ── */
const catalog = [
  {
    category: "GESTIÓN & CONSULTORÍA",
    color: "hsl(43 78% 50%)",
    colorMuted: "hsl(43 78% 50% / 0.12)",
    icon: ShieldCheck,
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
    icon: HeartPulse,
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


  return (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {mainServices.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={`group relative glass-card border-l-2 ${service.accent} rounded-2xl p-7 sm:p-8 hover:glass-card-hover transition-all duration-300 overflow-hidden cursor-default`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[hsl(43_78%_50%/0.05)] to-transparent" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 transition-colors duration-300`}>
                    <Icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>

                  <h3 className="font-display text-xl md:text-2xl text-foreground mb-3 tracking-wide leading-tight">
                    {service.title}
                  </h3>

                  <p className="font-body text-base text-muted-foreground leading-relaxed flex-1">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-primary font-body font-semibold text-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    Solicitar información
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Catalog toggle ── */}
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
                            <p className="font-body font-semibold text-[15px] text-foreground leading-tight">
                              {svc.name}
                            </p>
                            <p className="font-body text-[13px] text-muted-foreground mt-1 leading-relaxed">
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
                      href="#contacto"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-body font-bold text-sm text-primary border border-[hsl(43_78%_50%/0.25)] hover:bg-[hsl(43_78%_50%/0.08)] hover:border-[hsl(43_78%_50%/0.45)] transition-all"
                    >
                      Solicitar información
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
