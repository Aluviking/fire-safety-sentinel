import { useState } from "react";
import { Mail, Send, Loader2, Trash2, Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Destinatario { nombre: string; correo: string }

// Roster real de Royal Films S.A.S. (12 empleados, ya matriculados y con
// cuenta de acceso creada) -- se deja precargado para no tener que
// transcribirlo a mano cada vez que se quiera reenviar.
const ROYAL_FILMS: Destinatario[] = [
  { nombre: "Karen Yulieth Arteaga Guevara", correo: "arteagaguevarakarenyulieth@gmail.com" },
  { nombre: "Paula Stefany Bayona Rodriguez", correo: "antodres1523@gmail.com" },
  { nombre: "Wilmer Duvan Bernal Acosta", correo: "duvanbernal94@gmail.com" },
  { nombre: "Yolanis Maria Bolaños Duarte", correo: "yolanisbolano9@gmail.com" },
  { nombre: "Oscar Ricardo Cardenas Aroca", correo: "oscaricard14@gmail.com" },
  { nombre: "Andres Felipe Duque Puentes", correo: "exisoph@gmail.com" },
  { nombre: "Diana Lorena Gayon Alape", correo: "alape.2083@hotmail.com" },
  { nombre: "Cristhian David Macias Marin", correo: "cristhianmacias2201@gmail.com" },
  { nombre: "Katherine Moya Centeno", correo: "Km6588487@gmail.com" },
  { nombre: "Jhon Alexander Parra Villalba", correo: "Jhonalex7villalba@gmail.com" },
  { nombre: "Danny Paola Rodriguez Benitez", correo: "danibenitez1612@gmail.com" },
  { nombre: "Linda Julieth Triana Triana", correo: "lindatriana3006@gmail.com" },
];

export default function EnviarCorreosPanel() {
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([
    { nombre: "Prueba", correo: "alexmusicfree570@gmail.com" },
  ]);
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ enviados: number; fallidos: { correo: string; error: string }[] } | null>(null);
  const [error, setError] = useState("");

  const agregarCorreo = () => {
    const correo = nuevoCorreo.trim();
    if (!correo.includes("@")) return;
    if (destinatarios.some((d) => d.correo.toLowerCase() === correo.toLowerCase())) { setNuevoCorreo(""); return; }
    setDestinatarios((prev) => [...prev, { nombre: "", correo }]);
    setNuevoCorreo("");
  };

  const quitar = (correo: string) => setDestinatarios((prev) => prev.filter((d) => d.correo !== correo));

  const cargarRoyalFilms = () => {
    setDestinatarios((prev) => {
      const existentes = new Set(prev.map((d) => d.correo.toLowerCase()));
      const nuevos = ROYAL_FILMS.filter((d) => !existentes.has(d.correo.toLowerCase()));
      return [...prev, ...nuevos];
    });
  };

  const vaciar = () => setDestinatarios([]);

  const enviar = async () => {
    if (destinatarios.length === 0) return;
    setEnviando(true);
    setError("");
    setResultado(null);
    try {
      const r = await apiFetch<{ ok: true; enviados: number; fallidos: { correo: string; error: string }[] }>(
        "/correos/enviar-masivo.php",
        { method: "POST", json: { destinatarios, asunto: "Bienvenido a GFO Academy" } }
      );
      setResultado({ enviados: r.enviados, fallidos: r.fallidos });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar los correos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#C41717]" />
          <h2 className="font-semibold text-slate-800 text-sm">Enviar correo de bienvenida</h2>
        </div>
        <span className="text-xs font-bold text-slate-500">{destinatarios.length} destinatario(s)</span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500">
          Manda la plantilla de bienvenida a Campus Virtual (usuario y contraseña = cédula) a la lista de abajo.
          Se envían uno por uno con una pausa corta entre cada uno.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={cargarRoyalFilms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 text-xs font-semibold transition-all">
            <Plus className="w-3.5 h-3.5" /> Cargar los 12 de Royal Films
          </button>
          <button onClick={vaciar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600 text-xs font-semibold transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Vaciar lista
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarCorreo(); } }}
            placeholder="Agregar un correo suelto..."
            className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
          />
          <button onClick={agregarCorreo}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 text-xs font-semibold transition-all">
            Agregar
          </button>
        </div>

        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {destinatarios.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">Sin destinatarios. Agrega uno o carga los de Royal Films.</p>
          ) : destinatarios.map((d) => (
            <div key={d.correo} className="flex items-center justify-between px-3 py-2 text-xs">
              <div>
                {d.nombre && <span className="font-medium text-slate-700">{d.nombre} · </span>}
                <span className="text-slate-500">{d.correo}</span>
              </div>
              <button onClick={() => quitar(d.correo)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {resultado && (
          <div className="text-xs font-medium rounded-lg px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
            Enviados: {resultado.enviados}
            {resultado.fallidos.length > 0 && (
              <div className="mt-1 text-red-600">
                Fallidos: {resultado.fallidos.map((f) => `${f.correo} (${f.error})`).join(", ")}
              </div>
            )}
          </div>
        )}

        <button onClick={enviar} disabled={enviando || destinatarios.length === 0}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#a51313] text-white text-sm font-semibold disabled:opacity-50 transition-all">
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {enviando ? "Enviando..." : `Enviar a ${destinatarios.length}`}
        </button>
      </div>
    </div>
  );
}
