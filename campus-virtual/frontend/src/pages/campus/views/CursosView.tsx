import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface Programa { id: number; nombre: string }
interface Asignatura { id: number; nombre: string }
interface Docente { identificacion: string; nombre_completo: string }
interface Curso {
  id: number;
  codigo_nombre: string | null;
  programa_id: number | null;
  asignatura_id: number | null;
  programa_asignatura_jornada: string | null;
  docente_identificacion: string | null;
  docente_nombre: string | null;
  periodo: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  aula: string | null;
  cupo_maximo: number | null;
  cerrado: string | null;
}

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

function CursoForm({
  editing, programas, asignaturas, docentes, onDone, onCreated,
}: {
  editing: Curso | null; programas: Programa[]; asignaturas: Asignatura[]; docentes: Docente[];
  onDone: () => void; onCreated: () => void;
}) {
  const [open, setOpen] = useState(!!editing);
  const [codigoNombre, setCodigoNombre] = useState("");
  const [programaId, setProgramaId]     = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [docenteId, setDocenteId]       = useState("");
  const [jornada, setJornada]           = useState("");
  const [periodo, setPeriodo]           = useState("");
  const [aula, setAula]                 = useState("");
  const [cupoMaximo, setCupoMaximo]     = useState("");
  const [cerrado, setCerrado]           = useState("NO");
  const [error, setError]               = useState("");
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    setOpen(!!editing);
    if (editing) {
      setCodigoNombre(editing.codigo_nombre ?? "");
      setProgramaId(editing.programa_id != null ? String(editing.programa_id) : "");
      setAsignaturaId(editing.asignatura_id != null ? String(editing.asignatura_id) : "");
      setDocenteId(editing.docente_identificacion ?? "");
      setJornada("");
      setPeriodo(editing.periodo ?? "");
      setAula(editing.aula ?? "");
      setCupoMaximo(editing.cupo_maximo != null ? String(editing.cupo_maximo) : "");
      setCerrado(editing.cerrado ?? "NO");
    } else {
      reset();
    }
  }, [editing]);

  const reset = () => {
    setCodigoNombre(""); setProgramaId(""); setAsignaturaId(""); setDocenteId("");
    setJornada(""); setPeriodo(""); setAula(""); setCupoMaximo(""); setCerrado("NO"); setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!codigoNombre.trim() || !programaId || !asignaturaId) {
      setError("Nombre del curso, programa y asignatura son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const docente = docentes.find((d) => d.identificacion === docenteId);
      const payload = {
        codigoNombre: codigoNombre.trim(),
        programaId: Number(programaId),
        asignaturaId: Number(asignaturaId),
        jornada: jornada || null,
        periodo: periodo || null,
        aula: aula || null,
        cupoMaximo: cupoMaximo ? Number(cupoMaximo) : null,
        docenteIdentificacion: docente?.identificacion ?? null,
        docenteNombre: docente?.nombre_completo ?? null,
      };
      if (editing) {
        await apiFetch("/cursos/update.php", { method: "POST", json: { id: editing.id, ...payload, cerrado } });
      } else {
        await apiFetch("/cursos/create.php", { method: "POST", json: payload });
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
        <Plus className="w-3.5 h-3.5" /> Crear curso
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-slate-500">{editing ? "Editando curso" : "Nuevo curso"}</p>
        {editing && <button type="button" onClick={() => { reset(); setOpen(false); onDone(); }} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
      </div>
      <input value={codigoNombre} onChange={(e) => setCodigoNombre(e.target.value)} placeholder="Nombre del curso" className={inputCls} />
      <div className="grid grid-cols-2 gap-2">
        <select value={programaId} onChange={(e) => setProgramaId(e.target.value)} className={inputCls}>
          <option value="">Programa...</option>
          {programas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)} className={inputCls}>
          <option value="">Asignatura...</option>
          {asignaturas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={docenteId} onChange={(e) => setDocenteId(e.target.value)} className={inputCls}>
          <option value="">Docente (opcional)...</option>
          {docentes.map((d) => <option key={d.identificacion} value={d.identificacion}>{d.nombre_completo}</option>)}
        </select>
        <input value={jornada} onChange={(e) => setJornada(e.target.value)} placeholder="Jornada (opcional)" className={inputCls} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="Período" className={inputCls} />
        <input value={aula} onChange={(e) => setAula(e.target.value)} placeholder="Aula" className={inputCls} />
        <input value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} placeholder="Cupo máx." type="number" className={inputCls} />
      </div>
      {editing && (
        <select value={cerrado} onChange={(e) => setCerrado(e.target.value)} className={inputCls}>
          <option value="NO">Abierto</option>
          <option value="SI">Cerrado</option>
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

export default function CursosView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [cursos, setCursos]           = useState<Curso[]>([]);
  const [programas, setProgramas]     = useState<Programa[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes]       = useState<Docente[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editing, setEditing]         = useState<Curso | null>(null);
  const [deleting, setDeleting]       = useState<Curso | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ cursos: Curso[] }>("/cursos/list.php"),
      apiFetch<{ programas: Programa[] }>("/programas/list.php"),
      apiFetch<{ asignaturas: Asignatura[] }>("/asignaturas/list.php"),
      apiFetch<{ docentes: Docente[] }>("/docentes/list.php"),
    ])
      .then(([c, p, a, d]) => {
        setCursos(c.cursos); setProgramas(p.programas); setAsignaturas(a.asignaturas); setDocentes(d.docentes);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cursos</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cursos activos por programa, asignatura y jornada</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {cursos.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <CursoForm editing={editing} programas={programas} asignaturas={asignaturas} docentes={docentes} onDone={() => setEditing(null)} onCreated={load} />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Curso</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Programa / Asignatura</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Docente</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Período</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Estado</th>
                    {isSuperAdmin && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cursos.length === 0 ? (
                    <tr><td colSpan={isSuperAdmin ? 6 : 5} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                  ) : cursos.map((c, idx) => (
                    <tr key={c.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                      <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{c.codigo_nombre ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.programa_asignatura_jornada ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.docente_nombre ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.periodo ?? "—"}</td>
                      <td className="px-4 py-2">
                        {c.cerrado?.toLowerCase() === "si" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">Cerrado</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Abierto</span>
                        )}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setEditing(c)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleting(c)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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
        title="Eliminar curso"
        message={`¿Eliminar "${deleting?.codigo_nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
