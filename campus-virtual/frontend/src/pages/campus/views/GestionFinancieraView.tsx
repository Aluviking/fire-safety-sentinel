import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, Wallet, FileText, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Totales {
  total_recaudado: string | null;
  total_pendiente: string | null;
  total_creditos_activos: string | null;
  creditos_anulados: number | null;
  creditos_paz_y_salvo: number | null;
  total_notas_credito: string | null;
  total_modificaciones: number | null;
}
interface Modificacion {
  id: number;
  pagare: string | null;
  nota_modificacion: string | null;
  valor_anterior: string | null;
  valor_posterior: string | null;
  fecha: string | null;
  cajero: string | null;
  anulado: string | null;
}

const fmtCOP = (v: string | null | undefined) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
};

export default function GestionFinancieraView() {
  const [totales, setTotales]             = useState<Totales | null>(null);
  const [modificaciones, setModificaciones] = useState<Modificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiFetch<{ totales: Totales; modificaciones: Modificacion[] }>("/informes/gestion-financiera.php")
      .then((data) => { setTotales(data.totales); setModificaciones(data.modificaciones); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const cards = totales ? [
    { label: "Recaudado", value: fmtCOP(totales.total_recaudado), icon: TrendingUp, color: "#065F46" },
    { label: "Pendiente", value: fmtCOP(totales.total_pendiente), icon: TrendingDown, color: "#C41717" },
    { label: "Créditos activos", value: fmtCOP(totales.total_creditos_activos), icon: Wallet, color: "#1E3A5F" },
    { label: "Notas crédito", value: fmtCOP(totales.total_notas_credito), icon: FileText, color: "#92400E" },
    { label: "Paz y salvo", value: String(totales.creditos_paz_y_salvo ?? 0), icon: CheckCircle2, color: "#14532D" },
    { label: "Anulados", value: String(totales.creditos_anulados ?? 0), icon: XCircle, color: "#7F1D1D" },
  ] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-4">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Gestión financiera</h1>
        <p className="text-slate-500 text-xs mt-0.5">Totales generales y auditoría de modificaciones a créditos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-8">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}>
                  <Icon className="w-5 h-5" style={{ color: `${color}cc` }} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-400 text-[10px] tracking-wide uppercase">{label}</p>
                  <p className="text-slate-800 font-bold text-sm leading-tight truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-700 text-sm font-semibold">Historial de modificaciones a créditos</h3>
              <span className="text-slate-400 text-xs">{modificaciones.length} registros</span>
            </div>
            <div className="p-3 sm:p-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Pagaré</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Modificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor anterior</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor nuevo</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modificaciones.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin registros</td></tr>
                    ) : modificaciones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{m.pagare ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{m.nota_modificacion ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{fmtCOP(m.valor_anterior)}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-xs">{fmtCOP(m.valor_posterior)}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{m.fecha ?? "—"}</td>
                        <td className="px-4 py-2">
                          {m.anulado?.toLowerCase() === "si" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium">Anulado</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Vigente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
