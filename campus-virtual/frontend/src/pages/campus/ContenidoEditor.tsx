import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, X, Trash2, Loader2, Upload, ChevronRight, FileText, File as FileIcon,
  Video, Music, ClipboardCheck, ListChecks, Link as LinkIcon, MessageSquare, Import,
  CheckCircle2, Circle, Square, CheckSquare, Download, Pencil, Lock, Unlock,
} from "lucide-react";
import { apiFetch, apiImage, apiDownload } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";

export interface Contenido {
  id: number; titulo: string; modulo: string | null; tipo: string;
  descripcion: string | null; contenido_texto: string | null; archivo_path: string | null;
  url_externa: string | null; como_completarlo: string | null;
  restringir_fecha: number; fecha_desde: string | null; fecha_hasta: string | null;
  preguntas_por_pagina: number | null; preguntas_aleatorias: number; mostrar_puntaje: number;
  tiempo_maximo_min: number | null; tiempo_minimo_min: number | null; porcentaje_aprobacion: number | null;
  intentos_disponibles: number | null; permitir_editar_respuestas: number;
  permitir_verificar_antes_enviar: number; ver_detalle_resultados: number; tomar_foto: number;
  preguntas?: Pregunta[];
}
export interface Opcion { id?: number; texto: string; pareja_texto: string | null; es_correcta: number | boolean }
export type TipoRespuesta = "unica" | "multiple" | "asociacion" | "descriptiva";
export interface Pregunta {
  id: number; texto: string; tipo_respuesta: TipoRespuesta; puntos: number;
  retroalimentacion: string | null; opciones: Opcion[];
}

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const TIPO_ICON: Record<string, React.ElementType> = {
  Texto: FileText, Archivo: FileIcon, Video, Audio: Music, Tarea: ClipboardCheck,
  Cuestionario: ListChecks, Foro: MessageSquare, Iframe: LinkIcon,
};
const TIPOS_MENU = [
  { tipo: "Texto", label: "Texto", icon: FileText },
  { tipo: "Archivo", label: "Archivo (.docx, .pdf, .pptx...)", icon: FileIcon },
  { tipo: "Video", label: "Video", icon: Video },
  { tipo: "Audio", label: "Audio", icon: Music },
  { tipo: "Tarea", label: "Tarea", icon: ClipboardCheck },
  { tipo: "Cuestionario", label: "Cuestionario", icon: ListChecks },
  { tipo: "Foro", label: "Foro", icon: MessageSquare, disabled: true },
  { tipo: "Iframe", label: "Iframe", icon: LinkIcon },
  { tipo: "Importar recursos", label: "Importar recursos", icon: Import, disabled: true },
] as const;

const TIPO_RESPUESTA_LABEL: Record<TipoRespuesta, string> = {
  unica: "Única respuesta", multiple: "Múltiple respuesta", asociacion: "Asociación", descriptiva: "Descriptiva",
};

interface ApiCtx { contentBase: string; questionsBase: string; ownerIdKey: string; ownerId: number }

