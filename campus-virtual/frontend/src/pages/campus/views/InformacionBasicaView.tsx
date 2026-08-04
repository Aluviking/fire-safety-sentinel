import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ChevronsRight, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Matricula {
  id: number;
  estado: string | null;
  formalizada: number | null;
  sede: string | null;
  programa: string | null;
  nivel: string | null;
  periodo: string | null;
  fecha_egreso: string | null;
  fecha_cancelacion: string | null;
}

interface Estudiante {
  id: number;
  identificacion: string;
  nombre_completo: string;
  genero: string | null;
  tipo_documento: string | null;
  celular: string | null;
  correo: string | null;
  subgrupo_sisben: string | null;
  matriculas: Matricula[];
}

const PAGE_SIZE = 10;

/* ── Paginación ───────────────────────────────────────────────────────────── */
function Pagination({
  total, page, pageSize, onChange,
}: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500
                   hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                        ${page === p ? "bg-[#C41717] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500
                   hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500
                   hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function InformacionBasicaView() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [page, setPage]               = useState(1);

  useEffect(() => {
    apiFetch<{ estudiantes: Estudiante[] }>("/estudiantes/list.php")
      .then((data) => setEstudiantes(data.estudiantes))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar estudiantes."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return estudiantes.filter((e) =>
      !q || e.nombre_completo.toLowerCase().includes(q) || e.identificacion.includes(q)
    );
  }, [estudiantes, searchActive]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => { setSearchActive(searchInput); setPage(1); };
  const clearSearch   = () => { setSearchInput(""); setSearchActive(""); setPage(1); };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Información básica</h1>
          <p className="text-slate-500 text-xs mt-0.5">Estudiantes registrados en GFO Academy</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {estudiantes.length} registros totales
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar estudiantes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-slate-800 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:border-[#C41717]/40 focus:bg-white
                           focus:ring-2 focus:ring-[#C41717]/8 transition-all"
              />
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold
                         shadow-[0_2px_12px_rgba(196,23,23,0.25)] hover:shadow-[0_4px_18px_rgba(196,23,23,0.35)] active:scale-[0.98] transition-all duration-150">
              <Search className="w-3.5 h-3.5" /> Buscar
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Mostrando <span className="font-semibold text-slate-600">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span>{" "}
                  de <span className="font-semibold text-slate-600">{filtered.length}</span> registros
                </span>
                <span>{totalPages || 1} {totalPages === 1 ? "página" : "páginas"}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Nombre completo</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Identificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Contacto</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Matrícula</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageData.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : (
                      pageData.map((est, idx) => {
                        const ultima = est.matriculas[0];
                        return (
                          <tr key={est.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                            <td className="px-4 py-2">
                              <span className="text-slate-800 font-medium">{est.nombre_completo}</span>
                            </td>
                            <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{est.identificacion}</td>
                            <td className="px-4 py-2 text-slate-500 text-xs">
                              {est.celular ?? "—"}{est.correo ? ` · ${est.correo}` : ""}
                            </td>
                            <td className="px-4 py-2">
                              {ultima ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
                                  {ultima.periodo ?? "—"} · {ultima.estado ?? "—"}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">Sin matrícula</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <p className="text-xs text-slate-400">
                    Página <span className="font-semibold text-slate-600">{page}</span> de <span className="font-semibold text-slate-600">{totalPages}</span>
                  </p>
                  <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
