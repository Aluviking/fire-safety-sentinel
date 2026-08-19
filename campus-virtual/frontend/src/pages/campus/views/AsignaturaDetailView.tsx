import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, BookOpen, Layers, Users as UsersIcon, Plus, Trash2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ContenidoEditor from "../ContenidoEditor";
import { SearchableSelect } from "../SearchableSelect";

interface Programa { id: number; nombre: string }
interface Asignatura { id: number; nombre: string; programas: Programa[] }
interface EstudianteOption { id: number; identificacion: string; nombre_completo: string }
interface Matricula { id: number; estudiante_id: number; identificacion: string; nombre_completo: string }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const TABS = [
  { key: "contenido", label: "Contenido de la asignatura", icon: BookOpen },
  { key: "programas", label: "Programas", icon: Layers },
  { key: "estudiantes", label: "Estudiantes", icon: UsersIcon },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/* ── Estudiantes matriculados en la asignatura ────────────────────────────── */
function EstudiantesTab({ asignaturaId }: { asignaturaId: number }) {
  const [matriculados, setMatriculados] = useState<Matricula[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<{ matriculados: Matricula[] }>(`/asignatura-estudiantes/list.php?asignaturaId=${asignaturaId}`),
      apiFetch<{ estudiantes: EstudianteOption[] }>("/estudiantes/list.php"),
    ]).then(([m, e]) => { setMatriculados(m.matriculados); setEstudiantes(e.estudiantes); }).finally(() => setLoading(false));
  };
  useEffect(load, [asignaturaId]);

  const inscritosIds = new Set(matriculados.map((m) => m.estudiante_id));
  const disponibles = estudiantes.filter((e) => !inscritosIds.has(e.id));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setError("");
    setAdding(true);
    try {
      await apiFetch("/asignatura-estudiantes/create.php", { method: "POST", json: { asignaturaId, estudianteId: Number(selectedId) } });
      setSelectedId("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al matricular.");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    await apiFetch("/asignatura-estudiantes/delete.php", { method: "POST", json: { id } });
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Estudiantes ({matriculados.length})</h3>
      </div>
      <form onSubmit={add} className="flex gap-2">
        <SearchableSelect
          value={selectedId} onChange={setSelectedId}
          options={disponibles.map((e) => ({ value: String(e.id), label: e.nombre_completo }))}
          placeholder="Seleccione estudiante..."
          className="flex-1"
        />
        <button type="submit" disabled={adding || !selectedId}
          className="flex items-center gap-1.5 px-4 rounded-lg bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" /> Matricular
        </button>
      </form>
      {error && <p className="text-[11px] text-red-500">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : matriculados.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Aún no hay estudiantes matriculados en esta asignatura.</p>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {matriculados.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{m.nombre_completo}</p>
                <p className="text-xs text-slate-400">{m.identificacion}</p>
              </div>
              <button onClick={() => remove(m.id)} className="text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Quitar de la asignatura">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function AsignaturaDetailView({ asignatura, onBack }: { asignatura: Asignatura; onBack: () => void }) {
  const [tab, setTab] = useState<TabKey>("contenido");

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a asignaturas
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{asignatura.nombre}</h2>
            <nav className="space-y-1">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                              ${tab === t.key ? "bg-[#C41717]/10 text-[#C41717]" : "text-slate-600 hover:bg-slate-50"}`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                  <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-5 min-w-0">
            {tab === "contenido" && (
              <ContenidoEditor contentBase="/asignatura-contenido" questionsBase="/asignatura-preguntas" ownerIdKey="asignaturaId" ownerId={asignatura.id} />
            )}
            {tab === "programas" && (
              asignatura.programas.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Esta asignatura no está asociada a ningún programa.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {asignatura.programas.map((p) => (
                    <div key={p.id} className="flex items-center gap-2.5 px-4 py-2.5">
                      <Layers className="w-3.5 h-3.5 text-[#C41717]/50 shrink-0" />
                      <p className="text-sm font-medium text-slate-800">{p.nombre}</p>
                    </div>
                  ))}
                </div>
              )
            )}
            {tab === "estudiantes" && <EstudiantesTab asignaturaId={asignatura.id} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
