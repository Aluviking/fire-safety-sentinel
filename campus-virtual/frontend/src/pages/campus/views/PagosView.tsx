import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PagoCredito {
  id: number; pagare: string | null; comprobante: string | null; fecha_pago: string | null;
  cajero: string | null; valor: string | null; estado: string | null;
}
interface PagoPendiente {
  id: number; identificacion: string | null; producto: string | null; periodo: string | null;
  valor_producto: string | null;
}
interface PagoRealizado {
  id: number; identificacion: string | null; fecha_pago: string | null; producto: string | null;
  periodo: string | null; valor_pagado: string | null; forma_pago: string | null; estado: string | null;
}

const fmtCOP = (v: string | null) => {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return "—";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
};

const TABS = ["Realizados", "Pendientes", "Créditos"] as const;
type Tab = (typeof TABS)[number];

export default function PagosView() {
  const [tab, setTab] = useState<Tab>("Realizados");
  const [creditos, setCreditos]     = useState<PagoCredito[]>([]);
  const [pendientes, setPendientes] = useState<PagoPendiente[]>([]);
  const [realizados, setRealizados] = useState<PagoRealizado[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    apiFetch<{ pagosCreditos: PagoCredito[]; pagosPendientes: PagoPendiente[]; pagosRealizados: PagoRealizado[] }>("/pagos/list.php")
      .then((data) => {
        setCreditos(data.pagosCreditos);
        setPendientes(data.pagosPendientes);
        setRealizados(data.pagosRealizados);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar pagos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Pagos</h1>
        <p className="text-slate-500 text-xs mt-0.5">Pagos realizados, pendientes y de créditos</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all
                          ${tab === t ? "bg-[#C41717]/8 text-[#C41717] border-b-2 border-[#C41717]" : "text-slate-500 hover:text-slate-800"}`}>
              {t} <span className="ml-1 text-slate-400">
                {t === "Realizados" ? realizados.length : t === "Pendientes" ? pendientes.length : creditos.length}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : tab === "Realizados" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Producto</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Forma de pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {realizados.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Sin registros</td></tr>
                  ) : realizados.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{p.identificacion ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{p.fecha_pago ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{p.producto ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{fmtCOP(p.valor_pagado)}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{p.forma_pago ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === "Pendientes" ? (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Producto</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Período</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendientes.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">Sin registros</td></tr>
                  ) : pendientes.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{p.identificacion ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{p.producto ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{p.periodo ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{fmtCOP(p.valor_producto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Pagaré</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Cajero</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {creditos.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">Sin registros</td></tr>
                  ) : creditos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{p.pagare ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{p.fecha_pago ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{p.cajero ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-700 font-medium text-xs">{fmtCOP(p.valor)}</td>
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
