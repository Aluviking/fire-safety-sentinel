import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface NotaCredito {
  id: number; identificacion: string | null; numero: string | null; fecha: string | null;
  producto: string | null; valor_producto: string | null; estado: string | null;
}

const fmtCOP = (v: string | null) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
};

export default function NotasCreditoView() {
  const [notas, setNotas]     = useState<NotaCredito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    apiFetch<{ notasCredito: NotaCredito[] }>("/notas-credito/list.php")
      .then((data) => setNotas(data.notasCredito))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Administrar notas crédito</h1>
          <p className="text-slate-500 text-xs mt-0.5">Notas de crédito registradas</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {notas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">N°</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Producto</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notas.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin registros</td></tr>
                  ) : notas.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{n.numero ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{n.identificacion ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{n.fecha ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{n.producto ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{fmtCOP(n.valor_producto)}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{n.estado ?? "—"}</td>
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
