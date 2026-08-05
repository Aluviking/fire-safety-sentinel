import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiFetch, setToken, getToken } from "@/lib/api";
import { AD_DISMISS_KEY } from "@/pages/portal/AdSidebar";

export type Role = "super_admin" | "admin" | "equipo" | "cliente";

export interface User {
  id: string;
  nombre: string;
  email: string;
  username: string;
  role: Role;
  empresaId?: string;
  avatar?: string | null;
}

export interface Company {
  id: string;
  nombre: string;
  nit: string;
  sector: string;
  photo?: string | null;
}

export interface Permission {
  id: number;
  userId: string;
  empresaId: string;
  canView: boolean;
  canUpload: boolean;
  canEdit: boolean;
  canDownload: boolean;
  grantedBy: string;
  grantedAt: string; // ISO timestamp
}

export interface TraceEntry {
  id: number;
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
  loading: boolean;
  users: User[];
  companies: Company[];
  permissions: Permission[];
  trace: TraceEntry[];
  /** empresaId -> cantidad de carpetas con al menos un documento subido. */
  progress: Record<string, number>;
  /** empresaId -> cantidad total de carpetas que tiene esa empresa (dinámico, ya no fijo en 26). */
  progressTotal: Record<string, number>;
  /** empresaId -> fase PHVA -> cantidad de carpetas de esa fase con al menos un documento. */
  progressByPhase: Record<string, Record<string, number>>;
  /** empresaId -> fase PHVA -> cantidad total de carpetas de esa fase. */
  progressTotalByPhase: Record<string, Record<string, number>>;
  loadProgress: () => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: { nombre: string; email: string; username: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  createUser: (data: { nombre: string; email: string; username: string; password: string; role: Role; empresaId?: string }) => Promise<{ ok: boolean; error?: string }>;
  createCompany: (data: { nombre: string; nit: string; sector: string }) => Promise<{ ok: boolean; error?: string }>;
  updateCompany: (companyId: string, data: { nombre: string; nit: string }) => Promise<{ ok: boolean; error?: string }>;
  uploadCompanyPhoto: (companyId: string, file: File) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; error?: string }>;
  deleteCompany: (companyId: string) => Promise<{ ok: boolean; error?: string }>;
  uploadAvatar: (userId: string, file: File) => Promise<{ ok: boolean; error?: string }>;
  uploadAd: (file: File) => Promise<{ ok: boolean; error?: string }>;
  changeRole: (userId: string, role: Role) => Promise<void>;
  assignEmpresa: (userId: string, empresaId: string | undefined) => Promise<void>;
  upsertPermission: (data: Omit<Permission, "id" | "grantedAt">) => Promise<void>;
  getPermission: (userId: string, empresaId: string) => Permission | undefined;
  addTrace: (entry: { action: string; empresaId?: string; detail?: string }) => void;
  refreshTrace: () => Promise<void>;
}

