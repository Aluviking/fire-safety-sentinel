import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Trash2, Users as UsersIcon } from "lucide-react";
import { useCampusAuth, type Role } from "@/context/CampusAuthContext";

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
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNombre(""); setEmail(""); setUsername(""); setPassword(""); setRole("estudiante"); setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !email.includes("@") || username.length < 4 || password.length < 6) {
      setError("Revisa los datos: usuario mín. 4 caracteres, contraseña mín. 6.");
      return;
    }
    setSubmitting(true);
    const res = await createUser({ nombre, email, username, password, role });
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

/* ══ Vista principal ═════════════════════════════════════════════════════════ */
export default function UsuariosView() {
  const { currentUser, users, changeRole, deleteUser } = useCampusAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    const res = await deleteUser(id);
    if (!res.ok) window.alert(res.error ?? "Error al eliminar el usuario.");
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
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C41717] via-[#E02020] to-[#C41717]/40" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Todos los usuarios</h2>
          <span className="text-xs font-bold text-slate-500">{users.length}</span>
        </div>

        <div className="p-5">
          <CreateUserForm isSuperAdmin={isSuperAdmin} />

          <div className="divide-y divide-slate-100 mt-4">
            {users.map((u) => {
              const targetIsAdminTier = u.role === "admin" || u.role === "super_admin";
              const locked = targetIsAdminTier && !isSuperAdmin;
              return (
                <div key={u.id} className="py-3.5 flex items-center gap-3.5">
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
                  {u.id !== currentUser?.id && !locked && (
                    <button
                      onClick={() => handleDelete(u.id, u.nombre)}
                      className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Aún no hay usuarios creados.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
