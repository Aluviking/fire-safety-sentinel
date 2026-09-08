import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, GraduationCap, BookOpen, Award, Loader2, ChevronRight } from "lucide-react";
import gfoLogo from "@/assets/gfo-academy-logo.png";
import { apiFetch } from "@/lib/api";
import { TIPOS_ID } from "@/data/academicCatalog";

interface Opcion { id: number; nombre: string }
interface Opciones { programas: Opcion[]; diplomados: Opcion[]; cursos: Opcion[] }

type TipoInteres = "curso" | "programa" | "diplomado";

const TIPO_TABS: { key: TipoInteres; label: string; icon: typeof BookOpen }[] = [
  { key: "curso", label: "Curso", icon: BookOpen },
  { key: "programa", label: "Programa", icon: GraduationCap },
  { key: "diplomado", label: "Diplomado", icon: Award },
];

const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm bg-white " +
  "focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10 " +
  "placeholder:text-slate-400 transition-all shadow-sm";

export default function PreinscripcionPublica() {
  const [opciones, setOpciones] = useState<Opciones>({ programas: [], diplomados: [], cursos: [] });
  const [loadingOpciones, setLoadingOpciones] = useState(true);

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipoInteres, setTipoInteres] = useState<TipoInteres | null>(null);
  const [itemNombre, setItemNombre] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    apiFetch<Opciones>("/preinscripciones/opciones.php")
      .then(setOpciones)
      .catch(() => {})
      .finally(() => setLoadingOpciones(false));
  }, []);

  const listaActual = tipoInteres === "programa" ? opciones.programas : tipoInteres === "diplomado" ? opciones.diplomados : tipoInteres === "curso" ? opciones.cursos : [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombres.trim() || !apellidos.trim() || !identificacion.trim()) {
      setError("Nombres, apellidos e identificación son obligatorios."); return;
    }
    if (!tipoInteres || !itemNombre) {
      setError("Selecciona a qué te quieres inscribir."); return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/preinscripciones/create.php", {
        method: "POST",
        json: {
          nombres: nombres.trim(), apellidos: apellidos.trim(),
          tipoDocumento: tipoDocumento || null, identificacion: identificacion.trim(),
          celular: celular.trim() || null, correo: correo.trim() || null,
          tipoInteres, itemNombre,
        },
      });
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la inscripción.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 relative flex items-center justify-center px-4 py-10">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E02020] via-[#B01313] to-[#1a0505]
                         lg:[clip-path:polygon(38%_0,100%_0,100%_100%,10%_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-xl bg-white rounded-[1.75rem] shadow-[0_25px_80px_rgba(0,0,0,0.25)]
                     border border-white/80 overflow-hidden"
        >
          <div className={`px-6 sm:px-9 py-7 text-center ${enviado ? "" : "border-b border-slate-100"}`}>
            <img src={gfoLogo} alt="GFO Academy" className="h-14 w-auto object-contain mx-auto mb-3" />
            {!enviado && (
              <>
                <h1 className="text-slate-900 font-bold text-xl sm:text-2xl tracking-tight">Inscríbete a Campus Virtual</h1>
                <p className="text-slate-500 text-sm mt-1">Completa tus datos y elige a qué te quieres inscribir.</p>
              </>
            )}
          </div>

          {enviado ? (
            <div className="px-6 sm:px-9 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-slate-900 font-bold text-lg mb-2">¡Listo, quedaste inscrito!</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Ya recibimos tu solicitud para <span className="font-semibold text-slate-700">{itemNombre}</span>.
                En breve nuestro equipo se pondrá en contacto contigo.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="px-6 sm:px-9 py-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Nombres *</label>
                  <input className={inputCls} value={nombres} onChange={(e) => setNombres(e.target.value)} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Apellidos *</label>
                  <input className={inputCls} value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Tipo de identificación</label>
                  <select className={inputCls} value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                    <option value="">Selecciona...</option>
                    {TIPOS_ID.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Número de identificación *</label>
                  <input className={inputCls} value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Celular</label>
                  <input className={inputCls} value={celular} onChange={(e) => setCelular(e.target.value)} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">Correo</label>
                  <input type="email" className={inputCls} value={correo} onChange={(e) => setCorreo(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2.5">¿Para qué quieres inscribirte? *</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {TIPO_TABS.map((t) => (
                    <button
                      key={t.key} type="button"
                      onClick={() => { setTipoInteres(t.key); setItemNombre(""); }}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all
                                  ${tipoInteres === t.key ? "border-[#C41717] bg-[#C41717]/8 text-[#C41717]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                    >
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </div>

                {tipoInteres && (
                  loadingOpciones ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando opciones...
                    </div>
                  ) : listaActual.length === 0 ? (
                    <p className="text-slate-400 text-xs italic py-2">Próximamente disponible para esta opción.</p>
                  ) : (
                    <select
                      value={itemNombre} onChange={(e) => setItemNombre(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Selecciona una opción</option>
                      {listaActual.map((o) => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
                    </select>
                  )
                )}
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm
                           tracking-[0.04em] text-white bg-[#C41717] hover:bg-[#B01313]
                           shadow-[0_8px_28px_rgba(196,23,23,0.3)] active:scale-[0.98] transition-all duration-200
                           disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Inscribirme <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <div className="shrink-0 bg-black flex items-center justify-center px-4 py-2">
        <p className="text-white/60 text-[11px] tracking-wide text-center">
          © {new Date().getFullYear()} GFO Academy · Campus Virtual
        </p>
      </div>
    </div>
  );
}
