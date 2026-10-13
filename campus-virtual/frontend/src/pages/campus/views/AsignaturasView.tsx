import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Search, Download, ChevronDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import AsignaturaDetailView from "./AsignaturaDetailView";
import { useUrlState } from "../useUrlState";

interface Programa { id: number; nombre: string }
interface DocenteAsignado { id: number; nombre: string; identificacion: string }
interface Asignatura {
  id: number;
  nombre: string;
  codigo: string | null;
  abreviacion: string | null;
  num_creditos: number | null;
  programas: Programa[];
  docentes: DocenteAsignado[];
  matriculados: number;
  descripcion: string | null;
  imagen_path: string | null;
  publicado: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
}
interface DocenteOption { id: number; nombre_completo: string }

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const PAGE_SIZE = 12;

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function AsignaturaForm({
  editing, programas, onDone, onCreated,
}: { editing: Asignatura | null; programas: Programa[]; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [codigo, setCodigo] = useState(editing?.codigo ?? "");
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [abreviacion, setAbreviacion] = useState(editing?.abreviacion ?? "");
  const [numCreditos, setNumCreditos] = useState(editing?.num_creditos != null ? String(editing.num_creditos) : "");
  // Lo que ve el estudiante en su tarjeta ("qué se va a aprender aquí") —
  // sin esto el campo quedaba guardado pero nunca se podía escribir.
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [selected, setSelected] = useState<number[]>(editing?.programas.map((p) => p.id) ?? []);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [selectedDocentes, setSelectedDocentes] = useState<number[]>((editing?.docentes ?? []).map((d) => d.id));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ docentes: DocenteOption[] }>("/docentes/list.php").then((d) => setDocentes(d.docentes)).catch(() => {});
  }, []);

  useEffect(() => {
    setOpen(!!editing);
    setCodigo(editing?.codigo ?? "");
    setNombre(editing?.nombre ?? "");
    setAbreviacion(editing?.abreviacion ?? "");
    setNumCreditos(editing?.num_creditos != null ? String(editing.num_creditos) : "");
    setDescripcion(editing?.descripcion ?? "");
    setSelected(editing?.programas.map((p) => p.id) ?? []);
    setSelectedDocentes((editing?.docentes ?? []).map((d) => d.id));
  }, [editing]);

  const reset = () => { setCodigo(""); setNombre(""); setAbreviacion(""); setNumCreditos(""); setDescripcion(""); setSelected([]); setSelectedDocentes([]); setError(""); };

  const toggle = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleDocente = (id: number) =>
    setSelectedDocentes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = {
        codigo: codigo.trim() || null, nombre: nombre.trim(), abreviacion: abreviacion.trim() || null,
        numCreditos: numCreditos ? Number(numCreditos) : null, descripcion: descripcion.trim() || null,
        programaIds: selected, docenteIds: selectedDocentes,
      };
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
      <div className="grid grid-cols-3 gap-2">
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código (ej. 02 - BCI)" className={inputCls} />
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la asignatura" className={`${inputCls} col-span-2`} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={abreviacion} onChange={(e) => setAbreviacion(e.target.value)} placeholder="Abreviación (opcional)" className={inputCls} />
        <input value={numCreditos} onChange={(e) => setNumCreditos(e.target.value)} placeholder="Número de créditos (opcional)" type="number" className={inputCls} />
      </div>
      <textarea
        value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
        placeholder="Descripción breve — qué va a aprender el estudiante aquí (aparece en su tarjeta)"
        className={`${inputCls} resize-none`}
      />

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

      <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Docentes que la dictan (opcional, se pueden agregar varios)</p>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white rounded-lg border border-slate-200">
          {docentes.length === 0 ? (
            <p className="text-[11px] text-slate-400 px-1">No hay docentes registrados aún.</p>
          ) : docentes.map((d) => (
            <button key={d.id} type="button" onClick={() => toggleDocente(d.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                selectedDocentes.includes(d.id)
                  ? "bg-[#C41717] border-[#C41717] text-white"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
              }`}>
              {d.nombre_completo}
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
  const { currentUser, canVer } = useCampusAuth();
  // Docente tiene edición completa en Asignaturas, igual que Super Admin.
  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role === "docente";
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  const canViewDetail = canManage || canVer("academico.asignaturas");
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [programas, setProgramas]     = useState<Programa[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editing, setEditing]         = useState<Asignatura | null>(null);
  const [deleting, setDeleting]       = useState<Asignatura | null>(null);
  // El id de la asignatura abierta vive en la URL (?asignaturaId=...), no en
  // useState — así Ctrl+Shift+R te deja en la misma asignatura.
  const [asignaturaIdParam, setAsignaturaIdParam] = useUrlState("asignaturaId");
  const viewing = asignaturaIdParam ? (asignaturas.find((a) => a.id === Number(asignaturaIdParam)) ?? null) : null;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return asignaturas;
    return asignaturas.filter((a) => `${a.codigo ?? ""} ${a.nombre} ${a.abreviacion ?? ""}`.toLowerCase().includes(term));
  }, [asignaturas, search]);

  useEffect(() => setPage(1), [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportar = () => {
    const header = ["Código", "Nombre", "Abreviación", "Créditos", "Estudiantes", "Programas", "Docentes"];
    const rows = filtered.map((a) => [a.codigo ?? "", a.nombre, a.abreviacion ?? "", a.num_creditos != null ? String(a.num_creditos) : "", String(a.matriculados), a.programas.map((p) => p.nombre).join("; "), (a.docentes ?? []).map((d) => d.nombre).join("; ")]);
    const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(",")).join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asignaturas.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  if (viewing) {
    return (
      <AsignaturaDetailView
        asignatura={viewing}
        onBack={() => { setAsignaturaIdParam(null); load(); }}
        onUpdated={load}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Asignaturas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Asignaturas y módulos, reutilizables entre varios programas</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {asignaturas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          {isSuperAdmin && <AsignaturaForm editing={editing} programas={programas} onDone={() => setEditing(null)} onCreated={load} />}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar asignaturas..."
                className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
            </div>
            <button onClick={exportar}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>

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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Código</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Abreviación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Créditos</th>
                      <th className="text-center px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Estudiantes</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Programas</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Docentes</th>
                      {canViewDetail && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={canViewDetail ? 8 : 7} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((a, idx) => (
                      <tr key={a.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-500 text-xs font-medium whitespace-nowrap">{a.codigo ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{a.nombre}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{a.abreviacion ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{a.num_creditos ?? "—"}</td>
                        <td className="px-4 py-2 text-center text-slate-500 text-xs">{a.matriculados}</td>
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
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {(a.docentes ?? []).length === 0 ? (
                              <span className="text-slate-300 text-xs">—</span>
                            ) : (a.docentes ?? []).map((d) => (
                              <span key={d.id} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-medium">
                                {d.nombre}
                              </span>
                            ))}
                          </div>
                        </td>
                        {canViewDetail && (
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setAsignaturaIdParam(String(a.id))} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver asignatura">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {isSuperAdmin && (
                                <>
                                  <button onClick={() => setEditing(a)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setDeleting(a)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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
        title="Eliminar asignatura"
        message={`¿Eliminar "${deleting?.nombre}"? Los cursos que la usan quedarán sin asignatura asignada. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
