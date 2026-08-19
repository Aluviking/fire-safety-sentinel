import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface Asignatura { id: number; nombre: string }
interface Plantilla {
  id: number;
  asignatura_id: number | null;
  asignatura: string | null;
  fecha: string | null;
  estado: string;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const fmtFecha = (v: string | null) => (v ? v.split("-").reverse().join("/") : "—");

function PlantillaForm({
  editing, asignaturas, onDone, onCreated,
}: { editing: Plantilla | null; asignaturas: Asignatura[]; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [asignaturaId, setAsignaturaId] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("Creada");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setAsignaturaId(editing?.asignatura_id != null ? String(editing.asignatura_id) : "");
    setFecha(editing?.fecha ?? "");
    setEstado(editing?.estado ?? "Creada");
  }, [editing]);

  const reset = () => { setAsignaturaId(""); setFecha(""); setEstado("Creada"); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!asignaturaId) { setError("La asignatura es obligatoria."); return; }
    setSubmitting(true);
    try {
      const payload = { asignaturaId: Number(asignaturaId), fecha: fecha || null, estado };
      if (editing) {
        await apiFetch("/plantillas/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/plantillas/create.php", { method: "POST", json: payload });
      }
      reset();
      setOpen(false);
      onCreated();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#C41717]
                   hover:bg-[#C41717]/5 rounded-xl border border-dashed border-[#C41717]/30 transition-colors">
        <Plus className="w-3.5 h-3.5" /> Crear plantilla
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando plantilla" : "Nueva plantilla"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <select value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)} className={inputCls}>
        <option value="">Asignatura...</option>
        {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input value={fecha} onChange={(e) => setFecha(e.target.value)} type="date" className={inputCls} />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
          <option value="Creada">Creada</option>
          <option value="En revisión">En revisión</option>
          <option value="Publicada">Publicada</option>
        </select>
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
        </button>
        <button type="button" onClick={() => { setOpen(false); reset(); onDone(); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function PlantillasView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [plantillas, setPlantillas]   = useState<Plantilla[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editing, setEditing]         = useState<Plantilla | null>(null);
  const [deleting, setDeleting]       = useState<Plantilla | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ plantillas: Plantilla[] }>("/plantillas/list.php"),
      apiFetch<{ asignaturas: Asignatura[] }>("/asignaturas/list.php"),
    ])
      .then(([p, a]) => { setPlantillas(p.plantillas); setAsignaturas(a.asignaturas); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/plantillas/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar la plantilla.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Plantillas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Plantillas de educación virtual por asignatura. Nuevo, sin datos importados de Q10.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {plantillas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <PlantillaForm editing={editing} asignaturas={asignaturas} onDone={() => setEditing(null)} onCreated={load} />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                    {isSuperAdmin && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plantillas.length === 0 ? (
                    <tr><td colSpan={isSuperAdmin ? 4 : 3} className="text-center py-12 text-slate-400 text-sm">Aún no hay plantillas creadas.</td></tr>
                  ) : plantillas.map((p, idx) => (
                    <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                      <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{p.asignatura ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{fmtFecha(p.fecha)}</td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">{p.estado}</span>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setEditing(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Eliminar plantilla"
        message={`¿Eliminar la plantilla de "${deleting?.asignatura}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
