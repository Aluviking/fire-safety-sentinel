import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, User, Mail, Phone, FileText } from "lucide-react";
import { TIPOS_ID, SEXOS, PERIODOS, SEDES, PROGRAMAS_POR_SEDE } from "@/data/academicCatalog";
import { apiFetch } from "@/lib/api";
import { SearchableSelect } from "./SearchableSelect";

/* ── Clases reutilizables ─────────────────────────────────────────────────── */
const inputBase =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm bg-white " +
  "focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10 " +
  "placeholder:text-slate-400 transition-all shadow-sm";

const selectBase = inputBase + " appearance-none cursor-pointer pr-9";

const chevronBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E\")";

const selectStyle = {
  backgroundImage: chevronBg,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem",
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
      {children}
      {required && <span className="text-[#C41717] ml-0.5">*</span>}
    </label>
  );
}

function FInput({
  label, required, type = "text", value, onChange, placeholder, icon: Icon,
}: {
  label: string; required?: boolean; type?: string; icon?: React.ElementType;
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? ""}
          className={`${inputBase} ${Icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}

function FSelect({
  label, required, value, onChange, options, placeholder = "Seleccione", disabled,
}: {
  label: string; required?: boolean; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${selectBase} ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60" : ""}`}
        style={selectStyle}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full bg-[#C41717]" />
        <h3 className="text-slate-700 text-sm font-bold tracking-wide">{title}</h3>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormData {
  nombreCompleto: string; tipoId: string; numeroId: string;
  genero: string; correo: string; celular: string; subgrupoSisben: string;
  periodo: string; sedeJornada: string; programa: string;
}

const EMPTY: FormData = {
  nombreCompleto: "", tipoId: "", numeroId: "",
  genero: "", correo: "", celular: "", subgrupoSisben: "",
  periodo: "", sedeJornada: "", programa: "",
};

export interface EstudianteEditable {
  id: number; identificacion: string; nombre_completo: string;
  genero: string | null; tipo_documento: string | null;
  celular: string | null; correo: string | null; subgrupo_sisben: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  editing?: EstudianteEditable | null;
}

export default function RegistrarEstudianteModal({ isOpen, onClose, onCreated, editing }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!editing;

  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm({
        nombreCompleto: editing.nombre_completo, tipoId: editing.tipo_documento ?? "", numeroId: editing.identificacion,
        genero: editing.genero ?? "", correo: editing.correo ?? "", celular: editing.celular ?? "",
        subgrupoSisben: editing.subgrupo_sisben ?? "", periodo: "", sedeJornada: "", programa: "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [isOpen, editing]);

  const set = (field: keyof FormData) => (value: string) => {
    if (field === "periodo") setForm((f) => ({ ...f, periodo: value, sedeJornada: "", programa: "" }));
    else if (field === "sedeJornada") setForm((f) => ({ ...f, sedeJornada: value, programa: "" }));
    else setForm((f) => ({ ...f, [field]: value }));
  };

  const programaOpts = PROGRAMAS_POR_SEDE[form.sedeJornada] ?? [];

  const handleClose = () => { setForm(EMPTY); setError(""); onClose(); };

  const handleAceptar = async () => {
    setError("");
    if (!form.nombreCompleto.trim() || !form.numeroId.trim()) {
      setError("Nombre completo e identificación son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && editing) {
        await apiFetch("/estudiantes/update.php", {
          method: "POST",
          json: {
            id: editing.id,
            identificacion: form.numeroId.trim(),
            nombreCompleto: form.nombreCompleto.trim(),
            genero: form.genero || null,
            tipoDocumento: form.tipoId || null,
            celular: form.celular || null,
            correo: form.correo || null,
            subgrupoSisben: form.subgrupoSisben || null,
          },
        });
      } else {
        await apiFetch("/estudiantes/create.php", {
          method: "POST",
          json: {
            identificacion: form.numeroId.trim(),
            nombreCompleto: form.nombreCompleto.trim(),
            genero: form.genero || null,
            tipoDocumento: form.tipoId || null,
            celular: form.celular || null,
            correo: form.correo || null,
            subgrupoSisben: form.subgrupoSisben || null,
            periodo: form.periodo || null,
            sede: form.sedeJornada || null,
            programa: form.programa || null,
          },
        });
      }
      onCreated?.();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Error al ${isEditing ? "editar" : "registrar"} el estudiante.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-2xl lg:max-w-4xl max-h-[92vh] sm:max-h-[88vh]
                       flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40 shrink-0" />

            <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-200 sm:hidden" />
              <div className="mt-1 sm:mt-0">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1.5">
                  <span>Institucional</span><ChevronRight className="w-3 h-3" /><span>Estudiantes</span>
                  <ChevronRight className="w-3 h-3" /><span className="text-[#C41717] font-semibold">{isEditing ? "Editar registro" : "Nuevo registro"}</span>
                </div>
                <h2 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">{isEditing ? "Editar estudiante" : "Registrar estudiante"}</h2>
              </div>
              <button onClick={handleClose} className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">
              <Section title="Datos personales">
                <FInput label="Nombre completo" required icon={User} value={form.nombreCompleto} onChange={set("nombreCompleto")} />
                <FSelect label="Tipo de identificación" required value={form.tipoId} onChange={set("tipoId")} options={TIPOS_ID} />
                <FInput label="Número de identificación" required icon={FileText} value={form.numeroId} onChange={set("numeroId")} />
                <FSelect label="Género" value={form.genero} onChange={set("genero")} options={SEXOS} />
              </Section>

              <Section title="Contacto">
                <FInput label="Correo electrónico" type="email" icon={Mail} value={form.correo} onChange={set("correo")} />
                <FInput label="Celular" type="tel" icon={Phone} value={form.celular} onChange={set("celular")} />
                <FInput label="Subgrupo Sisbén" value={form.subgrupoSisben} onChange={set("subgrupoSisben")} />
              </Section>

              {!isEditing && (
                <Section title="Matrícula académica">
                  <FSelect label="Período" value={form.periodo} onChange={set("periodo")} options={PERIODOS} />
                  <FSelect
                    label="Sede - jornada" value={form.sedeJornada} onChange={set("sedeJornada")}
                    options={SEDES} disabled={!form.periodo}
                    placeholder={form.periodo ? "Seleccione" : "Primero seleccione período"}
                  />
                  <div className="flex flex-col">
                    <Label>Programa</Label>
                    <SearchableSelect
                      value={form.programa} onChange={set("programa")} disabled={!form.sedeJornada}
                      options={programaOpts.map((p) => ({ value: p, label: p }))}
                      placeholder={!form.sedeJornada ? "Primero seleccione sede" : "Seleccione"}
                      size="md"
                    />
                  </div>
                </Section>
              )}

              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            </div>

            <div className="border-t border-slate-100 px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 bg-white rounded-b-2xl">
              <p className="text-slate-400 text-xs hidden sm:block">
                Los campos con <span className="text-[#C41717] font-bold">*</span> son obligatorios
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleClose} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleAceptar} disabled={submitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold
                             transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(196,23,23,0.30)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar estudiante"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
