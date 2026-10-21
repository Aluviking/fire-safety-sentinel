import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, BookOpen, GraduationCap, Layers, ArrowLeft, AlertCircle, Loader2,
  Clock, User, Sparkles, Video, PlayCircle, Calendar, KeyRound,
  Search, LayoutDashboard, ChevronRight,
  FileText, ListChecks, MessageSquare, Menu, X, Users, ClipboardCheck, Settings2,
  Building2, FileSpreadsheet,
} from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch } from "@/lib/api";
import { CuentaSwitcher } from "./CuentaSwitcher";
import { ItemCard, CardImage, accentFor } from "./ItemCard";
import {
  SectionHeader, NotificacionesBell, AvatarPicker, Reloj, MiniCalendario, BarraNoticias,
  claseYaPaso, formatoCorto, claseKey, type ClaseResumen, type AnuncioResumen,
} from "./DashboardWidgets";
// Las mismas vistas que ya usa el panel de administración — ya vienen
// scopeadas a "solo lo del docente" tanto en lo que listan (list.php) como
// en lo que dejan crear/editar/borrar (candado de dueño agregado en el
// backend), así que se reutilizan tal cual en vez de reconstruir
// formularios de creación desde cero. Carga diferida (lazy): son 8 pantallas
// completas del panel admin -- si se importaran de forma normal, entrar a
// /docente bajaría ese peso entero aunque el docente nunca abra "Crear y
// gestionar". Con lazy(), cada una solo se descarga la primera vez que se
// hace clic en su pestaña.
const ProgramasView = lazy(() => import("./views/ProgramasView"));
const AsignaturasView = lazy(() => import("./views/AsignaturasView"));
const CursosLigerosView = lazy(() => import("./views/CursosLigerosView"));
const CursosVirtualesView = lazy(() => import("./views/CursosVirtualesView"));
const EvaluacionesView = lazy(() => import("./views/EvaluacionesView"));
const InformacionBasicaView = lazy(() => import("./views/InformacionBasicaView"));
const SalasVirtualesView = lazy(() => import("./views/SalasVirtualesView"));
const ConsolidadoNotasView = lazy(() => import("./views/ConsolidadoNotasView"));
// Carga diferida — mismo motivo que en la vista de estudiante: ContenidoEditor
// trae adentro el visor de PDF (pdf.js, ~1.7MB), no tiene sentido bajarlo
// hasta que el docente de verdad entre a ver/editar contenido.
const ContenidoEditor = lazy(() => import("./ContenidoEditor"));

interface ProgramaDocente { id: number; nombre: string; descripcion: string | null; imagen_path: string | null; dias_disponibles: number | null; matriculados: number }
interface CursoDocente { id: number; codigo_nombre: string | null; descripcion: string | null; imagen_path: string | null; dias_disponibles: number | null; matriculados: number }
interface CursoLigeroDocente { id: number; nombre: string; categoria: string | null; descripcion: string | null; imagen_path: string | null; usuarios_inscritos: number }
interface AsignaturaDocente { id: number; nombre: string; descripcion: string | null; imagen_path: string | null; dias_disponibles: number | null }
interface ClaseVirtualDocente {
  id: number; titulo: string; fecha_inicio: string; fecha_fin: string | null;
  link_reunion: string | null; grabacion_url: string | null; grabacion_password?: string | null;
}
interface ClaseConOrigen extends ClaseResumen { origen_id: number }
interface ResumenDocente { anuncios: AnuncioResumen[]; clases: ClaseConOrigen[]; clasesHistorial: ClaseConOrigen[] }
type Activo = { nombre: string; contentBase: string; questionsBase: string; intentosBase: string; ownerIdKey: string; ownerId: number };
type ProgramaAbierto = { id: number; nombre: string };

