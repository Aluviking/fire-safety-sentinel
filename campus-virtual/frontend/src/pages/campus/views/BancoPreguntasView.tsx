import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, X, Loader2, Plus, Pencil, ChevronDown, Tag, MoreVertical,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";
import { normalizarBusqueda } from "../SearchableSelect";

/* ── Modelo real de Q10 (calcado del banco de preguntas) ─────────────────── */
interface Etiqueta { id: number; nombre: string; color: string | null }
interface PreguntaSlim {
  id: number; titulo: string; tipo: number; puntos: number; created_at: string;
  etiquetas: Etiqueta[];
}
interface Opcion { id?: number; texto: string; correcta: boolean }
interface Par { id?: number; termino: string; respuesta: string }
interface PreguntaDetalle extends PreguntaSlim {
  descripcion: string;
  respuestas_aleatorias: number;
  permite_puntos_parciales: number;
  aplica_retroalimentacion: number;
  retroalimentacion: string | null;
  opciones: Opcion[];
  pares: Par[];
}

const TIPO_LABEL: Record<number, string> = {
  1: "Única respuesta",
  2: "Múltiple respuesta",
  3: "Rellene los espacios",
  4: "Asociación",
  6: "Descriptiva",
};
const TIPO_MENU: { tipo: number; label: string }[] = [
  { tipo: 1, label: "Selección única respuesta" },
  { tipo: 2, label: "Selección múltiple respuesta" },
  { tipo: 3, label: "Rellene los espacios" },
  { tipo: 4, label: "Asociación" },
  { tipo: 6, label: "Descriptiva" },
];
const PAGE_SIZE = 8;
const COLORES = ["#94A3B8", "#C41717", "#D97706", "#059669", "#2563EB", "#7C3AED", "#DB2777"];

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";
const textareaCls = inputCls + " resize-y min-h-[70px]";

/* ── Chip de etiqueta ──────────────────────────────────────────────────────── */
// El color propio de la etiqueta queda solo como puntico de acento -- usarlo
// directo como color de letra (como estaba antes) dejaba el texto casi
// invisible con los colores pálidos que trae la mayoría de etiquetas (ej.
// #d5d5d5). El texto siempre queda en slate-700 sobre fondo claro fijo, así
// se lee bien sin importar qué color tenga la etiqueta.
function EtiquetaChip({ etiqueta }: { etiqueta: Etiqueta }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: etiqueta.color ?? "#94A3B8" }} />
      {etiqueta.nombre}
    </span>
  );
}

