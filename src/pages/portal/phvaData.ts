/* ─── Estructura PHVA — fuente única compartida entre PortalEmpresa y PortalDashboard ── */
export const PHVA = [
  {
    letra: "P", nombre: "Planear",
    color: "#b45309", bg: "#fef3c7", border: "#fcd34d",
    desc: "Establecer políticas, objetivos y procesos del SG-SST.",
    carpetas: [
      "Política de SST", "Objetivos e Indicadores SST", "Identificación de Peligros",
      "Matriz de Requisitos Legales", "Programa de Gestión SST",
      "Plan de Trabajo Anual", "Roles y Responsabilidades",
    ],
  },
  {
    letra: "H", nombre: "Hacer",
    color: "#0369a1", bg: "#e0f2fe", border: "#7dd3fc",
    desc: "Implementar los procesos según lo planificado.",
    carpetas: [
      "Capacitaciones y Entrenamientos", "Inspecciones de Seguridad",
      "Investigación de Incidentes", "Elementos de Protección Personal",
      "Gestión de Contratistas", "Simulacros y Emergencias",
      "Exámenes Médicos Ocupacionales",
    ],
  },
  {
    letra: "V", nombre: "Verificar",
    color: "#059669", bg: "#d1fae5", border: "#6ee7b7",
    desc: "Realizar seguimiento y medición de los procesos.",
    carpetas: [
      "Indicadores de Gestión SST", "Auditorías Internas",
      "Revisión por la Dirección", "Registro de Accidentes de Trabajo",
      "Enfermedades Laborales", "No Conformidades",
      "Estadísticas de Siniestralidad",
    ],
  },
  {
    letra: "A", nombre: "Actuar",
    color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd",
    desc: "Tomar acciones para mejorar continuamente.",
    carpetas: [
      "Acciones Correctivas", "Acciones Preventivas",
      "Plan de Mejora Continua", "Lecciones Aprendidas",
      "Actualizaciones del SG-SST",
    ],
  },
] as const;

export type LetraPhva = "P" | "H" | "V" | "A";

/** Total de carpetas PHVA posibles por empresa (7+7+7+5) — base para el % de avance. */
export const PHVA_TOTAL_FOLDERS = PHVA.reduce((sum, p) => sum + p.carpetas.length, 0);
