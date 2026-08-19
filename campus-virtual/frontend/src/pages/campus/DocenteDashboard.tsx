import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut, BookOpen, GraduationCap, ArrowLeft, AlertCircle, Loader2, Users,
  ChevronRight, Sparkles,
} from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch, apiImage } from "@/lib/api";

interface Curso {
  id: number;
  codigo_nombre: string | null;
  periodo: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cerrado: string | null;
  matriculados: number;
}
interface CursoLigero {
  id: number;
  nombre: string;
  categoria: string | null;
  imagen_path: string | null;
  estado: string;
  inscritos: number;
}
interface Estudiante { id?: number; identificacion: string; nombre_completo: string; estado?: string; progreso?: number; estado_acceso?: string }

type Seleccion = { tipo: "curso"; curso: Curso } | { tipo: "ligero"; curso: CursoLigero };

const ACCENT_PALETTE = ["#C41717", "#1E3A5F", "#9F1239", "#065F46", "#6B21A8", "#92400E"];
const accentFor = (seed: string) =>
  ACCENT_PALETTE[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENT_PALETTE.length];

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
          Ver estudiantes <ChevronRight className="w-3 h-3" />
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

export default function DocenteDashboard() {
  const { currentUser: user, loading: authLoading, logout } = useCampusAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursosLigeros, setCursosLigeros] = useState<CursoLigero[]>([]);
  const [vinculado, setVinculado] = useState(true);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [roster, setRoster] = useState<Estudiante[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/", { replace: true }); return; }
    if (user.role !== "docente") { navigate("/dashboard", { replace: true }); return; }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user || user.role !== "docente") return;
    apiFetch<{ cursos: Curso[]; cursosLigeros: CursoLigero[]; vinculado: boolean }>("/mis-cursos/list.php")
      .then((d) => { setCursos(d.cursos); setCursosLigeros(d.cursosLigeros); setVinculado(d.vinculado); })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!seleccion) { setRoster([]); return; }
    setRosterLoading(true);
    const req = seleccion.tipo === "curso"
      ? apiFetch<{ estudiantes: Estudiante[] }>(`/mis-cursos/roster.php?cursoId=${seleccion.curso.id}`)
      : apiFetch<{ estudiantes: Estudiante[] }>(`/mis-cursos/roster-ligero.php?cursoLigeroId=${seleccion.curso.id}`);
    req.then((d) => setRoster(d.estudiantes)).finally(() => setRosterLoading(false));
  }, [seleccion]);

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  if (authLoading || !user || user.role !== "docente") return null;

  const totalCursos = cursos.length + cursosLigeros.length;
  const totalEstudiantes = cursos.reduce((s, c) => s + c.matriculados, 0) + cursosLigeros.reduce((s, c) => s + c.inscritos, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#C41717] border-b border-[#A81212] shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14 max-w-6xl mx-auto w-full">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0" style={{ padding: "4px 10px" }}>
            <img src={gfoLogo} alt="GFO Academy" className="h-7 w-auto object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold leading-tight truncate">{user.nombre}</p>
            <p className="text-white/70 text-[11px] leading-tight">Docente</p>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión"
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-all shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-6xl w-full mx-auto">
        {seleccion ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
            <div className="p-5 sm:p-7">
              <button onClick={() => setSeleccion(null)} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis cursos
              </button>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                  {seleccion.tipo === "curso" ? <GraduationCap className="w-5 h-5 text-[#C41717]" /> : <BookOpen className="w-5 h-5 text-[#C41717]" />}
                </div>
                <h1 className="text-slate-900 font-bold text-lg leading-snug">
                  {seleccion.tipo === "curso" ? seleccion.curso.codigo_nombre : seleccion.curso.nombre}
                </h1>
              </div>
              <p className="text-slate-400 text-xs mb-5 ml-[52px]">
                {roster.length} estudiante{roster.length !== 1 ? "s" : ""} matriculado{roster.length !== 1 ? "s" : ""} · solo lectura
              </p>

              {rosterLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
              ) : roster.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes matriculados.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {roster.map((e, idx) => (
                    <div key={e.id ?? idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/70 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[#C41717]/10 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#C41717] text-xs font-bold">{(e.nombre_completo ?? e.identificacion).charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{e.nombre_completo ?? e.identificacion}</p>
                        <p className="text-xs text-slate-400">{e.identificacion}</p>
                      </div>
                      {seleccion.tipo === "ligero" && e.progreso != null && (
                        <span className="text-xs font-bold text-[#C41717] shrink-0">{e.progreso}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C41717] animate-pulse" /> Docente
                  </span>
                </div>
                {!loading && vinculado && totalCursos > 0 && (
                  <div className="flex gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                      <Sparkles className="w-4 h-4 text-[#C41717]/60" />
                      <div>
                        <p className="text-slate-800 font-bold text-xl leading-none">{totalCursos}</p>
                        <p className="text-slate-400 text-[10px] tracking-wide mt-0.5">curso{totalCursos !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                      <Users className="w-4 h-4 text-[#C41717]/60" />
                      <div>
                        <p className="text-slate-800 font-bold text-xl leading-none">{totalEstudiantes}</p>
                        <p className="text-slate-400 text-[10px] tracking-wide mt-0.5">estudiante{totalEstudiantes !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : !vinculado ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <AlertCircle className="w-8 h-8 text-[#C41717]/50 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Tu cuenta todavía no está vinculada a un registro de docente.</p>
                <p className="text-slate-500 text-sm mt-1">Pide a un administrador que complete tu identificación desde Usuarios.</p>
              </div>
            ) : totalCursos === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no tienes cursos asignados.</p>
              </div>
            ) : (
              <>
                {cursos.length > 0 && (
                  <div>
                    <SectionHeader icon={GraduationCap} label="Cursos" count={cursos.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cursos.map((c) => (
                        <ItemCard
                          key={c.id}
                          icon={GraduationCap}
                          title={c.codigo_nombre ?? "—"}
                          subtitle={c.periodo ? `Período ${c.periodo}` : null}
                          accent={accentFor(c.codigo_nombre ?? String(c.id))}
                          onClick={() => setSeleccion({ tipo: "curso", curso: c })}
                          footer={
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Users className="w-3 h-3 text-slate-400" /> {c.matriculados} matriculado{c.matriculados !== 1 ? "s" : ""}
                            </span>
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
                {cursosLigeros.length > 0 && (
                  <div>
                    <SectionHeader icon={BookOpen} label="Cursos ligeros" count={cursosLigeros.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cursosLigeros.map((c) => (
                        <ItemCard
                          key={c.id}
                          icon={BookOpen}
                          title={c.nombre}
                          subtitle={c.categoria}
                          imagePath={c.imagen_path ? `/cursos-ligeros/imagen.php?id=${c.id}` : null}
                          accent={accentFor(c.nombre)}
                          onClick={() => setSeleccion({ tipo: "ligero", curso: c })}
                          footer={
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Users className="w-3 h-3 text-slate-400" /> {c.inscritos} inscrito{c.inscritos !== 1 ? "s" : ""}
                            </span>
                          }
                        />
                      ))}
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
