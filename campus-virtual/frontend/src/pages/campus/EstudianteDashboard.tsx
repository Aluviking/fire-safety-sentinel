import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, BookOpen, GraduationCap, Layers, ArrowLeft, AlertCircle, Loader2,
  Clock, User, Sparkles, Video, PlayCircle, Calendar, KeyRound,
  Search, LayoutDashboard, ChevronRight,
  FileText, ListChecks, MessageSquare, Menu, X,
} from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch } from "@/lib/api";
import { CuentaSwitcher } from "./CuentaSwitcher";
import { ItemCard, CardImage, accentFor } from "./ItemCard";
import {
  SectionHeader, NotificacionesBell, AvatarPicker, Reloj, MiniCalendario, BarraNoticias,
  claseYaPaso, formatoCorto, claseKey,
} from "./DashboardWidgets";
// Carga diferida — ContenidoEditor trae adentro el visor de PDF (pdf.js,
// ~1.7MB) desde que se le quitó la dependencia de un Worker aparte. Si se
// importa de una, CADA estudiante tiene que bajar y ejecutar ese bloque
// completo apenas entra a su panel, aunque no vaya a ver ningún contenido.
const ContenidoEditor = lazy(() => import("./ContenidoEditor"));

interface CursoLigero {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  imagen_path: string | null;
  docente_nombre: string | null;
  progreso: number;
  estado_acceso: string;
}
interface Programa {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_path: string | null;
  dias_disponibles: number | null;
}
interface Asignatura {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_path: string | null;
  dias_disponibles: number | null;
  docentes?: { id: number; nombre: string }[];
}
interface CursoVirtual {
  id: number;
  codigo_nombre: string | null;
  descripcion: string | null;
  imagen_path: string | null;
  dias_disponibles: number | null;
  docente_nombre: string | null;
}
interface ClaseVirtualEstudiante {
  id: number;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  link_reunion: string | null;
  grabacion_url: string | null;
  grabacion_password?: string | null;
}
interface ClaseProximaEstudiante {
  origen: "Programa" | "Asignatura" | "Curso" | "Curso ligero";
  origen_nombre: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  link_reunion: string | null;
  grabacion_url: string | null;
  grabacion_password?: string | null;
}
type Activo = { nombre: string; contentBase: string; questionsBase: string; intentosBase: string; ownerIdKey: string; ownerId: number };

const CATEGORIA_COLOR: Record<string, string> = {
  "Salud y bienestar": "#0EA5A6",
  "Seguridad y salud en el trabajo": "#C41717",
  "Gestión del riesgo": "#9F1239",
};

// Agrupa las clases de un programa por asignatura (las creadas directo en
// el programa quedan bajo "General del programa") — para que, al entrar a
// un programa con varias asignaturas, no salgan todas sus clases revueltas
// en una sola lista sin indicar de cuál asignatura es cada una.
function agruparPorAsignatura(clases: ClaseProximaEstudiante[]): [string, ClaseProximaEstudiante[]][] {
  const map = new Map<string, ClaseProximaEstudiante[]>();
  for (const c of clases) {
    const key = c.origen === "Asignatura" ? c.origen_nombre : "General del programa";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.entries());
}

interface AnuncioEstudiante { origen: string; origen_nombre: string; titulo: string; mensaje: string; importancia: string; created_at: string }

