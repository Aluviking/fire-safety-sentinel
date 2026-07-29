import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Heart, ShieldAlert, Siren, CheckCircle2 } from "lucide-react";

/* ── Consultorías ── */
const mainServices = [
  {
    id: "svc-consultoria",
    icon: Heart,
    title: "GESTIÓN EN SALUD",
    tags: ["SVE (Sistemas de Vigilancia Epidemiológica)", "Pausas saludables", "Jornadas de salud", "Baterías de riesgo Psicosocial", "Exámenes médicos ocupacionales", "Prevención de enfermedades"],
    accent: "border-l-[hsl(43_92%_64%)]",
    iconBg: "bg-[hsl(43_92%_64%/0.12)] group-hover:bg-[hsl(43_92%_64%/0.22)]",
    iconColor: "text-accent",
    checkColor: "text-accent/70",
  },
  {
    id: "svc-consultoria-riesgo",
    icon: ShieldAlert,
    title: "GESTIÓN DEL RIESGO",
    tags: ["Programas de Intervención", "Estándares de Trabajo Seguro", "Inspecciones de Seguridad", "Plan Estratégico de Seguridad Vial", "Control de pérdidas (DNV)", "MATPEL - Manejo seguro de sustancias peligrosas"],
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
    checkColor: "text-primary/70",
  },
  {
    id: "svc-consultoria-amenazas",
    icon: Siren,
    title: "GESTIÓN DE AMENAZAS",
    tags: ["Análisis de Vulnerabilidad", "Programas de Señalización", "Planes de Emergencias", "Comités de Ayuda Mutua", "Plan de continuidad de negocio", "Protección Contra Incendios"],
    accent: "border-l-[hsl(43_78%_50%)]",
    iconBg: "bg-[hsl(43_78%_50%/0.12)] group-hover:bg-[hsl(43_78%_50%/0.22)]",
    iconColor: "text-primary",
    checkColor: "text-primary/70",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  /* ── Highlight al navegar desde el hero ── */
  const [highlightId, setHighlightId] = useState<string | null>(null);

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
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[0.9]">
              CONSULTOR<span className="text-gradient-gold">ÍAS</span>
            </h2>
          </div>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-md leading-relaxed text-justify">
            Brindamos servicios profesionales y especializados a las organizaciones para diseñar,
            implementar, evaluar y mejorar el SG-SST, con el fin de prevenir y controlar los
            riesgos laborales, promover ambientes de trabajo seguros y saludables.
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
                            lg:col-span-2
                            ${highlightId === service.id
                              ? "ring-2 ring-[hsl(43_90%_60%/0.8)] shadow-[0_0_0_1px_hsl(43_90%_60%/0.3),0_0_55px_hsl(43_78%_50%/0.45)] scale-[1.012]"
                              : ""}`}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[hsl(43_78%_50%/0.05)] to-transparent" />
                {/* Glow de navegación desde el hero */}
                <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 bg-gradient-to-br from-[hsl(43_78%_50%/0.12)] via-[hsl(43_78%_50%/0.06)] to-transparent
                                 ${highlightId === service.id ? "opacity-100" : "opacity-0"}`} />

                <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-4 transition-colors duration-300`}>
                    <Icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl md:text-3xl text-foreground leading-tight tracking-wide mb-3">
                    {service.title}
                  </h3>

                  {/* Sub-category checklist */}
                  <ul className="flex-1 flex flex-col justify-center gap-2.5 mt-1 w-full max-w-[300px] lg:max-w-none mx-auto lg:mx-0 text-left">
                    {service.tags.map((tag) => (
                      <li key={tag} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${service.checkColor}`} />
                        <span className="font-body text-[13px] text-muted-foreground leading-snug">{tag}</span>
                      </li>
                    ))}
                  </ul>
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
