import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Lock, User, ChevronRight, type LucideIcon } from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.png";
import mascotImg from "@/assets/personaje-mascota.png";
import { useCampusAuth } from "@/context/CampusAuthContext";
import Recaptcha, { type RecaptchaHandle } from "@/components/Recaptcha";

/* ── Textos compartidos entre variantes (mobile/tablet/desktop) — el
   markup de cada variante difiere lo suficiente (color, tag, saltos de
   línea) como para no valer la pena forzar un único componente visual. ── */
const TAGLINE_TITLE = "Aprende y certifícate";
const TAGLINE_HIGHLIGHT = "con nosotros";
const TAGLINE_SUBTITLE = "Campus Virtual · Gestión académica en Seguridad y Salud en el Trabajo.";
const HEADING_TITLE = "Ingresa a tu cuenta";
const HEADING_SUBTITLE = "Accede al Campus Virtual de GFO Academy";

/* ── Logo GFO Academy — PNG con fondo transparente real, se integra directo
   sin ninguna caja ni círculo. ── */
const GFOLogo = ({ className = "h-16" }: { className?: string }) => (
  <img
    src={gfoLogo}
    alt="GFO Academy"
    className={`w-auto object-contain ${className}`}
  />
);

/* ── Fondo de puntos sutil ─────────────────────────────────────────────────── */
const DotGridBg = () => (
  <div
    className="absolute inset-0 opacity-[0.05] pointer-events-none"
    style={{
      backgroundImage: "radial-gradient(rgba(0,0,0,1) 1.4px, transparent 1.4px)",
      backgroundSize: "26px 26px",
    }}
  />
);

/* ── Campo de usuario/contraseña — misma apariencia para ambos, con espacio
   a la derecha reservado solo cuando hay un botón (mostrar/ocultar clave). ── */
interface AuthInputProps {
  icon: LucideIcon;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete: string;
  rightElement?: ReactNode;
}

