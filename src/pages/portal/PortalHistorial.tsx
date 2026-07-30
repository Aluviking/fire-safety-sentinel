import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ScrollText, Eye, FolderOpen, Upload, Trash2, Pencil,
  Users, Shield, UserPlus, Building2, UserMinus, ImageIcon, Megaphone, FolderPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { TraceEntry } from "@/context/AuthContext";
import { PortalTopNav, PORTAL_NAV_ITEMS } from "./PortalTopNav";

const ACTION_LABEL: Record<string, string> = {
  view_empresa:  "Visitó empresa",
  view_phva:     "Abrió fase PHVA",
  view_folder:   "Abrió carpeta",
  upload_file:   "Subió archivo",
  delete_file:   "Eliminó archivo",
  edit_folder:   "Editó carpeta",
  role_change:   "Cambió rol",
  perm_change:   "Cambió permiso",
  user_create:   "Creó usuario",
  company_create: "Creó empresa",
  user_delete:   "Eliminó usuario",
  company_delete: "Eliminó empresa",
  avatar_update: "Actualizó foto de perfil",
  ad_update: "Actualizó publicidad",
  company_update: "Editó empresa",
  company_photo_update: "Cambió foto de empresa",
  folder_create: "Creó carpeta",
  folder_delete: "Eliminó carpeta",
};

const ACTION_ACCENT: Record<string, string> = {
  view_empresa: "#2563eb", view_phva: "#64748b", view_folder: "#64748b",
  upload_file: "#16a34a", delete_file: "#dc2626", edit_folder: "#d97706",
  role_change: "#9333ea", perm_change: "#ea580c", user_create: "#0d9488",
  company_create: "#4f46e5", user_delete: "#dc2626", company_delete: "#dc2626",
  avatar_update: "#0891b2", ad_update: "#c026d3",
  company_update: "#d97706", company_photo_update: "#0891b2",
  folder_create: "#0d9488", folder_delete: "#dc2626",
};

const ACTION_ICON: Record<string, React.ElementType> = {
  view_empresa: Eye, view_phva: ScrollText, view_folder: FolderOpen,
  upload_file: Upload, delete_file: Trash2, edit_folder: Pencil,
  role_change: Users, perm_change: Shield, user_create: UserPlus,
  company_create: Building2, user_delete: UserMinus, company_delete: Trash2,
  avatar_update: ImageIcon, ad_update: Megaphone,
  company_update: Pencil, company_photo_update: ImageIcon,
  folder_create: FolderPlus, folder_delete: Trash2,
};

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function groupByDay(trace: TraceEntry[]): { label: string; items: TraceEntry[] }[] {
  const groups: { label: string; items: TraceEntry[] }[] = [];
  for (const t of trace) {
    const label = dayLabel(t.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(t);
    else groups.push({ label, items: [t] });
  }
  return groups;
}

export default function PortalHistorial() {
  const { currentUser, loading, trace } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    if (!isAdmin) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, loading, navigate]);

  const groups = useMemo(() => groupByDay(trace), [trace]);

  if (loading || !currentUser) return null;
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
      <PortalTopNav crumbs={[{ label: "Portal Empresarial" }]} navItems={PORTAL_NAV_ITEMS} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <ScrollText className="w-4 h-4 text-amber-700" />
          </div>
          <h1 className="font-display text-2xl tracking-[0.04em] text-gradient-gold">HISTORIAL</h1>
        </div>
        <p className="text-sm text-slate-500 ml-[42px] mb-6">
          Historial de movimientos: toda la actividad reciente en el Portal.
        </p>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Actividad</h2>
            <span className="text-xs font-bold text-slate-500">{trace.length}</span>
          </div>

          <div className="p-6">
            {trace.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">Sin registros aún.</p>
            ) : (
              <div className="space-y-6 max-h-[640px] overflow-y-auto pr-1">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.items.map((t) => {
                        const Icon = ACTION_ICON[t.action] ?? ScrollText;
                        const accent = ACTION_ACCENT[t.action] ?? "#94a3b8";
                        return (
                          <div key={t.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: accent + "0d" }}>
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: accent + "22", color: accent }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold" style={{ color: accent }}>
                                  {ACTION_LABEL[t.action] ?? t.action}
                                </p>
                                <p className="text-[10px] text-slate-500 shrink-0">
                                  {new Date(t.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <p className="text-xs font-medium text-slate-700 truncate mt-0.5">{t.userName}</p>
                              {t.detail && <p className="text-[11px] text-slate-500 truncate">{t.detail}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
