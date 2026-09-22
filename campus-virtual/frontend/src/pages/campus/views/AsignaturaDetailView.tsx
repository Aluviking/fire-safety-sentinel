import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, BookOpen, Layers, Plus, Trash2, Loader2,
  Megaphone, Video, Settings, Upload, X, Check, UserCog,
} from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import ContenidoEditor from "../ContenidoEditor";
import { SearchableSelect } from "../SearchableSelect";

interface Programa { id: number; nombre: string }
interface DocenteAsignado { id: number; nombre: string }
export interface Asignatura {
  id: number;
  nombre: string;
  programas: Programa[];
  docentes: DocenteAsignado[];
  descripcion: string | null;
  imagen_path: string | null;
  publicado: number;
  dias_disponibles: number | null;
  certificado_id: number | null;
}
interface Anuncio { id: number; titulo: string; mensaje: string | null; importancia: string; created_at: string }
interface AulaRecurso { id: number; nombre: string }
interface Clase { id: number; titulo: string; aula_recurso_id: number | null; aula_nombre: string | null; fecha_inicio: string; fecha_fin: string | null }
interface Certificado { id: number; nombre: string }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const TABS = [
  { key: "contenido", label: "Contenido de la asignatura", icon: BookOpen },
  { key: "anuncios", label: "Anuncios", icon: Megaphone },
  { key: "clases", label: "Clases virtuales", icon: Video },
  { key: "programas", label: "Programas", icon: Layers },
  { key: "docentes", label: "Docentes", icon: UserCog },
  { key: "ajustes", label: "Ajustes", icon: Settings },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/* ── Anuncios ─────────────────────────────────────────────────────────────── */
function AnunciosTab({ asignaturaId }: { asignaturaId: number }) {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [importancia, setImportancia] = useState("Normal");

  const load = () => {
    setLoading(true);
    apiFetch<{ anuncios: Anuncio[] }>(`/asignatura-anuncios/list.php?asignaturaId=${asignaturaId}`)
      .then((d) => setItems(d.anuncios)).finally(() => setLoading(false));
  };
  useEffect(load, [asignaturaId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    await apiFetch("/asignatura-anuncios/create.php", { method: "POST", json: { asignaturaId, titulo: titulo.trim(), mensaje: mensaje || null, importancia } });
    setTitulo(""); setMensaje(""); setImportancia("Normal"); setCreating(false);
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/asignatura-anuncios/delete.php", { method: "POST", json: { id } });
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
function ClasesTab({ asignaturaId }: { asignaturaId: number }) {
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
      apiFetch<{ clases: Clase[] }>(`/asignatura-clases/list.php?asignaturaId=${asignaturaId}`),
      apiFetch<{ aulas: AulaRecurso[] }>("/aulas-recursos/list.php"),
    ]).then(([c, a]) => { setClases(c.clases); setAulas(a.aulas); }).finally(() => setLoading(false));
  };
  useEffect(load, [asignaturaId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInicio) return;
    await apiFetch("/asignatura-clases/create.php", {
      method: "POST",
      json: { asignaturaId, titulo: titulo.trim(), aulaRecursoId: aulaId ? Number(aulaId) : null, fechaInicio, fechaFin: fechaFin || null },
    });
    setTitulo(""); setAulaId(""); setFechaInicio(""); setFechaFin(""); setCreating(false);
    load();
  };

  const remove = async (id: number) => {
    await apiFetch("/asignatura-clases/delete.php", { method: "POST", json: { id } });
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
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Clase</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Aula</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Inicio</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">{c.titulo}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{c.aula_nombre ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{new Date(c.fecha_inicio).toLocaleString("es-CO")}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(c.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
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
function AjustesTab({ asignatura, canEdit, onUpdated }: { asignatura: Asignatura; canEdit: boolean; onUpdated: () => void }) {
  const [descripcion, setDescripcion] = useState(asignatura.descripcion ?? "");
  const [publicado, setPublicado] = useState(!!asignatura.publicado);
  const [dias, setDias] = useState(asignatura.dias_disponibles != null ? String(asignatura.dias_disponibles) : "");
  const [certificadoId, setCertificadoId] = useState(asignatura.certificado_id != null ? String(asignatura.certificado_id) : "");
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
    if (!asignatura.imagen_path) { setImgUrl(null); return; }
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/asignaturas/imagen.php?id=${asignatura.id}`).then((u) => { if (!cancelled) { objectUrl = u; setImgUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [asignatura.id, asignatura.imagen_path]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/asignaturas/update.php", {
        method: "POST",
        json: {
          id: asignatura.id, nombre: asignatura.nombre, descripcion: descripcion || null,
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
      form.append("id", String(asignatura.id));
      form.append("file", file);
      await apiFetch("/asignaturas/upload-imagen.php", { method: "POST", body: form });
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
        <label className="block text-sm font-semibold text-slate-700 mb-1">Imagen de la asignatura</label>
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
          <p className="text-[11px] text-slate-400">Las asignaturas publicadas quedan disponibles para los estudiantes matriculados.</p>
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
        <p className="text-xs text-slate-400">Solo el Super Admin puede editar los ajustes de la asignatura.</p>
      )}
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function AsignaturaDetailView({
  asignatura, onBack, onUpdated, initialTab = "contenido",
}: { asignatura: Asignatura; onBack: () => void; onUpdated: () => void; initialTab?: TabKey }) {
  const { currentUser } = useCampusAuth();
  const canEditSettings = currentUser?.role === "super_admin";
  const [tab, setTab] = useState<TabKey>(initialTab);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a asignaturas
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{asignatura.nombre}</h2>
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
              <ContenidoEditor contentBase="/asignatura-contenido" questionsBase="/asignatura-preguntas" ownerIdKey="asignaturaId" ownerId={asignatura.id} />
            )}
            {tab === "anuncios" && <AnunciosTab asignaturaId={asignatura.id} />}
            {tab === "clases" && <ClasesTab asignaturaId={asignatura.id} />}
            {tab === "programas" && (
              asignatura.programas.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Esta asignatura no está asociada a ningún programa.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {asignatura.programas.map((p) => (
                    <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
                      <Layers className="w-3.5 h-3.5 text-[#C41717]/50 shrink-0" />
                      <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
                    </div>
                  ))}
                </div>
              )
            )}
            {tab === "docentes" && (
              (asignatura.docentes ?? []).length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">
                  Esta asignatura aún no tiene docentes asignados — puedes agregarlos desde "Editar" en la lista de Asignaturas.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {(asignatura.docentes ?? []).map((d) => (
                    <div key={d.id} className="flex items-center gap-2.5 px-4 py-2.5">
                      <UserCog className="w-3.5 h-3.5 text-[#C41717]/50 shrink-0" />
                      <p className="text-sm font-medium text-slate-800">{d.nombre}</p>
                    </div>
                  ))}
                </div>
              )
            )}
            {tab === "ajustes" && <AjustesTab asignatura={asignatura} canEdit={canEditSettings} onUpdated={onUpdated} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
