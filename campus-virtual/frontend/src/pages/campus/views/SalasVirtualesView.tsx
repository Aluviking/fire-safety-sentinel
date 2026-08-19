import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Building2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface AulaRecurso {
  id: number;
  nombre: string;
  capacidad_maxima: number | null;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

function AulaForm({ editing, onDone, onCreated }: { editing: AulaRecurso | null; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [capacidad, setCapacidad] = useState(editing?.capacidad_maxima != null ? String(editing.capacidad_maxima) : "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setNombre(editing?.nombre ?? "");
    setCapacidad(editing?.capacidad_maxima != null ? String(editing.capacidad_maxima) : "");
  }, [editing]);

  const reset = () => { setNombre(""); setCapacidad(""); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = { nombre: nombre.trim(), capacidadMaxima: capacidad ? Number(capacidad) : null };
      if (editing) {
        await apiFetch("/aulas-recursos/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/aulas-recursos/create.php", { method: "POST", json: payload });
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
        <Plus className="w-3.5 h-3.5" /> Crear aula virtual
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando aula" : "Nueva aula virtual"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del aula (ej. Aula Virtual 2)" className={inputCls} />
      <input value={capacidad} onChange={(e) => setCapacidad(e.target.value)} placeholder="Capacidad máxima (opcional)" type="number" className={inputCls} />
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

export default function SalasVirtualesView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [aulas, setAulas]     = useState<AulaRecurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [editing, setEditing] = useState<AulaRecurso | null>(null);
  const [deleting, setDeleting] = useState<AulaRecurso | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ aulas: AulaRecurso[] }>("/aulas-recursos/list.php")
      .then((data) => setAulas(data.aulas))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/aulas-recursos/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el aula.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Aulas virtuales</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Catálogo de salas virtuales y su capacidad. No confundir con "Educación virtual" (esa es el registro de
            asistencia real a sesiones) — esto es el listado de salas en sí, nuevo, aún sin datos importados.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {aulas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <AulaForm editing={editing} onDone={() => setEditing(null)} onCreated={load} />
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : aulas.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aún no hay aulas virtuales registradas.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {aulas.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-[#C41717]" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">{a.nombre}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">
                      Capacidad: <span className="font-semibold text-slate-700">{a.capacidad_maxima ?? "—"}</span>
                    </span>
                    {isSuperAdmin && (
                      <div className="flex items-center gap-2.5">
                        <button onClick={() => setEditing(a)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleting(a)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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
        title="Eliminar aula virtual"
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
