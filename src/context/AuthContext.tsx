import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "equipo" | "cliente";

export interface User {
  id: string;
  nombre: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  empresaId?: string; // assigned company (used for "cliente" role)
}

export interface Permission {
  id: string;
  equipoUserId: string;
  empresaId: string;
  canEdit: boolean;
  canUpload: boolean;
  clienteCanUpload: boolean; // admin grants this so cliente of this empresa can upload
  grantedBy: string;        // admin userId
  grantedAt: string;        // ISO timestamp
}

export interface TraceEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  empresaId?: string;
  detail?: string;
  timestamp: string; // ISO
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  permissions: Permission[];
  trace: TraceEntry[];
  login: (emailOrUsername: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (data: Omit<User, "id" | "role">) => { ok: boolean; error?: string };
  changeRole: (userId: string, role: Role) => void;
  assignEmpresa: (userId: string, empresaId: string | undefined) => void;
  upsertPermission: (data: Omit<Permission, "id" | "grantedAt">) => void;
  getPermission: (equipoUserId: string, empresaId: string) => Permission | undefined;
  addTrace: (entry: Omit<TraceEntry, "id" | "timestamp">) => void;
}

const STORAGE_KEY = "siso_users";
const SESSION_KEY = "siso_session";
const PERMS_KEY   = "siso_permissions";
const TRACE_KEY   = "siso_trace";

/* ─── Seed accounts ─────────────────────────────────────────────────────────── */
const SEED_ADMIN: User = {
  id: "admin-001", nombre: "Administrador SISO",
  email: "admin@siso.com", username: "admin", password: "Admin123!", role: "admin",
};
const SEED_EQUIPO: User = {
  id: "equipo-001", nombre: "Consultor SISO",
  email: "equipo@siso.com", username: "equipo", password: "Equipo123!", role: "equipo",
};
const SEED_CLIENTE: User = {
  id: "cliente-001", nombre: "Cliente Demo",
  email: "cliente@siso.com", username: "cliente", password: "Cliente123!",
  role: "cliente", empresaId: "1",
};

const SEEDS = [SEED_ADMIN, SEED_EQUIPO, SEED_CLIENTE];

/* ─── localStorage helpers ──────────────────────────────────────────────────── */
function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as User[];
      const ids = new Set(parsed.map((u) => u.id));
      const missing = SEEDS.filter((s) => !ids.has(s.id));
      return [...missing, ...parsed];
    }
  } catch {}
  return [...SEEDS];
}

function saveUsers(u: User[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }

function loadPerms(): Permission[] {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    if (raw) return JSON.parse(raw) as Permission[];
  } catch {}
  return [];
}

function savePerms(p: Permission[]) { localStorage.setItem(PERMS_KEY, JSON.stringify(p)); }

function loadTrace(): TraceEntry[] {
  try {
    const raw = localStorage.getItem(TRACE_KEY);
    if (raw) return JSON.parse(raw) as TraceEntry[];
  } catch {}
  return [];
}

function saveTrace(t: TraceEntry[]) { localStorage.setItem(TRACE_KEY, JSON.stringify(t)); }

/* ─── Provider ──────────────────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers]         = useState<User[]>(loadUsers);
  const [permissions, setPerms]   = useState<Permission[]>(loadPerms);
  const [trace, setTrace]         = useState<TraceEntry[]>(loadTrace);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw) as User;
    } catch {}
    return null;
  });

  // Ensure seed accounts are always present
  useEffect(() => {
    const ids = new Set(users.map((u) => u.id));
    const missing = SEEDS.filter((s) => !ids.has(s.id));
    if (missing.length > 0) {
      const updated = [...missing, ...users];
      setUsers(updated);
      saveUsers(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (emailOrUsername: string, password: string) => {
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
          u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
        u.password === password
    );
    if (!user) return { ok: false, error: "Credenciales incorrectas." };
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const register = (data: Omit<User, "id" | "role">) => {
    const exists = users.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() ||
        u.username.toLowerCase() === data.username.toLowerCase()
    );
    if (exists) return { ok: false, error: "El correo o usuario ya existe." };
    const newUser: User = { ...data, id: `user-${Date.now()}`, role: "cliente" };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setCurrentUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { ok: true };
  };

  const changeRole = (userId: string, role: Role) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, role } : u));
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === userId) {
      const next = { ...currentUser, role };
      setCurrentUser(next);
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }
  };

  const assignEmpresa = (userId: string, empresaId: string | undefined) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, empresaId } : u));
    setUsers(updated);
    saveUsers(updated);
    if (currentUser?.id === userId) {
      const next = { ...currentUser, empresaId };
      setCurrentUser(next);
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    }
  };

  const upsertPermission = (data: Omit<Permission, "id" | "grantedAt">) => {
    const existing = permissions.find(
      (p) => p.equipoUserId === data.equipoUserId && p.empresaId === data.empresaId
    );
    let updated: Permission[];
    if (existing) {
      updated = permissions.map((p) =>
        p.id === existing.id
          ? { ...p, ...data, grantedAt: new Date().toISOString() }
          : p
      );
    } else {
      updated = [
        ...permissions,
        { ...data, id: `perm-${Date.now()}`, grantedAt: new Date().toISOString() },
      ];
    }
    setPerms(updated);
    savePerms(updated);
  };

  const getPermission = (equipoUserId: string, empresaId: string) =>
    permissions.find((p) => p.equipoUserId === equipoUserId && p.empresaId === empresaId);

  const addTrace = (entry: Omit<TraceEntry, "id" | "timestamp">) => {
    const newEntry: TraceEntry = {
      ...entry,
      id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...trace].slice(0, 500);
    setTrace(updated);
    saveTrace(updated);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, users, permissions, trace,
      login, logout, register, changeRole,
      assignEmpresa, upsertPermission, getPermission, addTrace,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