function AgregarRecursoMenu({ onSelect, label = "Agregar recurso" }: { onSelect: (tipo: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateRect = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, right: window.innerWidth - r.right });
  };

  useEffect(() => {
    if (!open) return;
    updateRect();
    const onReposition = () => updateRect();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open]);

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
        <Plus className="w-3.5 h-3.5" /> {label}
      </button>
      {open && rect && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ position: "fixed", top: rect.top, right: rect.right }}
            className="w-64 bg-white rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.16)] z-[201] py-1.5">
            {TIPOS_MENU.map((t) => (
              <button key={t.tipo} disabled={"disabled" in t && t.disabled}
                onClick={() => { onSelect(t.tipo); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                <t.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {t.label}
                {"disabled" in t && t.disabled && <span className="ml-auto text-[9px] text-slate-300 shrink-0">Próximamente</span>}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ── Formulario de creación / edición (se adapta según el tipo elegido) ──── */
function RecursoFormModal({
  api, tipo, editing, onClose, onSaved,
}: { api: ApiCtx; tipo: string; editing?: Contenido | null; onClose: () => void; onSaved: (id: number) => void }) {
  const [titulo, setTitulo] = useState(editing?.titulo ?? "");
  const [modulo, setModulo] = useState(editing?.modulo ?? "");
  const [descripcion, setDescripcion] = useState(editing?.descripcion ?? "");
  const [contenidoTexto, setContenidoTexto] = useState(editing?.contenido_texto ?? "");
  const [urlExterna, setUrlExterna] = useState(editing?.url_externa ?? "");
  const [comoCompletarlo, setComoCompletarlo] = useState(editing?.como_completarlo ?? "Al abrir el recurso");
  const [restringirFecha, setRestringirFecha] = useState(!!editing?.restringir_fecha);
  const [fechaDesde, setFechaDesde] = useState(editing?.fecha_desde ?? "");
  const [fechaHasta, setFechaHasta] = useState(editing?.fecha_hasta ?? "");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const needsFile = tipo === "Archivo" || tipo === "Video" || tipo === "Audio";
  const fileAccept = tipo === "Video" ? "video/*" : tipo === "Audio" ? "audio/*" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    if (needsFile && !file && !editing?.archivo_path) { setError("Selecciona un archivo."); return; }
    if (tipo === "Iframe" && !urlExterna.trim()) { setError("La URL es obligatoria."); return; }
    setSubmitting(true);
    try {
      const payload = {
        titulo: titulo.trim(), modulo: modulo.trim() || null,
        descripcion: descripcion || null, contenidoTexto: contenidoTexto || null,
        urlExterna: urlExterna || null, comoCompletarlo: tipo === "Archivo" ? comoCompletarlo : null,
        restringirFecha, fechaDesde: restringirFecha && fechaDesde ? fechaDesde : null,
        fechaHasta: restringirFecha && fechaHasta ? fechaHasta : null,
      };
      let id: number;
      if (editing) {
        id = editing.id;
        await apiFetch(`${api.contentBase}/update.php`, { method: "POST", json: { id, ...payload } });
      } else {
        const res = await apiFetch<{ contenido: { id: number } }>(`${api.contentBase}/create.php`, {
          method: "POST", json: { [api.ownerIdKey]: api.ownerId, tipo, ...payload },
        });
        id = res.contenido.id;
      }
      if (needsFile && file) {
        const form = new FormData();
        form.append("id", String(id));
        form.append("file", file);
        await apiFetch(`${api.contentBase}/upload.php`, { method: "POST", body: form });
      }
      onSaved(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el recurso.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md max-h-[88vh] overflow-y-auto bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <form onSubmit={submit} className="p-5 space-y-3">
          <h3 className="font-semibold text-slate-800 text-[15px]">{editing ? `Editar ${tipo}` : tipo}</h3>
          <input value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Módulo (opcional, agrupa recursos)" className={inputCls} />
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className={inputCls} />

          {tipo === "Texto" && (
            <textarea value={contenidoTexto} onChange={(e) => setContenidoTexto(e.target.value)} placeholder="Contenido" rows={6} className={inputCls} />
          )}
          {(tipo === "Archivo" || tipo === "Tarea") && (
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" rows={3} className={inputCls} />
          )}
          {tipo === "Iframe" && (
            <input value={urlExterna} onChange={(e) => setUrlExterna(e.target.value)} placeholder="URL a incrustar (https://...)" className={inputCls} />
          )}
          {tipo === "Cuestionario" && (
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Introducción del cuestionario (opcional)" rows={3} className={inputCls} />
          )}

          {needsFile && (
            <>
              <input ref={fileRef} type="file" accept={fileAccept} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-slate-300
                           text-slate-500 hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors text-sm">
                <Upload className="w-4 h-4" />
                {file ? file.name : editing?.archivo_path ? "Reemplazar archivo (opcional)" : "Cargar archivo"}
              </button>
            </>
          )}
          {tipo === "Archivo" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cómo completarlo</label>
              <select value={comoCompletarlo} onChange={(e) => setComoCompletarlo(e.target.value)} className={inputCls}>
                <option value="Al abrir el recurso">Al abrir el recurso</option>
                <option value="Al descargar el recurso">Al descargar el recurso</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Restringir fecha</span>
            <button type="button" onClick={() => setRestringirFecha((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${restringirFecha ? "bg-emerald-500" : "bg-slate-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${restringirFecha ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </div>
          {restringirFecha && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Desde</label>
                <input value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} type="datetime-local" className={inputCls} />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Hasta</label>
                <input value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} type="datetime-local" className={inputCls} />
              </div>
            </div>
          )}

          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <div className="flex items-center gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="flex-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl py-2.5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 text-sm font-bold rounded-xl py-2.5 bg-[#C41717] hover:bg-[#B01313] text-white shadow-[0_4px_14px_rgba(196,23,23,0.3)] disabled:opacity-60 transition-all">
              {submitting ? "Guardando..." : editing ? "Guardar cambios" : "Aceptar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Importar una pregunta ya existente del Banco de preguntas ────────────── */
interface BancoEtiqueta { id: number; nombre: string; color: string | null }
interface BancoPreguntaSlim { id: number; titulo: string; tipo: number; etiquetas: BancoEtiqueta[] }
interface BancoOpcion { texto: string; correcta: boolean }
interface BancoPar { termino: string; respuesta: string }
interface BancoPreguntaDetalle extends BancoPreguntaSlim {
  descripcion: string; puntos: number; aplica_retroalimentacion: number; retroalimentacion: string | null;
  opciones: BancoOpcion[]; pares: BancoPar[];
}
const BANCO_TIPO_LABEL: Record<number, string> = { 1: "Única respuesta", 2: "Múltiple respuesta", 4: "Asociación", 6: "Descriptiva" };

function ImportarBancoModal({ onClose, onImport }: { onClose: () => void; onImport: (p: BancoPreguntaDetalle) => void }) {
  const [etiquetas, setEtiquetas] = useState<BancoEtiqueta[]>([]);
  const [preguntas, setPreguntas] = useState<BancoPreguntaSlim[]>([]);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ etiquetas: BancoEtiqueta[] }>("/banco-etiquetas/list.php"),
      apiFetch<{ preguntas: BancoPreguntaSlim[] }>("/banco-preguntas/list.php"),
    ])
      .then(([et, pr]) => { setEtiquetas(et.etiquetas); setPreguntas(pr.preguntas.filter((p) => p.tipo !== 3)); })
      .finally(() => setLoading(false));
  }, []);

  const filtradas = filtroEtiqueta ? preguntas.filter((p) => p.etiquetas.some((e) => e.id === filtroEtiqueta)) : preguntas;

  const pick = async (id: number) => {
    setLoadingId(id);
    try {
      const { pregunta } = await apiFetch<{ pregunta: BancoPreguntaDetalle }>(`/banco-preguntas/detail.php?id=${id}`);
      onImport(pregunta);
      onClose();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-full overflow-hidden flex flex-col">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30 shrink-0" />
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-slate-800">Importar del banco de preguntas</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100 shrink-0">
          <select value={filtroEtiqueta ?? ""} onChange={(e) => setFiltroEtiqueta(e.target.value ? Number(e.target.value) : null)} className={inputCls}>
            <option value="">Todas las etiquetas</option>
            {etiquetas.map((et) => <option key={et.id} value={et.id}>{et.nombre}</option>)}
          </select>
        </div>
        <div className="overflow-y-auto px-5 py-3 space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : filtradas.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Sin preguntas en el banco para este filtro.</p>
          ) : filtradas.map((p) => (
            <button key={p.id} onClick={() => pick(p.id)} disabled={loadingId !== null}
              className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 disabled:opacity-50">
              <span className="text-sm text-slate-700 truncate">{p.titulo}</span>
              <span className="text-[11px] font-semibold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 shrink-0">
                {loadingId === p.id ? "..." : BANCO_TIPO_LABEL[p.tipo]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Formulario para agregar una pregunta a un cuestionario ──────────────── */
function PreguntaForm({
  questionsBase, contenidoId, onDone, onCancel,
}: { questionsBase: string; contenidoId: number; onDone: () => void; onCancel: () => void }) {
  const [texto, setTexto] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState<TipoRespuesta>("unica");
  const [puntos, setPuntos] = useState("10");
  const [retro, setRetro] = useState("");
  const [opciones, setOpciones] = useState<{ texto: string; parejaTexto: string; esCorrecta: boolean }[]>([
    { texto: "", parejaTexto: "", esCorrecta: false }, { texto: "", parejaTexto: "", esCorrecta: false },
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importando, setImportando] = useState(false);

  const applyImport = (p: BancoPreguntaDetalle) => {
    setTexto(p.descripcion.replace(/<[^>]*>/g, "").trim() || p.titulo);
    if (p.tipo === 4) {
      setTipoRespuesta("asociacion");
      setOpciones(p.pares.map((par) => ({ texto: par.termino, parejaTexto: par.respuesta, esCorrecta: false })));
    } else if (p.tipo === 6) {
      setTipoRespuesta("descriptiva");
    } else {
      setTipoRespuesta(p.tipo === 2 ? "multiple" : "unica");
      setOpciones(p.opciones.map((o) => ({ texto: o.texto, parejaTexto: "", esCorrecta: o.correcta })));
    }
    setPuntos(String(p.puntos));
    setRetro(p.aplica_retroalimentacion && p.retroalimentacion ? p.retroalimentacion : "");
  };

  const toggleCorrecta = (i: number) => setOpciones((prev) => prev.map((o, idx) => {
    if (tipoRespuesta === "unica") return { ...o, esCorrecta: idx === i };
    return idx === i ? { ...o, esCorrecta: !o.esCorrecta } : o;
  }));
  const updateTexto = (i: number, v: string) => setOpciones((prev) => prev.map((o, idx) => (idx === i ? { ...o, texto: v } : o)));
  const updatePareja = (i: number, v: string) => setOpciones((prev) => prev.map((o, idx) => (idx === i ? { ...o, parejaTexto: v } : o)));
  const addOpcion = () => setOpciones((prev) => [...prev, { texto: "", parejaTexto: "", esCorrecta: false }]);
  const removeOpcion = (i: number) => setOpciones((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!texto.trim()) { setError("El texto de la pregunta es obligatorio."); return; }
    let validOpts: typeof opciones = [];
    if (tipoRespuesta === "asociacion") {
      validOpts = opciones.filter((o) => o.texto.trim() && o.parejaTexto.trim());
      if (validOpts.length < 2) { setError("Completa al menos 2 pares."); return; }
    } else if (tipoRespuesta !== "descriptiva") {
      validOpts = opciones.filter((o) => o.texto.trim());
      if (validOpts.length < 2) { setError("Agrega al menos 2 opciones."); return; }
      if (!validOpts.some((o) => o.esCorrecta)) { setError("Marca al menos una opción como correcta."); return; }
    }
    setSubmitting(true);
    try {
      await apiFetch(`${questionsBase}/create.php`, {
        method: "POST",
        json: {
          contenidoId, texto: texto.trim(), tipoRespuesta, puntos: Number(puntos) || 10, retroalimentacion: retro || null,
          opciones: validOpts.map((o) => ({ texto: o.texto, parejaTexto: o.parejaTexto || undefined, esCorrecta: o.esCorrecta })),
        },
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
      <div className="flex justify-end">
        <button type="button" onClick={() => setImportando(true)} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C41717] hover:text-[#B01313]">
          <Import className="w-3.5 h-3.5" /> Importar del banco de preguntas
        </button>
      </div>
      {importando && (
        <ImportarBancoModal onClose={() => setImportando(false)} onImport={applyImport} />
      )}
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Texto de la pregunta" rows={2} className={inputCls} />
      <div className="flex gap-2">
        <select value={tipoRespuesta} onChange={(e) => setTipoRespuesta(e.target.value as TipoRespuesta)} className={`${inputCls} flex-1`}>
          <option value="unica">Única respuesta</option>
          <option value="multiple">Múltiple respuesta</option>
          <option value="asociacion">Asociación</option>
          <option value="descriptiva">Descriptiva</option>
        </select>
        <input value={puntos} onChange={(e) => setPuntos(e.target.value)} type="number" placeholder="Puntos" className={inputCls} style={{ width: 100 }} />
      </div>

      {tipoRespuesta === "descriptiva" ? (
        <p className="text-xs text-slate-400 italic px-1">Los estudiantes responderán con texto libre — sin opciones que configurar.</p>
      ) : tipoRespuesta === "asociacion" ? (
        <div className="space-y-1.5">
          {opciones.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#C41717]/10 text-[#C41717] text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <input value={o.texto} onChange={(e) => updateTexto(i, e.target.value)} placeholder="Ítem" className={`${inputCls} flex-1`} />
              <input value={o.parejaTexto} onChange={(e) => updatePareja(i, e.target.value)} placeholder="Definición que le corresponde" className={`${inputCls} flex-1`} />
              {opciones.length > 2 && (
                <button type="button" onClick={() => removeOpcion(i)} className="text-slate-300 hover:text-red-500 shrink-0"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOpcion} className="text-[11px] font-semibold text-[#C41717] hover:text-[#B01313]">+ Agregar par</button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {opciones.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <button type="button" onClick={() => toggleCorrecta(i)} className={o.esCorrecta ? "text-emerald-600 shrink-0" : "text-slate-300 shrink-0"}>
                {tipoRespuesta === "multiple"
                  ? (o.esCorrecta ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />)
                  : (o.esCorrecta ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />)}
              </button>
              <input value={o.texto} onChange={(e) => updateTexto(i, e.target.value)} placeholder={`Opción ${i + 1}`} className={`${inputCls} flex-1`} />
              {opciones.length > 2 && (
                <button type="button" onClick={() => removeOpcion(i)} className="text-slate-300 hover:text-red-500 shrink-0"><X className="w-3.5 h-3.5" /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={addOpcion} className="text-[11px] font-semibold text-[#C41717] hover:text-[#B01313]">+ Agregar opción</button>
        </div>
      )}

      <textarea value={retro} onChange={(e) => setRetro(e.target.value)} placeholder="Retroalimentación (opcional)" rows={2} className={inputCls} />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60 transition-colors">
          {submitting ? "Guardando..." : "Guardar pregunta"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-slate-500 px-3">Cancelar</button>
      </div>
    </form>
  );
}

/* ── Cuestionario · Preguntas ─────────────────────────────────────────────── */
function PreguntasPanel({
  questionsBase, contenido, canEdit, onChanged,
}: { questionsBase: string; contenido: Contenido; canEdit: boolean; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const preguntas = contenido.preguntas ?? [];

  const removePregunta = async (id: number) => {
    await apiFetch(`${questionsBase}/delete.php`, { method: "POST", json: { id } });
    onChanged();
  };

  return (
    <div className="space-y-4">
      {contenido.descripcion && <p className="text-sm text-slate-600">{contenido.descripcion}</p>}
      {preguntas.length === 0 && !adding && <p className="text-slate-400 text-sm">Aún no hay preguntas en este cuestionario.</p>}
      {preguntas.map((p, idx) => (
        <div key={p.id} className="p-4 rounded-xl border border-slate-200 group">
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">Pregunta {idx + 1}. {p.texto}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {TIPO_RESPUESTA_LABEL[p.tipo_respuesta]} · {p.puntos} pts
              </span>
            </div>
            {canEdit && (
              <button onClick={() => removePregunta(p.id)} className="text-slate-300 group-hover:text-red-500 shrink-0 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {p.tipo_respuesta === "descriptiva" ? (
            <p className="text-xs text-slate-400 italic">Respuesta abierta de texto (sin opciones).</p>
          ) : p.tipo_respuesta === "asociacion" ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Ítem</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Definición</p>
              {p.opciones.map((o, oi) => (
                <Fragment key={oi}>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-[#C41717]/10 text-[#C41717] text-[10px] font-bold flex items-center justify-center shrink-0">{oi + 1}</span>
                    {o.texto}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-[#C41717]/10 text-[#C41717] text-[10px] font-bold flex items-center justify-center shrink-0">{oi + 1}</span>
                    {o.pareja_texto}
                  </div>
                </Fragment>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {p.opciones.map((o, oi) => (
                <div key={oi} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${o.es_correcta ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}>
                  {p.tipo_respuesta === "multiple"
                    ? (o.es_correcta ? <CheckSquare className="w-3.5 h-3.5 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-300 shrink-0" />)
                    : (o.es_correcta ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />)}
                  {o.texto}
                </div>
              ))}
            </div>
          )}

          {p.retroalimentacion && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/60 border-l-2 border-emerald-400 text-[11px] text-emerald-800">
              <span className="font-semibold">Retroalimentación: </span>{p.retroalimentacion}
            </div>
          )}
        </div>
      ))}
      {canEdit && (
        adding ? (
          <PreguntaForm questionsBase={questionsBase} contenidoId={contenido.id} onDone={() => { setAdding(false); onChanged(); }} onCancel={() => setAdding(false)} />
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
            <Plus className="w-3.5 h-3.5" /> Agregar pregunta
          </button>
        )
      )}
    </div>
  );
}

/* ── Cuestionario · Configuración ─────────────────────────────────────────── */
function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onChange}
      className={`w-10 h-[22px] rounded-full transition-colors relative shrink-0 disabled:opacity-60 ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
      <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[19px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function ConfigRow({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-200">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {help && <p className="text-[11px] text-slate-400 mt-0.5">{help}</p>}
      </div>
      {children}
    </div>
  );
}

function ConfiguracionCuestionario({
  contentBase, contenido, canEdit, onChanged,
}: { contentBase: string; contenido: Contenido; canEdit: boolean; onChanged: () => void }) {
  const [preguntasPorPagina, setPreguntasPorPagina] = useState(contenido.preguntas_por_pagina != null ? String(contenido.preguntas_por_pagina) : "10");
  const [preguntasAleatorias, setPreguntasAleatorias] = useState(!!contenido.preguntas_aleatorias);
  const [mostrarPuntaje, setMostrarPuntaje] = useState(contenido.mostrar_puntaje !== 0);
  const [tiempoMaximo, setTiempoMaximo] = useState(contenido.tiempo_maximo_min != null ? String(contenido.tiempo_maximo_min) : "");
  const [tiempoMinimo, setTiempoMinimo] = useState(contenido.tiempo_minimo_min != null ? String(contenido.tiempo_minimo_min) : "");
  const [porcentajeAprobacion, setPorcentajeAprobacion] = useState(contenido.porcentaje_aprobacion != null ? String(contenido.porcentaje_aprobacion) : "70");
  const [intentos, setIntentos] = useState(contenido.intentos_disponibles != null ? String(contenido.intentos_disponibles) : "1");
  const [permitirEditar, setPermitirEditar] = useState(contenido.permitir_editar_respuestas !== 0);
  const [permitirVerificar, setPermitirVerificar] = useState(contenido.permitir_verificar_antes_enviar !== 0);
  const [verDetalle, setVerDetalle] = useState(!!contenido.ver_detalle_resultados);
  const [tomarFoto, setTomarFoto] = useState(!!contenido.tomar_foto);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`${contentBase}/update.php`, {
        method: "POST",
        json: {
          id: contenido.id, titulo: contenido.titulo, modulo: contenido.modulo,
          descripcion: contenido.descripcion, contenidoTexto: contenido.contenido_texto, urlExterna: contenido.url_externa,
          comoCompletarlo: contenido.como_completarlo, restringirFecha: !!contenido.restringir_fecha,
          fechaDesde: contenido.fecha_desde, fechaHasta: contenido.fecha_hasta,
          preguntasPorPagina: preguntasPorPagina ? Number(preguntasPorPagina) : null,
          preguntasAleatorias, mostrarPuntaje,
          tiempoMaximoMin: tiempoMaximo ? Number(tiempoMaximo) : null,
          tiempoMinimoMin: tiempoMinimo ? Number(tiempoMinimo) : null,
          porcentajeAprobacion: porcentajeAprobacion ? Number(porcentajeAprobacion) : null,
          intentosDisponibles: intentos ? Number(intentos) : null,
          permitirEditarRespuestas: permitirEditar, permitirVerificarAntesEnviar: permitirVerificar,
          verDetalleResultados: verDetalle, tomarFoto,
        },
      });
      onChanged();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <ConfigRow label="Preguntas por página" help="Cantidad de preguntas que verán los estudiantes en cada página.">
        <input value={preguntasPorPagina} onChange={(e) => setPreguntasPorPagina(e.target.value)} disabled={!canEdit} type="number" min={1}
          className={`${inputCls} w-20 text-center disabled:bg-slate-50`} />
      </ConfigRow>
      <ConfigRow label="Preguntas aleatorias" help="Minimiza la posibilidad de copia entre estudiantes.">
        <Toggle checked={preguntasAleatorias} disabled={!canEdit} onChange={() => setPreguntasAleatorias((v) => !v)} />
      </ConfigRow>
      <ConfigRow label="Mostrar puntaje de las preguntas" help="Los estudiantes verán el puntaje asignado a cada pregunta.">
        <Toggle checked={mostrarPuntaje} disabled={!canEdit} onChange={() => setMostrarPuntaje((v) => !v)} />
      </ConfigRow>
      <ConfigRow label="Tiempo máximo en minutos">
        <input value={tiempoMaximo} onChange={(e) => setTiempoMaximo(e.target.value)} disabled={!canEdit} type="number" min={0}
          className={`${inputCls} w-20 text-center disabled:bg-slate-50`} />
      </ConfigRow>
      <ConfigRow label="Tiempo mínimo en minutos">
        <input value={tiempoMinimo} onChange={(e) => setTiempoMinimo(e.target.value)} disabled={!canEdit} type="number" min={0}
          className={`${inputCls} w-20 text-center disabled:bg-slate-50`} />
      </ConfigRow>
      <ConfigRow label="Porcentaje de aprobación">
        <input value={porcentajeAprobacion} onChange={(e) => setPorcentajeAprobacion(e.target.value)} disabled={!canEdit} type="number" min={0} max={100}
          className={`${inputCls} w-20 text-center disabled:bg-slate-50`} />
      </ConfigRow>
      <ConfigRow label="Intentos disponibles" help="Siempre se almacenará la nota del último intento.">
        <select value={intentos} onChange={(e) => setIntentos(e.target.value)} disabled={!canEdit} className={`${inputCls} w-20 disabled:bg-slate-50`}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </ConfigRow>
      <ConfigRow label="Permitir editar respuestas anteriores" help="Los estudiantes podrán editar respuestas dadas a otras preguntas.">
        <Toggle checked={permitirEditar} disabled={!canEdit} onChange={() => setPermitirEditar((v) => !v)} />
      </ConfigRow>
      <ConfigRow label="Permitir verificar antes de enviar" help="Verán un resumen de sus respuestas antes de enviar.">
        <Toggle checked={permitirVerificar} disabled={!canEdit} onChange={() => setPermitirVerificar((v) => !v)} />
      </ConfigRow>
      <ConfigRow label="Ver detalle de resultados" help="Observarán las respuestas correctas e incorrectas al enviar.">
        <Toggle checked={verDetalle} disabled={!canEdit} onChange={() => setVerDetalle((v) => !v)} />
      </ConfigRow>
      <ConfigRow label="Tomar foto al inicio y al final">
        <Toggle checked={tomarFoto} disabled={!canEdit} onChange={() => setTomarFoto((v) => !v)} />
      </ConfigRow>
      {canEdit && (
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      )}
    </div>
  );
}

function CuestionarioViewer({
  contentBase, questionsBase, contenido, canEdit, onChanged,
}: { contentBase: string; questionsBase: string; contenido: Contenido; canEdit: boolean; onChanged: () => void }) {
  const [subtab, setSubtab] = useState<"preguntas" | "configuracion">("preguntas");
  return (
    <div>
      <div className="flex items-center gap-5 border-b border-slate-200 mb-4">
        <button onClick={() => setSubtab("preguntas")}
          className={`pb-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${subtab === "preguntas" ? "border-[#C41717] text-[#C41717]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          Preguntas
        </button>
        <button onClick={() => setSubtab("configuracion")}
          className={`pb-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${subtab === "configuracion" ? "border-[#C41717] text-[#C41717]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
          Configuración
        </button>
      </div>
      {subtab === "preguntas" ? (
        <PreguntasPanel questionsBase={questionsBase} contenido={contenido} canEdit={canEdit} onChanged={onChanged} />
      ) : (
        <ConfiguracionCuestionario contentBase={contentBase} contenido={contenido} canEdit={canEdit} onChanged={onChanged} />
      )}
    </div>
  );
}

/* ── Visor de un recurso ya creado ────────────────────────────────────────── */
function RecursoViewer({
  api, item, canEdit, onBack, onDeleted,
}: { api: ApiCtx; item: Contenido; canEdit: boolean; onBack: () => void; onDeleted: () => void }) {
  const [full, setFull] = useState<Contenido>(item);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const refetch = () => {
    apiFetch<{ contenido: Contenido }>(`${api.contentBase}/get.php?id=${item.id}`)
      .then((d) => setFull(d.contenido)).finally(() => setLoading(false));
  };
  useEffect(refetch, [item.id, api.contentBase]);

  useEffect(() => {
    if (!full.archivo_path) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`${api.contentBase}/archivo.php?id=${full.id}`)
      .then((u) => { if (!cancelled) { objectUrl = u; setFileUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [full.id, full.archivo_path, api.contentBase]);

  const ext = full.archivo_path?.split(".").pop()?.toLowerCase() ?? "";
  const isImg = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  const isPdf = ext === "pdf";

  const remove = async () => {
    if (!window.confirm(`¿Eliminar "${full.titulo}"? Esta acción no se puede deshacer.`)) return;
    await apiFetch(`${api.contentBase}/delete.php`, { method: "POST", json: { id: full.id } });
    onDeleted();
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C41717] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver al contenido
      </button>
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
          {(() => { const Icon = TIPO_ICON[full.tipo] ?? FileText; return <Icon className="w-3 h-3" />; })()} {full.tipo}
        </span>
        {full.modulo && <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{full.modulo}</p>}
        <h3 className="text-base font-bold text-slate-800">{full.titulo}</h3>
        <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          {full.restringir_fecha ? (
            <><Lock className="w-3 h-3" /> {full.fecha_desde ?? "?"} — {full.fecha_hasta ?? "?"}</>
          ) : (
            <><Unlock className="w-3 h-3" /> Sin restricción de fecha.</>
          )}
        </span>
      </div>
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : (
        <>
          {full.tipo === "Texto" && (
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{full.contenido_texto || "Sin contenido."}</div>
          )}
          {full.tipo === "Iframe" && full.url_externa && (
            <iframe src={full.url_externa} className="w-full h-[65vh] rounded-xl border border-slate-200" title={full.titulo} />
          )}
          {(full.tipo === "Archivo" || full.tipo === "Video" || full.tipo === "Audio") && (
            <>
              {full.descripcion && <p className="text-sm text-slate-500 mb-2">{full.descripcion}</p>}
              {!fileUrl ? (
                <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
              ) : full.tipo === "Video" ? (
                <video controls src={fileUrl} className="w-full max-h-[65vh] rounded-xl bg-black" />
              ) : full.tipo === "Audio" ? (
                <audio controls src={fileUrl} className="w-full" />
              ) : isImg ? (
                <img src={fileUrl} alt="" className="max-w-full rounded-xl border border-slate-200" />
              ) : isPdf ? (
                <iframe src={fileUrl} className="w-full h-[65vh] rounded-xl border border-slate-200" title={full.titulo} />
              ) : (
                <button
                  onClick={() => apiDownload(`${api.contentBase}/archivo.php?id=${full.id}`, `${full.titulo}.${ext}`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 hover:border-[#C41717]/30 transition-colors"
                >
                  <Download className="w-4 h-4" /> Descargar archivo (.{ext})
                </button>
              )}
            </>
          )}
          {full.tipo === "Tarea" && (
            <div className="space-y-2">
              {full.descripcion && <p className="text-sm text-slate-600 whitespace-pre-wrap">{full.descripcion}</p>}
              {full.fecha_hasta && <p className="text-xs text-slate-400">Fecha límite: {new Date(full.fecha_hasta).toLocaleString("es-CO")}</p>}
            </div>
          )}
          {full.tipo === "Cuestionario" && (
            <CuestionarioViewer contentBase={api.contentBase} questionsBase={api.questionsBase} contenido={full} canEdit={canEdit} onChanged={refetch} />
          )}
        </>
      )}
      {canEdit && (
        <div className="flex items-center gap-4 mt-4">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C41717] transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Editar recurso
          </button>
          <button onClick={remove} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar este recurso
          </button>
        </div>
      )}
      {editing && (
        <RecursoFormModal
          api={api} tipo={full.tipo} editing={full} onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); refetch(); }}
        />
      )}
    </div>
  );
}

/* ── Contenido del curso (componente exportado, reutilizado por Cursos
   ligeros y Plantillas — cada uno pasa su propio par de endpoints) ───────── */
export default function ContenidoEditor({
  contentBase, questionsBase, ownerIdKey, ownerId, heading = "Contenido del curso", addLabel = "Agregar recurso",
}: { contentBase: string; questionsBase: string; ownerIdKey: string; ownerId: number; heading?: string; addLabel?: string }) {
  const { currentUser } = useCampusAuth();
  const canEdit = currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const api: ApiCtx = { contentBase, questionsBase, ownerIdKey, ownerId };
  const [items, setItems] = useState<Contenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTipo, setCreatingTipo] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<Contenido | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ contenido: Contenido[] }>(`${contentBase}/list.php?${ownerIdKey}=${ownerId}`)
      .then((d) => setItems(d.contenido)).finally(() => setLoading(false));
  };
  useEffect(load, [contentBase, ownerIdKey, ownerId]);

  // Agrupa por "módulo" preservando el orden de primera aparición, igual a
  // como Q10 organiza el contenido bajo encabezados de módulo en el sidebar.
  const grupos = useMemo(() => {
    const map = new Map<string, Contenido[]>();
    const order: string[] = [];
    for (const it of items) {
      const key = it.modulo?.trim() || "";
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(it);
    }
    return order.map((key) => ({ modulo: key, items: map.get(key)! }));
  }, [items]);

  if (viewingItem) {
    return (
      <RecursoViewer
        api={api} item={viewingItem} canEdit={canEdit}
        onBack={() => { setViewingItem(null); load(); }}
        onDeleted={() => { setViewingItem(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{heading}</h3>
        {canEdit && <AgregarRecursoMenu onSelect={setCreatingTipo} label={addLabel} />}
      </div>
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Aún no hay contenido agregado.</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {grupos.map((g) => (
            <div key={g.modulo || "__sin_modulo__"}>
              {g.modulo && <p className="px-4 pt-3 pb-1 text-xs font-bold text-slate-700">{g.modulo}</p>}
              <div className="divide-y divide-slate-100">
                {g.items.map((it) => {
                  const Icon = TIPO_ICON[it.tipo] ?? FileText;
                  return (
                    <div key={it.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors group">
                      <button onClick={() => setViewingItem(it)} className="flex-1 flex items-center gap-2.5 text-left min-w-0">
                        <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{it.titulo}</span>
                      </button>
                      {canEdit && (
                        <button onClick={() => setViewingItem(it)} className="text-slate-300 group-hover:text-[#C41717] shrink-0 transition-colors" title="Ver / editar">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      {creatingTipo && (
        <RecursoFormModal
          api={api} tipo={creatingTipo} onClose={() => setCreatingTipo(null)}
          onSaved={() => { setCreatingTipo(null); load(); }}
        />
      )}
    </div>
  );
}
