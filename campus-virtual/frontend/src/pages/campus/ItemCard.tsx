import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { apiImage } from "@/lib/api";

/* ── Imagen protegida (requiere Authorization) para las tarjetas ──────────── */
export function CardImage({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(path).then((u) => { if (!cancelled) { objectUrl = u; setUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);

  if (!url) return <div className="w-full h-full bg-slate-100 animate-pulse" />;
  return <img src={url} alt={alt} className="w-full h-full object-cover" />;
}

/* ── Tarjeta de curso/programa/asignatura — hero con imagen o degradado —
     compartida entre el panel de Estudiante y el de Docente/Admin. ── */
export function ItemCard({
  icon: Icon, title, subtitle, imagePath, accent, footer, onClick,
}: {
  icon: React.ElementType; title: string; subtitle?: string | null; imagePath?: string | null;
  accent: string; footer: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] hover:-translate-y-[3px] transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {imagePath ? (
          <CardImage path={imagePath} alt={title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${accent}E6 0%, ${accent}99 100%)` }}>
            <div className="absolute inset-0 opacity-[0.15]" style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
              backgroundSize: "18px 18px",
            }} />
            <Icon className="w-10 h-10 text-white/90 relative z-10" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold text-[#C41717] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Entrar <ChevronRight className="w-3 h-3" />
        </span>
      </div>
      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="mt-auto pt-1">{footer}</div>
      </div>
    </button>
  );
}

// Paleta de acento cuando no hay categoría/imagen — variedad visual estable
// por nombre (mismo ítem siempre cae en el mismo color).
const ACCENT_PALETTE = ["#C41717", "#1E3A5F", "#9F1239", "#065F46", "#6B21A8", "#92400E"];
export const accentFor = (seed: string) =>
  ACCENT_PALETTE[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENT_PALETTE.length];
