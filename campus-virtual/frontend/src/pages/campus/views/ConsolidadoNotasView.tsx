import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

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
interface Homologacion {
  id: number;
  identificacion_estudiante: string | null;
  tipo: string | null;
  asignatura: string | null;
  institucion_origen: string | null;
  nota: string | null;
  estado: string | null;
  periodo: string | null;
}

const TABS = ["Notas finales", "Homologaciones"] as const;
type Tab = (typeof TABS)[number];

export default function ConsolidadoNotasView() {
  const [tab, setTab] = useState<Tab>("Notas finales");
  const [notasFinales, setNotasFinales]     = useState<NotaFinal[]>([]);
  const [homologaciones, setHomologaciones] = useState<Homologacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [searchActive, setSearchActive] = useState("");

  useEffect(() => {
    apiFetch<{ notasFinales: NotaFinal[]; homologaciones: Homologacion[] }>("/informes/consolidado-notas.php")
      .then((data) => { setNotasFinales(data.notasFinales); setHomologaciones(data.homologaciones); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => setSearchActive(searchInput);
  const clearSearch   = () => { setSearchInput(""); setSearchActive(""); };

  const filteredNotas = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return notasFinales.filter((n) => !q || (n.identificacion_estudiante ?? "").includes(q));
  }, [notasFinales, searchActive]);

  const filteredHomologaciones = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return homologaciones.filter((h) => !q || (h.identificacion_estudiante ?? "").includes(q));
  }, [homologaciones, searchActive]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Consolidado de notas</h1>
        <p className="text-slate-500 text-xs mt-0.5">Notas finales cursadas y materias homologadas/habilitadas, por estudiante</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all
                          ${tab === t ? "bg-[#C41717]/8 text-[#C41717] border-b-2 border-[#C41717]" : "text-slate-500 hover:text-slate-800"}`}>
              {t} <span className="ml-1 text-slate-400">{t === "Notas finales" ? notasFinales.length : homologaciones.length}</span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Buscar por identificación del estudiante..."
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
          ) : tab === "Notas finales" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Programa</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotas.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                  ) : filteredNotas.slice(0, 200).map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{n.identificacion_estudiante ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{n.programa ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{n.asignatura ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{n.nota_asignatura ?? "—"}</td>
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
              {filteredNotas.length > 200 && !searchActive && (
                <p className="text-center text-xs text-slate-400 py-3">Mostrando los primeros 200 de {filteredNotas.length} — usa la búsqueda para filtrar por estudiante.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Tipo</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Institución de origen</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHomologaciones.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                  ) : filteredHomologaciones.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{h.identificacion_estudiante ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{h.tipo ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{h.asignatura ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{h.institucion_origen ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{h.nota ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{h.estado ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
