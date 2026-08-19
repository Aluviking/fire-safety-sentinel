import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ConfirmModal } from "../ConfirmModal";

interface Perfil { id: number; nombre: string; descripcion: string | null; estado: string }
type Permisos = Record<string, { ver: boolean; editar: boolean }>;
interface PerfilDetalle extends Perfil { permisos: Permisos }
type Categorias = Record<string, Record<string, string>>;

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

function PerfilForm({
  editingId, categorias, onDone, onSaved,
}: { editingId: number | null; categorias: Categorias; onDone: () => void; onSaved: () => void }) {
  const [open, setOpen] = useState(editingId !== null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [permisos, setPermisos] = useState<Permisos>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(editingId !== null);
    if (editingId === null) { reset(); return; }
    setLoadingDetail(true);
    apiFetch<{ perfil: PerfilDetalle }>(`/perfiles/get.php?id=${editingId}`)
      .then((d) => {
        setNombre(d.perfil.nombre);
        setDescripcion(d.perfil.descripcion ?? "");
        setEstado(d.perfil.estado);
        setPermisos(d.perfil.permisos);
      })
      .finally(() => setLoadingDetail(false));
  }, [editingId]);

  const reset = () => { setNombre(""); setDescripcion(""); setEstado("Activo"); setPermisos({}); setError(""); };

  const toggle = (modulo: string, campo: "ver" | "editar") => {
    setPermisos((prev) => {
      const current = prev[modulo] ?? { ver: false, editar: false };
      const next = { ...current, [campo]: !current[campo] };
      // Marcar "editar" implica poder "ver" — no tiene sentido editar algo que no se puede ver.
      if (campo === "editar" && next.editar) next.ver = true;
      if (campo === "ver" && !next.ver) next.editar = false;
      return { ...prev, [modulo]: next };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = { nombre: nombre.trim(), descripcion: descripcion || null, estado, permisos };
      if (editingId !== null) {
        await apiFetch("/perfiles/update.php", { method: "POST", json: { id: editingId, ...payload } });
      } else {
        await apiFetch("/perfiles/create.php", { method: "POST", json: payload });
      }
      reset();
      setOpen(false);
      onSaved();
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
        <Plus className="w-3.5 h-3.5" /> Crear perfil
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editingId !== null ? "Editando perfil" : "Nuevo perfil"}</p>
        <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (ej. Coordinador Académico)" className={`${inputCls} col-span-2`} />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" className={inputCls} />

      {loadingDetail ? (
        <div className="flex justify-center py-6 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-slate-500">Permisos por módulo</p>
          {Object.entries(categorias).map(([categoria, modulos]) => (
            <div key={categoria} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <p className="px-3 py-1.5 bg-slate-100 text-[11px] font-bold text-slate-600 uppercase tracking-wide">{categoria}</p>
              <div className="divide-y divide-slate-100">
                {Object.entries(modulos).map(([key, label]) => {
                  const p = permisos[key] ?? { ver: false, editar: false };
                  return (
                    <div key={key} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="text-slate-700">{label}</span>
                      <div className="flex items-center gap-4 shrink-0">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                          <input type="checkbox" checked={p.ver} onChange={() => toggle(key, "ver")} className="accent-[#C41717]" /> Ver
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                          <input type="checkbox" checked={p.editar} onChange={() => toggle(key, "editar")} className="accent-[#C41717]" /> Editar
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {submitting ? "Guardando..." : editingId !== null ? "Guardar cambios" : "Crear"}
        </button>
        <button type="button" onClick={() => { setOpen(false); reset(); onDone(); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function PerfilesView() {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [categorias, setCategorias] = useState<Categorias>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Perfil | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ perfiles: Perfil[] }>("/perfiles/list.php"),
      apiFetch<{ categorias: Categorias }>("/perfiles/modulos.php"),
    ])
      .then(([p, c]) => { setPerfiles(p.perfiles); setCategorias(c.categorias); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/perfiles/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el perfil.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#C41717]" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Perfiles</h1>
          <p className="text-slate-500 text-xs">Perfiles de permisos por módulo — asígnalos a usuarios desde Usuarios.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          {editingId !== null ? (
            <PerfilForm editingId={editingId} categorias={categorias} onDone={() => setEditingId(null)} onSaved={load} />
          ) : creating ? (
            <PerfilForm editingId={null} categorias={categorias} onDone={() => setCreating(false)} onSaved={load} />
          ) : (
            <button onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#C41717]
                         hover:bg-[#C41717]/5 rounded-xl border border-dashed border-[#C41717]/30 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Crear perfil
            </button>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : perfiles.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Aún no hay perfiles creados. Los usuarios sin perfil asignado siguen viendo todo.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {perfiles.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.nombre}</p>
                    {p.descripcion && <p className="text-xs text-slate-500 truncate">{p.descripcion}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${
                      p.estado === "Inactivo" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                      {p.estado}
                    </span>
                    <button onClick={() => { setCreating(false); setEditingId(p.id); }} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleting}
        title="Eliminar perfil"
        message={`¿Eliminar "${deleting?.nombre}"? Los usuarios que lo tenían asignado volverán a ver todo (sin perfil). Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
