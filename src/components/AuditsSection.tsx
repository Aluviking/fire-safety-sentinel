import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, CheckCircle2, Compass, ClipboardList } from "lucide-react";
import auditImage from "@/assets/audit-image.jpg";

const asesoriaEn = [
  "Sistemas de gestión integrado",
  "Planes estratégicos de seguridad vial",
  "Tareas de alto riesgo",
];

const serviciosAsesoria = [
  "Diagnóstico inicial y planificación de la implementación",
  "Capacitación al personal en cada norma",
  "Documentación del sistema y diseño de procedimientos",
  "Auditorías internas y acompañamiento en certificaciones",
  "Actualización y transición entre versiones normativas",
];

const normasIntegramos = [
  { code: "ISO 9001", name: "Gestión de la Calidad" },
  { code: "ISO 14001", name: "Gestión Ambiental" },
  { code: "TAR", name: "Tareas de Alto Riesgo" },
  { code: "ISO 45001 (y OHSAS 18001)", name: "Seguridad y Salud en el Trabajo" },
  { code: "PESV", name: "Plan Estratégico de Seguridad Vial" },
];

const AuditsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="auditorias" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(35_9%_9%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="hidden md:block absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.05)] blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Image ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-gold">
              <img
                src={auditImage}
                alt="Auditoría de seguridad industrial"
                className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_8%_5%/0.45)] via-transparent to-transparent rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(43_78%_50%/0.04)] to-transparent rounded-2xl" />
              <div className="absolute inset-0 ring-1 ring-[hsl(43_78%_50%/0.12)] rounded-2xl" />
            </div>

            {/* Floating badges — hidden on mobile to avoid overflow */}
            <motion.div
              className="hidden sm:flex absolute -bottom-5 right-4 md:right-8 glass-card rounded-2xl px-5 py-4 border border-[hsl(43_78%_50%/0.3)] glow-gold-sm flex-col"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-display text-3xl text-gradient-gold leading-none">ISO</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Certificaciones</p>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-5 left-4 md:left-8 glass-card rounded-xl px-4 py-3 border border-[hsl(43_78%_50%/0.15)] items-center gap-3"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-base text-gradient-gold leading-none">100%</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Cumplimiento</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="section-label mb-4 block">
              <span className="w-6 h-px bg-primary" />
              Normas ISO & Sistemas de Gestión
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 mb-5 text-foreground leading-[0.9]">
              ASESORÍA{" "}
              <span className="text-gradient-gold">SISO</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed text-[14px] sm:text-[15px]">
              Servicio especializado de acompañamiento a las organizaciones en el diseño,
              implementación, evaluación y mejora continua de un sistema que integra
              diferentes modelos de gestión en una sola estructura, alineados con los
              estándares internacionales y la normatividad vigente para fortalecer el
              desempeño organizacional.
            </p>
          </motion.div>
        </div>

        {/* ── Asesoría en / Servicios / Normas ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 mt-10 lg:mt-14"
        >
          {/* Asesoría en */}
          <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-foreground">ASESORÍA EN</h3>
            </div>
            <ul className="space-y-3">
              {asesoriaEn.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-muted-foreground leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios de asesoría */}
          <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-foreground leading-tight">
                NUESTROS SERVICIOS DE ASESORÍA
              </h3>
            </div>
            <ul className="space-y-3">
              {serviciosAsesoria.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-muted-foreground leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Normas que integramos */}
          <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-foreground">NORMAS QUE INTEGRAMOS</h3>
            </div>
            <ul className="space-y-3">
              {normasIntegramos.map((norma) => (
                <li key={norma.code}>
                  <p className="font-body text-sm font-semibold text-primary/85 leading-tight">{norma.code}</p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5 leading-snug">{norma.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AuditsSection;
