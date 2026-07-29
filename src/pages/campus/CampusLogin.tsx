import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Lock, User, ChevronRight } from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.jpeg";

export const CAMPUS_SESSION = "campus_session";

export interface CampusUser {
  username: string;
  nombre: string;
  rol: string;
}

const DEMO_CREDS: (CampusUser & { password: string })[] = [
  { username: "estudiante", password: "Campus2024!", nombre: "Estudiante Demo",   rol: "Estudiante"    },
  { username: "docente",    password: "Docente2024!", nombre: "Docente Demo",      rol: "Docente"       },
  { username: "admin",      password: "Admin2024!",   nombre: "Administrador GFO", rol: "Administrador" },
];

/* ── GFO Academy Logo ─────────────────────────────────────────────────────── */
const GFOLogo = ({ size = "lg" }: { size?: "sm" | "lg" }) => (
  <div
    className={`rounded-2xl bg-white border border-slate-200
                shadow-[0_4px_24px_rgba(0,0,0,0.10)]
                flex items-center justify-center overflow-hidden
                ${size === "lg" ? "p-5 w-52 h-52" : "p-2 w-28 h-28"}`}
  >
    <img src={gfoLogo} alt="GFO Academy" className="w-full h-full object-contain" />
  </div>
);

/* ── Decorative grid background ───────────────────────────────────────────── */
const GridBg = () => (
  <div
    className="absolute inset-0 opacity-[0.045]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
      backgroundSize: "56px 56px",
    }}
  />
);

