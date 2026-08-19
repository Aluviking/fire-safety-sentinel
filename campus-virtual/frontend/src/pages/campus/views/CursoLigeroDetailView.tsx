import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Megaphone, BookOpen, Video, Users as UsersIcon, Settings,
  Plus, X, Trash2, Loader2, Upload, ChevronRight, Check,
} from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import ContenidoEditor from "../ContenidoEditor";
import { SearchableSelect } from "../SearchableSelect";

interface CursoLigero {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  imagen_path: string | null;
  docente_identificacion: string | null;
  docente_nombre: string | null;
  estado: string;
  dias_disponibles: number | null;
  certificado_id: number | null;
  certificado_nombre: string | null;
}
interface Anuncio { id: number; titulo: string; mensaje: string | null; importancia: string; created_at: string }
interface Inscripcion {
  id: number; estudiante_identificacion: string; nombre_completo: string | null;
  progreso: number; tiempo_total_minutos: number; promedio_final: string | null;
  ultimo_acceso: string | null; estado_acceso: string;
}
interface Clase { id: number; titulo: string; aula_recurso_id: number | null; aula_nombre: string | null; fecha_inicio: string; fecha_fin: string | null }
interface Estudiante { identificacion: string; nombre_completo: string }
interface AulaRecurso { id: number; nombre: string }
interface Certificado { id: number; nombre: string }

