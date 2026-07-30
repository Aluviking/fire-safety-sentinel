import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ShieldCheck, ChevronRight, Users, ScrollText, Trash2, AlertCircle,
  Pencil, Camera, Loader2, X,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/context/AuthContext";
import type { Company, User, TraceEntry } from "@/context/AuthContext";
import { ConfirmModal } from "./ConfirmModal";
import { PortalTopNav, PORTAL_NAV_ITEMS } from "./PortalTopNav";
import { FolderShell } from "./FolderShell";
import { PHVA_TOTAL_FOLDERS } from "./phvaData";
import { DateWeatherWidget } from "./DateWeatherWidget";
import { HeroImageSlider } from "./HeroImageSlider";
import { DASHBOARD_BANNER_IMAGES } from "./heroBanners";

const SECTOR_COLOR: Record<string, string> = {
  Financiero: "#b45309", Construcción: "#c2410c", Logística: "#0369a1",
  Tecnología: "#7c3aed", Comercio:    "#059669",  Minería:   "#92400e",
  Alimentos:  "#166534", Salud:       "#be123c",
};
const SECTOR_BG: Record<string, string> = {
  Financiero: "#fef3c7", Construcción: "#fff7ed", Logística: "#e0f2fe",
  Tecnología: "#f5f3ff", Comercio:    "#d1fae5",  Minería:   "#fef3c7",
  Alimentos:  "#dcfce7", Salud:       "#ffe4e6",
};

/* ─── Hero card — foto de marca + saludo ─────────────────────────────────── */
function HeroCard({ isAdmin }: { isAdmin: boolean }) {
  const { currentUser } = useAuth();
  const roleLabel = currentUser?.role === "super_admin" ? "Super Admin"
    : currentUser?.role === "admin" ? "Admin" : "Equipo";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-3xl overflow-hidden min-h-[220px] h-full flex items-end
                 shadow-sm border border-slate-200"
    >
      <HeroImageSlider images={DASHBOARD_BANNER_IMAGES} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/45 to-slate-900/5" />

      <div className="relative z-10 p-6 flex items-end justify-between gap-4 flex-wrap w-full">
        <div className="min-w-0">
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                              text-[hsl(43_78%_70%)] bg-white/10 border border-white/25 backdrop-blur-sm
                              px-2.5 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3 h-3" /> {roleLabel}
            </span>
          )}
          <h1 className="font-display text-3xl text-white leading-tight truncate">
            Bienvenido, {currentUser?.nombre}
          </h1>
          <p className="text-white/80 text-sm mt-1 truncate">Gestión SG-SST · Portal Empresarial SISO</p>
        </div>
        <DateWeatherWidget />
      </div>
    </motion.div>
  );
}

