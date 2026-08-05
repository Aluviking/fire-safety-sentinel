import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ChevronsRight, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Evaluacion {
  id: number;
  codigo_curso: string | null;
  periodo: string | null;
  identificacion_estudiante: string | null;
  asignatura: string | null;
  parametro: string | null;
  porcentaje: string | null;
  nota: string | null;
  inasistencias: number | null;
  observaciones: string | null;
}
interface NotaFinal {
  id: number;
  identificacion_estudiante: string | null;
  programa: string | null;
  periodo: string | null;
  asignatura: string | null;
  aprobado: string | null;
  nota_asignatura: string | null;
  promedio_acumulado: string | null;
  tipo_nota: string | null;
}

const PAGE_SIZE = 15;
const TABS = ["Evaluaciones detalladas", "Notas finales"] as const;
type Tab = (typeof TABS)[number];

function Pagination({ total, page, pageSize, onChange }: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
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
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((p, idx) => p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-slate-400 text-sm">…</span> : (
        <button key={p} onClick={() => onChange(p as number)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === p ? "bg-[#C41717] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function EvaluacionesView() {
  const [tab, setTab] = useState<Tab>("Evaluaciones detalladas");
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [notasFinales, setNotasFinales] = useState<NotaFinal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      apiFetch<{ evaluaciones: Evaluacion[] }>("/evaluaciones/list.php"),
      apiFetch<{ notasFinales: NotaFinal[] }>("/notas-finales/list.php"),
    ])
      .then(([e, n]) => { setEvaluaciones(e.evaluaciones); setNotasFinales(n.notasFinales); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar evaluaciones."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => { setSearchActive(searchInput); setPage(1); };
  const clearSearch   = () => { setSearchInput(""); setSearchActive(""); setPage(1); };
  const changeTab = (t: Tab) => { setTab(t); setPage(1); };

  const filteredEvaluaciones = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return evaluaciones.filter((e) =>
      !q || (e.identificacion_estudiante ?? "").includes(q) || (e.codigo_curso ?? "").toLowerCase().includes(q)
    );
  }, [evaluaciones, searchActive]);

  const filteredNotas = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return notasFinales.filter((n) =>
      !q || (n.identificacion_estudiante ?? "").includes(q) || (n.asignatura ?? "").toLowerCase().includes(q)
    );
  }, [notasFinales, searchActive]);

  const activeData  = tab === "Evaluaciones detalladas" ? filteredEvaluaciones : filteredNotas;
  const totalPages  = Math.ceil(activeData.length / PAGE_SIZE);
  const evalPage    = filteredEvaluaciones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const notaPage    = filteredNotas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Evaluaciones</h1>
        <p className="text-slate-500 text-xs mt-0.5">Notas por parámetro de evaluación y consolidado final por asignatura</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => changeTab(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all
                          ${tab === t ? "bg-[#C41717]/8 text-[#C41717] border-b-2 border-[#C41717]" : "text-slate-500 hover:text-slate-800"}`}>
              {t} <span className="ml-1 text-slate-400">{t === "Evaluaciones detalladas" ? evaluaciones.length : notasFinales.length}</span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={tab === "Evaluaciones detalladas" ? "Buscar por identificación o código de curso..." : "Buscar por identificación o asignatura..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#C41717]/40 focus:bg-white focus:ring-2 focus:ring-[#C41717]/8 transition-all" />
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(196,23,23,0.25)] hover:shadow-[0_4px_18px_rgba(196,23,23,0.35)] active:scale-[0.98] transition-all duration-150">
              <Search className="w-3.5 h-3.5" /> Buscar
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : tab === "Evaluaciones detalladas" ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Curso</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Parámetro</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">%</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Inasist.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evalPage.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : evalPage.map((e, idx) => (
                      <tr key={e.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{e.identificacion_estudiante ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.codigo_curso ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{e.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.parametro ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.porcentaje ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-xs">{e.nota ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.inasistencias ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredEvaluaciones.length > PAGE_SIZE && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <p className="text-xs text-slate-400">Página <span className="font-semibold text-slate-600">{page}</span> de <span className="font-semibold text-slate-600">{totalPages}</span></p>
                  <Pagination total={filteredEvaluaciones.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Programa</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Período</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Promedio</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notaPage.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : notaPage.map((n, idx) => (
                      <tr key={n.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{n.identificacion_estudiante ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.programa ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.periodo ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{n.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-xs">{n.nota_asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.promedio_acumulado ?? "—"}</td>
                        <td className="px-4 py-2">
                          {n.aprobado?.toUpperCase() === "S" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Aprobado</span>
                          ) : n.aprobado?.toUpperCase() === "N" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium">No aprobado</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">{n.tipo_nota ?? "—"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredNotas.length > PAGE_SIZE && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <p className="text-xs text-slate-400">Página <span className="font-semibold text-slate-600">{page}</span> de <span className="font-semibold text-slate-600">{totalPages}</span></p>
                  <Pagination total={filteredNotas.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
