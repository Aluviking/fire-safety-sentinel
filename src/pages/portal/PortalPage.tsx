import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, User, Mail, Lock, RefreshCw, CheckCircle,
  ArrowRight, UserPlus, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import sisoLogo from "@/assets/siso-logo.png";

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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type={isPwd ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-xl pl-10 pr-10 py-3 text-sm text-slate-800
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase">
            Verificación de seguridad
          </p>
          <p className="font-display text-xl text-[hsl(43_78%_42%)] tracking-widest">
            {captcha.a} + {captcha.b} = ?
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="—"
            className={`w-20 text-center bg-white border rounded-xl py-2.5 text-sm font-bold text-slate-800
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
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [cap, setCap] = useState("");
  const [error, setError] = useState("");
  const { captcha, refresh } = useCaptcha();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (parseInt(cap) !== captcha.answer) {
      setError("Captcha incorrecto. Intenta de nuevo.");
      refresh(); setCap(""); return;
    }
    const res = login(id.trim(), pass);
    if (!res.ok) { setError(res.error ?? "Error."); return; }
    navigate("/portal/dashboard");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Correo o usuario" icon={User} value={id} onChange={setId} placeholder="correo@empresa.com" />
      <Field label="Contraseña" icon={Lock} type="password" value={pass} onChange={setPass} placeholder="••••••••" />
      <CaptchaWidget captcha={captcha} refresh={refresh} value={cap} onChange={setCap} />

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 mt-1
                   bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                   text-black font-bold py-3.5 rounded-xl transition-all
                   hover:brightness-105 active:scale-[0.97]
                   shadow-[0_4px_20px_hsl(43_78%_50%/0.4)]
                   text-sm tracking-wide">
        Ingresar al Portal <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={onSwitch}
          className="text-[hsl(43_78%_40%)] hover:text-[hsl(43_78%_32%)] font-semibold hover:underline">
          Regístrate aquí
        </button>
      </p>
    </form>
  );
}

/* ─── Register form ─────────────────────────────────────────────────────────── */
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email,  setEmail]  = useState("");
  const [uname,  setUname]  = useState("");
  const [pass,   setPass]   = useState("");
  const [pass2,  setPass2]  = useState("");
  const [cap,    setCap]    = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { captcha, refresh } = useCaptcha();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim())      e.nombre = "Campo requerido.";
    if (!email.includes("@")) e.email  = "Correo inválido.";
    if (uname.length < 4)    e.uname  = "Mínimo 4 caracteres.";
    if (pass.length < 6)     e.pass   = "Mínimo 6 caracteres.";
    if (pass !== pass2)      e.pass2  = "Las contraseñas no coinciden.";
    if (parseInt(cap) !== captcha.answer) { e.captcha = "Captcha incorrecto."; refresh(); setCap(""); }
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = register({ nombre, email, username: uname, password: pass });
    if (!res.ok) { setErrors({ general: res.error ?? "Error." }); return; }
    navigate("/portal/dashboard");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <Field label="Nombre completo"      icon={User}  value={nombre} onChange={setNombre} placeholder="Tu nombre completo"    error={errors.nombre} />
      <Field label="Correo electrónico"   icon={Mail}  type="email" value={email}  onChange={setEmail}  placeholder="correo@empresa.com" error={errors.email}  />
      <Field label="Nombre de usuario"    icon={User}  value={uname}  onChange={setUname}  placeholder="usuario123"              error={errors.uname}  />
      <Field label="Contraseña"           icon={Lock}  type="password" value={pass}  onChange={setPass}   placeholder="••••••••"            error={errors.pass}   />
      <Field label="Confirmar contraseña" icon={Lock}  type="password" value={pass2} onChange={setPass2}  placeholder="••••••••"            error={errors.pass2}  />

      <CaptchaWidget captcha={captcha} refresh={refresh} value={cap} onChange={setCap} error={errors.captcha} />

      {errors.general && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          {errors.general}
        </div>
      )}

      {/* Rol info */}
      <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
        Tu cuenta se creará automáticamente con rol de
        <span className="font-bold text-amber-700 ml-0.5">Cliente</span>.
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 mt-1
                   bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                   text-black font-bold py-3.5 rounded-xl transition-all
                   hover:brightness-105 active:scale-[0.97]
                   shadow-[0_4px_20px_hsl(43_78%_50%/0.4)]
                   text-sm tracking-wide">
        <UserPlus className="w-4 h-4" /> Crear mi cuenta
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={onSwitch}
          className="text-[hsl(43_78%_40%)] hover:text-[hsl(43_78%_32%)] font-semibold hover:underline">
          Inicia sesión
        </button>
      </p>
    </form>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (currentUser) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      {/* Back to site */}
      <div className="px-6 pt-4">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[hsl(43_78%_40%)]
                     transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver al sitio
        </Link>
      </div>

      {/* Center content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[440px]"
        >
          {/* Logo + brand */}
          <div className="flex flex-col items-center mb-7 gap-3">
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-[hsl(43_78%_50%/0.12)] blur-xl" />
              <img src={sisoLogo} alt="SISO"
                className="relative w-[72px] h-[72px] rounded-full border-[3px] border-[hsl(43_78%_50%/0.7)]
                           shadow-[0_0_28px_hsl(43_78%_50%/0.3)]" />
            </div>
            <div className="text-center">
              <h1 className="font-display tracking-[0.16em] text-3xl leading-none text-gradient-gold">SISO</h1>
              <p className="text-xs text-slate-500 mt-1.5 font-medium tracking-[0.12em] uppercase">
                Portal Empresarial
              </p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex relative border-b border-slate-200">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`relative flex-1 py-3.5 flex items-center justify-center gap-0
                              text-sm font-semibold tracking-wide transition-colors duration-200
                              ${mode === m ? "text-[hsl(43_78%_36%)]" : "text-slate-400 hover:text-slate-600"}`}>
                  <span>{m === "login" ? "Ingresar" : "Crear cuenta"}</span>
                  {mode === m && (
                    <motion.span
                      layoutId="tab-line"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[hsl(43_78%_48%)] rounded-t-full"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-6 sm:p-7">
              <AnimatePresence mode="wait">
                <motion.div key={mode}
                  initial={{ opacity: 0, x: mode === "login" ? -14 : 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "login" ? 14 : -14 }}
                  transition={{ duration: 0.18 }}>
                  {mode === "login"
                    ? <LoginForm onSwitch={() => setMode("register")} />
                    : <RegisterForm onSwitch={() => setMode("login")} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-500 mb-2 tracking-wide">Cuentas demo</p>
            {[
              { label: "Admin",    email: "admin@siso.com",   pass: "Admin123!"   },
              { label: "Equipo",   email: "equipo@siso.com",  pass: "Equipo123!"  },
              { label: "Cliente",  email: "cliente@siso.com", pass: "Cliente123!" },
            ].map(({ label, email, pass }) => (
              <div key={label} className="flex items-center gap-2 py-0.5">
                <span className="w-[46px] shrink-0 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                  {label}
                </span>
                <span className="font-mono text-slate-500">{email}</span>
                <span className="text-slate-300">/</span>
                <span className="font-mono text-slate-500">{pass}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer strip */}
      <div className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © {new Date().getFullYear()} SISO — Asesoría &amp; Gestión Empresarial en SST
      </div>
    </div>
  );
}
