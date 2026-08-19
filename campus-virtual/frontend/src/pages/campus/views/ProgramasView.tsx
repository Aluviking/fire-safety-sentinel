import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Search, Download, ChevronDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import ProgramaDetailView from "./ProgramaDetailView";

interface Programa {
  id: number;
  codigo: string | null;
  nombre: string;
  pensum: string | null;
  abreviacion: string | null;
  estado: string | null;
  disponible_oferta_laboral: string | null;
  matriculados: number;
  descripcion: string | null;
  imagen_path: string | null;
  publicado: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const PAGE_SIZE = 12;

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

function ProgramaForm({ editing, onDone, onCreated }: { editing: Programa | null; onDone: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(!!editing);
  const [codigo, setCodigo] = useState(editing?.codigo ?? "");
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [pensum, setPensum] = useState(editing?.pensum ?? "");
  const [abreviacion, setAbreviacion] = useState(editing?.abreviacion ?? "");
  const [estado, setEstado] = useState(editing?.estado ?? "Activo");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    setCodigo(editing?.codigo ?? "");
    setNombre(editing?.nombre ?? "");
    setPensum(editing?.pensum ?? "");
    setAbreviacion(editing?.abreviacion ?? "");
    setEstado(editing?.estado ?? "Activo");
  }, [editing]);

  const reset = () => { setCodigo(""); setNombre(""); setPensum(""); setAbreviacion(""); setEstado("Activo"); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = { codigo: codigo.trim() || null, nombre: nombre.trim(), pensum: pensum || null, abreviacion: abreviacion.trim() || null, estado };
      if (editing) {
        await apiFetch("/programas/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/programas/create.php", { method: "POST", json: payload });
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
      <div className="grid grid-cols-3 gap-2">
        <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código (ej. BCI)" className={inputCls} />
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del programa" className={`${inputCls} col-span-2`} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={pensum} onChange={(e) => setPensum(e.target.value)} placeholder="Pensum (opcional)" className={inputCls} />
        <input value={abreviacion} onChange={(e) => setAbreviacion(e.target.value)} placeholder="Abreviación (opcional)" className={inputCls} />
      </div>
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
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editing, setEditing]     = useState<Programa | null>(null);
  const [deleting, setDeleting]   = useState<Programa | null>(null);
  const [viewing, setViewing]     = useState<Programa | null>(null);

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    apiFetch<{ programas: Programa[] }>("/programas/list.php")
      .then((data) => setProgramas(data.programas))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return programas.filter((p) => {
      if (estadoFilter && p.estado !== estadoFilter) return false;
      if (term) {
        const haystack = `${p.codigo ?? ""} ${p.nombre} ${p.abreviacion ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [programas, search, estadoFilter]);

  useEffect(() => setPage(1), [search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportar = () => {
    const header = ["Código", "Nombre", "Abreviación", "Estudiantes", "Estado"];
    const rows = filtered.map((p) => [p.codigo ?? "", p.nombre, p.abreviacion ?? "", String(p.matriculados), p.estado ?? ""]);
    const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(",")).join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "programas.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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

  if (viewing) {
    return (
      <ProgramaDetailView
        programa={viewing}
        onBack={() => { setViewing(null); load(); }}
        onUpdated={() => { load(); apiFetch<{ programas: Programa[] }>("/programas/list.php").then((d) => {
          const fresh = d.programas.find((p) => p.id === viewing.id);
          if (fresh) setViewing(fresh);
        }); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Programas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Programas académicos de GFO Academy</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {programas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <ProgramaForm editing={editing} onDone={() => setEditing(null)} onCreated={load} />

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar programas..."
                className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
            </div>
            <button onClick={exportar}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <div className="w-40">
              <Dropdown label={estadoFilter || "Estado: Todos"}>
                {(close) => (
                  <>
                    <button onClick={() => { setEstadoFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                    <button onClick={() => { setEstadoFilter("Activo"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Activo</button>
                    <button onClick={() => { setEstadoFilter("Inactivo"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Inactivo</button>
                  </>
                )}
              </Dropdown>
            </div>
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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Código</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Abreviación</th>
                      <th className="text-center px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estudiantes</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                      {canManage && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={canManage ? 6 : 5} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((p, idx) => (
                      <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-500 text-xs font-medium">{p.codigo ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{p.nombre}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{p.abreviacion ?? "—"}</td>
                        <td className="px-4 py-2 text-center text-slate-500 text-xs">{p.matriculados}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${
                            p.estado === "Inactivo" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            {p.estado ?? "—"}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setViewing(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver programa">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {isSuperAdmin && (
                                <>
                                  <button onClick={() => setEditing(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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
        title="Eliminar programa"
        message={`¿Eliminar "${deleting?.nombre}"? Los cursos que lo usan quedarán sin programa asignado. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