/* ─── Stat pill pequeño ───────────────────────────────────────────────────── */
function QuickStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-amber-700" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── Contenedor de módulo reutilizable ───────────────────────────────────── */
function ModuleCard({
  icon: Icon, title, action, children,
}: { icon: React.ElementType; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-amber-700" />
          </div>
          <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

/* ─── Distribución de roles (dona real, sin datos inventados) ────────────── */
function RoleDonut({ users }: { users: User[] }) {
  const data = useMemo(() => {
    const counts = { Admin: 0, Equipo: 0, Cliente: 0 };
    users.forEach((u) => {
      if (u.role === "admin" || u.role === "super_admin") counts.Admin++;
      else if (u.role === "equipo") counts.Equipo++;
      else counts.Cliente++;
    });
    return [
      { name: "Admin",   value: counts.Admin,   color: "#b45309" },
      { name: "Equipo",  value: counts.Equipo,  color: "#0369a1" },
      { name: "Cliente", value: counts.Cliente, color: "#059669" },
    ].filter((d) => d.value > 0);
  }, [users]);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-6">Sin usuarios aún.</p>;
  }

  // Con una sola categoría, paddingAngle > 0 deja un hueco visible en el anillo
  // (se ve "roto"). Solo se aplica el espaciado entre porciones cuando hay 2+.
  const padding = data.length > 1 ? 3 : 0;

  return (
    <div className="flex items-center gap-5">
      <div className="w-[96px] h-[96px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={30} outerRadius={46} paddingAngle={padding} strokeWidth={0}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-slate-700 font-medium">{d.name}</span>
            <span className="text-slate-500">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Actividad de los últimos 7 días (real, agrupada desde `trace`) ──────── */
function WeeklyActivityChart({ trace }: { trace: TraceEntry[] }) {
  const data = useMemo(() => {
    const labels = ["D", "L", "M", "M", "J", "V", "S"];
    const today = new Date();
    const out: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const count = trace.filter((t) => new Date(t.timestamp).toDateString() === d.toDateString()).length;
      out.push({ day: labels[d.getDay()], count });
    }
    return out;
  }, [trace]);

  return (
    <div className="h-[110px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
          <Bar dataKey="count" radius={[6, 6, 6, 6]} fill="hsl(43 78% 50%)" maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Modal para editar nombre y NIT de una empresa ──────────────────────── */
function EditCompanyModal({
  company, onClose,
}: { company: { id: string; nombre: string; nit: string } | null; onClose: () => void }) {
  const { updateCompany } = useAuth();
  const [nombre, setNombre] = useState(company?.nombre ?? "");
  const [nit, setNit] = useState(company?.nit ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNombre(company?.nombre ?? "");
    setNit(company?.nit ?? "");
    setError("");
  }, [company]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !nit.trim()) { setError("Completa nombre y NIT."); return; }
    setSubmitting(true);
    setError("");
    const res = await updateCompany(company!.id, { nombre: nombre.trim(), nit: nit.trim() });
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error."); return; }
    onClose();
  };

  return (
    <AnimatePresence>
      {company && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl
                         shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-semibold text-slate-800 text-[15px]">Editar empresa</h3>
                  <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={submit} className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">Nombre de la empresa</label>
                    <input
                      value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 mt-1
                                 focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">NIT</label>
                    <input
                      value={nit} onChange={(e) => setNit(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 mt-1
                                 focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                    />
                  </div>
                  {error && <p className="text-[11px] text-red-500">{error}</p>}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button" onClick={onClose}
                      className="flex-1 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100
                                 rounded-xl py-2.5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit" disabled={submitting}
                      className="flex-1 text-sm font-bold rounded-xl py-2.5 transition-all active:scale-[0.97]
                                 bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_14px_rgba(217,119,6,0.35)]
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Carpeta de empresa ──────────────────────────────────────────────────── */
function CompanyFolder({
  company, canDelete, isAdmin, onDelete, onEdit, progressPercent,
}: {
  company: Company; canDelete: boolean; isAdmin: boolean;
  onDelete: () => void; onEdit: () => void; progressPercent: number;
}) {
  const navigate = useNavigate();
  const { uploadCompanyPhoto } = useAuth();
  const color = SECTOR_COLOR[company.sector] ?? "#b45309";
  const bg    = SECTOR_BG[company.sector]    ?? "#fef3c7";
  const initials = company.nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await uploadCompanyPhoto(company.id, file);
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  return (
    <FolderShell tabColor={color} tabLabel={company.sector} onClick={() => navigate(`/portal/empresa/${company.id}`)}>
      <div className="p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: bg, color }}
          >
            {initials}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <input
                ref={photoInputRef} type="file" accept="image/png,image/jpeg,image/webp"
                className="hidden" onChange={handlePhotoChange}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => { e.stopPropagation(); photoInputRef.current?.click(); }}
                disabled={uploadingPhoto}
                className="text-slate-300 hover:text-[hsl(43_78%_45%)] transition-colors disabled:opacity-60"
                title="Cambiar foto de fondo"
              >
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="text-slate-300 hover:text-[hsl(43_78%_45%)] transition-colors"
                title="Editar nombre y NIT"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Eliminar empresa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        <p className="font-semibold text-slate-800 text-sm mt-3 leading-snug truncate
                      group-hover:text-[hsl(43_78%_36%)] transition-colors duration-200">
          {company.nombre}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">NIT {company.nit}</p>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
            <span>Avance PHVA</span>
            <span style={{ color }}>{progressPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: color }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-0.5">
            {["P", "H", "V", "A"].map((l) => (
              <span
                key={l}
                className="w-5 h-5 rounded-full flex items-center justify-center
                           text-[10px] font-bold text-slate-500 bg-slate-100
                           group-hover:bg-amber-50 group-hover:text-amber-700
                           transition-colors duration-200"
              >
                {l}
              </span>
            ))}
          </div>
          <ChevronRight
            className="w-4 h-4 shrink-0 text-slate-400
                       group-hover:text-[hsl(43_78%_50%)] group-hover:translate-x-0.5
                       transition-all duration-200"
          />
        </div>
      </div>
    </FolderShell>
  );
}

/* ─── Sección Empresas: grid de carpetas + crear/eliminar ─────────────────── */
function EmpresasSection() {
  const { currentUser, companies, createCompany, deleteCompany, progress, loadProgress } = useAuth();
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  // Refresca el avance cada vez que se visita el Dashboard (ej. al volver de
  // subir documentos en una empresa), no solo al iniciar sesión.
  useEffect(() => { loadProgress(); }, [loadProgress]);

  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [nit, setNit] = useState("");
  const [sector, setSector] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null);
  const [editingCompany, setEditingCompany] = useState<{ id: string; nombre: string; nit: string } | null>(null);

  const reset = () => { setNombre(""); setNit(""); setSector(""); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !nit.trim() || !sector.trim()) {
      setError("Completa nombre, NIT y sector.");
      return;
    }
    setSubmitting(true);
    const res = await createCompany({ nombre, nit, sector });
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error."); return; }
    reset();
    setCreating(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deleteCompany(pendingDelete.id);
    setPendingDelete(null);
    if (!res.ok) window.alert(res.error ?? "Error al eliminar la empresa.");
  };

  return (
    <section className="mb-12">
      <ConfirmModal
        open={!!pendingDelete}
        title="Eliminar empresa"
        message={`¿Eliminar la empresa "${pendingDelete?.nombre}"? Esto también borra todos sus documentos y permisos. No se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <EditCompanyModal company={editingCompany} onClose={() => setEditingCompany(null)} />

      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-amber-700" />
          </div>
          <h2 className="font-display text-2xl tracking-[0.04em] text-gradient-gold">EMPRESAS</h2>
        </div>
        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-sm
                          px-3 py-1.5 rounded-full">
          {companies.length} {companies.length === 1 ? "empresa" : "empresas"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
        {companies.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <CompanyFolder
              company={c}
              canDelete={isAdmin}
              isAdmin={isAdmin}
              onDelete={() => setPendingDelete({ id: c.id, nombre: c.nombre })}
              onEdit={() => setEditingCompany({ id: c.id, nombre: c.nombre, nit: c.nit })}
              progressPercent={Math.min(100, Math.round(((progress[c.id] ?? 0) / PHVA_TOTAL_FOLDERS) * 100))}
            />
          </motion.div>
        ))}

        {isAdmin && (
          creating ? (
            <div className="mt-[10px] bg-white rounded-2xl border border-amber-300 shadow-sm p-4">
              <form onSubmit={submit} className="space-y-2">
                <input
                  value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la empresa"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5
                             focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                />
                <input
                  value={nit} onChange={(e) => setNit(e.target.value)} placeholder="NIT"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5
                             focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                />
                <input
                  value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Sector"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5
                             focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                />
                {error && <p className="text-[11px] text-red-500">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5
                               disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "Creando..." : "Crear"}
                  </button>
                  <button
                    type="button" onClick={() => { setCreating(false); reset(); }}
                    className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <FolderShell dashed tabColor="" tabLabel="Nueva empresa" onClick={() => setCreating(true)} />
          )
        )}
      </div>
    </section>
  );
}

/* ─── No empresa assigned (cliente sin asignación) ───────────────────────── */
function NoEmpresaAssigned() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200
                        flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="font-semibold text-slate-800 text-lg mb-2">Empresa pendiente</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Tu cuenta aún no tiene una empresa asignada.<br />
          Contacta al administrador para que la configure.
        </p>
        <button
          onClick={() => { logout(); navigate("/portal"); }}
          className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium"
        >
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function PortalDashboard() {
  const { currentUser, loading, companies, users, trace } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // esperar a que /auth/me.php resuelva antes de decidir
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    // Redirect cliente directly to their assigned empresa
    if (currentUser.role === "cliente" && currentUser.empresaId) {
      navigate(`/portal/empresa/${currentUser.empresaId}`, { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) return null;

  // Cliente without empresa assignment
  if (currentUser.role === "cliente" && !currentUser.empresaId) {
    return <NoEmpresaAssigned />;
  }

  // While redirecting cliente to empresa
  if (currentUser.role === "cliente") return null;

  const isSuperAdmin = currentUser.role === "super_admin";
  const isAdmin = currentUser.role === "admin" || isSuperAdmin;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      <PortalTopNav crumbs={[{ label: "Portal Empresarial" }]} navItems={isAdmin ? PORTAL_NAV_ITEMS : undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero + stats rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <HeroCard isAdmin={isAdmin} />
          </div>
          <div className="grid grid-rows-2 gap-4">
            <QuickStat
              icon={Building2}
              label={companies.length === 1 ? "Empresa" : "Empresas"}
              value={companies.length}
            />
            {isAdmin ? (
              <QuickStat
                icon={Users}
                label={users.length === 1 ? "Usuario" : "Usuarios"}
                value={users.length}
              />
            ) : (
              <QuickStat icon={ShieldCheck} label="Tu rol" value="Equipo" />
            )}
          </div>
        </div>

        {/* Visualizaciones reales — solo admin, solo si hay datos */}
        {isAdmin && (users.length > 0 || trace.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <ModuleCard icon={Users} title="Distribución de roles">
              <RoleDonut users={users} />
            </ModuleCard>
            <ModuleCard icon={ScrollText} title="Actividad · últimos 7 días">
              <WeeklyActivityChart trace={trace} />
            </ModuleCard>
          </div>
        )}

        <EmpresasSection />
      </main>
    </div>
  );
}
