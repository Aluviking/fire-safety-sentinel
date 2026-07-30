import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/context/AuthContext";
import { PortalTopNav, PORTAL_NAV_ITEMS } from "./PortalTopNav";

export default function PortalPermisos() {
  const { currentUser, loading, users, companies, permissions, upsertPermission } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate("/portal", { replace: true }); return; }
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    if (!isAdmin) navigate("/portal/dashboard", { replace: true });
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) return null;
  const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
  if (!isAdmin) return null;

  const equipoUsers = users.filter((u) => u.role === "equipo");

  const getPerm = (equipoUserId: string, empresaId: string): Permission | undefined =>
    permissions.find((p) => p.equipoUserId === equipoUserId && p.empresaId === empresaId);

  const toggle = (
    equipoUserId: string,
    empresaId: string,
    field: "canEdit" | "canUpload" | "clienteCanUpload",
    current: boolean
  ) => {
    const existing = getPerm(equipoUserId, empresaId);
    upsertPermission({
      equipoUserId,
      empresaId,
      canEdit:           field === "canEdit"           ? !current : (existing?.canEdit           ?? false),
      canUpload:         field === "canUpload"         ? !current : (existing?.canUpload         ?? false),
      clienteCanUpload:  field === "clienteCanUpload"  ? !current : (existing?.clienteCanUpload  ?? false),
      grantedBy: currentUser?.id ?? "admin-001",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />
      <PortalTopNav crumbs={[{ label: "Portal Empresarial" }]} navItems={PORTAL_NAV_ITEMS} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-700" />
          </div>
          <h1 className="font-display text-2xl tracking-[0.04em] text-gradient-gold">PERMISOS</h1>
        </div>
        <p className="text-sm text-slate-500 ml-[42px] mb-6">
          Define qué puede editar o subir cada usuario de Equipo, por empresa.
        </p>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Equipo × Empresa</h2>
          </div>

          <div className="p-6">
            {equipoUsers.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-6">No hay usuarios con rol Equipo aún.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {equipoUsers.map((u) => (
                  <div key={u.id}>
                    <button
                      onClick={() => setOpen(open === u.id ? null : u.id)}
                      className="w-full flex items-center gap-2.5 py-3.5 hover:bg-slate-50 rounded-xl px-2 -mx-2
                                 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 shrink-0
                                      flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">{u.nombre[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0
                                    ${open === u.id ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {open === u.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-slate-50 rounded-xl px-3 py-2 mb-3">
                            <div className="flex items-center gap-1 px-1 pb-1.5 text-[10px] text-slate-500">
                              <span className="w-[140px] shrink-0">Empresa</span>
                              <span className="w-[50px] text-center shrink-0">Editar</span>
                              <span className="w-[50px] text-center shrink-0">Subir</span>
                              <span className="w-[50px] text-center shrink-0 leading-tight">Cliente<br/>Sube</span>
                            </div>
                            {companies.map((c) => {
                              const p = getPerm(u.id, c.id);
                              return (
                                <div key={c.id} className="flex items-center gap-1 py-1.5 border-b border-slate-100 last:border-0">
                                  <span className="text-[11px] text-slate-700 w-[140px] shrink-0 truncate">{c.nombre}</span>
                                  {(["canEdit", "canUpload", "clienteCanUpload"] as const).map((field) => (
                                    <div key={field} className="w-[50px] flex justify-center shrink-0">
                                      <button
                                        onClick={() => toggle(u.id, c.id, field, p?.[field] ?? false)}
                                        className={`w-8 h-4 rounded-full transition-colors duration-200 relative
                                          ${p?.[field] ? "bg-amber-400" : "bg-slate-300"}`}
                                      >
                                        <span
                                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200
                                            ${p?.[field] ? "left-[18px]" : "left-0.5"}`}
                                        />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
