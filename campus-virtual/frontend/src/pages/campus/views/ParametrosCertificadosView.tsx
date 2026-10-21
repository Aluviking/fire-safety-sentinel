import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Parametros {
  nombre_firma: string | null; cargo_firma: string | null;
  texto_legal: string | null; formato_numeracion: string | null;
}

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

/** Parámetros globales usados al emitir una constancia/certificado real
 *  (nombre y cargo de quien firma, texto legal de pie de página, formato
 *  del número de constancia) -- una sola fila de configuración. */
export default function ParametrosCertificadosView() {
  const [nombreFirma, setNombreFirma] = useState("");
  const [cargoFirma, setCargoFirma] = useState("");
  const [textoLegal, setTextoLegal] = useState("");
  const [formatoNumeracion, setFormatoNumeracion] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ parametros: Parametros }>("/certificados-parametros/get.php")
      .then((d) => {
        setNombreFirma(d.parametros.nombre_firma ?? "");
        setCargoFirma(d.parametros.cargo_firma ?? "");
        setTextoLegal(d.parametros.texto_legal ?? "");
        setFormatoNumeracion(d.parametros.formato_numeracion ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los parámetros."))
      .finally(() => setLoading(false));
  }, []);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGuardando(true);
    setGuardado(false);
    try {
      await apiFetch("/certificados-parametros/update.php", {
        method: "POST",
        json: { nombreFirma, cargoFirma, textoLegal, formatoNumeracion },
      });
      setGuardado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4 max-w-2xl">
      <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">Parámetros de constancias y certificados</h1>
      <p className="text-slate-400 text-sm">Esto se usa al emitir una constancia o certificado real para un estudiante.</p>
      <form onSubmit={guardar} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre de quien firma</label>
            <input value={nombreFirma} onChange={(e) => setNombreFirma(e.target.value)} className={inputCls} placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Cargo de quien firma</label>
            <input value={cargoFirma} onChange={(e) => setCargoFirma(e.target.value)} className={inputCls} placeholder="Ej: Director Académico" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Formato de numeración</label>
          <input value={formatoNumeracion} onChange={(e) => setFormatoNumeracion(e.target.value)} className={inputCls} placeholder="Ej: GFO-{AÑO}-{ID}" />
          <p className="text-[11px] text-slate-400 mt-1">Solo como referencia visual por ahora.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Texto legal (pie de página del certificado)</label>
          <textarea value={textoLegal} onChange={(e) => setTextoLegal(e.target.value)} rows={4} className={inputCls}
            placeholder="Ej: Este certificado se expide de acuerdo con..." />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={guardando}
            className="px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          {guardado && <span className="text-xs text-emerald-600 font-semibold">Guardado.</span>}
        </div>
      </form>
    </motion.div>
  );
}