// Módulo de perfil del estudiante — solo su propia información (nunca la de
// otro). Con estadísticas académicas reales (mismos datos que el home) para
// que sea un panel de verdad, no solo una ficha de contacto.
function PerfilModule({
  programas, cursosVirtuales, cursos, clasesHistorial,
}: { programas: Programa[]; cursosVirtuales: CursoVirtual[]; cursos: CursoLigero[]; clasesHistorial: ClaseProximaEstudiante[] }) {
  const { currentUser } = useCampusAuth();
  const totalItems = programas.length + cursosVirtuales.length + cursos.length;
  const cursoEnProgreso = cursos.find((c) => c.progreso > 0 && c.progreso < 100);
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
                  <span className="w-1.5 h-1.5 rounded-full bg-white" /> Estudiante
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
            <p className="text-slate-400 text-[11px] mt-1">Programas/cursos activos</p>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4 text-[#C41717]" />
            </div>
            {cursoEnProgreso ? (
              <>
                <p className="text-slate-900 font-extrabold text-lg leading-none">{cursoEnProgreso.progreso}%</p>
                <p className="text-slate-400 text-[11px] mt-1 truncate">{cursoEnProgreso.nombre}</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 font-extrabold text-lg leading-none">—</p>
                <p className="text-slate-400 text-[11px] mt-1">Sin curso ligero en progreso</p>
              </>
            )}
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
            <span className="text-slate-800 text-sm font-medium">Estudiante</span>
          </div>
        </div>
        <p className="text-slate-400 text-xs px-1">
          ¿Necesitas corregir tu nombre, correo o identificación? Pídele a un administrador que lo actualice desde Usuarios.
        </p>
      </div>
    </div>
  );
}

