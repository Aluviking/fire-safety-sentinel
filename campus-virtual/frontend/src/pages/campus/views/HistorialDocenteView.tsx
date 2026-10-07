import { useEffect, useMemo, useState } from "react";
import { ScrollText, Megaphone, Video } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Movimiento {
  tipo: "Anuncio" | "Clase virtual";
  origen: "Programa" | "Asignatura" | "Curso" | "Curso ligero";
  origen_nombre: string;
  titulo: string;
  detalle: string | null;
  fecha: string;
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, hoy)) return "Hoy";
  if (sameDay(d, ayer)) return "Ayer";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

/* ── Historial propio del Docente — anuncios publicados y clases virtuales
     programadas dentro de SUS programas/asignaturas/cursos/cursos ligeros.
     No es la auditoría administrativa completa (esa sigue siendo exclusiva
     de Super Admin) — es su propia actividad, no la de todo el sistema. ── */
export default function HistorialDocenteView() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ movimientos: Movimiento[] }>("/historial-docente/list.php")
      .then((data) => setMovimientos(data.movimientos))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el historial."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Movimiento[]>();
    for (const m of movimientos) {
      const key = formatFecha(m.fecha);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [movimientos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center">
          <ScrollText className="w-4 h-4 text-[#C41717]" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Historial</h1>
          <p className="text-slate-500 text-xs">Anuncios y clases virtuales de tus programas, asignaturas y cursos.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-12">Cargando...</p>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : movimientos.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Aún no hay movimientos registrados.</p>
          ) : (
            <div className="space-y-6">
              {groups.map(([fecha, entries]) => (
                <div key={fecha}>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">{fecha}</p>
                  <div className="space-y-1.5">
                    {entries.map((m, i) => {
                      const Icon = m.tipo === "Anuncio" ? Megaphone : Video;
                      const accent = m.tipo === "Anuncio" ? "#d97706" : "#0d9488";
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accent}15`, color: accent }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-800">
                              <span style={{ color: accent }} className="font-medium">{m.tipo}</span>{" "}
                              <span className="font-medium">{m.titulo}</span>
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {m.origen}: {m.origen_nombre}{m.detalle ? ` · ${m.detalle}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
                            {formatHora(m.fecha)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
