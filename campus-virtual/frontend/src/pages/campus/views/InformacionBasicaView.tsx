import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Eye, ChevronLeft, ChevronRight, ChevronsRight, X } from "lucide-react";
import { PERSONAS } from "@/data/private/personasSeed";

const PAGE_SIZE = 10;

/* ── Paginación ───────────────────────────────────────────────────────────── */
function Pagination({
  total, page, pageSize, onChange,
}: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
                   text-slate-500 hover:border-slate-300 hover:text-slate-700
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${page === p
                          ? "bg-[#C41717] text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
                   text-slate-500 hover:border-slate-300 hover:text-slate-700
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200
                   text-slate-500 hover:border-slate-300 hover:text-slate-700
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function InformacionBasicaView() {
  const [searchInput, setSearchInput]       = useState("");
  const [searchActive, setSearchActive]     = useState("");
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [tipo, setTipo]                     = useState("Estudiante");
  const [page, setPage]                     = useState(1);
  const [advancedOpen, setAdvancedOpen]     = useState(false);

  /* Filtrado */
  const filtered = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return PERSONAS.filter((e) => {
      const matchSearch =
        !q ||
        e.nombre.toLowerCase().includes(q) ||
        e.identificacion.includes(q);
      /* Al filtrar por "Administrativo" incluimos también "Administrador" */
      const matchTipo =
        tipo === "Todos" ||
        e.tipo === tipo ||
        (tipo === "Administrativo" && e.tipo === "Administrador");
      return matchSearch && matchTipo;
    });
  }, [searchActive, tipo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => {
    setSearchActive(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchActive("");
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Información básica</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Personas registradas en GFO Academy
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                         bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717]
                         text-xs font-semibold">
          {PERSONAS.length} registros totales
        </span>
      </div>

      {/* ── Card principal ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra roja top */}
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />

        <div className="p-3 sm:p-4 space-y-3">

          {/* ── Fila 1: Búsqueda ──────────────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar personas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl
                           pl-10 pr-9 py-2 text-slate-800 text-sm placeholder:text-slate-400
                           focus:outline-none focus:border-[#C41717]/40 focus:bg-white
                           focus:ring-2 focus:ring-[#C41717]/8 transition-all"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                         bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold
                         shadow-[0_2px_12px_rgba(196,23,23,0.25)]
                         hover:shadow-[0_4px_18px_rgba(196,23,23,0.35)]
                         active:scale-[0.98] transition-all duration-150"
            >
              <Search className="w-3.5 h-3.5" />
              Buscar
            </button>

            <button
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center gap-1 text-[#C41717] hover:text-[#A81212]
                         text-sm font-medium transition-colors"
            >
              Búsqueda avanzada
              <span className={`text-xs transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}>▲</span>
            </button>
          </div>

          {/* ── Fila 2: Filtros ───────────────────────────────────────────── */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* ¿Incluir inactivos? */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                role="checkbox"
                aria-checked={incluirInactivos}
                tabIndex={0}
                onClick={() => { setIncluirInactivos(!incluirInactivos); setPage(1); }}
                onKeyDown={(e) => e.key === " " && (setIncluirInactivos(!incluirInactivos), setPage(1))}
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center
                            transition-all duration-150 cursor-pointer
                            ${incluirInactivos
                              ? "bg-[#C41717] border-[#C41717]"
                              : "bg-white border-slate-300 group-hover:border-slate-400"}`}
              >
                {incluirInactivos && (
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </div>
              <span className="text-slate-600 text-sm">¿Incluir inactivos?</span>
            </label>

            {/* Tipo */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">Tipo:</span>
              <select
                value={tipo}
                onChange={(e) => { setTipo(e.target.value); setPage(1); }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5
                           text-slate-700 text-sm focus:outline-none focus:border-[#C41717]/40
                           focus:ring-2 focus:ring-[#C41717]/8 transition-all cursor-pointer"
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Todos">Todos</option>
                <option value="Docente">Docente</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Familiar">Familiar</option>
                <option value="Codeudor">Codeudor</option>
                <option value="Participante">Participante</option>
                <option value="Administrador de asistencia digital">Administrador de asistencia digital</option>
              </select>
            </div>

            {/* Búsqueda activa pill */}
            {searchActive && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full
                               bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                "{searchActive}"
                <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* ── Búsqueda avanzada (expandible) ───────────────────────────── */}
          {advancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="grid sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100"
            >
              {["Número de identificación", "Correo electrónico", "Teléfono"].map((label) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-slate-400 text-[10.5px] font-bold tracking-[0.12em] uppercase">
                    {label}
                  </label>
                  <input
                    type="text"
                    placeholder={`Buscar por ${label.toLowerCase()}...`}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2
                               text-slate-700 text-sm placeholder:text-slate-400
                               focus:outline-none focus:border-[#C41717]/40
                               focus:ring-2 focus:ring-[#C41717]/8 transition-all"
                  />
                </div>
              ))}
            </motion.div>
          )}

          {/* ── Separador ────────────────────────────────────────────────── */}
          <div className="h-px bg-slate-100" />

          {/* ── Info resultados ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Mostrando{" "}
              <span className="font-semibold text-slate-600">
                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-600">{filtered.length}</span>{" "}
              registros
            </span>
            <span>{totalPages} {totalPages === 1 ? "página" : "páginas"}</span>
          </div>

          {/* ── Tabla ─────────────────────────────────────────────────────── */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                    Nombre completo
                  </th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                    Número de identificación
                  </th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                    Tipo
                  </th>
                  <th className="text-center px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-600 font-medium">Sin resultados</p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            No se encontraron estudiantes con esos criterios.
                          </p>
                        </div>
                        <button
                          onClick={clearSearch}
                          className="text-[#C41717] hover:text-[#A81212] text-xs font-medium transition-colors"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageData.map((est, idx) => (
                    <tr
                      key={est.id}
                      className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}
                    >
                      {/* Nombre en azul */}
                      <td className="px-4 py-2">
                        <button className="text-[#1A56DB] hover:text-[#1340A8] hover:underline font-medium text-left transition-colors">
                          {est.nombre}
                        </button>
                      </td>

                      {/* Identificación */}
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">
                        {est.identificacion}
                      </td>

                      {/* Tipo */}
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                                         bg-blue-50 border border-blue-200
                                         text-blue-700 text-xs font-medium">
                          {est.tipo}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-2 text-center">
                        <button
                          title="Ver detalle"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                                     text-slate-400 hover:text-[#1A56DB] hover:bg-blue-50
                                     border border-transparent hover:border-blue-200
                                     transition-all duration-150"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ────────────────────────────────────────────────── */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <p className="text-xs text-slate-400">
                Página <span className="font-semibold text-slate-600">{page}</span> de{" "}
                <span className="font-semibold text-slate-600">{totalPages}</span>
              </p>
              <Pagination
                total={filtered.length}
                page={page}
                pageSize={PAGE_SIZE}
                onChange={(p) => { setPage(p); }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
