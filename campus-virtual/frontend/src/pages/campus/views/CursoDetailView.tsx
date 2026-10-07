import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, BookOpen, Users as UsersIcon, Plus, Trash2, Loader2,
  Megaphone, Video, Settings, Upload, Check,
} from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { SearchableSelect } from "../SearchableSelect";
import { ClasesVirtualesTab } from "../ClasesVirtualesTab";
// Carga diferida — ContenidoEditor trae adentro el visor de PDF (pdf.js,
// ~1.7MB) desde que se le quitó la dependencia de un Worker aparte. Si se
// importa de una, CADA curso tiene que bajar y ejecutar ese bloque completo
// antes de poder mostrar nada, aunque nadie vaya a ver contenido.
const ContenidoEditor = lazy(() => import("../ContenidoEditor"));

export interface Curso {
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
  archivado: string | null;
  descripcion: string | null;
  imagen_path: string | null;
  publicado: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
}
interface EstudianteOption { id: number; identificacion: string; nombre_completo: string }
interface Matricula { id: number; estudiante_id: number; identificacion: string; nombre_completo: string }
interface Anuncio { id: number; titulo: string; mensaje: string | null; importancia: string; created_at: string }
interface Certificado { id: number; nombre: string }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const TABS = [
  { key: "contenido", label: "Contenido del curso", icon: BookOpen },
  { key: "anuncios", label: "Anuncios", icon: Megaphone },
  { key: "clases", label: "Clases virtuales", icon: Video },
  { key: "estudiantes", label: "Estudiantes", icon: UsersIcon },
  { key: "ajustes", label: "Ajustes", icon: Settings },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/* ── Estudiantes matriculados en el curso (reusa /curso-estudiantes/*, ya existente) ── */
function EstudiantesTab({ cursoId }: { cursoId: number }) {
  const [matriculados, setMatriculados] = useState<Matricula[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ matriculados: Matricula[] }>(`/curso-estudiantes/list.php?cursoId=${cursoId}`),
      apiFetch<{ estudiantes: EstudianteOption[] }>("/estudiantes/list.php"),
    ]).then(([m, e]) => { setMatriculados(m.matriculados); setEstudiantes(e.estudiantes); }).finally(() => setLoading(false));
  };
  useEffect(load, [cursoId]);

  const inscritosIds = new Set(matriculados.map((m) => m.estudiante_id));
  const disponibles = estudiantes.filter((e) => !inscritosIds.has(e.id));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError("");
    setAdding(true);
    try {
      await apiFetch("/curso-estudiantes/create.php", { method: "POST", json: { cursoId, estudianteId: Number(selectedId) } });
      setSelectedId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al matricular.");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-estudiantes/delete.php", { method: "POST", json: { id } });
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Estudiantes ({matriculados.length})</h3>
      </div>
      <form onSubmit={add} className="flex gap-2">
        <SearchableSelect
          value={selectedId} onChange={setSelectedId}
          options={disponibles.map((e) => ({ value: String(e.id), label: e.nombre_completo, keywords: e.identificacion }))}
          placeholder="Seleccione estudiante..."
          className="flex-1"
        />
        <button type="submit" disabled={adding || !selectedId}
          className="flex items-center gap-1.5 px-4 rounded-lg bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" /> Matricular
        </button>
      </form>
      {error && <p className="text-[11px] text-red-500">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : matriculados.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes matriculados en este curso.</p>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {matriculados.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
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
  );
}

