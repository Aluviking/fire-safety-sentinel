import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Settings, Upload, ChevronRight, Loader2 } from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { useUrlState } from "../useUrlState";
// Carga diferida — ContenidoEditor trae adentro el visor de PDF (pdf.js,
// ~1.7MB) desde que se le quitó la dependencia de un Worker aparte. Si se
// importa de una, cada plantilla tiene que bajar y ejecutar ese bloque
// completo antes de poder mostrar nada, aunque nadie vaya a ver contenido.
const ContenidoEditor = lazy(() => import("../ContenidoEditor"));

interface Plantilla {
  id: number;
  nombre: string | null;
  asignatura_id: number | null;
  asignatura: string | null;
  fecha: string | null;
  estado: string;
  imagen_path: string | null;
  publicado_por_defecto: number;
}

const TABS = [
  { key: "contenido", label: "Contenido del curso", icon: BookOpen },
  { key: "ajustes", label: "Ajustes", icon: Settings },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/* ── Ajustes ──────────────────────────────────────────────────────────────── */
function AjustesTab({ plantilla, canEdit, onUpdated }: { plantilla: Plantilla; canEdit: boolean; onUpdated: () => void }) {
  const [publicadoPorDefecto, setPublicadoPorDefecto] = useState(!!plantilla.publicado_por_defecto);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!plantilla.imagen_path) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/plantillas/imagen.php?id=${plantilla.id}`).then((u) => { if (!cancelled) { objectUrl = u; setImgUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [plantilla.id, plantilla.imagen_path]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/plantillas/update.php", {
        method: "POST",
        json: {
          id: plantilla.id, nombre: plantilla.nombre, asignaturaId: plantilla.asignatura_id,
          fecha: plantilla.fecha, estado: plantilla.estado, publicadoPorDefecto,
        },
      });
      onUpdated();
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
      form.append("id", String(plantilla.id));
      form.append("file", file);
      await apiFetch("/plantillas/upload-imagen.php", { method: "POST", body: form });
      onUpdated();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60">
        <p className="text-sm font-semibold text-slate-700 mb-1">Imagen del curso</p>
        <p className="text-[11px] text-slate-400 mb-3">
          Cargue una imagen que permita identificar el curso. Recuerde que esta se podrá visualizar desde la cuenta de los estudiantes.
        </p>
        {imgUrl && <img src={imgUrl} alt="" className="w-full max-w-xs rounded-xl border border-slate-200 mb-3 object-cover aspect-video" />}
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/bmp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313] disabled:opacity-60">
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Subiendo..." : "Cargar archivo"}
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5">Formatos permitidos: JPG, JPEG, PNG, GIF, BMP</p>
          </>
        )}
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-700">Estado por defecto del curso</p>
          <p className="text-[11px] text-slate-400">
            Permite definir si el curso se encuentra listo. Los cursos publicados quedarán disponibles para que los estudiantes interactúen con todos los recursos.
          </p>
        </div>
        <button type="button" disabled={!canEdit} onClick={() => setPublicadoPorDefecto((v) => !v)}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 disabled:opacity-60 ${publicadoPorDefecto ? "bg-emerald-500" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${publicadoPorDefecto ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>
      {canEdit ? (
        <button onClick={save} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      ) : (
        <p className="text-xs text-slate-400">Solo el Super Admin puede editar los ajustes de la plantilla.</p>
      )}
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function PlantillaDetailView({ plantilla, onBack, onUpdated }: { plantilla: Plantilla; onBack: () => void; onUpdated: () => void }) {
  const { currentUser } = useCampusAuth();
  const canEditSettings = currentUser?.role === "super_admin";
  // La pestaña activa vive en la URL (?plantillaTab=...), no en useState —
  // así Ctrl+Shift+R te deja en la misma pestaña.
  const [tabParam, setTabParam] = useUrlState("plantillaTab", "contenido");
  const tab = (TABS.some((t) => t.key === tabParam) ? tabParam : "contenido") as TabKey;
  const setTab = (next: TabKey) => setTabParam(next);
  const titulo = plantilla.nombre || plantilla.asignatura || "Plantilla";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a plantillas
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{titulo}</h2>
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
                <ContenidoEditor contentBase="/plantilla-contenido" questionsBase="/plantilla-preguntas" ownerIdKey="plantillaId" ownerId={plantilla.id} />
              </Suspense>
            )}
            {tab === "ajustes" && <AjustesTab plantilla={plantilla} canEdit={canEditSettings} onUpdated={onUpdated} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
