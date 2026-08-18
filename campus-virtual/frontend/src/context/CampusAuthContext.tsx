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
}

interface CampusAuthContextType {
  currentUser: CampusUser | null;
  loading: boolean;
  users: CampusUser[];
  login: (emailOrUsername: string, password: string, recaptchaToken: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  createUser: (data: { nombre: string; email: string; username: string; password: string; role: Role }) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (userId: string, data: { nombre: string; email: string; username: string }) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (userId: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  changeRole: (userId: string, role: Role) => Promise<{ ok: boolean; error?: string }>;
}

const CampusAuthContext = createContext<CampusAuthContextType | undefined>(undefined);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRow(row: any): CampusUser {
  return {
    id: row.id, nombre: row.nombre, email: row.email, username: row.username,
    role: row.role, avatar: row.avatar_path ?? null,
  };
}

export function CampusAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CampusUser | null>(null);
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
        const data = await apiFetch<{ user: unknown }>("/auth/me.php");
        const user = mapUserRow(data.user);
        setCurrentUser(user);
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
      const data = await apiFetch<{ token: string; user: unknown }>("/auth/login.php", {
        method: "POST",
        json: { identifier: emailOrUsername, password, recaptchaToken },
      });
      const user = mapUserRow(data.user);
      setToken(data.token);
      setCurrentUser(user);
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

  return (
    <CampusAuthContext.Provider value={{ currentUser, loading, users, login, logout, createUser, deleteUser, updateUser, resetPassword, changeRole }}>
      {children}
    </CampusAuthContext.Provider>
  );
}

export function useCampusAuth() {
  const ctx = useContext(CampusAuthContext);
  if (!ctx) throw new Error("useCampusAuth debe usarse dentro de CampusAuthProvider");
  return ctx;
}
