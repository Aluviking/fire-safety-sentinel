import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, ChevronsRight, X, Loader2, Users, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { SearchableSelect } from "../SearchableSelect";

interface Evaluacion {
  id: number | string;
  codigo_curso: string | null;
  periodo: string | null;
  identificacion_estudiante: string | null;
  asignatura: string | null;
  parametro: string | null;
  porcentaje: string | null;
  nota: string | null;
  inasistencias: number | null;
  observaciones: string | null;
  origen: "q10" | "cuestionario";
  empresa: string | null;
  fueraDeBaseDe: string | null;
}
interface NotaFinal {
  id: number;
  identificacion_estudiante: string | null;
  programa: string | null;
  periodo: string | null;
  asignatura: string | null;
  aprobado: string | null;
  nota_asignatura: string | null;
  promedio_acumulado: string | null;
  tipo_nota: string | null;
}

const PAGE_SIZE = 15;
const TABS = ["Evaluaciones detalladas", "Notas finales"] as const;
type Tab = (typeof TABS)[number];

function Pagination({ total, page, pageSize, onChange }: { total: number; page: number; pageSize: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((p, idx) => p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-slate-400 text-sm">…</span> : (
        <button key={p} onClick={() => onChange(p as number)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${page === p ? "bg-[#C41717] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onChange(totalPages)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        <ChevronsRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-slate-600 text-xs font-semibold mb-1.5">{label}</label>
      <SearchableSelect
        value={value} onChange={onChange}
        options={options.map((o) => ({ value: o, label: o }))}
        placeholder={placeholder}
        size="md"
      />
    </div>
  );
}

/* ── Celda editable (clic para editar, Enter/blur para guardar) ──────────── */
function EditableCell({
  value, canEdit, onSave, align = "left", placeholder = "—",
}: { value: string; canEdit: boolean; onSave: (v: string) => void; align?: "left" | "center"; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  if (!canEdit) {
    return <span className={align === "center" ? "block text-center" : ""}>{value || placeholder}</span>;
  }
  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className={`w-full rounded-md px-1.5 py-0.5 hover:bg-amber-50 hover:ring-1 hover:ring-amber-200 transition-colors text-left ${align === "center" ? "text-center" : ""}`}
        title="Clic para editar"
      >
        {value || <span className="text-slate-300">{placeholder}</span>}
      </button>
    );
  }
  const commit = () => {
    setEditing(false);
    if (draft !== value) onSave(draft);
  };
  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
      className={`w-full bg-white border border-[#C41717]/40 rounded-md px-1.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C41717]/20 ${align === "center" ? "text-center" : ""}`}
    />
  );
}

interface EstudianteLite { identificacion: string; nombre_completo: string }

/* ── Roster de un curso: estudiantes x parámetro, editable por Admin/Super Admin ── */
function CursoRosterPanel({
  curso, evaluaciones, estudiantesMap, canEdit, onUpdated,
}: {
  curso: string; evaluaciones: Evaluacion[]; estudiantesMap: Map<string, string>;
  canEdit: boolean; onUpdated: (updated: Evaluacion) => void;
}) {
  const rows = useMemo(() => evaluaciones.filter((e) => e.codigo_curso === curso), [evaluaciones, curso]);

  const parametros = useMemo(
    () => Array.from(new Set(rows.map((r) => r.parametro).filter((p): p is string => !!p))),
    [rows]
  );

  const porEstudiante = useMemo(() => {
    const map = new Map<string, Evaluacion[]>();
    for (const r of rows) {
      const id = r.identificacion_estudiante ?? "";
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(r);
    }
    return map;
  }, [rows]);

  const [incluirFueraDeBase, setIncluirFueraDeBase] = useState(true);
  const exportarExcel = () => {
    const entradas = Array.from(porEstudiante.entries()).filter(
      ([, studentRows]) => incluirFueraDeBase || !studentRows[0]?.fueraDeBaseDe
    );
    const headers = ["N°", "Estudiante", "Identificación", "Empresa / Fuera de base", ...parametros, "Prom.", "Inas.", "Observaciones"];
    const data = entradas.map(([identificacion, studentRows], idx) => {
      const nombre = estudiantesMap.get(identificacion) ?? identificacion;
      const withPct = studentRows.filter((r) => r.nota != null && r.porcentaje != null);
      const sumPct = withPct.reduce((s, r) => s + Number(r.porcentaje), 0);
      const prom = withPct.length === 0 ? "" : (sumPct > 0
        ? withPct.reduce((s, r) => s + Number(r.nota) * Number(r.porcentaje), 0) / sumPct
        : withPct.reduce((s, r) => s + Number(r.nota), 0) / withPct.length
      ).toFixed(1);
      const empresaInfo = studentRows[0]?.empresa ?? (studentRows[0]?.fueraDeBaseDe ? `Fuera de la base de ${studentRows[0].fueraDeBaseDe}` : "");
      const cols = parametros.map((p) => {
        const cell = studentRows.find((r) => r.parametro === p);
        return cell ? (cell.nota ?? (cell.porcentaje != null ? `${cell.porcentaje}%` : "")) : "";
      });
      return [idx + 1, nombre, identificacion, empresaInfo, ...cols, prom, studentRows[0]?.inasistencias ?? 0, studentRows.find((r) => r.observaciones)?.observaciones ?? ""];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws["!cols"] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, curso.slice(0, 31) || "Curso");
    XLSX.writeFile(wb, `evaluaciones-${curso.replace(/[^a-z0-9]+/gi, "-")}.xlsx`);
  };

  // Las filas que vienen de un Cuestionario de Campus Virtual se califican
  // solas (y no tienen fila real en la tabla `evaluaciones`) -- no se pueden
  // editar desde aquí, por eso su id es un texto ("cv-...") en vez de un
  // número real de esa tabla.
  const save = async (id: number | string, field: "nota" | "inasistencias" | "observaciones", value: string) => {
    if (typeof id !== "number") return;
    try {
      const updated = await apiFetch<{ ok: true }>("/evaluaciones/update.php", { method: "POST", json: { id, [field]: value } });
      if (updated.ok) onUpdated({ ...rows.find((r) => r.id === id)!, [field]: value });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al guardar el cambio.");
    }
  };

  // Inasistencias y observaciones son iguales en todas las filas de un mismo
  // estudiante+curso en los datos reales (verificado: 0 inconsistencias en
  // 1025 grupos) — al editar, se aplica a todas sus filas de este curso para
  // que se mantengan consistentes. Solo a las filas antiguas, que son las
  // únicas que tienen dónde guardarlo.
  const saveShared = async (studentRows: Evaluacion[], field: "inasistencias" | "observaciones", value: string) => {
    await Promise.all(studentRows.filter((r) => r.origen === "q10").map((r) => save(r.id, field, value)));
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
        Sin evaluaciones registradas para este curso.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-wrap">
        <Users className="w-4 h-4 text-[#C41717]" />
        <h2 className="text-sm font-semibold text-slate-800 truncate">{curso}</h2>
        <span className="text-xs text-slate-400">{porEstudiante.size} {porEstudiante.size === 1 ? "estudiante" : "estudiantes"}</span>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap cursor-pointer select-none">
            <input type="checkbox" checked={incluirFueraDeBase} onChange={(e) => setIncluirFueraDeBase(e.target.checked)} className="accent-[#C41717]" />
            Incluir los de fuera de la base
          </label>
          <button onClick={exportarExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 text-xs font-semibold transition-all">
            <Download className="w-3.5 h-3.5" /> Descargar Excel
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">N°</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estudiante</th>
              {parametros.map((p) => {
                const esCuestionario = rows.find((r) => r.parametro === p)?.origen === "cuestionario";
                return (
                  <th key={p} className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">
                    {p}
                    {esCuestionario && <span className="block normal-case font-normal text-[10px] text-slate-400">Cuestionario · no editable</span>}
                  </th>
                );
              })}
              <th className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Prom.</th>
              <th className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Inas.</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from(porEstudiante.entries()).map(([identificacion, studentRows], idx) => {
              const nombre = estudiantesMap.get(identificacion) ?? identificacion;
              const withPct = studentRows.filter((r) => r.nota != null && r.porcentaje != null);
              const sumPct = withPct.reduce((s, r) => s + Number(r.porcentaje), 0);
              const prom = withPct.length === 0 ? null
                : sumPct > 0
                  ? withPct.reduce((s, r) => s + Number(r.nota) * Number(r.porcentaje), 0) / sumPct
                  : withPct.reduce((s, r) => s + Number(r.nota), 0) / withPct.length;
              const inas = studentRows[0]?.inasistencias ?? 0;
              const obs = studentRows.find((r) => r.observaciones)?.observaciones ?? "";

              return (
                <tr key={identificacion} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">
                    {nombre}
                    <div className="text-slate-400 font-mono text-[11px]">{identificacion}</div>
                    {studentRows[0]?.empresa && (
                      <div className="text-emerald-700 text-[10px] font-medium">{studentRows[0].empresa}</div>
                    )}
                    {!studentRows[0]?.empresa && studentRows[0]?.fueraDeBaseDe && (
                      <div className="text-amber-600 text-[10px] font-medium">Fuera de la base de {studentRows[0].fueraDeBaseDe}</div>
                    )}
                  </td>
                  {parametros.map((p) => {
                    const cell = studentRows.find((r) => r.parametro === p);
                    const valorCuestionario = cell?.origen === "cuestionario" && cell.porcentaje != null ? `${cell.porcentaje}%` : "";
                    return (
                      <td key={p} className="px-3 py-2 w-24">
                        {cell ? (
                          <EditableCell
                            value={cell.nota ?? valorCuestionario} canEdit={canEdit && cell.origen === "q10"} align="center"
                            onSave={(v) => save(cell.id, "nota", v)}
                          />
                        ) : <span className="block text-center text-slate-300">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center text-slate-700 font-semibold text-xs">{prom != null ? prom.toFixed(1) : "—"}</td>
                  <td className="px-3 py-2 w-16">
                    <EditableCell
                      value={String(inas ?? "")} canEdit={canEdit && studentRows.some((r) => r.origen === "q10")} align="center"
                      onSave={(v) => saveShared(studentRows, "inasistencias", v)}
                    />
                  </td>
                  <td className="px-3 py-2 min-w-[160px]">
                    <EditableCell
                      value={obs ?? ""} canEdit={canEdit && studentRows.some((r) => r.origen === "q10")}
                      onSave={(v) => saveShared(studentRows, "observaciones", v)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Roster de una asignatura en un periodo puntual: estudiantes x
     parámetro, sin nada de empresas (ese concepto es solo para "Curso") ── */
function PeriodoRosterPanel({
  asignatura, periodo, evaluaciones, estudiantesMap, canEdit, onUpdated,
}: {
  asignatura: string; periodo: string; evaluaciones: Evaluacion[]; estudiantesMap: Map<string, string>;
  canEdit: boolean; onUpdated: (updated: Evaluacion) => void;
}) {
  const rows = useMemo(
    () => evaluaciones.filter((e) => e.asignatura === asignatura && e.periodo === periodo),
    [evaluaciones, asignatura, periodo]
  );

  // Filtro por origen de la data -- "antigua" = Q10, "nueva" = cuestionarios
  // de Campus Virtual. Más un buscador por estudiante, para que no se
  // mezclen visualmente cuando hay de los dos tipos en el mismo periodo.
  const [filtroOrigen, setFiltroOrigen] = useState<"todos" | "antigua" | "nueva">("todos");
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");

  const rowsFiltradas = useMemo(() => {
    if (filtroOrigen === "todos") return rows;
    const origen = filtroOrigen === "antigua" ? "q10" : "cuestionario";
    return rows.filter((r) => r.origen === origen);
  }, [rows, filtroOrigen]);

  const parametros = useMemo(
    () => Array.from(new Set(rowsFiltradas.map((r) => r.parametro).filter((p): p is string => !!p))),
    [rowsFiltradas]
  );

  const porEstudiante = useMemo(() => {
    const map = new Map<string, Evaluacion[]>();
    for (const r of rowsFiltradas) {
      const id = r.identificacion_estudiante ?? "";
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(r);
    }
    return map;
  }, [rowsFiltradas]);

  const porEstudianteFiltrado = useMemo(() => {
    const q = busquedaEstudiante.trim().toLowerCase();
    if (!q) return porEstudiante;
    return new Map(
      Array.from(porEstudiante.entries()).filter(([identificacion]) => {
        const nombre = (estudiantesMap.get(identificacion) ?? "").toLowerCase();
        return identificacion.toLowerCase().includes(q) || nombre.includes(q);
      })
    );
  }, [porEstudiante, busquedaEstudiante, estudiantesMap]);

  const exportarExcel = () => {
    const headers = ["N°", "Estudiante", "Identificación", ...parametros, "Prom.", "Inas.", "Observaciones"];
    const data = Array.from(porEstudianteFiltrado.entries()).map(([identificacion, studentRows], idx) => {
      const nombre = estudiantesMap.get(identificacion) ?? identificacion;
      const withPct = studentRows.filter((r) => r.nota != null && r.porcentaje != null);
      const sumPct = withPct.reduce((s, r) => s + Number(r.porcentaje), 0);
      const prom = withPct.length === 0 ? "" : (sumPct > 0
        ? withPct.reduce((s, r) => s + Number(r.nota) * Number(r.porcentaje), 0) / sumPct
        : withPct.reduce((s, r) => s + Number(r.nota), 0) / withPct.length
      ).toFixed(1);
      const cols = parametros.map((p) => {
        const cell = studentRows.find((r) => r.parametro === p);
        return cell ? (cell.nota ?? (cell.porcentaje != null ? `${cell.porcentaje}%` : "")) : "";
      });
      return [idx + 1, nombre, identificacion, ...cols, prom, studentRows[0]?.inasistencias ?? 0, studentRows.find((r) => r.observaciones)?.observaciones ?? ""];
    });
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws["!cols"] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, periodo.slice(0, 31) || "Periodo");
    XLSX.writeFile(wb, `evaluaciones-${asignatura.replace(/[^a-z0-9]+/gi, "-")}-${periodo}.xlsx`);
  };

  const save = async (id: number | string, field: "nota" | "inasistencias" | "observaciones", value: string) => {
    if (typeof id !== "number") return;
    try {
      const updated = await apiFetch<{ ok: true }>("/evaluaciones/update.php", { method: "POST", json: { id, [field]: value } });
      if (updated.ok) onUpdated({ ...rows.find((r) => r.id === id)!, [field]: value });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al guardar el cambio.");
    }
  };
  const saveShared = async (studentRows: Evaluacion[], field: "inasistencias" | "observaciones", value: string) => {
    await Promise.all(studentRows.filter((r) => r.origen === "q10").map((r) => save(r.id, field, value)));
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
        Sin evaluaciones registradas para este periodo.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-wrap">
        <Users className="w-4 h-4 text-[#C41717]" />
        <h2 className="text-sm font-semibold text-slate-800 truncate">{asignatura} · {periodo}</h2>
        <span className="text-xs text-slate-400">{porEstudianteFiltrado.size} {porEstudianteFiltrado.size === 1 ? "estudiante" : "estudiantes"}</span>
        <button onClick={exportarExcel}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 text-xs font-semibold transition-all">
          <Download className="w-3.5 h-3.5" /> Descargar Excel
        </button>
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-wrap bg-slate-50/50">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
            placeholder="Buscar estudiante por nombre o identificación..."
            value={busquedaEstudiante} onChange={(e) => setBusquedaEstudiante(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          {([
            { v: "todos", label: "Todos" },
            { v: "antigua", label: "Ver base de datos antigua" },
            { v: "nueva", label: "Base de datos nueva" },
          ] as const).map((o) => (
            <button key={o.v} onClick={() => setFiltroOrigen(o.v)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
                filtroOrigen === o.v ? "bg-[#C41717] text-white" : "text-slate-500 hover:text-slate-800"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">N°</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estudiante</th>
              {parametros.map((p) => {
                const esCuestionario = rows.find((r) => r.parametro === p)?.origen === "cuestionario";
                return (
                  <th key={p} className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">
                    {p}
                    {esCuestionario && <span className="block normal-case font-normal text-[10px] text-slate-400">Cuestionario · no editable</span>}
                  </th>
                );
              })}
              <th className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Prom.</th>
              <th className="text-center px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Inas.</th>
              <th className="text-left px-3 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {porEstudianteFiltrado.size === 0 ? (
              <tr><td colSpan={parametros.length + 5} className="text-center py-8 text-slate-400 text-sm">Sin resultados para este filtro.</td></tr>
            ) : Array.from(porEstudianteFiltrado.entries()).map(([identificacion, studentRows], idx) => {
              const nombre = estudiantesMap.get(identificacion) ?? identificacion;
              const withPct = studentRows.filter((r) => r.nota != null && r.porcentaje != null);
              const sumPct = withPct.reduce((s, r) => s + Number(r.porcentaje), 0);
              const prom = withPct.length === 0 ? null
                : sumPct > 0
                  ? withPct.reduce((s, r) => s + Number(r.nota) * Number(r.porcentaje), 0) / sumPct
                  : withPct.reduce((s, r) => s + Number(r.nota), 0) / withPct.length;
              const inas = studentRows[0]?.inasistencias ?? 0;
              const obs = studentRows.find((r) => r.observaciones)?.observaciones ?? "";

              return (
                <tr key={identificacion} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                  <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">
                    {nombre}
                    <div className="text-slate-400 font-mono text-[11px]">{identificacion}</div>
                  </td>
                  {parametros.map((p) => {
                    const cell = studentRows.find((r) => r.parametro === p);
                    const valorCuestionario = cell?.origen === "cuestionario" && cell.porcentaje != null ? `${cell.porcentaje}%` : "";
                    return (
                      <td key={p} className="px-3 py-2 w-24">
                        {cell ? (
                          <EditableCell
                            value={cell.nota ?? valorCuestionario} canEdit={canEdit && cell.origen === "q10"} align="center"
                            onSave={(v) => save(cell.id, "nota", v)}
                          />
                        ) : <span className="block text-center text-slate-300">—</span>}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center text-slate-700 font-semibold text-xs">{prom != null ? prom.toFixed(1) : "—"}</td>
                  <td className="px-3 py-2 w-16">
                    <EditableCell
                      value={String(inas ?? "")} canEdit={canEdit && studentRows.some((r) => r.origen === "q10")} align="center"
                      onSave={(v) => saveShared(studentRows, "inasistencias", v)}
                    />
                  </td>
                  <td className="px-3 py-2 min-w-[160px]">
                    <EditableCell
                      value={obs ?? ""} canEdit={canEdit && studentRows.some((r) => r.origen === "q10")}
                      onSave={(v) => saveShared(studentRows, "observaciones", v)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EvaluacionesView() {
  const { currentUser } = useCampusAuth();
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "super_admin" || currentUser?.role === "docente";
  const [estudiantesMap, setEstudiantesMap] = useState<Map<string, string>>(new Map());
  const [tab, setTab] = useState<Tab>("Evaluaciones detalladas");
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [notasFinales, setNotasFinales] = useState<NotaFinal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [page, setPage] = useState(1);
  const [filterAsignatura, setFilterAsignatura] = useState("");
  const [filterCurso, setFilterCurso]           = useState("");
  const [incluirFueraDeBase, setIncluirFueraDeBase] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ evaluaciones: Evaluacion[] }>("/evaluaciones/list.php"),
      apiFetch<{ notasFinales: NotaFinal[] }>("/notas-finales/list.php"),
      apiFetch<{ estudiantes: EstudianteLite[] }>("/estudiantes/list.php"),
    ])
      .then(([e, n, est]) => {
        setEvaluaciones(e.evaluaciones);
        setNotasFinales(n.notasFinales);
        setEstudiantesMap(new Map(est.estudiantes.map((s) => [s.identificacion, s.nombre_completo])));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar evaluaciones."))
      .finally(() => setLoading(false));
  }, []);

  const handleEvaluacionUpdated = (updated: Evaluacion) => {
    setEvaluaciones((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  };

  const handleSearch = () => { setSearchActive(searchInput); setPage(1); };
  const clearSearch   = () => { setSearchInput(""); setSearchActive(""); setPage(1); };
  const changeTab = (t: Tab) => { setTab(t); setPage(1); };

  // Asignatura y Curso salen de los valores reales que ya trae `evaluaciones`
  // (no de las tablas Asignaturas/Cursos — esos códigos son mundos distintos
  // en los datos importados de Q10, no cruzan entre sí). Curso se acota al
  // elegir Asignatura, igual patrón que Período→Sede→Programa al matricular.
  const asignaturaOpts = useMemo(
    () => Array.from(new Set(evaluaciones.map((e) => e.asignatura).filter((a): a is string => !!a))).sort(),
    [evaluaciones]
  );
  // El selector de "Curso" también encuentra por nombre de empresa (ej.
  // escribir "Royal" debe mostrar "Royal Films S.A.S." como opción) --
  // pedido explícito del cliente, para no tener que agregar un filtro aparte.
  const cursoOpts = useMemo(() => {
    const base = filterAsignatura ? evaluaciones.filter((e) => e.asignatura === filterAsignatura) : evaluaciones;
    const cursos = base.map((e) => e.codigo_curso).filter((c): c is string => !!c);
    const empresas = base.map((e) => e.empresa).filter((c): c is string => !!c);
    return Array.from(new Set([...cursos, ...empresas])).sort();
  }, [evaluaciones, filterAsignatura]);

  // Con una Asignatura elegida, el segundo selector deja de ser "Curso" y
  // pasa a ser "Periodo" -- cada matriculado queda ligado a un periodo
  // (2026-1, 2026-2...), eso es lo que de verdad agrupa sus notas dentro de
  // una asignatura puntual. Sin asignatura elegida, sigue siendo "Curso"
  // como antes (ahí sí aplica lo de empresas).
  const modoPeriodo = !!filterAsignatura;
  const periodoOpts = useMemo(() => {
    if (!filterAsignatura) return [];
    return Array.from(new Set(
      evaluaciones.filter((e) => e.asignatura === filterAsignatura).map((e) => e.periodo).filter((p): p is string => !!p)
    )).sort();
  }, [evaluaciones, filterAsignatura]);

  const handleAsignaturaChange = (v: string) => { setFilterAsignatura(v); setFilterCurso(""); setPage(1); };
  const handleCursoChange = (v: string) => { setFilterCurso(v); setPage(1); };

  // Elegir una empresa debe mostrar el curso COMPLETO al que pertenece (los
  // de la base de esa empresa + los que se agregaron por fuera), no solo a
  // los de la empresa -- pedido explícito del cliente. Por eso, si lo
  // elegido es un nombre de empresa, se resuelve al curso real antes de
  // filtrar.
  const cursoDeEmpresa = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of evaluaciones) if (e.empresa && e.codigo_curso) map.set(e.empresa, e.codigo_curso);
    return map;
  }, [evaluaciones]);
  const cursoResuelto = cursoDeEmpresa.get(filterCurso) ?? filterCurso;

  const filteredEvaluaciones = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return evaluaciones.filter((e) =>
      (!q || (e.identificacion_estudiante ?? "").includes(q) || (e.codigo_curso ?? "").toLowerCase().includes(q) || (e.empresa ?? "").toLowerCase().includes(q)) &&
      (!filterAsignatura || e.asignatura === filterAsignatura) &&
      (!filterCurso || (modoPeriodo ? e.periodo === filterCurso : e.codigo_curso === cursoResuelto))
    );
  }, [evaluaciones, searchActive, filterAsignatura, filterCurso, cursoResuelto, modoPeriodo]);

  const filteredNotas = useMemo(() => {
    const q = searchActive.trim().toLowerCase();
    return notasFinales.filter((n) =>
      (!q || (n.identificacion_estudiante ?? "").includes(q) || (n.asignatura ?? "").toLowerCase().includes(q)) &&
      (!filterAsignatura || n.asignatura === filterAsignatura)
    );
  }, [notasFinales, searchActive, filterAsignatura]);

  const activeData  = tab === "Evaluaciones detalladas" ? filteredEvaluaciones : filteredNotas;
  const totalPages  = Math.ceil(activeData.length / PAGE_SIZE);
  const evalPage    = filteredEvaluaciones.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const notaPage    = filteredNotas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Descarga exactamente lo que está filtrado en pantalla en ese momento
  // (misma mecánica que la plantilla de Cursos para empresas).
  const exportarExcel = () => {
    const headers = ["Identificación", "Curso", "Empresa", "Fuera de base de", "Asignatura", "Parámetro", "%", "Nota", "Inasist.", "Origen"];
    const filas = incluirFueraDeBase ? filteredEvaluaciones : filteredEvaluaciones.filter((e) => !e.fueraDeBaseDe);
    const data = filas.map((e) => [
      e.identificacion_estudiante ?? "", e.codigo_curso ?? "", e.empresa ?? "", e.fueraDeBaseDe ?? "", e.asignatura ?? "",
      e.parametro ?? "", e.porcentaje ?? "", e.origen === "q10" ? (e.nota ?? "") : "",
      e.origen === "q10" ? (e.inasistencias ?? 0) : "", e.origen === "q10" ? "Antigua" : "Cuestionario",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws["!cols"] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Evaluaciones");
    XLSX.writeFile(wb, "evaluaciones.xlsx");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Evaluaciones</h1>
        <p className="text-slate-500 text-xs mt-0.5">Notas por parámetro de evaluación y consolidado final por asignatura</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <FilterSelect
          label="Asignatura" value={filterAsignatura} onChange={handleAsignaturaChange}
          options={asignaturaOpts} placeholder="Seleccione asignatura"
        />
        <FilterSelect
          label={modoPeriodo ? "Periodo" : "Curso"} value={filterCurso} onChange={handleCursoChange}
          options={modoPeriodo ? periodoOpts : cursoOpts} placeholder={modoPeriodo ? "Seleccione periodo" : "Seleccione curso"}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : filterCurso && modoPeriodo ? (
        <PeriodoRosterPanel
          asignatura={filterAsignatura} periodo={filterCurso}
          evaluaciones={evaluaciones}
          estudiantesMap={estudiantesMap}
          canEdit={canEdit}
          onUpdated={handleEvaluacionUpdated}
        />
      ) : filterCurso ? (
        <CursoRosterPanel
          curso={cursoResuelto}
          evaluaciones={evaluaciones}
          estudiantesMap={estudiantesMap}
          canEdit={canEdit}
          onUpdated={handleEvaluacionUpdated}
        />
      ) : (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t} onClick={() => changeTab(t)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all
                          ${tab === t ? "bg-[#C41717]/8 text-[#C41717] border-b-2 border-[#C41717]" : "text-slate-500 hover:text-slate-800"}`}>
              {t} <span className="ml-1 text-slate-400">{t === "Evaluaciones detalladas" ? evaluaciones.length : notasFinales.length}</span>
            </button>
          ))}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={tab === "Evaluaciones detalladas" ? "Buscar por identificación, curso o empresa..." : "Buscar por identificación o asignatura..."}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#C41717]/40 focus:bg-white focus:ring-2 focus:ring-[#C41717]/8 transition-all" />
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={handleSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(196,23,23,0.25)] hover:shadow-[0_4px_18px_rgba(196,23,23,0.35)] active:scale-[0.98] transition-all duration-150">
              <Search className="w-3.5 h-3.5" /> Buscar
            </button>
            {tab === "Evaluaciones detalladas" && (
              <>
                {!modoPeriodo && (
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap cursor-pointer select-none">
                    <input type="checkbox" checked={incluirFueraDeBase} onChange={(e) => setIncluirFueraDeBase(e.target.checked)} className="accent-[#C41717]" />
                    Incluir los de fuera de la base
                  </label>
                )}
                <button onClick={exportarExcel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 text-sm font-semibold transition-all">
                  <Download className="w-3.5 h-3.5" /> Descargar Excel
                </button>
              </>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : tab === "Evaluaciones detalladas" ? (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Curso</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Parámetro</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">%</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Inasist.</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Empresa</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Origen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evalPage.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : evalPage.map((e, idx) => (
                      <tr key={e.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{e.identificacion_estudiante ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.codigo_curso ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{e.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.parametro ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.porcentaje ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-xs">{e.origen === "q10" ? (e.nota ?? "—") : "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{e.origen === "q10" ? (e.inasistencias ?? 0) : "—"}</td>
                        <td className="px-4 py-2 text-xs">
                          {e.empresa ? (
                            <span className="text-emerald-700 font-medium">{e.empresa}</span>
                          ) : e.fueraDeBaseDe ? (
                            <span className="text-amber-600 font-medium">Fuera de la base de {e.fueraDeBaseDe}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {e.origen === "q10" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium">Antigua</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">Cuestionario</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredEvaluaciones.length > PAGE_SIZE && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <p className="text-xs text-slate-400">Página <span className="font-semibold text-slate-600">{page}</span> de <span className="font-semibold text-slate-600">{totalPages}</span></p>
                  <Pagination total={filteredEvaluaciones.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Programa</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Período</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nota</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Promedio</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notaPage.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : notaPage.map((n, idx) => (
                      <tr key={n.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{n.identificacion_estudiante ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.programa ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.periodo ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-600 text-xs">{n.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-xs">{n.nota_asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{n.promedio_acumulado ?? "—"}</td>
                        <td className="px-4 py-2">
                          {n.aprobado?.toUpperCase() === "S" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">Aprobado</span>
                          ) : n.aprobado?.toUpperCase() === "N" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium">No aprobado</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">{n.tipo_nota ?? "—"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredNotas.length > PAGE_SIZE && (
                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  <p className="text-xs text-slate-400">Página <span className="font-semibold text-slate-600">{page}</span> de <span className="font-semibold text-slate-600">{totalPages}</span></p>
                  <Pagination total={filteredNotas.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      )}
    </motion.div>
  );
}
