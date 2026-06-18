import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, LogOut, ShieldCheck, ChevronRight,
  Users, Shield, ScrollText, ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/context/AuthContext";
import sisoLogo from "@/assets/siso-logo.png";

/* ─── Company data ───────────────────────────────────────────────────────────── */
export const COMPANIES = [
  { id: "1", nombre: "Inversiones Caribe S.A.S",      nit: "900.123.456-7", sector: "Financiero"   },
  { id: "2", nombre: "Constructora Andina LTDA",       nit: "800.456.789-3", sector: "Construcción" },
  { id: "3", nombre: "LogiCarga Express",              nit: "901.234.567-1", sector: "Logística"    },
  { id: "4", nombre: "TechSoluciones Colombia",        nit: "830.987.654-2", sector: "Tecnología"   },
  { id: "5", nombre: "Distribuidora El Progreso",      nit: "800.765.432-8", sector: "Comercio"     },
  { id: "6", nombre: "Minería Sur Andina S.A.",        nit: "900.321.654-5", sector: "Minería"      },
  { id: "7", nombre: "Alimentos Saludables del Valle", nit: "830.654.321-0", sector: "Alimentos"    },
  { id: "8", nombre: "Grupo Hospitalario del Norte",   nit: "891.000.234-9", sector: "Salud"        },
];

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

