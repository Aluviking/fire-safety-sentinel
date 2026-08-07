import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, X } from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";

// Marca de tiempo real (Date.now()) del último cierre del popup — el ciclo
// es por tiempo (cada 30 min), no por contenido del anuncio. sessionStorage
// a propósito: se limpia en login()/logout() (ver AuthContext) para que el
// ciclo reinicie por sesión.
export const AD_POPUP_DISMISS_KEY = "siso_ad_popup_dismissed_at";
const REAPPEAR_MS = 30 * 60 * 1000;

/**
 * Publicidad en popup emergente centrado, para Cliente y Equipo dentro de la
 * vista de Empresa. Aparece encima de todo, se cierra con la X, y vuelve a
 * aparecer sola cada 30 minutos mientras la pestaña siga abierta. Al
 * cerrarse no navega ni recarga nada — la página queda exactamente como
 * estaba antes de que apareciera.
 */
export function AdPopup() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const scheduleShow = (delayMs: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, Math.max(0, delayMs));
    };

    apiFetch<{ hasAd: boolean }>("/ads/current.php")
      .then((data) => {
        if (cancelled || !data.hasAd) return;
        return apiImage("/ads/image.php").then((url) => {
          if (cancelled) { URL.revokeObjectURL(url); return; }
          objectUrl = url;
          setImgUrl(url);

          const lastDismissed = Number(sessionStorage.getItem(AD_POPUP_DISMISS_KEY) ?? 0);
          const elapsed = Date.now() - lastDismissed;
          scheduleShow(lastDismissed ? REAPPEAR_MS - elapsed : 0);
        });
      })
      .catch(() => { /* sin anuncio activo, no es fatal */ });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(AD_POPUP_DISMISS_KEY, String(Date.now()));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), REAPPEAR_MS);
  };

  if (!imgUrl) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-xs rounded-2xl overflow-hidden
                         border border-slate-200 shadow-[0_25px_80px_rgba(0,0,0,0.35)] bg-white"
            >
              <div className="flex items-center justify-between gap-1.5 px-3 py-2 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Megaphone className="w-3 h-3" /> Publicidad
                </span>
                <button
                  onClick={handleClose}
                  className="text-slate-300 hover:text-slate-600 transition-colors"
                  title="Cerrar publicidad"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="w-full max-h-[70vh] aspect-[9/16] bg-slate-100">
                <img src={imgUrl} alt="Publicidad" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
