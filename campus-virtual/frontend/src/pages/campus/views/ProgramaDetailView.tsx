import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ChevronRight, BookOpen, Users as UsersIcon, Plus, Loader2,
  Settings, Upload, X, Pencil, Check, ChevronUp, ChevronDown, Network, Star,
} from "lucide-react";
import { apiFetch, apiImage } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { SearchableSelect } from "../SearchableSelect";
import { ConfirmModal } from "../ConfirmModal";
import { type Programa, ProgramaFormModal } from "./ProgramasView";

interface MatriculaReal {
  estudiante_id: number; identificacion: string; nombre_completo: string;
  periodo: string | null; nivel: string | null; estado: string; sede: string | null; jornada: string | null;
}
interface Certificado { id: number; nombre: string }
interface AsignaturaOption { id: number; codigo: string | null; nombre: string }
interface PensumAsignatura {
  id: number; programa_id: number; asignatura_id: number; orden: number;
  nivel: string | null; creditos: number | null; ih_semanal: number | null; ih_total: number | null;
  evaluar_para_cerrar: number;
  asignatura_codigo: string | null; asignatura_nombre: string;
}
interface Prerequisito { id: number; prerequisito_asignatura_id: number; prerequisito_nombre: string }

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const TABS = [
  { key: "programa", label: "Programa", icon: BookOpen },
  { key: "estudiantes", label: "Estudiantes", icon: UsersIcon },
  { key: "ajustes", label: "Ajustes", icon: Settings },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function InfoField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}:</p>
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 truncate">{value || "—"}</div>
    </div>
  );
}

