import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "../ConfirmModal";

interface Egreso {
  id: number; fecha: string; concepto: string; tercero: string | null; valor: number;
  forma_pago: string | null; cuenta: string | null; responsable: string | null; observaciones: string | null;
}
interface Catalogo { id: number; nombre: string }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const fmt = (v: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

export default function EgresosView() {
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Egreso | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<{ id: number; concepto: string } | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ egresos: Egreso[] }>("/egresos/list.php").then((d) => setEgresos(d.egresos)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const total = egresos.reduce((acc, e) => acc + Number(e.valor), 0);

  const eliminar = async () => {
    if (!deleting) return;
    await apiFetch("/egresos/delete.php", { method: "POST", json: { id: deleting.id } });
    setDeleting(null);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">Egresos</h1>
          <p className="text-slate-400 text-sm mt-1">Total registrado: <span className="font-semibold text-slate-700">{fmt(total)}</span></p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Registrar egreso
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : egresos.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">Aún no hay egresos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Fecha</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Concepto</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Tercero</th>
                <th className="text-right px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Valor</th>
                <th className="text-right px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {egresos.map((e) => (
                <tr key={e.id} className="group">
                  <td className="px-4 py-2.5 text-slate-500">{e.fecha}</td>
                  <td className="px-4 py-2.5 text-slate-700">{e.concepto}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.tercero ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-800">{fmt(Number(e.valor))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(e)} className="text-slate-400 hover:text-[#C41717]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleting({ id: e.id, concepto: e.concepto })} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && <EgresoForm editing={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={load} />}

      <ConfirmModal
        open={!!deleting}
        title="Eliminar egreso"
        message={`¿Eliminar "${deleting?.concepto}"? Esta acción no se puede deshacer.`}
        onConfirm={eliminar}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}

function EgresoForm({ editing, onClose, onSaved }: { editing: Egreso | null; onClose: () => void; onSaved: () => void }) {
  const [fecha, setFecha] = useState(editing?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [concepto, setConcepto] = useState(editing?.concepto ?? "");
  const [tercero, setTercero] = useState(editing?.tercero ?? "");
  const [valor, setValor] = useState(editing ? String(editing.valor) : "");
  const [formaPago, setFormaPago] = useState(editing?.forma_pago ?? "");
  const [cuenta, setCuenta] = useState(editing?.cuenta ?? "");
  const [observaciones, setObservaciones] = useState(editing?.observaciones ?? "");
  const [terceros, setTerceros] = useState<{ id: number; nombre: string }[]>([]);
  const [formasPago, setFormasPago] = useState<Catalogo[]>([]);
  const [cuentas, setCuentas] = useState<Catalogo[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ terceros: { id: number; nombre: string }[] }>("/tesoreria-terceros/list.php").then((d) => setTerceros(d.terceros)).catch(() => {});
    apiFetch<{ formasPago: Catalogo[] }>("/tesoreria-formas-pago/list.php").then((d) => setFormasPago(d.formasPago)).catch(() => {});
    apiFetch<{ cuentas: Catalogo[] }>("/tesoreria-cuentas/list.php").then((d) => setCuentas(d.cuentas)).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        fecha, concepto, tercero: tercero || null, valor, formaPago: formaPago || null,
        cuenta: cuenta || null, observaciones: observaciones || null,
      };
      if (editing) payload.id = editing.id;
      await apiFetch(`/egresos/${editing ? "update" : "create"}.php`, { method: "POST", json: payload });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editing ? "Editar egreso" : "Registrar egreso"}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Valor</label>
                <input type="number" min={0} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Concepto</label>
              <input value={concepto} onChange={(e) => setConcepto(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Tercero (opcional)</label>
              <select value={tercero} onChange={(e) => setTercero(e.target.value)} className={inputCls}>
                <option value="">—</option>
                {terceros.map((t) => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Forma de pago</label>
                <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {formasPago.map((f) => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Cuenta</label>
                <select value={cuenta} onChange={(e) => setCuenta(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {cuentas.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Observaciones</label>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={2} className={inputCls} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
                {submitting ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