/* ── Anuncios ─────────────────────────────────────────────────────────────── */
function AnunciosTab({ cursoId }: { cursoId: number }) {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [importancia, setImportancia] = useState("Normal");

  const load = () => {
    setLoading(true);
    apiFetch<{ anuncios: Anuncio[] }>(`/curso-anuncios/list.php?cursoId=${cursoId}`)
      .then((d) => setItems(d.anuncios)).finally(() => setLoading(false));
  };
  useEffect(load, [cursoId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    await apiFetch("/curso-anuncios/create.php", { method: "POST", json: { cursoId, titulo: titulo.trim(), mensaje: mensaje || null, importancia } });
    setTitulo(""); setMensaje(""); setImportancia("Normal"); setCreating(false);
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-anuncios/delete.php", { method: "POST", json: { id } });
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Anuncios</h3>
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
          <Plus className="w-3.5 h-3.5" /> Crear anuncio
        </button>
      </div>
      {creating && (
        <form onSubmit={add} className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del anuncio" className={inputCls} />
          <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Mensaje (opcional)" rows={3} className={inputCls} />
          <div className="flex gap-2">
            <select value={importancia} onChange={(e) => setImportancia(e.target.value)} className={inputCls}>
              <option value="Normal">Normal</option>
              <option value="Importante">Importante</option>
            </select>
            <button type="submit" className="px-4 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold shrink-0">Publicar</button>
          </div>
        </form>
      )}
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">No hay anuncios actualmente cargados.</p>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="p-3.5 rounded-xl border border-slate-200 group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.titulo}</p>
                  {a.mensaje && <p className="text-xs text-slate-500 mt-0.5">{a.mensaje}</p>}
                </div>
                <button onClick={() => remove(a.id)} className="text-slate-300 group-hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Ajustes ──────────────────────────────────────────────────────────────── */
function AjustesTab({ curso, canEdit, onUpdated }: { curso: Curso; canEdit: boolean; onUpdated: () => void }) {
  const [descripcion, setDescripcion] = useState(curso.descripcion ?? "");
  const [publicado, setPublicado] = useState(!!curso.publicado);
  const [dias, setDias] = useState(curso.dias_disponibles != null ? String(curso.dias_disponibles) : "");
  const [certificadoId, setCertificadoId] = useState(curso.certificado_id != null ? String(curso.certificado_id) : "");
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<{ certificados: Certificado[] }>("/certificados/list.php").then((d) => setCertificados(d.certificados)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!curso.imagen_path) { setImgUrl(null); return; }
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/cursos/imagen.php?id=${curso.id}`).then((u) => { if (!cancelled) { objectUrl = u; setImgUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [curso.id, curso.imagen_path]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/cursos/update.php", {
        method: "POST",
        json: {
          id: curso.id, codigoNombre: curso.codigo_nombre, programaId: curso.programa_id, asignaturaId: curso.asignatura_id,
          descripcion: descripcion || null,
          publicado, diasDisponibles: dias ? Number(dias) : null, certificadoId: certificadoId ? Number(certificadoId) : null,
        },
      });
      onUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("id", String(curso.id));
      form.append("file", file);
      await apiFetch("/cursos/upload-imagen.php", { method: "POST", body: form });
      onUpdated();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value.slice(0, 500))} disabled={!canEdit} rows={4}
          className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
        <p className="text-[11px] text-slate-400 mt-1">Máximo 500 caracteres ({descripcion.length}/500)</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Imagen del curso</label>
        {imgUrl && <img src={imgUrl} alt="" className="w-full max-w-xs rounded-xl border border-slate-200 mb-2 object-cover aspect-video" />}
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313] disabled:opacity-60">
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Subiendo..." : "Cambiar imagen"}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-700">Publicado</p>
          <p className="text-[11px] text-slate-400">Los cursos publicados quedan disponibles para los estudiantes matriculados.</p>
        </div>
        <button type="button" disabled={!canEdit} onClick={() => setPublicado((v) => !v)}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 disabled:opacity-60 ${publicado ? "bg-emerald-500" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${publicado ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Días disponibles</label>
        <input value={dias} onChange={(e) => setDias(e.target.value)} disabled={!canEdit} type="number" min={0}
          className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Diseño del certificado</label>
        <SearchableSelect
          value={certificadoId} onChange={setCertificadoId} disabled={!canEdit}
          options={certificados.map((c) => ({ value: String(c.id), label: c.nombre }))}
          placeholder="Sin certificado asignado"
        />
      </div>
      {canEdit ? (
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400">Solo el Super Admin puede editar los ajustes del curso.</p>
      )}
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function CursoDetailView({
  curso, onBack, onUpdated, initialTab = "contenido",
}: { curso: Curso; onBack: () => void; onUpdated: () => void; initialTab?: TabKey }) {
  const { currentUser } = useCampusAuth();
  const canEditSettings = currentUser?.role === "super_admin";
  const [tab, setTab] = useState<TabKey>(initialTab);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a cursos
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{curso.codigo_nombre ?? "—"}</h2>
            <nav className="space-y-1">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                              ${tab === t.key ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-600 hover:bg-slate-50"}`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                  <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-5 min-w-0">
            {tab === "contenido" && (
              <Suspense fallback={<div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>}>
                <ContenidoEditor
                  contentBase="/curso-contenido" questionsBase="/curso-preguntas" ownerIdKey="cursoId" ownerId={curso.id}
                  heading="Contenido del curso" addLabel="Agregar curso"
                />
              </Suspense>
            )}
            {tab === "anuncios" && <AnunciosTab cursoId={curso.id} />}
            {tab === "clases" && <ClasesVirtualesTab parentId={curso.id} apiBase="/curso-clases" paramName="cursoId" />}
            {tab === "estudiantes" && <EstudiantesTab cursoId={curso.id} />}
            {tab === "ajustes" && <AjustesTab curso={curso} canEdit={canEditSettings} onUpdated={onUpdated} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
