import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Programa { id: number; nombre: string }
interface Asignatura { id: number; nombre: string }
interface Docente { identificacion: string; nombre_completo: string }
interface Curso {
  id: number;
  codigo_nombre: string | null;
  programa_asignatura_jornada: string | null;
  docente_nombre: string | null;
  periodo: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  aula: string | null;
  cerrado: string | null;
}

function CreateForm({
  programas, asignaturas, docentes, onCreated,
}: {
  programas: Programa[]; asignaturas: Asignatura[]; docentes: Docente[]; onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [codigoNombre, setCodigoNombre] = useState("");
  const [programaId, setProgramaId]     = useState("");
  const [asignaturaId, setAsignaturaId] = useState("");
  const [docenteId, setDocenteId]       = useState("");
  const [jornada, setJornada]           = useState("");
  const [periodo, setPeriodo]           = useState("");
  const [aula, setAula]                 = useState("");
  const [cupoMaximo, setCupoMaximo]     = useState("");
  const [error, setError]               = useState("");
  const [submitting, setSubmitting]     = useState(false);

  const reset = () => {
    setCodigoNombre(""); setProgramaId(""); setAsignaturaId(""); setDocenteId("");
    setJornada(""); setPeriodo(""); setAula(""); setCupoMaximo(""); setError("");
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
      await apiFetch("/cursos/create.php", {
        method: "POST",
        json: {
          codigoNombre: codigoNombre.trim(),
          programaId: Number(programaId),
          asignaturaId: Number(asignaturaId),
          jornada: jornada || null,
          periodo: periodo || null,
          aula: aula || null,
          cupoMaximo: cupoMaximo ? Number(cupoMaximo) : null,
          docenteIdentificacion: docente?.identificacion ?? null,
          docenteNombre: docente?.nombre_completo ?? null,
        },
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

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

      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
          {submitting ? "Creando..." : "Crear"}
        </button>
        <button type="button" onClick={() => { setOpen(false); reset(); }} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function CursosView() {
  const [cursos, setCursos]           = useState<Curso[]>([]);
  const [programas, setProgramas]     = useState<Programa[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes]       = useState<Docente[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

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
          <CreateForm programas={programas} asignaturas={asignaturas} docentes={docentes} onCreated={load} />

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cursos.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