/* ─── Mapeo de filas de MySQL (snake_case) a los tipos de la app (camelCase) ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUserRow(row: any): User {
  return {
    id: row.id, nombre: row.nombre, email: row.email, username: row.username,
    role: row.role, empresaId: row.empresa_id ?? undefined,
    avatar: row.avatar_path ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCompanyRow(row: any): Company {
  return { id: row.id, nombre: row.nombre, nit: row.nit, sector: row.sector, photo: row.photo_path ?? null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPermissionRow(row: any): Permission {
  return {
    id: Number(row.id),
    userId: row.user_id,
    empresaId: row.empresa_id,
    canView: !!Number(row.can_view),
    canUpload: !!Number(row.can_upload),
    canEdit: !!Number(row.can_edit),
    canDownload: !!Number(row.can_download),
    grantedBy: row.granted_by,
    grantedAt: row.granted_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTraceRow(row: any): TraceEntry {
  return {
    id: Number(row.id), userId: row.user_id, userName: row.user_name, userRole: row.user_role,
    action: row.action, empresaId: row.empresa_id ?? undefined, detail: row.detail ?? undefined,
    timestamp: row.created_at,
  };
}

/* ─── Provider ──────────────────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading]         = useState(true);
  const [users, setUsers]             = useState<User[]>([]);
  const [companies, setCompanies]     = useState<Company[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [trace, setTrace]             = useState<TraceEntry[]>([]);
  const [progress, setProgress]       = useState<Record<string, number>>({});
  const [progressTotal, setProgressTotal] = useState<Record<string, number>>({});
  const [progressByPhase, setProgressByPhase] = useState<Record<string, Record<string, number>>>({});
  const [progressTotalByPhase, setProgressTotalByPhase] = useState<Record<string, Record<string, number>>>({});

  const loadCompanies = useCallback(async () => {
    try {
      const data = await apiFetch<{ companies: unknown[] }>("/companies/list.php");
      setCompanies(data.companies.map(mapCompanyRow));
    } catch {
      /* sin empresas aún, no es fatal */
    }
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      const data = await apiFetch<{
        progress: { empresa_id: string; phva_phase: string; total_folders: string | number; folders_with_docs: string | number }[];
      }>("/documents/progress.php");
      const map: Record<string, number> = {};
      const totalMap: Record<string, number> = {};
      const phaseMap: Record<string, Record<string, number>> = {};
      const totalPhaseMap: Record<string, Record<string, number>> = {};
      data.progress.forEach((p) => {
        const done = Number(p.folders_with_docs);
        const total = Number(p.total_folders);
        map[p.empresa_id] = (map[p.empresa_id] ?? 0) + done;
        totalMap[p.empresa_id] = (totalMap[p.empresa_id] ?? 0) + total;
        if (!phaseMap[p.empresa_id]) phaseMap[p.empresa_id] = {};
        if (!totalPhaseMap[p.empresa_id]) totalPhaseMap[p.empresa_id] = {};
        phaseMap[p.empresa_id][p.phva_phase] = done;
        totalPhaseMap[p.empresa_id][p.phva_phase] = total;
      });
      setProgress(map);
      setProgressTotal(totalMap);
      setProgressByPhase(phaseMap);
      setProgressTotalByPhase(totalPhaseMap);
    } catch {
      /* sin progreso aún, no es fatal */
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const data = await apiFetch<{ permissions: unknown[] }>("/permissions/list.php");
      setPermissions(data.permissions.map(mapPermissionRow));
    } catch {
      /* sin permisos aún, no es fatal */
    }
  }, []);

  const loadTrace = useCallback(async () => {
    try {
      const t = await apiFetch<{ trace: unknown[] }>("/audit/list.php");
      setTrace(t.trace.map(mapTraceRow));
    } catch {
      /* el Historial mostrará lo que ya tenía cargado si esto falla */
    }
  }, []);

  const loadAdminData = useCallback(async (role: Role) => {
    if (role !== "admin" && role !== "super_admin") return;
    try {
      const u = await apiFetch<{ users: unknown[] }>("/users/list.php");
      setUsers(u.users.map(mapUserRow));
    } catch {
      /* el panel de admin mostrará listas vacías si esto falla */
    }
    await loadTrace();
  }, [loadTrace]);

  // Sesión inicial: si hay token guardado, valida contra el servidor.
  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await apiFetch<{ user: unknown }>("/auth/me.php");
        const user = mapUserRow(data.user);
        setCurrentUser(user);
        await Promise.all([loadCompanies(), loadPermissions(), loadAdminData(user.role), loadProgress()]);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const data = await apiFetch<{ token: string; user: unknown }>("/auth/login.php", {
        method: "POST",
        json: { identifier: emailOrUsername, password },
      });
      const user = mapUserRow(data.user);
      setToken(data.token);
      setCurrentUser(user);
      // El anuncio de publicidad debe reaparecer en cada inicio de sesión nuevo,
      // aunque sea el mismo anuncio ya cerrado antes.
      sessionStorage.removeItem(AD_DISMISS_KEY);
      await Promise.all([loadCompanies(), loadPermissions(), loadAdminData(user.role), loadProgress()]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const logout = async () => {
    try { await apiFetch("/auth/logout.php", { method: "POST" }); } catch { /* best-effort */ }
    sessionStorage.removeItem(AD_DISMISS_KEY);
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
    setCompanies([]);
    setPermissions([]);
    setTrace([]);
    setProgress({});
    setProgressTotal({});
    setProgressByPhase({});
    setProgressTotalByPhase({});
  };

  const register = async (data: { nombre: string; email: string; username: string; password: string }) => {
    try {
      const res = await apiFetch<{ token: string; user: unknown }>("/auth/register.php", {
        method: "POST",
        json: data,
      });
      const user = mapUserRow(res.user);
      setToken(res.token);
      setCurrentUser(user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const createUser = async (data: { nombre: string; email: string; username: string; password: string; role: Role; empresaId?: string }) => {
    try {
      const res = await apiFetch<{ user: unknown }>("/users/create.php", { method: "POST", json: data });
      setUsers((prev) => [...prev, mapUserRow(res.user)]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const createCompany = async (data: { nombre: string; nit: string; sector: string }) => {
    try {
      const res = await apiFetch<{ company: unknown }>("/companies/create.php", { method: "POST", json: data });
      setCompanies((prev) => [...prev, mapCompanyRow(res.company)]);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const updateCompany = async (companyId: string, data: { nombre: string; nit: string }) => {
    try {
      await apiFetch("/companies/update.php", { method: "POST", json: { id: companyId, ...data } });
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, ...data } : c)));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const uploadCompanyPhoto = async (companyId: string, file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("id", companyId);
      const res = await apiFetch<{ photoPath: string }>("/companies/upload-photo.php", { method: "POST", body: form });
      setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, photo: res.photoPath } : c)));
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

  const deleteCompany = async (companyId: string) => {
    try {
      await apiFetch("/companies/delete.php", { method: "POST", json: { id: companyId } });
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const uploadAvatar = async (userId: string, file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("user_id", userId);
      const res = await apiFetch<{ avatarPath: string }>("/users/upload-avatar.php", { method: "POST", body: form });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, avatar: res.avatarPath } : u)));
      if (currentUser?.id === userId) setCurrentUser((c) => (c ? { ...c, avatar: res.avatarPath } : c));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const uploadAd = async (file: File) => {
    try {
      const form = new FormData();
      form.append("file", file);
      await apiFetch("/ads/upload.php", { method: "POST", body: form });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Error." };
    }
  };

  const changeRole = async (userId: string, role: Role) => {
    await apiFetch("/users/update-role.php", { method: "POST", json: { userId, role } });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    if (currentUser?.id === userId) setCurrentUser((c) => (c ? { ...c, role } : c));
  };

  const assignEmpresa = async (userId: string, empresaId: string | undefined) => {
    await apiFetch("/users/assign-empresa.php", { method: "POST", json: { userId, empresaId: empresaId ?? null } });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, empresaId } : u)));
    if (currentUser?.id === userId) setCurrentUser((c) => (c ? { ...c, empresaId } : c));
  };

  const upsertPermission = async (data: Omit<Permission, "id" | "grantedAt">) => {
    await apiFetch("/permissions/upsert.php", { method: "POST", json: data });
    await loadPermissions();
  };

  const getPermission = (userId: string, empresaId: string) =>
    permissions.find((p) => p.userId === userId && p.empresaId === empresaId);

  // Best-effort: no bloquea la UI ni rompe el flujo si falla.
  const addTrace = (entry: { action: string; empresaId?: string; detail?: string }) => {
    apiFetch("/audit/log.php", { method: "POST", json: entry }).catch(() => { /* ignore */ });
  };

  return (
    <AuthContext.Provider value={{
      currentUser, loading, users, companies, permissions, trace,
      progress, progressTotal, progressByPhase, progressTotalByPhase, loadProgress,
      login, logout, register, createUser, createCompany, updateCompany, uploadCompanyPhoto,
      deleteUser, deleteCompany, changeRole,
      assignEmpresa, upsertPermission, getPermission, addTrace, uploadAvatar, uploadAd,
      refreshTrace: loadTrace,
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
