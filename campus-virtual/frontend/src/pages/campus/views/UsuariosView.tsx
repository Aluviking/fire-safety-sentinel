import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Trash2, Users as UsersIcon, Pencil, KeyRound, Check, X as XIcon, Search, RefreshCw, Eye, Link2 } from "lucide-react";
import { useCampusAuth, type Role } from "@/context/CampusAuthContext";
import { apiFetch } from "@/lib/api";
import { ResetPasswordModal } from "../ResetPasswordModal";
import { ConfirmModal } from "../ConfirmModal";
import { SearchableSelect } from "../SearchableSelect";

interface Perfil { id: number; nombre: string }

const INPUT_CLASS = "w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "estudiante",     label: "Estudiante" },
  { value: "docente",        label: "Docente" },
  { value: "administrativo", label: "Administrativo" },
  { value: "equipo",         label: "Coordinador" },
  { value: "admin",          label: "Admin" },
  { value: "super_admin",    label: "Super Admin" },
];

/* ─── Formulario de creación ──────────────────────────────────────────────── */
function CreateUserForm({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { createUser } = useCampusAuth();
  const [open, setOpen]         = useState(false);
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<Role>("estudiante");
  const [identificacion, setIdentificacion] = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNombre(""); setEmail(""); setUsername(""); setPassword(""); setRole("estudiante"); setIdentificacion(""); setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !email.includes("@") || username.length < 4 || password.length < 6) {
      setError("Revisa los datos: usuario mín. 4 caracteres, contraseña mín. 6.");
      return;
    }
    if ((role === "estudiante" || role === "docente") && !identificacion.trim()) {
      setError("La identificación es requerida para este rol — con eso se conecta a su ficha real.");
      return;
    }
    setSubmitting(true);
    const res = await createUser({ nombre, email, username, password, role, identificacion: identificacion.trim() || undefined });
    setSubmitting(false);
    if (!res.ok) { setError(res.error ?? "Error."); return; }
    reset();
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold
                   text-[#C41717] hover:bg-[#C41717]/5 rounded-xl border border-dashed border-[#C41717]/30 transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" /> Crear usuario nuevo
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <input
        value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo"
        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                   focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
      />
      <input
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" type="email"
        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                   focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
      />
      <div className="flex gap-2">
        <input
          value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario"
          className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
        />
        <input
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
          className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
        />
      </div>
      <select
        value={role} onChange={(e) => setRole(e.target.value as Role)}
        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                   cursor-pointer focus:outline-none"
      >
        {ROLE_OPTIONS.filter((r) => isSuperAdmin || (r.value !== "admin" && r.value !== "super_admin")).map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
      {(role === "estudiante" || role === "docente") && (
        <input
          value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} placeholder={`Identificación del ${role === "estudiante" ? "estudiante" : "docente"}`}
          className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
        />
      )}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-1.5
                     disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Creando..." : "Crear"}
        </button>
        <button
          type="button" onClick={() => { setOpen(false); reset(); }}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ─── Vincular esta cuenta con otra ("misma persona") ────────────────────── */
function VincularCuentaModal({
  user, todosLosUsuarios, onClose, onSaved,
}: { user: { id: string; nombre: string }; todosLosUsuarios: { id: string; nombre: string; role: Role }[]; onClose: () => void; onSaved: () => void }) {
  const [otroUserId, setOtroUserId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const opciones = todosLosUsuarios.filter((u) => u.id !== user.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otroUserId) { setError("Selecciona la otra cuenta."); return; }
    setSubmitting(true);
    try {
      await apiFetch("/usuarios/vincular.php", { method: "POST", json: { userIdA: user.id, userIdB: otroUserId } });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al vincular.");
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
          <p className="text-slate-800 font-bold text-[15px]">Vincular cuenta de {user.nombre}</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500">
            Elige la otra cuenta que pertenece a la misma persona. Después, cualquiera de las dos va a poder saltar directo a la otra desde su propio panel, sin volver a pedir clave.
          </p>
          <SearchableSelect
            value={otroUserId} onChange={setOtroUserId}
            options={opciones.map((u) => ({ value: u.id, label: `${u.nombre} (${u.role})` }))}
            placeholder="Seleccione la otra cuenta..."
          />
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={submitting}
              className="flex-1 text-xs font-semibold bg-[#C41717] hover:bg-[#B01313] text-white rounded-lg py-2 disabled:opacity-60 transition-colors">
              {submitting ? "Vinculando..." : "Vincular"}
            </button>
            <button type="button" onClick={onClose} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function UsuariosView() {
  const { currentUser, users, changeRole, deleteUser, updateUser, resetPassword, assignPerfil, logout, verComo } = useCampusAuth();
  const navigate = useNavigate();
  const isSuperAdmin = currentUser?.role === "super_admin";
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    apiFetch<{ perfiles: Perfil[] }>("/perfiles/list.php").then((d) => setPerfiles(d.perfiles)).catch(() => {});
  }, [isSuperAdmin]);

  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();
  const usuariosFiltrados = q
    ? users.filter((u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.identificacion ?? "").toLowerCase().includes(q)
      )
    : users;

  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSync, setResultadoSync] = useState<{ actualizados: number; creadas: number; omitidos: number } | null>(null);

  // No te puedes seleccionar/eliminar a ti mismo — mismo límite que ya tenía
  // el botón de eliminar individual.
  const seleccionables = usuariosFiltrados.filter((u) => u.id !== currentUser?.id);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const todosSeleccionados = seleccionables.length > 0 && seleccionables.every((u) => seleccionados.has(u.id));
  const [eliminandoSeleccionados, setEliminandoSeleccionados] = useState(false);
  const [borrandoSeleccionados, setBorrandoSeleccionados] = useState(false);

  const toggleSeleccionado = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSeleccionarTodos = () => {
    setSeleccionados((prev) => {
      if (todosSeleccionados) {
        const next = new Set(prev);
        seleccionables.forEach((u) => next.delete(u.id));
        return next;
      }
      const next = new Set(prev);
      seleccionables.forEach((u) => next.add(u.id));
      return next;
    });
  };

  const confirmEliminarSeleccionados = async () => {
    const ids = seleccionados.size > 0 ? Array.from(seleccionados) : seleccionables.map((u) => u.id);
    setBorrandoSeleccionados(true);
    try {
      const resultados = await Promise.all(ids.map((id) => deleteUser(id)));
      const fallidos = resultados.filter((r) => !r.ok).length;
      setSeleccionados(new Set());
      setEliminandoSeleccionados(false);
      if (fallidos > 0) window.alert(`${fallidos} usuario(s) no se pudieron eliminar.`);
    } finally {
      setBorrandoSeleccionados(false);
    }
  };

  const sincronizarClaves = async () => {
    if (!window.confirm("Esto restablece el usuario y la clave de TODOS los estudiantes para que vuelvan a ser su número de identificación, sin importar lo que tuvieran antes. Cierra sus sesiones activas. ¿Continuar?")) return;
    setSincronizando(true);
    setResultadoSync(null);
    try {
      const r = await apiFetch<{ actualizados: number; creadas: number; omitidos: number }>("/usuarios/resetear-claves-estudiantes.php", { method: "POST" });
      setResultadoSync(r);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al sincronizar.");
    } finally {
      setSincronizando(false);
    }
  };

  const [resettingUser, setResettingUser] = useState<{ id: string; nombre: string } | null>(null);
  const [vinculandoUser, setVinculandoUser] = useState<{ id: string; nombre: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editIdentificacion, setEditIdentificacion] = useState("");
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const res = await deleteUser(id);
    if (!res.ok) window.alert(res.error ?? "Error al eliminar el usuario.");
  };

  const [verComoLoading, setVerComoLoading] = useState<string | null>(null);
  const handleVerComo = async (id: string) => {
    setVerComoLoading(id);
    try {
      const res = await verComo(id);
      if (!res.ok) { window.alert(res.error ?? "Error al entrar a esa cuenta."); return; }
      navigate(res.role === "estudiante" ? "/estudiante" : "/dashboard", { replace: true });
    } finally {
      setVerComoLoading(null);
    }
  };

  const startEdit = (u: { id: string; nombre: string; email: string; username: string; identificacion?: string | null }) => {
    setEditingId(u.id);
    setEditNombre(u.nombre);
    setEditEmail(u.email);
    setEditUsername(u.username);
    setEditIdentificacion(u.identificacion ?? "");
    setEditError("");
  };

  const cancelEdit = () => setEditingId(null);

  const submitEdit = async (e: React.FormEvent, userId: string, role: Role) => {
    e.preventDefault();
    if (!editNombre.trim() || !editEmail.includes("@") || editUsername.length < 4) {
      setEditError("Revisa los datos: correo válido y usuario mín. 4 caracteres.");
      return;
    }
    if ((role === "estudiante" || role === "docente") && !editIdentificacion.trim()) {
      setEditError("La identificación es requerida para este rol.");
      return;
    }
    setEditSubmitting(true);
    const res = await updateUser(userId, {
      nombre: editNombre.trim(), email: editEmail.trim(), username: editUsername.trim(),
      identificacion: editIdentificacion.trim() || undefined,
    });
    setEditSubmitting(false);
    if (!res.ok) { setEditError(res.error ?? "Error."); return; }
    setEditingId(null);
  };

  const confirmResetPassword = async (newPassword: string) => {
    if (!resettingUser) return;
    const res = await resetPassword(resettingUser.id, newPassword);
    if (!res.ok) { window.alert(res.error ?? "Error al restablecer la contraseña."); return; }
    // El servidor cierra todas las sesiones activas del usuario al cambiar su
    // contraseña. Si el Super Admin se restableció su propia clave, su sesión
    // actual también quedó invalidada — hay que sacarlo limpiamente.
    if (resettingUser.id === currentUser?.id) {
      window.alert("Tu contraseña fue actualizada. Debes iniciar sesión de nuevo.");
      await logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[#C41717]/8 border border-[#C41717]/20 flex items-center justify-center">
          <UsersIcon className="w-4 h-4 text-[#C41717]" />
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg">Usuarios</h1>
          <p className="text-slate-500 text-xs">Crea cuentas y asigna roles del equipo de GFO Academy.</p>
        </div>
        {isSuperAdmin && (
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              onClick={sincronizarClaves} disabled={sincronizando}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#C41717] disabled:opacity-60 transition-colors"
              title="Restablece usuario y clave de todos los estudiantes a su identificación"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? "animate-spin" : ""}`} />
              {sincronizando ? "Sincronizando..." : "Sincronizar claves de estudiantes"}
            </button>
            {resultadoSync && (
              <p className="text-[11px] text-emerald-600 font-medium">
                {resultadoSync.actualizados} actualizado(s), {resultadoSync.creadas} creado(s){resultadoSync.omitidos > 0 && `, ${resultadoSync.omitidos} omitido(s)`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Todos los usuarios</h2>
          <span className="text-xs font-bold text-slate-500">
            {q ? `${usuariosFiltrados.length} de ${users.length}` : users.length}
          </span>
        </div>

        <div className="p-5">
          <CreateUserForm isSuperAdmin={isSuperAdmin} />

          <div className="flex items-center justify-between flex-wrap gap-2 mt-4">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, usuario, correo o identificación..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2
                           focus:outline-none focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
              />
            </div>
            {isSuperAdmin && seleccionables.length > 0 && (
              <button onClick={() => setEliminandoSeleccionados(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
                {seleccionados.size > 0 ? `Eliminar seleccionados (${seleccionados.size})` : `Eliminar todos (${seleccionables.length})`}
              </button>
            )}
          </div>

          {isSuperAdmin && seleccionables.length > 0 && (
            <label className="flex items-center gap-2 mt-3 text-xs text-slate-500 cursor-pointer w-fit">
              <input type="checkbox" checked={todosSeleccionados} onChange={toggleSeleccionarTodos} className="accent-[#C41717]" />
              Seleccionar todos
            </label>
          )}

          <div className="divide-y divide-slate-100 mt-3">
            {usuariosFiltrados.map((u) => {
              const targetIsAdminTier = u.role === "admin" || u.role === "super_admin";
              const locked = targetIsAdminTier && !isSuperAdmin;
              const isEditing = editingId === u.id;
              return (
                <div key={u.id} className="py-3.5">
                  {isEditing ? (
                    <form onSubmit={(e) => submitEdit(e, u.id, u.role)} className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#C41717]/15 border border-[#C41717]/30
                                      flex items-center justify-center shrink-0">
                        <span className="text-[#C41717] text-sm font-bold">{u.nombre.charAt(0)}</span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} placeholder="Nombre completo" className={INPUT_CLASS} />
                        <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Correo" type="email" className={INPUT_CLASS} />
                        <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} placeholder="Usuario" className={INPUT_CLASS} />
                        {(u.role === "estudiante" || u.role === "docente") && (
                          <input value={editIdentificacion} onChange={(e) => setEditIdentificacion(e.target.value)} placeholder={`Identificación del ${u.role === "estudiante" ? "estudiante" : "docente"}`} className={INPUT_CLASS} />
                        )}
                        {editError && <p className="text-[11px] text-red-500">{editError}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          type="submit" disabled={editSubmitting} title="Guardar cambios"
                          className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                                     flex items-center justify-center transition-colors disabled:opacity-60"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button" onClick={cancelEdit} title="Cancelar"
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200
                                     flex items-center justify-center transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                  <div className="flex items-center gap-3.5">
                    {isSuperAdmin && u.id !== currentUser?.id && (
                      <input type="checkbox" checked={seleccionados.has(u.id)} onChange={() => toggleSeleccionado(u.id)} className="accent-[#C41717] shrink-0" />
                    )}
                    <div className="w-10 h-10 rounded-full bg-[#C41717]/15 border border-[#C41717]/30
                                    flex items-center justify-center shrink-0">
                      <span className="text-[#C41717] text-sm font-bold">{u.nombre.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                    <select
                      value={u.role}
                      disabled={locked}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                                 text-slate-700 cursor-pointer focus:outline-none shrink-0
                                 disabled:opacity-60 disabled:cursor-not-allowed
                                 focus:border-[#C41717]/50 focus:ring-2 focus:ring-[#C41717]/10"
                    >
                      {ROLE_OPTIONS.filter((r) => isSuperAdmin || (r.value !== "admin" && r.value !== "super_admin") || r.value === u.role).map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    {isSuperAdmin && u.role !== "super_admin" && (
                      <SearchableSelect
                        value={u.perfilId != null ? String(u.perfilId) : ""}
                        onChange={(v) => assignPerfil(u.id, v ? Number(v) : null)}
                        options={perfiles.map((p) => ({ value: String(p.id), label: p.nombre }))}
                        placeholder="Sin perfil (permisos automáticos del rol)"
                        className="shrink-0 w-48"
                      />
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => setVinculandoUser({ id: u.id, nombre: u.nombre })}
                        className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                        title={`Vincular la cuenta de ${u.nombre} con otra (misma persona)`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSuperAdmin && u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleVerComo(u.id)}
                        disabled={verComoLoading === u.id}
                        className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                        title={`Ver como ${u.nombre}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => startEdit(u)}
                        className="shrink-0 text-slate-400 hover:text-[#C41717] transition-colors"
                        title="Editar datos"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => setResettingUser({ id: u.id, nombre: u.nombre })}
                        className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Restablecer contraseña"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSuperAdmin && u.id !== currentUser?.id && !locked && (
                      <button
                        onClick={() => handleDelete(u.id, u.nombre)}
                        className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  )}
                </div>
              );
            })}
            {users.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Aún no hay usuarios creados.</p>
            ) : usuariosFiltrados.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sin resultados para "{busqueda}".</p>
            ) : null}
          </div>
        </div>
      </div>

      <ResetPasswordModal
        user={resettingUser}
        onConfirm={confirmResetPassword}
        onCancel={() => setResettingUser(null)}
      />
      {vinculandoUser && (
        <VincularCuentaModal
          user={vinculandoUser}
          todosLosUsuarios={users}
          onClose={() => setVinculandoUser(null)}
          onSaved={() => window.alert("Cuentas vinculadas. Ya se pueden cambiar entre sí sin pedir clave.")}
        />
      )}
      <ConfirmModal
        open={eliminandoSeleccionados}
        title={seleccionados.size > 0 ? "Eliminar usuarios seleccionados" : "Eliminar todos los usuarios"}
        message={
          seleccionados.size > 0
            ? `¿Eliminar los ${seleccionados.size} usuario(s) seleccionado(s)? Esta acción no se puede deshacer.`
            : busqueda
              ? `¿Eliminar los ${seleccionables.length} usuario(s) que coinciden con "${busqueda}"? Esta acción no se puede deshacer.`
              : `¿Eliminar los ${seleccionables.length} usuario(s)? Esta acción no se puede deshacer.`
        }
        confirmLabel={borrandoSeleccionados ? "Eliminando..." : "Eliminar"}
        onConfirm={confirmEliminarSeleccionados}
        onCancel={() => setEliminandoSeleccionados(false)}
      />
    </motion.div>
  );
}
