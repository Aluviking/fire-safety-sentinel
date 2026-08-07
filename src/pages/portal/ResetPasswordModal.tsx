import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound } from "lucide-react";

interface ResetPasswordModalProps {
  user: { id: string; nombre: string } | null;
  onConfirm: (newPassword: string) => Promise<void> | void;
  onCancel: () => void;
}

/** Modal para que Admin/Super Admin le asigne una contraseña nueva a un usuario, sin pedir la actual. */
export function ResetPasswordModal({ user, onConfirm, onCancel }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setPassword("");
    setError("");
    setSubmitting(false);
    onCancel();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setSubmitting(true);
    await onConfirm(password);
    close();
  };

  return (
    <AnimatePresence>
      {user && (
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
              <form onSubmit={submit} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-semibold text-slate-800 text-[15px]">Restablecer contraseña</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Nueva contraseña para <span className="font-medium text-slate-700">{user.nombre}</span>.
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  autoFocus
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Contraseña nueva (mín. 6 caracteres)"
                  className="w-full mt-4 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5
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
                    {submitting ? "Guardando..." : "Restablecer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
