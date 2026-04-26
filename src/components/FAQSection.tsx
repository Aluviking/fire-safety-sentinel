import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "¿Qué es el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)?",
    answer:
      "El SG-SST es un sistema que obliga a todas las empresas en Colombia a gestionar los riesgos laborales de sus trabajadores. Consiste en el desarrollo de un proceso lógico y por etapas, basado en la mejora continua, con el objetivo de anticipar, reconocer, evaluar y controlar los riesgos que puedan afectar la seguridad y salud en el trabajo. En SISO diseñamos e implementamos este sistema adaptado a las necesidades y sector de su empresa.",
  },
  {
    question: "¿Qué empresas están obligadas a implementar el SG-SST en Colombia?",
    answer:
      "Según el Decreto 1072 de 2015, todas las empresas en Colombia, sin importar su tamaño o número de trabajadores, están obligadas a implementar el SG-SST. Esto incluye empresas del sector público y privado, independientemente de su actividad económica. Las multas por incumplimiento pueden llegar hasta 500 SMMLV.",
  },
  {
    question: "¿Cuánto tiempo tarda la implementación del SG-SST?",
    answer:
      "El tiempo de implementación varía según el tamaño y complejidad de la empresa. Para microempresas (menos de 10 trabajadores) puede tomar entre 3 y 6 meses. Para empresas medianas puede tomar entre 6 y 12 meses. Para grandes empresas o grupos empresariales, el proceso puede extenderse hasta 18 meses. En SISO acompañamos todo el proceso con un equipo dedicado.",
  },
  {
    question: "¿Qué incluye la Batería de Riesgo Psicosocial?",
    answer:
      "La Batería de Riesgo Psicosocial es un instrumento validado por el Ministerio de Trabajo colombiano (Resolución 2646 de 2008) para evaluar factores de riesgo psicosocial en el trabajo. Incluye: cuestionario de factores de riesgo intralaboral (formas A y B), cuestionario de condiciones extralaborales, cuestionario de estrés laboral y guía de entrevistas semiestructuradas. Los resultados permiten identificar y priorizar intervenciones para mejorar el bienestar de los trabajadores.",
  },
  {
    question: "¿Qué certificaciones maneja SISO?",
    answer:
      "SISO trabaja con las principales certificaciones internacionales en SST y gestión: ISO 9001 (Calidad), ISO 14001 (Medio Ambiente), ISO 45001 (SST), RUC (Registro Único de Contratistas), OHSAS (Salud y Seguridad), BASC (Comercio seguro) e IADC (Rig Pass para industria petrolera). Asesoramos en el proceso de obtención y mantenimiento de estas certificaciones.",
  },
  {
    question: "¿Cómo funciona el Campus Virtual de SISO?",
    answer:
      "El Campus Virtual de SISO es una plataforma e-learning con cursos especializados en SST, gestión de riesgos, normativa laboral y cultura del autocuidado. Los cursos están disponibles 24/7, son accesibles desde cualquier dispositivo y emiten certificados de participación. Contamos con cursos para trabajadores operativos, administrativos y coordinadores de SST.",
  },
  {
    question: "¿En qué consiste la Formación de Brigadas de Emergencia?",
    answer:
      "La formación de brigadas de emergencia es un proceso estructurado mediante el cual capacitamos a un grupo de trabajadores para responder de manera organizada ante situaciones de emergencia (incendios, evacuaciones, primeros auxilios, derrames). El programa incluye: formación teórica, entrenamiento práctico, simulacros y certificación. Está alineado con la normativa NFPA y el Decreto 2393.",
  },
  {
    question: "¿Cómo puedo contratar los servicios de SISO?",
    answer:
      "Para contratar nuestros servicios puede contactarnos a través del formulario de la sección de contacto, escribirnos al correo info@siso.com.co o llamarnos directamente. Nuestro equipo realizará una visita diagnóstica sin costo para evaluar las necesidades de su empresa y presentarle una propuesta personalizada. Trabajamos con empresas de todos los sectores y tamaños en todo Colombia.",
  },
];

const FAQItem = ({ faq, index, isInView }: { faq: typeof faqs[0]; index: number; isInView: boolean }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="border border-[hsl(43_78%_50%/0.15)] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 text-left bg-[hsl(30_8%_8%)] hover:bg-[hsl(43_78%_50%/0.05)] transition-colors"
        aria-expanded={open}
      >
        <span className="font-body font-semibold text-sm sm:text-base md:text-lg text-foreground leading-snug">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[hsl(43_78%_50%/0.1)] flex items-center justify-center"
        >
          <ChevronDown className="w-4 h-4 text-primary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-[hsl(30_8%_6%)] border-t border-[hsl(43_78%_50%/0.1)]">
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="faq" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(30_8%_7%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[hsl(43_78%_50%/0.04)] blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="font-body font-bold text-xs sm:text-sm tracking-[0.18em] uppercase text-primary">
              Preguntas frecuentes
            </span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9]">
            PREGUNTAS{" "}
            <span className="text-gradient-gold">FRECUENTES</span>
          </h2>
          <p className="font-body text-muted-foreground text-sm sm:text-base mt-4 max-w-lg mx-auto leading-relaxed">
            Resolvemos las dudas más comunes sobre nuestros servicios y sobre la normativa de Seguridad y Salud en el Trabajo en Colombia.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} isInView={isInView} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="font-body text-muted-foreground text-base mb-4">
            ¿No encontró su respuesta? Contáctenos directamente.
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2 bg-gradient-fire text-primary-foreground px-8 py-3.5 rounded-xl font-body font-bold text-base hover:opacity-90 active:scale-95 transition-all glow-gold-sm btn-shimmer overflow-hidden relative"
          >
            Hablar con un experto
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
