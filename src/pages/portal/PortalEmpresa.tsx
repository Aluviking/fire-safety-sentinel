import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, FolderOpen, ChevronDown, Building2,
  Upload, Pencil, Lock, ShieldCheck, FileText, Download, Loader2, Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, apiDownload } from "@/lib/api";
import { ConfirmModal } from "./ConfirmModal";
import { PortalTopNav } from "./PortalTopNav";
import { FolderShell } from "./FolderShell";
import { PHVA, type LetraPhva } from "./phvaData";
import { DateWeatherWidget } from "./DateWeatherWidget";
import { AdSidebar } from "./AdSidebar";
import heroImage from "@/assets/hero-firefighter.jpg";

interface DocumentRow {
  id: number;
  original_filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by_name: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── Carpeta de documentos (grid item) ──────────────────────────────────── */
function FolderItem({
  name, index, color, canEdit, canUpload, canDelete, empresaId, phase, onOpen,
}: {
  name: string; index: number; color: string;
  canEdit: boolean; canUpload: boolean; canDelete: boolean;
  empresaId: string; phase: LetraPhva;
  onOpen: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<DocumentRow[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
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

      <FolderShell tabColor={color} tabLabel={docs && docs.length > 0 ? `${docs.length} doc.` : "Carpeta"}>
        <button
          onClick={handleToggle}
          className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left hover:bg-slate-50/70 transition-colors"
        >
          {open
            ? <FolderOpen className="w-4 h-4 shrink-0" style={{ color }} />
            : <Folder className="w-4 h-4 shrink-0 text-slate-400" />}
          <span className={`text-xs flex-1 min-w-0 truncate font-medium ${open ? "text-slate-800" : "text-slate-600"}`}>
            {name}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

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

                {(canEdit || canUpload) && (
                  <div className="flex items-center gap-2 mt-2">
                    {canUpload && (
                      <>
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
                      </>
                    )}
                    {canEdit && (
                      <button
                        className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg
                                   border border-slate-200 bg-white text-slate-600
                                   hover:border-[hsl(43_78%_50%/0.5)] hover:text-[hsl(43_78%_40%)] transition-all duration-150"
                      >
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                    )}
                  </div>
                )}

                {!canEdit && !canUpload && (
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
function PhvaTabs({ active, onSelect }: { active: LetraPhva; onSelect: (l: LetraPhva) => void }) {
  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
      {PHVA.map((item) => {
        const isActive = active === item.letra;
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
          </button>
        );
      })}
    </div>
  );
}

/* ─── Panel de la fase activa: descripción + grid de carpetas ─────────────── */
function PhvaActivePanel({
  item, canEdit, canUpload, canDelete, empresaId, onFolderOpen,
}: {
  item: typeof PHVA[number];
  canEdit: boolean; canUpload: boolean; canDelete: boolean;
  empresaId: string;
  onFolderOpen: (folder: string) => void;
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
          {item.carpetas.length} carpetas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-7 items-start">
        {item.carpetas.map((c, i) => (
          <FolderItem
            key={c} name={c} index={i} color={item.color}
            canEdit={canEdit} canUpload={canUpload} canDelete={canDelete}
            empresaId={empresaId} phase={item.letra as LetraPhva}
            onOpen={onFolderOpen}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalEmpresa() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, loading, companies, getPermission, permissions, addTrace } = useAuth();
  const navigate = useNavigate();
  const [activePhva, setActivePhva] = useState<LetraPhva>("P");
  const trackedRef = useRef(false);
  const phvaTrackedRef = useRef<string | null>(null);

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
                <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/10" />

                <DateWeatherWidget />

                <div className="relative z-10 p-6 flex items-end justify-between gap-4 flex-wrap w-full">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 bg-white/10 backdrop-blur-sm"
                      style={{ borderColor: heroColor + "80" }}
                    >
                      <Building2 className="w-5 h-5" style={{ color: heroColor }} />
                    </div>
                    <div>
                      <h1 className="font-semibold text-2xl text-white leading-tight">{company.nombre}</h1>
                      <p className="text-sm text-white/70 mt-0.5">NIT {company.nit} · {company.sector}</p>
                    </div>
                  </div>

                  {/* Permission badge for equipo */}
                  {isEquipo && (
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm
                      ${canEdit || canUpload
                        ? "text-amber-200 border-amber-300/50 bg-amber-500/20"
                        : "text-slate-200 border-white/20 bg-white/10"}`}>
                      {canEdit || canUpload ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {canEdit && canUpload ? "Editar & Subir" : canEdit ? "Solo editar" : canUpload ? "Solo subir" : "Solo lectura"}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Selector PHVA + panel activo */}
            <PhvaTabs active={activePhva} onSelect={setActivePhva} />

            <AnimatePresence mode="wait">
              <PhvaActivePanel
                key={activePhva}
                item={activeItem}
                canEdit={canEdit}
                canUpload={canUpload}
                canDelete={canDelete}
                empresaId={id as string}
                onFolderOpen={handleFolderOpen}
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
