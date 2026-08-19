import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, BookOpen, GraduationCap, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch, apiImage } from "@/lib/api";
import ContenidoEditor from "./ContenidoEditor";

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
}
type Activo = { tipo: "curso"; nombre: string; contentBase: string; questionsBase: string; ownerIdKey: string; ownerId: number };

const CATEGORIA_COLOR: Record<string, string> = {
  "Salud y bienestar": "#0EA5A6",
  "Seguridad y salud en el trabajo": "#C41717",
  "Gestión del riesgo": "#9F1239",
};

/* ── Imagen protegida (requiere Authorization) para las tarjetas ──────────── */
function CardImage({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(path).then((u) => { if (!cancelled) { objectUrl = u; setUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);

  if (!url) return <div className="w-full aspect-video bg-slate-100 animate-pulse" />;
  return <img src={url} alt={alt} className="w-full aspect-video object-cover" />;
}

export default function EstudianteDashboard() {
  const { currentUser: user, loading: authLoading, logout } = useCampusAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<CursoLigero[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [vinculado, setVinculado] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activo, setActivo] = useState<Activo | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (user.role !== "estudiante") { navigate("/dashboard", { replace: true }); return; }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "estudiante") return;
    Promise.all([
      apiFetch<{ cursos: CursoLigero[]; vinculado: boolean }>("/mis-cursos-ligeros/list.php"),
      apiFetch<{ programas: Programa[]; vinculado: boolean }>("/mis-programas/list.php"),
      apiFetch<{ asignaturas: Asignatura[]; vinculado: boolean }>("/mis-asignaturas/list.php"),
    ])
      .then(([c, p, a]) => { setCursos(c.cursos); setProgramas(p.programas); setAsignaturas(a.asignaturas); setVinculado(c.vinculado); })
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  if (authLoading || !user || user.role !== "estudiante") return null;

  const sinNada = cursos.length === 0 && programas.length === 0 && asignaturas.length === 0;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#C41717] border-b border-[#A81212] shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14 max-w-5xl mx-auto w-full">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ padding: "4px 10px" }}>
            <img src={gfoLogo} alt="GFO Academy" className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold leading-tight truncate">{user.nombre}</p>
            <p className="text-white/70 text-[11px] leading-tight">Estudiante</p>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión"
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto">
        {activo ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
            <div className="p-5 sm:p-6">
              <button onClick={() => setActivo(null)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C41717] transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis cursos
              </button>
              <h1 className="text-slate-900 font-bold text-lg mb-4">{activo.nombre}</h1>
              <ContenidoEditor
                contentBase={activo.contentBase}
                questionsBase={activo.questionsBase}
                ownerIdKey={activo.ownerIdKey}
                ownerId={activo.ownerId}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div>
              <h1 className="text-slate-900 font-bold text-xl mb-1">Mis cursos y programas</h1>
              <p className="text-slate-500 text-sm">En los que estás matriculado en GFO Academy.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : !vinculado ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <AlertCircle className="w-8 h-8 text-[#C41717]/50 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Tu cuenta todavía no está vinculada a un registro de estudiante.</p>
                <p className="text-slate-500 text-sm mt-1">Pide a un administrador que complete tu identificación desde Usuarios.</p>
              </div>
            ) : sinNada ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no estás matriculado en ningún curso o programa.</p>
              </div>
            ) : (
              <>
                {programas.length > 0 && (
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mb-2.5">Programas</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {programas.map((p) => (
                        <button key={p.id}
                          onClick={() => setActivo({ tipo: "curso", nombre: p.nombre, contentBase: "/programa-contenido", questionsBase: "/programa-preguntas", ownerIdKey: "programaId", ownerId: p.id })}
                          className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
                          {p.imagen_path ? (
                            <CardImage path={`/programas/imagen.php?id=${p.id}`} alt={p.nombre} />
                          ) : (
                            <div className="w-full aspect-video bg-[#C41717]/8 flex items-center justify-center">
                              <GraduationCap className="w-7 h-7 text-[#C41717]/40" />
                            </div>
                          )}
                          <div className="p-4 space-y-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                            {p.descripcion && <p className="text-xs text-slate-500 line-clamp-2">{p.descripcion}</p>}
                            {p.dias_disponibles != null && <p className="text-[11px] text-slate-400">{p.dias_disponibles} días disponibles</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {asignaturas.length > 0 && (
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mb-2.5">Asignaturas</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {asignaturas.map((a) => (
                        <button key={a.id}
                          onClick={() => setActivo({ tipo: "curso", nombre: a.nombre, contentBase: "/asignatura-contenido", questionsBase: "/asignatura-preguntas", ownerIdKey: "asignaturaId", ownerId: a.id })}
                          className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
                          {a.imagen_path ? (
                            <CardImage path={`/asignaturas/imagen.php?id=${a.id}`} alt={a.nombre} />
                          ) : (
                            <div className="w-full aspect-video bg-[#C41717]/8 flex items-center justify-center">
                              <BookOpen className="w-7 h-7 text-[#C41717]/40" />
                            </div>
                          )}
                          <div className="p-4 space-y-1">
                            <p className="text-sm font-semibold text-slate-800 truncate">{a.nombre}</p>
                            {a.descripcion && <p className="text-xs text-slate-500 line-clamp-2">{a.descripcion}</p>}
                            {a.dias_disponibles != null && <p className="text-[11px] text-slate-400">{a.dias_disponibles} días disponibles</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {cursos.length > 0 && (
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mb-2.5">Cursos ligeros</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cursos.map((c) => {
                        const color = CATEGORIA_COLOR[c.categoria ?? ""] ?? "#64748B";
                        return (
                          <button key={c.id}
                            onClick={() => setActivo({ tipo: "curso", nombre: c.nombre, contentBase: "/curso-ligero-contenido", questionsBase: "/curso-ligero-preguntas", ownerIdKey: "cursoLigeroId", ownerId: c.id })}
                            className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden">
                            <div className="h-1.5" style={{ backgroundColor: color }} />
                            <div className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}>
                                  <BookOpen className="w-4 h-4" style={{ color }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800 truncate">{c.nombre}</p>
                                  {c.categoria && <p className="text-[11px] text-slate-400 truncate">{c.categoria}</p>}
                                </div>
                              </div>
                              {c.docente_nombre && <p className="text-xs text-slate-500">Docente: {c.docente_nombre}</p>}
                              <div className="flex items-center gap-2 pt-1">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${c.progreso}%`, backgroundColor: color }} />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500 shrink-0">{c.progreso}%</span>
                              </div>
                            </div>
                          </button>
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
