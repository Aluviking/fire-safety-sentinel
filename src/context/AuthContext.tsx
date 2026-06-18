import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "admin" | "cliente";

export interface User {
  id: string;
  nombre: string;
  email: string;
  username: string;
  password: string;
  role: Role;
}

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (emailOrUsername: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  register: (data: Omit<User, "id" | "role">) => { ok: boolean; error?: string };
  changeRole: (userId: string, role: Role) => void;
}

const STORAGE_KEY = "siso_users";
const SESSION_KEY = "siso_session";

const SEED_ADMIN: User = {
  id: "admin-001",
  nombre: "Administrador SISO",
  email: "admin@siso.com",
  username: "admin",
  password: "Admin123!",
  role: "admin",
};

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as User[];
  } catch {}
  return [SEED_ADMIN];
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw) as User;
    } catch {}
    return null;
  });

  // keep admin seed always present
  useEffect(() => {
    if (!users.find((u) => u.id === "admin-001")) {
      const updated = [SEED_ADMIN, ...users];
      setUsers(updated);
      saveUsers(updated);
    }
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
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      role: "cliente",
    };
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

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, register, changeRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
