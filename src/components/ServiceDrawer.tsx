import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ArrowLeft, ExternalLink, GraduationCap } from "lucide-react";

const CAMPUS_URL =
  "https://site2.q10.com/login?ReturnUrl=%2F&aplentId=0d310659-db68-4e7b-af78-aa3ab62eb1f2";

type ServiceItem = {
  title: string;
  href?: string;
};

type SubCategory = {
  title: string;
  desc: string;
  items?: ServiceItem[];
};

type ServiceDef = {
  label: string;
  subs: SubCategory[];
};

export const SERVICE_DETAILS: Record<string, ServiceDef> = {
  asesoria: {
    label: "Asesoría",
    subs: [
      {
        title: "ISO 9001",
        desc: "Sistema de Gestión de Calidad — mejora continua de procesos y satisfacción del cliente.",
      },
      {
        title: "ISO 14001",
        desc: "Sistema de Gestión Ambiental — reducción del impacto ambiental y cumplimiento normativo.",
      },
      {
        title: "ISO 45001 / OHSAS 18001",
        desc: "Sistema de Gestión en Seguridad y Salud en el Trabajo — protección integral del talento humano.",
      },
      {
        title: "Sistema Integrado de Gestión",
        desc: "Integración de ISO 9001 · ISO 14001 · ISO 45001 en un único sistema eficiente y certificable.",
      },
      {
        title: "ISO 27001",
        desc: "Sistema de Gestión de Seguridad de la Información — protección de activos digitales y datos críticos.",
      },
      {
        title: "Otras normas",
        desc: "NTC, RETIE, normas sectoriales y estándares internacionales adaptados a su sector.",
      },
    ],
  },
  consultoria: {
    label: "Consultoría",
    subs: [
      {
        title: "Gestión en Salud",
        desc: "Programas integrales de vigilancia epidemiológica y bienestar del trabajador.",
        items: [
          { title: "Vigilancia Epidemiológica" },
          { title: "Exámenes Médicos Ocupacionales" },
          { title: "Pausas Activas y Ergonomía" },
          { title: "Programas de Prevención de Enfermedades" },
          { title: "Gestión de Ausentismo Laboral" },
        ],
      },
      {
        title: "Gestión del Riesgo",
        desc: "Identificación, evaluación y control de peligros en el entorno laboral.",
        items: [
          { title: "Identificación de Peligros (IPER)" },
          { title: "Matrices de Riesgo y Controles" },
          { title: "Planes de Emergencia y Contingencia" },
          { title: "Inspecciones de Seguridad" },
          { title: "Investigación de Accidentes e Incidentes" },
        ],
      },
      {
        title: "Gestión de Amenazas",
        desc: "Análisis de vulnerabilidades y preparación ante eventos críticos.",
        items: [
          { title: "Análisis de Vulnerabilidades" },
          { title: "Planes de Contingencia" },
          { title: "Simulacros y Entrenamiento" },
          { title: "Gestión de Crisis" },
        ],
      },
    ],
  },
  auditoria: {
    label: "Auditoría",
    subs: [
      {
        title: "Auditorías Internas",
        desc: "Evaluación sistemática del cumplimiento del sistema de gestión por auditores propios certificados.",
      },
      {
        title: "Auditorías Externas",
        desc: "Verificación independiente de requisitos normativos para certificación o renovación ante entes certificadores.",
      },
      {
        title: "Diagnóstico Inicial (Gap Analysis)",
        desc: "Evaluación del estado actual de la organización frente a los requisitos de la norma aplicable.",
      },
      {
        title: "Seguimiento y Mejora Continua",
        desc: "Monitoreo de acciones correctivas y verificación de eficacia después de cada ciclo de auditoría.",
      },
    ],
  },
  formacion: {
    label: "Formación",
    subs: [
      {
        title: "Cursos",
        desc: "Capacitaciones cortas y certificadas en seguridad, salud y gestión empresarial.",
        items: [
          { title: "Primeros Auxilios", href: CAMPUS_URL },
          { title: "Brigadas de Emergencia", href: CAMPUS_URL },
          { title: "Manejo de Extintores", href: CAMPUS_URL },
          { title: "SST para Trabajadores", href: CAMPUS_URL },
          { title: "Trabajo en Alturas", href: CAMPUS_URL },
          { title: "Señalización y Evacuación", href: CAMPUS_URL },
        ],
      },
      {
        title: "Diplomados",
        desc: "Programas de actualización de mediana duración con certificado de competencia.",
        items: [
          { title: "Diplomado en Seguridad y Salud en el Trabajo", href: CAMPUS_URL },
          { title: "Diplomado en Sistemas de Gestión ISO", href: CAMPUS_URL },
          { title: "Diplomado en Auditorías Internas", href: CAMPUS_URL },
        ],
      },
      {
        title: "Seminarios",
        desc: "Eventos de actualización y profundización en temas especializados del sector.",
        items: [
          { title: "Seminario de Actualización Normativa", href: CAMPUS_URL },
          { title: "Seminario de Liderazgo en Seguridad", href: CAMPUS_URL },
          { title: "Seminario de Riesgo Psicosocial", href: CAMPUS_URL },
        ],
      },
    ],
  },
  bienestar: {
    label: "Bienestar",
    subs: [
      {
        title: "Programas de Bienestar Empresarial",
        desc: "Diseño e implementación de estrategias para mejorar la calidad de vida y el compromiso en el trabajo.",
      },
      {
        title: "Actividades Deportivas y Recreativas",
        desc: "Organización de jornadas y eventos que fortalecen el sentido de equipo y la salud física.",
      },
      {
        title: "Gestión del Clima Laboral",
        desc: "Diagnóstico y planes de mejora del ambiente organizacional y las relaciones interpersonales.",
      },
      {
        title: "Salud Mental y Riesgo Psicosocial",
        desc: "Programas para la prevención del estrés, el burnout y la promoción del equilibrio vida-trabajo.",
      },
    ],
  },
};

