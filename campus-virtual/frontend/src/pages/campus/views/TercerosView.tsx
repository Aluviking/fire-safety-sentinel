import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "../ConfirmModal";

interface Tercero {
  id: number; tipo_documento: string | null; numero_documento: string; nombre: string;
  telefono: string | null; correo: string | null; estado: string;
}

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

/** Catálogo de terceros (proveedores / personas externas a quien se les paga
 *  un egreso) — mismo patrón de lista + modal que el resto de Tesorería. */
export default function TercerosView() {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tercero | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<{ id: number; nombre: string } | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ terceros: Tercero[] }>("/tesoreria-terceros/list.php")
      .then((d) => setTerceros(d.terceros)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const eliminar = async () => {
    if (!deleting) return;
    await apiFetch("/tesoreria-terceros/delete.php", { method: "POST", json: { id: deleting.id } });
    setDeleting(null);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">Terceros</h1>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : terceros.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">Aún no hay terceros registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Documento</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Nombre</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Teléfono</th>
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Correo</th>
                <th className="text-center px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Estado</th>
                <th className="text-right px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {terceros.map((t) => (
                <tr key={t.id} className="group">
                  <td className="px-4 py-2.5 text-slate-700">{t.tipo_documento ? `${t.tipo_documento} ` : ""}{t.numero_documento}</td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{t.nombre}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.telefono ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.correo ?? "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${t.estado === "Activo" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(t)} className="text-slate-400 hover:text-[#C41717]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleting({ id: t.id, nombre: t.nombre })} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && <TerceroForm editing={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={load} />}

      <ConfirmModal
        open={!!deleting}
        title="Eliminar tercero"
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={eliminar}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}

function TerceroForm({ editing, onClose, onSaved }: { editing: Tercero | null; onClose: () => void; onSaved: () => void }) {
  const [tipoDocumento, setTipoDocumento] = useState(editing?.tipo_documento ?? "CC");
  const [numeroDocumento, setNumeroDocumento] = useState(editing?.numero_documento ?? "");
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [telefono, setTelefono] = useState(editing?.telefono ?? "");
  const [correo, setCorreo] = useState(editing?.correo ?? "");
  const [estado, setEstado] = useState(editing?.estado ?? "Activo");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { tipoDocumento, numeroDocumento, nombre, telefono, correo, estado };
      if (editing) payload.id = editing.id;
      await apiFetch(`/tesoreria-terceros/${editing ? "update" : "create"}.php`, { method: "POST", json: payload });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editing ? "Editar tercero" : "Nuevo tercero"}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tipo doc.</label>
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className={inputCls}>
                  <option value="CC">CC</option>
                  <option value="NIT">NIT</option>
                  <option value="CE">CE</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Número de documento</label>
                <input value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre / razón social</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Teléfono</label>
              <input value={telefono ?? ""} onChange={(e) => setTelefono(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Correo</label>
              <input type="email" value={correo ?? ""} onChange={(e) => setCorreo(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Estado</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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
