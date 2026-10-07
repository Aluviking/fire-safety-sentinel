import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import {
  Search, Bell, HelpCircle, ChevronDown, LogOut, Menu, X,
  Users, BookOpen, GraduationCap, DollarSign, FileText,
  Calendar, Award, ClipboardList, UserCheck, Building,
  ChevronRight, LayoutDashboard, AlertCircle, Briefcase,
  Shield, TrendingUp, Clock, UserCog, ScrollText, ShieldCheck, Video, UserPlus,
} from "lucide-react";
import { useCampusAuth, type CampusUser, type Permisos } from "@/context/CampusAuthContext";
import { apiFetch } from "@/lib/api";
import RegistrarEstudianteModal from "./RegistrarEstudianteModal";
import { CuentaSwitcher } from "./CuentaSwitcher";
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
import EvaluacionesView from "./views/EvaluacionesView";
import ConsolidadoNotasView from "./views/ConsolidadoNotasView";
import CarteraGeneralView from "./views/CarteraGeneralView";
import GestionFinancieraView from "./views/GestionFinancieraView";
import HistorialView from "./views/HistorialView";
import SalasVirtualesView from "./views/SalasVirtualesView";
import CursosLigerosView from "./views/CursosLigerosView";
import CursosVirtualesView from "./views/CursosVirtualesView";
import PlantillasView from "./views/PlantillasView";
import CertificadosView from "./views/CertificadosView";
import BancoPreguntasView from "./views/BancoPreguntasView";
import InscritosView from "./views/InscritosView";
import PerfilesView from "./views/PerfilesView";
import PersonaDetalleView from "./views/PersonaDetalleView";

