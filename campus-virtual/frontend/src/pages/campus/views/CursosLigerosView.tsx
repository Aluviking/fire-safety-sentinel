import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import CursoLigeroDetailView from "./CursoLigeroDetailView";

interface Docente { identificacion: string; nombre_completo: string }
interface CursoLigero {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  imagen_path: string | null;
  docente_identificacion: string | null;
  docente_nombre: string | null;
  estado: string;
  usuarios_inscritos: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
  certificado_nombre: string | null;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

// Colores por categoría, igual patrón de badges que se vio en la referencia
// (Salud y bienestar en azul, Seguridad en morado) — cualquier categoría
// nueva que se escriba cae en el color neutro por defecto.
const CATEGORIA_COLOR: Record<string, string> = {
  "Salud y bienestar": "bg-blue-100 text-blue-700",
  "Seguridad": "bg-purple-100 text-purple-700",
};
const categoriaBadge = (c: string | null) => CATEGORIA_COLOR[c ?? ""] ?? "bg-slate-100 text-slate-600";

function CursoLigeroForm({
  editing, docentes, onDone, onCreated,
}: { editing: CursoLigero | null; docentes: Docente[]; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [docenteId, setDocenteId] = useState("");
  const [estado, setEstado] = useState("No publicado");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setNombre(editing?.nombre ?? "");
    setCategoria(editing?.categoria ?? "");
    setDocenteId(editing?.docente_identificacion ?? "");
    setEstado(editing?.estado ?? "No publicado");
  }, [editing]);

  const reset = () => { setNombre(""); setCategoria(""); setDocenteId(""); setEstado("No publicado"); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const docente = docentes.find((d) => d.identificacion === docenteId);
      const payload = {
        nombre: nombre.trim(), categoria: categoria || null, estado,
        docenteIdentificacion: docente?.identificacion ?? null, docenteNombre: docente?.nombre_completo ?? null,
      };
      if (editing) {
        await apiFetch("/cursos-ligeros/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/cursos-ligeros/create.php", { method: "POST", json: payload });
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
        <Plus className="w-3.5 h-3.5" /> Crear curso ligero
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando curso ligero" : "Nuevo curso ligero"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del curso" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Categoría (ej. Salud y bienestar)" className={inputCls} />
        <select value={docenteId} onChange={(e) => setDocenteId(e.target.value)} className={inputCls}>
          <option value="">Docente (opcional)...</option>
          {docentes.map((d) => <option key={d.identificacion} value={d.identificacion}>{d.nombre_completo}</option>)}
        </select>
      </div>
      <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
        <option value="No publicado">No publicado</option>
        <option value="Publicado">Publicado</option>
      </select>
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

export default function CursosLigerosView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [cursos, setCursos]     = useState<CursoLigero[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [editing, setEditing]   = useState<CursoLigero | null>(null);
  const [deleting, setDeleting] = useState<CursoLigero | null>(null);
  const [viewing, setViewing]   = useState<CursoLigero | null>(null);
  const canManage = currentUser?.role === "admin" || isSuperAdmin;

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ cursosLigeros: CursoLigero[] }>("/cursos-ligeros/list.php"),
      apiFetch<{ docentes: Docente[] }>("/docentes/list.php"),
    ])
      .then(([c, d]) => { setCursos(c.cursosLigeros); setDocentes(d.docentes); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/cursos-ligeros/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el curso ligero.");
    }
  };

  if (viewing) {
    return (
      <CursoLigeroDetailView
        curso={viewing}
        onBack={() => setViewing(null)}
        onUpdated={() => { load(); apiFetch<{ cursosLigeros: CursoLigero[] }>("/cursos-ligeros/list.php").then((d) => {
          const fresh = d.cursosLigeros.find((c) => c.id === viewing.id);
          if (fresh) setViewing(fresh);
        }); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cursos ligeros</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cursos autoguiados publicables. Nuevo, sin datos importados de Q10.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {cursos.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <CursoLigeroForm editing={editing} docentes={docentes} onDone={() => setEditing(null)} onCreated={load} />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Categoría</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Docente</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Usuarios</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                    {canManage && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cursos.length === 0 ? (
                    <tr><td colSpan={canManage ? 6 : 5} className="text-center py-12 text-slate-400 text-sm">Aún no hay cursos ligeros creados.</td></tr>
                  ) : cursos.map((c, idx) => (
                    <tr key={c.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                      <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{c.nombre}</td>
                      <td className="px-4 py-2">
                        {c.categoria ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoriaBadge(c.categoria)}`}>{c.categoria}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.docente_nombre ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-600 text-xs">{c.usuarios_inscritos}</td>
                      <td className="px-4 py-2">
                        {c.estado === "Publicado" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Publicado</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">No publicado</span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setViewing(c)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver curso">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isSuperAdmin && (
                              <>
                                <button onClick={() => setEditing(c)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleting(c)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
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
        title="Eliminar curso ligero"
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
