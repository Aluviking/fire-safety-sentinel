import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, ChevronDown, Building2,
  Upload, Pencil, Lock, ShieldCheck, FileText, Download, Loader2, Trash2, Camera, Check, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, apiDownload, apiImage } from "@/lib/api";
import { ConfirmModal } from "./ConfirmModal";
import { PortalTopNav } from "./PortalTopNav";
import { FolderShell } from "./FolderShell";
import { PHVA, type LetraPhva } from "./phvaData";
import { DateWeatherWidget } from "./DateWeatherWidget";
import { AdSidebar } from "./AdSidebar";
import { HeroImageSlider } from "./HeroImageSlider";
import { DASHBOARD_BANNER_IMAGES } from "./heroBanners";

interface DocumentRow {
  id: number;
  original_filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by_name: string;
}

/* ─── Logo de la empresa en la cabecera (con fallback al ícono genérico) ──── */
function CompanyLogo({
  companyId, photoPath, color, editable,
}: { companyId: string; photoPath?: string | null; color: string; editable?: boolean }) {
  const { uploadCompanyPhoto } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photoPath) { setUrl(null); return; }
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/companies/photo.php?id=${encodeURIComponent(companyId)}`)
      .then((u) => {
        if (cancelled) { URL.revokeObjectURL(u); return; }
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => { if (!cancelled) setUrl(null); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [companyId, photoPath]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadCompanyPhoto(companyId, file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative shrink-0">
      <div
        className="w-12 h-12 rounded-2xl border flex items-center justify-center bg-white/10 backdrop-blur-sm overflow-hidden"
        style={{ borderColor: color + "80" }}
      >
        {url
          ? <img src={url} alt="" className="w-full h-full object-cover" />
          : <Building2 className="w-5 h-5" style={{ color }} />}
      </div>

      {editable && (
        <>
          <input
            ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
            className="hidden" onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white
                       flex items-center justify-center border-2 border-white hover:bg-slate-700
                       transition-colors disabled:opacity-70"
            title="Cambiar logo de la empresa"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-2.5 h-2.5" />}
          </button>
        </>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Carpeta de documentos (grid item) ──────────────────────────────────── */
function FolderItem({
  name, index, color, canEdit, canUpload, canDelete, empresaId, phase, onOpen,
  canManageFolder, onDeleteFolder, onRenameFolder,
}: {
  name: string; index: number; color: string;
  canEdit: boolean; canUpload: boolean; canDelete: boolean;
  empresaId: string; phase: LetraPhva;
  onOpen: (name: string) => void;
  canManageFolder?: boolean;
  onDeleteFolder?: () => void;
  onRenameFolder?: (newName: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
  const [pendingFolderDelete, setPendingFolderDelete] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [renameError, setRenameError] = useState("");
  const [savingRename, setSavingRename] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = async () => {
    try {
      const data = await apiFetch<{ documents: DocumentRow[] }>(
        `/documents/list.php?empresa_id=${encodeURIComponent(empresaId)}&phase=${phase}&folder=${encodeURIComponent(name)}`
      );
      setDocs(data.documents);
    } catch {
      setDocs([]);
    }
  };

  const handleToggle = () => {
    if (!open) {
      onOpen(name); // log on first open
      loadDocs();
    }
    setOpen(!open);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("empresa_id", empresaId);
      form.append("phase", phase);
      form.append("folder", name);
      await apiFetch("/documents/upload.php", { method: "POST", body: form });
      await loadDocs();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir el archivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (doc: DocumentRow) => {
    apiDownload(`/documents/download.php?id=${doc.id}`, doc.original_filename).catch(() => { /* best-effort */ });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await apiFetch("/documents/delete.php", { method: "POST", json: { id: pendingDelete.id } });
      await loadDocs();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al eliminar el archivo.");
    } finally {
      setPendingDelete(null);
    }
  };

  const submitRename = async () => {
    if (!onRenameFolder) return;
    if (!nameInput.trim() || nameInput.trim() === name) { setRenaming(false); setNameInput(name); return; }
    setSavingRename(true);
    setRenameError("");
    const res = await onRenameFolder(nameInput.trim());
    setSavingRename(false);
    if (!res.ok) { setRenameError(res.error ?? "Error."); return; }
    setRenaming(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <ConfirmModal
        open={!!pendingDelete}
        title="Eliminar archivo"
        message={`¿Eliminar "${pendingDelete?.original_filename}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmModal
        open={pendingFolderDelete}
        title="Eliminar carpeta"
        message={`¿Eliminar la carpeta "${name}"? Si tiene documentos subidos, quedarán ocultos hasta que recrees una carpeta con el mismo nombre.`}
        onConfirm={() => { onDeleteFolder?.(); setPendingFolderDelete(false); }}
        onCancel={() => setPendingFolderDelete(false)}
      />

      <FolderShell tabColor={color} tabLabel={docs && docs.length > 0 ? `${docs.length} doc.` : "Carpeta"}>
        {renaming ? (
          <div className="w-full flex items-center gap-2 px-3.5 py-2.5">
            <Folder className="w-4 h-4 shrink-0 text-slate-400" />
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") { setRenaming(false); setNameInput(name); } }}
              className="flex-1 min-w-0 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2 py-1
                         focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
            />
            <button
              onClick={submitRename} disabled={savingRename}
              className="shrink-0 text-emerald-600 hover:text-emerald-700 disabled:opacity-60" title="Guardar"
            >
              {savingRename ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setRenaming(false); setNameInput(name); setRenameError(""); }}
              className="shrink-0 text-slate-400 hover:text-slate-600" title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2.5 px-3.5 py-3 hover:bg-slate-50/70 transition-colors">
            <button onClick={handleToggle} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
              {open
                ? <FolderOpen className="w-4 h-4 shrink-0" style={{ color }} />
                : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
              <span className={`text-xs flex-1 min-w-0 truncate font-medium ${open ? "text-slate-800" : "text-slate-600"}`}>
                {name}
              </span>
            </button>
            {canManageFolder && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setNameInput(name); setRenaming(true); }}
                  className="shrink-0 text-slate-300 hover:text-[hsl(43_78%_45%)] transition-colors"
                  title="Editar carpeta"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPendingFolderDelete(true); }}
                  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                  title="Eliminar carpeta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button onClick={handleToggle}>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
        {renameError && <p className="text-[11px] text-red-500 px-3.5 pb-2">{renameError}</p>}

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100">
                {docs === null && (
                  <p className="text-xs text-slate-400 py-2 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Cargando documentos...
                  </p>
                )}

                {docs !== null && docs.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2 border-l-2 pl-2.5" style={{ borderColor: color + "60" }}>
                    Carpeta vacía, sin documentos aún.
                  </p>
                )}

                {docs !== null && docs.length > 0 && (
                  <ul className="space-y-1.5 py-1.5">
                    {docs.map((d) => (
                      <li key={d.id}
                          className="flex items-center gap-2 text-xs border-l-2 pl-2.5 py-1.5"
                          style={{ borderColor: color + "60" }}>
                        <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <button
                          onClick={() => handleDownload(d)}
                          className="flex-1 min-w-0 flex flex-col items-start text-left text-slate-700 hover:text-[hsl(43_78%_40%)] hover:underline"
                          title="Descargar"
                        >
                          <span className="w-full truncate">{d.original_filename}</span>
                          <span className="w-full truncate text-[10px] text-slate-400 no-underline">
                            {d.uploaded_by_name} · {new Date(d.uploaded_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </span>
                        </button>
                        <span className="text-slate-400 shrink-0 text-[10px]">{formatBytes(d.size_bytes)}</span>
                        <Download className="w-3 h-3 shrink-0 text-slate-300" />
                        {canDelete && (
                          <button
                            onClick={() => setPendingDelete(d)}
                            className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {uploadError && <p className="text-[11px] text-red-500 mt-1">{uploadError}</p>}

                {canUpload && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg
                                 border border-slate-200 bg-white text-slate-600
                                 hover:border-[hsl(43_78%_50%/0.5)] hover:text-[hsl(43_78%_40%)]
                                 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      {uploading
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Upload className="w-3 h-3" />}
                      {uploading ? "Subiendo..." : "Subir"}
                    </button>
                  </div>
                )}

                {!canUpload && (
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                    <Lock className="w-3 h-3" /> Solo lectura
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FolderShell>
    </motion.div>
  );
}

/* ─── Selector de fase PHVA (estilo "Day 1/2/3/4") ────────────────────────── */
function PhvaTabs({
  active, onSelect, percentByPhase,
}: { active: LetraPhva; onSelect: (l: LetraPhva) => void; percentByPhase: Record<LetraPhva, number> }) {
  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
      {PHVA.map((item) => {
        const isActive = active === item.letra;
        const percent = percentByPhase[item.letra as LetraPhva] ?? 0;
        return (
          <button
            key={item.letra}
            onClick={() => onSelect(item.letra as LetraPhva)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full border shrink-0 transition-all duration-200"
            style={{
              borderColor: isActive ? item.color : "#e2e8f0",
              background:  isActive ? item.color : "#fff",
            }}
          >
            <span className="font-display text-base leading-none" style={{ color: isActive ? "#fff" : item.color }}>
              {item.letra}
            </span>
            <span className="text-xs font-semibold" style={{ color: isActive ? "#fff" : "#64748b" }}>
              {item.nombre}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                color: isActive ? "#fff" : item.color,
                background: isActive ? "rgba(255,255,255,0.25)" : item.bg,
              }}
            >
              {percent}%
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Tile para crear una carpeta personalizada en la fase activa ─────────── */
function AddFolderTile({ color, onCreate }: { color: string; onCreate: (name: string) => Promise<{ ok: boolean; error?: string }> }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Escribe un nombre."); return; }
    setSubmitting(true);
    setError("");
    const res = await onCreate(name.trim());
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error."); return; }
    setName("");
    setAdding(false);
  };

  if (!adding) {
    return (
      <FolderShell dashed tabColor="" tabLabel="Nueva carpeta" onClick={() => setAdding(true)} className="min-h-[80px]" />
    );
  }

  return (
    <div className="mt-[10px] bg-white rounded-2xl border border-amber-300 shadow-sm p-3.5">
      <form onSubmit={submit} className="space-y-2">
        <input
          value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Nombre de la carpeta"
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
        />
        {error && <p className="text-[11px] text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit" disabled={submitting}
            className="flex-1 text-xs font-semibold text-white rounded-lg py-1.5
                       disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            style={{ background: color }}
          >
            {submitting ? "Creando..." : "Crear"}
          </button>
          <button
            type="button" onClick={() => { setAdding(false); setName(""); setError(""); }}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Panel de la fase activa: descripción + grid de carpetas ─────────────── */
function PhvaActivePanel({
  item, canEdit, canUpload, canDelete, empresaId, onFolderOpen,
  isAdmin, folders, onCreateFolder, onDeleteFolder, onRenameFolder,
}: {
  item: typeof PHVA[number];
  canEdit: boolean; canUpload: boolean; canDelete: boolean;
  empresaId: string;
  onFolderOpen: (folder: string) => void;
  isAdmin: boolean;
  folders: { id: number; folder_name: string }[];
  onCreateFolder: (name: string) => Promise<{ ok: boolean; error?: string }>;
  onDeleteFolder: (id: number) => void;
  onRenameFolder: (id: number, newName: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
    >
      <div
        className="rounded-2xl p-5 mb-7 flex items-center gap-5 flex-wrap"
        style={{ background: item.bg, border: `1px solid ${item.border}` }}
      >
        <span className="font-display text-5xl leading-none shrink-0" style={{ color: item.color }}>
          {item.letra}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-lg" style={{ color: item.color }}>{item.nombre}</p>
          <p className="text-sm text-slate-600 mt-0.5">{item.desc}</p>
        </div>
        <span
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-white"
          style={{ color: item.color }}
        >
          {folders.length} carpetas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7 items-start">
        {folders.map((f, i) => (
          <FolderItem
            key={f.id} name={f.folder_name} index={i} color={item.color}
            canEdit={canEdit} canUpload={canUpload} canDelete={canDelete}
            empresaId={empresaId} phase={item.letra as LetraPhva}
            onOpen={onFolderOpen}
            canManageFolder={isAdmin}
            onDeleteFolder={() => onDeleteFolder(f.id)}
            onRenameFolder={(newName) => onRenameFolder(f.id, newName)}
          />
        ))}
        {isAdmin && <AddFolderTile color={item.color} onCreate={onCreateFolder} />}
      </div>
    </motion.div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalEmpresa() {
  const { id } = useParams<{ id: string }>();
  const {
    currentUser, loading, companies, getPermission, permissions, addTrace,
    progressByPhase, progressTotalByPhase, loadProgress,
  } = useAuth();
  const navigate = useNavigate();
  const [activePhva, setActivePhva] = useState<LetraPhva>("P");
  const [folders, setFolders] = useState<{ id: number; phva_phase: string; folder_name: string }[]>([]);
  const trackedRef = useRef(false);
  const phvaTrackedRef = useRef<string | null>(null);

  const loadFolders = async () => {
    if (!id) return;
    try {
      const data = await apiFetch<{ folders: { id: number; phva_phase: string; folder_name: string }[] }>(
        `/folders/list.php?empresa_id=${encodeURIComponent(id)}`
      );
      setFolders(data.folders);
    } catch {
      setFolders([]);
    }
  };

  useEffect(() => {
    loadFolders();
    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateFolder = async (phase: LetraPhva, name: string) => {
    try {
      await apiFetch("/folders/create.php", { method: "POST", json: { empresa_id: id, phase, folder_name: name } });
      await loadFolders();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await apiFetch("/folders/delete.php", { method: "POST", json: { id: folderId } });
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      loadProgress();
    } catch { /* best-effort */ }
  };

  const handleRenameFolder = async (folderId: number, newName: string) => {
    try {
      await apiFetch("/folders/update.php", { method: "POST", json: { id: folderId, folder_name: newName } });
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, folder_name: newName } : f)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  useEffect(() => {
    if (loading) return; // esperar a que /auth/me.php resuelva antes de decidir
    if (!currentUser) { navigate("/portal", { replace: true }); return; }

    // Log visit once per mount
    if (!trackedRef.current && id) {
      trackedRef.current = true;
      const co = companies.find((c) => c.id === id);
      addTrace({
        action:   "view_empresa",
        empresaId: id,
        detail:   `Accedió a ${co?.nombre ?? id}`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading, navigate, id]);

  useEffect(() => {
    if (loading || !currentUser || !id) return;
    if (phvaTrackedRef.current === activePhva) return;
    phvaTrackedRef.current = activePhva;
    const co = companies.find((c) => c.id === id);
    addTrace({
      action:   "view_phva",
      empresaId: id,
      detail:   `Fase ${activePhva} · ${co?.nombre ?? id}`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhva, currentUser, loading, id]);

  if (loading) return null;

  const company = companies.find((c) => c.id === id);

  if (!company) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 mb-3">Empresa no encontrada.</p>
        <button onClick={() => navigate("/portal/dashboard")}
          className="text-[hsl(43_78%_40%)] hover:underline text-sm font-medium">
          ← Volver al dashboard
        </button>
      </div>
    </div>
  );

  /* ── Permission resolution ── */
  const isAdmin  = currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const isEquipo = currentUser?.role === "equipo";

  const equipoPerm = isEquipo && id
    ? getPermission(currentUser!.id, id)
    : undefined;

  const canEdit   = isAdmin || (isEquipo && !!equipoPerm?.canEdit);
  const canUpload = isAdmin || (isEquipo && !!equipoPerm?.canUpload)
    || (currentUser?.role === "cliente" && permissions.some((p) => p.empresaId === id && p.clienteCanUpload));
  // Eliminar archivos es exclusivo de Admin/Super Admin — Equipo con "Editar"
  // sigue viendo el botón de "Editar carpeta", pero no puede borrar nada.
  const canDelete = isAdmin;

  const handleFolderOpen = (folder: string) => {
    if (!currentUser || !id) return;
    addTrace({
      action:   "view_folder",
      empresaId: id,
      detail:   `${folder} · ${company.nombre}`,
    });
  };

  const activeItem = PHVA.find((p) => p.letra === activePhva)!;
  const sectorColor: Record<string, string> = {
    Financiero: "#b45309", Construcción: "#c2410c", Logística: "#0369a1",
    Tecnología: "#7c3aed", Comercio:    "#059669",  Minería:   "#92400e",
    Alimentos:  "#166534", Salud:       "#be123c",
  };
  const heroColor = sectorColor[company.sector] ?? "#b45309";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      <PortalTopNav
        crumbs={
          currentUser?.role !== "cliente"
            ? [{ label: "Empresas", onClick: () => navigate("/portal/dashboard") }, { label: company.nombre }]
            : [{ label: company.nombre }]
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            {/* Company hero */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-8"
            >
              <div className="relative rounded-3xl overflow-hidden min-h-[180px] flex items-end
                              shadow-sm border border-slate-200">
                <HeroImageSlider images={DASHBOARD_BANNER_IMAGES} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/10" />

                <div className="relative z-10 p-6 flex items-end justify-between gap-4 flex-wrap w-full">
                  <div className="flex items-center gap-4 min-w-0">
                    <CompanyLogo companyId={company.id} photoPath={company.photo} color={heroColor} editable={isAdmin} />
                    <div className="min-w-0">
                      <h1 className="font-semibold text-2xl text-white leading-tight truncate">{company.nombre}</h1>
                      <p className="text-sm text-white/70 mt-0.5 truncate">NIT {company.nit} · {company.sector}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Permission badge for equipo */}
                    {isEquipo && (
                      <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm whitespace-nowrap
                        ${canEdit || canUpload
                          ? "text-amber-200 border-amber-300/50 bg-amber-500/20"
                          : "text-slate-200 border-white/20 bg-white/10"}`}>
                        {canEdit || canUpload ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {canEdit && canUpload ? "Editar & Subir" : canEdit ? "Solo editar" : canUpload ? "Solo subir" : "Solo lectura"}
                      </span>
                    )}
                    <DateWeatherWidget />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selector PHVA + panel activo */}
            <PhvaTabs
              active={activePhva}
              onSelect={setActivePhva}
              percentByPhase={Object.fromEntries(PHVA.map((p) => {
                const total = progressTotalByPhase[id as string]?.[p.letra] ?? 0;
                const done = progressByPhase[id as string]?.[p.letra] ?? 0;
                return [p.letra, total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0];
              })) as Record<LetraPhva, number>}
            />

            <AnimatePresence mode="wait">
              <PhvaActivePanel
                key={activePhva}
                item={activeItem}
                canEdit={canEdit}
                canUpload={canUpload}
                canDelete={canDelete}
                empresaId={id as string}
                onFolderOpen={handleFolderOpen}
                isAdmin={isAdmin}
                folders={folders.filter((f) => f.phva_phase === activePhva)}
                onCreateFolder={(name) => handleCreateFolder(activePhva, name)}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
              />
            </AnimatePresence>
          </div>

          {/* Publicidad — solo Cliente y Equipo */}
          {(currentUser?.role === "cliente" || isEquipo) && <AdSidebar />}
        </div>
      </main>
    </div>
  );
}
