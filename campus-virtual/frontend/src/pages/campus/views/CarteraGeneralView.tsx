import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface CarteraRow {
  identificacion: string | null;
  nombre_completo: string | null;
  total_creditos: string | null;
  creditos_activos: number | null;
  creditos_anulados: number | null;
  total_pendiente: string | null;
}

const fmtCOP = (v: string | null) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
};

export default function CarteraGeneralView() {
  const [cartera, setCartera] = useState<CarteraRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [searchActive, setSearchActive] = useState("");

  useEffect(() => {
    apiFetch<{ cartera: CarteraRow[] }>("/informes/cartera-general.php")
      .then((data) => setCartera(data.cartera))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => setSearchActive(searchInput);
  const clearSearch   = () => { setSearchInput(""); setSearchActive(""); };

  const filtered = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return cartera.filter((c) =>
      !q || (c.identificacion ?? "").includes(q) || (c.nombre_completo ?? "").toLowerCase().includes(q)
    );
  }, [cartera, searchActive]);

  const totalPendienteGeneral = useMemo(
    () => cartera.reduce((acc, c) => acc + (Number(c.total_pendiente) || 0), 0),
    [cartera]
  );

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cartera general</h1>
          <p className="text-slate-500 text-xs mt-0.5">Créditos y pagos pendientes por estudiante</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          Pendiente total: {fmtCOP(String(totalPendienteGeneral))}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} placeholder="Buscar por identificación o nombre..."
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
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estudiante</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Total créditos</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Activos</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Anulados</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                  ) : filtered.map((c) => (
                    <tr key={c.identificacion} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{c.identificacion ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{c.nombre_completo ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{fmtCOP(c.total_creditos)}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.creditos_activos ?? 0}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.creditos_anulados ?? 0}</td>
                      <td className="px-4 py-2 text-[#C41717] font-semibold text-xs">{fmtCOP(c.total_pendiente)}</td>
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
