import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, X, Star, Upload, FileText, Download, Eye } from "lucide-react";
import { apiFetch, apiImage, apiDownload } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { ConfirmModal } from "../ConfirmModal";

interface Certificado {
  id: number;
  nombre: string;
  predeterminado: number;
  tiene_imagen: number;
  extension: string | null;
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp"];

/* ── Miniatura: imagen se muestra directo; PDF/Word muestran un ícono con
   acción de ver (PDF, en pestaña nueva) o descargar (Word, no se puede ver
   embebido en el navegador) ── */
function CertThumb({ cert }: { cert: Certificado }) {
  const [url, setUrl] = useState<string | null>(null);
  const isImage = IMAGE_EXT.includes(cert.extension ?? "");

  useEffect(() => {
    if (!isImage) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/certificados/image.php?id=${cert.id}`)
      .then((u) => { if (!cancelled) { objectUrl = u; setUrl(u); } else URL.revokeObjectURL(u); })
      .catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [cert.id, isImage]);

  const handleView = async () => {
    try {
      const objectUrl = await apiImage(`/certificados/image.php?id=${cert.id}`);
      window.open(objectUrl, "_blank");
    } catch {
      window.alert("No se pudo abrir el archivo.");
    }
  };

  const handleDownload = async () => {
    try {
      await apiDownload(`/certificados/image.php?id=${cert.id}`, `${cert.nombre}.${cert.extension}`);
    } catch {
      window.alert("No se pudo descargar el archivo.");
    }
  };

  if (isImage) {
    if (!url) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
    return <img src={url} alt="" className="w-full h-full object-cover" />;
  }

  const isPdf = cert.extension === "pdf";
  return (
    <button
      type="button"
      onClick={isPdf ? handleView : handleDownload}
      className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 transition-colors"
    >
      <FileText className="w-8 h-8 text-slate-400" />
      <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-400">
        {isPdf ? <Eye className="w-3 h-3" /> : <Download className="w-3 h-3" />}
        {cert.extension} · {isPdf ? "Ver" : "Descargar"}
      </span>
    </button>
  );
}

/* ── Modal de creación (nombre + archivo) ─────────────────────────────────── */
function CrearCertificadoModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [nombre, setNombre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const close = () => { setNombre(""); setFile(null); setError(""); setSubmitting(false); onClose(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    if (!file) { setError("Selecciona un archivo para el certificado."); return; }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("nombre", nombre.trim());
      form.append("file", file);
      await apiFetch("/certificados/create.php", { method: "POST", body: form });
      onCreated();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el certificado.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
            <form onSubmit={submit} className="p-5">
              <h3 className="font-semibold text-slate-800 text-[15px] mb-3">Crear certificado</h3>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del certificado"
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 mb-2.5
                           focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10" />
              <input
                ref={fileRef} type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden"
              />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed
                           border-slate-300 text-slate-500 hover:border-[#C41717]/40 hover:text-[#C41717] transition-colors text-sm">
                <Upload className="w-4 h-4" /> {file ? file.name : "Seleccionar imagen, PDF o Word"}
              </button>
              {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
              <div className="flex items-center gap-2.5 mt-4">
                <button type="button" onClick={close} className="flex-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl py-2.5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 text-sm font-bold rounded-xl py-2.5 bg-[#C41717] hover:bg-[#B01313] text-white
                             shadow-[0_4px_14px_rgba(196,23,23,0.3)] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {submitting ? "Subiendo..." : "Crear"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function CertificadosView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Certificado | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ certificados: Certificado[] }>("/certificados/list.php")
      .then((data) => setCertificados(data.certificados))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleDefault = async (c: Certificado) => {
    try {
      await apiFetch("/certificados/update.php", { method: "POST", json: { id: c.id, nombre: c.nombre, predeterminado: !c.predeterminado } });
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al actualizar.");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/certificados/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el certificado.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Certificados</h1>
          <p className="text-slate-500 text-xs mt-0.5">Diseños de certificado disponibles. Nuevo, sin datos importados de Q10.</p>
        </div>
        {(currentUser?.role === "admin" || isSuperAdmin) && (
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold
                       shadow-[0_2px_12px_rgba(196,23,23,0.25)] transition-all">
            <Plus className="w-3.5 h-3.5" /> Crear certificado
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-8">{error}</p>
      ) : certificados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 text-sm">
          Aún no hay certificados creados.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {certificados.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group relative">
              {isSuperAdmin && (
                <button onClick={() => setDeleting(c)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 border border-slate-200 text-slate-400
                             hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors shadow-sm"
                  title="Eliminar">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              {c.predeterminado ? (
                <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  <Star className="w-2.5 h-2.5 fill-white" /> Predeterminado
                </span>
              ) : isSuperAdmin && (
                <button onClick={() => toggleDefault(c)}
                  className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2 py-0.5
                             rounded-full bg-white/90 border border-slate-200 text-slate-500 hover:text-emerald-600 text-[10px] font-semibold transition-all"
                  title="Marcar como predeterminado">
                  <Star className="w-2.5 h-2.5" /> Predeterminado
                </button>
              )}
              <div className="w-full aspect-[4/3] bg-slate-50">
                {c.tiene_imagen ? <CertThumb cert={c} /> : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Sin archivo</div>
                )}
              </div>
              <p className="px-3 py-2.5 text-xs font-medium text-slate-700 truncate">{c.nombre}</p>
            </div>
          ))}
        </div>
      )}

      <CrearCertificadoModal open={creating} onClose={() => setCreating(false)} onCreated={load} />
      <ConfirmModal
        open={!!deleting}
        title="Eliminar certificado"
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
