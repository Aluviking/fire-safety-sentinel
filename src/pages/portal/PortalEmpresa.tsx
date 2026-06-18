import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Folder, FolderOpen, ChevronDown, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMPANIES } from "./PortalDashboard";
import sisoLogo from "@/assets/siso-logo.png";

/* ─── PHVA data ─────────────────────────────────────────────────────────────── */
const PHVA = [
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

type LetraPhva = "P" | "H" | "V" | "A";

/* ─── Folder item ───────────────────────────────────────────────────────────── */
function FolderItem({
  name, index, color,
}: { name: string; index: number; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                   hover:bg-slate-50 transition-all text-left group"
      >
        {open
          ? <FolderOpen className="w-4 h-4 shrink-0 transition-colors" style={{ color }} />
          : <Folder className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-500 transition-colors" />
        }
        <span className={`text-sm flex-1 transition-colors ${open ? "text-slate-800 font-medium" : "text-slate-600"}`}>
          {name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pl-11 pb-2 pr-4">
              <p className="text-xs text-slate-400 italic py-2 border-l-2 pl-3"
                 style={{ borderColor: color + "60" }}>
                Carpeta vacía — sin documentos aún.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── PHVA card ─────────────────────────────────────────────────────────────── */
function PhvaCard({
  item, active, onToggle,
}: {
  item: typeof PHVA[number];
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-sm transition-all duration-200"
      style={{
        borderColor: active ? item.border : "#e2e8f0",
        background:  active ? item.bg   : "#fff",
        boxShadow:   active ? `0 4px 20px ${item.color}22` : undefined,
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-5 px-5 py-4 text-left"
      >
        {/* Big letter */}
        <span
          className="font-display text-5xl leading-none shrink-0 select-none transition-all duration-200"
          style={{ color: active ? item.color : "#cbd5e1" }}
        >
          {item.letra}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base transition-colors duration-200"
             style={{ color: active ? item.color : "#334155" }}>
            {item.nombre}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-xs text-slate-400">{item.carpetas.length} carpetas</span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{ color: item.color, transform: active ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      {/* Folder list */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t px-2 py-2" style={{ borderColor: item.border + "60" }}>
              {item.carpetas.map((c: string, i: number) => (
                <FolderItem key={c} name={c} index={i} color={item.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalEmpresa() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activePhva, setActivePhva] = useState<LetraPhva | null>(null);

  useEffect(() => {
    if (!currentUser) navigate("/portal", { replace: true });
  }, [currentUser, navigate]);

  const company = COMPANIES.find((c) => c.id === id);

  if (!company) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 mb-3">Empresa no encontrada.</p>
        <button onClick={() => navigate("/portal/dashboard")}
          className="text-[hsl(43_78%_40%)] hover:underline text-sm font-medium">
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );

  const toggle = (l: LetraPhva) => setActivePhva((p) => p === l ? null : l);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={sisoLogo} alt="SISO"
              className="w-9 h-9 rounded-full border-2 border-[hsl(43_78%_50%/0.6)]" />
            <span className="font-display tracking-[0.14em] text-gradient-gold text-lg">SISO</span>
          </div>
          <button onClick={() => navigate("/portal/dashboard")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[hsl(43_78%_40%)]
                       px-3 py-2 rounded-xl hover:bg-amber-50 transition-all font-medium">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Empresas</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Company header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }} className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200
                            flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="font-semibold text-2xl text-slate-800 leading-tight">{company.nombre}</h1>
              <p className="text-sm text-slate-500 mt-0.5">NIT {company.nit} · {company.sector}</p>
            </div>
          </div>

          {/* PHVA description */}
          <div className="mt-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed">
              Selecciona una fase del ciclo{" "}
              <span className="font-bold text-[hsl(43_78%_40%)]">PHVA</span>{" "}
              para gestionar las carpetas de documentos del SG-SST.
            </p>
          </div>
        </motion.div>

        {/* PHVA cards */}
        <div className="flex flex-col gap-3">
          {PHVA.map((item, idx) => (
            <motion.div key={item.letra}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.07 }}>
              <PhvaCard
                item={item}
                active={activePhva === item.letra}
                onToggle={() => toggle(item.letra as LetraPhva)}
              />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
