import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";

interface Preinscripcion {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  celular: string | null;
  correo: string | null;
  tipo_interes: "curso" | "programa" | "diplomado";
  item_nombre: string;
  estado: "Pendiente" | "Matriculado";
  created_at: string;
}

const TIPO_LABEL: Record<string, string> = { curso: "Curso", programa: "Programa", diplomado: "Diplomado" };

export default function InscritosView() {
  const { currentUser } = useCampusAuth();
  const canMatricular = currentUser?.role === "admin" || currentUser?.role === "super_admin";

  const [items, setItems] = useState<Preinscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [matriculando, setMatriculando] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ preinscripciones: Preinscripcion[] }>("/preinscripciones/list.php")
      .then((d) => setItems(d.preinscripciones))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const q = busqueda.trim().toLowerCase();
  const filtrados = q
    ? items.filter((p) => `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) || p.identificacion.includes(q))
    : items;

  const matricular = async (id: number) => {
    setMatriculando(id);
    try {
      await apiFetch("/preinscripciones/matricular.php", { method: "POST", json: { id } });
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al matricular.");
    } finally {
      setMatriculando(null);
    }
  };

  const pendientes = items.filter((p) => p.estado === "Pendiente").length;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div>
        <h1 className="text-slate-900 font-bold text-lg">Inscritos</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Solicitudes recibidas desde el formulario público de inscripción
          {pendientes > 0 && <span className="text-[#C41717] font-semibold"> · {pendientes} pendiente{pendientes !== 1 ? "s" : ""}</span>}.
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o identificación..."
          className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2
                     focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Celular</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Correo</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Interés</th>
                  <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Estado</th>
                  <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">Sin inscritos por ahora.</td></tr>
                ) : filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-800 font-medium text-xs whitespace-nowrap">{p.nombres} {p.apellidos}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.identificacion}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.celular ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500 text-xs">{p.correo ?? "—"}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="text-slate-400">{TIPO_LABEL[p.tipo_interes]}:</span>{" "}
                      <span className="text-slate-700 font-medium">{p.item_nombre}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium
                        ${p.estado === "Matriculado" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {p.estado === "Pendiente" && canMatricular && (
                        <button
                          onClick={() => matricular(p.id)} disabled={matriculando === p.id}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313] disabled:opacity-50"
                        >
                          {matriculando === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                          Matricular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
