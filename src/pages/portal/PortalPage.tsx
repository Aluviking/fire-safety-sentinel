import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, User, Lock, RefreshCw, ArrowRight, ArrowLeft, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import sisoLogo from "@/assets/siso-logo.png";
import heroImage from "@/assets/login-banner.jpg";

/* ─── Simple captcha ────────────────────────────────────────────────────────── */
function useCaptcha() {
  const gen = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a + b };
  };
  const [captcha, setCaptcha] = useState(gen);
  return { captcha, refresh: () => setCaptcha(gen()) };
}

/* ─── Input field ───────────────────────────────────────────────────────────── */
function Field({
  label, icon: Icon, type = "text", value, onChange, placeholder, error,
}: {
  label: string; icon: React.ElementType; type?: string;
  value: string; onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className="flex flex-col" style={{ gap: "clamp(2px,0.6vh,6px)" }}>
      <label className="text-xs font-semibold text-slate-600 tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type={isPwd ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingTop: "clamp(6px,1.3vh,10px)", paddingBottom: "clamp(6px,1.3vh,10px)" }}
          className={`w-full bg-white border rounded-xl pl-10 pr-10 text-sm text-slate-800
                      placeholder:text-slate-400 outline-none transition-all
                      ${error
                        ? "border-red-400 focus:ring-2 focus:ring-red-200"
                        : "border-slate-300 focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                      } shadow-sm`}
        />
        {isPwd && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

/* ─── Captcha widget ────────────────────────────────────────────────────────── */
function CaptchaWidget({
  captcha, refresh, value, onChange, error,
}: {
  captcha: { a: number; b: number }; refresh: () => void;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm" style={{ padding: "clamp(8px,1.6vh,12px)" }}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-slate-500 mb-0.5 tracking-wide uppercase">
            Verificación de seguridad
          </p>
          <p className="font-display text-lg text-[hsl(43_78%_42%)] tracking-widest">
            {captcha.a} + {captcha.b} = ?
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            style={{ paddingTop: "clamp(4px,1vh,8px)", paddingBottom: "clamp(4px,1vh,8px)" }}
            className={`w-20 text-center bg-white border rounded-xl text-sm font-bold text-slate-800
                        outline-none transition-all shadow-sm
                        ${error ? "border-red-400 focus:ring-2 focus:ring-red-200"
                                : "border-slate-300 focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"}`}
          />
          <button type="button" onClick={refresh}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[hsl(43_78%_42%)] transition-colors">
            <RefreshCw className="w-3 h-3" /> Cambiar
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
}

/* ─── Login form ────────────────────────────────────────────────────────────── */
function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [cap, setCap] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { captcha, refresh } = useCaptcha();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (parseInt(cap) !== captcha.answer) {
      setError("Captcha incorrecto. Intenta de nuevo.");
      refresh(); setCap(""); return;
    }
    setSubmitting(true);
    const res = await login(id.trim(), pass);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error."); refresh(); setCap(""); return; }
    navigate("/portal/dashboard");
  };

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: "clamp(8px,1.8vh,14px)" }}>
      <Field label="Correo o usuario" icon={User} value={id} onChange={setId} placeholder="correo@empresa.com" />
      <Field label="Contraseña" icon={Lock} type="password" value={pass} onChange={setPass} placeholder="••••••••" />
      <CaptchaWidget captcha={captcha} refresh={refresh} value={cap} onChange={setCap} />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting}
        style={{ paddingTop: "clamp(8px,1.8vh,14px)", paddingBottom: "clamp(8px,1.8vh,14px)" }}
        className="w-full flex items-center justify-center gap-2
                   bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                   text-black font-bold rounded-xl transition-all
                   hover:brightness-105 active:scale-[0.97]
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                   shadow-[0_4px_20px_hsl(43_78%_50%/0.4)]
                   text-sm tracking-wide">
        {submitting ? "Ingresando..." : "Ingresar al Portal"}
        {!submitting && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}

/* ─── Panel motivador con foto de marca ──────────────────────────────────────── */
function MotivationPanel() {
  return (
    <div
      className="relative h-[clamp(64px,15vh,140px)] lg:h-full overflow-hidden
                  [@media(max-height:480px)]:hidden lg:[@media(max-height:480px)]:block"
    >
      <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/20
                       lg:bg-gradient-to-t lg:from-slate-900/95 lg:via-slate-900/55 lg:to-slate-900/10" />

      <div className="relative z-10 h-full flex flex-col justify-between p-[clamp(10px,2vh,16px)] lg:p-8">
        <div className="flex items-center gap-2">
          <img src={sisoLogo} alt="SISO"
            className="w-7 h-7 lg:w-9 lg:h-9 rounded-full object-cover glow-gold-sm" />
          <span className="font-display tracking-[0.16em] text-base lg:text-lg text-gradient-gold">SISO</span>
        </div>

        <div>
          <h2 className="font-display text-base sm:text-lg lg:text-3xl text-white leading-tight max-w-xs">
            Protegemos lo que más importa
          </h2>
          <p className="text-white/80 text-sm mt-2.5 max-w-xs leading-relaxed hidden lg:block">
            Gestión integral de Seguridad y Salud en el Trabajo, respaldada por
            expertos SISO. Un solo portal para tu equipo, tus empresas y tu
            documentación SG-SST.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="h-[100svh] overflow-hidden bg-slate-50 flex flex-col relative">
      {/* Decorative gold orbs, matching the app's dashboard visual language */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(43_78%_50%/0.10)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-[hsl(43_78%_50%/0.08)] blur-3xl" />

      {/* Top accent bar */}
      <div className="h-1 shrink-0 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      {/* Back to site */}
      <div
        className="px-4 sm:px-6 relative z-10 shrink-0"
        style={{ paddingTop: "clamp(4px,1vh,12px)" }}
      >
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[hsl(43_78%_40%)]
                     transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver al sitio
        </Link>
      </div>

      {/* Center content */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center px-4 relative z-10"
        style={{ paddingTop: "clamp(2px,1vh,12px)", paddingBottom: "clamp(2px,1vh,12px)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[920px] max-h-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)]
                     border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          <MotivationPanel />

          {/* Form panel */}
          <div className="p-[clamp(12px,2.4vh,24px)] lg:p-8 flex flex-col justify-center">
            <div className="flex items-center justify-between" style={{ marginBottom: "clamp(6px,1.8vh,16px)" }}>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800">Iniciar sesión</h1>
                <span className="hidden [@media(min-height:481px)]:inline-block text-[10px] font-bold tracking-[0.12em] uppercase
                                  text-[hsl(43_78%_65%)] bg-slate-900 px-2.5 py-1 rounded-full">
                  Portal Empresarial
                </span>
              </div>
              <span className="hidden sm:[@media(min-height:481px)]:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest
                                text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Acceso seguro
              </span>
            </div>

            <LoginForm />
          </div>
        </motion.div>
      </div>

      {/* Footer strip */}
      <div className="shrink-0 text-center border-t border-slate-200 relative z-10" style={{ paddingTop: "clamp(4px,1vh,8px)", paddingBottom: "clamp(4px,1vh,8px)" }}>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} SISO. Asesoría &amp; Gestión Empresarial en SST
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Powered by{" "}
          <a
            href="https://www.rubikcontroldigital.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-600 hover:text-[hsl(43_78%_40%)] transition-colors"
          >
            Rubik Control Digital
          </a>
        </p>
      </div>
    </div>
  );
}
