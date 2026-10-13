import { useState, useEffect } from "react";
import { Plus, Loader2, X, Video, Link2, Disc, PlayCircle, Calendar, KeyRound } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SearchableSelect } from "./SearchableSelect";

// Una clase ya pasada no debe ofrecer "Unirse" (la reunión en vivo ya
// terminó), solo "Ver grabación" si ya está lista — mismo criterio que usa
// el panel del estudiante.
const claseYaPaso = (c: { fecha_inicio: string; fecha_fin: string | null }) =>
  new Date(c.fecha_fin ?? c.fecha_inicio).getTime() < Date.now();

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
  grabacion_password?: string | null;
  // Solo presentes cuando esta fila en realidad viene de otro nivel (ej. una
  // asignatura del pensum, vista desde el programa que la contiene) — null
  // para las clases creadas directamente aquí.
  origen_nombre?: string | null;
  origen_api_base?: string | null;
  // Una clase de prueba siempre se puede borrar de verdad, aunque ya tenga
  // grabación — una real, no (se archiva, para no quitarle a los estudiantes
  // algo que ya vieron). Vuelve 0/1 desde PHP.
  es_prueba?: number;
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
  const [creating, setCreating] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [aulaId, setAulaId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [modoLink, setModoLink] = useState<"zoom" | "manual">("manual");
  const [linkManual, setLinkManual] = useState("");
  const [esPrueba, setEsPrueba] = useState(false);
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
          esPrueba,
        },
      });
      setTitulo(""); setAulaId(""); setFechaInicio(""); setFechaFin(""); setLinkManual(""); setEsPrueba(false);
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

  const hayOrigenMixto = clases.some((c) => c.origen_nombre);
  const proximas = clases.filter((c) => !claseYaPaso(c));
  const anteriores = clases.filter((c) => claseYaPaso(c));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Clases virtuales</h3>
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">¿Es una reunión de prueba?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEsPrueba(false)}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${!esPrueba ? "bg-[#C41717]/10 border-[#C41717]/30 text-[#C41717]" : "border-slate-200 text-slate-500"}`}>
                No, es una clase real
              </button>
              <button type="button" onClick={() => setEsPrueba(true)}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${esPrueba ? "bg-[#C41717]/10 border-[#C41717]/30 text-[#C41717]" : "border-slate-200 text-slate-500"}`}>
                Sí, es de prueba
              </button>
            </div>
            {!esPrueba && (
              <p className="text-[11px] text-slate-400">Una vez tenga grabación, ya no se va a poder eliminar — solo se archiva para que los estudiantes no pierdan acceso.</p>
            )}
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
      ) : clases.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">No hay registros.</p>
      ) : (
        <div className="space-y-5">
          {proximas.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Video className="w-3.5 h-3.5 text-[#C41717]/60" /> Clases en vivo
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {proximas.map((c) => (
                  <ClaseCard key={`${c.origen_api_base ?? apiBase}-${c.id}`} c={c} hayOrigenMixto={hayOrigenMixto} onRemove={() => remove(c)} />
                ))}
              </div>
            </div>
          )}
          {anteriores.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <PlayCircle className="w-3.5 h-3.5 text-slate-400" /> Clases anteriores
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {anteriores.map((c) => (
                  <ClaseCard key={`${c.origen_api_base ?? apiBase}-${c.id}`} c={c} hayOrigenMixto={hayOrigenMixto} onRemove={() => remove(c)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de una clase — mismo diseño que ya ve el estudiante, con el
     botón de quitar (X) y la etiqueta de origen/prueba propias del panel
     admin/docente agregadas encima. ── */
function ClaseCard({
  c, hayOrigenMixto, onRemove,
}: { c: ClaseVirtual; hayOrigenMixto: boolean; onRemove: () => void }) {
  const pasada = claseYaPaso(c);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2 relative">
      <button onClick={onRemove} title="Quitar" className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-2 pr-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pasada ? "bg-slate-100 border border-slate-200" : "bg-[#C41717]/8 border border-[#C41717]/20"}`}>
          <Video className={`w-4 h-4 ${pasada ? "text-slate-400" : "text-[#C41717]"}`} />
        </div>
        <p className="text-slate-800 font-semibold text-sm leading-tight truncate">{c.titulo}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {hayOrigenMixto && c.origen_nombre && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">Asignatura: {c.origen_nombre}</span>
        )}
        {!!c.es_prueba && (
          <span className="inline-block px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold uppercase">Prueba</span>
        )}
      </div>
      {c.aula_nombre && <p className="text-[11px] text-slate-400">Aula: {c.aula_nombre}</p>}
      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
        {new Date(c.fecha_inicio).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <div className="flex items-center gap-2 mt-1">
        {!pasada && c.link_reunion && (
          <a href={c.link_reunion} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#C41717] hover:bg-[#A81212] rounded-lg px-3 py-1.5 transition-colors">
            <Video className="w-3.5 h-3.5" /> Unirse
          </a>
        )}
        {c.grabacion_url && (
          <a href={c.grabacion_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] bg-[#C41717]/8 hover:bg-[#C41717]/15 rounded-lg px-3 py-1.5 transition-colors">
            <PlayCircle className="w-3.5 h-3.5" /> Ver grabación
          </a>
        )}
        {c.grabacion_url && c.grabacion_password && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <KeyRound className="w-3 h-3 text-slate-400 shrink-0" /> Clave: <span className="font-semibold text-slate-700">{c.grabacion_password}</span>
          </span>
        )}
        {pasada && !c.grabacion_url && (
          <span className="text-[11px] text-slate-300">Grabación en proceso...</span>
        )}
        {!pasada && !c.link_reunion && !c.grabacion_url && (
          <span className="text-[11px] text-slate-300">Sin link disponible todavía</span>
        )}
      </div>
    </div>
  );
}
