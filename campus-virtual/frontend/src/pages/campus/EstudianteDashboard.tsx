import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut, BookOpen, GraduationCap, Layers, ArrowLeft, AlertCircle, Loader2,
  Clock, User, ChevronRight, Sparkles, Video, PlayCircle, Calendar, Bell,
} from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch, apiImage } from "@/lib/api";
import { CuentaSwitcher } from "./CuentaSwitcher";
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
}
interface ClaseProximaEstudiante {
  origen: "Programa" | "Asignatura" | "Curso" | "Curso ligero";
  origen_nombre: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  link_reunion: string | null;
  grabacion_url: string | null;
}
type Activo = { nombre: string; contentBase: string; questionsBase: string; ownerIdKey: string; ownerId: number };

const CATEGORIA_COLOR: Record<string, string> = {
  "Salud y bienestar": "#0EA5A6",
  "Seguridad y salud en el trabajo": "#C41717",
  "Gestión del riesgo": "#9F1239",
};

// Paleta de acento cuando no hay categoría/imagen — variedad visual estable
// por nombre (mismo ítem siempre cae en el mismo color).
const ACCENT_PALETTE = ["#C41717", "#1E3A5F", "#9F1239", "#065F46", "#6B21A8", "#92400E"];
const accentFor = (seed: string) =>
  ACCENT_PALETTE[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENT_PALETTE.length];

// Una clase ya pasada no debe ofrecer "Unirse" (confunde — la reunión en
// vivo ya terminó), solo "Ver grabación" si ya está lista.
const claseYaPaso = (c: { fecha_inicio: string; fecha_fin: string | null }) =>
  new Date(c.fecha_fin ?? c.fecha_inicio).getTime() < Date.now();

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

