import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Eye, Search, Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import { SearchableSelect } from "../SearchableSelect";
import CursoLigeroDetailView from "./CursoLigeroDetailView";
import { useUrlState } from "../useUrlState";

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
const PAGE_SIZE = 12;

// Colores por categoría — cualquier categoría nueva que se escriba cae en el
// color neutro por defecto.
const CATEGORIA_COLOR: Record<string, string> = {
  "Salud y bienestar": "bg-blue-100 text-blue-700",
  "Seguridad": "bg-purple-100 text-purple-700",
};
const categoriaBadge = (c: string | null) => CATEGORIA_COLOR[c ?? ""] ?? "bg-slate-100 text-slate-600";

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function Dropdown({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2
                   text-slate-600 hover:border-[#C41717]/40 transition-colors">
        <span className="truncate">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 top-full mt-1.5 min-w-full w-max max-w-xs max-h-64 overflow-y-auto bg-white rounded-xl
                         border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-20 py-1.5">
              {children(() => setOpen(false))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <SearchableSelect
          value={docenteId} onChange={setDocenteId}
          options={docentes.map((d) => ({ value: d.identificacion, label: d.nombre_completo }))}
          placeholder="Docente (opcional)..."
        />
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
  const { currentUser, canVer } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [cursos, setCursos]     = useState<CursoLigero[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [editing, setEditing]   = useState<CursoLigero | null>(null);
  const [deleting, setDeleting] = useState<CursoLigero | null>(null);
  // El id del curso ligero abierto vive en la URL (?cursoLigeroId=...), no
  // en useState — así Ctrl+Shift+R te deja en el mismo curso.
  const [cursoIdParam, setCursoIdParam] = useUrlState("cursoLigeroId");
  const viewing = cursoIdParam ? (cursos.find((c) => c.id === Number(cursoIdParam)) ?? null) : null;
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  const canViewDetail = canManage || canVer("academico.cursos_ligeros");

  const [search, setSearch] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [docenteFilter, setDocenteFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ cursosLigeros: CursoLigero[] }>("/cursos-ligeros/list.php"),
      // Docente no tiene permiso sobre institucional.docentes (solo lo usa
      // para el filtro "por docente", que a un docente no le sirve de nada
      // — solo ve sus propios cursos) — si falla, no debe tumbar la lista
      // real de cursos, solo dejar el filtro vacío.
      apiFetch<{ docentes: Docente[] }>("/docentes/list.php").catch(() => ({ docentes: [] })),
    ])
      .then(([c, d]) => { setCursos(c.cursosLigeros); setDocentes(d.docentes); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Las categorías del filtro salen de los cursos ligeros reales ya
  // cargados, no de una lista fija — así cualquier categoría nueva que se
  // escriba al crear un curso aparece automáticamente en el filtro.
  const categorias = useMemo(() => {
    const set = new Set<string>();
    cursos.forEach((c) => { if (c.categoria) set.add(c.categoria); });
    return Array.from(set).sort();
  }, [cursos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cursos.filter((c) => {
      if (categoriaFilter && c.categoria !== categoriaFilter) return false;
      if (docenteFilter && c.docente_identificacion !== docenteFilter) return false;
      if (estadoFilter && c.estado !== estadoFilter) return false;
      if (term) {
        const haystack = `${c.nombre} ${c.categoria ?? ""} ${c.docente_nombre ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [cursos, search, categoriaFilter, docenteFilter, estadoFilter]);

  useEffect(() => setPage(1), [search, categoriaFilter, docenteFilter, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportar = () => {
    const header = ["Nombre", "Categoría", "Docente", "Usuarios", "Estado"];
    const rows = filtered.map((c) => [c.nombre, c.categoria ?? "", c.docente_nombre ?? "", String(c.usuarios_inscritos), c.estado]);
    const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(",")).join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cursos-ligeros.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
        onBack={() => setCursoIdParam(null)}
        onUpdated={load}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cursos ligeros</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cursos autoguiados publicables</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {cursos.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <CursoLigeroForm editing={editing} docentes={docentes} onDone={() => setEditing(null)} onCreated={load} />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cursos ligeros..."
                className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
            </div>
            <button onClick={exportar}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button onClick={() => setAdvancedOpen((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-[#C41717] hover:text-[#B01313]">
              Búsqueda avanzada {advancedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {advancedOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-xl">
              <Dropdown label={categoriaFilter || "Categoría: Todas"}>
                {(close) => (
                  <>
                    <button onClick={() => { setCategoriaFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todas</button>
                    {categorias.map((c) => (
                      <button key={c} onClick={() => { setCategoriaFilter(c); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{c}</button>
                    ))}
                  </>
                )}
              </Dropdown>
              <Dropdown label={docenteFilter ? (docentes.find((d) => d.identificacion === docenteFilter)?.nombre_completo ?? "Docente") : "Docente: Todos"}>
                {(close) => (
                  <>
                    <button onClick={() => { setDocenteFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                    {docentes.map((d) => (
                      <button key={d.identificacion} onClick={() => { setDocenteFilter(d.identificacion); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{d.nombre_completo}</button>
                    ))}
                  </>
                )}
              </Dropdown>
              <Dropdown label={estadoFilter || "Estado: Todos"}>
                {(close) => (
                  <>
                    <button onClick={() => { setEstadoFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                    <button onClick={() => { setEstadoFilter("Publicado"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Publicado</button>
                    <button onClick={() => { setEstadoFilter("No publicado"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">No publicado</button>
                  </>
                )}
              </Dropdown>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Categoría</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Docente</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Usuarios</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                      {canViewDetail && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={canViewDetail ? 6 : 5} className="text-center py-12 text-slate-400 text-sm">Aún no hay cursos ligeros creados.</td></tr>
                    ) : paged.map((c, idx) => (
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
                        {canViewDetail && (
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setCursoIdParam(String(c.id))} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver curso">
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <button onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#C41717] hover:border-[#C41717]/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${n === page ? "bg-[#C41717] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((v) => Math.min(totalPages, v + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#C41717] hover:border-[#C41717]/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
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