/* ══ Main Component ═══════════════════════════════════════════════════════════ */
export default function CampusLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CAMPUS_SESSION);
      if (raw) navigate("/campus/dashboard", { replace: true });
    } catch {}
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const found = DEMO_CREDS.find((c) => c.username === username.trim() && c.password === password);
      if (found) {
        const user: CampusUser = { username: found.username, nombre: found.nombre, rol: found.rol };
        localStorage.setItem(CAMPUS_SESSION, JSON.stringify(user));
        navigate("/campus/dashboard");
      } else {
        setError("Nombre de usuario o contraseña incorrectos.");
        setLoading(false);
      }
    }, 650);
  };

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">

      {/* ══ PANEL IZQUIERDO — Branding ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden bg-white"
      >
        {/* Blobs decorativos */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-[#C41717]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[360px] h-[360px] rounded-full bg-[#C41717]/[0.03] blur-[100px] pointer-events-none" />
        <GridBg />

        {/* Barra accent izquierda */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-[#C41717]/60 to-transparent" />

        {/* Contenido centrado */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-14 xl:px-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mb-10"
          >
            <GFOLogo size="lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <p className="text-slate-400 text-xs font-semibold tracking-[0.28em] uppercase mb-4">
              Le damos la bienvenida a
            </p>

            <h1 className="text-slate-900 font-black text-4xl xl:text-[2.6rem] leading-[1.08] tracking-tight">
              GESTIÓN Y<br />
              <span style={{ color: "#C41717" }}>FORMACIÓN</span>
              <br />ORGANIZACIONAL
            </h1>

            <div className="flex items-center justify-center gap-3 my-6">
              <div className="h-px w-14 bg-[#C41717]/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C41717]/55" />
              <div className="h-px w-14 bg-[#C41717]/35" />
            </div>

            <p className="text-slate-500 text-sm leading-relaxed max-w-[300px] mx-auto">
              Plataforma académica integral para el desarrollo y formación
              profesional en HSE y gestión organizacional.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex items-center gap-10 mt-10 pt-10 border-t border-slate-200 w-full justify-center"
          >
            {[
              { n: "20+",  l: "Años"        },
              { n: "500+", l: "Estudiantes" },
              { n: "30+",  l: "Programas"   },
            ].map(({ n, l }) => (
              <div key={l} className="flex flex-col items-center gap-1.5">
                <span className="text-[1.6rem] font-black text-slate-900 leading-none">{n}</span>
                <span className="text-[10px] text-slate-400 tracking-[0.18em] uppercase">{l}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className="relative z-10 py-5 text-center border-t border-slate-100">
          <p className="text-slate-300 text-[10px] tracking-[0.22em] uppercase">
            GFO Academy · Campus Virtual · {new Date().getFullYear()}
          </p>
        </div>
      </motion.div>

      {/* ══ PANEL DERECHO — Formulario ════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center items-center px-6 sm:px-14 lg:px-16 py-12 relative bg-[#F1F5F9]"
      >
        {/* Blob suave */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#C41717]/[0.03] blur-[80px] pointer-events-none" />

        {/* Volver al sitio */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5
                     text-slate-400 hover:text-slate-600 text-xs tracking-wide transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al sitio
        </Link>

        {/* Logo mobile */}
        <div className="lg:hidden mb-8">
          <GFOLogo size="sm" />
        </div>

        <div className="w-full max-w-[390px] relative z-10">
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="text-slate-900 font-bold text-2xl xl:text-[1.65rem] mb-2 tracking-tight">
              Ingresa a tu cuenta
            </h2>
            <p className="text-slate-500 text-sm">
              Accede al Campus Virtual de GFO Academy
            </p>
          </motion.div>

          {/* Formulario */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            {/* Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-[10.5px] font-bold tracking-[0.14em] uppercase">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu usuario"
                  required
                  autoComplete="username"
                  className="w-full bg-white border border-slate-200 rounded-xl
                             pl-10 pr-4 py-3.5 text-slate-800 text-sm placeholder:text-slate-400
                             focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10
                             transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-500 text-[10.5px] font-bold tracking-[0.14em] uppercase">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white border border-slate-200 rounded-xl
                             pl-10 pr-11 py-3.5 text-slate-800 text-sm placeholder:text-slate-400
                             focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10
                             transition-all duration-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Recordarme + contraseña olvidada */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div
                  role="checkbox"
                  aria-checked={remember}
                  tabIndex={0}
                  onClick={() => setRemember(!remember)}
                  onKeyDown={(e) => e.key === " " && setRemember(!remember)}
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center
                              transition-all duration-200 cursor-pointer
                              ${remember
                                ? "bg-[#C41717] border-[#C41717]"
                                : "bg-white border-slate-300 group-hover:border-slate-400"}`}
                >
                  {remember && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <span className="text-slate-500 text-sm">¿Recordarme?</span>
              </label>
              <button
                type="button"
                className="text-[#C41717]/80 hover:text-[#C41717] text-sm transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-50 border border-red-200
                           rounded-xl px-4 py-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-red-600 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Botón ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-1 py-[14px]
                         rounded-xl font-bold text-sm tracking-[0.06em] text-white
                         bg-[#C41717] hover:bg-[#B01313]
                         shadow-[0_4px_22px_rgba(196,23,23,0.28)]
                         hover:shadow-[0_6px_30px_rgba(196,23,23,0.40)]
                         active:scale-[0.98] transition-all duration-200
                         disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Ingresar
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          {/* Credenciales demo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3.5"
          >
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.22em] uppercase mb-3">
              Accesos de demostración
            </p>
            {DEMO_CREDS.map(({ username: u, password: p, rol }) => (
              <div
                key={rol}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
              >
                <span className="text-[#C41717]/80 text-[10.5px] font-bold tracking-widest uppercase w-28 shrink-0">
                  {rol}
                </span>
                <button
                  type="button"
                  onClick={() => { setUsername(u); setPassword(p); }}
                  className="text-slate-400 hover:text-slate-700 text-[11px] font-mono transition-colors text-right"
                >
                  {u} · {p}
                </button>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-5 text-slate-400 text-[10px] tracking-[0.18em]">
          © {new Date().getFullYear()} GFO Academy — Gestión y Formación Organizacional
        </p>
      </motion.div>
    </div>
  );
}
