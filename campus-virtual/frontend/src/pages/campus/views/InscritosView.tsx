import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Search, Eye, Pencil, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { SearchableSelect } from "../SearchableSelect";
import { ConfirmModal } from "../ConfirmModal";
import { TIPOS_ID } from "@/data/academicCatalog";

interface Preinscripcion {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string | null;
  identificacion: string;
  celular: string | null;
  correo: string | null;
  tipo_interes: "curso" | "programa" | "diplomado";
  item_nombre: string;
  estado: "Pendiente" | "Matriculado";
  estudiante_id: number | null;
  periodo: string | null;
  created_at: string;
}
interface Opcion { id: number; nombre: string }
interface Opciones { programas: Opcion[]; diplomados: Opcion[]; cursos: Opcion[] }

const TIPO_LABEL: Record<string, string> = { curso: "Curso", programa: "Programa", diplomado: "Diplomado" };
const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

// GFO maneja 2 periodos por año (AAAA-1 = primeros 6 meses, AAAA-2 = los
// otros 6) -- se ofrece el año actual y el siguiente, para que ya se pueda
// matricular con el periodo que viene antes de que empiece.
function periodosDisponibles(): string[] {
  const anioActual = new Date().getFullYear();
  return [anioActual, anioActual + 1].flatMap((a) => [`${a}-1`, `${a}-2`]);
}

/* ── Ver el detalle de una inscripción (solo lectura) ─────────────────────── */
function VerModal({ item, onClose }: { item: Preinscripcion; onClose: () => void }) {
  const Row = ({ label, value }: { label: string; value: string | null }) => (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Detalle de la inscripción</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <Row label="Nombres" value={item.nombres} />
          <Row label="Apellidos" value={item.apellidos} />
          <Row label="Tipo de identificación" value={item.tipo_documento} />
          <Row label="Número de identificación" value={item.identificacion} />
          <Row label="Celular" value={item.celular} />
          <Row label="Correo" value={item.correo} />
          <Row label="Se inscribió a" value={`${TIPO_LABEL[item.tipo_interes]}: ${item.item_nombre}`} />
          <Row label="Estado" value={item.estado} />
        </div>
      </div>
    </div>
  );
}

/* ── Editar los datos de una inscripción — si ya fue matriculada, el
     estudiante real que se creó a partir de ella queda sincronizado (lo
     hace el backend, no acá). ──────────────────────────────────────────── */