const TABS = [
  { key: "contenido", label: "Contenido del curso", icon: BookOpen },
  { key: "anuncios", label: "Anuncios", icon: Megaphone },
  { key: "clases", label: "Clases virtuales", icon: Video },
  { key: "usuarios", label: "Usuarios", icon: UsersIcon },
  { key: "ajustes", label: "Ajustes", icon: Settings },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

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
    apiFetch<{ anuncios: Anuncio[] }>(`/curso-ligero-anuncios/list.php?cursoLigeroId=${cursoId}`)
      .then((d) => setItems(d.anuncios)).finally(() => setLoading(false));
  };
  useEffect(load, [cursoId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    await apiFetch("/curso-ligero-anuncios/create.php", { method: "POST", json: { cursoLigeroId: cursoId, titulo: titulo.trim(), mensaje: mensaje || null, importancia } });
    setTitulo(""); setMensaje(""); setImportancia("Normal"); setCreating(false);
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-ligero-anuncios/delete.php", { method: "POST", json: { id } });
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

/* ── Clases virtuales ─────────────────────────────────────────────────────── */
function ClasesTab({ cursoId }: { cursoId: number }) {
  const [clases, setClases] = useState<Clase[]>([]);
  const [aulas, setAulas] = useState<AulaRecurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtab, setSubtab] = useState<"proximas" | "anteriores">("proximas");
  const [creating, setCreating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ clases: Clase[] }>(`/curso-ligero-clases/list.php?cursoLigeroId=${cursoId}`),
      apiFetch<{ aulas: AulaRecurso[] }>("/aulas-recursos/list.php"),
    ]).then(([c, a]) => { setClases(c.clases); setAulas(a.aulas); }).finally(() => setLoading(false));
  };
  useEffect(load, [cursoId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInicio) return;
    await apiFetch("/curso-ligero-clases/create.php", {
      method: "POST",
      json: { cursoLigeroId: cursoId, titulo: titulo.trim(), aulaRecursoId: aulaId ? Number(aulaId) : null, fechaInicio, fechaFin: fechaFin || null },
    });
    setTitulo(""); setAulaId(""); setFechaInicio(""); setFechaFin(""); setCreating(false);
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-ligero-clases/delete.php", { method: "POST", json: { id } });
    load();
  };

  const now = new Date();
  const filtered = clases.filter((c) => (subtab === "proximas" ? new Date(c.fecha_inicio) >= now : new Date(c.fecha_inicio) < now));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button onClick={() => setSubtab("proximas")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${subtab === "proximas" ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-500"}`}>Próximas clases</button>
          <button onClick={() => setSubtab("anteriores")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${subtab === "anteriores" ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-500"}`}>Clases anteriores</button>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
          <Plus className="w-3.5 h-3.5" /> Programar clase
        </button>
      </div>
      {creating && (
        <form onSubmit={add} className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la clase" className={inputCls} />
          <SearchableSelect
            value={aulaId} onChange={setAulaId}
            options={aulas.map((a) => ({ value: String(a.id), label: a.nombre }))}
            placeholder="Aula virtual (opcional)..."
          />
          <div className="grid grid-cols-2 gap-2">
            <input value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} type="datetime-local" className={inputCls} />
            <input value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} type="datetime-local" className={inputCls} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold">Programar</button>
        </form>
      )}
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">No hay registros.</p>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 group">
              <div>
                <p className="text-sm text-slate-800 font-medium">{c.titulo}</p>
                <p className="text-xs text-slate-400">{c.aula_nombre ?? "Sin aula"} · {new Date(c.fecha_inicio).toLocaleString("es-CO")}</p>
              </div>
              <button onClick={() => remove(c.id)} className="text-slate-300 group-hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Usuarios (roster) ────────────────────────────────────────────────────── */
function UsuariosTab({ cursoId }: { cursoId: number }) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ inscripciones: Inscripcion[] }>(`/curso-ligero-inscripciones/list.php?cursoLigeroId=${cursoId}`),
      apiFetch<{ estudiantes: Estudiante[] }>("/estudiantes/list.php"),
    ]).then(([i, e]) => { setInscripciones(i.inscripciones); setEstudiantes(e.estudiantes); }).finally(() => setLoading(false));
  };
  useEffect(load, [cursoId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await apiFetch("/curso-ligero-inscripciones/create.php", { method: "POST", json: { cursoLigeroId: cursoId, estudianteIdentificacion: selectedId } });
      setSelectedId(""); setAdding(false);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al inscribir.");
    }
  };

  const save = async (id: number, field: string, value: string) => {
    const insc = inscripciones.find((i) => i.id === id);
    if (!insc) return;
    await apiFetch("/curso-ligero-inscripciones/update.php", {
      method: "POST",
      json: {
        id, progreso: insc.progreso, tiempoTotalMinutos: insc.tiempo_total_minutos,
        promedioFinal: insc.promedio_final, ultimoAcceso: insc.ultimo_acceso, estadoAcceso: insc.estado_acceso,
        [field]: value,
      },
    });
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/curso-ligero-inscripciones/delete.php", { method: "POST", json: { id } });
    load();
  };

  const inscritos = new Set(inscripciones.map((i) => i.estudiante_identificacion));
  const disponibles = estudiantes.filter((e) => !inscritos.has(e.identificacion));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Usuarios ({inscripciones.length})</h3>
        <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
          <Plus className="w-3.5 h-3.5" /> Agregar estudiantes
        </button>
      </div>
      <p className="text-[11px] text-slate-400">
        Progreso, tiempo total, promedio y último acceso son informativos — no hay una plataforma de consumo real
        para el estudiante todavía, así que se editan a mano si quieres reflejar un dato real.
      </p>
      {adding && (
        <form onSubmit={add} className="flex gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <SearchableSelect
            value={selectedId} onChange={setSelectedId}
            options={disponibles.map((e) => ({ value: e.identificacion, label: e.nombre_completo }))}
            placeholder="Seleccione estudiante..."
            className="flex-1"
          />
          <button type="submit" className="px-4 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold">Inscribir</button>
        </form>
      )}
      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : inscripciones.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes inscritos.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Estudiante</th>
                <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Progreso %</th>
                <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Tiempo (min)</th>
                <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Promedio</th>
                <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Último acceso</th>
                <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Estado</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inscripciones.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">{i.nombre_completo ?? i.estudiante_identificacion}</td>
                  <td className="px-2 py-2 w-20">
                    <input defaultValue={i.progreso} onBlur={(e) => save(i.id, "progreso", e.target.value)} type="number" min={0} max={100}
                      className="w-full text-center text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-[#C41717]/40 rounded-md py-1 focus:outline-none" />
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input defaultValue={i.tiempo_total_minutos} onBlur={(e) => save(i.id, "tiempoTotalMinutos", e.target.value)} type="number" min={0}
                      className="w-full text-center text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-[#C41717]/40 rounded-md py-1 focus:outline-none" />
                  </td>
                  <td className="px-2 py-2 w-20">
                    <input defaultValue={i.promedio_final ?? ""} onBlur={(e) => save(i.id, "promedioFinal", e.target.value)} type="number" step="0.1" min={0} max={5}
                      className="w-full text-center text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-[#C41717]/40 rounded-md py-1 focus:outline-none" />
                  </td>
                  <td className="px-2 py-2 w-32">
                    <input defaultValue={i.ultimo_acceso ?? ""} onBlur={(e) => save(i.id, "ultimoAcceso", e.target.value)} type="date"
                      className="w-full text-center text-[11px] bg-transparent border border-transparent hover:border-slate-200 focus:border-[#C41717]/40 rounded-md py-1 focus:outline-none" />
                  </td>
                  <td className="px-2 py-2">
                    <select defaultValue={i.estado_acceso} onChange={(e) => save(i.id, "estadoAcceso", e.target.value)}
                      className="w-full text-center text-xs bg-transparent border border-transparent hover:border-slate-200 rounded-md py-1 cursor-pointer focus:outline-none">
                      <option value="Activo">Activo</option>
                      <option value="Bloqueado">Bloqueado</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(i.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Ajustes ──────────────────────────────────────────────────────────────── */
function AjustesTab({ curso, canEdit, onUpdated }: { curso: CursoLigero; canEdit: boolean; onUpdated: () => void }) {
  const [nombre, setNombre] = useState(curso.nombre);
  const [categoria, setCategoria] = useState(curso.categoria ?? "");
  const [descripcion, setDescripcion] = useState(curso.descripcion ?? "");
  const [publicado, setPublicado] = useState(curso.estado === "Publicado");
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
    if (!curso.imagen_path) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/cursos-ligeros/imagen.php?id=${curso.id}`).then((u) => { if (!cancelled) { objectUrl = u; setImgUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [curso.id, curso.imagen_path]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/cursos-ligeros/update.php", {
        method: "POST",
        json: {
          id: curso.id, nombre, categoria: categoria || null, estado: publicado ? "Publicado" : "No publicado",
          descripcion: descripcion || null,
          diasDisponibles: dias ? Number(dias) : null, certificadoId: certificadoId ? Number(certificadoId) : null,
          docenteIdentificacion: curso.docente_identificacion, docenteNombre: curso.docente_nombre,
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
      await apiFetch("/cursos-ligeros/upload-imagen.php", { method: "POST", body: form });
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
        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={!canEdit} className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
        <input value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={!canEdit} className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
      </div>
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
          <p className="text-[11px] text-slate-400">Los cursos publicados quedan disponibles para los estudiantes.</p>
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
export default function CursoLigeroDetailView({ curso, onBack, onUpdated }: { curso: CursoLigero; onBack: () => void; onUpdated: () => void }) {
  const { currentUser } = useCampusAuth();
  const canEditSettings = currentUser?.role === "super_admin";
  const [tab, setTab] = useState<TabKey>("contenido");

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a cursos
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{curso.nombre}</h2>
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
              <ContenidoEditor
                contentBase="/curso-ligero-contenido" questionsBase="/curso-ligero-preguntas" ownerIdKey="cursoLigeroId" ownerId={curso.id}
                addLabel="Agregar curso"
              />
            )}
            {tab === "anuncios" && <AnunciosTab cursoId={curso.id} />}
            {tab === "clases" && <ClasesTab cursoId={curso.id} />}
            {tab === "usuarios" && <UsuariosTab cursoId={curso.id} />}
            {tab === "ajustes" && <AjustesTab curso={curso} canEdit={canEditSettings} onUpdated={onUpdated} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
