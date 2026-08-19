import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Pencil, Trash2, X, Eye, Search, Download, ChevronDown, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import { SearchableSelect } from "../SearchableSelect";

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
  matriculados: number;
}
interface EstudianteOption { id: number; identificacion: string; nombre_completo: string }
interface Matricula { id: number; estudiante_id: number; identificacion: string; nombre_completo: string }

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

function DetalleModal({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  const rows: [string, string][] = [
    ["Programa / Asignatura / Jornada", curso.programa_asignatura_jornada ?? "—"],
    ["Docente", curso.docente_nombre ?? "—"],
    ["Período", curso.periodo ?? "—"],
    ["Fecha inicio", curso.fecha_inicio ?? "—"],
    ["Fecha fin", curso.fecha_fin ?? "—"],
    ["Aula", curso.aula ?? "—"],
    ["Cupo máximo", curso.cupo_maximo != null ? String(curso.cupo_maximo) : "—"],
    ["Matriculados", curso.cupo_maximo != null ? `${curso.matriculados} / ${curso.cupo_maximo}` : String(curso.matriculados)],
    ["Estado", curso.cerrado?.toLowerCase() === "si" ? "Cerrado" : "Abierto"],
  ];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-slate-800 text-[15px] leading-snug">{curso.codigo_nombre ?? "—"}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs">
                <span className="text-slate-400 font-medium shrink-0">{label}</span>
                <span className="text-slate-700 text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MatriculaModal({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  const [matriculados, setMatriculados] = useState<Matricula[]>([]);
  const [estudiantes, setEstudiantes]   = useState<EstudianteOption[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedId, setSelectedId]     = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ matriculados: Matricula[] }>(`/curso-estudiantes/list.php?cursoId=${curso.id}`),
      apiFetch<{ estudiantes: EstudianteOption[] }>("/estudiantes/list.php"),
    ]).then(([m, e]) => { setMatriculados(m.matriculados); setEstudiantes(e.estudiantes); }).finally(() => setLoading(false));
  };
  useEffect(load, [curso.id]);

  const inscritosIds = new Set(matriculados.map((m) => m.estudiante_id));
  const disponibles  = estudiantes.filter((e) => !inscritosIds.has(e.id));
  const cupoLleno     = curso.cupo_maximo != null && matriculados.length >= curso.cupo_maximo;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError("");
    setSubmitting(true);
    try {
      await apiFetch("/curso-estudiantes/create.php", { method: "POST", json: { cursoId: curso.id, estudianteId: Number(selectedId) } });
      setSelectedId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al matricular.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-estudiantes/delete.php", { method: "POST", json: { id } });
    load();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40 shrink-0" />
        <div className="p-5 space-y-3 overflow-y-auto">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] leading-snug">Matricular estudiantes</h3>
              <p className="text-xs text-slate-500 mt-0.5">{curso.codigo_nombre}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {matriculados.length}{curso.cupo_maximo != null ? ` / ${curso.cupo_maximo}` : ""} matriculados
            </span>
            {cupoLleno && (
              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Cupo lleno</span>
            )}
          </div>

          {!cupoLleno && (
            <form onSubmit={add} className="flex gap-2">
              <SearchableSelect
                value={selectedId}
                onChange={setSelectedId}
                options={disponibles.map((e) => ({ value: String(e.id), label: e.nombre_completo }))}
                placeholder="Seleccione estudiante..."
                className="flex-1"
              />
              <button type="submit" disabled={submitting || !selectedId}
                className="px-4 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed shrink-0 transition-colors">
                Matricular
              </button>
            </form>
          )}
          {error && <p className="text-[11px] text-red-500">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : matriculados.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes matriculados.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {matriculados.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.nombre_completo}</p>
                    <p className="text-xs text-slate-400">{m.identificacion}</p>
                  </div>
                  <button onClick={() => remove(m.id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Quitar del curso">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

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
        <SearchableSelect
          value={programaId} onChange={setProgramaId}
          options={programas.map((p) => ({ value: String(p.id), label: p.nombre }))}
          placeholder="Programa..."
        />
        <SearchableSelect
          value={asignaturaId} onChange={setAsignaturaId}
          options={asignaturas.map((a) => ({ value: String(a.id), label: a.nombre }))}
          placeholder="Asignatura..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SearchableSelect
          value={docenteId} onChange={setDocenteId}
          options={docentes.map((d) => ({ value: d.identificacion, label: d.nombre_completo }))}
          placeholder="Docente (opcional)..."
        />
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
  const { currentUser, canVer } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  const canViewDetail = canManage || canVer("academico.cursos");
  const [cursos, setCursos]           = useState<Curso[]>([]);
  const [programas, setProgramas]     = useState<Programa[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes]       = useState<Docente[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [editing, setEditing]         = useState<Curso | null>(null);
  const [deleting, setDeleting]       = useState<Curso | null>(null);
  const [viewing, setViewing]         = useState<Curso | null>(null);
  const [matriculando, setMatriculando] = useState<Curso | null>(null);

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cursos.filter((c) => {
      const estado = c.cerrado?.toLowerCase() === "si" ? "Cerrado" : "Abierto";
      if (estadoFilter && estado !== estadoFilter) return false;
      if (term) {
        const haystack = `${c.codigo_nombre ?? ""} ${c.programa_asignatura_jornada ?? ""} ${c.docente_nombre ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [cursos, search, estadoFilter]);

  useEffect(() => setPage(1), [search, estadoFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportar = () => {
    const header = ["Curso", "Programa/Asignatura/Jornada", "Docente", "Período", "Matriculados", "Estado"];
    const rows = filtered.map((c) => [
      c.codigo_nombre ?? "", c.programa_asignatura_jornada ?? "", c.docente_nombre ?? "", c.periodo ?? "",
      c.cupo_maximo != null ? `${c.matriculados}/${c.cupo_maximo}` : String(c.matriculados),
      c.cerrado?.toLowerCase() === "si" ? "Cerrado" : "Abierto",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(",")).join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cursos.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Cursos</h1>
          <p className="text-slate-500 text-xs mt-0.5">Cursos activos por programa, asignatura y jornada</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {cursos.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          {canManage && <CursoForm editing={editing} programas={programas} asignaturas={asignaturas} docentes={docentes} onDone={() => setEditing(null)} onCreated={load} />}

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cursos..."
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
                    <button onClick={() => { setEstadoFilter("Abierto"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Abierto</button>
                    <button onClick={() => { setEstadoFilter("Cerrado"); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Cerrado</button>
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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Curso</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Programa / Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Docente</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Período</th>
                      <th className="text-center px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Matriculados</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Estado</th>
                      {canViewDetail && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs tracking-wide uppercase whitespace-nowrap">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={canViewDetail ? 7 : 6} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((c, idx) => (
                      <tr key={c.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{c.codigo_nombre ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{c.programa_asignatura_jornada ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{c.docente_nombre ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{c.periodo ?? "—"}</td>
                        <td className="px-4 py-2 text-center">
                          {canManage ? (
                            <button onClick={() => setMatriculando(c)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#C41717]/10 border border-slate-200 hover:border-[#C41717]/30 text-slate-600 hover:text-[#C41717] text-xs font-semibold transition-colors"
                              title="Matricular estudiantes">
                              <UserPlus className="w-3 h-3" />
                              {c.matriculados}{c.cupo_maximo != null ? `/${c.cupo_maximo}` : ""}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs">{c.matriculados}{c.cupo_maximo != null ? `/${c.cupo_maximo}` : ""}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {c.cerrado?.toLowerCase() === "si" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">Cerrado</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Abierto</span>
                          )}
                        </td>
                        {canViewDetail && (
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

      {viewing && <DetalleModal curso={viewing} onClose={() => setViewing(null)} />}
      {matriculando && <MatriculaModal curso={matriculando} onClose={() => { setMatriculando(null); load(); }} />}

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