function EditarModal({ item, opciones, onClose, onSaved }: { item: Preinscripcion; opciones: Opciones; onClose: () => void; onSaved: () => void }) {
  const [nombres, setNombres] = useState(item.nombres);
  const [apellidos, setApellidos] = useState(item.apellidos);
  const [tipoDocumento, setTipoDocumento] = useState(item.tipo_documento ?? "");
  const [identificacion, setIdentificacion] = useState(item.identificacion);
  const [celular, setCelular] = useState(item.celular ?? "");
  const [correo, setCorreo] = useState(item.correo ?? "");
  const [tipoInteres, setTipoInteres] = useState(item.tipo_interes);
  const [itemNombre, setItemNombre] = useState(item.item_nombre);
  const [periodo, setPeriodo] = useState(item.periodo ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const listaActual = tipoInteres === "programa" ? opciones.programas : tipoInteres === "diplomado" ? opciones.diplomados : opciones.cursos;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombres.trim() || !apellidos.trim() || !identificacion.trim()) {
      setError("Nombres, apellidos e identificación son obligatorios."); return;
    }
    if (!itemNombre) { setError("Selecciona a qué se inscribió."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/preinscripciones/update.php", {
        method: "POST",
        json: {
          id: item.id, nombres: nombres.trim(), apellidos: apellidos.trim(),
          tipoDocumento: tipoDocumento || null, identificacion: identificacion.trim(),
          celular: celular.trim() || null, correo: correo.trim() || null,
          tipoInteres, itemNombre, periodo: periodo || null,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Editar inscripción</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {item.estado === "Matriculado" && (
            <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Ya fue matriculada — al guardar, también se actualiza el estudiante real vinculado.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres *" className={inputCls} />
            <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos *" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SearchableSelect value={tipoDocumento} onChange={setTipoDocumento}
              options={TIPOS_ID.map((t) => ({ value: t, label: t }))} placeholder="Tipo de identificación" />
            <input value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} placeholder="Número de identificación *" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Celular" className={inputCls} />
            <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="Correo" className={inputCls} />
          </div>
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1">Se inscribió a</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(["curso", "programa", "diplomado"] as const).map((t) => (
                <button key={t} type="button" onClick={() => { setTipoInteres(t); setItemNombre(""); }}
                  className={`py-2 rounded-lg border text-xs font-semibold transition-all
                              ${tipoInteres === t ? "border-[#C41717] bg-[#C41717]/8 text-[#C41717]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
            <SearchableSelect value={itemNombre} onChange={setItemNombre}
              options={listaActual.map((o) => ({ value: o.nombre, label: o.nombre }))} placeholder="Seleccione una opción..." />
          </div>
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1">Seleccionar Periodo</label>
            <SearchableSelect value={periodo} onChange={setPeriodo}
              options={periodosDisponibles().map((p) => ({ value: p, label: p }))} placeholder="Seleccione el periodo..." />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InscritosView() {
  const { currentUser } = useCampusAuth();
  const canMatricular = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  const [items, setItems] = useState<Preinscripcion[]>([]);
  const [opciones, setOpciones] = useState<Opciones>({ programas: [], diplomados: [], cursos: [] });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [matriculando, setMatriculando] = useState<number | null>(null);
  const [viendo, setViendo] = useState<Preinscripcion | null>(null);
  const [editando, setEditando] = useState<Preinscripcion | null>(null);
  const [eliminando, setEliminando] = useState<Preinscripcion | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ preinscripciones: Preinscripcion[] }>("/preinscripciones/list.php")
      .then((d) => setItems(d.preinscripciones))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  useEffect(() => {
    apiFetch<Opciones>("/preinscripciones/opciones.php").then(setOpciones).catch(() => {});
  }, []);

  const q = busqueda.trim().toLowerCase();
  const filtrados = q
    ? items.filter((p) => `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) || p.identificacion.includes(q))
    : items;

  const matricular = async (id: number) => {
    setMatriculando(id);
    try {
      await apiFetch("/preinscripciones/matricular.php", { method: "POST", json: { id } });
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al matricular.");
    } finally {
      setMatriculando(null);
    }
  };

  const confirmDelete = async () => {
    if (!eliminando) return;
    await apiFetch("/preinscripciones/delete.php", { method: "POST", json: { id: eliminando.id } });
    setEliminando(null);
    load();
  };

  const pendientes = items.filter((p) => p.estado === "Pendiente").length;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Inscritos</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Solicitudes recibidas desde el formulario público de inscripción
          {pendientes > 0 && <span className="text-[#C41717] font-semibold"> · {pendientes} pendiente{pendientes !== 1 ? "s" : ""}</span>}.
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o identificación..."
          className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2
                     focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Celular</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Correo</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Interés</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                  <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Sin inscritos por ahora.</td></tr>
                ) : filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">{p.nombres} {p.apellidos}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.identificacion}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.celular ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.correo ?? "—"}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="text-slate-400">{TIPO_LABEL[p.tipo_interes]}:</span>{" "}
                      <span className="text-slate-700 font-medium">{p.item_nombre}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium
                        ${p.estado === "Matriculado" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-3">
                        {p.estado === "Pendiente" && canMatricular && (
                          <button
                            onClick={() => matricular(p.id)} disabled={matriculando === p.id}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313] disabled:opacity-50"
                          >
                            {matriculando === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                            Matricular
                          </button>
                        )}
                        <button onClick={() => setViendo(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Ver">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canMatricular && (
                          <>
                            <button onClick={() => setEditando(p)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEliminando(p)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {viendo && <VerModal item={viendo} onClose={() => setViendo(null)} />}
      {editando && <EditarModal item={editando} opciones={opciones} onClose={() => setEditando(null)} onSaved={load} />}
      <ConfirmModal
        open={!!eliminando}
        title="Eliminar inscripción"
        message={`¿Eliminar la inscripción de "${eliminando?.nombres} ${eliminando?.apellidos}"? Esto no borra al estudiante si ya fue matriculado, solo el registro de la inscripción. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setEliminando(null)}
      />
    </motion.div>
  );
}
