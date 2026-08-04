/**
 * Catálogo académico real de GFO Academy (períodos, sedes, programas,
 * asignaturas, tipos de identificación). Antes estaba duplicado entre
 * RegistrarEstudianteModal y PrematriculasView — centralizado aquí para
 * evitar que las dos copias se desincronicen.
 */

export const TIPOS_ID = [
  "Cédula de Ciudadanía", "Carné Diplomático",
  "Cédula ó Identificación de Extranjería", "Certificado Cabildo u otro",
  "DNI", "Driver License", "ID",
  "Número de Identificación Tributaria", "Código NES",
  "Número Único de Identificación Personal", "Pasaporte",
  "Permiso Especial de Permanencia", "Registro Civil de Nacimiento",
  "Salvoconducto de Permanencia", "Social Security Number",
  "Permiso por Protección Temporal", "Tarjeta de Identidad", "Otros",
  "Registro único de migrantes venezolanos", "NIT Extranjeros",
] as const;

export const SEXOS = ["Masculino", "Femenino", "Otro"] as const;

export const PERIODOS = [
  "2026-1 APH", "2026-BCI",   "2026-TECH",  "2026-2 TECC",
  "2026-TECB",  "2026-TECA",  "2026-TECC",  "2025-TECB",
  "2025-TECH",  "2025-TECA",  "2025-BCI",   "2024",
  "2023",       "2022-2",
] as const;

export const SEDES = ["Principal - Fin de semana", "Principal - Única"] as const;

export const PROGRAMAS_POR_SEDE: Record<string, string[]> = {
  "Principal - Única": [
    "BRIGADAS CONTRAINCENDIOS",
    "CURSO FORMACION BOMBERIL",
    "DIPLOMADO EN ATENCION PREHOSPITALARIA",
    "TECNICO AUXLIAR EN SEGURIDAD Y SALUD EN EL TRABAJO",
    "TECNICO LABORAL EN AUXILIAR DE ENFERMERIA",
  ],
  "Principal - Fin de semana": [
    "DIPLOMADO EN ATENCION PREHOSPITALARIA",
  ],
};

export const PROGRAMAS = Array.from(new Set(Object.values(PROGRAMAS_POR_SEDE).flat()));

export const ASIGNATURAS = [
  "ADMINISTRACION DE LA EMERGENCIA",
  "ARTICULACIÓN DE LA BRIGADA CON EL CUERPO DE BOMBEROS",
  "BOMBEROS - MODULO 1", "BOMBEROS - MODULO 2", "BOMBEROS - MODULO 3",
  "BOMBEROS - MODULO 4", "BOMBEROS - MODULO 5", "BOMBEROS - MODULO 6",
  "BOMBEROS - MODULO 7", "BOMBEROS - MODULO 8", "BOMBEROS - MODULO 9",
  "BOMBEROS - MODULO 10",
  "COMPORTAMIENTO DEL FUEGO",
  "ESCENARIOS ESPECIALES Y RESCATE",
  "EVACUACIÓN Y TRANSPORTE DE PACIENTES",
  "EXTINTORES PORTÁTILES",
  "FUNDAMENTOS EN APH",
  "LEGISLACIÓN",
  "LIDERAZGO E INTEGRACION",
  "MANEJO DEL PLAN DE EVACUACIÓN Y DE EMERGENCIAS",
  "MÉTODOS, AGENTES Y EQUIPOS DE EXTINCIÓN",
  "MODULO 01", "MODULO 02", "MODULO 03", "MODULO 04", "MODULO 05",
  "MODULO 06", "MODULO 07", "MODULO 08", "MODULO 09", "MODULO 10",
  "MODULO 11", "MODULO 12",
  "PACIENTE POLITRAUMATIZADO",
  "PROCEDIMIENTO OPERATIVO NORMALIZADO",
  "RIESGOS DE SEGURIDAD DE LOS BRIGADISTAS",
  "TAE 01A - Induccion Institucional y Etica",
  "TAE 02A - Atención, Orientación y Admisión al Usuario",
  "TAE 03A - Atención y Cuidados Básicos de Enfermería",
  "TAE 04A - Anatomía y Fisiología I",
  "TAE 05A - Control de Infecciones",
  "TAE 06A - Investigación y Técnicas de Estudio",
  "TAE 07A - Primeros Auxilios y Socorrismo",
  "TAE 08A - Practica Integral Eventos Masivos",
  "TAE 09A - Campamento Socorrismo Básico Integral",
  "TAE 10B – Anatomía y Fisiología II",
  "TAE 11B – Atención de Enfermería en el Área de Urgencias",
  "TAE 12B – Atención de Enfermería en la Administración de Medicamentos",
  "TAE 13B – Farmacología I",
  "TAE 14B – Atención Integral en la Atención Prehospitalaria",
  "TAE 15B – Técnicas de Rescate Básicas",
  "TAE 16B – Práctica en Escenarios de Rescate",
  "TAE 17B – Campamento Avanzado de Trauma",
  "TAE 18B – Práctica Integral Traslado Secundario",
  "TAE 19C – Atención de Enfermería en el Entorno Quirurgico",
  "TAE 20C – Farmacología II",
  "TAE 21C – Atención de Enfermería en el Adulto Mayor",
  "TAE 22C – Seguridad y Salud en el Trabajo SST y Salud Pública",
  "TAE 23C – Manejo de Pacientes en Situaciones Criticas",
  "TAE 25C – Técnicas de Rescate Básicas",
  "TAE 26C – Practica en Escenarios de Rescate",
  "TAE 27C – Practica Integral Intrahospitalaria",
  "TSST 01A Fundamentos de SST",
  "TSST 02A Recursos del Sistema en SST",
  "TSST 03A Gestión Integral del Sistema de SST",
  "TSST 04A Tareas Criticas I",
  "TSST 05A Primeros Auxilios Basicos",
  "TSST 06A Etica y Valores del SGSST",
  "TSST 07A Mecanismos de Comunicación",
  "TSST 08B Condiciones de Salud en el Trabajo",
  "TSST 09B Anatomía y Biomecánica Corporal",
  "TSST 10B Toxicología Laboral",
  "TSST 11B Tareas Críticas II",
  "TSST 12B Investigación de Accidentes en ATEL",
  "TSST 13B - Gestión del Riesgo I",
  "TSST 14B Andragogía Humana para SST",
  "TSST 15C Gestión del Riesgo II",
  "TSST 16C Tareas Criticas III",
  "TSST 17C Diseño Estratégico de Planes de Emergencias",
  "TSST 18C Gestión de Amenazas",
  "TSST 19C Plan Estratégico de Seguridad Vial - PESV",
  "TSST 20C Gestión de Resultado y Mejoramiento",
  "TSST 21C Proyecto de Grado",
] as const;
