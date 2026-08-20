import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Pencil, X, Search, Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import ProgramaDetailView from "./ProgramaDetailView";

export interface Programa {
  id: number;
  codigo: string | null;
  nombre: string;
  pensum: string | null;
  abreviacion: string | null;
  num_resolucion: string | null;
  fecha_resolucion: string | null;
  estado: string | null;
  disponible_oferta_laboral: string | null;
  aplica_preinscripcion: string | null;
  aplica_grupos: string | null;
  categoria: string | null;
  matriculados: number;
  descripcion: string | null;
  imagen_path: string | null;
  publicado: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
  pensum_nombre: string | null;
  porcentaje_inasistencia: number | null;
  nota_aprobacion: number | null;
  valor_maximo_calificacion: number | null;
}

// Mismas 26 categorías del clasificador oficial (CINE-F / SNIES) que ya usa
// GFO Academy en Q10 — confirmado por el cliente, se replica exacto.
const CATEGORIAS = [
  "Actividades físicas, deportivas y recreativas",
  "Administración, finanzas y derecho",
  "Agropecuario, silvicultura, pesca, acuicultura y veterinaria",
  "Artes visuales, plásticas y del patrimonio cultural",
  "Audiovisuales, artes escénicas y música",
  "Ciencias naturales, matemáticas y estadística",
  "Ciencias sociales y humanidades",
  "Comercio, mercadeo y publicidad",
  "Conservación, protección y saneamiento ambiental",
  "Construcción e infraestructura",
  "Educación y formación",
  "Elaboración y transformación de alimentos",
  "Electrónica y automatización",
  "Exploración y extracción de minas, canteras, petróleo y gas",
  "Fabricación, transformación de materiales, instalación, mantenimiento y reparación",
  "Industria química",
  "Literatura y artes gráficas",
  "Logística y transporte",
  "Producción de energía y electricidad",
  "Salud y bienestar",
  "Seguridad",
  "Servicios personales y a la comunidad",
  "Tecnologías de la información y las comunicaciones",
  "Textil, cuero, confección y diseño de modas",
  "Transformación de la madera y fabricación de muebles",
  "Turismo, hotelería y gastronomía",
];

const inputCls = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const PAGE_SIZE = 12;

