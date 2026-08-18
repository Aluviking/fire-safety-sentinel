import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, User, Mail, Phone, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";

const inputBase =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm bg-white " +
  "focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10 " +
  "placeholder:text-slate-400 transition-all shadow-sm";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-[#C41717] ml-0.5">*</span>}
    </label>
  );
}

function FInput({ label, required, type = "text", value, onChange, icon: Icon }: {
  label: string; required?: boolean; type?: string; icon?: React.ElementType; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} ${Icon ? "pl-9" : ""}`} />
      </div>
    </div>
  );
}

interface FormData { nombreCompleto: string; numeroId: string; correo: string; celular: string; }
const EMPTY: FormData = { nombreCompleto: "", numeroId: "", correo: "", celular: "" };

export interface CodeudorEditable {
  id: number; identificacion: string; nombre_completo: string; celular: string | null; correo: string | null;
}

interface Props { isOpen: boolean; onClose: () => void; onCreated?: () => void; editing?: CodeudorEditable | null; }

export default function RegistrarCodeudorModal({ isOpen, onClose, onCreated, editing }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editing;
  const set = (field: keyof FormData) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        nombreCompleto: editing.nombre_completo, numeroId: editing.identificacion,
        correo: editing.correo ?? "", celular: editing.celular ?? "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [isOpen, editing]);

  const handleClose = () => { setForm(EMPTY); setError(""); onClose(); };

  const handleAceptar = async () => {
    setError("");
    if (!form.nombreCompleto.trim() || !form.numeroId.trim()) {
      setError("Nombre completo e identificación son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        identificacion: form.numeroId.trim(),
        nombreCompleto: form.nombreCompleto.trim(),
        celular: form.celular || null,
        correo: form.correo || null,
      };
      if (isEditing && editing) {
        await apiFetch("/codeudores/update.php", { method: "POST", json: { id: editing.id, ...payload } });
      } else {
        await apiFetch("/codeudores/create.php", { method: "POST", json: payload });
      }
      onCreated?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Error al ${isEditing ? "editar" : "registrar"} el codeudor.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={handleClose} />
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40 shrink-0" />
            <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1.5">
                  <span>Tesorería</span><ChevronRight className="w-3 h-3" /><span>Codeudores</span>
                  <ChevronRight className="w-3 h-3" /><span className="text-[#C41717] font-semibold">{isEditing ? "Editar registro" : "Nuevo registro"}</span>
                </div>
                <h2 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">{isEditing ? "Editar codeudor" : "Registrar codeudor"}</h2>
              </div>
              <button onClick={handleClose} className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FInput label="Nombre completo" required icon={User} value={form.nombreCompleto} onChange={set("nombreCompleto")} />
              <FInput label="Número de identificación" required icon={FileText} value={form.numeroId} onChange={set("numeroId")} />
              <FInput label="Correo electrónico" type="email" icon={Mail} value={form.correo} onChange={set("correo")} />
              <FInput label="Celular" type="tel" icon={Phone} value={form.celular} onChange={set("celular")} />
              {error && <p className="text-red-500 text-xs sm:col-span-2">{error}</p>}
            </div>

            <div className="border-t border-slate-100 px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 bg-white rounded-b-2xl">
              <p className="text-slate-400 text-xs hidden sm:block">
                Los campos con <span className="text-[#C41717] font-bold">*</span> son obligatorios
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleClose} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all">
                  Cancelar
                </button>
                <button onClick={handleAceptar} disabled={submitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold
                             transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(196,23,23,0.30)] disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar codeudor"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