/* ── Imagen protegida (requiere Authorization) para las tarjetas ──────────── */
function CardImage({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(path).then((u) => { if (!cancelled) { objectUrl = u; setUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);

  if (!url) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
}

/* ── Tarjeta de curso/programa/asignatura — hero con imagen o degradado ──── */
function ItemCard({
  icon: Icon, title, subtitle, imagePath, accent, footer, onClick,
}: {
  icon: React.ElementType; title: string; subtitle?: string | null; imagePath?: string | null;
  accent: string; footer: React.ReactNode; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] transition-shadow duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {imagePath ? (
          <CardImage path={imagePath} alt={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${accent}E6 0%, ${accent}99 100%)` }}>
            <div className="absolute inset-0 opacity-[0.15]" style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
              backgroundSize: "18px 18px",
            }} />
            <Icon className="w-10 h-10 text-white/90 relative z-10" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold text-[#C41717] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Entrar <ChevronRight className="w-3 h-3" />
        </span>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="mt-auto pt-1">{footer}</div>
      </div>
    </motion.button>
  );
}

function SectionHeader({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#C41717]" />
      </div>
      <h2 className="text-slate-700 text-sm font-bold">{label}</h2>
      <span className="text-slate-400 text-xs font-semibold">{count}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* ── Campana de notificaciones — una por cada clase en vivo a la que el
     estudiante tiene acceso (mismo feed que "Próximas clases en vivo"),
     para avisarle aunque no esté mirando el home en ese momento. ── */
function NotificacionesBell({ clases }: { clases: ClaseProximaEstudiante[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen((v) => !v)} title="Notificaciones"
        className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all">
        <Bell className="w-4 h-4" />
        {clases.length > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-white
                           text-[#C41717] text-[9px] font-bold leading-[15px] text-center">
            {clases.length > 9 ? "9+" : clases.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-xl bg-white border border-slate-200
                         shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-50 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-slate-700 text-sm font-bold">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {clases.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay notificaciones nuevas.</p>
            ) : (
              clases.map((c, i) => (
                <a key={i} href={c.link_reunion ?? undefined} target={c.link_reunion ? "_blank" : undefined} rel="noopener noreferrer"
                  className={`flex items-start gap-2.5 px-4 py-3 transition-colors ${c.link_reunion ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}`}>
                  <div className="w-7 h-7 rounded-lg bg-[#C41717]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Video className="w-3.5 h-3.5 text-[#C41717]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 text-xs font-semibold">Próxima clase, no te la pierdas</p>
                    <p className="text-slate-600 text-xs truncate">{c.titulo}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {c.origen}: {c.origen_nombre} · {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
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

  // Un programa/curso/diplomado abierto muestra SUS asignaturas adentro (no
  // una lista suelta de todas mezcladas) — así se ve organizado por dónde
  // realmente pertenece cada una.
  const [programaAbierto, setProgramaAbierto] = useState<Programa | null>(null);
  const [asignaturasPrograma, setAsignaturasPrograma] = useState<Asignatura[]>([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [clasesPrograma, setClasesPrograma] = useState<ClaseProximaEstudiante[]>([]);
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
  }, [user]);

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
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14 max-w-6xl mx-auto w-full">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ padding: "4px 10px" }}>
            <img src={gfoLogo} alt="GFO Academy" className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold leading-tight truncate">{user.nombre}</p>
            <p className="text-white/70 text-[11px] leading-tight">Estudiante</p>
          </div>
          <NotificacionesBell clases={clasesProximas} />
          <CuentaSwitcher />
          <button onClick={handleLogout} title="Cerrar sesión"
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
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
                        <div className="flex items-center gap-2 mt-1">
                          {c.grabacion_url ? (
                            <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-lg px-3 py-1.5 transition-colors">
                              <PlayCircle className="w-3.5 h-3.5" /> Ver grabación
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-300">Grabación en proceso...</span>
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
                            <div className="flex items-center gap-2 mt-1">
                              {c.grabacion_url ? (
                                <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-lg px-3 py-1.5 transition-colors">
                                  <PlayCircle className="w-3.5 h-3.5" /> Ver grabación
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-300">Grabación en proceso...</span>
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {asignaturasPrograma.map((a) => (
                    <ItemCard
                      key={a.id}
                      icon={Layers}
                      title={a.nombre}
                      subtitle={a.descripcion}
                      imagePath={a.imagen_path ? `/asignaturas/imagen.php?id=${a.id}` : null}
                      accent={accentFor(a.nombre)}
                      onClick={() => setActivo({ nombre: a.nombre, contentBase: "/asignatura-contenido", questionsBase: "/asignatura-preguntas", ownerIdKey: "asignaturaId", ownerId: a.id })}
                      footer={
                        <div className="space-y-1.5">
                          {a.docentes && a.docentes.length > 0 && (
                            <p className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" /> {a.docentes.map((d) => d.nombre).join(", ")}
                            </p>
                          )}
                          {a.dias_disponibles != null ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" /> {a.dias_disponibles} días disponibles
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
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-7">
            {/* Banner de bienvenida — misma línea que el panel administrativo */}
            <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-50/60 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-slate-500 text-sm mb-1">{greeting},</p>
                  <h1 className="text-slate-900 font-bold text-2xl sm:text-3xl leading-tight">{user.nombre}</h1>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#C41717]/10 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41717] animate-pulse" /> Estudiante
                  </span>
                </div>
                {!loading && vinculado && totalItems > 0 && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-5 py-3 border border-slate-200 shrink-0">
                    <Sparkles className="w-4 h-4 text-[#C41717]/60" />
                    <div>
                      <p className="text-slate-800 font-bold text-xl leading-none">{totalItems}</p>
                      <p className="text-slate-400 text-[10px] tracking-wide mt-0.5">matriculado{totalItems !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {clasesProximas.length > 0 && (
              <div>
                <SectionHeader icon={Video} label="Próximas clases en vivo" count={clasesProximas.length} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clasesProximas.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-[#C41717]" />
                        </div>
                        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">{c.origen}: {c.origen_nombre}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {c.link_reunion && (
                        <a href={c.link_reunion} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#C41717] hover:bg-[#A81212] rounded-lg px-3 py-1.5 transition-colors mt-1">
                          <Video className="w-3.5 h-3.5" /> Unirse
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clasesHistorial.length > 0 && (
              <div>
                <SectionHeader icon={PlayCircle} label="Histórico de clases virtuales" count={clasesHistorial.length} />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clasesHistorial.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <Video className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">{c.origen}: {c.origen_nombre}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      {c.grabacion_url ? (
                        <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-lg px-3 py-1.5 transition-colors mt-1">
                          <PlayCircle className="w-3.5 h-3.5" /> Ver grabación
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-300 mt-1">Grabación en proceso...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : !vinculado ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <AlertCircle className="w-8 h-8 text-[#C41717]/50 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Tu cuenta todavía no está vinculada a un registro de estudiante.</p>
                <p className="text-slate-500 text-sm mt-1">Pide a un administrador que complete tu identificación desde Usuarios.</p>
              </div>
            ) : sinNada ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no estás matriculado en ningún curso o programa.</p>
              </div>
            ) : (
              <>
                {programas.length > 0 && (
                  <div>
                    <SectionHeader icon={GraduationCap} label="Programas" count={programas.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {programas.map((p) => (
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

                {cursosVirtuales.length > 0 && (
                  <div>
                    <SectionHeader icon={BookOpen} label="Cursos" count={cursosVirtuales.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cursosVirtuales.map((c) => (
                        <ItemCard
                          key={c.id}
                          icon={BookOpen}
                          title={c.codigo_nombre ?? "—"}
                          subtitle={c.descripcion}
                          imagePath={c.imagen_path ? `/cursos/imagen.php?id=${c.id}` : null}
                          accent={accentFor(c.codigo_nombre ?? String(c.id))}
                          onClick={() => setActivo({ nombre: c.codigo_nombre ?? "Curso", contentBase: "/curso-contenido", questionsBase: "/curso-preguntas", ownerIdKey: "cursoId", ownerId: c.id })}
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

                {cursos.length > 0 && (
                  <div>
                    <SectionHeader icon={BookOpen} label="Cursos ligeros" count={cursos.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cursos.map((c) => {
                        const color = CATEGORIA_COLOR[c.categoria ?? ""] ?? accentFor(c.nombre);
                        return (
                          <ItemCard
                            key={c.id}
                            icon={BookOpen}
                            title={c.nombre}
                            subtitle={c.categoria}
                            imagePath={c.imagen_path ? `/cursos-ligeros/imagen.php?id=${c.id}` : null}
                            accent={color}
                            onClick={() => setActivo({ nombre: c.nombre, contentBase: "/curso-ligero-contenido", questionsBase: "/curso-ligero-preguntas", ownerIdKey: "cursoLigeroId", ownerId: c.id })}
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
              </>
            )}
          </motion.div>
        )}
      </main>

      <footer className="py-4 px-6 flex items-center justify-center">
        <p className="text-slate-400 text-[10px] tracking-wide">© {new Date().getFullYear()} GFO Academy. Campus Virtual</p>
      </footer>
    </div>
  );
}
