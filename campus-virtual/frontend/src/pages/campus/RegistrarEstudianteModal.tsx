import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, User, Mail, Phone, MapPin, Calendar, FileText, BookOpen } from "lucide-react";
import { TIPOS_ID, SEXOS, PERIODOS, SEDES, PROGRAMAS_POR_SEDE } from "@/data/academicCatalog";

/* ── Estado del formulario ────────────────────────────────────────────────── */
interface FormData {
  primerNombre: string;    segundoNombre: string;
  primerApellido: string;  segundoApellido: string;
  tipoId: string;          numeroId: string;
  sexo: string;            correo: string;
  telefono: string;        celular: string;
  fechaNacimiento: string; lugarNacimiento: string;
  direccion: string;       lugarResidencia: string;
  barrio: string;          periodo: string;
  sedeJornada: string;     programa: string;
}

const EMPTY: FormData = {
  primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "",
  tipoId: "", numeroId: "", sexo: "", correo: "", telefono: "", celular: "",
  fechaNacimiento: "", lugarNacimiento: "", direccion: "", lugarResidencia: "",
  barrio: "", periodo: "", sedeJornada: "", programa: "",
};

/* ── Clases reutilizables ─────────────────────────────────────────────────── */
const inputBase =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm bg-white " +
  "focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10 " +
  "placeholder:text-slate-400 transition-all shadow-sm";

const selectBase =
  inputBase + " appearance-none cursor-pointer pr-9";

const chevronBg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E\")";

const selectStyle = {
  backgroundImage: chevronBg,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem",
};

/* ── Sub-componentes ─────────────────────────────────────────────────────── */
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
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        )}
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

/* ── Sección del formulario ──────────────────────────────────────────────── */
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

/* ══ Modal principal ═════════════════════════════════════════════════════════ */
interface Props { isOpen: boolean; onClose: () => void; }