function csvEscape(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/* ── Modal de crear/editar programa (antes era una tarjeta suelta dentro de
     la lista — ahora vive detrás del botón "+ Crear programa" del
     encabezado, igual que en Q10) ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-slate-500 text-[11px] font-semibold mb-1">{children}</label>;
}

export function ProgramaFormModal({
  target, onClose, onSaved,
}: { target: Programa | "new" | null; onClose: () => void; onSaved: () => void }) {
  const isOpen = target !== null;
  const editing = target && target !== "new" ? target : null;
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [pensum, setPensum] = useState("");
  const [abreviacion, setAbreviacion] = useState("");
  const [numResolucion, setNumResolucion] = useState("");
  const [fechaResolucion, setFechaResolucion] = useState("");
  const [aplicaPreinscripcion, setAplicaPreinscripcion] = useState("No");
  const [aplicaGrupos, setAplicaGrupos] = useState("Sí");
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCodigo(editing?.codigo ?? "");
    setNombre(editing?.nombre ?? "");
    setPensum(editing?.pensum ?? "");
    setAbreviacion(editing?.abreviacion ?? "");
    setNumResolucion(editing?.num_resolucion ?? "");
    setFechaResolucion(editing?.fecha_resolucion ?? "");
    setAplicaPreinscripcion(editing?.aplica_preinscripcion ?? "No");
    setAplicaGrupos(editing?.aplica_grupos ?? "Sí");
    setCategoria(editing?.categoria ?? "");
    setEstado(editing?.estado ?? "Activo");
    setError("");
  }, [isOpen, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      const payload = {
        codigo: codigo.trim() || null, nombre: nombre.trim(), pensum: pensum || null, abreviacion: abreviacion.trim() || null,
        numResolucion: numResolucion.trim() || null, fechaResolucion: fechaResolucion || null,
        aplicaPreinscripcion, aplicaGrupos, categoria: categoria || null, estado,
      };
      if (editing) {
        await apiFetch("/programas/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/programas/create.php", { method: "POST", json: payload });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40 shrink-0" />
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <p className="text-slate-800 font-bold text-[15px]">{editing ? "Editar programa" : "Crear programa"}</p>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={submit} className="px-5 py-4 space-y-3 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <FieldLabel>Código</FieldLabel>
                  {/* Igual que en Q10: una vez creado, el código ya no se edita (evita
                      romper referencias a cursos que lo usan por código). */}
                  <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. BCI" disabled={!!editing}
                    className={`${inputCls} ${editing ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""}`} />
                </div>
                <div className="col-span-2">
                  <FieldLabel>Nombre *</FieldLabel>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del programa" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>N° Res. autorización</FieldLabel>
                  <input value={numResolucion} onChange={(e) => setNumResolucion(e.target.value)} placeholder="Ej. 0256" className={inputCls} />
                </div>
                <div>
                  <FieldLabel>F. Res. autorización</FieldLabel>
                  <input value={fechaResolucion} onChange={(e) => setFechaResolucion(e.target.value)} type="date" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Aplica para preinscripciones</FieldLabel>
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="radio" name="aplicaPreinscripcion" checked={aplicaPreinscripcion === "Sí"} onChange={() => setAplicaPreinscripcion("Sí")} className="accent-[#C41717]" /> Sí
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="radio" name="aplicaPreinscripcion" checked={aplicaPreinscripcion === "No"} onChange={() => setAplicaPreinscripcion("No")} className="accent-[#C41717]" /> No
                    </label>
                  </div>
                </div>
                <div>
                  <FieldLabel>Aplica para grupos</FieldLabel>
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="radio" name="aplicaGrupos" checked={aplicaGrupos === "Sí"} onChange={() => setAplicaGrupos("Sí")} className="accent-[#C41717]" /> Sí
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input type="radio" name="aplicaGrupos" checked={aplicaGrupos === "No"} onChange={() => setAplicaGrupos("No")} className="accent-[#C41717]" /> No
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Estado</FieldLabel>
                  <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inputCls}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Categoría</FieldLabel>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
                    <option value="">Seleccione...</option>
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Pensum</FieldLabel>
                  <input value={pensum} onChange={(e) => setPensum(e.target.value)} placeholder="Opcional" className={inputCls} />
                </div>
                <div>
                  <FieldLabel>Abreviación</FieldLabel>
                  <input value={abreviacion} onChange={(e) => setAbreviacion(e.target.value)} placeholder="Opcional" className={inputCls} />
                </div>
              </div>
              {error && <p className="text-[11px] text-red-500">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear programa"}
                </button>
                <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function ProgramasView() {
  const { currentUser, canVer } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const canManage = currentUser?.role === "admin" || isSuperAdmin;
  // Coordinador/Administrativo tienen "ver" en academico.programas por su rol
  // (rol_modulos_por_defecto en el backend) — deben poder entrar a la ficha
  // aunque no puedan crear/editar/eliminar (eso sigue exclusivo de canManage).
  const canViewDetail = canManage || canVer("academico.programas");
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [formTarget, setFormTarget] = useState<Programa | "new" | null>(null);
  const [deleting, setDeleting]   = useState<Programa | null>(null);
  const [viewing, setViewing]     = useState<Programa | null>(null);

  const [search, setSearch] = useState("");
  const [busquedaAvanzada, setBusquedaAvanzada] = useState(false);
  // Igual que en Q10: por defecto solo se listan los programas activos —
  // "Búsqueda avanzada" solo trae una casilla para incluir los inactivos.
  const [incluirInactivos, setIncluirInactivos] = useState(false);
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
      if (!incluirInactivos && p.estado === "Inactivo") return false;
      if (term) {
        const haystack = `${p.codigo ?? ""} ${p.nombre} ${p.abreviacion ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [programas, search, incluirInactivos]);

  useEffect(() => setPage(1), [search, incluirInactivos]);

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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
            {filtered.length} de {programas.length} registros
          </span>
          {canManage && (
            <button onClick={() => setFormTarget("new")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold shadow-sm transition-colors">
              <Plus className="w-3.5 h-3.5" /> Crear programa
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4 space-y-3">
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
            <button onClick={() => setBusquedaAvanzada((v) => !v)}
              className="flex items-center gap-1 px-2 py-2 text-xs font-semibold text-[#C41717] hover:text-[#B01313] transition-colors">
              Búsqueda avanzada
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${busquedaAvanzada ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {busquedaAvanzada && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input type="checkbox" checked={incluirInactivos} onChange={(e) => setIncluirInactivos(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#C41717] rounded" />
                    ¿Incluir programas inactivos?
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                      <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                      {isSuperAdmin && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr><td colSpan={isSuperAdmin ? 4 : 3} className="text-center py-12 text-slate-400 text-sm">Sin resultados</td></tr>
                    ) : paged.map((p, idx) => (
                      <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${idx % 2 === 1 ? "bg-slate-50/30" : ""}`}>
                        <td className="px-4 py-2 text-slate-500 text-xs font-medium">{p.codigo ?? "—"}</td>
                        <td className="px-4 py-2 text-[13px]">
                          {canViewDetail ? (
                            <button onClick={() => setViewing(p)} className="text-[#C41717] hover:text-[#B01313] font-medium text-left transition-colors">
                              {p.nombre}
                            </button>
                          ) : (
                            <span className="text-slate-700 font-medium">{p.nombre}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${
                            p.estado === "Inactivo" ? "bg-slate-100 border-slate-200 text-slate-500" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            {p.estado ?? "—"}
                          </span>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2.5">
                              <button onClick={() => setFormTarget(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleting(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                                <X className="w-3.5 h-3.5" />
                              </button>
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

      <ProgramaFormModal target={formTarget} onClose={() => setFormTarget(null)} onSaved={load} />

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
