import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import {
  Search, Bell, HelpCircle, ChevronDown, LogOut, Menu, X,
  Users, BookOpen, GraduationCap, DollarSign, FileText,
  Calendar, Award, ClipboardList, UserCheck, Building,
  ChevronRight, LayoutDashboard, AlertCircle, Briefcase,
  Shield, TrendingUp, Clock, UserCog,
} from "lucide-react";
import { useCampusAuth, type CampusUser } from "@/context/CampusAuthContext";
import RegistrarEstudianteModal from "./RegistrarEstudianteModal";
import RegistrarPersonalModal from "./RegistrarPersonalModal";
import RegistrarCodeudorModal from "./RegistrarCodeudorModal";
import InformacionBasicaView from "./views/InformacionBasicaView";
import PersonalInfoView from "./views/PersonalInfoView";
import UsuariosView from "./views/UsuariosView";
import CreditosView from "./views/CreditosView";
import PagosView from "./views/PagosView";
import NotasCreditoView from "./views/NotasCreditoView";
import CodeudoresInfoView from "./views/CodeudoresInfoView";
import ProgramasView from "./views/ProgramasView";
import AsignaturasView from "./views/AsignaturasView";
import CursosView from "./views/CursosView";
import EvaluacionesView from "./views/EvaluacionesView";

/* ── GFO Academy Logo ─────────────────────────────────────────────────────── */
const GFOLogoSmall = ({ className }: { className?: string }) => (
  <div
    className={`rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 ${className ?? ""}`}
    style={{ padding: "4px 10px" }}
  >
    <img src={gfoLogo} alt="GFO Academy" className="h-7 w-auto object-contain" />
  </div>
);

/* ── Navigation config ────────────────────────────────────────────────────── */
interface SubItem {
  label: string;
  icon?: React.ElementType;
  subs?: string[];
}
interface NavItem {
  label: string;
  icon: React.ElementType;
  subs?: SubItem[];
}

// Estructura definida por el cliente (2026-08-04) — solo lo que pidió +
// lo que se sumó tras cruzar contra el backup real (ver Fase 1: Matrículas
// queda integrada dentro de "Información básica" de Estudiantes, no como
// menú aparte).
const NAV_ITEMS: NavItem[] = [
  {
    label: "Institucional",
    icon: Building,
    subs: [
      { label: "Estudiantes",      icon: GraduationCap, subs: ["Registrar estudiante", "Información básica"] },
      { label: "Docentes",         icon: UserCheck,      subs: ["Registrar docente", "Información básica"] },
      { label: "Administrativos",  icon: Briefcase,      subs: ["Registrar administrativo", "Información básica"] },
    ],
  },
  {
    label: "Académico",
    icon: BookOpen,
    subs: [
      { label: "Evaluaciones", icon: ClipboardList },
      { label: "Educación virtual", icon: BookOpen },
      {
        label: "Estructuración", icon: LayoutDashboard,
        subs: [
          "Crear programa", "Crear curso", "Asignaturas",
          "Parámetros de constancias y certificados",
        ],
      },
    ],
  },
  {
    label: "Tesorería",
    icon: DollarSign,
    subs: [
      { label: "Créditos", icon: FileText },
      { label: "Pagos",    icon: DollarSign },
      { label: "Otros Ingresos", icon: TrendingUp },
      { label: "Egresos",        icon: DollarSign },
      { label: "Codeudores",     icon: Users,         subs: ["Registrar codeudor", "Información básica"] },
      { label: "Administrar notas crédito", icon: FileText },
      { label: "Adaptaciones",   icon: ClipboardList, subs: ["Importar pagos"] },
      {
        label: "Estructuración", icon: LayoutDashboard,
        subs: ["Impuestos", "Productos", "Descuentos", "Cuentas", "Terceros", "Formas de pago"],
      },
    ],
  },
  {
    label: "Informes", icon: FileText,
    subs: [
      { label: "Consolidado de notas", icon: ClipboardList },
      { label: "Cartera general",      icon: FileText },
      { label: "Gestión financiera",   icon: DollarSign },
    ],
  },
  { label: "Usuarios", icon: UserCog },
];

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  docente: "Docente",
  administrativo: "Administrativo",
  estudiante: "Estudiante",
  equipo: "Equipo",
};