function VistaCargando() {
  return (
    <div className="flex justify-center py-16 text-slate-400">
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

export default function DocenteDashboard() {
  const { currentUser: user, loading: authLoading, logout, isImpersonando, volverAMiCuenta } = useCampusAuth();
  const navigate = useNavigate();

  const [programas, setProgramas] = useState<ProgramaDocente[]>([]);
  const [cursosVirtuales, setCursosVirtuales] = useState<CursoDocente[]>([]);
  const [cursos, setCursos] = useState<CursoLigeroDocente[]>([]);
  const [loading, setLoading] = useState(true);

  const [resumen, setResumen] = useState<ResumenDocente | null>(null);
  const [resumenLoading, setResumenLoading] = useState(true);
  const [claseVirtualSeleccionada, setClaseVirtualSeleccionada] = useState<string | null>(null);

  const [activo, setActivo] = useState<Activo | null>(null);
  const [programaAbierto, setProgramaAbierto] = useState<ProgramaAbierto | null>(null);
  const [asignaturasPrograma, setAsignaturasPrograma] = useState<AsignaturaDocente[]>([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [clasesPrograma, setClasesPrograma] = useState<ClaseConOrigen[]>([]);
  // Conteo real de recursos/cuestionarios por asignatura — mismo patrón que
  // ya usa la vista de estudiante, nada inventado.
  const [contenidoPorAsignatura, setContenidoPorAsignatura] = useState<Record<number, { tipo: string }[]>>({});
  const [clasesActivo, setClasesActivo] = useState<ClaseVirtualDocente[]>([]);

  // Pestaña activa del menú lateral — navegación real (cambia qué se
  // muestra), no un simple scroll. Las 4 "gestion*" reutilizan las mismas
  // vistas del panel admin (crear/editar/borrar programa, asignatura, curso,
  // curso ligero — ya scopeadas a dueño), "estudiantes" y "evaluaciones"
  // reutilizan sus vistas admin tal cual (ya filtradas por docente).
  const [vistaHome, setVistaHome] = useState<
    "inicio" | "programas" | "clases" | "perfil" | "estudiantes" | "evaluaciones" |
    "gestionProgramas" | "gestionAsignaturas" | "gestionCursos" | "gestionCursosLigeros" | "gestionCursosVirtuales" |
    "aulas" | "consolidado"
  >("inicio");
  const [menuAbierto, setMenuAbierto] = useState<"programas" | "clases" | "gestion" | null>(null);
  const [filtroClases, setFiltroClases] = useState<"todas" | "proximas" | "anteriores">("todas");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (user.role !== "docente") { navigate("/dashboard", { replace: true }); return; }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "docente") return;
    // Mismos 3 endpoints que ya usa "Mis asignados" del panel administrativo
    // — ya vienen filtrados por lo que este docente de verdad tiene a cargo.
    Promise.all([
      apiFetch<{ programas: ProgramaDocente[] }>("/programas/list.php").catch(() => ({ programas: [] })),
      apiFetch<{ cursos: CursoDocente[] }>("/cursos/list.php").catch(() => ({ cursos: [] })),
      apiFetch<{ cursosLigeros: CursoLigeroDocente[] }>("/cursos-ligeros/list.php").catch(() => ({ cursosLigeros: [] })),
    ])
      .then(([p, c, cl]) => { setProgramas(p.programas); setCursosVirtuales(c.cursos); setCursos(cl.cursosLigeros); })
      .finally(() => setLoading(false));

    // Mismo endpoint que ya usa el panel administrativo — para Docente ya
    // viene filtrado por dueño (anuncios/clases/histórico de SUS propios
    // programas/asignaturas/cursos, construido en una ronda anterior).
    apiFetch<ResumenDocente>("/dashboard/resumen.php")
      .then(setResumen)
      .catch(() => setResumen(null))
      .finally(() => setResumenLoading(false));
  }, [user]);

  useEffect(() => {
    if (!programaAbierto) return;
    setLoadingAsignaturas(true);
    apiFetch<{ asignaturas: AsignaturaDocente[] }>(`/mis-programas/asignaturas.php?programaId=${programaAbierto.id}`)
      .then((d) => setAsignaturasPrograma(d.asignaturas))
      .catch(() => setAsignaturasPrograma([]))
      .finally(() => setLoadingAsignaturas(false));
    apiFetch<{ clases: ClaseConOrigen[] }>(`/mis-programas/clases.php?programaId=${programaAbierto.id}`)
      .then((d) => setClasesPrograma(d.clases))
      .catch(() => setClasesPrograma([]));
  }, [programaAbierto]);

  useEffect(() => {
    if (asignaturasPrograma.length === 0) { setContenidoPorAsignatura({}); return; }
    Promise.all(asignaturasPrograma.map((a) =>
      apiFetch<{ contenido: { tipo: string }[] }>(`/asignatura-contenido/list.php?asignaturaId=${a.id}`)
        .then((d) => [a.id, d.contenido] as const)
        .catch(() => [a.id, []] as const)
    )).then((pares) => setContenidoPorAsignatura(Object.fromEntries(pares)));
  }, [asignaturasPrograma]);

  useEffect(() => {
    if (!activo) { setClasesActivo([]); return; }
    let endpoint: string | null = null;
    if (activo.ownerIdKey === "cursoId") endpoint = `/curso-clases/list.php?cursoId=${activo.ownerId}`;
    else if (activo.ownerIdKey === "cursoLigeroId") endpoint = `/curso-ligero-clases/list.php?cursoLigeroId=${activo.ownerId}`;
    else if (activo.ownerIdKey === "asignaturaId") endpoint = `/asignatura-clases/list.php?asignaturaId=${activo.ownerId}`;
    if (!endpoint) { setClasesActivo([]); return; }
    apiFetch<{ clases: ClaseVirtualDocente[] }>(endpoint)
      .then((d) => setClasesActivo(d.clases))
      .catch(() => setClasesActivo([]));
  }, [activo]);

  const irATab = (tab: typeof vistaHome) => {
    setActivo(null); setProgramaAbierto(null); setVistaHome(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  if (authLoading || !user || user.role !== "docente") return null;

  const totalItems = programas.length + cursosVirtuales.length + cursos.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const clasesProximas = resumen?.clases ?? [];
  const clasesHistorial = resumen?.clasesHistorial ?? [];
  const anuncios = resumen?.anuncios ?? [];

  // Mismo contenido para el menú lateral de escritorio y el panel
  // desplegable de celular — así ambos navegan exactamente igual.
  const menuLateralItems = (
    <>
      <button onClick={() => irATab("inicio")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "inicio" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <LayoutDashboard className="w-4 h-4" /> Inicio
      </button>

      <button
        onClick={() => { irATab("programas"); setMenuAbierto((m) => (m === "programas" ? null : "programas")); }}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "programas" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <GraduationCap className="w-4 h-4" /> Mis asignados
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${menuAbierto === "programas" ? "rotate-90" : ""}`} />
      </button>
      {menuAbierto === "programas" && (
        <div className="ml-4 pl-3 border-l border-slate-100 flex flex-col gap-0.5 py-1">
          {programas.map((p) => (
            <button key={`p-${p.id}`} onClick={() => { setProgramaAbierto(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-[#C41717] hover:bg-slate-50 transition-colors truncate">
              {p.nombre}
            </button>
          ))}
          {cursosVirtuales.map((c) => (
            <button key={`cv-${c.id}`} onClick={() => { setActivo({ nombre: c.codigo_nombre ?? "Curso", contentBase: "/curso-contenido", questionsBase: "/curso-preguntas", intentosBase: "/curso-cuestionario-intentos", ownerIdKey: "cursoId", ownerId: c.id }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-[#C41717] hover:bg-slate-50 transition-colors truncate">
              {c.codigo_nombre ?? "—"}
            </button>
          ))}
          {cursos.map((c) => (
            <button key={`cl-${c.id}`} onClick={() => { setActivo({ nombre: c.nombre, contentBase: "/curso-ligero-contenido", questionsBase: "/curso-ligero-preguntas", intentosBase: "/curso-ligero-cuestionario-intentos", ownerIdKey: "cursoLigeroId", ownerId: c.id }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-[#C41717] hover:bg-slate-50 transition-colors truncate">
              {c.nombre}
            </button>
          ))}
          {totalItems === 0 && (
            <p className="px-2.5 py-1.5 text-[11px] text-slate-300">Nada asignado todavía</p>
          )}
        </div>
      )}

      <button
        onClick={() => { irATab("clases"); setFiltroClases("todas"); setMenuAbierto((m) => (m === "clases" ? null : "clases")); }}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "clases" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <Video className="w-4 h-4" /> Clases virtuales
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${menuAbierto === "clases" ? "rotate-90" : ""}`} />
      </button>
      {menuAbierto === "clases" && (
        <div className="ml-4 pl-3 border-l border-slate-100 flex flex-col gap-0.5 py-1">
          {([
            { f: "todas", label: "Todas" },
            { f: "proximas", label: "Próximas" },
            { f: "anteriores", label: "Anteriores" },
          ] as const).map(({ f, label }) => (
            <button key={f} onClick={() => { irATab("clases"); setFiltroClases(f); }}
              className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${vistaHome === "clases" && filtroClases === f ? "text-[#C41717] font-semibold bg-[#C41717]/8" : "text-slate-500 hover:text-[#C41717] hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Crear/editar/borrar de verdad (programa, asignatura, curso, curso
          ligero) — mismas vistas del panel admin, ya limitadas a lo que es
          suyo tanto al listar como al guardar. */}
      <button
        onClick={() => { irATab("gestionProgramas"); setMenuAbierto((m) => (m === "gestion" ? null : "gestion")); }}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome.startsWith("gestion") ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <Settings2 className="w-4 h-4" /> Crear y gestionar
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${menuAbierto === "gestion" ? "rotate-90" : ""}`} />
      </button>
      {menuAbierto === "gestion" && (
        <div className="ml-4 pl-3 border-l border-slate-100 flex flex-col gap-0.5 py-1">
          {([
            { v: "gestionProgramas", label: "Programas" },
            { v: "gestionAsignaturas", label: "Asignaturas" },
            { v: "gestionCursos", label: "Cursos" },
            { v: "gestionCursosLigeros", label: "Cursos ligeros" },
            { v: "gestionCursosVirtuales", label: "Cursos virtuales" },
          ] as const).map(({ v, label }) => (
            <button key={v} onClick={() => irATab(v)}
              className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${vistaHome === v ? "text-[#C41717] font-semibold bg-[#C41717]/8" : "text-slate-500 hover:text-[#C41717] hover:bg-slate-50"}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => irATab("estudiantes")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "estudiantes" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <Users className="w-4 h-4" /> Estudiantes
      </button>

      <button onClick={() => irATab("evaluaciones")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "evaluaciones" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <ClipboardCheck className="w-4 h-4" /> Evaluaciones
      </button>

      <button onClick={() => irATab("aulas")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "aulas" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <Building2 className="w-4 h-4" /> Aulas virtuales
      </button>

      <button onClick={() => irATab("consolidado")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "consolidado" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <FileSpreadsheet className="w-4 h-4" /> Consolidado de notas
      </button>

      <button onClick={() => irATab("perfil")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "perfil" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <User className="w-4 h-4" /> Mi perfil
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {isImpersonando && (
        <div className="shrink-0 bg-amber-400 text-amber-950 text-xs font-semibold flex items-center justify-center gap-2 py-1.5 px-4">
          <span>Estás viendo como {user.nombre} (docente).</span>
          <button onClick={() => { volverAMiCuenta(); navigate("/dashboard", { replace: true }); }} className="underline hover:no-underline">
            Volver a mi cuenta
          </button>
        </div>
      )}
      <header className="sticky top-0 z-40 bg-[#C41717] border-b border-[#A81212] shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14 max-w-7xl mx-auto w-full">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ padding: "4px 10px" }}>
            <img src={gfoLogo} alt="GFO Academy" className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0 shrink-0 hidden sm:block">
            <p className="text-white text-sm font-semibold leading-tight truncate">{user.nombre}</p>
            <p className="text-white text-[11px] leading-tight">Docente</p>
          </div>
          {!activo && !programaAbierto ? (
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en mis programas y cursos..."
                className="w-full bg-white border border-white/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 transition-shadow"
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Reloj />
          <AvatarPicker />
          <NotificacionesBell clases={clasesProximas} />
          <CuentaSwitcher />
          <button onClick={handleLogout} title="Cerrar sesión"
            className="p-2 rounded-lg text-white hover:bg-white/15 transition-all shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
          <button onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/15 transition-all shrink-0">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-3 py-3">
              {menuLateralItems}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex max-w-7xl w-full mx-auto min-h-0">
        <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-slate-200 bg-white px-3 py-5 gap-1 overflow-y-auto">
          {menuLateralItems}
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
        {activo ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
            <div className="p-5 sm:p-7">
              <button onClick={() => setActivo(null)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> {programaAbierto ? `Volver a ${programaAbierto.nombre}` : "Volver a mis asignados"}
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#C41717]" />
                </div>
                <h1 className="text-slate-900 font-bold text-lg leading-snug">{activo.nombre}</h1>
              </div>
              {clasesActivo.filter((c) => !claseYaPaso(c)).length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Video className="w-3.5 h-3.5 text-[#C41717]/60" /> Clases en vivo
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {clasesActivo.filter((c) => !claseYaPaso(c)).map((c) => (
                      <div key={c.id} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-1.5">
                        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {c.link_reunion ? (
                            <a href={c.link_reunion} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#C41717] hover:bg-[#A81212] rounded-lg px-3 py-1.5 transition-colors">
                              <Video className="w-3.5 h-3.5" /> Unirse
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-300">Sin link disponible todavía</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {clasesActivo.filter((c) => claseYaPaso(c)).length > 0 && (
                <div className="mb-6 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <PlayCircle className="w-3.5 h-3.5 text-slate-400" /> Clases anteriores
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {clasesActivo.filter((c) => claseYaPaso(c)).map((c) => (
                      <div key={c.id} className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex flex-col gap-1.5">
                        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {c.grabacion_url ? (
                            <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-lg px-3 py-1.5 transition-colors">
                              <PlayCircle className="w-3.5 h-3.5" /> Ver grabación
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-300">Grabación en proceso...</span>
                          )}
                          {c.grabacion_url && c.grabacion_password && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                              <KeyRound className="w-3 h-3 text-slate-400 shrink-0" /> Clave: <span className="font-semibold text-slate-700">{c.grabacion_password}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Suspense fallback={<div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>}>
                {/* esDueno=true: estos 3 endpoints (programas/cursos/cursos-ligeros
                    list.php) ya solo devuelven lo que de verdad es suyo — por
                    construcción, todo lo que el docente puede abrir aquí ya es
                    suyo, así que ContenidoEditor le habilita agregar/editar. */}
                <ContenidoEditor
                  contentBase={activo.contentBase}
                  questionsBase={activo.questionsBase}
                  intentosBase={activo.intentosBase}
                  ownerIdKey={activo.ownerIdKey}
                  ownerId={activo.ownerId}
                  esDueno
                />
              </Suspense>
            </div>
          </motion.div>
        ) : programaAbierto ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
            <button onClick={() => setProgramaAbierto(null)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis asignados
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-[#C41717]" />
              </div>
              <h1 className="text-slate-900 font-bold text-lg leading-snug">{programaAbierto.nombre}</h1>
            </div>

            {loadingAsignaturas ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : asignaturasPrograma.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No tienes asignaturas a cargo en este programa todavía.</p>
              </div>
            ) : (
              <div>
                <SectionHeader icon={Layers} label="Tus asignaturas" count={asignaturasPrograma.length} />
                {/* Una tarjeta por asignatura a todo el ancho (imagen fija a la
                    izquierda, el resto a la derecha) — mismo patrón que la
                    vista de estudiante, para que nunca quede espacio vacío. */}
                <div className="space-y-3">
                  {asignaturasPrograma.map((a) => {
                    const contenido = contenidoPorAsignatura[a.id] ?? [];
                    const cuestionarios = contenido.filter((c) => c.tipo === "Cuestionario").length;
                    const avisos = anuncios.filter((an) => an.origen === "Asignatura" && an.origen_nombre === a.nombre);
                    return (
                      <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                        <button
                          onClick={() => setActivo({ nombre: a.nombre, contentBase: "/asignatura-contenido", questionsBase: "/asignatura-preguntas", intentosBase: "/asignatura-cuestionario-intentos", ownerIdKey: "asignaturaId", ownerId: a.id })}
                          className="group relative w-full sm:w-48 h-36 sm:h-auto shrink-0 overflow-hidden"
                        >
                          {a.imagen_path ? (
                            <CardImage path={`/asignaturas/imagen.php?id=${a.id}`} alt={a.nombre} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentFor(a.nombre)}E6 0%, ${accentFor(a.nombre)}99 100%)` }}>
                              <Layers className="w-8 h-8 text-white/90" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold px-3 py-1.5 rounded-full bg-[#C41717]">Gestionar</span>
                          </div>
                        </button>
                        <div className="flex-1 min-w-0 grid md:grid-cols-[1fr_260px]">
                          <div className="p-5">
                            <p className="text-slate-800 text-sm font-bold">{a.nombre}</p>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                              {a.descripcion ?? "Esta asignatura todavía no tiene una descripción cargada."}
                            </p>
                          </div>
                          <div className="border-t md:border-t-0 md:border-l border-slate-100 divide-y divide-slate-100">
                            <div className="px-4 py-3 flex items-center gap-2.5">
                              <FileText className="w-3.5 h-3.5 text-[#C41717]/60 shrink-0" />
                              <span className="text-xs text-slate-600">{contenido.length} recurso{contenido.length !== 1 ? "s" : ""} cargado{contenido.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="px-4 py-3 flex items-center gap-2.5">
                              <ListChecks className="w-3.5 h-3.5 text-[#C41717]/60 shrink-0" />
                              <span className="text-xs text-slate-600">{cuestionarios > 0 ? `${cuestionarios} cuestionario${cuestionarios !== 1 ? "s" : ""}` : "Sin cuestionarios todavía"}</span>
                            </div>
                            <div className="px-4 py-3 flex items-center gap-2.5">
                              <MessageSquare className="w-3.5 h-3.5 text-[#C41717]/60 shrink-0" />
                              <span className="text-xs text-slate-600">{avisos.length > 0 ? `${avisos.length} aviso${avisos.length !== 1 ? "s" : ""} publicado${avisos.length !== 1 ? "s" : ""}` : "Sin avisos todavía"}</span>
                            </div>
                            {a.dias_disponibles != null && (
                              <div className="px-4 py-3 flex items-center gap-2.5">
                                <Clock className="w-3.5 h-3.5 text-[#C41717]/60 shrink-0" />
                                <span className="text-xs text-slate-600">{a.dias_disponibles} días disponibles</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ) : vistaHome === "inicio" || vistaHome === "programas" || vistaHome === "clases" || vistaHome === "perfil" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-slate-400 text-sm">{greeting},</p>
                <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">{user.nombre}</h1>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C41717]" /> Docente
              </span>
            </div>

            {vistaHome === "inicio" && <BarraNoticias anuncios={anuncios} />}

            {vistaHome === "perfil" ? (
              <PerfilDocente programas={programas} cursosVirtuales={cursosVirtuales} cursos={cursos} clasesHistorial={clasesHistorial} />
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
              <div className="space-y-5 min-w-0">
                {(vistaHome === "inicio" || vistaHome === "clases") && (clasesProximas.length > 0 || clasesHistorial.length > 0) && (() => {
                  const combinadas = vistaHome === "clases" && filtroClases === "proximas" ? clasesProximas
                    : vistaHome === "clases" && filtroClases === "anteriores" ? clasesHistorial
                    : [...clasesProximas, ...clasesHistorial];
                  if (combinadas.length === 0) {
                    return (
                      <div id="clases-virtuales" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                        <Video className="w-7 h-7 text-slate-300 mx-auto mb-2.5" />
                        <p className="text-slate-400 text-sm">No hay clases {filtroClases === "proximas" ? "próximas" : "anteriores"} todavía.</p>
                      </div>
                    );
                  }
                  const seleccionada = combinadas.find((c) => claseKey(c) === claseVirtualSeleccionada) ?? combinadas[0];
                  const esProxima = !claseYaPaso(seleccionada);
                  return (
                    <div id="clases-virtuales">
                      <SectionHeader icon={Layers} label="Todas mis clases virtuales" count={combinadas.length} />
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid md:grid-cols-[260px_1fr]">
                        <div className="border-b md:border-b-0 md:border-r border-slate-100 max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                          {combinadas.map((c) => {
                            const key = claseKey(c);
                            const itemEsProxima = !claseYaPaso(c);
                            const activa = key === claseKey(seleccionada);
                            return (
                              <button key={key} onClick={() => setClaseVirtualSeleccionada(key)}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${activa ? "bg-[#C41717]/8" : "hover:bg-slate-50"}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${itemEsProxima ? "bg-[#C41717]/10" : "bg-slate-100"}`}>
                                  <Video className={`w-3.5 h-3.5 ${itemEsProxima ? "text-[#C41717]" : "text-slate-400"}`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-slate-800 text-sm font-semibold truncate">{c.titulo}</p>
                                  <p className="text-slate-400 text-[11px] truncate">{c.origen}: {c.origen_nombre}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${itemEsProxima ? "bg-[#C41717]/10 text-[#C41717]" : "bg-slate-100 text-slate-500"}`}>
                                  {itemEsProxima ? "Próxima" : "Finalizada"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${esProxima ? "bg-[#C41717]/10 text-[#C41717]" : "bg-slate-100 text-slate-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${esProxima ? "bg-[#C41717] animate-pulse" : "bg-slate-400"}`} /> {esProxima ? "Próxima" : "Finalizada"}
                          </span>
                          <h3 className="text-slate-900 font-bold text-lg mt-2">{seleccionada.titulo}</h3>
                          <p className="text-slate-400 text-xs mt-1 mb-3">{seleccionada.origen}: {seleccionada.origen_nombre}</p>
                          <div className="grid grid-cols-2 gap-2.5 mb-3">
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Fecha</p>
                              <p className="text-slate-800 text-sm font-bold mt-1">{new Date(seleccionada.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Estado</p>
                              <p className="text-slate-800 text-sm font-bold mt-1">{esProxima ? "Agendada" : seleccionada.grabacion_url ? "Con grabación" : "En proceso"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {esProxima && seleccionada.link_reunion && (
                              <a href={seleccionada.link_reunion} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#C41717] hover:bg-[#A81212] rounded-xl px-4 py-2.5 transition-colors">
                                <Video className="w-4 h-4" /> Unirse a la reunión
                              </a>
                            )}
                            {!esProxima && seleccionada.grabacion_url && (
                              <a href={seleccionada.grabacion_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-xl px-4 py-2.5 transition-colors">
                                <PlayCircle className="w-4 h-4" /> Ver grabación
                              </a>
                            )}
                            {!esProxima && !seleccionada.grabacion_url && (
                              <span className="text-slate-400 text-xs">Grabación en proceso...</span>
                            )}
                            {seleccionada.grabacion_url && seleccionada.grabacion_password && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Clave: <span className="font-semibold text-slate-700">{seleccionada.grabacion_password}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(vistaHome === "inicio" || vistaHome === "programas") && (() => {
                  const q = busqueda.trim().toLowerCase();
                  const programasFiltrados = q ? programas.filter((p) => p.nombre.toLowerCase().includes(q)) : programas;
                  const cursosVirtualesFiltrados = q ? cursosVirtuales.filter((c) => (c.codigo_nombre ?? "").toLowerCase().includes(q)) : cursosVirtuales;
                  const cursosFiltrados = q ? cursos.filter((c) => c.nombre.toLowerCase().includes(q)) : cursos;
                  const sinResultados = q !== "" && programasFiltrados.length === 0 && cursosVirtualesFiltrados.length === 0 && cursosFiltrados.length === 0;

                  if (loading) return (
                    <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                    </div>
                  );
                  if (totalItems === 0) return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">Todavía no tienes programas, cursos ni cursos ligeros a tu cargo.</p>
                    </div>
                  );
                  if (sinResultados) return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">Nada coincide con &quot;{busqueda}&quot;.</p>
                    </div>
                  );
                  return (
                  <div id="mis-programas" className="space-y-5">
                    {programasFiltrados.length > 0 && (
                      <div>
                        <SectionHeader icon={GraduationCap} label="Programas" count={programas.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {programasFiltrados.map((p) => (
                            <ItemCard
                              key={p.id}
                              icon={GraduationCap}
                              title={p.nombre}
                              subtitle={p.descripcion}
                              imagePath={p.imagen_path ? `/programas/imagen.php?id=${p.id}` : null}
                              accent={accentFor(p.nombre)}
                              onClick={() => setProgramaAbierto(p)}
                              footer={
                                <div className="space-y-1.5">
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                    <User className="w-3 h-3 text-slate-400" /> {p.matriculados} matriculado{p.matriculados !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {cursosVirtualesFiltrados.length > 0 && (
                      <div>
                        <SectionHeader icon={BookOpen} label="Cursos" count={cursosVirtuales.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {cursosVirtualesFiltrados.map((c) => (
                            <ItemCard
                              key={c.id}
                              icon={BookOpen}
                              title={c.codigo_nombre ?? "—"}
                              subtitle={c.descripcion}
                              imagePath={c.imagen_path ? `/cursos/imagen.php?id=${c.id}` : null}
                              accent={accentFor(c.codigo_nombre ?? String(c.id))}
                              onClick={() => setActivo({ nombre: c.codigo_nombre ?? "Curso", contentBase: "/curso-contenido", questionsBase: "/curso-preguntas", intentosBase: "/curso-cuestionario-intentos", ownerIdKey: "cursoId", ownerId: c.id })}
                              footer={
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                  <User className="w-3 h-3 text-slate-400" /> {c.matriculados} matriculado{c.matriculados !== 1 ? "s" : ""}
                                </span>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {cursosFiltrados.length > 0 && (
                      <div>
                        <SectionHeader icon={BookOpen} label="Cursos ligeros" count={cursos.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {cursosFiltrados.map((c) => (
                            <ItemCard
                              key={c.id}
                              icon={BookOpen}
                              title={c.nombre}
                              subtitle={c.descripcion ?? c.categoria}
                              imagePath={c.imagen_path ? `/cursos-ligeros/imagen.php?id=${c.id}` : null}
                              accent={accentFor(c.nombre)}
                              onClick={() => setActivo({ nombre: c.nombre, contentBase: "/curso-ligero-contenido", questionsBase: "/curso-ligero-preguntas", intentosBase: "/curso-ligero-cuestionario-intentos", ownerIdKey: "cursoLigeroId", ownerId: c.id })}
                              footer={
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                  <User className="w-3 h-3 text-slate-400" /> {c.usuarios_inscritos} inscrito{c.usuarios_inscritos !== 1 ? "s" : ""}
                                </span>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })()}
              </div>

              <div className="space-y-3 lg:sticky lg:top-20">
                <div className="relative rounded-2xl overflow-hidden shadow-sm bg-[#C41717] p-5">
                  <p className="text-white text-[11px] font-bold uppercase tracking-wide mb-2">Próxima clase</p>
                  {clasesProximas.length > 0 ? (
                    <>
                      <p className="text-white font-extrabold text-lg leading-snug">{clasesProximas[0].titulo}</p>
                      <p className="text-white text-xs mt-1">{clasesProximas[0].origen}: {clasesProximas[0].origen_nombre}</p>
                      <p className="text-white text-sm font-semibold mt-2.5">{formatoCorto(clasesProximas[0].fecha_inicio)}</p>
                      {clasesProximas[0].link_reunion && (
                        <a href={clasesProximas[0].link_reunion} target="_blank" rel="noopener noreferrer"
                          className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#C41717] bg-white hover:bg-white/90 rounded-xl px-4 py-2.5 transition-colors">
                          <Video className="w-4 h-4" /> Unirse
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-white text-sm leading-relaxed">No tienes clases en vivo programadas esta semana.</p>
                  )}
                </div>

                <MiniCalendario clases={[...clasesProximas, ...clasesHistorial]} />

                {!loading && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    <a href={totalItems > 0 ? "#mis-programas" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 ${totalItems > 0 ? "hover:bg-slate-50 transition-colors" : ""}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#C41717]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-[11px]">A tu cargo</p>
                        <p className={`font-bold text-sm ${totalItems > 0 ? "text-slate-900" : "text-slate-300"}`}>
                          {totalItems > 0 ? `${totalItems} programa${totalItems !== 1 ? "s" : ""}/curso${totalItems !== 1 ? "s" : ""}` : "nada todavía"}
                        </p>
                      </div>
                    </a>
                    <a href={clasesHistorial.length > 0 ? "#clases-virtuales" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 ${clasesHistorial.length > 0 ? "hover:bg-slate-50 transition-colors" : ""}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-3.5 h-3.5 text-[#C41717]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-[11px]">En tu histórico</p>
                        <p className={`font-bold text-sm ${clasesHistorial.length > 0 ? "text-slate-900" : "text-slate-300"}`}>
                          {clasesHistorial.length > 0 ? `${clasesHistorial.length} clase${clasesHistorial.length !== 1 ? "s" : ""} dictada${clasesHistorial.length !== 1 ? "s" : ""}` : "ninguna todavía"}
                        </p>
                      </div>
                    </a>
                    <a href={clasesHistorial.some((c) => c.grabacion_url) ? "#clases-virtuales" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 ${clasesHistorial.some((c) => c.grabacion_url) ? "hover:bg-slate-50 transition-colors" : ""}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                        <KeyRound className="w-3.5 h-3.5 text-[#C41717]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-[11px]">Con grabación</p>
                        <p className={`font-bold text-sm ${clasesHistorial.some((c) => c.grabacion_url) ? "text-slate-900" : "text-slate-300"}`}>
                          {clasesHistorial.filter((c) => c.grabacion_url).length > 0 ? `${clasesHistorial.filter((c) => c.grabacion_url).length} disponible${clasesHistorial.filter((c) => c.grabacion_url).length !== 1 ? "s" : ""}` : "ninguna todavía"}
                        </p>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
            )}
          </motion.div>
        ) : vistaHome === "estudiantes" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><InformacionBasicaView /></Suspense>
          </motion.div>
        ) : vistaHome === "evaluaciones" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><EvaluacionesView /></Suspense>
          </motion.div>
        ) : vistaHome === "gestionProgramas" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><ProgramasView /></Suspense>
          </motion.div>
        ) : vistaHome === "gestionAsignaturas" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><AsignaturasView /></Suspense>
          </motion.div>
        ) : vistaHome === "gestionCursos" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><ProgramasView soloTipo="curso" /></Suspense>
          </motion.div>
        ) : vistaHome === "gestionCursosLigeros" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><CursosLigerosView /></Suspense>
          </motion.div>
        ) : vistaHome === "gestionCursosVirtuales" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><CursosVirtualesView /></Suspense>
          </motion.div>
        ) : vistaHome === "aulas" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><SalasVirtualesView /></Suspense>
          </motion.div>
        ) : vistaHome === "consolidado" ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Suspense fallback={<VistaCargando />}><ConsolidadoNotasView /></Suspense>
          </motion.div>
        ) : null}
      </main>
      </div>

      <footer className="bg-[#C41717] py-4 px-6 flex items-center justify-between gap-3">
        <div className="rounded-xl bg-white border border-white/25 shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ padding: "4px 10px" }}>
          <img src={gfoLogo} alt="GFO Academy" className="h-6 w-auto object-contain" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <p className="text-white text-[10px] tracking-wide">© {new Date().getFullYear()} GFO Academy. Campus Virtual</p>
          <a href="https://www.rubikcontroldigital.com/" target="_blank" rel="noopener noreferrer"
            className="text-white text-[10px] tracking-wide hover:underline">
            Powered by Rubik Control Digital
          </a>
        </div>
        <div className="w-[52px] shrink-0" />
      </footer>
    </div>
  );
}

// Módulo de perfil del docente — solo su propia información, con sus
// estadísticas reales a cargo (nunca inventadas).
function PerfilDocente({
  programas, cursosVirtuales, cursos, clasesHistorial,
}: { programas: ProgramaDocente[]; cursosVirtuales: CursoDocente[]; cursos: CursoLigeroDocente[]; clasesHistorial: ClaseConOrigen[] }) {
  const { currentUser } = useCampusAuth();
  const totalItems = programas.length + cursosVirtuales.length + cursos.length;
  const totalEstudiantes = programas.reduce((acc, p) => acc + p.matriculados, 0)
    + cursosVirtuales.reduce((acc, c) => acc + c.matriculados, 0)
    + cursos.reduce((acc, c) => acc + c.usuarios_inscritos, 0);
  const miembroDesde = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("es-CO", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
      <div className="space-y-4 min-w-0">
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-[#C41717] p-6">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <AvatarPicker grande />
            </div>
            <div className="min-w-0">
              <p className="text-white font-extrabold text-xl truncate">{currentUser?.nombre}</p>
              <p className="text-white text-sm truncate">{currentUser?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-white text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> Docente
                </span>
                {miembroDesde && (
                  <span className="text-white text-[11px]">Desde {miembroDesde}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center mb-2">
              <GraduationCap className="w-4 h-4 text-[#C41717]" />
            </div>
            <p className="text-slate-900 font-extrabold text-lg leading-none">{totalItems}</p>
            <p className="text-slate-400 text-[11px] mt-1">Programas/cursos a cargo</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center mb-2">
              <User className="w-4 h-4 text-[#C41717]" />
            </div>
            <p className="text-slate-900 font-extrabold text-lg leading-none">{totalEstudiantes}</p>
            <p className="text-slate-400 text-[11px] mt-1">Estudiantes en total</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center mb-2">
              <PlayCircle className="w-4 h-4 text-[#C41717]" />
            </div>
            <p className="text-slate-900 font-extrabold text-lg leading-none">{clasesHistorial.length}</p>
            <p className="text-slate-400 text-[11px] mt-1">Clases en tu histórico</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center mb-2">
              <KeyRound className="w-4 h-4 text-[#C41717]" />
            </div>
            <p className="text-slate-900 font-extrabold text-lg leading-none">{clasesHistorial.filter((c) => c.grabacion_url).length}</p>
            <p className="text-slate-400 text-[11px] mt-1">Grabaciones disponibles</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <span className="text-slate-400 text-xs font-semibold">Usuario</span>
            <span className="text-slate-800 text-sm font-medium truncate">{currentUser?.username}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <span className="text-slate-400 text-xs font-semibold">Identificación</span>
            <span className="text-slate-800 text-sm font-medium truncate">{currentUser?.identificacion ?? "—"}</span>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between gap-3">
            <span className="text-slate-400 text-xs font-semibold">Rol</span>
            <span className="text-slate-800 text-sm font-medium">Docente</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs px-1">
          ¿Necesitas corregir tu nombre, correo o identificación? Pídele a un administrador que lo actualice desde Usuarios.
        </p>
      </div>
    </div>
  );
}