/* ── Asignar una asignatura existente al pensum de este programa ─────────── */
function AsignarAsignaturaModal({
  programaId, yaAsignadasIds, onClose, onSaved,
}: { programaId: number; yaAsignadasIds: number[]; onClose: () => void; onSaved: () => void }) {
  const [asignaturas, setAsignaturas] = useState<AsignaturaOption[]>([]);
  const [asignaturaId, setAsignaturaId] = useState("");
  const [nivel, setNivel] = useState("");
  const [creditos, setCreditos] = useState("");
  const [ihSemanal, setIhSemanal] = useState("");
  const [ihTotal, setIhTotal] = useState("");
  const [evaluarParaCerrar, setEvaluarParaCerrar] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<{ asignaturas: AsignaturaOption[] }>("/asignaturas/list.php").then((d) => setAsignaturas(d.asignaturas)).catch(() => {});
  }, []);

  const disponibles = asignaturas.filter((a) => !yaAsignadasIds.includes(a.id));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!asignaturaId) { setError("Selecciona una asignatura."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/programa-asignaturas/create.php", {
        method: "POST",
        json: {
          programaId, asignaturaId: Number(asignaturaId), nivel: nivel || null,
          creditos: creditos ? Number(creditos) : null, ihSemanal: ihSemanal ? Number(ihSemanal) : null,
          ihTotal: ihTotal ? Number(ihTotal) : null, evaluarParaCerrar,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al asignar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Asignar asignatura</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <SearchableSelect value={asignaturaId} onChange={setAsignaturaId}
            options={disponibles.map((a) => ({ value: String(a.id), label: a.nombre }))} placeholder="Seleccione asignatura..." />
          <div className="grid grid-cols-2 gap-2">
            <input value={nivel} onChange={(e) => setNivel(e.target.value)} placeholder="Nivel (ej. BASICO)" className={inputCls} />
            <input value={creditos} onChange={(e) => setCreditos(e.target.value)} type="number" min={0} placeholder="Créditos" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={ihSemanal} onChange={(e) => setIhSemanal(e.target.value)} type="number" min={0} placeholder="IH Semanal" className={inputCls} />
            <input value={ihTotal} onChange={(e) => setIhTotal(e.target.value)} type="number" min={0} placeholder="IH Total" className={inputCls} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-700">Evaluar para cerrar</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" checked={evaluarParaCerrar} onChange={() => setEvaluarParaCerrar(true)} className="accent-[#C41717]" /> Sí
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" checked={!evaluarParaCerrar} onChange={() => setEvaluarParaCerrar(false)} className="accent-[#C41717]" /> No
              </label>
            </div>
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Asignando..." : "Asignar"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Editar los ajustes del pensum (nombre + reglas de evaluación) ───────── */
function EditarPensumModal({ programa, onClose, onSaved }: { programa: Programa; onClose: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState(programa.pensum_nombre || "PENSUM");
  const [porcentajeInasistencia, setPorcentajeInasistencia] = useState(programa.porcentaje_inasistencia != null ? String(programa.porcentaje_inasistencia) : "");
  const [notaAprobacion, setNotaAprobacion] = useState(programa.nota_aprobacion != null ? String(programa.nota_aprobacion) : "");
  const [valorMaximo, setValorMaximo] = useState(programa.valor_maximo_calificacion != null ? String(programa.valor_maximo_calificacion) : "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim()) { setError("El nombre es obligatorio."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/programas/update-pensum.php", {
        method: "POST",
        json: {
          id: programa.id, pensumNombre: nombre.trim(),
          porcentajeInasistencia: porcentajeInasistencia ? Number(porcentajeInasistencia) : null,
          notaAprobacion: notaAprobacion ? Number(notaAprobacion) : null,
          valorMaximoCalificacion: valorMaximo ? Number(valorMaximo) : null,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Editar pénsum</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1">Nombre *</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1">Porcentaje de inasistencia</label>
            <input value={porcentajeInasistencia} onChange={(e) => setPorcentajeInasistencia(e.target.value)} type="number" min={0} max={100} placeholder="Ej. 30" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">Nota de aprobación</label>
              <input value={notaAprobacion} onChange={(e) => setNotaAprobacion(e.target.value)} type="number" step="0.1" min={0} placeholder="Ej. 3.5" className={inputCls} />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">Valor máximo</label>
              <input value={valorMaximo} onChange={(e) => setValorMaximo(e.target.value)} type="number" step="0.1" min={0} placeholder="Ej. 5" className={inputCls} />
            </div>
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Guardando..." : "Aceptar"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Editar nivel/créditos/IH/evaluar-para-cerrar de una asignatura DENTRO de este pensum ── */
function EditarAsignaturaPensumModal({ item, onClose, onSaved }: { item: PensumAsignatura; onClose: () => void; onSaved: () => void }) {
  const [nivel, setNivel] = useState(item.nivel ?? "");
  const [creditos, setCreditos] = useState(item.creditos != null ? String(item.creditos) : "");
  const [ihSemanal, setIhSemanal] = useState(item.ih_semanal != null ? String(item.ih_semanal) : "");
  const [ihTotal, setIhTotal] = useState(item.ih_total != null ? String(item.ih_total) : "");
  const [evaluarParaCerrar, setEvaluarParaCerrar] = useState(!!item.evaluar_para_cerrar);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch("/programa-asignaturas/update.php", {
        method: "POST",
        json: {
          id: item.id, nivel: nivel || null, creditos: creditos ? Number(creditos) : null,
          ihSemanal: ihSemanal ? Number(ihSemanal) : null, ihTotal: ihTotal ? Number(ihTotal) : null,
          evaluarParaCerrar,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Editar asignatura</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-slate-500 text-[11px] font-semibold mb-1">Asignatura</label>
            <input value={item.asignatura_nombre} disabled className={`${inputCls} bg-slate-50 text-slate-400`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">Nivel *</label>
              <input value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">Créditos *</label>
              <input value={creditos} onChange={(e) => setCreditos(e.target.value)} type="number" min={0} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">IH Semanal *</label>
              <input value={ihSemanal} onChange={(e) => setIhSemanal(e.target.value)} type="number" min={0} className={inputCls} />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] font-semibold mb-1">IH Total *</label>
              <input value={ihTotal} onChange={(e) => setIhTotal(e.target.value)} type="number" min={0} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-700">Evaluar para cerrar *</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" checked={evaluarParaCerrar} onChange={() => setEvaluarParaCerrar(true)} className="accent-[#C41717]" /> Sí
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input type="radio" checked={!evaluarParaCerrar} onChange={() => setEvaluarParaCerrar(false)} className="accent-[#C41717]" /> No
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Guardando..." : "Aceptar"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Prerrequisitos de matrícula de una asignatura, dentro de este programa ── */
function PrerequisitosModal({
  programaId, item, candidatas, onClose,
}: { programaId: number; item: PensumAsignatura; candidatas: PensumAsignatura[]; onClose: () => void }) {
  const [prerequisitos, setPrerequisitos] = useState<Prerequisito[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch<{ prerequisitos: Prerequisito[] }>(`/programa-asignatura-prerequisitos/list.php?programaId=${programaId}&asignaturaId=${item.asignatura_id}`)
      .then((d) => setPrerequisitos(d.prerequisitos)).finally(() => setLoading(false));
  };
  useEffect(load, [programaId, item.asignatura_id]);

  const yaSonPrereq = new Set(prerequisitos.map((p) => p.prerequisito_asignatura_id));
  const disponibles = candidatas.filter((c) => !yaSonPrereq.has(c.asignatura_id));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setAdding(true);
    try {
      await apiFetch("/programa-asignatura-prerequisitos/create.php", {
        method: "POST",
        json: { programaId, asignaturaId: item.asignatura_id, prerequisitoAsignaturaId: Number(selectedId) },
      });
      setSelectedId("");
      load();
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id: number) => {
    await apiFetch("/programa-asignatura-prerequisitos/delete.php", { method: "POST", json: { id } });
    load();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Administrar prerrequisitos de matrícula</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">Asignatura:</span> {item.asignatura_nombre}</p>
          <form onSubmit={add} className="flex gap-2">
            <SearchableSelect value={selectedId} onChange={setSelectedId}
              options={disponibles.map((c) => ({ value: String(c.asignatura_id), label: c.asignatura_nombre }))}
              placeholder="Seleccione..." className="flex-1" />
            <button type="submit" disabled={adding || !selectedId}
              className="px-4 rounded-lg bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold disabled:opacity-60 transition-colors shrink-0">
              Agregar
            </button>
          </form>
          {loading ? (
            <div className="flex justify-center py-6 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : prerequisitos.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6 border border-slate-200 rounded-xl">No hay registros.</p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {prerequisitos.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-3.5 py-2.5">
                  <p className="text-sm text-slate-700">{p.prerequisito_nombre}</p>
                  <button onClick={() => remove(p.id)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sección Pensum (settings + tabla de asignaturas del programa) ───────── */
function PensumSection({ programa, canEdit, onUpdated }: { programa: Programa; canEdit: boolean; onUpdated: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [asignaturas, setAsignaturas] = useState<PensumAsignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [editandoPensum, setEditandoPensum] = useState(false);
  const [eliminandoPensum, setEliminandoPensum] = useState(false);
  const [editingAsig, setEditingAsig] = useState<PensumAsignatura | null>(null);
  const [prerequisitosDe, setPrerequisitosDe] = useState<PensumAsignatura | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ asignaturas: PensumAsignatura[] }>(`/programa-asignaturas/list.php?programaId=${programa.id}`)
      .then((d) => setAsignaturas(d.asignaturas)).finally(() => setLoading(false));
  };
  useEffect(load, [programa.id]);

  const quitarAsignatura = async (pa: PensumAsignatura) => {
    if (!window.confirm(`¿Quitar "${pa.asignatura_nombre}" de este pensum?`)) return;
    await apiFetch("/programa-asignaturas/delete.php", { method: "POST", json: { id: pa.id } });
    load();
  };

  const confirmEliminarPensum = async () => {
    await apiFetch("/programas/reset-pensum.php", { method: "POST", json: { id: programa.id } });
    setEliminandoPensum(false);
    load();
    onUpdated();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <button onClick={() => setCollapsed((v) => !v)} className="flex items-center gap-2 text-sm font-bold text-slate-700">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          {(programa.pensum_nombre || "PENSUM").toUpperCase()}
        </button>
        {canEdit && !collapsed && (
          <div className="flex items-center gap-4">
            <button onClick={() => setAsignando(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
              <Plus className="w-3.5 h-3.5" /> Asignar asignatura
            </button>
            <button onClick={() => setEditandoPensum(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#C41717]">
              <Pencil className="w-3.5 h-3.5" /> Editar pensum
            </button>
            <button onClick={() => setEliminandoPensum(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500">
              <X className="w-3.5 h-3.5" /> Eliminar pensum
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" /> Pensum actual
          </span>
          <div className="grid sm:grid-cols-3 gap-4">
            <InfoField label="Porcentaje de inasistencia" value={programa.porcentaje_inasistencia != null ? `${programa.porcentaje_inasistencia}%` : null} />
            <InfoField label="Nota de aprobación" value={programa.nota_aprobacion != null ? String(programa.nota_aprobacion) : null} />
            <InfoField label="Valor máximo de calificación" value={programa.valor_maximo_calificacion != null ? String(programa.valor_maximo_calificacion) : null} />
          </div>

          {loading ? (
            <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
          ) : asignaturas.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Este pensum aún no tiene asignaturas.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Código</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Asignatura</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Nivel</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Créditos</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">IH Semanal</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">IH Total</th>
                    {canEdit && <th className="text-right px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {asignaturas.map((pa) => (
                    <tr key={pa.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{String(pa.orden).padStart(2, "0")} - {programa.codigo ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-800 font-medium text-xs">{pa.asignatura_nombre}</td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{pa.nivel ?? "—"}</td>
                      <td className="px-3 py-2 text-center text-slate-500 text-xs">{pa.creditos ?? 0}</td>
                      <td className="px-3 py-2 text-center text-slate-500 text-xs">{pa.ih_semanal ?? "—"}</td>
                      <td className="px-3 py-2 text-center text-slate-500 text-xs">{pa.ih_total ?? "—"}</td>
                      {canEdit && (
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-2.5">
                            <button onClick={() => setPrerequisitosDe(pa)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Prerrequisitos">
                              <Network className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setEditingAsig(pa)} className="text-slate-400 hover:text-[#C41717] transition-colors" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => quitarAsignatura(pa)} className="text-slate-400 hover:text-red-500 transition-colors" title="Quitar">
                              <X className="w-3.5 h-3.5" />
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
      )}

      {asignando && (
        <AsignarAsignaturaModal programaId={programa.id} yaAsignadasIds={asignaturas.map((a) => a.asignatura_id)}
          onClose={() => setAsignando(false)} onSaved={load} />
      )}
      {editandoPensum && <EditarPensumModal programa={programa} onClose={() => setEditandoPensum(false)} onSaved={onUpdated} />}
      {editingAsig && <EditarAsignaturaPensumModal item={editingAsig} onClose={() => setEditingAsig(null)} onSaved={load} />}
      {prerequisitosDe && (
        <PrerequisitosModal programaId={programa.id} item={prerequisitosDe}
          candidatas={asignaturas.filter((a) => a.asignatura_id !== prerequisitosDe.asignatura_id)}
          onClose={() => setPrerequisitosDe(null)} />
      )}
      <ConfirmModal
        open={eliminandoPensum}
        title="Eliminar pensum"
        message={`¿Eliminar el pensum "${programa.pensum_nombre || "PENSUM"}"? Se quitarán todas sus asignaturas y prerrequisitos. Esta acción no se puede deshacer.`}
        onConfirm={confirmEliminarPensum}
        onCancel={() => setEliminandoPensum(false)}
      />
    </div>
  );
}

/* ── Ficha del programa + su Pensum (reemplaza el viejo "Contenido del programa") ── */
function FichaYPensumTab({
  programa, canEdit, onBack, onUpdated,
}: { programa: Programa; canEdit: boolean; onBack: () => void; onUpdated: () => void }) {
  const [editingFicha, setEditingFicha] = useState(false);
  const [deletingPrograma, setDeletingPrograma] = useState(false);

  const confirmDeletePrograma = async () => {
    await apiFetch("/programas/delete.php", { method: "POST", json: { id: programa.id } });
    setDeletingPrograma(false);
    onBack();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Programa:</h3>
          {canEdit && (
            <div className="flex items-center gap-4">
              <button onClick={() => setEditingFicha(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
                <Pencil className="w-3.5 h-3.5" /> Editar
              </button>
              <button onClick={() => setDeletingPrograma(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500">
                <X className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{programa.nombre}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <InfoField label="Código" value={programa.codigo} />
          <InfoField label="N° Res. autorización" value={programa.num_resolucion} />
          <InfoField label="F. Res. autorización" value={programa.fecha_resolucion ? new Date(programa.fecha_resolucion).toLocaleDateString("es-CO") : null} />
          <InfoField label="Aplica para preinscripciones" value={programa.aplica_preinscripcion} />
          <InfoField label="Aplica para grupos" value={programa.aplica_grupos} />
          <InfoField label="Estado" value={programa.estado} />
          <InfoField label="Categoría" value={programa.categoria} />
        </div>
      </div>

      <PensumSection programa={programa} canEdit={canEdit} onUpdated={onUpdated} />

      <ProgramaFormModal target={editingFicha ? programa : null} onClose={() => setEditingFicha(false)} onSaved={onUpdated} />
      <ConfirmModal
        open={deletingPrograma}
        title="Eliminar programa"
        message={`¿Eliminar "${programa.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeletePrograma}
        onCancel={() => setDeletingPrograma(false)}
      />
    </div>
  );
}

/* ── Estudiantes matriculados en el programa — matrícula REAL (histórico
     importado de Q10, tabla `matriculas`), de solo lectura. Ya no hay
     "Matricular"/"Quitar" a mano: la matrícula académica real es la fuente
     de verdad, no una lista aparte que había que llenar desde cero. ───────── */
const ESTADO_MATRICULA_BADGE: Record<string, string> = {
  ACTIVO: "bg-emerald-50 border-emerald-200 text-emerald-700",
  INACTIVO: "bg-slate-100 border-slate-200 text-slate-500",
  CANCELADO: "bg-red-50 border-red-200 text-red-600",
  GRADUADO: "bg-blue-50 border-blue-200 text-blue-700",
};

function EstudiantesTab({ programaId }: { programaId: number }) {
  const [matriculados, setMatriculados] = useState<MatriculaReal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<{ matriculados: MatriculaReal[] }>(`/programa-matriculas/list.php?programaId=${programaId}`)
      .then((d) => setMatriculados(d.matriculados))
      .finally(() => setLoading(false));
  }, [programaId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Estudiantes ({matriculados.length})</h3>
        <p className="text-[11px] text-slate-400">Matrícula real — histórico importado, de solo lectura.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : matriculados.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">No hay estudiantes matriculados en este programa.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Estudiante</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Identificación</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Período</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Jornada</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Nivel</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matriculados.map((m, i) => (
                <tr key={`${m.estudiante_id}-${i}`} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs">{m.nombre_completo}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{m.identificacion}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{m.periodo ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{m.jornada ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{m.nivel ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${ESTADO_MATRICULA_BADGE[m.estado] ?? "bg-slate-100 border-slate-200 text-slate-500"}`}>
                      {m.estado}
                    </span>
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

/* ── Ajustes ──────────────────────────────────────────────────────────────── */
function AjustesTab({ programa, canEdit, onUpdated }: { programa: Programa; canEdit: boolean; onUpdated: () => void }) {
  const [descripcion, setDescripcion] = useState(programa.descripcion ?? "");
  const [publicado, setPublicado] = useState(!!programa.publicado);
  const [dias, setDias] = useState(programa.dias_disponibles != null ? String(programa.dias_disponibles) : "");
  const [certificadoId, setCertificadoId] = useState(programa.certificado_id != null ? String(programa.certificado_id) : "");
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch<{ certificados: Certificado[] }>("/certificados/list.php").then((d) => setCertificados(d.certificados)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!programa.imagen_path) { setImgUrl(null); return; }
    let objectUrl: string | null = null;
    let cancelled = false;
    apiImage(`/programas/imagen.php?id=${programa.id}`).then((u) => { if (!cancelled) { objectUrl = u; setImgUrl(u); } else URL.revokeObjectURL(u); }).catch(() => {});
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [programa.id, programa.imagen_path]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/programas/update.php", {
        method: "POST",
        json: {
          id: programa.id, nombre: programa.nombre, descripcion: descripcion || null,
          publicado, diasDisponibles: dias ? Number(dias) : null, certificadoId: certificadoId ? Number(certificadoId) : null,
        },
      });
      onUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("id", String(programa.id));
      form.append("file", file);
      await apiFetch("/programas/upload-imagen.php", { method: "POST", body: form });
      onUpdated();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value.slice(0, 500))} disabled={!canEdit} rows={4}
          className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
        <p className="text-[11px] text-slate-400 mt-1">Máximo 500 caracteres ({descripcion.length}/500)</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Imagen del programa</label>
        {imgUrl && <img src={imgUrl} alt="" className="w-full max-w-xs rounded-xl border border-slate-200 mb-2 object-cover aspect-video" />}
        {canEdit && (
          <>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313] disabled:opacity-60">
              <Upload className="w-3.5 h-3.5" /> {uploading ? "Subiendo..." : "Cambiar imagen"}
            </button>
          </>
        )}
      </div>
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm font-semibold text-slate-700">Publicado</p>
          <p className="text-[11px] text-slate-400">Los programas publicados quedan disponibles para los estudiantes matriculados.</p>
        </div>
        <button type="button" disabled={!canEdit} onClick={() => setPublicado((v) => !v)}
          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 disabled:opacity-60 ${publicado ? "bg-emerald-500" : "bg-slate-300"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${publicado ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Días disponibles</label>
        <input value={dias} onChange={(e) => setDias(e.target.value)} disabled={!canEdit} type="number" min={0}
          className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Diseño del certificado</label>
        <SearchableSelect
          value={certificadoId} onChange={setCertificadoId} disabled={!canEdit}
          options={certificados.map((c) => ({ value: String(c.id), label: c.nombre }))}
          placeholder="Sin certificado asignado"
        />
      </div>
      {canEdit ? (
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-sm font-semibold disabled:opacity-60 transition-colors">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400">Solo el Super Admin puede editar los ajustes del programa.</p>
      )}
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function ProgramaDetailView({
  programa, onBack, onUpdated,
}: { programa: Programa; onBack: () => void; onUpdated: () => void }) {
  const { currentUser } = useCampusAuth();
  const canEditSettings = currentUser?.role === "super_admin";
  const [tab, setTab] = useState<TabKey>("programa");

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] mb-3 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a programas
      </button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-3 leading-snug">{programa.nombre}</h2>
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
            {tab === "programa" && <FichaYPensumTab programa={programa} canEdit={canEditSettings} onBack={onBack} onUpdated={onUpdated} />}
            {tab === "estudiantes" && <EstudiantesTab programaId={programa.id} />}
            {tab === "ajustes" && <AjustesTab programa={programa} canEdit={canEditSettings} onUpdated={onUpdated} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
