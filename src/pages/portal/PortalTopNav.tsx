import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronRight, ShieldCheck, Building2, Users, Shield, ScrollText, Megaphone, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import sisoLogo from "@/assets/siso-logo.png";
import { ChangeMyPasswordModal } from "./ChangeMyPasswordModal";

interface Crumb {
  label: string;
  onClick?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
}

/** Nav de módulos compartido por las páginas del panel admin (páginas reales con URL propia). */
export const PORTAL_NAV_ITEMS: NavItem[] = [
  { label: "Empresas",  icon: Building2,  to: "/portal/dashboard" },
  { label: "Usuarios",  icon: Users,      to: "/portal/dashboard/usuarios" },
  { label: "Permisos",  icon: Shield,     to: "/portal/dashboard/permisos" },
  { label: "Historial", icon: ScrollText, to: "/portal/dashboard/historial" },
  { label: "Publicidad", icon: Megaphone, to: "/portal/dashboard/publicidad" },
];

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  equipo: "Equipo",
  cliente: "Cliente",
};

/** Navbar en píldora oscura compartida por las páginas autenticadas del Portal Empresarial. */
export function PortalTopNav({ crumbs, navItems }: { crumbs: Crumb[]; navItems?: NavItem[] }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [changingPassword, setChangingPassword] = useState(false);

  return (
    <div className="sticky top-0 z-40 px-3 sm:px-6 pt-4 pb-3 bg-slate-50/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-2">
        <div
          className="flex items-center justify-between gap-3
                     bg-slate-900 rounded-full pl-2 pr-2 sm:pr-3 py-2
                     shadow-[0_8px_28px_rgba(15,23,42,0.35)] border border-slate-800"
        >
          {/* Logo + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={sisoLogo}
              alt="SISO"
              className="w-8 h-8 rounded-full object-cover glow-gold-sm shrink-0"
            />
            <div className="flex items-center gap-1.5 min-w-0 text-sm">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  {c.onClick ? (
                    <button
                      onClick={c.onClick}
                      className="text-slate-400 hover:text-[hsl(43_78%_60%)] transition-colors truncate font-medium"
                    >
                      {c.label}
                    </button>
                  ) : (
                    <span
                      className={`truncate font-semibold ${
                        i === crumbs.length - 1 ? "text-[hsl(43_78%_62%)]" : "text-slate-300"
                      }`}
                    >
                      {c.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Role badge + user + logout */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser && currentUser.role !== "cliente" && (
              <span
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest
                           text-[hsl(43_78%_65%)] border border-[hsl(43_78%_50%/0.35)] bg-[hsl(43_78%_50%/0.12)]
                           px-2.5 py-1 rounded-full"
              >
                <ShieldCheck className="w-3 h-3" /> {ROLE_LABEL[currentUser.role]}
              </span>
            )}
            <span className="hidden md:block text-sm text-slate-300 font-medium whitespace-nowrap">
              {currentUser?.nombre}
            </span>
            <button
              onClick={() => setChangingPassword(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400
                         hover:text-[hsl(43_78%_65%)] hover:bg-[hsl(43_78%_50%/0.12)] transition-all"
              title="Cambiar mi contraseña"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={() => { logout(); navigate("/portal"); }}
              className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400
                         hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Salir"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav de módulos — páginas reales con URL propia */}
        {navItems && (
          <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold
                              shrink-0 transition-all duration-150
                              ${active
                                ? "bg-slate-900 text-[hsl(43_78%_65%)]"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <ChangeMyPasswordModal open={changingPassword} onClose={() => setChangingPassword(false)} />
    </div>
  );
}
