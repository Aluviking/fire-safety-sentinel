import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Repeat, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCampusAuth } from "@/context/CampusAuthContext";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", docente: "Docente",
  administrativo: "Administrativo", equipo: "Coordinador", estudiante: "Estudiante",
};

/**
 * Selector "Cambiar de cuenta" — visible en cualquier panel (docente,
 * estudiante, admin...) para quien tenga cuentas vinculadas por un Super
 * Admin (ej. Fernando: docente ↔ super_admin). Si no tiene ninguna
 * vinculada, este componente no renderiza nada.
 */
export function CuentaSwitcher({ dark = true }: { dark?: boolean }) {
  const { cuentasVinculadas, cambiarCuenta } = useCampusAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (cuentasVinculadas.length === 0) return null;

  const toggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + 6, left: Math.max(8, r.right - 220), width: 220 });
    }
    setOpen((v) => !v);
  };

  const handleCambiar = async (userId: string) => {
    setSwitching(userId);
    try {
      const res = await cambiarCuenta(userId);
      if (!res.ok) { window.alert(res.error ?? "Error al cambiar de cuenta."); return; }
      setOpen(false);
      navigate(res.role === "estudiante" ? "/estudiante" : "/dashboard", { replace: true });
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={toggle}
        title="Cambiar de cuenta"
        className={`flex items-center gap-1 p-1.5 rounded-lg transition-all
          ${dark ? "text-white hover:bg-white/15" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
      >
        <Repeat className="w-3.5 h-3.5" />
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && rect && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
            className="bg-white rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.18)] z-[201] overflow-hidden"
          >
            <p className="px-3.5 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Cambiar de cuenta</p>
            <div className="pb-1.5">
              {cuentasVinculadas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleCambiar(c.id)}
                  disabled={switching === c.id}
                  className="w-full flex items-center justify-between gap-2 text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <span className="truncate">{c.nombre}</span>
                  {switching === c.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  ) : (
                    <span className="shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {ROLE_LABEL[c.role] ?? c.role}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
