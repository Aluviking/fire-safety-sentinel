import { useState, useEffect, useRef } from "react";
import {
  Bell, Video, Clock, User, GraduationCap, BookOpen, Star, Heart, Smile,
  Rocket, Sparkles, Trophy, Target, Compass, Lightbulb, ChevronLeft, ChevronRight, Megaphone,
} from "lucide-react";
import { useCampusAuth } from "@/context/CampusAuthContext";

/* ── Piezas de dashboard compartidas entre la vista de Estudiante y la de
     Docente (misma línea gráfica para ambas, pedido explícito) — campana de
     notificaciones, selector de ícono de avatar, reloj, mini calendario y
     barra de noticias. Ninguna de estas conoce de qué rol viene el dato,
     solo recibe arreglos reales ya armados por quien la use. ── */

export interface ClaseResumen {
  origen: "Programa" | "Asignatura" | "Curso" | "Curso ligero";
  origen_nombre: string;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  link_reunion: string | null;
  grabacion_url: string | null;
  grabacion_password?: string | null;
}

export interface AnuncioResumen { origen: string; origen_nombre: string; titulo: string; mensaje: string; importancia: string; created_at: string }

// Una clase ya pasada no debe ofrecer "Unirse" (confunde — la reunión en
// vivo ya terminó), solo "Ver grabación" si ya está lista.
export const claseYaPaso = (c: { fecha_inicio: string; fecha_fin: string | null }) =>
  new Date(c.fecha_fin ?? c.fecha_inicio).getTime() < Date.now();

export const formatoCorto = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { weekday: "short", hour: "numeric", minute: "2-digit" });

// Llave compuesta para identificar una fila de clase virtual sin id propio
// (viene de un UNION de varias tablas) — se usa como `key` de React y para
// la selección en los bloques de lista + detalle.
export const claseKey = (c: ClaseResumen) => `${c.origen}-${c.titulo}-${c.fecha_inicio}`;