export default function EstudianteDashboard() {
  const { currentUser: user, loading: authLoading, logout, isImpersonando, volverAMiCuenta } = useCampusAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<CursoLigero[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cursosVirtuales, setCursosVirtuales] = useState<CursoVirtual[]>([]);
  const [vinculado, setVinculado] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activo, setActivo] = useState<Activo | null>(null);
  // Próximas clases en vivo de TODO lo suyo junto (programas, asignaturas,
  // cursos y cursos ligeros) — se muestran de entrada en el panel principal,
  // sin que tenga que entrar primero a cada card para encontrarlas.
  const [clasesProximas, setClasesProximas] = useState<ClaseProximaEstudiante[]>([]);
  // Historial de clases YA pasadas — mismo feed combinado, pero solo ofrece
  // "Ver grabación" (la reunión en vivo ya terminó, no tiene sentido un
  // botón "Unirse" ahí).
  const [clasesHistorial, setClasesHistorial] = useState<ClaseProximaEstudiante[]>([]);
  // Selección para el bloque nuevo "Todas mis clases virtuales" (lista +
  // detalle) — identifica la fila por una llave compuesta porque estas
  // filas no traen id (vienen de un UNION de 4 tablas distintas).
  const [claseVirtualSeleccionada, setClaseVirtualSeleccionada] = useState<string | null>(null);
  // Anuncios reales de todo lo matriculado, para la barra de "últimas
  // noticias" del home.
  const [anuncios, setAnuncios] = useState<AnuncioEstudiante[]>([]);
  // Filtro de la barra de búsqueda del encabezado — solo aplica sobre las
  // grillas de "Mis programas/cursos/cursos ligeros" del home.
  const [busqueda, setBusqueda] = useState("");
  // Pestaña activa del menú lateral — navegación real (cambia qué se
  // muestra), no un simple scroll a una sección de una página larga.
  const [vistaHome, setVistaHome] = useState<"inicio" | "programas" | "clases" | "perfil">("inicio");
  // Submenú del menú lateral — qué ítem de nivel superior está desplegado.
  const [menuAbierto, setMenuAbierto] = useState<"programas" | "clases" | null>(null);
  // El menú lateral es "hidden lg:flex" (solo escritorio) — sin esto, en
  // celular no había ninguna forma de cambiar de pestaña ni de llegar a
  // "Mi perfil".
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Filtro real del submenú "Clases virtuales" (Próximas / Anteriores).
  const [filtroClases, setFiltroClases] = useState<"todas" | "proximas" | "anteriores">("todas");

  // Un programa/curso/diplomado abierto muestra SUS asignaturas adentro (no
  // una lista suelta de todas mezcladas) — así se ve organizado por dónde
  // realmente pertenece cada una.
  const [programaAbierto, setProgramaAbierto] = useState<Programa | null>(null);
  const [asignaturasPrograma, setAsignaturasPrograma] = useState<Asignatura[]>([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [clasesPrograma, setClasesPrograma] = useState<ClaseProximaEstudiante[]>([]);
  // Conteo real de recursos/cuestionarios por asignatura (mismo endpoint que
  // ya usa ContenidoEditor) — para las tarjetas de métricas junto a "Qué vas
  // a aprender", nada inventado.
  const [contenidoPorAsignatura, setContenidoPorAsignatura] = useState<Record<number, { tipo: string }[]>>({});
  // Cursos virtuales/ligeros no tienen pantalla intermedia como un programa
  // (se entra directo al contenido) — sus clases en vivo se muestran arriba
  // del contenido, dentro de la vista `activo`.
  const [clasesActivo, setClasesActivo] = useState<ClaseVirtualEstudiante[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (user.role !== "estudiante") { navigate("/dashboard", { replace: true }); return; }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "estudiante") return;
    // Cada llamada tiene su propio .catch(): si una sección falla (ej. un
    // 500 por columnas faltantes), las demás igual se muestran en vez de
    // dejar todo el panel vacío (esto pasó una vez con /mis-asignaturas).
    Promise.all([
      apiFetch<{ cursos: CursoLigero[]; vinculado: boolean }>("/mis-cursos-ligeros/list.php").catch(() => ({ cursos: [], vinculado: true })),
      apiFetch<{ programas: Programa[]; vinculado: boolean }>("/mis-programas/list.php").catch(() => ({ programas: [], vinculado: true })),
      apiFetch<{ cursos: CursoVirtual[]; vinculado: boolean }>("/mis-cursos-virtuales/list.php").catch(() => ({ cursos: [], vinculado: true })),
    ])
      .then(([c, p, cv]) => {
        setCursos(c.cursos); setProgramas(p.programas); setCursosVirtuales(cv.cursos);
        setVinculado(c.vinculado && p.vinculado && cv.vinculado);
      })
      .finally(() => setLoading(false));

    apiFetch<{ clases: ClaseProximaEstudiante[] }>("/mis-clases/proximas.php")
      .then((d) => setClasesProximas(d.clases))
      .catch(() => setClasesProximas([]));

    apiFetch<{ clases: ClaseProximaEstudiante[] }>("/mis-clases/historial.php")
      .then((d) => setClasesHistorial(d.clases))
      .catch(() => setClasesHistorial([]));

    apiFetch<{ anuncios: AnuncioEstudiante[] }>("/mis-anuncios/list.php")
      .then((d) => setAnuncios(d.anuncios))
      .catch(() => setAnuncios([]));
  }, [user]);

  // El menú lateral siempre te devuelve al home y cambia la pestaña — nunca
  // solo hace scroll (eso no es un navbar de verdad). También sube el
  // scroll al tope: si estabas abajo del todo viendo el contenido de una
  // asignatura, el cambio de pestaña se sentía "pegado" porque la página
  // cambiaba de contenido pero la posición del scroll se quedaba igual.
  const irATab = (tab: typeof vistaHome) => {
    setActivo(null); setProgramaAbierto(null); setVistaHome(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!programaAbierto) return;
    setLoadingAsignaturas(true);
    apiFetch<{ asignaturas: Asignatura[] }>(`/mis-programas/asignaturas.php?programaId=${programaAbierto.id}`)
      .then((d) => setAsignaturasPrograma(d.asignaturas))
      .catch(() => setAsignaturasPrograma([]))
      .finally(() => setLoadingAsignaturas(false));
    apiFetch<{ clases: ClaseProximaEstudiante[] }>(`/mis-programas/clases.php?programaId=${programaAbierto.id}`)
      .then((d) => setClasesPrograma(d.clases))
      .catch(() => setClasesPrograma([]));
  }, [programaAbierto]);

  // Una vez se sabe qué asignaturas tiene el programa, se trae el contenido
  // real de cada una (mismo candado de acceso que ya usa ContenidoEditor)
  // para contar recursos/cuestionarios reales en sus tarjetas de métricas.
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
    if (activo.ownerIdKey === "cursoId") endpoint = `/mis-cursos-virtuales/clases.php?cursoId=${activo.ownerId}`;
    else if (activo.ownerIdKey === "cursoLigeroId") endpoint = `/mis-cursos-ligeros/clases.php?cursoLigeroId=${activo.ownerId}`;
    else if (activo.ownerIdKey === "asignaturaId") endpoint = `/mis-asignaturas/clases.php?asignaturaId=${activo.ownerId}`;
    if (!endpoint) { setClasesActivo([]); return; }
    apiFetch<{ clases: ClaseVirtualEstudiante[] }>(endpoint)
      .then((d) => setClasesActivo(d.clases))
      .catch(() => setClasesActivo([]));
  }, [activo]);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  if (authLoading || !user || user.role !== "estudiante") return null;

  const sinNada = cursos.length === 0 && programas.length === 0 && cursosVirtuales.length === 0;
  const totalItems = cursos.length + programas.length + cursosVirtuales.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  // Contenido del menú (Inicio / Mis programas / Clases virtuales / Mi
  // perfil) — se usa tal cual en el menú lateral de escritorio y en el
  // panel desplegable de celular, para que ambos naveguen exactamente igual.
  const menuLateralItems = (
    <>
      <button onClick={() => irATab("inicio")}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "inicio" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <LayoutDashboard className="w-4 h-4" /> Inicio
      </button>

      <button
        onClick={() => { irATab("programas"); setMenuAbierto((m) => (m === "programas" ? null : "programas")); }}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!activo && !programaAbierto && vistaHome === "programas" ? "bg-[#C41717]/8 text-[#C41717]" : "text-slate-500 hover:bg-slate-50"}`}>
        <GraduationCap className="w-4 h-4" /> Mis programas
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
          {programas.length + cursosVirtuales.length + cursos.length === 0 && (
            <p className="px-2.5 py-1.5 text-[11px] text-slate-300">Nada todavía</p>
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
          <span>Estás viendo como {user.nombre} (estudiante).</span>
          <button
            onClick={() => { volverAMiCuenta(); navigate("/dashboard", { replace: true }); }}
            className="underline hover:no-underline"
          >
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
            <p className="text-white text-[11px] leading-tight">Estudiante</p>
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

      {/* Menú móvil — mismas opciones y misma navegación que el menú lateral
          de escritorio, se cierra solo al elegir cualquier ítem. */}
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
        {/* Menú lateral — navbar real: cambia la pestaña, no hace scroll. Con
            submenú real en "Mis programas" (cada uno de los tuyos) y
            "Clases virtuales" (Próximas/Anteriores). Solo escritorio — en
            celular lo reemplaza el panel desplegable del botón hamburguesa. */}
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
                <ArrowLeft className="w-3.5 h-3.5" /> {programaAbierto ? `Volver a ${programaAbierto.nombre}` : "Volver a mis cursos"}
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
                <ContenidoEditor
                  contentBase={activo.contentBase}
                  questionsBase={activo.questionsBase}
                  intentosBase={activo.intentosBase}
                  ownerIdKey={activo.ownerIdKey}
                  ownerId={activo.ownerId}
                />
              </Suspense>
            </div>
          </motion.div>
        ) : programaAbierto ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
            <button onClick={() => setProgramaAbierto(null)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis cursos
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-[#C41717]" />
              </div>
              <h1 className="text-slate-900 font-bold text-lg leading-snug">{programaAbierto.nombre}</h1>
            </div>
            {clasesPrograma.filter((c) => !claseYaPaso(c)).length > 0 && (
              <div>
                <SectionHeader icon={Video} label="Clases en vivo" count={clasesPrograma.filter((c) => !claseYaPaso(c)).length} />
                <div className="space-y-4">
                  {agruparPorAsignatura(clasesPrograma.filter((c) => !claseYaPaso(c))).map(([grupo, items]) => (
                    <div key={grupo}>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{grupo}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((c) => (
                          <div key={`${c.origen}-${c.titulo}-${c.fecha_inicio}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4 text-[#C41717]" />
                              </div>
                              <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                            </div>
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
                  ))}
                </div>
              </div>
            )}
            {clasesPrograma.filter((c) => claseYaPaso(c)).length > 0 && (
              <div>
                <SectionHeader icon={PlayCircle} label="Clases anteriores" count={clasesPrograma.filter((c) => claseYaPaso(c)).length} />
                <div className="space-y-4">
                  {agruparPorAsignatura(clasesPrograma.filter((c) => claseYaPaso(c))).map(([grupo, items]) => (
                    <div key={grupo}>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{grupo}</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((c) => (
                          <div key={`${c.origen}-${c.titulo}-${c.fecha_inicio}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <Video className="w-4 h-4 text-slate-400" />
                              </div>
                              <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                            </div>
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
                  ))}
                </div>
              </div>
            )}
            {loadingAsignaturas ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : asignaturasPrograma.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Este programa aún no tiene asignaturas con contenido.</p>
              </div>
            ) : (
              <div>
                <SectionHeader icon={Layers} label="Asignaturas" count={asignaturasPrograma.length} />
                {/* Una tarjeta por asignatura a todo el ancho (imagen fija a
                    la izquierda, el resto a la derecha) — así nunca queda
                    espacio vacío sin importar cuántas asignaturas haya,
                    a diferencia de una grilla de columnas fijas con pocos
                    ítems. Nada inventado: mismos datos reales de siempre. */}
                <div className="space-y-3">
                  {asignaturasPrograma.map((a) => {
                    const contenido = contenidoPorAsignatura[a.id] ?? [];
                    const cuestionarios = contenido.filter((c) => c.tipo === "Cuestionario").length;
                    const comentariosDocente = anuncios.filter((an) => an.origen === "Asignatura" && an.origen_nombre === a.nombre);
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
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold px-3 py-1.5 rounded-full bg-[#C41717]">Entrar</span>
                          </div>
                        </button>
                        <div className="flex-1 min-w-0 grid md:grid-cols-[1fr_260px]">
                          <div className="p-5">
                            <p className="text-slate-800 text-sm font-bold">{a.nombre}</p>
                            {a.docentes && a.docentes.length > 0 && (
                              <p className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
                                <User className="w-3 h-3 text-slate-400 shrink-0" /> {a.docentes.map((d) => d.nombre).join(", ")}
                              </p>
                            )}
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
                              <span className="text-xs text-slate-600">{comentariosDocente.length > 0 ? `${comentariosDocente.length} aviso${comentariosDocente.length !== 1 ? "s" : ""} del docente` : "Sin avisos del docente"}</span>
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
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
            {/* Encabezado simple — el color de marca ahora vive en el panel
                "Hoy" de la derecha, no en una franja gigante arriba. */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-slate-400 text-sm">{greeting},</p>
                <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">{user.nombre}</h1>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C41717]" /> Estudiante
              </span>
            </div>

            {vistaHome === "inicio" && <BarraNoticias anuncios={anuncios} />}

            {vistaHome === "perfil" ? (
              <PerfilModule programas={programas} cursosVirtuales={cursosVirtuales} cursos={cursos} clasesHistorial={clasesHistorial} />
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">

              {/* ───────── Columna principal ───────── */}
              <div className="space-y-5 min-w-0">
                {(vistaHome === "inicio" || vistaHome === "clases") && (clasesProximas.length > 0 || clasesHistorial.length > 0) && (() => {
                  // En la pestaña dedicada, el submenú del menú lateral
                  // (Próximas/Anteriores) sí filtra de verdad la lista.
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
                  // El filtro de la barra de búsqueda solo afecta esta
                  // vista — los contadores reales (hero, tarjetas "Hoy")
                  // siguen mostrando el total real, nunca el filtrado.
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
                  if (!vinculado) return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                      <AlertCircle className="w-8 h-8 text-[#C41717]/50 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium">Tu cuenta todavía no está vinculada a un registro de estudiante.</p>
                      <p className="text-slate-500 text-sm mt-1">Pide a un administrador que complete tu identificación desde Usuarios.</p>
                    </div>
                  );
                  if (sinNada) return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">Aún no estás matriculado en ningún curso o programa.</p>
                    </div>
                  );
                  if (sinResultados) return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">Nada coincide con &quot;{busqueda}&quot;.</p>
                    </div>
                  );
                  const programasHome = programasFiltrados, cursosVirtualesHome = cursosVirtualesFiltrados, cursosHome = cursosFiltrados;
                  return (
                  <div id="mis-programas" className="space-y-5">
                    {programasHome.length > 0 && (
                      <div>
                        <SectionHeader icon={GraduationCap} label="Programas" count={programas.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {programasHome.map((p) => (
                            <ItemCard
                              key={p.id}
                              icon={GraduationCap}
                              title={p.nombre}
                              subtitle={p.descripcion}
                              imagePath={p.imagen_path ? `/programas/imagen.php?id=${p.id}` : null}
                              accent={accentFor(p.nombre)}
                              onClick={() => setProgramaAbierto(p)}
                              footer={
                                p.dias_disponibles != null ? (
                                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                    <Clock className="w-3 h-3 text-slate-400" /> {p.dias_disponibles} días disponibles
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-300">Sin fecha límite</span>
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {cursosVirtualesHome.length > 0 && (
                      <div>
                        <SectionHeader icon={BookOpen} label="Cursos" count={cursosVirtuales.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {cursosVirtualesHome.map((c) => (
                            <ItemCard
                              key={c.id}
                              icon={BookOpen}
                              title={c.codigo_nombre ?? "—"}
                              subtitle={c.descripcion}
                              imagePath={c.imagen_path ? `/cursos/imagen.php?id=${c.id}` : null}
                              accent={accentFor(c.codigo_nombre ?? String(c.id))}
                              onClick={() => setActivo({ nombre: c.codigo_nombre ?? "Curso", contentBase: "/curso-contenido", questionsBase: "/curso-preguntas", intentosBase: "/curso-cuestionario-intentos", ownerIdKey: "cursoId", ownerId: c.id })}
                              footer={
                                <div className="space-y-1.5">
                                  {c.docente_nombre && (
                                    <p className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                                      <User className="w-3 h-3 text-slate-400 shrink-0" /> {c.docente_nombre}
                                    </p>
                                  )}
                                  {c.dias_disponibles != null ? (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                      <Clock className="w-3 h-3 text-slate-400" /> {c.dias_disponibles} días disponibles
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-300">Sin fecha límite</span>
                                  )}
                                </div>
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {cursosHome.length > 0 && (
                      <div>
                        <SectionHeader icon={BookOpen} label="Cursos ligeros" count={cursos.length} />
                        <div className="grid sm:grid-cols-2 gap-3">
                          {cursosHome.map((c) => {
                            const color = CATEGORIA_COLOR[c.categoria ?? ""] ?? accentFor(c.nombre);
                            return (
                              <ItemCard
                                key={c.id}
                                icon={BookOpen}
                                title={c.nombre}
                                subtitle={c.categoria}
                                imagePath={c.imagen_path ? `/cursos-ligeros/imagen.php?id=${c.id}` : null}
                                accent={color}
                                onClick={() => setActivo({ nombre: c.nombre, contentBase: "/curso-ligero-contenido", questionsBase: "/curso-ligero-preguntas", intentosBase: "/curso-ligero-cuestionario-intentos", ownerIdKey: "cursoLigeroId", ownerId: c.id })}
                                footer={
                                  <div className="space-y-1.5">
                                    {c.docente_nombre && (
                                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                                        <User className="w-3 h-3 text-slate-400 shrink-0" /> {c.docente_nombre}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${c.progreso}%`, backgroundColor: color }} />
                                      </div>
                                      <span className="text-[11px] font-bold shrink-0" style={{ color }}>{c.progreso}%</span>
                                    </div>
                                  </div>
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })()}
              </div>

              {/* ───────── Panel lateral "Hoy" ───────── */}
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

                {!loading && vinculado && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
                    <a href={totalItems > 0 ? "#mis-programas" : undefined}
                      className={`flex items-center gap-3 px-4 py-3 ${totalItems > 0 ? "hover:bg-slate-50 transition-colors" : ""}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-[#C41717]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-400 text-[11px]">Matriculado en</p>
                        <p className={`font-bold text-sm ${totalItems > 0 ? "text-slate-900" : "text-slate-300"}`}>
                          {totalItems > 0 ? `${totalItems} programa${totalItems !== 1 ? "s" : ""}/curso${totalItems !== 1 ? "s" : ""}` : "aún nada"}
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
        )}
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
