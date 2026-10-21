import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "../ConfirmModal";

/** Un campo extra del catálogo, además de nombre + estado (que todos tienen).
 *  `key` es como viene en la respuesta de list.php (snake_case, igual que la
 *  columna); `submitKey` es como lo espera create.php/update.php al guardar
 *  (camelCase, igual que el resto de la API) -- por defecto el mismo `key`,
 *  solo hace falta darlo distinto cuando sí difieren (ej. valor_base/valorBase). */
export interface CampoCatalogo {
  key: string;
  submitKey?: string;
  label: string;
  type: "text" | "number";
  required?: boolean;
}

interface Props {
  resourceBase: string;
  listKey: string;
  itemLabel: string;
  itemLabelFem?: boolean;
  campos?: CampoCatalogo[];
}

type Fila = Record<string, string | number | null> & { id: number; nombre: string; estado: string };

/** Catálogo simple reutilizable (Impuestos, Productos, Descuentos, Cuentas,
 *  Formas de pago) — nombre + estado + los campos extra que cada uno tenga,
 *  con el mismo patrón de lista + modal de crear/editar + borrar. */
export default function CatalogoTesoreriaView({ resourceBase, listKey, itemLabel, itemLabelFem, campos = [] }: Props) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Fila | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<{ id: number; nombre: string } | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<Record<string, Fila[]>>(`${resourceBase}/list.php`)
      .then((d) => setFilas(d[listKey] ?? []))
      .finally(() => setLoading(false));
  };
  useEffect(load, [resourceBase, listKey]);

  const eliminar = async () => {
    if (!deleting) return;
    await apiFetch(`${resourceBase}/delete.php`, { method: "POST", json: { id: deleting.id } });
    setDeleting(null);
    load();
  };

  const articulo = itemLabelFem ? "la" : "el";
  const otroArticulo = itemLabelFem ? "una" : "un";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">{itemLabel}</h1>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : filas.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">Aún no hay {otroArticulo === "una" ? "ninguna" : "ningún"} {itemLabel.toLowerCase()} registrad{itemLabelFem ? "a" : "o"}.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Nombre</th>
                {campos.map((c) => (
                  <th key={c.key} className="text-left px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">{c.label}</th>
                ))}
                <th className="text-center px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Estado</th>
                <th className="text-right px-4 py-2.5 text-slate-500 font-semibold text-xs uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((f) => (
                <tr key={f.id} className="group">
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{f.nombre}</td>
                  {campos.map((c) => (
                    <td key={c.key} className="px-4 py-2.5 text-slate-600">{f[c.key] ?? "—"}</td>
                  ))}
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${f.estado === "Activo" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {f.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(f)} className="text-slate-400 hover:text-[#C41717]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleting({ id: f.id, nombre: f.nombre })} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(creating || editing) && (
        <FormModal
          resourceBase={resourceBase} campos={campos} itemLabel={itemLabel} articulo={articulo}
          editing={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={load}
        />
      )}

      <ConfirmModal
        open={!!deleting}
        title={`Eliminar ${articulo} ${itemLabel.toLowerCase()}`}
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={eliminar}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}

function FormModal({
  resourceBase, campos, itemLabel, articulo, editing, onClose, onSaved,
}: { resourceBase: string; campos: CampoCatalogo[]; itemLabel: string; articulo: string; editing: Fila | null; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [estado, setEstado] = useState(editing?.estado ?? "Activo");
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(campos.map((c) => [c.key, editing?.[c.key] != null ? String(editing[c.key]) : ""]))
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { nombre, estado };
      campos.forEach((c) => { payload[c.submitKey ?? c.key] = valores[c.key]; });
      if (editing) payload.id = editing.id;
      await apiFetch(`${resourceBase}/${editing ? "update" : "create"}.php`, { method: "POST", json: payload });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">{editing ? `Editar ${articulo} ${itemLabel.toLowerCase()}` : `Nuev${articulo === "la" ? "a" : "o"} ${itemLabel.toLowerCase()}`}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={inputCls} />
            </div>
            {campos.map((c) => (
              <div key={c.key}>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">{c.label}</label>
                <input
                  type={c.type} required={c.required}
                  value={valores[c.key] ?? ""}
                  onChange={(e) => setValores((prev) => ({ ...prev, [c.key]: e.target.value }))}
                  className={inputCls}
                />
              </div>
            ))}
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
