import { useState, useEffect, useRef } from "react";
import { Building2, Plus, Loader2, X, ArrowLeft, Users as UsersIcon, Upload, Download, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { apiFetch } from "@/lib/api";
import { useCampusAuth } from "@/context/CampusAuthContext";
import { SearchableSelect } from "../SearchableSelect";
import { ConfirmModal } from "../ConfirmModal";
import { TIPOS_ID } from "@/data/academicCatalog";

interface Empresa {
  id: number; programa_id: number; nit: string; razon_social: string;
  correo: string | null; celular: string | null; cantidad_empleados: number | null;
  empleados_cargados: number; created_at: string;
}
interface Empleado {
  id: number; empresa_id: number; nombres: string; apellidos: string;
  tipo_documento: string | null; identificacion: string; celular: string | null; correo: string | null;
}

const inputCls = "w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const PLANTILLA_HEADERS = ["Nombres", "Apellidos", "Tipo de identificación", "Número de identificación", "Celular", "Correo"];

function descargarPlantilla() {
  const ws = XLSX.utils.aoa_to_sheet([
    PLANTILLA_HEADERS,
    ["Juan", "Pérez", "Cédula de Ciudadanía", "1020304050", "3001234567", "juan@correo.com"],
  ]);
  ws["!cols"] = PLANTILLA_HEADERS.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Empleados");
  XLSX.writeFile(wb, "plantilla-empleados.xlsx");
}

/* ── Crear empresa ─────────────────────────────────────────────────────── */
function CrearEmpresaModal({ programaId, onClose, onSaved }: { programaId: number; onClose: () => void; onSaved: () => void }) {
  const [nit, setNit] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [correo, setCorreo] = useState("");
  const [celular, setCelular] = useState("");
  const [cantidadEmpleados, setCantidadEmpleados] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nit.trim() || !razonSocial.trim()) { setError("NIT y razón social son obligatorios."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/curso-empresas/create.php", {
        method: "POST",
        json: {
          programaId, nit: nit.trim(), razonSocial: razonSocial.trim(),
          correo: correo.trim() || null, celular: celular.trim() || null,
          cantidadEmpleados: cantidadEmpleados ? Number(cantidadEmpleados) : null,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la empresa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Crear empresa</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={nit} onChange={(e) => setNit(e.target.value)} placeholder="NIT *" className={inputCls} />
            <input value={cantidadEmpleados} onChange={(e) => setCantidadEmpleados(e.target.value)} type="number" min={0} placeholder="Cantidad de empleados" className={inputCls} />
          </div>
          <input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Razón social *" className={inputCls} />
          <div className="grid grid-cols-2 gap-2">
            <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Celular / Teléfono" className={inputCls} />
            <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="Correo" className={inputCls} />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Creando..." : "Crear"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Agregar un empleado manualmente ───────────────────────────────────── */
function AgregarEmpleadoModal({ empresaId, onClose, onSaved }: { empresaId: number; onClose: () => void; onSaved: () => void }) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombres.trim() || !apellidos.trim() || !identificacion.trim()) {
      setError("Nombres, apellidos e identificación son obligatorios."); return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/curso-empresa-empleados/create.php", {
        method: "POST",
        json: {
          empresaId, nombres: nombres.trim(), apellidos: apellidos.trim(),
          tipoDocumento: tipoDocumento || null, identificacion: identificacion.trim(),
          celular: celular.trim() || null, correo: correo.trim() || null,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Agregar información</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Nombres *" className={inputCls} />
            <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Apellidos *" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SearchableSelect value={tipoDocumento} onChange={setTipoDocumento}
              options={TIPOS_ID.map((t) => ({ value: t, label: t }))} placeholder="Tipo de identificación" />
            <input value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} placeholder="Número de identificación *" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="Celular" className={inputCls} />
            <input value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" placeholder="Correo" className={inputCls} />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Guardando..." : "Agregar"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FilaImportada {
  nombres: string; apellidos: string; tipoDocumento: string; identificacion: string; celular: string; correo: string;
}

/* ── Importar empleados desde Excel — se lee en el navegador (sin librería
     nueva en el backend PHP) y se manda ya limpio al servidor. Los
     encabezados de la plantilla ("Nombres", "Apellidos", "Tipo de
     identificación", "Número de identificación", "Celular", "Correo") son
     el contrato entre la plantilla que se descarga y lo que este lector
     acepta — se normalizan (minúsculas, sin tildes) para no depender de que
     el usuario los deje exactamente iguales. ────────────────────────────── */
function ImportarEmpleadosModal({ empresaId, onClose, onSaved }: { empresaId: number; onClose: () => void; onSaved: () => void }) {
  const [filas, setFilas] = useState<FilaImportada[] | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [error, setError] = useState("");
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<{ insertados: number; yaCargados: number; omitidos: number; matriculados: number; cuentasCreadas: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  const handleFile = (file: File) => {
    setError("");
    setResultado(null);
    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        const parsed: FilaImportada[] = rows
          .map((row) => {
            const byKey: Record<string, string> = {};
            for (const key of Object.keys(row)) byKey[norm(key)] = String(row[key] ?? "").trim();
            return {
              nombres: byKey["nombres"] ?? "",
              apellidos: byKey["apellidos"] ?? "",
              tipoDocumento: byKey["tipo de identificacion"] ?? "",
              identificacion: byKey["numero de identificacion"] ?? "",
              celular: byKey["celular"] ?? "",
              correo: byKey["correo"] ?? "",
            };
          })
          .filter((f) => f.nombres || f.apellidos || f.identificacion);

        if (parsed.length === 0) {
          setError("No se encontraron filas con datos. Verifica que uses la plantilla.");
          setFilas(null);
          return;
        }
        setFilas(parsed);
      } catch {
        setError("No se pudo leer el archivo. Verifica que sea un Excel (.xlsx) válido.");
        setFilas(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmarImport = async () => {
    if (!filas) return;
    setImportando(true);
    setError("");
    try {
      const r = await apiFetch<{ insertados: number; yaCargados: number; omitidos: number; matriculados: number; cuentasCreadas: number }>("/curso-empresa-empleados/import.php", {
        method: "POST",
        json: { empresaId, empleados: filas },
      });
      setResultado(r);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar.");
    } finally {
      setImportando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-slate-800 font-bold text-[15px]">Importar datos</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {resultado ? (
            <div className="text-center py-4">
              <p className="text-slate-800 font-semibold text-sm">Importación completada</p>
              <p className="text-slate-500 text-xs mt-1">
                {resultado.insertados} empleado(s) nuevo(s) agregado(s)
                {resultado.yaCargados > 0 && ` (${resultado.yaCargados} ya estaban cargados, no se duplicaron)`}, {resultado.matriculados} matriculado(s) en el curso y {resultado.cuentasCreadas} cuenta(s) de estudiante nueva(s) (usuario y clave: su número de identificación)
                {resultado.omitidos > 0 && `. ${resultado.omitidos} fila(s) omitida(s) por datos incompletos`}.
              </p>
              <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-[#C41717] hover:bg-[#B01313] text-white text-xs font-semibold">Cerrar</button>
            </div>
          ) : (
            <>
              <button type="button" onClick={descargarPlantilla}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
                <Download className="w-3.5 h-3.5" /> Descargar plantilla de ejemplo
              </button>
              <p className="text-[11px] text-slate-400">
                Columnas: Nombres, Apellidos, Tipo de identificación, Número de identificación, Celular, Correo.
              </p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#C41717]/40 text-slate-500 hover:text-[#C41717] text-xs font-semibold transition-colors">
                <Upload className="w-4 h-4" /> {nombreArchivo || "Seleccionar archivo Excel..."}
              </button>
              {error && <p className="text-[11px] text-red-500">{error}</p>}
              {filas && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <p className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    {filas.length} fila(s) detectada(s)
                  </p>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                    {filas.slice(0, 8).map((f, i) => (
                      <p key={i} className="px-3 py-1.5 text-xs text-slate-600 truncate">{f.nombres} {f.apellidos} — {f.identificacion}</p>
                    ))}
                    {filas.length > 8 && <p className="px-3 py-1.5 text-[11px] text-slate-400">y {filas.length - 8} más...</p>}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={confirmarImport} disabled={!filas || importando}
                  className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
                  {importando ? "Importando..." : "Confirmar importación"}
                </button>
                <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Detalle de una empresa: sus empleados ─────────────────────────────── */
function EmpresaDetalle({ empresa, onBack, canManage }: { empresa: Empresa; onBack: () => void; canManage: boolean }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [deleting, setDeleting] = useState<Empleado | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ empleados: Empleado[] }>(`/curso-empresa-empleados/list.php?empresaId=${empresa.id}`)
      .then((d) => setEmpleados(d.empleados)).finally(() => setLoading(false));
  };
  useEffect(load, [empresa.id]);

  const confirmDelete = async () => {
    if (!deleting) return;
    await apiFetch("/curso-empresa-empleados/delete.php", { method: "POST", json: { id: deleting.id } });
    setDeleting(null);
    load();
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a empresas
      </button>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{empresa.razon_social}</h3>
          <p className="text-xs text-slate-400">NIT {empresa.nit} · {empleados.length} empleado(s)</p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button onClick={() => setAgregando(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
              <Plus className="w-3.5 h-3.5" /> Agregar información
            </button>
            <button onClick={() => setImportando(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#C41717]">
              <Upload className="w-3.5 h-3.5" /> Importar datos
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : empleados.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">Esta empresa aún no tiene empleados cargados.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Nombres</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Apellidos</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Tipo doc.</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Identificación</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Celular</th>
                <th className="text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Correo</th>
                {canManage && <th className="text-right px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empleados.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs">{e.nombres}</td>
                  <td className="px-3 py-2 text-slate-800 font-medium text-xs">{e.apellidos}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{e.tipo_documento ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{e.identificacion}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs">{e.celular ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500 text-xs truncate max-w-[160px]">{e.correo ?? "—"}</td>
                  {canManage && (
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end">
                        <button onClick={() => setDeleting(e)} className="text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
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

      {agregando && <AgregarEmpleadoModal empresaId={empresa.id} onClose={() => setAgregando(false)} onSaved={load} />}
      {importando && <ImportarEmpleadosModal empresaId={empresa.id} onClose={() => setImportando(false)} onSaved={load} />}
      <ConfirmModal
        open={!!deleting}
        title="Eliminar empleado"
        message={`¿Eliminar a "${deleting?.nombres} ${deleting?.apellidos}" de esta empresa? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/* ══ Pestaña "Cursos para empresas" ══════════════════════════════════════ */
export default function CursoEmpresasTab({ programaId }: { programaId: number }) {
  const { currentUser } = useCampusAuth();
  const canManage = currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [deleting, setDeleting] = useState<Empresa | null>(null);
  const [seleccionada, setSeleccionada] = useState<Empresa | null>(null);

  const load = () => {
    setLoading(true);
    apiFetch<{ empresas: Empresa[] }>(`/curso-empresas/list.php?programaId=${programaId}`)
      .then((d) => setEmpresas(d.empresas)).finally(() => setLoading(false));
  };
  useEffect(load, [programaId]);

  const confirmDelete = async () => {
    if (!deleting) return;
    await apiFetch("/curso-empresas/delete.php", { method: "POST", json: { id: deleting.id } });
    setDeleting(null);
    load();
  };

  if (seleccionada) {
    return <EmpresaDetalle empresa={seleccionada} onBack={() => { setSeleccionada(null); load(); }} canManage={canManage} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Cursos para empresas ({empresas.length})</h3>
        {canManage && (
          <button onClick={() => setCreando(true)} className="flex items-center gap-1.5 text-xs font-semibold text-[#C41717] hover:text-[#B01313]">
            <Plus className="w-3.5 h-3.5" /> Crear empresa
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : empresas.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8 border border-slate-200 rounded-xl">
          Aún no has creado ninguna empresa para este curso.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {empresas.map((e) => (
            <div key={e.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#C41717]/30 hover:shadow-sm transition-all cursor-pointer group relative"
              onClick={() => setSeleccionada(e)}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C41717]/8 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#C41717]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{e.razon_social}</p>
                  <p className="text-xs text-slate-400">NIT {e.nit}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> {e.empleados_cargados} empleado(s) cargado(s)
                  </p>
                </div>
              </div>
              {canManage && (
                <button
                  onClick={(ev) => { ev.stopPropagation(); setDeleting(e); }}
                  className="absolute top-3 right-3 text-slate-300 group-hover:text-red-500 transition-colors"
                  title="Eliminar empresa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {creando && <CrearEmpresaModal programaId={programaId} onClose={() => setCreando(false)} onSaved={load} />}
      <ConfirmModal
        open={!!deleting}
        title="Eliminar empresa"
        message={`¿Eliminar "${deleting?.razon_social}"? Se eliminarán también todos sus empleados cargados. Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
