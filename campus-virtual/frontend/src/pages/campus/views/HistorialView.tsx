import { useEffect, useMemo, useState } from "react";
import {
  ScrollText, UserPlus, UserMinus, Pencil, KeyRound, Users,
  GraduationCap, UserCheck, Briefcase, LayoutDashboard, BookOpen,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Role } from "@/context/CampusAuthContext";

interface TraceEntry {
  id: number;
  user_id: string;
  user_name: string;
  user_role: Role;
  action: string;
  detail: string | null;
  created_at: string;
}

const ACTION_LABEL: Record<string, string> = {
  estudiante_update: "Editó estudiante", estudiante_delete: "Eliminó estudiante",
  docente_update: "Editó docente", docente_delete: "Eliminó docente",
  administrativo_update: "Editó administrativo", administrativo_delete: "Eliminó administrativo",
  codeudor_update: "Editó codeudor", codeudor_delete: "Eliminó codeudor",
  programa_update: "Editó programa", programa_delete: "Eliminó programa",
  asignatura_update: "Editó asignatura", asignatura_delete: "Eliminó asignatura",
  curso_update: "Editó curso", curso_delete: "Eliminó curso",
  user_update: "Editó usuario", password_reset: "Restableció contraseña",
  evaluacion_update: "Editó evaluación",
  aula_recurso_update: "Editó aula virtual", aula_recurso_delete: "Eliminó aula virtual",
  curso_ligero_update: "Editó curso ligero", curso_ligero_delete: "Eliminó curso ligero",
  plantilla_update: "Editó plantilla", plantilla_delete: "Eliminó plantilla",
  certificado_update: "Editó certificado", certificado_delete: "Eliminó certificado",
  perfil_create: "Creó perfil", perfil_update: "Editó perfil", perfil_delete: "Eliminó perfil",
  banco_pregunta_create: "Creó pregunta", banco_pregunta_update: "Editó pregunta", banco_pregunta_delete: "Eliminó pregunta",
  banco_etiqueta_create: "Creó etiqueta", banco_etiqueta_update: "Editó etiqueta", banco_etiqueta_delete: "Eliminó etiqueta",
  periodo_matricula_create: "Creó período de matrícula",
  backfill_cuentas_acceso: "Generó cuentas de acceso masivas",
};

const ACTION_ICON: Record<string, React.ElementType> = {
  estudiante_update: Pencil, estudiante_delete: UserMinus,
  docente_update: Pencil, docente_delete: UserMinus,
  administrativo_update: Pencil, administrativo_delete: UserMinus,
  codeudor_update: Pencil, codeudor_delete: UserMinus,
  programa_update: LayoutDashboard, programa_delete: LayoutDashboard,
  asignatura_update: BookOpen, asignatura_delete: BookOpen,
  curso_update: BookOpen, curso_delete: BookOpen,
  user_update: UserPlus, password_reset: KeyRound,
  evaluacion_update: Pencil,
  aula_recurso_update: Pencil, aula_recurso_delete: UserMinus,
  curso_ligero_update: Pencil, curso_ligero_delete: UserMinus,
  plantilla_update: Pencil, plantilla_delete: UserMinus,
  certificado_update: Pencil, certificado_delete: UserMinus,
  perfil_create: UserPlus, perfil_update: Pencil, perfil_delete: UserMinus,
  banco_pregunta_create: UserPlus, banco_pregunta_update: Pencil, banco_pregunta_delete: UserMinus,
  banco_etiqueta_create: UserPlus, banco_etiqueta_update: Pencil, banco_etiqueta_delete: UserMinus,
  periodo_matricula_create: UserPlus,
  backfill_cuentas_acceso: UserPlus,
};

const ACTION_ACCENT: Record<string, string> = {
  estudiante_update: "#d97706", estudiante_delete: "#dc2626",
  docente_update: "#d97706", docente_delete: "#dc2626",
  administrativo_update: "#d97706", administrativo_delete: "#dc2626",
  codeudor_update: "#d97706", codeudor_delete: "#dc2626",
  programa_update: "#0d9488", programa_delete: "#dc2626",
  asignatura_update: "#0d9488", asignatura_delete: "#dc2626",
  curso_update: "#0d9488", curso_delete: "#dc2626",
  user_update: "#9333ea", password_reset: "#be123c",
  evaluacion_update: "#d97706",
  aula_recurso_update: "#d97706", aula_recurso_delete: "#dc2626",
  curso_ligero_update: "#d97706", curso_ligero_delete: "#dc2626",
  plantilla_update: "#d97706", plantilla_delete: "#dc2626",
  certificado_update: "#d97706", certificado_delete: "#dc2626",
  perfil_create: "#059669", perfil_update: "#d97706", perfil_delete: "#dc2626",
  banco_pregunta_create: "#059669", banco_pregunta_update: "#d97706", banco_pregunta_delete: "#dc2626",
  banco_etiqueta_create: "#059669", banco_etiqueta_update: "#d97706", banco_etiqueta_delete: "#dc2626",
  periodo_matricula_create: "#059669",
  backfill_cuentas_acceso: "#059669",
};

const ROLE_ICON: Record<string, React.ElementType> = {
  super_admin: Users, admin: Users, docente: UserCheck, administrativo: Briefcase,
  estudiante: GraduationCap, equipo: Users,
};

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

export default function HistorialView() {
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<{ trace: TraceEntry[] }>("/audit/list.php")
      .then((data) => setTrace(data.trace))
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el historial."))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, TraceEntry[]>();
    for (const t of trace) {
      const key = formatFecha(t.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries());
  }, [trace]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center">
          <ScrollText className="w-4 h-4 text-[#C41717]" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Historial</h1>
          <p className="text-slate-500 text-xs">Quién editó o eliminó qué, y cuándo — solo Super Admin.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="p-5">
          {loading ? (
            <p className="text-slate-400 text-sm text-center py-12">Cargando...</p>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : trace.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Aún no hay movimientos registrados.</p>
          ) : (
            <div className="space-y-6">
              {groups.map(([fecha, entries]) => (
                <div key={fecha}>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">{fecha}</p>
                  <div className="space-y-1.5">
                    {entries.map((t) => {
                      const Icon = ACTION_ICON[t.action] ?? ScrollText;
                      const accent = ACTION_ACCENT[t.action] ?? "#94a3b8";
                      const RoleIcon = ROLE_ICON[t.user_role] ?? Users;
                      return (
                        <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accent}15`, color: accent }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-800">
                              <span className="font-medium">{t.user_name}</span>{" "}
                              <span style={{ color: accent }} className="font-medium">{ACTION_LABEL[t.action] ?? t.action}</span>
                            </p>
                            {t.detail && <p className="text-xs text-slate-500 truncate">{t.detail}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] shrink-0">
                            <RoleIcon className="w-3 h-3" />
                            {formatHora(t.created_at)}
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
