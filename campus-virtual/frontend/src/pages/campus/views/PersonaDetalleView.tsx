import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, GraduationCap, BookOpen, Layers, KeyRound,
  CreditCard, Receipt, FileMinus, ClipboardCheck, Award, UserCog,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Persona {
  id: number; identificacion: string; nombre_completo: string;
  genero?: string | null; tipo_documento?: string | null; celular?: string | null; correo?: string | null;
  estado?: string | null;
}
interface CuentaAcceso { username: string; email: string; role: string; created_at: string }
interface Matricula { id: number; programa: string | null; periodo: string | null; nivel: string | null; estado: string | null; sede: string | null }
interface CursoLigero { id: number; nombre: string; categoria: string | null; progreso: number; estado_acceso: string; ultimo_acceso: string | null }
interface Curso { id: number; programa_asignatura_jornada: string | null; estado?: string | null }
interface AsignaturaDe { id: number; nombre: string; programa_nombre?: string }
interface ProgramaDe { id: number; nombre: string }
interface Credito {
  id: number; periodo: string | null; pagare: string | null; fecha_credito: string | null;
  valor_credito: number | null; anulado: string | null; paz_y_salvo: string | null;
}
interface PagoRealizado { id: number; fecha_pago: string | null; producto: string | null; valor_pagado: number | null; estado: string | null }
interface PagoPendiente { id: number; producto: string | null; periodo: string | null; valor_producto: number | null }
interface NotaCredito { id: number; numero: string | null; fecha: string | null; producto: string | null; valor_producto: number | null; estado: string | null }
interface Evaluacion { id: number; periodo: string | null; asignatura: string | null; parametro: string | null; nota: number | null; inasistencias: number | null }
interface NotaFinal { id: number; programa: string | null; periodo: string | null; asignatura: string | null; nota_asignatura: number | null; aprobado: string | null }

interface DetalleEstudiante {
  ok: true; tipo: "estudiante"; persona: Persona; cuentaAcceso: CuentaAcceso | null;
  matriculas: Matricula[]; cursosLigeros: CursoLigero[]; cursos: Curso[]; asignaturas: AsignaturaDe[];
  creditos: Credito[]; pagosRealizados: PagoRealizado[]; pagosPendientes: PagoPendiente[];
  notasCredito: NotaCredito[]; evaluaciones: Evaluacion[]; notasFinales: NotaFinal[];
}
interface DetalleDocente {
  ok: true; tipo: "docente"; persona: Persona; cuentaAcceso: CuentaAcceso | null;
  asignaturas: AsignaturaDe[]; programas: ProgramaDe[]; cursosLigeros: CursoLigero[]; cursos: Curso[];
}
type Detalle = DetalleEstudiante | DetalleDocente;

const money = (v: number | null) => v == null ? "—" : `$${Number(v).toLocaleString("es-CO")}`;
const fecha = (v: string | null) => v ? new Date(v).toLocaleDateString("es-CO") : "—";

