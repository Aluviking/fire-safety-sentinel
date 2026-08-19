import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, BookOpen, GraduationCap, ArrowLeft, AlertCircle, Loader2, Users } from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { apiFetch } from "@/lib/api";

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
  estado: string;
  inscritos: number;
}
interface Estudiante { id?: number; identificacion: string; nombre_completo: string; estado?: string; progreso?: number; estado_acceso?: string }

type Seleccion = { tipo: "curso"; curso: Curso } | { tipo: "ligero"; curso: CursoLigero };

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

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#C41717] border-b border-[#A81212] shadow-sm">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14 max-w-5xl mx-auto w-full">
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

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-5xl w-full mx-auto">
        {seleccion ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
            <div className="p-5 sm:p-6">
              <button onClick={() => setSeleccion(null)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#C41717] transition-colors mb-4">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a mis cursos
              </button>
              <h1 className="text-slate-900 font-bold text-lg mb-1">
                {seleccion.tipo === "curso" ? seleccion.curso.codigo_nombre : seleccion.curso.nombre}
              </h1>
              <p className="text-slate-500 text-xs mb-4">{roster.length} estudiante{roster.length !== 1 ? "s" : ""} matriculado{roster.length !== 1 ? "s" : ""} · solo lectura</p>

              {rosterLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
              ) : roster.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes matriculados.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {roster.map((e, idx) => (
                    <div key={e.id ?? idx} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{e.nombre_completo ?? e.identificacion}</p>
                        <p className="text-xs text-slate-400">{e.identificacion}</p>
                      </div>
                      {seleccion.tipo === "ligero" && e.progreso != null && (
                        <span className="text-xs font-semibold text-slate-500 shrink-0">{e.progreso}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-slate-900 font-bold text-xl mb-1">Mis cursos</h1>
            <p className="text-slate-500 text-sm mb-5">Cursos donde figuras como docente asignado en GFO Academy.</p>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : !vinculado ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <AlertCircle className="w-8 h-8 text-[#C41717]/50 mx-auto mb-3" />
                <p className="text-slate-700 font-medium">Tu cuenta todavía no está vinculada a un registro de docente.</p>
                <p className="text-slate-500 text-sm mt-1">Pide a un administrador que complete tu identificación desde Usuarios.</p>
              </div>
            ) : totalCursos === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no tienes cursos asignados.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {cursos.length > 0 && (
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mb-2.5">Cursos</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cursos.map((c) => (
                        <button key={c.id} onClick={() => setSeleccion({ tipo: "curso", curso: c })}
                          className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-4 h-4 text-[#C41717]/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{c.codigo_nombre ?? "—"}</p>
                              <p className="text-[11px] text-slate-400 truncate">{c.periodo ?? "Sin período"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {c.matriculados} matriculado{c.matriculados !== 1 ? "s" : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {cursosLigeros.length > 0 && (
                  <div>
                    <h2 className="text-slate-400 text-xs font-bold tracking-[0.15em] uppercase mb-2.5">Cursos ligeros</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cursosLigeros.map((c) => (
                        <button key={c.id} onClick={() => setSeleccion({ tipo: "ligero", curso: c })}
                          className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-[#C41717]/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{c.nombre}</p>
                              {c.categoria && <p className="text-[11px] text-slate-400 truncate">{c.categoria}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {c.inscritos} inscrito{c.inscritos !== 1 ? "s" : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