/* ─── Company card ───────────────────────────────────────────────────────────── */
function CompanyCard({ company, index }: { company: typeof COMPANIES[0]; index: number }) {
  const navigate = useNavigate();
  const color    = SECTOR_COLOR[company.sector] ?? "#b45309";
  const bg       = SECTOR_BG[company.sector]    ?? "#fef3c7";
  const initials = company.nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.045, ease: "easeOut" }}
      onClick={() => navigate(`/portal/empresa/${company.id}`)}
      className="group cursor-pointer bg-white rounded-xl border border-slate-200
                 hover:border-[hsl(43_78%_50%/0.55)] shadow-sm hover:shadow-md
                 transition-all duration-200 flex items-center overflow-hidden"
    >
      {/* Left accent bar */}
      <div className="w-1 self-stretch shrink-0" style={{ background: color }} />

      {/* Avatar */}
      <div
        className="ml-4 my-4 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                   text-sm font-bold select-none"
        style={{ background: bg, color }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 px-3.5 py-4">
        <p className="font-semibold text-slate-800 text-sm leading-snug truncate
                      group-hover:text-[hsl(43_78%_36%)] transition-colors duration-200">
          {company.nombre}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">NIT {company.nit}</p>
        <div className="flex items-center gap-2 mt-2.5">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ color, background: bg }}
          >
            {company.sector}
          </span>
          <div className="flex gap-0.5 ml-0.5">
            {["P", "H", "V", "A"].map((l) => (
              <span
                key={l}
                className="w-5 h-5 rounded flex items-center justify-center
                           text-[10px] font-bold text-slate-400 bg-slate-100
                           group-hover:bg-amber-50 group-hover:text-amber-700
                           transition-colors duration-200"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="w-4 h-4 shrink-0 mr-4 text-slate-300
                   group-hover:text-[hsl(43_78%_50%)] group-hover:translate-x-0.5
                   transition-all duration-200"
      />
    </motion.div>
  );
}

/* ─── Admin panel — tab: Usuarios ─────────────────────────────────────────── */
function TabUsuarios() {
  const { users, changeRole, assignEmpresa } = useAuth();

  return (
    <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
      {users.map((u) => (
        <div key={u.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 shrink-0
                            flex items-center justify-center">
              <span className="text-xs font-bold text-amber-700">{u.nombre[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
              <p className="text-xs text-slate-400 truncate">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value as "admin" | "equipo" | "cliente")}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                         text-slate-700 cursor-pointer focus:outline-none shrink-0
                         focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
            >
              <option value="cliente">Cliente</option>
              <option value="equipo">Equipo</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Empresa assignment for cliente role */}
          {u.role === "cliente" && (
            <div className="mt-2 flex items-center gap-2 pl-[42px]">
              <span className="text-[11px] text-slate-500 shrink-0">Empresa:</span>
              <select
                value={u.empresaId ?? ""}
                onChange={(e) => assignEmpresa(u.id, e.target.value || undefined)}
                className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1
                           text-slate-700 cursor-pointer focus:outline-none flex-1
                           focus:border-[hsl(43_78%_45%)]"
              >
                <option value="">— Sin asignar —</option>
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Admin panel — tab: Permisos ─────────────────────────────────────────── */
function TabPermisos() {
  const { users, permissions, upsertPermission, currentUser } = useAuth();
  const equipoUsers = users.filter((u) => u.role === "equipo");
  const [open, setOpen] = useState<string | null>(null);

  const getPerm = (equipoUserId: string, empresaId: string): Permission | undefined =>
    permissions.find((p) => p.equipoUserId === equipoUserId && p.empresaId === empresaId);

  const toggle = (
    equipoUserId: string,
    empresaId: string,
    field: "canEdit" | "canUpload" | "clienteCanUpload",
    current: boolean
  ) => {
    const existing = getPerm(equipoUserId, empresaId);
    upsertPermission({
      equipoUserId,
      empresaId,
      canEdit:           field === "canEdit"           ? !current : (existing?.canEdit           ?? false),
      canUpload:         field === "canUpload"         ? !current : (existing?.canUpload         ?? false),
      clienteCanUpload:  field === "clienteCanUpload"  ? !current : (existing?.clienteCanUpload  ?? false),
      grantedBy: currentUser?.id ?? "admin-001",
    });
  };

  if (equipoUsers.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-slate-400">
        No hay usuarios con rol Equipo aún.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
      {equipoUsers.map((u) => (
        <div key={u.id}>
          <button
            onClick={() => setOpen(open === u.id ? null : u.id)}
            className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 shrink-0
                            flex items-center justify-center">
              <span className="text-xs font-bold text-blue-700">{u.nombre[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0
                          ${open === u.id ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {open === u.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 border-t border-slate-100 px-3 py-2">
                  {/* Legend */}
                  <div className="flex items-center gap-1 px-1 pb-1.5 text-[10px] text-slate-400">
                    <span className="w-[120px] shrink-0">Empresa</span>
                    <span className="w-[46px] text-center shrink-0">Editar</span>
                    <span className="w-[46px] text-center shrink-0">Subir</span>
                    <span className="w-[46px] text-center shrink-0 leading-tight">Cliente<br/>Sube</span>
                  </div>
                  {COMPANIES.map((c) => {
                    const p = getPerm(u.id, c.id);
                    return (
                      <div key={c.id} className="flex items-center gap-1 py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-[11px] text-slate-700 w-[120px] shrink-0 truncate">{c.nombre}</span>
                        {(["canEdit", "canUpload", "clienteCanUpload"] as const).map((field) => (
                          <div key={field} className="w-[46px] flex justify-center shrink-0">
                            <button
                              onClick={() => toggle(u.id, c.id, field, p?.[field] ?? false)}
                              className={`w-8 h-4 rounded-full transition-colors duration-200 relative
                                ${p?.[field] ? "bg-amber-400" : "bg-slate-300"}`}
                            >
                              <span
                                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200
                                  ${p?.[field] ? "left-[18px]" : "left-0.5"}`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ─── Admin panel — tab: Auditoría ────────────────────────────────────────── */
function TabAuditoria() {
  const { trace } = useAuth();

  const actionLabel: Record<string, string> = {
    view_empresa:  "Visitó empresa",
    view_phva:     "Abrió fase PHVA",
    view_folder:   "Abrió carpeta",
    upload_file:   "Subió archivo",
    edit_folder:   "Editó carpeta",
    role_change:   "Cambió rol",
    perm_change:   "Cambió permiso",
  };

  const actionColor: Record<string, string> = {
    view_empresa: "bg-blue-100 text-blue-700",
    view_phva:    "bg-slate-100 text-slate-600",
    view_folder:  "bg-slate-100 text-slate-600",
    upload_file:  "bg-green-100 text-green-700",
    edit_folder:  "bg-amber-100 text-amber-700",
    role_change:  "bg-purple-100 text-purple-700",
    perm_change:  "bg-orange-100 text-orange-700",
  };

  if (trace.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-slate-400">
        Sin registros aún.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
      {trace.map((t) => (
        <div key={t.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
          <div className="flex items-start gap-2">
            <span
              className={`mt-0.5 shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                ${actionColor[t.action] ?? "bg-slate-100 text-slate-600"}`}
            >
              {actionLabel[t.action] ?? t.action}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 mt-1 truncate">{t.userName}</p>
          {t.detail && (
            <p className="text-[11px] text-slate-400 truncate">{t.detail}</p>
          )}
          <p className="text-[10px] text-slate-400 mt-0.5">
            {new Date(t.timestamp).toLocaleString("es-CO", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Admin panel container ──────────────────────────────────────────────── */
type AdminTab = "usuarios" | "permisos" | "auditoria";

const ADMIN_TABS: { id: AdminTab; label: string; Icon: React.ElementType }[] = [
  { id: "usuarios",   label: "Usuarios",  Icon: Users      },
  { id: "permisos",   label: "Permisos",  Icon: Shield     },
  { id: "auditoria",  label: "Auditoría", Icon: ScrollText },
];

function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("usuarios");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        </div>
        <h2 className="font-semibold text-slate-800 text-sm">Panel de Administración</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {ADMIN_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold
                        transition-colors duration-150
                        ${tab === id
                          ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/40"
                          : "text-slate-500 hover:text-slate-700"}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {tab === "usuarios"  && <TabUsuarios />}
          {tab === "permisos"  && <TabPermisos />}
          {tab === "auditoria" && <TabAuditoria />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── No empresa assigned (cliente without assignment) ──────────────────── */
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
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    // Redirect cliente directly to their assigned empresa
    if (currentUser.role === "cliente" && currentUser.empresaId) {
      navigate(`/portal/empresa/${currentUser.empresaId}`, { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  // Cliente without empresa assignment
  if (currentUser.role === "cliente" && !currentUser.empresaId) {
    return <NoEmpresaAssigned />;
  }

  // While redirecting cliente to empresa
  if (currentUser.role === "cliente") return null;

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={sisoLogo} alt="SISO"
              className="w-9 h-9 rounded-full border-2 border-[hsl(43_78%_50%/0.6)] shadow-sm" />
            <div className="leading-none">
              <span className="font-display tracking-[0.14em] text-gradient-gold text-lg">SISO</span>
              <span className="hidden sm:inline text-slate-400 mx-2 text-sm">·</span>
              <span className="hidden sm:inline text-sm text-slate-500">Portal Empresarial</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
                               text-amber-700 border border-amber-300 bg-amber-50 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </span>
            )}
            {currentUser.role === "equipo" && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
                               text-blue-700 border border-blue-300 bg-blue-50 px-3 py-1 rounded-full">
                Equipo
              </span>
            )}
            <span className="hidden md:block text-sm text-slate-600 font-medium">{currentUser.nombre}</span>
            <button
              onClick={() => { logout(); navigate("/portal"); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600
                         px-3 py-2 rounded-xl hover:bg-red-50 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-7"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
            <h1 className="font-display text-2xl tracking-[0.06em] text-gradient-gold">Empresas</h1>
          </div>
          <p className="text-sm text-slate-500 ml-[42px]">
            {isAdmin
              ? "Gestiona empresas, usuarios y permisos del SG-SST."
              : "Selecciona una empresa para gestionar su ciclo PHVA."}
          </p>
        </motion.div>

        <div className={`flex gap-6 items-start ${isAdmin ? "flex-col xl:flex-row" : ""}`}>
          {/* Cards grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {COMPANIES.map((c, i) => (
              <CompanyCard key={c.id} company={c} index={i} />
            ))}
          </div>

          {/* Admin panel */}
          {isAdmin && (
            <div className="w-full xl:w-[380px] shrink-0">
              <AdminPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