export default function RegistrarEstudianteModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);

  const set = (field: keyof FormData) => (value: string) => {
    if (field === "periodo") {
      setForm((f) => ({ ...f, periodo: value, sedeJornada: "", programa: "" }));
    } else if (field === "sedeJornada") {
      setForm((f) => ({ ...f, sedeJornada: value, programa: "" }));
    } else {
      setForm((f) => ({ ...f, [field]: value }));
    }
  };

  const programaOpts = PROGRAMAS_POR_SEDE[form.sedeJornada] ?? [];

  const handleClose = () => { setForm(EMPTY); onClose(); };

  const handleAceptar = () => {
    // Aquí iría la lógica real de guardado
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* Overlay fijo cubre toda la pantalla */
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">

          {/* Fondo oscuro con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
            onClick={handleClose}
          />

          {/* Ventana modal
              · Mobile:  hoja inferior, ancho completo, bordes superiores redondeados
              · Tablet+: centrada, max-w-2xl
              · Desktop: centrada, max-w-4xl                                        */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-2xl lg:max-w-4xl
                       max-h-[92vh] sm:max-h-[88vh]
                       flex flex-col
                       rounded-t-2xl sm:rounded-2xl
                       bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ── Barra roja superior ── */}
            <div className="h-1 rounded-t-2xl sm:rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40 shrink-0" />

            {/* ── Encabezado ── */}
            <div className="px-5 sm:px-7 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
              {/* Indicador de arrastre (solo mobile) */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-200 sm:hidden" />

              <div className="mt-1 sm:mt-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mb-1.5">
                  <span>Institucional</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Estudiantes</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#C41717] font-semibold">Nuevo registro</span>
                </div>
                <h2 className="text-slate-900 font-bold text-lg sm:text-xl leading-tight">
                  Registrar estudiante
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-700
                           hover:bg-slate-100 transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Cuerpo con scroll ── */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5">

              {/* Sección 1: Datos personales */}
              <Section title="Datos personales">
                <FInput label="Primer nombre"   required icon={User} value={form.primerNombre}    onChange={set("primerNombre")} />
                <FInput label="Segundo nombre"            icon={User} value={form.segundoNombre}   onChange={set("segundoNombre")} />
                <FInput label="Primer apellido"  required icon={User} value={form.primerApellido}  onChange={set("primerApellido")} />
                <FInput label="Segundo apellido"          icon={User} value={form.segundoApellido} onChange={set("segundoApellido")} />
                <FSelect
                  label="Tipo de identificación" required
                  value={form.tipoId} onChange={set("tipoId")}
                  options={TIPOS_ID}
                />
                <FInput label="Número de identificación" required icon={FileText}
                  value={form.numeroId} onChange={set("numeroId")} />
                <FSelect label="Sexo" required value={form.sexo} onChange={set("sexo")} options={SEXOS} />
                <FInput label="Fecha de nacimiento" type="date" icon={Calendar}
                  value={form.fechaNacimiento} onChange={set("fechaNacimiento")} />
                <FInput label="Lugar de nacimiento" icon={MapPin}
                  value={form.lugarNacimiento} onChange={set("lugarNacimiento")}
                  placeholder="Seleccione municipio" />
              </Section>

              {/* Sección 2: Contacto */}
              <Section title="Contacto y ubicación">
                <FInput label="Correo electrónico" required type="email" icon={Mail}
                  value={form.correo} onChange={set("correo")} />
                <FInput label="Teléfono" type="tel" icon={Phone}
                  value={form.telefono} onChange={set("telefono")} />
                <FInput label="Celular" required type="tel" icon={Phone}
                  value={form.celular} onChange={set("celular")} />
                <FInput label="Dirección" icon={MapPin}
                  value={form.direccion} onChange={set("direccion")} />
                <FInput label="Lugar de residencia" icon={MapPin}
                  value={form.lugarResidencia} onChange={set("lugarResidencia")}
                  placeholder="Seleccione municipio" />
                <FInput label="Barrio" icon={MapPin}
                  value={form.barrio} onChange={set("barrio")}
                  placeholder="Seleccione barrio" />
              </Section>

              {/* Sección 3: Matrícula */}
              <Section title="Matrícula académica">
                <FSelect label="Período" required value={form.periodo}
                  onChange={set("periodo")} options={PERIODOS} />
                <FSelect
                  label="Sede - jornada" required
                  value={form.sedeJornada} onChange={set("sedeJornada")}
                  options={SEDES} disabled={!form.periodo}
                  placeholder={form.periodo ? "Seleccione" : "Primero seleccione período"}
                />
                <FSelect
                  label="Programa" required
                  value={form.programa} onChange={set("programa")}
                  options={programaOpts}
                  disabled={!form.sedeJornada}
                  placeholder={
                    !form.sedeJornada     ? "Primero seleccione sede" :
                    programaOpts.length === 0 ? "Sin programas disponibles" :
                    "Seleccione"
                  }
                />
              </Section>

              {/* Info dinámica de programa */}
              {form.sedeJornada && programaOpts.length > 0 && (
                <div className="mt-1 mb-2 rounded-xl bg-blue-50 border border-blue-100
                                px-4 py-3 flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-xs font-semibold">{form.sedeJornada}</p>
                    <p className="text-blue-600 text-xs mt-0.5">
                      {programaOpts.length} programa{programaOpts.length > 1 ? "s" : ""} disponible{programaOpts.length > 1 ? "s" : ""}:&nbsp;
                      {programaOpts.map((p, i) => (
                        <span key={p}>
                          {i > 0 && <span className="text-blue-400"> · </span>}
                          <span className="font-medium">{p}</span>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Pie de la ventana ── */}
            <div className="border-t border-slate-100 px-5 sm:px-7 py-4
                            flex flex-col sm:flex-row sm:items-center sm:justify-between
                            gap-3 shrink-0 bg-white rounded-b-2xl">
              <p className="text-slate-400 text-xs hidden sm:block">
                Los campos con <span className="text-[#C41717] font-bold">*</span> son obligatorios
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl
                             border border-slate-200 text-slate-600
                             hover:bg-slate-50 hover:border-slate-300
                             text-sm font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAceptar}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl
                             bg-[#C41717] hover:bg-[#B01313]
                             text-white text-sm font-semibold
                             transition-all shadow-sm
                             hover:shadow-[0_4px_14px_rgba(196,23,23,0.30)]"
                >
                  Registrar estudiante
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
