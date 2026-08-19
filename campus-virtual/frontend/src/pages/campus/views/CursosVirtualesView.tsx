import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, X, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import CursoDetailView, { type Curso } from "./CursoDetailView";

interface Programa { id: number; nombre: string }
interface Asignatura { id: number; nombre: string }

type Estado = "Pendiente" | "En progreso" | "Cerrado" | "Archivado";
const ESTADOS: Estado[] = ["Pendiente", "En progreso", "Cerrado", "Archivado"];
const ESTADO_BADGE: Record<Estado, string> = {
  Pendiente: "bg-amber-50 border-amber-200 text-amber-700",
  "En progreso": "bg-blue-50 border-blue-200 text-blue-700",
  Cerrado: "bg-slate-100 border-slate-200 text-slate-500",
  Archivado: "bg-slate-100 border-slate-200 text-slate-400",
};

// Estado se calcula a partir de los campos reales importados (cerrado,
// archivado, fecha_inicio) — no existe una columna "estado" en la base de
// datos, así que no se inventa un dato, se deriva del real.
function estadoCurso(c: Curso): Estado {
  if (c.archivado?.toLowerCase() === "si") return "Archivado";
  if (c.cerrado?.toLowerCase() === "si") return "Cerrado";
  if (c.fecha_inicio && new Date(c.fecha_inicio) > new Date()) return "Pendiente";
  return "En progreso";
}

const PAGE_SIZE = 12;

function Dropdown({
  label, children,
}: { label: string; children: (close: () => void) => React.ReactNode }) {
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

export default function CursosVirtualesView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [programaId, setProgramaId] = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [estados, setEstados] = useState<Set<Estado>>(new Set(["Pendiente", "En progreso"]));
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<Curso | null>(null);
  const [deleting, setDeleting] = useState<Curso | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ cursos: Curso[] }>("/cursos/list.php"),
      apiFetch<{ programas: Programa[] }>("/programas/list.php"),
      apiFetch<{ asignaturas: Asignatura[] }>("/asignaturas/list.php"),
    ])
      .then(([c, p, a]) => { setCursos(c.cursos); setProgramas(p.programas); setAsignaturas(a.asignaturas); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const programaNombre = (id: number | null) => programas.find((p) => p.id === id)?.nombre ?? "—";
  const asignaturaNombre = (id: number | null) => asignaturas.find((a) => a.id === id)?.nombre ?? "—";

  // Los períodos del filtro salen de los cursos reales ya cargados, no de una
  // lista aparte inventada — mismo patrón que se usó para el filtro de curso
  // en Evaluaciones.
  const periodos = useMemo(() => {
    const set = new Set<string>();
    cursos.forEach((c) => { if (c.periodo) set.add(c.periodo); });
    return Array.from(set).sort().reverse();
  }, [cursos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cursos.filter((c) => {
      if (periodo && c.periodo !== periodo) return false;
      if (programaId && String(c.programa_id ?? "") !== programaId) return false;
      if (asignaturaId && String(c.asignatura_id ?? "") !== asignaturaId) return false;
      if (estados.size > 0 && !estados.has(estadoCurso(c))) return false;
      if (term) {
        const asignatura = asignaturas.find((a) => a.id === c.asignatura_id)?.nombre ?? "";
        const haystack = `${c.codigo_nombre ?? ""} ${asignatura} ${c.docente_nombre ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [cursos, search, periodo, programaId, asignaturaId, estados, asignaturas]);

  useEffect(() => setPage(1), [search, periodo, programaId, asignaturaId, estados]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleEstado = (e: Estado) => {
    setEstados((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e); else next.add(e);
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/cursos/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el curso.");
    }
  };

  if (viewing) {
    return (
      <CursoDetailView
        curso={viewing}
        onBack={() => { setViewing(null); load(); }}
        onUpdated={() => { load(); apiFetch<{ cursos: Curso[] }>("/cursos/list.php").then((d) => {
          const fresh = d.cursos.find((c) => c.id === viewing.id);
          if (fresh) setViewing(fresh);
        }); }}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cursos virtuales</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cursos reales de Estructuración, filtrados y navegables por período/asignatura</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {cursos.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cursos virtuales..."
              className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Dropdown label={periodo || "Período: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setPeriodo(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {periodos.map((p) => (
                    <button key={p} onClick={() => { setPeriodo(p); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{p}</button>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={programaId ? programaNombre(Number(programaId)) : "Programa: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setProgramaId(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {programas.map((p) => (
                    <button key={p.id} onClick={() => { setProgramaId(String(p.id)); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{p.nombre}</button>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={asignaturaId ? asignaturaNombre(Number(asignaturaId)) : "Asignatura: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setAsignaturaId(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {asignaturas.map((a) => (
                    <button key={a.id} onClick={() => { setAsignaturaId(String(a.id)); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{a.nombre}</button>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={estados.size === 0 ? "Estado: Ninguno" : estados.size === ESTADOS.length ? "Estado: Todos" : `Estado: ${Array.from(estados).join(", ")}`}>
              {() => (
                <>
                  {ESTADOS.map((e) => (
                    <label key={e} className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" checked={estados.has(e)} onChange={() => toggleEstado(e)} className="accent-[#C41717]" />
                      {e}
                    </label>
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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Curso</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Período</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Docente</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Estado</th>
                      <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((c, idx) => {
                      const estado = estadoCurso(c);
                      return (
                        <tr key={c.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                          <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{c.codigo_nombre ?? "—"}</td>
                          <td className="px-4 py-2 text-slate-500 text-xs">{c.periodo ?? "—"}</td>
                          <td className="px-4 py-2 text-slate-500 text-xs">{asignaturaNombre(c.asignatura_id)}</td>
                          <td className="px-4 py-2 text-slate-500 text-xs">{c.docente_nombre ?? "—"}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${ESTADO_BADGE[estado]}`}>{estado}</span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setViewing(c)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver curso">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {isSuperAdmin && (
                                <button onClick={() => setDeleting(c)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-[#C41717] hover:border-[#C41717]/30 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${n === page ? "bg-[#C41717] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
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
        title="Eliminar curso"
        message={`¿Eliminar "${deleting?.codigo_nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