/* ── GFO Academy Logo ─────────────────────────────────────────────────────── */
// Sin forma fija propia (ni rounded/border/shadow/tamaño de imagen) — cada
// lugar donde se usa decide su propia forma vía className/imgClassName, para
// que el logo del navbar (más grande, esquinas suaves) y el del footer
// (tarjeta chica) no compartan un mismo marco rígido.
const GFOLogoSmall = ({
  className, imgClassName = "h-7 w-auto object-contain",
}: { className?: string; imgClassName?: string }) => (
  <div
    className={`bg-white flex items-center justify-center overflow-hidden shrink-0 ${className ?? ""}`}
    style={{ padding: "4px 10px" }}
  >
    <img src={gfoLogo} alt="GFO Academy" className={imgClassName} />
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
      { label: "Inscritos",        icon: UserPlus },
    ],
  },
  {
    label: "Académico",
    icon: BookOpen,
    subs: [
      { label: "Evaluaciones", icon: ClipboardList },
      {
        label: "Educación virtual", icon: BookOpen,
        subs: ["Cursos ligeros", "Cursos virtuales", "Plantillas", "Certificados", "Banco de preguntas", "Aulas virtuales"],
      },
      {
        label: "Estructuración", icon: LayoutDashboard,
        subs: [
          "Crear programa", "Crear curso", "Crear asignatura",
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
  { label: "Perfiles", icon: ShieldCheck },
  { label: "Historial", icon: ScrollText },
];

// Traduce cada etiqueta real del menú a su clave de módulo en el backend
// (ver modulos_catalogo() en bootstrap.php — deben coincidir exacto). Lo que
// no aparece aquí (Otros Ingresos/Egresos/Adaptaciones/Estructuración de
// Tesorería/"Parámetros de constancias y certificados") no tiene vista real
// construida — bajo un perfil restrictivo queda oculto; una cuenta sin
// perfil (permisos.all) lo sigue viendo igual que hoy.
const MODULO_POR_ETIQUETA: Record<string, string> = {
  "Estudiantes": "institucional.estudiantes",
  "Docentes": "institucional.docentes",
  "Administrativos": "institucional.administrativos",
  "Codeudores": "institucional.codeudores",
  "Inscritos": "institucional.inscritos",
  "Evaluaciones": "academico.evaluaciones",
  "Cursos ligeros": "academico.cursos_ligeros",
  "Cursos virtuales": "academico.cursos_virtuales",
  "Plantillas": "academico.plantillas",
  "Certificados": "academico.certificados",
  "Banco de preguntas": "academico.banco_preguntas",
  "Aulas virtuales": "academico.aulas_virtuales",
  "Crear programa": "academico.programas",
  "Crear asignatura": "academico.asignaturas",
  "Crear curso": "academico.cursos",
  "Créditos": "tesoreria.creditos",
  "Pagos": "tesoreria.pagos",
  "Administrar notas crédito": "tesoreria.notas_credito",
  "Consolidado de notas": "informes.consolidado_notas",
  "Cartera general": "informes.cartera_general",
  "Gestión financiera": "informes.gestion_financiera",
  "Usuarios": "usuarios",
};

function filterNavItems(items: NavItem[], canVer: (modulo: string) => boolean, verTodo: boolean): NavItem[] {
  const keep = (label: string) => {
    const modulo = MODULO_POR_ETIQUETA[label];
    return modulo ? canVer(modulo) : verTodo;
  };
  return items
    .map((item) => {
      if (!item.subs) return item;
      const filteredSubs = item.subs
        .map((sub) => {
          if (MODULO_POR_ETIQUETA[sub.label]) return keep(sub.label) ? sub : null;
          if (sub.subs) {
            const filteredStrings = sub.subs.filter((s) => keep(s));
            return filteredStrings.length > 0 ? { ...sub, subs: filteredStrings } : null;
          }
          return keep(sub.label) ? sub : null;
        })
        .filter((s): s is SubItem => s !== null);
      return filteredSubs.length > 0 ? { ...item, subs: filteredSubs } : null;
    })
    .filter((item): item is NavItem => item !== null);
}

// Aplana el árbol de navegación (ya filtrado por permisos) en una lista de
// destinos buscables, con el mismo par (nav, sub) que espera handleNavigate
// — incluye también los ítems que abren un modal (ej. "Registrar
// estudiante"), ya que handleNavigate los intercepta igual por ese mismo par.
interface SearchResult { label: string; nav: string; sub: string }
interface PersonaResult { id: number; nombre_completo: string; identificacion: string; tipo: "estudiante" | "docente" }
function flattenNavItems(items: NavItem[]): SearchResult[] {
  const out: SearchResult[] = [];
  for (const item of items) {
    if (!item.subs || item.subs.length === 0) {
      out.push({ label: item.label, nav: item.label, sub: "" });
      continue;
    }
    for (const sub of item.subs) {
      if (!sub.subs || sub.subs.length === 0) {
        out.push({ label: `${item.label} › ${sub.label}`, nav: item.label, sub: sub.label });
        continue;
      }
      for (const s3 of sub.subs) {
        out.push({ label: `${item.label} › ${sub.label} › ${s3}`, nav: item.label, sub: `${sub.label} › ${s3}` });
      }
    }
  }
  return out;
}
// Quita marcas diacríticas (acentos) tras descomponer NFD, para que buscar
// "informacion" también encuentre "Información" — construido con
// fromCharCode (no un literal en el código fuente) para evitar cualquier
// ambigüedad de codificación con los propios caracteres combinantes.
const DIACRITICS_RE = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, "g");
const normalize = (s: string) => s.normalize("NFD").replace(DIACRITICS_RE, "").toLowerCase();

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador",
  docente: "Docente",
  administrativo: "Administrativo",
  estudiante: "Estudiante",
  equipo: "Coordinador",
};

// Vista simulada "Docente" para Super Admin — copia exacta de lo que
// rol_modulos_por_defecto('docente') devuelve en bootstrap.php, para que el
// selector de vista (solo visual/menú, no un cambio real de permisos — la
// sesión sigue siendo de super_admin por debajo) muestre lo mismo que vería
// una cuenta de docente real. Si el backend cambia esa lista, hay que
// reflejarlo aquí también.
const DOCENTE_PERMISOS_PREVIEW: Permisos = {
  all: false,
  modulos: {
    "institucional.estudiantes":   { ver: true, editar: false },
    "academico.evaluaciones":      { ver: true, editar: true },
    "academico.cursos_ligeros":    { ver: true, editar: false },
    "academico.cursos_virtuales":  { ver: true, editar: false },
    "academico.aulas_virtuales":   { ver: true, editar: false },
    "academico.programas":         { ver: true, editar: false },
    "academico.asignaturas":       { ver: true, editar: false },
    "academico.cursos":            { ver: true, editar: false },
    "informes.consolidado_notas":  { ver: true, editar: false },
  },
};

/* ── Quick-access cards ───────────────────────────────────────────────────── */
// Cada `sub` debe coincidir EXACTO con lo que espera el switch de <main> más
// abajo (activeNav.sub) — antes varios de estos apuntaban a un valor que no
// existía en ese switch y caían silenciosamente en ModulePlaceholder ("en
// construcción"). Se priorizan accesos rápidos de verdad útiles (crear
// curso/programa, cursos ligeros, aulas virtuales) sobre categorías genéricas.
const QUICK_ACCESS = [
  { icon: GraduationCap,   label: "Estudiantes",    color: "#1E40AF", nav: "Institucional", sub: "Estudiantes › Información básica" },
  { icon: UserCheck,       label: "Docentes",        color: "#065F46", nav: "Institucional", sub: "Docentes › Información básica" },
  { icon: BookOpen,        label: "Crear curso",     color: "#9F1239", nav: "Académico",     sub: "Estructuración › Crear curso" },
  { icon: LayoutDashboard, label: "Crear programa",  color: "#6B21A8", nav: "Académico",     sub: "Estructuración › Crear programa" },
  { icon: Award,           label: "Cursos ligeros",  color: "#92400E", nav: "Académico",     sub: "Educación virtual › Cursos ligeros" },
  { icon: Video,           label: "Aulas virtuales", color: "#1E3A5F", nav: "Académico",     sub: "Educación virtual › Aulas virtuales" },
  { icon: ClipboardList,   label: "Evaluaciones",    color: "#374151", nav: "Académico",     sub: "Evaluaciones" },
  { icon: UserCog,         label: "Usuarios",        color: "#14532D", nav: "Usuarios",      sub: "" },
];

/* ── Datos reales del panel de inicio (anuncios/clases/auditoría/contadores) ── */
interface AnuncioReciente { origen: string; origen_nombre: string; titulo: string; mensaje: string | null; importancia: string; created_at: string }
interface ClaseProxima { origen: string; origen_nombre: string; origen_id: number; titulo: string; fecha_inicio: string; fecha_fin: string | null }
interface AuditoriaReciente { id: number; user_name: string; action: string; detail: string | null; created_at: string }
interface PreinscripcionReciente { id: number; nombres: string; apellidos: string; tipo_interes: string; item_nombre: string; created_at: string }
interface ResumenData {
  anuncios: AnuncioReciente[];
  clases: ClaseProxima[];
  auditoria: AuditoriaReciente[];
  preinscripciones: PreinscripcionReciente[];
  stats: { cursos: number; pagosPendientes: number; notificaciones: number };
}

/* ── NavDropdown (tema claro) ─────────────────────────────────────────────── */
function NavDropdown({
  item, isOpen, onToggle, onOpen, onClose, onSelect,
}: {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (nav: string, sub: string) => void;
}) {
  const ref     = useRef<HTMLDivElement>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mismo patrón "hover-intent" que ya usan los submenús (abrir de una,
  // cerrar con un pequeño retraso) — para que el primer nivel del navbar
  // (Institucional, Académico...) reaccione al pasar el mouse igual que los
  // demás niveles, en vez de solo abrir con clic.
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openOnHover  = () => { if (menuTimerRef.current) clearTimeout(menuTimerRef.current); onOpen(); };
  const closeOnHover = () => { menuTimerRef.current = setTimeout(onClose, 150); };

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
    <div ref={ref} className="relative" onMouseEnter={openOnHover} onMouseLeave={closeOnHover}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isOpen
                      ? "bg-white text-[#C41717]"
                      : "text-white/90 hover:text-white hover:bg-white/15"}`}
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

/* ── Campana de notificaciones (real: anuncios + auditoría de los últimos 7 días) ── */
function NotificationBell({
  resumen, loading, isSuperAdmin, onGoHistorial, onGoInscritos,
}: { resumen: ResumenData | null; loading: boolean; isSuperAdmin: boolean; onGoHistorial: () => void; onGoInscritos: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const count = resumen?.stats.notificaciones ?? 0;
  const items = resumen
    ? [
        ...resumen.anuncios.map((a, i) => ({
          key: `a-${i}`, titulo: a.titulo, detalle: `${a.origen}: ${a.origen_nombre}`, fecha: a.created_at, onClick: undefined as (() => void) | undefined,
        })),
        ...resumen.auditoria.map((a) => ({
          key: `h-${a.id}`, titulo: a.detail ?? a.action, detalle: a.user_name, fecha: a.created_at, onClick: undefined as (() => void) | undefined,
        })),
        ...(resumen.preinscripciones ?? []).map((p) => ({
          key: `p-${p.id}`,
          titulo: `Nueva inscripción: ${p.nombres} ${p.apellidos}`,
          detalle: `${p.tipo_interes === "programa" ? "Programa" : p.tipo_interes === "diplomado" ? "Diplomado" : "Curso"}: ${p.item_nombre}`,
          fecha: p.created_at,
          onClick: onGoInscritos,
        })),
      ]
        .sort((x, y) => new Date(y.fecha).getTime() - new Date(x.fecha).getTime())
        .slice(0, 8)
    : [];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-white
                           text-[#C41717] text-[9px] font-bold leading-[15px] text-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1.5 w-80 max-w-[90vw] rounded-xl bg-white border border-slate-200
                       shadow-[0_8px_32px_rgba(0,0,0,0.16)] z-50 overflow-hidden"
          >
            <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-slate-700 text-sm font-semibold">Notificaciones</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Actividad de los últimos 7 días</p>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <p className="text-center text-slate-400 text-xs py-8">Cargando...</p>
              ) : items.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8">Sin novedades por ahora.</p>
              ) : (
                items.map((it) => (
                  <div
                    key={it.key}
                    onClick={it.onClick ? () => { setOpen(false); it.onClick!(); } : undefined}
                    className={`px-4 py-3 hover:bg-slate-50 transition-colors ${it.onClick ? "cursor-pointer" : ""}`}
                  >
                    <p className="text-slate-700 text-xs font-medium leading-snug">{it.titulo}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {it.detalle} · {new Date(it.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))
              )}
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => { setOpen(false); onGoHistorial(); }}
                className="w-full text-center py-2.5 text-xs font-semibold text-[#C41717] hover:bg-[#C41717]/5 border-t border-slate-100 transition-colors"
              >
                Ver historial completo
              </button>
            )}
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

/* ── Programas destacados (reales, solo los que están Publicado) ─────────── */
interface ProgramaDestacado { id: number; nombre: string; dias_disponibles: number | null; publicado: number }
function ProgramasDestacados({ onNavigate }: { onNavigate: (nav: string, sub: string) => void }) {
  const [programas, setProgramas] = useState<ProgramaDestacado[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ programas: ProgramaDestacado[] }>("/programas/list.php")
      .then((d) => setProgramas(d.programas.filter((p) => p.publicado)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Nada que mostrar todavía, o ningún programa publicado — no se inventa
  // contenido de relleno, la sección simplemente no aparece.
  if (!loaded || programas.length === 0) return null;

  return (
    <div>
      <h2 className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
        <span className="h-px flex-1 bg-slate-200" />
        Programas destacados
        <span className="h-px flex-1 bg-slate-200" />
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {programas.slice(0, 3).map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate("Académico", "Estructuración › Crear programa")}
            className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm
                       px-4 py-4 hover:shadow-md hover:border-slate-300 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/15
                            flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#C41717]/65" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 text-sm font-medium leading-snug truncate">{p.nombre}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-slate-400 text-[11px]">
                  {p.dias_disponibles != null ? `${p.dias_disponibles} días` : "Sin fecha límite"}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-600 text-[11px] font-medium">Publicado</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#C41717]/50 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Home ───────────────────────────────────────────────────────── */
function DashboardHome({
  user, onNavigate, resumen, resumenLoading, vistaSimulada, onGoToClase,
}: { user: CampusUser; onNavigate: (nav: string, sub: string) => void; resumen: ResumenData | null; resumenLoading: boolean; vistaSimulada: "docente" | null; onGoToClase: (c: ClaseProxima) => void }) {
  const { canVer, permisos } = useCampusAuth();
  // Si Super Admin activó la vista simulada de Docente, el saludo/accesos
  // rápidos usan los permisos de vista previa en vez de los reales — es solo
  // visual, la sesión real sigue siendo de super_admin.
  const permisosVista = vistaSimulada === "docente" ? DOCENTE_PERMISOS_PREVIEW : permisos;
  const canVerVista = (modulo: string) => permisosVista.all || !!permisosVista.modulos[modulo]?.ver;
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  // Mismo filtro de permisos que usa el navbar (MODULO_POR_ETIQUETA) — antes
  // el acceso rápido salía igual para todos sin importar el rol, mostrando
  // atajos a módulos que esa cuenta ni siquiera puede abrir (ej. "Docentes"
  // o "Usuarios" para un Docente).
  const quickAccess = QUICK_ACCESS.filter(({ label }) => {
    const modulo = MODULO_POR_ETIQUETA[label];
    return modulo ? canVerVista(modulo) : true;
  });

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
              {vistaSimulada === "docente" ? "Docente (vista previa)" : (ROLE_LABEL[user.role] ?? user.role)}
            </span>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Cursos",     value: resumenLoading ? "—" : String(resumen?.stats.cursos ?? 0),          icon: BookOpen      },
              { label: "Pagos pend.", value: resumenLoading ? "—" : String(resumen?.stats.pagosPendientes ?? 0), icon: ClipboardList },
              { label: "Novedades",  value: resumenLoading ? "—" : String(resumen?.stats.notificaciones ?? 0),   icon: Bell          },
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
          {quickAccess.map(({ icon: Icon, label, color, nav, sub }) => (
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
            {resumenLoading ? (
              <p className="text-slate-400 text-xs text-center py-8">Cargando...</p>
            ) : (resumen?.anuncios.length ?? 0) === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">Aún no hay anuncios publicados.</p>
            ) : (
              resumen!.anuncios.map((a, i) => (
                <div key={`${a.origen}-${a.titulo}-${i}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.importancia === "Importante" ? "bg-[#C41717]" : "bg-blue-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-sm leading-snug">{a.titulo}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {a.origen}: {a.origen_nombre} · {new Date(a.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C41717]/60" />
            <h3 className="text-slate-700 text-sm font-semibold">Próximas clases virtuales</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {resumenLoading ? (
              <p className="text-slate-400 text-xs text-center py-8">Cargando...</p>
            ) : (resumen?.clases.length ?? 0) === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay clases virtuales programadas.</p>
            ) : (
              resumen!.clases.map((c, i) => {
                const d = new Date(c.fecha_inicio);
                return (
                  <button
                    key={`${c.origen}-${c.titulo}-${i}`}
                    onClick={() => onGoToClase(c)}
                    className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex flex-col items-center shrink-0 w-10">
                      <span className="text-[#C41717]/70 text-[10px] font-bold">{d.toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</span>
                      <span className="text-slate-400 text-[9px]">{d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 text-sm leading-snug">{c.titulo}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                        {c.origen}: {c.origen_nombre}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ProgramasDestacados onNavigate={onNavigate} />
    </motion.div>
  );
}

/* ══ MAIN COMPONENT ═════════════════════════════════════════════════════════ */
export default function CampusDashboard() {
  const navigate = useNavigate();
  const { currentUser: user, permisos, canVer, loading, logout: authLogout, isImpersonando, volverAMiCuenta } = useCampusAuth();
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Selector de vista para Super Admin: le permite ver el panel como lo vería
  // una cuenta de Docente (menú acotado), sin salir de su propia sesión ni
  // pedir clave otra vez. Es solo una vista previa — sus permisos reales de
  // super_admin siguen activos por debajo, esto no restringe nada de verdad,
  // solo cambia qué se muestra. Se reinicia a "Super Admin" en cada recarga.
  const [vistaSimulada, setVistaSimulada] = useState<"docente" | null>(null);
  const [vistaMenuOpen, setVistaMenuOpen] = useState(false);
  // La sección activa vive en la URL (?nav=...&sub=...), no en useState — así
  // una recarga (incluso Ctrl+Shift+R) restaura exactamente dónde estabas en
  // vez de volver siempre al inicio del dashboard.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNav = searchParams.get("nav")
    ? { nav: searchParams.get("nav") as string, sub: searchParams.get("sub") ?? "" }
    : null;
  const setActiveNav = (next: { nav: string; sub: string } | null) => {
    // El perfil completo de una persona (por buscador o por clic en
    // Estudiantes/Docentes) se renderiza por encima de todo el contenido —
    // sin esto, cualquier clic del navbar quedaba "sin efecto" mientras ese
    // perfil estuviera abierto, porque activeNav sí cambiaba pero nunca se
    // llegaba a pintar (había que darle "Volver" primero para liberar la vista).
    setPersonaAbierta(null);
    if (!next) { setSearchParams({}, { replace: true }); return; }
    const params: Record<string, string> = { nav: next.nav };
    if (next.sub) params.sub = next.sub;
    setSearchParams(params, { replace: true });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const [personaResults, setPersonaResults] = useState<PersonaResult[]>([]);
  // Al elegir una persona en el buscador, se abre su perfil completo por
  // encima de la navegación normal (no es un módulo más del menú).
  const [personaAbierta, setPersonaAbierta] = useState<{ tipo: "estudiante" | "docente"; id: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Buscar estudiantes/docentes por nombre o cédula desde el mismo buscador
  // del navbar — "solo escribir y ya saber si está o no registrado", sin
  // entrar al módulo. Con debounce para no llamar al backend en cada tecla.
  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 2) { setPersonaResults([]); return; }
    const t = setTimeout(() => {
      apiFetch<{ personas: PersonaResult[] }>(`/personas/buscar.php?q=${encodeURIComponent(term)}`)
        .then((d) => setPersonaResults(d.personas))
        .catch(() => setPersonaResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const [modal, setModal]             = useState<string | null>(null);
  const [resumen, setResumen]         = useState<ResumenData | null>(null);
  const [resumenLoading, setResumenLoading] = useState(true);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [loading, user, navigate]);

  // Datos reales para la campana de notificaciones y el inicio (anuncios,
  // próximas clases, auditoría reciente, contadores) — un solo fetch
  // compartido por todos los que usan este panel; Estudiante tiene el suyo
  // propio y nunca llega a montar este componente. Docente ya SÍ usa este
  // panel (con su menú acotado por permisos), no el mini-panel de antes.
  useEffect(() => {
    if (loading || !user || user.role === "estudiante") return;
    apiFetch<ResumenData>("/dashboard/resumen.php")
      .then(setResumen)
      .catch(() => {})
      .finally(() => setResumenLoading(false));
  }, [loading, user]);

  // Estudiante tiene su propio panel, distinto a este (que es el panel
  // administrativo) — se redirige automático, sin mostrar "Acceso
  // restringido" para un rol que sí tiene a dónde ir.
  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "estudiante") navigate("/estudiante", { replace: true });
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

  // Acceso directo desde "Próximas clases virtuales" al módulo exacto donde
  // se creó esa reunión (con su pestaña "Clases virtuales" ya abierta) — sin
  // esto, para borrar una reunión tocaba navegar paso a paso hasta encontrarla.
  const handleGoToClase = (c: ClaseProxima) => {
    let sub = "";
    let idParam = "";
    let tabParam = "";
    if (c.origen === "Programa") {
      // Misma regla que ProgramasView usa para distinguir "programa" de
      // "curso" (diplomado) dentro de la misma tabla `programas`.
      const esCurso = c.origen_nombre.toUpperCase().startsWith("CURSO");
      sub = esCurso ? "Estructuración › Crear curso" : "Estructuración › Crear programa";
      idParam = "programaId";
      tabParam = "programaTab";
    } else if (c.origen === "Asignatura") {
      sub = "Estructuración › Crear asignatura";
      idParam = "asignaturaId";
      tabParam = "asignaturaTab";
    } else if (c.origen === "Curso") {
      sub = "Educación virtual › Cursos virtuales";
      idParam = "cursoId";
      tabParam = "cursoTab";
    } else if (c.origen === "Curso ligero") {
      sub = "Educación virtual › Cursos ligeros";
      idParam = "cursoLigeroId";
      tabParam = "cursoLigeroTab";
    } else {
      return;
    }
    setSearchParams({ nav: "Académico", sub, [idParam]: String(c.origen_id), [tabParam]: "clases" }, { replace: true });
    setMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const toggleMenu = (label: string) => setOpenMenu((prev) => (prev === label ? null : label));

  if (loading || !user || user.role === "estudiante") return null;

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const isSuperAdmin = user.role === "super_admin";
  // "equipo" (Coordinador) y "administrativo" (Gerente) entran automático
  // por su rol, con los permisos por defecto de rol_modulos_por_defecto() en
  // el backend — no requieren ningún paso aparte de "asignar perfil". Un
  // perfil_id explícito (opcional) solo sirve para afinar un caso puntual.
  const hasAutoRole = user.role === "equipo" || user.role === "administrativo" || user.role === "docente";
  const hasPerfil = user.perfilId != null;
  const canEnter = isAdmin || hasAutoRole || hasPerfil;
  // Si está activa la vista simulada de Docente, el MENÚ se filtra con los
  // permisos de vista previa en vez de los reales de super_admin — el resto
  // del panel (modales, acciones puntuales) sigue con los permisos reales,
  // esto solo cambia qué aparece en la barra de navegación y el saludo.
  const permisosVista = vistaSimulada === "docente" ? DOCENTE_PERMISOS_PREVIEW : permisos;
  const canVerVista = (modulo: string) => permisosVista.all || !!permisosVista.modulos[modulo]?.ver;
  const isSuperAdminVista = isSuperAdmin && vistaSimulada === null;
  const visibleNavItems = filterNavItems(NAV_ITEMS, canVerVista, permisosVista.all)
    .filter((item) => item.label !== "Historial" || isSuperAdminVista)
    .filter((item) => item.label !== "Perfiles" || isSuperAdminVista)
    .filter((item) => item.label !== "Usuarios" || canVerVista("usuarios"));

  const searchResults = searchQuery.trim()
    ? flattenNavItems(visibleNavItems).filter((r) => normalize(r.label).includes(normalize(searchQuery.trim()))).slice(0, 8)
    : [];

  /* Acceso restringido */
  if (!canEnter) {
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
      {isImpersonando && (
        <div className="shrink-0 bg-amber-400 text-amber-950 text-xs font-semibold flex items-center justify-center gap-2 py-1.5 px-4">
          <span>Estás viendo como {user?.nombre} ({user?.role}).</span>
          <button
            onClick={() => { volverAMiCuenta(); navigate("/dashboard", { replace: true }); }}
            className="underline hover:no-underline"
          >
            Volver a mi cuenta
          </button>
        </div>
      )}

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#C41717] border-b border-[#A81212] shadow-sm">
        <div className="flex items-center h-14">

          {/* Logo — franja blanca a todo lo alto del navbar, pegada al borde izquierdo (no una
              tarjeta flotando sobre el rojo), para que el logo contraste de verdad. */}
          <button onClick={() => setActiveNav(null)} className="h-full flex items-center bg-white px-4 sm:px-6 shrink-0">
            <img src={gfoLogo} alt="GFO Academy" className="h-9 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3 px-4 sm:px-6 flex-1 min-w-0">

          {/* Búsqueda de módulos — real: filtra sobre lo que el usuario puede ver y navega al elegir */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
            <input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              className="w-full bg-white border border-white/40 rounded-lg
                         pl-9 pr-4 py-2 text-slate-800 text-sm placeholder:text-slate-400
                         focus:outline-none focus:border-white focus:ring-2 focus:ring-white/40 transition-all"
            />
            <AnimatePresence>
              {searchOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1.5 w-full min-w-[260px] rounded-xl bg-white border border-slate-200
                             shadow-[0_8px_32px_rgba(0,0,0,0.16)] z-50 overflow-hidden"
                >
                  <div className="max-h-72 overflow-y-auto py-1.5">
                    {personaResults.length > 0 && (
                      <>
                        <p className="px-4 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Personas</p>
                        {personaResults.map((p) => (
                          <button
                            key={`${p.tipo}-${p.id}`}
                            onClick={() => {
                              setPersonaAbierta({ tipo: p.tipo, id: p.id });
                              setSearchQuery(""); setSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between gap-2 text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <span className="truncate">{p.nombre_completo} <span className="text-slate-400 text-xs">· {p.identificacion}</span></span>
                            <span className={`shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full
                              ${p.tipo === "estudiante" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {p.tipo === "estudiante" ? "Estudiante" : "Docente"}
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                    {searchResults.length === 0 && personaResults.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-4">Sin resultados</p>
                    ) : (
                      <>
                        {searchResults.length > 0 && personaResults.length > 0 && (
                          <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Módulos</p>
                        )}
                        {searchResults.map((r) => (
                        <button
                          key={r.label}
                          onClick={() => { handleNavigate(r.nav, r.sub); setSearchQuery(""); setSearchOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          {r.label}
                        </button>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav escritorio */}
          <nav className="hidden lg:flex items-center gap-0.5 ml-2">
            {visibleNavItems.map((item) =>
              item.subs && item.subs.length > 0 ? (
                <NavDropdown
                  key={item.label}
                  item={item}
                  isOpen={openMenu === item.label}
                  onToggle={() => toggleMenu(item.label)}
                  onOpen={() => setOpenMenu(item.label)}
                  onClose={() => setOpenMenu((prev) => (prev === item.label ? null : prev))}
                  onSelect={handleNavigate}
                />
              ) : (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.label, "")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                              ${activeNav?.nav === item.label
                                ? "bg-white text-[#C41717]"
                                : "text-white/90 hover:text-white hover:bg-white/15"}`}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center gap-1.5 ml-auto">
            <NotificationBell
              resumen={resumen}
              loading={resumenLoading}
              isSuperAdmin={isSuperAdmin}
              onGoHistorial={() => setActiveNav({ nav: "Historial", sub: "" })}
              onGoInscritos={() => setActiveNav({ nav: "Institucional", sub: "Inscritos" })}
            />
            <button className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 ml-1 pl-2 border-l border-white/25">
              <div className="w-7 h-7 rounded-full bg-white/15 border border-white/40
                              flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold leading-none">{user.nombre.charAt(0)}</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white text-xs font-semibold leading-tight">{user.nombre.split(" ")[0]}</span>
                <span className="text-white/70 text-[10px] leading-tight">
                  {vistaSimulada === "docente" ? "Docente (vista previa)" : (ROLE_LABEL[user.role] ?? user.role)}
                </span>
              </div>
              {/* Selector de vista — solo Super Admin. Deja ver el panel como lo
                  vería una cuenta de Docente (menú acotado), sin salir de la
                  sesión real ni pedir clave otra vez. Es solo visual: los
                  permisos reales de super_admin siguen activos por debajo. */}
              {isSuperAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setVistaMenuOpen((v) => !v)}
                    title="Elegir vista"
                    className="flex items-center gap-1 shrink-0 text-white/80 hover:text-white
                               bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1.5 transition-all"
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {vistaMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setVistaMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-1.5 w-52 rounded-xl bg-white border border-slate-200
                                     shadow-[0_8px_32px_rgba(0,0,0,0.16)] z-50 overflow-hidden py-1.5"
                        >
                          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Elegir vista</p>
                          <button
                            onClick={() => { setVistaSimulada(null); setVistaMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${vistaSimulada === null ? "text-[#C41717] font-semibold bg-red-50" : "text-slate-600 hover:bg-slate-50"}`}
                          >
                            Super Admin (real)
                          </button>
                          <button
                            onClick={() => { setVistaSimulada("docente"); setVistaMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${vistaSimulada === "docente" ? "text-[#C41717] font-semibold bg-red-50" : "text-slate-600 hover:bg-slate-50"}`}
                          >
                            Docente (vista previa)
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <CuentaSwitcher />
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

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
              className="lg:hidden bg-white border-t border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {visibleNavItems.map((item) => (
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
      {/* Cada tramo (menos el actual) es clicable y reabre el menú de esa
          categoría — así se puede saltar a otra pantalla del mismo módulo sin
          tener que volver hasta Inicio primero. */}
      <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveNav(null)}
          className="text-[#C41717] hover:text-[#A81212] text-xs font-medium transition-colors flex items-center gap-1"
        >
          <LayoutDashboard className="w-3 h-3" />
          Inicio
        </button>
        {activeNav && (() => {
          const subParts = activeNav.sub ? activeNav.sub.split(" › ") : [];
          const reabrirMenu = () => { toggleMenu(activeNav.nav); setMobileMenuOpen(true); };
          return (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              {subParts.length > 0 ? (
                <button onClick={reabrirMenu} className="text-slate-500 hover:text-[#C41717] text-xs transition-colors">
                  {activeNav.nav}
                </button>
              ) : (
                <span className="text-slate-700 text-xs font-medium">{activeNav.nav}</span>
              )}
              {subParts.map((part, i) => {
                const isLast = i === subParts.length - 1;
                return (
                  <span key={`${part}-${i}`} className="flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                    {isLast ? (
                      <span className="text-slate-700 text-xs font-medium">{part}</span>
                    ) : (
                      <button onClick={reabrirMenu} className="text-slate-500 hover:text-[#C41717] text-xs transition-colors">
                        {part}
                      </button>
                    )}
                  </span>
                );
              })}
            </>
          );
        })()}
      </div>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto">
        {personaAbierta ? (
          <PersonaDetalleView tipo={personaAbierta.tipo} id={personaAbierta.id} onBack={() => setPersonaAbierta(null)} />
        ) : !activeNav ? (
          <DashboardHome user={user} onNavigate={handleNavigate} resumen={resumen} resumenLoading={resumenLoading} vistaSimulada={vistaSimulada} onGoToClase={handleGoToClase} />
        ) : activeNav.nav === "Usuarios" ? (
          <UsuariosView />
        ) : activeNav.nav === "Perfiles" && isSuperAdmin ? (
          <PerfilesView />
        ) : activeNav.nav === "Historial" && isSuperAdmin ? (
          <HistorialView />
        ) : activeNav.sub === "Estudiantes › Información básica" ? (
          <InformacionBasicaView onVerPersona={(id) => setPersonaAbierta({ tipo: "estudiante", id })} />
        ) : activeNav.sub === "Docentes › Información básica" ? (
          <PersonalInfoView tipo="docente" onVerPersona={(id) => setPersonaAbierta({ tipo: "docente", id })} />
        ) : activeNav.sub === "Administrativos › Información básica" ? (
          <PersonalInfoView tipo="administrativo" />
        ) : activeNav.sub === "Inscritos" ? (
          <InscritosView />
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
        ) : activeNav.sub === "Estructuración › Crear asignatura" ? (
          <AsignaturasView />
        ) : activeNav.sub === "Estructuración › Crear curso" ? (
          <ProgramasView soloTipo="curso" />
        ) : activeNav.sub === "Educación virtual › Cursos ligeros" ? (
          <CursosLigerosView />
        ) : activeNav.sub === "Educación virtual › Cursos virtuales" ? (
          <CursosVirtualesView />
        ) : activeNav.sub === "Educación virtual › Plantillas" ? (
          <PlantillasView />
        ) : activeNav.sub === "Educación virtual › Certificados" ? (
          <CertificadosView />
        ) : activeNav.sub === "Educación virtual › Banco de preguntas" ? (
          <BancoPreguntasView />
        ) : activeNav.sub === "Educación virtual › Aulas virtuales" ? (
          <SalasVirtualesView />
        ) : activeNav.sub === "Consolidado de notas" ? (
          <ConsolidadoNotasView />
        ) : activeNav.sub === "Cartera general" ? (
          <CarteraGeneralView />
        ) : activeNav.sub === "Gestión financiera" ? (
          <GestionFinancieraView />
        ) : (
          <ModulePlaceholder nav={activeNav.nav} sub={activeNav.sub} />
        )}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 flex items-center justify-between">
        <GFOLogoSmall className="rounded-xl border border-slate-200 shadow-sm opacity-70" />
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