/* ── Multi-select de etiquetas (filtro OR, igual que Q10) ─────────────────── */
function EtiquetasFiltro({
  etiquetas, selected, onChange,
}: { etiquetas: Etiqueta[]; selected: number[]; onChange: (ids: number[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div ref={ref} className="relative flex-1 min-w-[220px]">
      <div
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[38px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 flex items-center gap-1 flex-wrap cursor-pointer"
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 text-sm">Ninguna</span>
        ) : (
          selected.map((id) => {
            const et = etiquetas.find((e) => e.id === id);
            if (!et) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-slate-100 rounded-md px-2 py-0.5 text-xs text-slate-700">
                {et.nombre}
                <button onClick={(e) => { e.stopPropagation(); toggle(id); }} className="text-slate-400 hover:text-slate-700">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1">
          {etiquetas.map((et) => (
            <label key={et.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(et.id)} onChange={() => toggle(et.id)} className="rounded" />
              {et.nombre}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Panel izquierdo: lista de etiquetas + gestión ────────────────────────── */
function EtiquetaMenu({
  etiqueta, canManage, onEdit, onDelete,
}: { etiqueta: Etiqueta; canManage: boolean; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  if (!canManage) return null;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="text-slate-400 hover:text-slate-600 p-1">
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
          <button onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700">Editar</button>
          <button onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600">Eliminar</button>
        </div>
      )}
    </div>
  );
}

function EtiquetaFormModal({
  target, onClose, onSaved,
}: { target: Etiqueta | "new" | null; onClose: () => void; onSaved: () => void }) {
  const editing = target && target !== "new" ? target : null;
  const [nombre, setNombre] = useState(editing?.nombre ?? "");
  const [color, setColor] = useState(editing?.color ?? COLORES[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setNombre(editing?.nombre ?? ""); setColor(editing?.color ?? COLORES[0]); setError(""); }, [target]);

  if (!target) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await apiFetch("/banco-etiquetas/update.php", { method: "POST", json: { id: editing.id, nombre: nombre.trim(), color } });
      } else {
        await apiFetch("/banco-etiquetas/create.php", { method: "POST", json: { nombre: nombre.trim(), color } });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{editing ? "Editar etiqueta" : "Nueva etiqueta"}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre *</label>
            <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Color</label>
            <div className="flex gap-2">
              {COLORES.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-slate-800" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#C41717] hover:bg-[#B01313] disabled:opacity-60">
              {submitting ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Modal de crear/editar pregunta — un solo componente, cambia de forma
     según el tipo (igual que en Q10) ──────────────────────────────────────── */
function PreguntaFormModal({
  tipo, editingId, etiquetas, onClose, onSaved,
}: { tipo: number | null; editingId: number | null; etiquetas: Etiqueta[]; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(!!editingId);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [etiquetaIds, setEtiquetaIds] = useState<number[]>([]);
  const [opciones, setOpciones] = useState<Opcion[]>([{ texto: "", correcta: false }, { texto: "", correcta: false }]);
  const [pares, setPares] = useState<Par[]>([{ termino: "", respuesta: "" }]);
  const [puntos, setPuntos] = useState("10");
  const [aleatorias, setAleatorias] = useState(true);
  const [puntosParciales, setPuntosParciales] = useState(false);
  const [aplicaRetro, setAplicaRetro] = useState(false);
  const [retro, setRetro] = useState("");
  const [tipoReal, setTipoReal] = useState(tipo ?? 1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editingId) { setLoading(false); return; }
    setLoading(true);
    apiFetch<{ pregunta: PreguntaDetalle }>(`/banco-preguntas/detail.php?id=${editingId}`)
      .then(({ pregunta }) => {
        setTitulo(pregunta.titulo);
        setDescripcion(pregunta.descripcion);
        setEtiquetaIds(pregunta.etiquetas.map((e) => e.id));
        setPuntos(String(pregunta.puntos));
        setAleatorias(!!pregunta.respuestas_aleatorias);
        setPuntosParciales(!!pregunta.permite_puntos_parciales);
        setAplicaRetro(!!pregunta.aplica_retroalimentacion);
        setRetro(pregunta.retroalimentacion ?? "");
        setTipoReal(pregunta.tipo);
        if (pregunta.opciones.length) setOpciones(pregunta.opciones.map((o) => ({ texto: o.texto, correcta: !!o.correcta })));
        if (pregunta.pares.length) setPares(pregunta.pares);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, [editingId]);

  if (tipo === null && editingId === null) return null;

  const setOpcionTexto = (i: number, texto: string) => setOpciones((prev) => prev.map((o, idx) => (idx === i ? { ...o, texto } : o)));
  const setOpcionCorrecta = (i: number) =>
    setOpciones((prev) => prev.map((o, idx) => (tipoReal === 2 ? (idx === i ? { ...o, correcta: !o.correcta } : o) : { ...o, correcta: idx === i })));
  const addOpcion = () => setOpciones((prev) => [...prev, { texto: "", correcta: false }]);
  const removeOpcion = (i: number) => setOpciones((prev) => prev.filter((_, idx) => idx !== i));

  const setPar = (i: number, field: "termino" | "respuesta", v: string) =>
    setPares((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  const addPar = () => setPares((prev) => [...prev, { termino: "", respuesta: "" }]);
  const removePar = (i: number) => setPares((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    if (!descripcion.trim()) { setError("La descripción es obligatoria."); return; }
    if (etiquetaIds.length === 0) { setError("Debe seleccionar al menos una etiqueta."); return; }
    if ([1, 2, 3].includes(tipoReal) && opciones.filter((o) => o.texto.trim()).length < 2) {
      setError("Agregue al menos 2 respuestas."); return;
    }
    if ([1].includes(tipoReal) && !opciones.some((o) => o.correcta)) {
      setError("Marque cuál respuesta es la correcta."); return;
    }
    if (tipoReal === 4 && pares.filter((p) => p.termino.trim() && p.respuesta.trim()).length < 1) {
      setError("Agregue al menos un par término/respuesta."); return;
    }

    setSubmitting(true);
    const payload = {
      titulo: titulo.trim(), descripcion: descripcion.trim(), tipo: tipoReal,
      etiquetaIds, puntos: Number(puntos) || 10,
      respuestasAleatorias: aleatorias, permitePuntosParciales: puntosParciales,
      aplicaRetroalimentacion: aplicaRetro, retroalimentacion: aplicaRetro ? retro : null,
      opciones: [1, 2, 3].includes(tipoReal) ? opciones : undefined,
      pares: tipoReal === 4 ? pares : undefined,
    };
    try {
      if (editingId) {
        await apiFetch("/banco-preguntas/update.php", { method: "POST", json: { id: editingId, ...payload } });
      } else {
        await apiFetch("/banco-preguntas/create.php", { method: "POST", json: payload });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-full overflow-hidden flex flex-col">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30 shrink-0" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800">
            {editingId ? "Editar pregunta" : "Agregar pregunta"}{" "}
            <span className="ml-2 text-xs font-normal text-slate-400 uppercase">{TIPO_LABEL[tipoReal]}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : (
          <form onSubmit={submit} className="overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Título *</label>
              <input className={inputCls} value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Etiquetas *</label>
              <EtiquetasFiltro etiquetas={etiquetas} selected={etiquetaIds} onChange={setEtiquetaIds} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción *</label>
              <textarea className={textareaCls} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            {[1, 2].includes(tipoReal) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-500">Respuestas *</label>
                  <span className="text-[11px] text-slate-400">
                    {tipoReal === 1 ? "Marque la única correcta" : "Marque todas las correctas"}
                  </span>
                </div>
                <div className="space-y-2">
                  {opciones.map((op, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <input
                        type={tipoReal === 1 ? "radio" : "checkbox"}
                        checked={op.correcta}
                        onChange={() => setOpcionCorrecta(i)}
                        className="mt-2.5"
                      />
                      <input className={inputCls} placeholder={`Respuesta ${i + 1}`} value={op.texto}
                        onChange={(e) => setOpcionTexto(i, e.target.value)} />
                      {opciones.length > 2 && (
                        <button type="button" onClick={() => removeOpcion(i)} className="text-slate-300 hover:text-red-500 mt-2"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addOpcion} className="text-[#C41717] text-xs font-semibold mt-2 hover:underline">+ Agregar respuesta</button>
              </div>
            )}

            {tipoReal === 3 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Espacios en blanco (una respuesta aceptada por espacio) *</label>
                <div className="space-y-2">
                  {opciones.map((op, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs text-slate-400 mt-2.5 w-14 shrink-0">Espacio {i + 1}</span>
                      <input className={inputCls} placeholder="Respuesta esperada" value={op.texto}
                        onChange={(e) => setOpcionTexto(i, e.target.value)} />
                      {opciones.length > 1 && (
                        <button type="button" onClick={() => removeOpcion(i)} className="text-slate-300 hover:text-red-500 mt-2"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addOpcion} className="text-[#C41717] text-xs font-semibold mt-2 hover:underline">+ Agregar espacio en blanco</button>
              </div>
            )}

            {tipoReal === 4 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Pares término / respuesta *</label>
                <div className="space-y-2">
                  {pares.map((p, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <input className={inputCls} placeholder="Término" value={p.termino} onChange={(e) => setPar(i, "termino", e.target.value)} />
                      <input className={inputCls} placeholder="Respuesta" value={p.respuesta} onChange={(e) => setPar(i, "respuesta", e.target.value)} />
                      {pares.length > 1 && (
                        <button type="button" onClick={() => removePar(i)} className="text-slate-300 hover:text-red-500 mt-2"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addPar} className="text-[#C41717] text-xs font-semibold mt-2 hover:underline">+ Agregar par</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Puntos *</label>
                <input type="number" step="0.1" className={inputCls} value={puntos} onChange={(e) => setPuntos(e.target.value)} />
              </div>
              {tipoReal !== 6 && (
                <label className="flex items-center gap-2 mt-6 text-sm text-slate-600">
                  <input type="checkbox" checked={aleatorias} onChange={(e) => setAleatorias(e.target.checked)} className="rounded" />
                  Respuestas aleatorias
                </label>
              )}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={puntosParciales} onChange={(e) => setPuntosParciales(e.target.checked)} className="rounded" />
                Permite puntos parciales
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={aplicaRetro} onChange={(e) => setAplicaRetro(e.target.checked)} className="rounded" />
                Aplica retroalimentación
              </label>
            </div>
            {aplicaRetro && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Retroalimentación</label>
                <textarea className={textareaCls} value={retro} onChange={(e) => setRetro(e.target.value)} />
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-2 pt-2 pb-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#C41717] hover:bg-[#B01313] disabled:opacity-60">
                {submitting ? "Guardando..." : "Aceptar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Vista previa de solo lectura ─────────────────────────────────────────── */
function PreguntaPreviewModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [pregunta, setPregunta] = useState<PreguntaDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ pregunta: PreguntaDetalle }>(`/banco-preguntas/detail.php?id=${id}`)
      .then(({ pregunta }) => setPregunta(pregunta))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="bg-[#C41717] text-white px-5 py-3 flex items-center justify-between rounded-t-2xl">
          <h3 className="font-bold">Vista previa de la pregunta</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {loading || !pregunta ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">{pregunta.etiquetas.map((e) => <EtiquetaChip key={e.id} etiqueta={e} />)}</div>
              <span className="text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5">{TIPO_LABEL[pregunta.tipo]}</span>
            </div>
            <p className="font-bold text-slate-900">{pregunta.titulo}</p>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{pregunta.descripcion}</p>

            {[1, 2].includes(pregunta.tipo) && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Opciones de respuesta</p>
                {pregunta.opciones.map((op) => (
                  <div key={op.id} className="flex items-center gap-2">
                    <input type={pregunta.tipo === 1 ? "radio" : "checkbox"} checked={!!op.correcta} disabled />
                    <span className="text-sm text-slate-700">{op.texto}</span>
                  </div>
                ))}
              </div>
            )}
            {pregunta.tipo === 3 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Respuestas esperadas por espacio</p>
                {pregunta.opciones.map((op, i) => (
                  <p key={op.id} className="text-sm text-slate-700">Espacio {i + 1}: <strong>{op.texto}</strong></p>
                ))}
              </div>
            )}
            {pregunta.tipo === 4 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Pares término / respuesta</p>
                {pregunta.pares.map((p) => (
                  <p key={p.id} className="text-sm text-slate-700">{p.termino} <span className="text-slate-400">→</span> {p.respuesta}</p>
                ))}
              </div>
            )}
            {!!pregunta.aplica_retroalimentacion && pregunta.retroalimentacion && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                <span className="font-semibold">Retroalimentación: </span>{pregunta.retroalimentacion}
              </div>
            )}
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ══ Vista principal ═══════════════════════════════════════════════════════ */
export default function BancoPreguntasView() {
  const { canEditar } = useCampusAuth();
  const canManage = canEditar("academico.banco_preguntas");

  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [preguntas, setPreguntas] = useState<PreguntaSlim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [filtroEtiquetas, setFiltroEtiquetas] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [busquedaEtiquetaSidebar, setBusquedaEtiquetaSidebar] = useState("");

  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [formTipo, setFormTipo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [etiquetaTarget, setEtiquetaTarget] = useState<Etiqueta | "new" | null>(null);
  const [deleteEtiqueta, setDeleteEtiqueta] = useState<Etiqueta | null>(null);
  const [deletePregunta, setDeletePregunta] = useState<PreguntaSlim | null>(null);
  const [nuevaEtiquetaInline, setNuevaEtiquetaInline] = useState(false);
  const [nuevaEtiquetaNombre, setNuevaEtiquetaNombre] = useState("");

  const addMenuRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ etiquetas: Etiqueta[] }>("/banco-etiquetas/list.php"),
      apiFetch<{ preguntas: PreguntaSlim[] }>("/banco-preguntas/list.php"),
    ])
      .then(([et, pr]) => {
        // Orden numérico real (ej. "APH BASICAS 2" antes que "APH BASICAS 10"),
        // no alfabético plano -- pedido explícito del cliente, mismo criterio
        // que ya usamos para ordenar el pensum por código.
        const ordenadas = [...et.etiquetas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { numeric: true, sensitivity: "base" }));
        setEtiquetas(ordenadas);
        setPreguntas(pr.preguntas);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Cuántas preguntas tiene cada etiqueta -- las que están en 0 se ocultan
  // del panel izquierdo (pedido explícito del cliente), aunque la etiqueta
  // siga existiendo (sigue disponible al crear/editar una pregunta).
  const conteoEtiquetas = useMemo(() => {
    const m = new Map<number, number>();
    for (const p of preguntas) for (const e of p.etiquetas) m.set(e.id, (m.get(e.id) ?? 0) + 1);
    return m;
  }, [preguntas]);
  const etiquetasSidebar = useMemo(() => {
    const q = normalizarBusqueda(busquedaEtiquetaSidebar);
    return etiquetas.filter((et) => (conteoEtiquetas.get(et.id) ?? 0) > 0 && (!q || normalizarBusqueda(et.nombre).includes(q)));
  }, [etiquetas, conteoEtiquetas, busquedaEtiquetaSidebar]);

  const filtered = useMemo(() => {
    const q = normalizarBusqueda(searchActive);
    return preguntas.filter((p) => {
      if (q && !normalizarBusqueda(p.titulo).includes(q)) return false;
      if (filtroEtiquetas.length > 0 && !p.etiquetas.some((e) => filtroEtiquetas.includes(e.id))) return false;
      return true;
    });
  }, [preguntas, searchActive, filtroEtiquetas]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => { setSearchActive(searchInput); setPage(1); };
  const clearSearch = () => { setSearchInput(""); setSearchActive(""); setPage(1); };
  const onFiltroEtiquetasChange = (ids: number[]) => { setFiltroEtiquetas(ids); setPage(1); };
  const toggleEtiquetaSidebar = (id: number) => onFiltroEtiquetasChange(
    filtroEtiquetas.includes(id) ? filtroEtiquetas.filter((x) => x !== id) : [...filtroEtiquetas, id]
  );

  const crearEtiquetaInline = async () => {
    if (!nuevaEtiquetaNombre.trim()) { setNuevaEtiquetaInline(false); return; }
    try {
      await apiFetch("/banco-etiquetas/create.php", { method: "POST", json: { nombre: nuevaEtiquetaNombre.trim() } });
      setNuevaEtiquetaNombre("");
      setNuevaEtiquetaInline(false);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al crear la etiqueta.");
    }
  };

  const confirmDeleteEtiqueta = async () => {
    if (!deleteEtiqueta) return;
    await apiFetch("/banco-etiquetas/delete.php", { method: "POST", json: { id: deleteEtiqueta.id } });
    setDeleteEtiqueta(null);
    setFiltroEtiquetas((prev) => prev.filter((x) => x !== deleteEtiqueta.id));
    load();
  };

  const confirmDeletePregunta = async () => {
    if (!deletePregunta) return;
    await apiFetch("/banco-preguntas/delete.php", { method: "POST", json: { id: deletePregunta.id } });
    setDeletePregunta(null);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex gap-4 items-start">
      {/* ── Panel izquierdo: etiquetas ── */}
      <div className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
        <h2 className="font-bold text-slate-800 text-sm mb-2">Banco de preguntas</h2>
        {canManage && (
          nuevaEtiquetaInline ? (
            <div className="flex items-center gap-1 mb-2">
              <input
                autoFocus className="flex-1 min-w-0 text-xs border border-slate-300 rounded-md px-2 py-1"
                value={nuevaEtiquetaNombre} onChange={(e) => setNuevaEtiquetaNombre(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") crearEtiquetaInline(); if (e.key === "Escape") setNuevaEtiquetaInline(false); }}
              />
              <button onClick={crearEtiquetaInline} className="text-emerald-600 text-xs font-bold px-1">✓</button>
              <button onClick={() => setNuevaEtiquetaInline(false)} className="text-slate-400 text-xs font-bold px-1">✗</button>
            </div>
          ) : (
            <button onClick={() => setNuevaEtiquetaInline(true)} className="flex items-center gap-1 text-[#C41717] text-xs font-semibold mb-2 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Nueva etiqueta
            </button>
          )
        )}
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            className="w-full text-xs border border-slate-300 rounded-md pl-7 pr-6 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
            placeholder="Buscar etiqueta..."
            value={busquedaEtiquetaSidebar} onChange={(e) => setBusquedaEtiquetaSidebar(e.target.value)}
          />
          {busquedaEtiquetaSidebar && (
            <button onClick={() => setBusquedaEtiquetaSidebar("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
          {etiquetasSidebar.map((et) => (
            <div key={et.id} className="flex items-center gap-2 px-1 py-1.5 rounded-md hover:bg-slate-50 group">
              <input type="checkbox" checked={filtroEtiquetas.includes(et.id)} onChange={() => toggleEtiquetaSidebar(et.id)} className="rounded shrink-0" />
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: et.color ?? "#94A3B8" }} />
              <span className="text-xs text-slate-700 flex-1 min-w-0 break-words" title={et.nombre}>{et.nombre}</span>
              <span className="text-[10px] text-slate-400 shrink-0">{conteoEtiquetas.get(et.id) ?? 0}</span>
              <EtiquetaMenu
                etiqueta={et} canManage={canManage}
                onEdit={() => setEtiquetaTarget(et)}
                onDelete={() => setDeleteEtiqueta(et)}
              />
            </div>
          ))}
          {etiquetasSidebar.length === 0 && !loading && (
            <p className="text-xs text-slate-400 px-1">{busquedaEtiquetaSidebar ? "Sin coincidencias." : "Sin etiquetas con preguntas todavía."}</p>
          )}
        </div>
      </div>

      {/* ── Panel derecho: lista de preguntas ── */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-slate-600 text-xs font-semibold mb-1.5">Filtro de búsqueda</label>
            <div className="relative">
              <input
                className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
                placeholder="Buscar pregunta por texto..."
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#C41717] hover:bg-[#B01313] text-white rounded-md p-1.5">
                <Search className="w-3.5 h-3.5" />
              </button>
              {searchInput && (
                <button onClick={clearSearch} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-slate-600 text-xs font-semibold mb-1.5">Etiquetas:</label>
            <EtiquetasFiltro etiquetas={etiquetas} selected={filtroEtiquetas} onChange={onFiltroEtiquetasChange} />
          </div>
          {canManage && (
            <div ref={addMenuRef} className="relative shrink-0">
              <button onClick={() => setAddMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(196,23,23,0.25)] transition-all">
                <Plus className="w-4 h-4" /> Agregar pregunta <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {addMenuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                  {TIPO_MENU.map((t) => (
                    <button key={t.tipo} onClick={() => { setFormTipo(t.tipo); setAddMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
        ) : error ? (
          <p className="text-red-500 text-sm text-center py-8">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
            <div className="divide-y divide-slate-100">
              {pageItems.length === 0 ? (
                <p className="text-center py-12 text-slate-400 text-sm">Sin preguntas.</p>
              ) : pageItems.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/70">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 flex-wrap mb-1">{p.etiquetas.map((e) => <EtiquetaChip key={e.id} etiqueta={e} />)}</div>
                    <button onClick={() => setPreviewId(p.id)} className="text-sm text-slate-800 hover:text-[#C41717] text-left">{p.titulo}</button>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                    {TIPO_LABEL[p.tipo]}
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditingId(p.id)} className="text-slate-400 hover:text-[#C41717]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeletePregunta(p)} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 py-3 border-t border-slate-100">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === n ? "bg-[#C41717] text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" /> {preguntas.length} preguntas en el banco · {etiquetas.length} etiquetas</p>
      </div>

      {(formTipo !== null || editingId !== null) && (
        <PreguntaFormModal
          tipo={formTipo} editingId={editingId} etiquetas={etiquetas}
          onClose={() => { setFormTipo(null); setEditingId(null); }}
          onSaved={load}
        />
      )}
      {previewId !== null && <PreguntaPreviewModal id={previewId} onClose={() => setPreviewId(null)} />}
      {etiquetaTarget && <EtiquetaFormModal target={etiquetaTarget} onClose={() => setEtiquetaTarget(null)} onSaved={load} />}
      <ConfirmModal
        open={!!deleteEtiqueta}
        title="Eliminar etiqueta"
        message={`¿Eliminar la etiqueta "${deleteEtiqueta?.nombre}"? Las preguntas que la tengan no se borran, solo pierden esta etiqueta.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDeleteEtiqueta}
        onCancel={() => setDeleteEtiqueta(null)}
      />
      <ConfirmModal
        open={!!deletePregunta}
        title="Eliminar pregunta"
        message={`¿Eliminar la pregunta "${deletePregunta?.titulo}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDeletePregunta}
        onCancel={() => setDeletePregunta(null)}
      />
    </motion.div>
  );
}