export function SectionHeader({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-lg bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#C41717]" />
      </div>
      <h2 className="text-slate-700 text-sm font-bold">{label}</h2>
      <span className="text-slate-400 text-xs font-semibold">{count}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/* ── Campana de notificaciones — una por cada clase en vivo a la que el
     usuario tiene acceso real (mismo feed que "Próximas clases en vivo"),
     para avisarle aunque no esté mirando el home en ese momento. ── */
export function NotificacionesBell({ clases }: { clases: ClaseResumen[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen((v) => !v)} title="Notificaciones"
        className="relative p-2 rounded-lg text-white hover:bg-white/15 transition-all">
        <Bell className="w-4 h-4" />
        {clases.length > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-white
                           text-[#C41717] text-[9px] font-bold leading-[15px] text-center">
            {clases.length > 9 ? "9+" : clases.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-xl bg-white border border-slate-200
                         shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-50 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-slate-700 text-sm font-bold">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {clases.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay notificaciones nuevas.</p>
            ) : (
              clases.map((c, i) => (
                <a key={i} href={c.link_reunion ?? undefined} target={c.link_reunion ? "_blank" : undefined} rel="noopener noreferrer"
                  className={`flex items-start gap-2.5 px-4 py-3 transition-colors ${c.link_reunion ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}`}>
                  <div className="w-7 h-7 rounded-lg bg-[#C41717]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Video className="w-3.5 h-3.5 text-[#C41717]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-800 text-xs font-semibold">Próxima clase, no te la pierdas</p>
                    <p className="text-slate-600 text-xs truncate">{c.titulo}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      {c.origen}: {c.origen_nombre} · {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Íconos permitidos para el avatar (nunca fotos reales, a propósito — el
// backend valida contra esta misma lista, ver usuarios/actualizar-avatar.php).
export const ICONOS_AVATAR: Record<string, React.ElementType> = {
  User, GraduationCap, BookOpen, Star, Heart, Smile, Rocket, Sparkles, Trophy, Target, Compass, Lightbulb,
};

// Hora en vivo del encabezado — se actualiza sola cada minuto.
export function Reloj() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden md:flex items-center gap-1.5 text-white text-xs font-medium shrink-0 px-2">
      <Clock className="w-3.5 h-3.5" />
      {ahora.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}
    </div>
  );
}

export function AvatarPicker({ grande = false }: { grande?: boolean }) {
  const { currentUser, updateAvatar } = useCampusAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icono = ICONOS_AVATAR[currentUser?.avatar ?? ""] ?? User;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen((v) => !v)} title="Cambiar ícono de perfil"
        className={grande
          ? "w-16 h-16 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center text-[#C41717] hover:bg-[#C41717]/15 transition-colors"
          : "w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white hover:bg-white/25 transition-colors"}>
        <Icono className={grande ? "w-7 h-7" : "w-4 h-4"} />
      </button>
      {open && (
        <div className={`absolute ${grande ? "left-0" : "right-0"} top-full mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-xl bg-white border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.18)] z-50 p-3`}>
          <p className="text-slate-500 text-[11px] font-semibold mb-2">Elige tu ícono</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(ICONOS_AVATAR).map(([nombre, Ic]) => (
              <button key={nombre} onClick={() => { updateAvatar(nombre); setOpen(false); }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${currentUser?.avatar === nombre ? "bg-[#C41717] text-white" : "bg-slate-50 text-slate-500 hover:bg-[#C41717]/10 hover:text-[#C41717]"}`}>
                <Ic className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini calendario del mes — marca con un punto los días que tienen alguna
// clase virtual (real: próximas + histórico), para ubicarse de un vistazo.
export function MiniCalendario({ clases }: { clases: ClaseResumen[] }) {
  const [mes, setMes] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const diasConClase = new Set(clases.map((c) => new Date(c.fecha_inicio).toDateString()));
  const hoy = new Date().toDateString();

  const primerDiaSemana = mes.getDay();
  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  const celdas: (number | null)[] = [...Array(primerDiaSemana).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2.5">
        <button onClick={() => setMes((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="p-1 rounded-lg text-slate-400 hover:text-[#C41717] hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-slate-800 text-xs font-bold capitalize">{mes.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</p>
        <button onClick={() => setMes((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-1 rounded-lg text-slate-400 hover:text-[#C41717] hover:bg-slate-50 transition-colors">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["D", "L", "M", "X", "J", "V", "S"].map((d) => (
          <span key={d} className="text-slate-300 text-[10px] font-bold">{d}</span>
        ))}
        {celdas.map((dia, i) => {
          if (dia === null) return <span key={i} />;
          const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia).toDateString();
          const esHoy = fecha === hoy;
          const tieneClase = diasConClase.has(fecha);
          return (
            <div key={i} className={`relative text-[11px] rounded-lg py-1.5 ${esHoy ? "bg-[#C41717] text-white font-bold" : "text-slate-600"}`}>
              {dia}
              {tieneClase && !esHoy && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C41717]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Barra de "últimas noticias" — anuncios reales de lo que el usuario tiene
// matriculado/a su cargo (nunca contenido de relleno), en tarjetas horizontales.
export function BarraNoticias({ anuncios }: { anuncios: AnuncioResumen[] }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
        <Megaphone className="w-3.5 h-3.5 text-[#C41717]/60" /> Últimas noticias
      </p>
      {anuncios.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-slate-400 text-xs">Todavía no hay anuncios nuevos.</p>
        </div>
      ) : (
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {anuncios.map((a, i) => (
          <div key={i} className={`shrink-0 w-64 rounded-xl p-3.5 border ${a.importancia === "Importante" ? "bg-[#C41717]/[0.04] border-[#C41717]/20" : "bg-white border-slate-200"}`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">{a.origen}: {a.origen_nombre}</p>
            <p className="text-slate-800 text-sm font-semibold mt-1 leading-snug line-clamp-2">{a.titulo}</p>
            <p className="text-slate-400 text-[11px] mt-1">{new Date(a.created_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