const AuthInput = ({ icon: Icon, label, type, value, onChange, placeholder, autoComplete, rightElement }: AuthInputProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-slate-400 text-[10px] font-bold tracking-[0.14em] uppercase">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl
                   pl-10 ${rightElement ? "pr-11" : "pr-4"} py-3 text-slate-800 text-sm placeholder:text-slate-400
                   focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10
                   transition-all duration-200`}
      />
      {rightElement}
    </div>
  </div>
);

/* ══ Main Component ═══════════════════════════════════════════════════════════ */
export default function CampusLogin() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, login } = useCampusAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaHandle>(null);

  useEffect(() => {
    if (!authLoading && currentUser) navigate("/dashboard", { replace: true });
  }, [authLoading, currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!recaptchaToken) {
      setError("Confirma que no eres un robot.");
      return;
    }
    setLoading(true);
    const res = await login(username.trim(), password, recaptchaToken);
    if (res.ok) {
      navigate("/dashboard");
    } else {
      setError(res.error ?? "Nombre de usuario o contraseña incorrectos.");
      setLoading(false);
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col bg-black">
      {/* ══ FONDO — diagonal rojo/negro + blanco, igual que antes ═══════════ */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 px-4 py-[clamp(1rem,3vh,2rem)]">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#E02020] via-[#B01313] to-[#1a0505]
                     lg:[clip-path:polygon(38%_0,100%_0,100%_100%,10%_100%)]"
        />
        <DotGridBg />
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 rounded-full bg-[#C41717]/[0.05] blur-[100px] pointer-events-none" />

        {/* Volver al sitio principal */}
        <a
          href="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 flex items-center gap-1.5
                     text-white/80 hover:text-white lg:text-slate-500 lg:hover:text-slate-800
                     text-xs font-medium tracking-wide transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al sitio
        </a>

        {/* ══ Columna centrada: mascota (mobile/tablet) + tarjeta ══════════ */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[980px] max-h-full">
          {/* Tagline — solo tablet, ANTES de la mascota (la mascota queda
              pegada a la tarjeta para poder sobresalir encima de ella). */}
          <div className="hidden sm:block lg:hidden text-center px-6 mb-3 shrink-0">
            <h1 className="text-white font-black text-[clamp(1.3rem,3.2vh,1.7rem)] leading-[1.2] tracking-tight">
              {TAGLINE_TITLE} <span className="text-white/90">{TAGLINE_HIGHLIGHT}</span>
            </h1>
            <p className="text-white/70 text-[clamp(0.8rem,2vh,0.95rem)] mt-2 leading-relaxed">
              {TAGLINE_SUBTITLE}
            </p>
          </div>

          {/* Mascota — solo tablet (sm-lg), no en celular. Sobresale encima
              del borde de la tarjeta con margen negativo (aquí sí funciona
              bien porque la mascota va en flujo normal, no dentro de un
              panel que se estira a la altura de la tarjeta como en desktop). */}
          <img
            src={mascotImg}
            alt="Mascota GFO Academy"
            className="hidden sm:block lg:hidden relative z-30 w-auto object-contain shrink-0
                       drop-shadow-[0_14px_22px_rgba(0,0,0,0.25)] -mb-16"
            style={{ height: "clamp(170px,30vh,340px)" }}
          />

          <div className="w-full grid max-h-full">
            {/* Capa gris detrás, mismo tamaño y forma exactos que la tarjeta —
                así el vidrio toma un tono gris neutro en vez del rojo de fondo,
                y el texto se lee mucho mejor. */}
            <div style={{ gridArea: "1 / 1" }} className="rounded-[1.75rem] bg-slate-300" />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ gridArea: "1 / 1" }}
              className="max-h-full overflow-y-auto lg:overflow-visible
                         flex flex-col lg:flex-row
                         bg-white/70 backdrop-blur-2xl border border-white/80
                         shadow-[0_25px_80px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]
                         rounded-[1.75rem]"
            >
              {/* ── Lado visual (solo desktop) ── */}
              <div className="hidden lg:flex lg:w-[42%] relative flex-col items-center justify-end border-r border-white/50 overflow-visible">
                <div className="absolute inset-[6%] rounded-full bg-[#C41717]/[0.05] blur-3xl pointer-events-none" />
                {/* Posición absoluta anclada al borde superior del panel (= borde
                    superior de la tarjeta) — la salida es siempre la misma
                    cantidad exacta de píxeles, sin importar el tamaño de ventana.
                    Alto FIJO (no en vh): el alto de la tarjeta no depende de la
                    ventana (lo define su contenido), así que el personaje debe
                    medirse igual — antes usaba vh y en pantallas altas terminaba
                    más alto que la tarjeta completa, tapando el texto de abajo. */}
                <img
                  src={mascotImg}
                  alt="Mascota GFO Academy"
                  className="absolute z-10 left-1/2 -translate-x-1/2 w-auto object-contain drop-shadow-[0_22px_34px_rgba(0,0,0,0.2)]"
                  style={{ height: "420px", top: "-60px" }}
                />

                <div className="relative z-10 text-center px-8 pb-8">
                  <h1 className="text-slate-900 font-black text-[clamp(1.1rem,2.4vh,1.6rem)] leading-[1.2] tracking-tight">
                    {TAGLINE_TITLE}
                    <br />
                    <span style={{ color: "#C41717" }}>{TAGLINE_HIGHLIGHT}</span>
                  </h1>
                  <p className="text-slate-500 text-[clamp(0.7rem,1.4vh,0.8rem)] mt-2 leading-relaxed max-w-[240px] mx-auto">
                    {TAGLINE_SUBTITLE}
                  </p>
                </div>
              </div>

              {/* ── Lado formulario ── */}
              <div className="relative flex-1 flex flex-col justify-center px-6 py-6 sm:px-10 sm:py-8">
                {/* Encabezado móvil — logo arriba, todo centrado dentro de la tarjeta */}
                <div className="sm:hidden text-center mb-6">
                  <GFOLogo className="h-14 mx-auto mb-3" />
                  <p className="text-[#C41717] font-bold text-[13px] tracking-tight mb-2">
                    {TAGLINE_TITLE} {TAGLINE_HIGHLIGHT}
                  </p>
                  <h2 className="text-slate-900 font-bold text-xl tracking-tight">
                    {HEADING_TITLE}
                  </h2>
                  <p className="text-slate-500 text-[13px] mt-1">
                    {HEADING_SUBTITLE}
                  </p>
                </div>

                {/* Encabezado tablet/desktop — logo integrado junto al texto */}
                <div className="hidden sm:flex mb-5 items-center justify-between gap-3">
                  <div>
                    <h2 className="text-slate-900 font-bold text-xl sm:text-[1.6rem] tracking-tight">
                      {HEADING_TITLE}
                    </h2>
                    <p className="text-slate-500 text-[13px] mt-1">
                      {HEADING_SUBTITLE}
                    </p>
                  </div>
                  <GFOLogo className="h-14 sm:h-20 shrink-0" />
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                  <AuthInput
                    icon={User}
                    label="Nombre de usuario"
                    type="text"
                    value={username}
                    onChange={setUsername}
                    placeholder="tu usuario"
                    autoComplete="username"
                  />

                  <AuthInput
                    icon={Lock}
                    label="Contraseña"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2
                                   text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  {/* Recordarme */}
                  <div className="flex items-center justify-between -mt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none group">
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
                      <span className="text-slate-500 text-[13px]">¿Recordarme?</span>
                    </label>
                    <button
                      type="button"
                      className="text-[#C41717]/80 hover:text-[#C41717] text-[13px] transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>

                  {/* Verificación de seguridad */}
                  <Recaptcha ref={recaptchaRef} onChange={setRecaptchaToken} />

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5 bg-red-50 border border-red-200
                                 rounded-xl px-4 py-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-red-600 text-[13px]">{error}</span>
                    </motion.div>
                  )}

                  {/* Botón ingresar */}
                  <button
                    type="submit"
                    disabled={loading || !recaptchaToken}
                    className="w-full flex items-center justify-center gap-2 mt-1 py-3.5
                               rounded-xl font-bold text-sm tracking-[0.06em] text-white
                               bg-[#C41717] hover:bg-[#B01313]
                               shadow-[0_8px_28px_rgba(196,23,23,0.3)]
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
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ PIE DE PÁGINA — de toda la pantalla ══════════════════════════════ */}
      <div className="shrink-0 bg-black flex items-center justify-center px-4 py-1.5 sm:py-0 sm:h-[clamp(28px,4.5svh,40px)]">
        <p className="text-white/60 text-[9px] sm:text-[11px] tracking-wide text-center leading-tight">
          <span className="block sm:inline">© {new Date().getFullYear()} GFO Academy · Gestión y Formación Organizacional</span>
          <span className="block sm:inline">
            {" "}— Powered by{" "}
            <a
              href="https://www.rubikcontroldigital.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/80 hover:text-white transition-colors"
            >
              Rubik Control Digital
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}
