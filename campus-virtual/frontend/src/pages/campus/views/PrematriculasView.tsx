import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Search, Download, Calendar,
  BookOpen, Users, ChevronRight, X, Check, ChevronsUpDown,
} from "lucide-react";
import { PERIODOS as PERIODOS_BASE, PROGRAMAS as PROGRAMAS_BASE, ASIGNATURAS as ASIGNATURAS_BASE } from "@/data/academicCatalog";

/* ── Opciones de filtro (con "Todos" al inicio) ──────────────────────────── */
const PERIODOS = ["Todos", ...PERIODOS_BASE];
const PROGRAMAS = ["Todos", ...PROGRAMAS_BASE];
const ASIGNATURAS = ["Todos", ...ASIGNATURAS_BASE];

const FECHAS_OPTS = [
  "Todas", "Hoy", "Ayer", "Últimos 7 días",
  "Últimos 30 días", "Este mes", "Mes anterior", "Rango personalizado",
];

/* ── Dropdown genérico ────────────────────────────────────────────────────── */
function FilterSelect({
  label, value, onChange, options, searchable = false, wide = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; searchable?: boolean; wide?: boolean;
}) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative flex-1 min-w-[180px]">
      {/* Botón trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5
                   rounded-xl bg-white border border-slate-200 shadow-sm
                   text-sm text-slate-700 hover:border-slate-300 hover:shadow
                   transition-all font-medium"
      >
        <span className="text-left">
          <span className="text-slate-500">{label}: </span>
          <span className="text-slate-900">{value}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={`absolute top-full left-0 mt-1.5 rounded-xl
                        bg-white border border-slate-200
                        shadow-[0_8px_32px_rgba(0,0,0,0.10)] z-40
                        ${wide ? "min-w-[420px]" : "min-w-full"}`}
            style={{ width: wide ? "max(100%, 420px)" : "100%" }}
          >
            <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />

            {searchable && (
              <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Buscar ${label.toLowerCase()}...`}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200
                               rounded-lg focus:outline-none focus:border-[#C41717]/40 transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="py-1 max-h-72 overflow-y-auto">
              {filtered.map((opt) => {
                const active = value === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left
                                transition-colors
                                ${active
                                  ? "bg-[#C41717]/8 text-[#C41717] font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    {/* Sin truncate para ver texto completo */}
                    <span className="leading-snug pr-3">{opt}</span>
                    {active && <Check className="w-4 h-4 shrink-0 text-[#C41717]" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-4 py-4 text-slate-400 text-sm text-center">Sin resultados</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dropdown de Fechas ───────────────────────────────────────────────────── */
function FechasSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]   = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const ref               = useRef<HTMLDivElement>(null);
  const isRange           = value.includes("→");

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[180px]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5
                   rounded-xl bg-white border border-slate-200 shadow-sm
                   text-sm text-slate-700 hover:border-slate-300 hover:shadow
                   transition-all font-medium"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <span className="text-slate-500">Fechas: </span>
            <span className="text-slate-900">{value}</span>
          </span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-full left-0 mt-1.5 w-72 rounded-xl
                       bg-white border border-slate-200
                       shadow-[0_8px_32px_rgba(0,0,0,0.10)] z-40"
          >
            <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
            <div className="py-1">
              {FECHAS_OPTS.map((opt) => {
                const active = opt === "Rango personalizado" ? isRange : value === opt;
                return (
                  <div key={opt}>
                    <button
                      onClick={() => {
                        if (opt !== "Rango personalizado") { onChange(opt); setOpen(false); }
                        else onChange("Rango personalizado");
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                                  ${active
                                    ? "bg-[#C41717]/8 text-[#C41717] font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    >
                      {opt}
                      {active && <Check className="w-4 h-4 shrink-0" />}
                    </button>

                    {opt === "Rango personalizado" && (value === "Rango personalizado" || isRange) && (
                      <div className="mx-3 mb-3 mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Desde</label>
                            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white
                                         focus:outline-none focus:border-[#C41717]/40 transition-all" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Hasta</label>
                            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white
                                         focus:outline-none focus:border-[#C41717]/40 transition-all" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { onChange("Todas"); setDesde(""); setHasta(""); setOpen(false); }}
                            className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-500
                                       hover:bg-white text-xs font-medium transition-all"
                          >Cancelar</button>
                          <button
                            onClick={() => { if (desde && hasta) { onChange(`${desde} → ${hasta}`); setOpen(false); } }}
                            disabled={!desde || !hasta}
                            className="flex-1 py-1.5 rounded-lg bg-[#C41717] hover:bg-[#B01313] text-white
                                       text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >Aplicar</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══ Vista Principal ═════════════════════════════════════════════════════════ */
export default function PrematriculasView() {
  const [programa,   setPrograma]   = useState("Todos");
  const [asignatura, setAsignatura] = useState("Todos");
  const [fecha,      setFecha]      = useState("Todas");
  const [periodo,    setPeriodo]    = useState("Todos");
  const [busqueda,   setBusqueda]   = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasFilters = programa !== "Todos" || asignatura !== "Todos" || fecha !== "Todas" || periodo !== "Todos";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* ── Encabezado de módulo ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <span>Institucional</span>
              <ChevronRight className="w-3 h-3" />
              <span>Estudiantes</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#C41717] font-semibold">Prematrículas</span>
            </div>
            <h1 className="text-slate-900 font-bold text-xl">Prematrículas</h1>
          </div>
        </div>
      </div>

      {/* ── Panel de búsqueda y filtros ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible px-5 sm:px-7 py-5 space-y-4">

        {/* Fila 1: Búsqueda + acciones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Buscador */}
          <div className="flex flex-1 max-w-sm">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar prematrícula..."
              className="flex-1 border border-slate-200 border-r-0 rounded-l-xl px-4 py-2.5
                         text-sm text-slate-800 placeholder:text-slate-400 bg-white
                         focus:outline-none focus:border-[#C41717]/40 transition-all"
            />
            <button className="px-4 py-2.5 bg-[#C41717] hover:bg-[#B01313] text-white
                               rounded-r-xl transition-all border border-[#C41717]">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Exportar */}
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200
                             text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Exportar
          </button>

          {/* Búsqueda avanzada */}
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-1.5 text-[#3B82F6] hover:text-[#2563EB] text-sm font-medium transition-colors"
          >
            Búsqueda avanzada
            <ChevronsUpDown className={`w-4 h-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Fila 2: Filtros — siempre visibles (igual que en Q10) */}
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Programa"
            value={programa}
            onChange={setPrograma}
            options={PROGRAMAS}
            wide
          />
          <FilterSelect
            label="Asignatura"
            value={asignatura}
            onChange={setAsignatura}
            options={ASIGNATURAS}
            searchable
            wide
          />
          <FechasSelect value={fecha} onChange={setFecha} />
          <FilterSelect
            label="Período"
            value={periodo}
            onChange={setPeriodo}
            options={PERIODOS}
          />
        </div>

        {/* Pills de filtros activos */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-slate-400 text-xs">Filtros:</span>
            {programa !== "Todos" && (
              <Pill label={programa} onRemove={() => setPrograma("Todos")} />
            )}
            {asignatura !== "Todos" && (
              <Pill label={asignatura} onRemove={() => setAsignatura("Todos")} />
            )}
            {fecha !== "Todas" && (
              <Pill label={fecha} onRemove={() => setFecha("Todas")} />
            )}
            {periodo !== "Todos" && (
              <Pill label={periodo} onRemove={() => setPeriodo("Todos")} />
            )}
            <button
              onClick={() => { setPrograma("Todos"); setAsignatura("Todos"); setFecha("Todas"); setPeriodo("Todos"); }}
              className="text-slate-400 hover:text-slate-600 text-xs underline transition-colors ml-1"
            >
              Limpiar todo
            </button>
          </div>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cabecera de tabla */}
        <div className="hidden sm:grid grid-cols-5 px-5 sm:px-7 py-3.5
                        bg-slate-50 border-b border-slate-200
                        text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <span>Estudiante</span>
          <span>Identificación</span>
          <span>Asignatura</span>
          <span>Fecha</span>
          <span>Estado</span>
        </div>

        {/* Estado vacío */}
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-slate-700 font-semibold text-base mb-1">No hay registros</p>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            No se encontraron prematrículas con los filtros seleccionados.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Pill helper ─────────────────────────────────────────────────────────── */
function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     bg-[#C41717]/8 border border-[#C41717]/15 text-[#C41717] text-xs font-medium
                     max-w-[240px]">
      <span className="truncate">{label}</span>
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity shrink-0">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
