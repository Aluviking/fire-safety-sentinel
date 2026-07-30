import { Plus } from "lucide-react";

interface FolderShellProps {
  tabColor: string;
  tabLabel: string;
  onClick?: () => void;
  dashed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Primitivo visual de "carpeta" (pestaña superior + cuerpo) reutilizado por las
 * tarjetas de empresa (Dashboard) y las carpetas de documentos por fase PHVA
 * (vista de Empresa), para no duplicar la forma dos veces.
 */
export function FolderShell({ tabColor, tabLabel, onClick, dashed, className, children }: FolderShellProps) {
  if (dashed) {
    return (
      <button
        onClick={onClick}
        className={`w-full h-full min-h-[164px] flex flex-col items-center justify-center gap-2
                    rounded-2xl border-2 border-dashed border-amber-300/70 text-amber-600
                    hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200 ${className ?? ""}`}
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-semibold">{tabLabel}</span>
      </button>
    );
  }

  return (
    <div className={`relative mt-[10px] ${onClick ? "cursor-pointer group" : ""} ${className ?? ""}`} onClick={onClick}>
      {/* Tab */}
      <div
        className="absolute -top-[18px] left-4 px-3 h-[22px] rounded-t-lg flex items-center z-0
                   shadow-[0_-1px_4px_rgba(0,0,0,0.08)] transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{ background: tabColor }}
      >
        <span className="text-[9px] font-bold uppercase tracking-wider text-white whitespace-nowrap">
          {tabLabel}
        </span>
      </div>

      {/* Body */}
      <div
        className="relative z-10 bg-white rounded-2xl rounded-tl-sm border border-slate-200
                   shadow-sm group-hover:shadow-lg transition-all duration-200 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
