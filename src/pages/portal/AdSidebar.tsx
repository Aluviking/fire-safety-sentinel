import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";

// Recuerda el anuncio ya cerrado durante esta sesión (por su updatedAt) para
// que no vuelva a molestar mientras la sesión siga activa. Se usa
// sessionStorage (no localStorage) a propósito: al cerrar el navegador o
// volver a iniciar sesión, el anuncio debe reaparecer — ver AuthContext,
// que limpia esta key en login() y logout().
export const AD_DISMISS_KEY = "siso_ad_dismissed_at";

/**
 * Barra de publicidad vertical (9:16) mostrada al costado derecho de la vista
 * de Empresa para Cliente y Equipo. Si no hay anuncio activo, o el usuario ya
 * lo cerró, no renderiza nada.
 */
export function AdSidebar() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    apiFetch<{ hasAd: boolean; updatedAt: string | null }>("/ads/current.php")
      .then((data) => {
        if (cancelled || !data.hasAd) { setChecked(true); return; }
        setUpdatedAt(data.updatedAt);

        if (data.updatedAt && sessionStorage.getItem(AD_DISMISS_KEY) === data.updatedAt) {
          setDismissed(true);
          setChecked(true);
          return;
        }
        return apiImage("/ads/image.php").then((url) => {
          if (cancelled) { URL.revokeObjectURL(url); return; }
          objectUrl = url;
          setImgUrl(url);
          setChecked(true);
        });
      })
      .catch(() => { if (!cancelled) setChecked(true); });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleClose = () => {
    if (updatedAt) sessionStorage.setItem(AD_DISMISS_KEY, updatedAt);
    setDismissed(true);
  };

  if (!checked || !imgUrl || dismissed) return null;

  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
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
        <div className="w-full aspect-[9/16] bg-slate-100">
          <img src={imgUrl} alt="Publicidad" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
