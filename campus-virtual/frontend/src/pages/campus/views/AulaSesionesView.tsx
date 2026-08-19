import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Download, ChevronDown, ChevronLeft, ChevronRight, Users, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Sesion {
  fecha_inicio_sesion: string;
  fecha_fin_sesion: string | null;
  nombre_curso: string | null;
  asignatura: string | null;
  docente_nombre: string | null;
  asistentes: number;
}
interface Asistente {
  asistente_nombre: string | null;
  asistente_identificacion: string | null;
  asistente_externo: string | null;
  fecha_ingreso_real: string | null;
  fecha_salida_real: string | null;
}

const PAGE_SIZE = 12;

const fmtDateTime = (v: string | null) => {
  if (!v) return "—";
  const [d, t] = v.split(" ");
  return `${d?.split("-").reverse().join("/") ?? d}${t ? " " + t.slice(0, 5) : ""}`;
};

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

function AsistenciaModal({ sesion, onClose }: { sesion: Sesion; onClose: () => void }) {
  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      fecha: sesion.fecha_inicio_sesion,
      curso: sesion.nombre_curso ?? "",
      asignatura: sesion.asignatura ?? "",
      docente: sesion.docente_nombre ?? "",
    });
    apiFetch<{ asistentes: Asistente[] }>(`/aulas-virtuales/asistentes.php?${params.toString()}`)
      .then((d) => setAsistentes(d.asistentes)).finally(() => setLoading(false));
  }, [sesion]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-[15px]">{sesion.nombre_curso ?? "Sesión"}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{fmtDateTime(sesion.fecha_inicio_sesion)} · {sesion.docente_nombre ?? "—"}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0"><X className="w-4 h-4" /></button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : asistentes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Sin asistentes registrados para esta sesión.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {asistentes.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="text-slate-700 font-medium truncate">{a.asistente_nombre ?? a.asistente_identificacion ?? "—"}</p>
                    <p className="text-slate-400">{fmtDateTime(a.fecha_ingreso_real)} – {fmtDateTime(a.fecha_salida_real)}</p>
                  </div>
                  {(a.asistente_externo?.toLowerCase() === "si" || a.asistente_externo?.toLowerCase() === "sí") && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium shrink-0">Externo</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AulaSesionesView({ aulaNombre, onBack }: { aulaNombre: string; onBack: () => void }) {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [docenteFilter, setDocenteFilter] = useState("");
  const [asignaturaFilter, setAsignaturaFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewingAsistencia, setViewingAsistencia] = useState<Sesion | null>(null);

  useEffect(() => {
    apiFetch<{ sesiones: Sesion[] }>("/aulas-virtuales/sesiones.php")
      .then((d) => setSesiones(d.sesiones))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, []);

  const docentes = useMemo(
    () => Array.from(new Set(sesiones.map((s) => s.docente_nombre).filter((v): v is string => !!v))).sort(),
    [sesiones],
  );
  const asignaturas = useMemo(
    () => Array.from(new Set(sesiones.map((s) => s.asignatura).filter((v): v is string => !!v))).sort(),
    [sesiones],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sesiones.filter((s) => {
      if (docenteFilter && s.docente_nombre !== docenteFilter) return false;
      if (asignaturaFilter && s.asignatura !== asignaturaFilter) return false;
      if (term) {
        const haystack = `${s.nombre_curso ?? ""} ${s.asignatura ?? ""} ${s.docente_nombre ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [sesiones, search, docenteFilter, asignaturaFilter]);

  useEffect(() => setPage(1), [search, docenteFilter, asignaturaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportar = () => {
    const header = ["Fecha", "Curso", "Asignatura", "Docente", "Aula", "Asistencia"];
    const rows = filtered.map((s) => [fmtDateTime(s.fecha_inicio_sesion), s.nombre_curso ?? "", s.asignatura ?? "", s.docente_nombre ?? "", aulaNombre, String(s.asistentes)]);
    const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(v)).join(",")).join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clases-finalizadas.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a aulas virtuales
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Clases finalizadas</h1>
          <p className="text-slate-500 text-xs mt-0.5">Historial real de sesiones dictadas en {aulaNombre}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {filtered.length} de {sesiones.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
          <p className="text-[11px] text-slate-400">
            Grabaciones no está disponible — nunca se importó ni existe ningún archivo de grabación real.
            El aula no se registra por sesión en los datos importados, así que se muestra la de este listado.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar curso..."
                className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
            </div>
            <button onClick={exportar}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
            <Dropdown label={docenteFilter || "Docente: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setDocenteFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {docentes.map((d) => (
                    <button key={d} onClick={() => { setDocenteFilter(d); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{d}</button>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={asignaturaFilter || "Asignatura: Todos"}>
              {(close) => (
                <>
                  <button onClick={() => { setAsignaturaFilter(""); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">Todos</button>
                  {asignaturas.map((a) => (
                    <button key={a} onClick={() => { setAsignaturaFilter(a); close(); }} className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">{a}</button>
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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Fecha</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Curso</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asignatura</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Aula</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Grabaciones</th>
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((s, idx) => (
                      <tr key={`${s.fecha_inicio_sesion}-${idx}`} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">{fmtDateTime(s.fecha_inicio_sesion)}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium text-[13px]">{s.nombre_curso ?? "—"}<br /><span className="text-slate-400 font-normal text-xs">{s.docente_nombre ?? ""}</span></td>
                        <td className="px-4 py-2 text-slate-500 text-xs">{s.asignatura ?? "—"}</td>
                        <td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">{aulaNombre}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium">Sin grabación</span>
                        </td>
                        <td className="px-4 py-2">
                          <button onClick={() => setViewingAsistencia(s)}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C41717] transition-colors">
                            <Users className="w-3.5 h-3.5" /> {s.asistentes}
                          </button>
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

      {viewingAsistencia && <AsistenciaModal sesion={viewingAsistencia} onClose={() => setViewingAsistencia(null)} />}
    </motion.div>
  );
}