/* ── Quick-access cards ───────────────────────────────────────────────────── */
const QUICK_ACCESS = [
  { icon: GraduationCap, label: "Estudiantes",   color: "#1E40AF", nav: "Institucional", sub: "Estudiantes"     },
  { icon: UserCheck,     label: "Docentes",       color: "#065F46", nav: "Institucional", sub: "Docentes"        },
  { icon: Briefcase,     label: "Administrativos", color: "#92400E", nav: "Institucional", sub: "Administrativos" },
  { icon: ClipboardList, label: "Evaluaciones",   color: "#6B21A8", nav: "Académico",     sub: "Evaluaciones"    },
  { icon: BookOpen,      label: "Ed. Virtual",    color: "#9F1239", nav: "Académico",     sub: "Educación virtual" },
  { icon: DollarSign,    label: "Tesorería",      color: "#1E3A5F", nav: "Tesorería",     sub: "Otros Ingresos"  },
  { icon: FileText,      label: "Informes",       color: "#374151", nav: "Informes",      sub: "Consolidado de notas" },
  { icon: UserCog,       label: "Usuarios",       color: "#14532D", nav: "Usuarios",      sub: ""                },
];

/* ── NavDropdown (tema claro) ─────────────────────────────────────────────── */
function NavDropdown({
  item, isOpen, onToggle, onSelect,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (nav: string, sub: string) => void;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) { onToggle(); setHoveredSub(null); }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onToggle]);

  const openFlyout  = (label: string) => { if (timerRef.current) clearTimeout(timerRef.current); setHoveredSub(label); };
  const closeFlyout = () => { timerRef.current = setTimeout(() => setHoveredSub(null), 140); };
  const keepFlyout  = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isOpen
                      ? "bg-[#C41717]/10 text-[#C41717]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#C41717]" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && item.subs && item.subs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 w-60 rounded-xl
                       bg-white border border-slate-200
                       shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50"
          >
            <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
            <div className="py-1.5">
              {item.subs.map((sub) => {
                const Icon    = sub.icon;
                const hasSubs = sub.subs && sub.subs.length > 0;
                const isHov   = hoveredSub === sub.label;
                return (
                  <div
                    key={sub.label}
                    className="relative"
                    onMouseEnter={() => openFlyout(sub.label)}
                    onMouseLeave={closeFlyout}
                  >
                    <button
                      onClick={() => {
                        if (!hasSubs) { onSelect(item.label, sub.label); onToggle(); setHoveredSub(null); }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                  transition-colors duration-100 text-left group
                                  ${isHov ? "bg-slate-50 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
                    >
                      {Icon && (
                        <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors
                                          ${isHov ? "text-[#C41717]" : "text-slate-400 group-hover:text-[#C41717]"}`} />
                      )}
                      <span className="flex-1">{sub.label}</span>
                      {hasSubs && (
                        <ChevronRight className={`w-3 h-3 shrink-0 ${isHov ? "text-slate-500" : "text-slate-300"}`} />
                      )}
                    </button>

                    {/* 3er nivel flyout */}
                    {hasSubs && isHov && (
                      <div
                        className="absolute left-full top-0 w-64 rounded-xl
                                   bg-white border border-slate-200
                                   shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50"
                        onMouseEnter={keepFlyout}
                        onMouseLeave={closeFlyout}
                      >
                        <div className="h-[3px] rounded-t-xl bg-gradient-to-r from-[#C41717]/70 to-transparent" />
                        <div className="py-1.5">
                          <p className="px-4 pt-2 pb-1.5 text-[10px] font-bold text-[#C41717]/70 tracking-[0.18em] uppercase">
                            {sub.label}
                          </p>
                          {sub.subs!.map((s3) => (
                            <button
                              key={s3}
                              onClick={() => { onSelect(item.label, `${sub.label} › ${s3}`); onToggle(); setHoveredSub(null); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2
                                         text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50
                                         transition-colors text-left"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C41717]/35 shrink-0" />
                              {s3}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Module placeholder ───────────────────────────────────────────────────── */
function ModulePlaceholder({ nav, sub }: { nav: string; sub: string }) {
  const title = sub || nav;
  return (
    <motion.div
      key={`${nav}-${sub}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#C41717]/8 border border-[#C41717]/20
                      flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-[#C41717]/60" />
      </div>
      <h2 className="text-slate-800 font-bold text-xl mb-2">{title}</h2>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
        Este módulo está siendo construido. Pronto estará disponible con toda la funcionalidad de{" "}
        <span className="text-[#C41717] font-semibold">{nav}</span>.
      </p>
      <div className="mt-6 flex items-center gap-2 text-[#C41717]/70 text-xs font-medium
                      bg-[#C41717]/[0.06] border border-[#C41717]/15 rounded-full px-4 py-2">
        <Clock className="w-3.5 h-3.5" />
        En construcción · GFO Academy
      </div>
    </motion.div>
  );
}

/* ── Dashboard Home ───────────────────────────────────────────────────────── */
function DashboardHome({ user, onNavigate }: { user: CampusUser; onNavigate: (nav: string, sub: string) => void }) {
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* Banner de bienvenida */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-50/60 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">{greeting},</p>
            <h1 className="text-slate-900 font-bold text-2xl sm:text-3xl leading-tight">{user.nombre}</h1>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full
                             bg-[#C41717]/10 border border-[#C41717]/20 text-[#C41717]
                             text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C41717] animate-pulse" />
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Cursos",     value: "3", icon: BookOpen      },
              { label: "Pendientes", value: "5", icon: ClipboardList },
              { label: "Mensajes",   value: "2", icon: Bell          },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}
                   className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl
                              px-4 py-3 border border-slate-200 min-w-[72px]">
                <Icon className="w-4 h-4 text-[#C41717]/55" />
                <span className="text-slate-800 font-bold text-xl leading-none">{value}</span>
                <span className="text-slate-400 text-[10px] tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acceso rápido */}
      <div>
        <h2 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-200" />
          Acceso rápido
          <span className="h-px flex-1 bg-slate-200" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACCESS.map(({ icon: Icon, label, color, nav, sub }) => (
            <button
              key={label}
              onClick={() => onNavigate(nav, sub)}
              className="group flex flex-col items-center gap-3 py-5 rounded-2xl
                         bg-white border border-slate-200 shadow-sm
                         hover:shadow-md hover:border-slate-300
                         transition-all duration-200 text-center"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center
                           transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
              >
                <Icon className="w-5 h-5" style={{ color: `${color}cc` }} />
              </div>
              <span className="text-slate-600 group-hover:text-slate-900 text-xs font-medium transition-colors leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Anuncios + Actividades */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C41717]/60" />
            <h3 className="text-slate-700 text-sm font-semibold">Anuncios recientes</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { title: "Inicio de semestre 2026-I",        date: "Hoy",    type: "info"   },
              { title: "Actualización plataforma virtual",  date: "Ayer",   type: "update" },
              { title: "Programas HSE disponibles",         date: "15 Jun", type: "new"    },
              { title: "Certificaciones disponibles",       date: "12 Jun", type: "cert"   },
            ].map(({ title, date, type }) => (
              <div key={title} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0
                                 ${type === "info"   ? "bg-blue-400"
                                 : type === "update" ? "bg-amber-400"
                                 : type === "new"    ? "bg-emerald-400"
                                                     : "bg-[#C41717]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm leading-snug">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C41717]/60" />
            <h3 className="text-slate-700 text-sm font-semibold">Próximas actividades</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { title: "Evaluación SST Módulo 3",      time: "Hoy 10:00 AM",   badge: "Evaluación" },
              { title: "Seminario Gestión del Riesgo", time: "Mañana 8:00 AM", badge: "Seminario"  },
              { title: "Entrega Proyecto Final",        time: "23 Jun",         badge: "Tarea"      },
              { title: "Clausura Semestre",             time: "30 Jun",         badge: "Evento"     },
            ].map(({ title, time, badge }) => (
              <div key={title} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center shrink-0 w-10">
                  <span className="text-[#C41717]/70 text-[10px] font-bold">{time.split(" ")[0]}</span>
                  <span className="text-slate-400 text-[9px]">{time.split(" ").slice(1).join(" ")}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 text-sm leading-snug">{title}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100
                                   text-slate-500 text-[10px] font-medium">
                    {badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Programas destacados */}
      <div>
        <h2 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-200" />
          Programas destacados
          <span className="h-px flex-1 bg-slate-200" />
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Shield,    label: "ISO 45001 · SST",       hrs: "40h", lvl: "Intermedio" },
            { icon: Award,     label: "Gestión del Riesgo",     hrs: "32h", lvl: "Avanzado"   },
            { icon: Briefcase, label: "PESV · Seguridad Vial",  hrs: "24h", lvl: "Básico"     },
          ].map(({ icon: Icon, label, hrs, lvl }) => (
            <div key={label}
                 className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm
                            px-4 py-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/15
                              flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#C41717]/65" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 text-sm font-medium leading-snug truncate">{label}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-slate-400 text-[11px]">{hrs}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400 text-[11px]">{lvl}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#C41717]/50 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ══ MAIN COMPONENT ═════════════════════════════════════════════════════════ */
export default function CampusDashboard() {
  const navigate = useNavigate();
  const { currentUser: user, loading, logout: authLogout } = useCampusAuth();
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav]     = useState<{ nav: string; sub: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal]             = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [loading, user, navigate]);

  const logout = () => { authLogout(); navigate("/", { replace: true }); };

  const handleNavigate = (nav: string, sub: string) => {
    // Modales específicos por acción
    if (sub === "Estudiantes › Registrar estudiante") {
      setModal("registrar-estudiante");
      setOpenMenu(null);
      return;
    }
    if (sub === "Docentes › Registrar docente") {
      setModal("registrar-docente");
      setOpenMenu(null);
      return;
    }
    if (sub === "Administrativos › Registrar administrativo") {
      setModal("registrar-administrativo");
      setOpenMenu(null);
      return;
    }
    if (sub === "Codeudores › Registrar codeudor") {
      setModal("registrar-codeudor");
      setOpenMenu(null);
      return;
    }
    setActiveNav({ nav, sub });
    setMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const toggleMenu = (label: string) => setOpenMenu((prev) => (prev === label ? null : label));

  if (loading || !user) return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  /* Acceso restringido */
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#C41717]/8 border border-[#C41717]/20
                          flex items-center justify-center mb-5 mx-auto">
            <Shield className="w-6 h-6 text-[#C41717]/60" />
          </div>
          <h1 className="text-slate-800 font-bold text-xl mb-2">Acceso restringido</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Este panel está disponible únicamente para{" "}
            <span className="text-[#C41717] font-semibold">Administradores</span>{" "}
            de GFO Academy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={logout}
              className="flex-1 px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313]
                         text-white text-sm font-semibold transition-all shadow-sm"
            >
              Cerrar sesión
            </button>
            <a href="/"
              className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300
                         text-slate-600 hover:text-slate-800 text-sm transition-all text-center">
              Volver al sitio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F1F5F9] flex flex-col">

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14">

          {/* Logo */}
          <button onClick={() => setActiveNav(null)} className="shrink-0">
            <GFOLogoSmall />
          </button>

          <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

          {/* Búsqueda */}
          <div className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar módulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg
                         pl-9 pr-4 py-2 text-slate-800 text-sm placeholder:text-slate-400
                         focus:outline-none focus:border-[#C41717]/40 focus:bg-white transition-all"
            />
          </div>

          {/* Nav escritorio */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {NAV_ITEMS.map((item) =>
              item.subs && item.subs.length > 0 ? (
                <NavDropdown
                  key={item.label}
                  item={item}
                  isOpen={openMenu === item.label}
                  onToggle={() => toggleMenu(item.label)}
                  onSelect={handleNavigate}
                />
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.label, "")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                              ${activeNav?.nav === item.label
                                ? "bg-[#C41717]/10 text-[#C41717]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C41717]" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#C41717]/15 border border-[#C41717]/30
                              flex items-center justify-center shrink-0">
                <span className="text-[#C41717] text-xs font-bold leading-none">{user.nombre.charAt(0)}</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-slate-700 text-xs font-semibold leading-tight">{user.nombre.split(" ")[0]}</span>
                <span className="text-slate-400 text-[10px] leading-tight">{ROLE_LABEL[user.role] ?? user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    <button
                      onClick={() => { if (!item.subs?.length) handleNavigate(item.label, ""); else toggleMenu(item.label); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 text-[#C41717]/50" />
                        {item.label}
                      </div>
                      {item.subs && item.subs.length > 0 && (
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openMenu === item.label ? "rotate-180" : ""}`} />
                      )}
                    </button>

                    {openMenu === item.label && item.subs && (
                      <div className="ml-4 mt-0.5 pl-3 border-l border-slate-200 space-y-0.5">
                        {item.subs.map((sub) => (
                          <div key={sub.label}>
                            <button
                              onClick={() => {
                                if (sub.subs?.length) setOpenMenu(openMenu === `${item.label}__${sub.label}` ? item.label : `${item.label}__${sub.label}`);
                                else handleNavigate(item.label, sub.label);
                              }}
                              className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg
                                         text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-sm transition-all"
                            >
                              {sub.label}
                              {sub.subs && sub.subs.length > 0 && <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />}
                            </button>
                            {openMenu === `${item.label}__${sub.label}` && sub.subs && (
                              <div className="ml-3 pl-3 border-l border-slate-100 space-y-0.5">
                                {sub.subs.map((s3) => (
                                  <button
                                    key={s3}
                                    onClick={() => handleNavigate(item.label, `${sub.label} › ${s3}`)}
                                    className="w-full text-left px-3 py-1.5 rounded-lg
                                               text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-xs transition-all"
                                  >
                                    {s3}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── BREADCRUMB ──────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5">
        <button
          onClick={() => setActiveNav(null)}
          className="text-[#C41717] hover:text-[#A81212] text-xs font-medium transition-colors flex items-center gap-1"
        >
          <LayoutDashboard className="w-3 h-3" />
          Inicio
        </button>
        {activeNav && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-500 text-xs">{activeNav.nav}</span>
            {activeNav.sub && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-700 text-xs font-medium">{activeNav.sub}</span>
              </>
            )}
          </>
        )}
      </div>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto">
        {!activeNav ? (
          <DashboardHome user={user} onNavigate={handleNavigate} />
        ) : activeNav.nav === "Usuarios" ? (
          <UsuariosView />
        ) : activeNav.sub === "Estudiantes › Información básica" ? (
          <InformacionBasicaView />
        ) : activeNav.sub === "Docentes › Información básica" ? (
          <PersonalInfoView tipo="docente" />
        ) : activeNav.sub === "Administrativos › Información básica" ? (
          <PersonalInfoView tipo="administrativo" />
        ) : activeNav.sub === "Evaluaciones" ? (
          <EvaluacionesView />
        ) : activeNav.sub === "Créditos" ? (
          <CreditosView />
        ) : activeNav.sub === "Pagos" ? (
          <PagosView />
        ) : activeNav.sub === "Administrar notas crédito" ? (
          <NotasCreditoView />
        ) : activeNav.sub === "Codeudores › Información básica" ? (
          <CodeudoresInfoView />
        ) : activeNav.sub === "Estructuración › Crear programa" ? (
          <ProgramasView />
        ) : activeNav.sub === "Estructuración › Asignaturas" ? (
          <AsignaturasView />
        ) : activeNav.sub === "Estructuración › Crear curso" ? (
          <CursosView />
        ) : (
          <ModulePlaceholder nav={activeNav.nav} sub={activeNav.sub} />
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 flex items-center justify-between">
        <GFOLogoSmall className="opacity-70" />
        <p className="text-slate-400 text-[10px] tracking-wide">
          © {new Date().getFullYear()} GFO Academy. Campus Virtual
        </p>
        <a href="/" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">
          Volver a SISO
        </a>
      </footer>

      {/* ── MODALES ─────────────────────────────────────────────────────────── */}
      <RegistrarEstudianteModal
        isOpen={modal === "registrar-estudiante"}
        onClose={() => setModal(null)}
      />
      <RegistrarPersonalModal
        isOpen={modal === "registrar-docente"}
        onClose={() => setModal(null)}
        tipo="docente"
      />
      <RegistrarPersonalModal
        isOpen={modal === "registrar-administrativo"}
        onClose={() => setModal(null)}
        tipo="administrativo"
      />
      <RegistrarCodeudorModal
        isOpen={modal === "registrar-codeudor"}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
