import { useState, useEffect } from "react";
import { Plus, Loader2, X, Video, ExternalLink, Link2, Disc, PlayCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SearchableSelect } from "./SearchableSelect";

export interface ClaseVirtual {
  id: number;
  titulo: string;
  aula_recurso_id: number | null;
  aula_nombre: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  link_reunion: string | null;
  zoom_meeting_id: string | null;
  grabacion_url: string | null;
  // Solo presentes cuando esta fila en realidad viene de otro nivel (ej. una
  // asignatura del pensum, vista desde el programa que la contiene) — null
  // para las clases creadas directamente aquí.
  origen_nombre?: string | null;
  origen_api_base?: string | null;
}
interface AulaRecurso { id: number; nombre: string }
interface ZoomStatus { configurado: boolean }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

/**
 * Pestaña "Clases virtuales" — compartida por Asignaturas, Cursos, Cursos
 * ligeros y Programas/Diplomados (antes era el mismo código copiado 4 veces,
 * uno por módulo). `apiBase` apunta a la carpeta de endpoints de ese módulo
 * (ej. "/asignatura-clases") y `paramName` es el nombre que ese módulo usa
 * para identificar al padre en la URL/body (ej. "asignaturaId").
 *
 * El link de la reunión se puede crear de 2 formas: generándolo de verdad
 * con Zoom (si el servidor ya tiene la cuenta configurada — Server-to-Server
 * OAuth, no hace falta que nadie "conecte" nada desde aquí, ya queda listo
 * para todos apenas el Super Admin pone las credenciales una vez en
 * config.php) con grabación automática en la nube, o pegando un link
 * cualquiera a mano. Cuando Zoom termina de procesar la grabación, avisa
 * solo (webhook) y el link de "Ver grabación" aparece aquí mismo, sin que
 * nadie tenga que subirlo a mano.
 */
export function ClasesVirtualesTab({
  parentId, apiBase, paramName,
}: { parentId: number; apiBase: string; paramName: string }) {
  const [clases, setClases] = useState<ClaseVirtual[]>([]);
  const [aulas, setAulas] = useState<AulaRecurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtab, setSubtab] = useState<"proximas" | "anteriores">("proximas");
  const [creating, setCreating] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modoLink, setModoLink] = useState<"zoom" | "manual">("manual");
  const [linkManual, setLinkManual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [zoomStatus, setZoomStatus] = useState<ZoomStatus | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ clases: ClaseVirtual[] }>(`${apiBase}/list.php?${paramName}=${parentId}`),
      apiFetch<{ aulas: AulaRecurso[] }>("/aulas-recursos/list.php"),
    ]).then(([c, a]) => { setClases(c.clases); setAulas(a.aulas); }).finally(() => setLoading(false));
  };
  useEffect(load, [parentId, apiBase, paramName]);

  useEffect(() => {
    apiFetch<ZoomStatus>("/zoom/status.php")
      .then((d) => { setZoomStatus(d); if (d.configurado) setModoLink("zoom"); })
      .catch(() => setZoomStatus({ configurado: false }));
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !fechaInicio) return;
    setGuardando(true);
    setError("");
    try {
      await apiFetch(`${apiBase}/create.php`, {
        method: "POST",
        json: {
          [paramName]: parentId,
          titulo: titulo.trim(),
          aulaRecursoId: aulaId ? Number(aulaId) : null,
          fechaInicio,
          fechaFin: fechaFin || null,
          crearConZoom: modoLink === "zoom",
          linkReunion: modoLink === "manual" ? (linkManual.trim() || null) : null,
        },
      });
      setTitulo(""); setAulaId(""); setFechaInicio(""); setFechaFin(""); setLinkManual("");
      setCreating(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo programar la clase.");
    } finally {
      setGuardando(false);
    }
  };

  const remove = async (c: ClaseVirtual) => {
    await apiFetch(`${c.origen_api_base ?? apiBase}/delete.php`, { method: "POST", json: { id: c.id } });
    load();
  };

  const now = new Date();
  const filtered = clases.filter((c) => (subtab === "proximas" ? new Date(c.fecha_inicio) >= now : new Date(c.fecha_inicio) < now));
  const hayOrigenMixto = clases.some((c) => c.origen_nombre);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button onClick={() => setSubtab("proximas")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${subtab === "proximas" ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-500"}`}>Próximas clases</button>
          <button onClick={() => setSubtab("anteriores")} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${subtab === "anteriores" ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-500"}`}>Clases anteriores</button>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
          <Plus className="w-3.5 h-3.5" /> Programar clase
        </button>
      </div>

      {creating && (
        <form onSubmit={add} className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la clase" className={inputCls} />
          <SearchableSelect
            value={aulaId} onChange={setAulaId}
            options={aulas.map((a) => ({ value: String(a.id), label: a.nombre }))}
            placeholder="Aula virtual (opcional)..."
          />
          <div className="grid grid-cols-2 gap-2">
            <input value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} type="datetime-local" className={inputCls} />
            <input value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} type="datetime-local" className={inputCls} />
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Link de la reunión</p>

            {zoomStatus?.configurado && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setModoLink("zoom")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors ${modoLink === "zoom" ? "bg-[#C41717]/10 border-[#C41717]/30 text-[#C41717]" : "border-slate-200 text-slate-500"}`}>
                  <Video className="w-3.5 h-3.5" /> Crear con Zoom
                </button>
                <button type="button" onClick={() => setModoLink("manual")}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border transition-colors ${modoLink === "manual" ? "bg-[#C41717]/10 border-[#C41717]/30 text-[#C41717]" : "border-slate-200 text-slate-500"}`}>
                  <Link2 className="w-3.5 h-3.5" /> Pegar un link
                </button>
              </div>
            )}

            {modoLink === "manual" && (
              <input value={linkManual} onChange={(e) => setLinkManual(e.target.value)} placeholder="https://zoom.us/j/..." className={inputCls} />
            )}
            {modoLink === "zoom" && zoomStatus?.configurado && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Disc className="w-3 h-3 text-red-500" /> Se grabará sola en la nube — el link de la grabación aparecerá aquí apenas Zoom termine de procesarla.
              </p>
            )}
          </div>

          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button type="submit" disabled={guardando} className="px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60">
            {guardando ? "Programando..." : "Programar"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">No hay registros.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Clase</th>
                {hayOrigenMixto && <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Origen</th>}
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Aula</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Inicio</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Reunión</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Grabación</th>
                <th className="text-right px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={`${c.origen_api_base ?? apiBase}-${c.id}`} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">{c.titulo}</td>
                  {hayOrigenMixto && (
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {c.origen_nombre ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">Asignatura: {c.origen_nombre}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2 text-slate-500 text-xs">{c.aula_nombre ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{new Date(c.fecha_inicio).toLocaleString("es-CO")}</td>
                  <td className="px-3 py-2 text-xs">
                    {c.link_reunion ? (
                      <a href={c.link_reunion} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#C41717] hover:text-[#B01313] font-semibold">
                        <ExternalLink className="w-3 h-3" /> Unirse
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {c.grabacion_url ? (
                      <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold">
                        <PlayCircle className="w-3 h-3" /> Ver grabación
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => remove(c)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