function Seccion({ icon: Icon, titulo, count, children }: { icon: React.ElementType; titulo: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Icon className="w-4 h-4 text-[#C41717]" />
        <h3 className="text-sm font-bold text-slate-700">{titulo}</h3>
        <span className="text-slate-400 text-xs font-semibold">{count}</span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const th = "text-left px-3 py-2 text-slate-500 font-semibold text-[11px] uppercase whitespace-nowrap";
const td = "px-3 py-2 text-slate-700 text-xs whitespace-nowrap";

export default function PersonaDetalleView({
  tipo, id, onBack,
}: { tipo: "estudiante" | "docente"; id: number; onBack: () => void }) {
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch<Detalle>(`/personas/detalle.php?tipo=${tipo}&id=${id}`)
      .then(setDetalle)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, [tipo, id]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#C41717] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</div>
      ) : error ? (
        <p className="text-red-500 text-sm text-center py-12">{error}</p>
      ) : !detalle ? null : (
        <>
          {/* Encabezado */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#C41717]/15 border border-[#C41717]/30 flex items-center justify-center shrink-0">
              <span className="text-[#C41717] text-lg font-bold">{detalle.persona.nombre_completo.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-slate-900 font-bold text-lg truncate">{detalle.persona.nombre_completo}</h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {detalle.tipo === "estudiante" ? "Estudiante" : "Docente"} · CC {detalle.persona.identificacion}
                {detalle.persona.celular && ` · ${detalle.persona.celular}`}
                {detalle.persona.correo && ` · ${detalle.persona.correo}`}
              </p>
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              ${detalle.cuentaAcceso ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-slate-100 border border-slate-200 text-slate-400"}`}>
              <KeyRound className="w-3 h-3" /> {detalle.cuentaAcceso ? `Usuario: ${detalle.cuentaAcceso.username}` : "Sin cuenta de acceso"}
            </span>
          </div>

          {detalle.tipo === "estudiante" ? (
            <>
              <Seccion icon={GraduationCap} titulo="Matrículas / Programas" count={detalle.matriculas.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className={th}>Programa</th><th className={th}>Período</th><th className={th}>Nivel</th><th className={th}>Estado</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.matriculas.map((m) => (
                      <tr key={m.id}><td className={td}>{m.programa ?? "—"}</td><td className={td}>{m.periodo ?? "—"}</td><td className={td}>{m.nivel ?? "—"}</td><td className={td}>{m.estado ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={Layers} titulo="Asignaturas (de sus programas)" count={detalle.asignaturas.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Asignatura</th><th className={th}>Programa</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.asignaturas.map((a) => (
                      <tr key={a.id}><td className={td}>{a.nombre}</td><td className={td}>{a.programa_nombre ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={BookOpen} titulo="Cursos ligeros" count={detalle.cursosLigeros.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Curso</th><th className={th}>Categoría</th><th className={th}>Progreso</th><th className={th}>Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cursosLigeros.map((c) => (
                      <tr key={c.id}><td className={td}>{c.nombre}</td><td className={td}>{c.categoria ?? "—"}</td><td className={td}>{c.progreso}%</td><td className={td}>{c.estado_acceso}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={BookOpen} titulo="Cursos (histórico)" count={detalle.cursos.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Curso</th><th className={th}>Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cursos.map((c) => (
                      <tr key={c.id}><td className={td}>{c.programa_asignatura_jornada ?? "—"}</td><td className={td}>{c.estado ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={CreditCard} titulo="Créditos" count={detalle.creditos.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className={th}>Pagaré</th><th className={th}>Período</th><th className={th}>Fecha</th><th className={th}>Valor</th><th className={th}>Anulado</th><th className={th}>Paz y salvo</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.creditos.map((c) => (
                      <tr key={c.id}>
                        <td className={td}>{c.pagare ?? "—"}</td><td className={td}>{c.periodo ?? "—"}</td><td className={td}>{fecha(c.fecha_credito)}</td>
                        <td className={td}>{money(c.valor_credito)}</td><td className={td}>{c.anulado ?? "No"}</td><td className={td}>{c.paz_y_salvo ?? "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={Receipt} titulo="Pagos realizados" count={detalle.pagosRealizados.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Fecha</th><th className={th}>Producto</th><th className={th}>Valor</th><th className={th}>Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.pagosRealizados.map((p) => (
                      <tr key={p.id}><td className={td}>{fecha(p.fecha_pago)}</td><td className={td}>{p.producto ?? "—"}</td><td className={td}>{money(p.valor_pagado)}</td><td className={td}>{p.estado ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={Receipt} titulo="Pagos pendientes" count={detalle.pagosPendientes.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Producto</th><th className={th}>Período</th><th className={th}>Valor</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.pagosPendientes.map((p) => (
                      <tr key={p.id}><td className={td}>{p.producto ?? "—"}</td><td className={td}>{p.periodo ?? "—"}</td><td className={td}>{money(p.valor_producto)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={FileMinus} titulo="Notas de crédito" count={detalle.notasCredito.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Número</th><th className={th}>Fecha</th><th className={th}>Producto</th><th className={th}>Valor</th><th className={th}>Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.notasCredito.map((n) => (
                      <tr key={n.id}><td className={td}>{n.numero ?? "—"}</td><td className={td}>{fecha(n.fecha)}</td><td className={td}>{n.producto ?? "—"}</td><td className={td}>{money(n.valor_producto)}</td><td className={td}>{n.estado ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={ClipboardCheck} titulo="Evaluaciones" count={detalle.evaluaciones.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Período</th><th className={th}>Asignatura</th><th className={th}>Parámetro</th><th className={th}>Nota</th><th className={th}>Inasistencias</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.evaluaciones.map((e) => (
                      <tr key={e.id}><td className={td}>{e.periodo ?? "—"}</td><td className={td}>{e.asignatura ?? "—"}</td><td className={td}>{e.parametro ?? "—"}</td><td className={td}>{e.nota ?? "—"}</td><td className={td}>{e.inasistencias ?? "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={Award} titulo="Notas finales" count={detalle.notasFinales.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Programa</th><th className={th}>Período</th><th className={th}>Asignatura</th><th className={th}>Nota</th><th className={th}>Aprobado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.notasFinales.map((n) => (
                      <tr key={n.id}><td className={td}>{n.programa ?? "—"}</td><td className={td}>{n.periodo ?? "—"}</td><td className={td}>{n.asignatura ?? "—"}</td><td className={td}>{n.nota_asignatura ?? "—"}</td><td className={td}>{n.aprobado === "S" ? "Sí" : n.aprobado === "N" ? "No" : "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Seccion>

              {detalle.matriculas.length === 0 && detalle.asignaturas.length === 0 && detalle.cursosLigeros.length === 0 &&
               detalle.cursos.length === 0 && detalle.creditos.length === 0 && detalle.pagosRealizados.length === 0 &&
               detalle.pagosPendientes.length === 0 && detalle.notasCredito.length === 0 && detalle.evaluaciones.length === 0 &&
               detalle.notasFinales.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-12 bg-white rounded-2xl border border-slate-200">
                  Esta persona no tiene ningún otro dato registrado en el sistema todavía.
                </p>
              )}
            </>
          ) : (
            <>
              <Seccion icon={Layers} titulo="Asignaturas asignadas" count={detalle.asignaturas.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Asignatura</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.asignaturas.map((a) => (<tr key={a.id}><td className={td}>{a.nombre}</td></tr>))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={GraduationCap} titulo="Cursos asignados" count={detalle.programas.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Curso</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.programas.map((p) => (<tr key={p.id}><td className={td}>{p.nombre}</td></tr>))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={BookOpen} titulo="Cursos ligeros que dicta" count={detalle.cursosLigeros.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Curso</th><th className={th}>Categoría</th><th className={th}>Estado</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cursosLigeros.map((c) => (<tr key={c.id}><td className={td}>{c.nombre}</td><td className={td}>{c.categoria ?? "—"}</td><td className={td}>{c.estado_acceso}</td></tr>))}
                  </tbody>
                </table>
              </Seccion>

              <Seccion icon={UserCog} titulo="Cursos (histórico) que dictó" count={detalle.cursos.length}>
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-200"><th className={th}>Curso</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.cursos.map((c) => (<tr key={c.id}><td className={td}>{c.programa_asignatura_jornada ?? "—"}</td></tr>))}
                  </tbody>
                </table>
              </Seccion>

              {detalle.asignaturas.length === 0 && detalle.programas.length === 0 && detalle.cursosLigeros.length === 0 && detalle.cursos.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-12 bg-white rounded-2xl border border-slate-200">
                  Este docente no tiene ninguna asignatura ni curso asignado todavía.
                </p>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
