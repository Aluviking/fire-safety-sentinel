import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/context/AuthContext";
import { ConfirmModal } from "./ConfirmModal";
import { PortalTopNav, PORTAL_NAV_ITEMS } from "./PortalTopNav";
import { UserAvatar } from "./UserAvatar";

/* ─── Formulario de creación ──────────────────────────────────────────────── */
function CreateUserForm({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { createUser, companies } = useAuth();
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("cliente");
  const [empresaId, setEmpresaId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNombre(""); setEmail(""); setUsername(""); setPassword("");
    setRole("cliente"); setEmpresaId(""); setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nombre.trim() || !email.includes("@") || username.length < 4 || password.length < 6) {
      setError("Revisa los datos: usuario mín. 4 caracteres, contraseña mín. 6.");
      return;
    }
    setSubmitting(true);
    const res = await createUser({
      nombre, email, username, password, role,
      empresaId: role === "cliente" ? (empresaId || undefined) : undefined,
    });
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
                   text-amber-700 hover:bg-amber-50 rounded-xl border border-dashed border-amber-200 transition-colors"
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
                   focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
      />
      <input
        value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" type="email"
        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                   focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
      />
      <div className="flex gap-2">
        <input
          value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario"
          className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
        />
        <input
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
          className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                     focus:outline-none focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
        />
      </div>
      <div className="flex gap-2">
        <select
          value={role} onChange={(e) => setRole(e.target.value as Role)}
          className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                     cursor-pointer focus:outline-none"
        >
          <option value="cliente">Cliente</option>
          <option value="equipo">Equipo</option>
          {isSuperAdmin && <option value="admin">Admin</option>}
          {isSuperAdmin && <option value="super_admin">Super Admin</option>}
        </select>
        {role === "cliente" && (
          <select
            value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}
            className="flex-1 min-w-0 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                       cursor-pointer focus:outline-none"
          >
            <option value="">Sin asignar</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit" disabled={submitting}
          className="flex-1 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5
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

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function PortalUsuarios() {
  const {
    currentUser, loading, users, companies,
    changeRole, assignEmpresa, deleteUser, uploadAvatar,
  } = useAuth();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    if (!isAdmin) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) return null;
  const isSuperAdmin = currentUser.role === "super_admin";
  const isAdmin = currentUser.role === "admin" || isSuperAdmin;
  if (!isAdmin) return null;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const res = await deleteUser(pendingDelete.id);
    setPendingDelete(null);
    if (!res.ok) window.alert(res.error ?? "Error al eliminar el usuario.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
      <PortalTopNav crumbs={[{ label: "Portal Empresarial" }]} navItems={PORTAL_NAV_ITEMS} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <h1 className="font-display text-2xl tracking-[0.04em] text-gradient-gold">USUARIOS</h1>
        </div>
        <p className="text-sm text-slate-500 ml-[42px] mb-6">
          Crea cuentas, asigna empresas y gestiona la foto de perfil del equipo.
        </p>

        <ConfirmModal
          open={!!pendingDelete}
          title="Eliminar usuario"
          message={`¿Eliminar a "${pendingDelete?.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Todos los usuarios</h2>
            <span className="text-xs font-bold text-slate-500">{users.length}</span>
          </div>

          <div className="p-6">
            <CreateUserForm isSuperAdmin={isSuperAdmin} />

            <div className="divide-y divide-slate-100 mt-4">
              {users.map((u) => {
                const targetIsAdminTier = u.role === "admin" || u.role === "super_admin";
                const locked = targetIsAdminTier && !isSuperAdmin;

                return (
                  <div key={u.id} className="py-4">
                    <div className="flex items-center gap-3.5">
                      <UserAvatar
                        userId={u.id}
                        avatarPath={u.avatar}
                        nombre={u.nombre}
                        size={44}
                        editable={u.role !== "cliente"}
                        onUpload={async (file) => {
                          const res = await uploadAvatar(u.id, file);
                          if (!res.ok) window.alert(res.error ?? "Error al subir la foto.");
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <select
                        value={u.role}
                        disabled={locked}
                        onChange={(e) => changeRole(u.id, e.target.value as "super_admin" | "admin" | "equipo" | "cliente")}
                        className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5
                                   text-slate-700 cursor-pointer focus:outline-none shrink-0
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="equipo">Equipo</option>
                        {isSuperAdmin && <option value="admin">Admin</option>}
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                        {!isSuperAdmin && targetIsAdminTier && (
                          <option value={u.role}>{u.role === "super_admin" ? "Super Admin" : "Admin"}</option>
                        )}
                      </select>
                      {u.id !== currentUser?.id && !locked && (
                        <button
                          onClick={() => setPendingDelete({ id: u.id, nombre: u.nombre })}
                          className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {u.role === "cliente" && (
                      <div className="mt-2.5 flex items-center gap-2 pl-[56px]">
                        <span className="text-[11px] text-slate-500 shrink-0">Empresa:</span>
                        <select
                          value={u.empresaId ?? ""}
                          onChange={(e) => assignEmpresa(u.id, e.target.value || undefined)}
                          className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1
                                     text-slate-700 cursor-pointer focus:outline-none flex-1
                                     focus:border-[hsl(43_78%_45%)]"
                        >
                          <option value="">Sin asignar</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