/* ──────────────────────────────────────────────────────────────── */

interface ServiceDrawerProps {
  serviceId: string;
  onClose: () => void;
}

export function ServiceDrawer({ serviceId, onClose }: ServiceDrawerProps) {
  const service = SERVICE_DETAILS[serviceId];
  const [activeSub, setActiveSub] = useState<SubCategory | null>(null);

  if (!service) return null;

  const hasSubs = (sub: SubCategory) =>
    Array.isArray(sub.items) && sub.items.length > 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col
                   w-full sm:max-w-[400px] lg:max-w-[460px]
                   bg-[hsl(30_8%_8%)] border-l border-[hsl(43_78%_50%/0.18)]
                   shadow-[-20px_0_80px_hsl(0_0%_0%/0.55)]"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-[hsl(43_78%_50%/0.15)] shrink-0"
          style={{ padding: "clamp(14px,2vh,22px) clamp(16px,2.5vw,28px)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {activeSub && (
              <button
                type="button"
                onClick={() => setActiveSub(null)}
                className="flex items-center justify-center w-8 h-8 rounded-full shrink-0
                           border border-[hsl(43_78%_50%/0.3)] text-primary/60
                           hover:text-primary hover:border-[hsl(43_78%_50%/0.65)]
                           transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/55 font-semibold">
                {activeSub ? service.label : "Servicio"}
              </p>
              <h2
                className="font-display text-[hsl(43_90%_64%)] tracking-[0.1em] leading-none truncate"
                style={{ fontSize: "clamp(18px,3vh,26px)" }}
              >
                {activeSub ? activeSub.title.toUpperCase() : service.label.toUpperCase()}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0
                       border border-[hsl(43_78%_50%/0.2)] text-muted-foreground
                       hover:text-primary hover:border-[hsl(43_78%_50%/0.5)]
                       transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "clamp(12px,1.8vh,20px) clamp(16px,2.5vw,28px)" }}
        >
          <AnimatePresence mode="wait">
            {!activeSub ? (
              /* ── Level 1: sub-category cards ── */
              <motion.div
                key="level1"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {service.subs.map((sub) => (
                  <button
                    key={sub.title}
                    type="button"
                    onClick={() => hasSubs(sub) ? setActiveSub(sub) : undefined}
                    className={`w-full text-left rounded-xl border transition-all duration-200 group
                                bg-[hsl(35_10%_11%)] border-[hsl(43_78%_50%/0.1)]
                                hover:bg-[hsl(35_10%_14%)] hover:border-[hsl(43_78%_50%/0.28)]
                                ${hasSubs(sub) ? "cursor-pointer" : "cursor-default"}`}
                    style={{ padding: "clamp(12px,1.6vh,18px) clamp(14px,1.8vw,20px)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-display text-[hsl(43_88%_62%)] tracking-[0.08em] leading-tight
                                     group-hover:text-[hsl(43_90%_68%)] transition-colors duration-200"
                          style={{ fontSize: "clamp(13px,1.8vh,17px)" }}
                        >
                          {sub.title}
                        </p>
                        <p
                          className="font-body text-muted-foreground/75 leading-snug mt-1"
                          style={{ fontSize: "clamp(11px,1.35vh,13px)" }}
                        >
                          {sub.desc}
                        </p>
                      </div>
                      {hasSubs(sub) && (
                        <ChevronRight
                          className="w-4 h-4 text-primary/35 group-hover:text-primary/75
                                     group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              /* ── Level 2: item list ── */
              <motion.div
                key={`level2-${activeSub.title}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <p
                  className="font-body text-muted-foreground/65 leading-relaxed mb-3"
                  style={{ fontSize: "clamp(12px,1.45vh,14px)" }}
                >
                  {activeSub.desc}
                </p>

                {activeSub.items?.map((item, idx) =>
                  item.href ? (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border
                                 border-[hsl(43_78%_50%/0.12)] bg-[hsl(35_10%_11%)]
                                 hover:bg-[hsl(35_10%_15%)] hover:border-[hsl(43_78%_50%/0.32)]
                                 text-white/75 hover:text-[hsl(43_88%_68%)]
                                 transition-all duration-200 group"
                      style={{
                        padding: "clamp(10px,1.3vh,14px) clamp(14px,1.8vw,18px)",
                        fontSize: "clamp(12px,1.5vh,14px)",
                      }}
                    >
                      <span className="font-body font-medium">{item.title}</span>
                      <ExternalLink
                        className="w-3.5 h-3.5 text-primary/35 group-hover:text-primary/75
                                   transition-colors duration-200 shrink-0"
                      />
                    </a>
                  ) : (
                    <div
                      key={idx}
                      className="flex items-center rounded-lg border
                                 border-[hsl(43_78%_50%/0.1)] bg-[hsl(35_10%_11%)]
                                 text-white/75"
                      style={{
                        padding: "clamp(10px,1.3vh,14px) clamp(14px,1.8vw,18px)",
                        fontSize: "clamp(12px,1.5vh,14px)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0 mr-3" />
                      <span className="font-body font-medium">{item.title}</span>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA — only for FORMACIÓN */}
        {serviceId === "formacion" && (
          <div
            className="shrink-0 border-t border-[hsl(43_78%_50%/0.15)]"
            style={{ padding: "clamp(12px,1.6vh,18px) clamp(16px,2.5vw,28px)" }}
          >
            <a
              href={CAMPUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl
                         bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                         text-black font-body font-extrabold tracking-[0.08em] uppercase
                         hover:brightness-105 active:scale-[0.98] transition-all duration-200
                         shadow-[0_4px_18px_hsl(43_78%_50%/0.35)]"
              style={{
                fontSize: "clamp(12px,1.55vh,14px)",
                padding: "clamp(10px,1.4vh,14px)",
              }}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              Inscríbete en el Campus Virtual
            </a>
          </div>
        )}
      </motion.div>
    </>
  );
}
