import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface Programa {
  id: number;
  nombre: string;
  pensum: string | null;
  estado: string | null;
  disponible_oferta_laboral: string | null;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

function ProgramaForm({ editing, onDone, onCreated }: { editing: Programa | null; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [pensum, setPensum] = useState(editing?.pensum ?? "");
  const [estado, setEstado] = useState(editing?.estado ?? "Activo");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setNombre(editing?.nombre ?? "");
    setPensum(editing?.pensum ?? "");
    setEstado(editing?.estado ?? "Activo");
  }, [editing]);

  const reset = () => { setNombre(""); setPensum(""); setEstado("Activo"); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      if (editing) {
        await apiFetch("/programas/update.php", { method: "POST", json: { id: editing.id, nombre: nombre.trim(), pensum: pensum || null, estado } });
      } else {
        await apiFetch("/programas/create.php", { method: "POST", json: { nombre: nombre.trim(), pensum: pensum || null } });
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
        <Plus className="w-3.5 h-3.5" /> Crear programa
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando programa" : "Nuevo programa"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del programa" className={inputCls} />
      <input value={pensum} onChange={(e) => setPensum(e.target.value)} placeholder="Pensum (opcional)" className={inputCls} />
      {editing && (
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      )}
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

export default function ProgramasView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editing, setEditing]     = useState<Programa | null>(null);
  const [deleting, setDeleting]   = useState<Programa | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ programas: Programa[] }>("/programas/list.php")
      .then((data) => setProgramas(data.programas))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/programas/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el programa.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Programas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Programas académicos de GFO Academy</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {programas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <ProgramaForm editing={editing} onDone={() => setEditing(null)} onCreated={load} />
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {programas.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Aún no hay programas.</p>
              ) : programas.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.nombre}</p>
                    {p.pensum && <p className="text-xs text-slate-500 truncate">{p.pensum}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                      {p.estado ?? "—"}
                    </span>
                    {isSuperAdmin && (
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => setEditing(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Eliminar programa"
        message={`¿Eliminar "${deleting?.nombre}"? Los cursos que lo usan quedarán sin programa asignado. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
