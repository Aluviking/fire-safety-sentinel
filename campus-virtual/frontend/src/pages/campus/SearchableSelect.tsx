import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ChevronDown, X } from "lucide-react";

export interface SearchableOption { value: string; label: string }

/**
 * Select con lupa de búsqueda + botón de deseleccionar, para listas que
 * vienen de la API (estudiante, docente, programa, asignatura, curso, aula,
 * certificado, perfil...) y pueden crecer a decenas o cientos de opciones —
 * un <select> nativo obliga a desplazarse a mano por todas.
 */
export function SearchableSelect({
  value, onChange, options, placeholder = "Seleccione...", disabled, className = "", size = "sm",
}: {
  value: string;
  onChange: (v: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const triggerSize = size === "md" ? "text-sm px-3.5 py-2.5 rounded-xl" : "text-xs px-2.5 py-1.5 rounded-lg";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2 ${triggerSize} bg-white border border-slate-300
                    text-left focus:outline-none transition-colors
                    ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60" : "hover:border-[#C41717]/40 cursor-pointer"}`}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className={`flex-1 truncate ${selected ? "text-slate-700" : "text-slate-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected && !disabled && (
          <span
            role="button"
            aria-label="Quitar selección"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="text-slate-400 hover:text-red-500 shrink-0"
            title="Quitar selección"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="absolute left-0 top-full mt-1.5 w-full min-w-[220px] bg-white rounded-xl border border-slate-200
                         shadow-[0_12px_32px_rgba(0,0,0,0.12)] z-20 overflow-hidden"
            >
              <div className="p-2 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1.5
                               focus:outline-none focus:border-[#C41717]/40"
                  />
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">Sin resultados</p>
                ) : (
                  filtered.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors
                                  ${o.value === value ? "bg-[#C41717]/8 text-[#C41717] font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                    >
                      {o.label}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
