import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Eye, Pencil, X, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import { SearchableSelect } from "../SearchableSelect";
import PlantillaDetailView from "./PlantillaDetailView";
import { useUrlState } from "../useUrlState";

interface Asignatura { id: number; nombre: string }
interface Plantilla {
  id: number;
  nombre: string | null;
  asignatura_id: number | null;
  asignatura: string | null;
  fecha: string | null;
  estado: string;
  imagen_path: string | null;
  publicado_por_defecto: number;
}

const ESTADOS = ["Creada", "En revisión", "Publicada"];
const ESTADO_BADGE: Record<string, string> = {
  Creada: "bg-slate-100 border-slate-200 text-slate-600",
  "En revisión": "bg-amber-50 border-amber-200 text-amber-700",
  Publicada: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const fmtFecha = (v: string | null) => (v ? v.split("-").reverse().join("/") : "—");
const PAGE_SIZE = 12;

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

/* ── Crear / editar plantilla ─────────────────────────────────────────────── */
function PlantillaForm({
  editing, asignaturas, onDone, onSaved,
}: { editing: Plantilla | null; asignaturas: Asignatura[]; onDone: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [asignaturaId, setAsignaturaId] = useState(editing?.asignatura_id != null ? String(editing.asignatura_id) : "");
  const [fecha, setFecha] = useState(editing?.fecha ?? "");
  const [estado, setEstado] = useState(editing?.estado ?? "Creada");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() && !asignaturaId) { setError("Escribe un nombre o selecciona una asignatura."); return; }
    setSubmitting(true);
    try {
      const payload = { nombre: nombre.trim() || null, asignaturaId: asignaturaId ? Number(asignaturaId) : null, fecha: fecha || null, estado };
      if (editing) {
        await apiFetch("/plantillas/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/plantillas/create.php", { method: "POST", json: payload });
      }
      onSaved();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando plantilla" : "Nueva plantilla"}</p>
        <button type="button" onClick={onDone} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
      </div>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (ej. BOMBEROS - MODULO 1)" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <SearchableSelect
          value={asignaturaId} onChange={setAsignaturaId}
          options={asignaturas.map((a) => ({ value: String(a.id), label: a.nombre }))}
          placeholder="Asignatura (opcional)..."
        />
        <input value={fecha} onChange={(e) => setFecha(e.target.value)} type="date" className={inputCls} />
      </div>
      <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear"}
        </button>
        <button type="button" onClick={onDone} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
      </div>
    </form>
  );
}

export default function PlantillasView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Plantilla | null>(null);
  // El id de la plantilla abierta vive en la URL (?plantillaId=...), no en
  // useState — así Ctrl+Shift+R te deja en la misma plantilla.
  const [plantillaIdParam, setPlantillaIdParam] = useUrlState("plantillaId");
  const viewing = plantillaIdParam ? (plantillas.find((p) => p.id === Number(plantillaIdParam)) ?? null) : null;
  const [deleting, setDeleting] = useState<Plantilla | null>(null);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return plantillas.filter((p) => {
      if (asignaturaId && String(p.asignatura_id ?? "") !== asignaturaId) return false;
      if (estado && p.estado !== estado) return false;
      if (term) {
        const haystack = `${p.nombre ?? ""} ${p.asignatura ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [plantillas, search, asignaturaId, estado]);

  useEffect(() => setPage(1), [search, asignaturaId, estado]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  if (viewing) {
    return (
      <PlantillaDetailView
        plantilla={viewing} onBack={() => setPlantillaIdParam(null)}
        onUpdated={load}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Plantillas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Plantillas de contenido reutilizable por módulo/asignatura</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {plantillas.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          {canManage && (
            creating || editing ? (
              <PlantillaForm
                editing={editing} asignaturas={asignaturas}
                onDone={() => { setCreating(false); setEditing(null); }}
                onSaved={load}
              />
            ) : (
              <button onClick={() => setCreating(true)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#C41717]
                           hover:bg-[#C41717]/5 rounded-xl border border-dashed border-[#C41717]/30 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Crear plantilla
              </button>
            )
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar plantillas educación virtual..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg">
            <Dropdown label={asignaturaId ? (asignaturas.find((a) => a.id === Number(asignaturaId))?.nombre ?? "Asignatura") : "Asignatura: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setAsignaturaId(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {asignaturas.map((a) => (
                    <button key={a.id} onClick={() => { setAsignaturaId(String(a.id)); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{a.nombre}</button>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={estado || "Estado: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setEstado(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {ESTADOS.map((s) => (
                    <button key={s} onClick={() => { setEstado(s); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{s}</button>
                  ))}
                </>
              )}
            </Dropdown>
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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                      <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">Aún no hay plantillas creadas.</td></tr>
                    ) : paged.map((p, idx) => (
                      <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{p.nombre ?? p.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{fmtFecha(p.fecha)}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.Creada}`}>{p.estado}</span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setPlantillaIdParam(String(p.id))} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver plantilla">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isSuperAdmin && (
                              <>
                                <button onClick={() => { setEditing(p); setCreating(false); }} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
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
        title="Eliminar plantilla"
        message={`¿Eliminar la plantilla "${deleting?.nombre ?? deleting?.asignatura}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
