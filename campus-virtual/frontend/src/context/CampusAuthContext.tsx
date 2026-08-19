import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch, setToken, getToken } from "@/lib/api";

export type Role = "super_admin" | "admin" | "docente" | "administrativo" | "estudiante" | "equipo";

export interface CampusUser {
  id: string;
  nombre: string;
  email: string;
  username: string;
  role: Role;
  avatar?: string | null;
  perfilId?: number | null;
  perfilNombre?: string | null;
}

export interface Permisos {
  all: boolean;
  modulos: Record<string, { ver: boolean; editar: boolean }>;
}

interface CampusAuthContextType {
  currentUser: CampusUser | null;
  permisos: Permisos;
  loading: boolean;
  users: CampusUser[];
  login: (emailOrUsername: string, password: string, recaptchaToken: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  createUser: (data: { nombre: string; email: string; username: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (userId: string, data: { nombre: string; email: string; username: string }) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (userId: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  changeRole: (userId: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
  assignPerfil: (userId: string, perfilId: number | null) => Promise<{ ok: boolean; error?: string }>;
  canVer: (modulo: string) => boolean;
  canEditar: (modulo: string) => boolean;
}

const CampusAuthContext = createContext<CampusAuthContextType | undefined>(undefined);
const DEFAULT_PERMISOS: Permisos = { all: true, modulos: {} };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRow(row: any): CampusUser {
  return {
    id: row.id, nombre: row.nombre, email: row.email, username: row.username,
    role: row.role, avatar: row.avatar_path ?? null,
    perfilId: row.perfil_id ?? null, perfilNombre: row.perfil_nombre ?? null,
  };
}

export function CampusAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CampusUser | null>(null);
  const [permisos, setPermisos]       = useState<Permisos>(DEFAULT_PERMISOS);
  const [loading, setLoading]         = useState(true);
  const [users, setUsers]             = useState<CampusUser[]>([]);

  const loadUsers = useCallback(async (role: Role) => {
    if (role !== "admin" && role !== "super_admin") return;
    try {
      const data = await apiFetch<{ users: unknown[] }>("/users/list.php");
      setUsers(data.users.map(mapUserRow));
    } catch {
      /* el panel de admin mostrará la lista vacía si esto falla */
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await apiFetch<{ user: unknown; permisos?: Permisos }>("/auth/me.php");
        const user = mapUserRow(data.user);
        setCurrentUser(user);
        setPermisos(data.permisos ?? DEFAULT_PERMISOS);
        await loadUsers(user.role);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (emailOrUsername: string, password: string, recaptchaToken: string) => {
    try {
      const data = await apiFetch<{ token: string; user: unknown; permisos?: Permisos }>("/auth/login.php", {
        method: "POST",
        json: { identifier: emailOrUsername, password, recaptchaToken },
      });
      const user = mapUserRow(data.user);
      setToken(data.token);
      setCurrentUser(user);
      setPermisos(data.permisos ?? DEFAULT_PERMISOS);
      await loadUsers(user.role);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const logout = async () => {
    try { await apiFetch("/auth/logout.php", { method: "POST" }); } catch { /* best-effort */ }
    setToken(null);
    setCurrentUser(null);
    setPermisos(DEFAULT_PERMISOS);
    setUsers([]);
  };

  const createUser: CampusAuthContextType["createUser"] = async (data) => {
    try {
      const res = await apiFetch<{ user: unknown }>("/users/create.php", { method: "POST", json: data });
      setUsers((prev) => [...prev, mapUserRow(res.user)]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiFetch("/users/delete.php", { method: "POST", json: { userId } });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const updateUser = async (userId: string, data: { nombre: string; email: string; username: string }) => {
    try {
      await apiFetch("/users/update.php", { method: "POST", json: { userId, ...data } });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
      if (currentUser?.id === userId) setCurrentUser((c) => (c ? { ...c, ...data } : c));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      await apiFetch("/users/reset-password.php", { method: "POST", json: { userId, newPassword } });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const changeRole = async (userId: string, role: Role) => {
    try {
      await apiFetch("/users/update-role.php", { method: "POST", json: { userId, role } });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const assignPerfil = async (userId: string, perfilId: number | null) => {
    try {
      await apiFetch("/users/update-perfil.php", { method: "POST", json: { userId, perfilId } });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, perfilId } : u)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const canVer = (modulo: string) => permisos.all || !!permisos.modulos[modulo]?.ver;
  const canEditar = (modulo: string) => permisos.all || !!permisos.modulos[modulo]?.editar;

  return (
    <CampusAuthContext.Provider value={{
      currentUser, permisos, loading, users, login, logout, createUser, deleteUser, updateUser, resetPassword,
      changeRole, assignPerfil, canVer, canEditar,
    }}>
      {children}
    </CampusAuthContext.Provider>
  );
}

export function useCampusAuth() {
  const ctx = useContext(CampusAuthContext);
  if (!ctx) throw new Error("useCampusAuth debe usarse dentro de CampusAuthProvider");
  return ctx;
}
