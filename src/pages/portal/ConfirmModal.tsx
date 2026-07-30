import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmación reutilizable para acciones destructivas del Portal (eliminar usuario, empresa, archivo). */
export function ConfirmModal({
  open, title, message, confirmLabel = "Eliminar", cancelLabel = "Cancelar",
  onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
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
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-semibold text-slate-800 text-[15px]">{title}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 mt-5">
                  <button
                    onClick={onCancel}
                    className="flex-1 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100
                               rounded-xl py-2.5 transition-colors"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 text-sm font-bold rounded-xl py-2.5 transition-all active:scale-[0.97]
                               bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.35)]"
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
