import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

const COLUMNAS = [
  "identificacion", "comprobante", "fecha_pago", "fecha_asiento", "cajero", "producto",
  "periodo", "valor_pagado", "cuenta", "forma_pago", "valor_forma_pago", "estado",
];

/** Carga masiva de pagos realizados vía CSV -- las filas quedan en la misma
 *  tabla histórica que usa el módulo Pagos, así se ven juntas sin duda. */
export default function ImportarPagosView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState<{ insertados: number; errores: string[] } | null>(null);
  const [error, setError] = useState("");

  const subir = async (file: File) => {
    setSubiendo(true);
    setError("");
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<{ insertados: number; errores: string[] }>("/tesoreria-adaptaciones/importar-pagos.php", {
        method: "POST", body: formData,
      });
      setResultado(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo importar el archivo.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <h1 className="text-slate-900 font-extrabold text-2xl leading-tight">Importar pagos</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Sube un archivo <strong>.csv</strong> con exactamente este encabezado (en este orden, separado por comas):
          </p>
          <code className="block text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 overflow-x-auto whitespace-nowrap">
            {COLUMNAS.join(",")}
          </code>
          <p className="text-xs text-slate-400 mt-2">
            Las filas se agregan a Pagos (no reemplazan nada existente). <code>identificacion</code> y <code>valor_pagado</code> son obligatorios en cada fila.
          </p>
        </div>

        <input
          ref={inputRef} type="file" accept=".csv"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) subir(f); }}
          disabled={subiendo}
          className="hidden" id="importar-pagos-input"
        />
        <label htmlFor="importar-pagos-input"
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${subiendo ? "bg-slate-100 text-slate-400" : "bg-[#C41717] hover:bg-[#B01313] text-white"}`}>
          {subiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {subiendo ? "Importando..." : "Seleccionar archivo CSV"}
        </label>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="w-4 h-4" /> {error}</p>
        )}

        {resultado && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Se importaron {resultado.insertados} pago{resultado.insertados !== 1 ? "s" : ""}.
            </p>
            {resultado.errores.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1.5">{resultado.errores.length} fila(s) con error (no se importaron):</p>
                <ul className="text-[11px] text-amber-700 space-y-0.5 max-h-40 overflow-y-auto">
                  {resultado.errores.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
