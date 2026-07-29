import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, CheckCircle2, ClipboardList } from "lucide-react";
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
          </motion.div>

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mb-5 text-foreground leading-[0.9]">
              ASESORÍA{" "}
              <span className="text-gradient-gold">SISO</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed text-justify text-[14px] sm:text-[15px]">
              Servicio especializado de acompañamiento a las organizaciones en el diseño,
              implementación, evaluación y mejora continua de un sistema que integra
              diferentes modelos de gestión en una sola estructura, alineados con los
              estándares internacionales y la normatividad vigente para fortalecer el
              desempeño organizacional.
            </p>
          </motion.div>
        </div>

        {/* ── Servicios / Normas ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mt-10 lg:mt-14"
        >
          {/* Servicios de asesoría */}
          <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.1)] h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-foreground leading-tight">
                NUESTROS SERVICIOS DE ASESORÍA
              </h3>
            </div>
            <ul className="space-y-4">
              {serviciosAsesoria.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-muted-foreground leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Normas que integramos */}
          <div className="glass-card rounded-2xl p-6 border border-[hsl(43_78%_50%/0.1)] h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg tracking-wide text-foreground">NORMAS QUE INTEGRAMOS</h3>
            </div>
            <ul className="space-y-4">
              {normasIntegramos.map((norma) => (
                <li key={norma.code} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                  <span className="font-body text-sm text-muted-foreground leading-snug">
                    <span className="font-semibold text-primary/85">{norma.code}:</span> {norma.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* ── Asesoría en (suelto, sin card) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8 lg:mt-10"
        >
          {asesoriaEn.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0" />
              <span className="font-body text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AuditsSection;
