import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ChangeMyPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

/** Modal de autoservicio: cualquier usuario logueado cambia SU PROPIA contraseña,
 *  a diferencia de ResetPasswordModal (que un Admin/Super Admin usa para asignarle
 *  una clave nueva a OTRO usuario). Aquí sí se pide la contraseña actual. */
export function ChangeMyPasswordModal({ open, onClose }: ChangeMyPasswordModalProps) {
  const { changeMyPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setError(""); setSuccess(false); setSubmitting(false);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("La contraseña nueva debe tener al menos 6 caracteres."); return; }
    if (newPassword !== confirmPassword) { setError("Las dos contraseñas nuevas no coinciden."); return; }

    setSubmitting(true);
    const res = await changeMyPassword(currentPassword, newPassword);
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "No se pudo cambiar la contraseña."); return; }
    setSuccess(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm bg-white rounded-2xl
                         shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
              {success ? (
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-slate-800 text-[15px]">Contraseña actualizada</h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Tu contraseña se cambió correctamente. Se cerró la sesión en cualquier otro dispositivo, esta se mantiene activa.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={close}
                    className="w-full mt-5 text-sm font-bold rounded-xl py-2.5 transition-all active:scale-[0.97]
                               bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_14px_rgba(217,119,6,0.3)]"
                  >
                    Listo
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="font-semibold text-slate-800 text-[15px]">Cambiar mi contraseña</h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Ingresa tu contraseña actual y la nueva.
                      </p>
                    </div>
                    <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="password"
                    autoFocus
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
                    placeholder="Contraseña actual"
                    className="w-full mt-4 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5
                               focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                    placeholder="Contraseña nueva (mín. 6 caracteres)"
                    className="w-full mt-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5
                               focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Repite la contraseña nueva"
                    className="w-full mt-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5
                               focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                  />
                  {error && <p className="text-[12px] text-red-500 mt-1.5">{error}</p>}

                  <div className="flex items-center gap-2.5 mt-5">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100
                                 rounded-xl py-2.5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 text-sm font-bold rounded-xl py-2.5 transition-all active:scale-[0.97]
                                 bg-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_14px_rgba(217,119,6,0.3)]
                                 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Guardando..." : "Cambiar contraseña"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
