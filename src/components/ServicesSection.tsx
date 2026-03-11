import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, HeartPulse, Layers, Users, Monitor, Flame, ArrowRight } from "lucide-react";

const services = [
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

      {/* Orb dorado */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.04)] blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
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
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9]">
              NUESTROS{" "}
              <span className="text-gradient-gold">SERVICIOS</span>
            </h2>
          </div>
          <p className="font-body text-muted-foreground text-sm md:text-base max-w-xs leading-relaxed md:text-right hidden md:block">
            Oferta integral en Seguridad y Salud en el Trabajo para empresas de todos los sectores.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 28 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={`group relative glass-card border-l-2 ${service.accent} rounded-2xl p-7 hover:glass-card-hover transition-all duration-300 overflow-hidden cursor-default`}
              >
                {/* Shimmer hover overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[hsl(43_78%_50%/0.05)] to-transparent" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center mb-5 transition-colors duration-300`}>
                    <Icon className={`w-6 h-6 ${service.iconColor}`} />
                  </div>

                  <h3 className="font-display text-lg md:text-xl text-foreground mb-3 tracking-wide leading-tight">
                    {service.title}
                  </h3>

                  <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-primary font-body font-semibold text-[13px] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    Solicitar información
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
