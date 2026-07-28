import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck } from "lucide-react";
import auditImage from "@/assets/audit-image.jpg";

const AuditoriasSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="svc-auditoria" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(35_9%_7%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="hidden md:block absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.05)] blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="section-label mb-4 block">
              <span className="w-6 h-px bg-primary" />
              Evaluación y Cumplimiento
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl mt-3 mb-5 text-foreground leading-[0.9]">
              AUDITOR<span className="text-gradient-gold">ÍAS</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-7 text-[14px] sm:text-[15px]">
              Proceso sistemático, independiente y documentado mediante el cual se evalúan
              políticas, procedimientos, controles y condiciones de una organización para
              verificar el cumplimiento de requisitos legales, normativos e internos,
              identificando riesgos y oportunidades de mejora.
            </p>
          </motion.div>

          {/* ── Image ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden glow-gold">
              <img
                src={auditImage}
                alt="Auditorías internas y externas de seguridad"
                className="w-full h-[280px] sm:h-[340px] lg:h-[420px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(30_8%_5%/0.45)] via-transparent to-transparent rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(43_78%_50%/0.04)] to-transparent rounded-2xl" />
              <div className="absolute inset-0 ring-1 ring-[hsl(43_78%_50%/0.12)] rounded-2xl" />
            </div>

            {/* Floating badges */}
            <motion.div
              className="hidden sm:flex absolute -bottom-5 right-4 md:right-8 glass-card rounded-2xl px-5 py-4 border border-[hsl(43_78%_50%/0.3)] glow-gold-sm flex-col"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-display text-2xl text-gradient-gold leading-none">INDEPENDIENTE</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Evaluación objetiva</p>
            </motion.div>

            <motion.div
              className="hidden sm:flex absolute -top-5 left-4 md:left-8 glass-card rounded-xl px-4 py-3 border border-[hsl(43_78%_50%/0.15)] items-center gap-3"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[hsl(43_78%_50%/0.15)] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-base text-gradient-gold leading-none">SST</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">Cumplimiento</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuditoriasSection;
