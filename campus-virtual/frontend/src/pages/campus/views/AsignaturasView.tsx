import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface Programa { id: number; nombre: string }
interface Asignatura {
  id: number;
  nombre: string;
  codigo: string | null;
  num_creditos: number | null;
  programas: Programa[];
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

function AsignaturaForm({
  editing, programas, onDone, onCreated,
}: { editing: Asignatura | null; programas: Programa[]; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [numCreditos, setNumCreditos] = useState(editing?.num_creditos != null ? String(editing.num_creditos) : "");
  const [selected, setSelected] = useState<number[]>(editing?.programas.map((p) => p.id) ?? []);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setNombre(editing?.nombre ?? "");
    setNumCreditos(editing?.num_creditos != null ? String(editing.num_creditos) : "");
    setSelected(editing?.programas.map((p) => p.id) ?? []);
  }, [editing]);

  const reset = () => { setNombre(""); setNumCreditos(""); setSelected([]); setError(""); };

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = { nombre: nombre.trim(), numCreditos: numCreditos ? Number(numCreditos) : null, programaIds: selected };
      if (editing) {
        await apiFetch("/asignaturas/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/asignaturas/create.php", { method: "POST", json: payload });
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
        <Plus className="w-3.5 h-3.5" /> Crear asignatura
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando asignatura" : "Nueva asignatura"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la asignatura" className={inputCls} />
      <input value={numCreditos} onChange={(e) => setNumCreditos(e.target.value)} placeholder="Número de créditos (opcional)" type="number" className={inputCls} />

      <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Programas a los que pertenece (opcional, se puede vincular a varios)</p>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
          {programas.length === 0 ? (
            <p className="text-[11px] text-slate-400 px-1">No hay programas creados aún.</p>
          ) : programas.map((p) => (
            <button key={p.id} type="button" onClick={() => toggle(p.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                selected.includes(p.id)
                  ? "bg-[#C41717] border-[#C41717] text-white"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
              }`}>
              {p.nombre}
            </button>
          ))}
        </div>
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

export default function AsignaturasView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [programas, setProgramas]     = useState<Programa[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editing, setEditing]         = useState<Asignatura | null>(null);
  const [deleting, setDeleting]       = useState<Asignatura | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ asignaturas: Asignatura[] }>("/asignaturas/list.php"),
      apiFetch<{ programas: Programa[] }>("/programas/list.php"),
    ])
      .then(([a, p]) => { setAsignaturas(a.asignaturas); setProgramas(p.programas); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/asignaturas/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar la asignatura.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Asignaturas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Asignaturas y módulos, reutilizables entre varios programas</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {asignaturas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <AsignaturaForm editing={editing} programas={programas} onDone={() => setEditing(null)} onCreated={load} />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Asignatura</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Créditos</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Programas</th>
                    {isSuperAdmin && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {asignaturas.length === 0 ? (
                    <tr><td colSpan={isSuperAdmin ? 4 : 3} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                  ) : asignaturas.map((a, idx) => (
                    <tr key={a.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                      <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{a.nombre}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{a.num_creditos ?? "—"}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.programas.length === 0 ? (
                            <span className="text-slate-300 text-xs">—</span>
                          ) : a.programas.map((p) => (
                            <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">
                              {p.nombre}
                            </span>
                          ))}
                        </div>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setEditing(a)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleting(a)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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
        title="Eliminar asignatura"
        message={`¿Eliminar "${deleting?.nombre}"? Los cursos que la usan quedarán sin asignatura asignada. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
