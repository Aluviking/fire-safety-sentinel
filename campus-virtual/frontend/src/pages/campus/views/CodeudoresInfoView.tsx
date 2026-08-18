import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import RegistrarCodeudorModal, { type CodeudorEditable } from "../RegistrarCodeudorModal";
import { ConfirmModal } from "../ConfirmModal";

type Codeudor = CodeudorEditable;

export default function CodeudoresInfoView() {
  const { currentUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [codeudores, setCodeudores] = useState<Codeudor[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [editing, setEditing]       = useState<CodeudorEditable | null>(null);
  const [deleting, setDeleting]     = useState<{ id: number; nombre: string } | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ codeudores: Codeudor[] }>("/codeudores/list.php")
      .then((data) => setCodeudores(data.codeudores))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await apiFetch("/codeudores/delete.php", { method: "POST", json: { id: deleting.id } });
      setDeleting(null);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Error al eliminar el codeudor.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Información básica</h1>
          <p className="text-slate-500 text-xs mt-0.5">Codeudores registrados</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C41717]/8 border border-[#C41717]/20 text-[#C41717] text-xs font-semibold">
          {codeudores.length} registros
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/30" />
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : codeudores.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">
              Aún no hay codeudores registrados. El backup no traía sus nombres — solo el número de
              identificación referenciado en los créditos — así que se registran aquí manualmente.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Nombre completo</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Identificación</th>
                    <th className="text-left px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Contacto</th>
                    {isSuperAdmin && <th className="text-right px-4 py-2 text-slate-500 font-semibold text-xs uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {codeudores.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2 text-slate-800 font-medium">{c.nombre_completo}</td>
                      <td className="px-4 py-2 text-slate-600 font-mono text-[13px]">{c.identificacion}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs">{c.celular ?? "—"}{c.correo ? ` · ${c.correo}` : ""}</td>
                      {isSuperAdmin && (
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setEditing(c)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleting({ id: c.id, nombre: c.nombre_completo })} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RegistrarCodeudorModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        onCreated={load}
        editing={editing}
      />
      <ConfirmModal
        open={!!deleting}
        title="Eliminar codeudor"
        message={`¿Eliminar a "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </motion.div>
  );
}
