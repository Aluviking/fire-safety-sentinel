import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, LogOut, ShieldCheck, Users, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import sisoLogo from "@/assets/siso-logo.png";

/* ─── Mockup companies ──────────────────────────────────────────────────────── */
export const COMPANIES = [
  { id: "1", nombre: "Inversiones Caribe S.A.S",     nit: "900.123.456-7", sector: "Financiero"  },
  { id: "2", nombre: "Constructora Andina LTDA",      nit: "800.456.789-3", sector: "Construcción"},
  { id: "3", nombre: "LogiCarga Express",             nit: "901.234.567-1", sector: "Logística"   },
  { id: "4", nombre: "TechSoluciones Colombia",       nit: "830.987.654-2", sector: "Tecnología"  },
  { id: "5", nombre: "Distribuidora El Progreso",     nit: "800.765.432-8", sector: "Comercio"    },
  { id: "6", nombre: "Minería Sur Andina S.A.",       nit: "900.321.654-5", sector: "Minería"     },
  { id: "7", nombre: "Alimentos Saludables del Valle",nit: "830.654.321-0", sector: "Alimentos"   },
  { id: "8", nombre: "Grupo Hospitalario del Norte",  nit: "891.000.234-9", sector: "Salud"       },
];

const SECTOR_COLORS: Record<string, string> = {
  Financiero:  "#b45309", Construcción:"#c2410c", Logística:  "#0369a1",
  Tecnología:  "#7c3aed", Comercio:    "#059669",  Minería:    "#92400e",
  Alimentos:   "#166534", Salud:       "#be123c",
};
const SECTOR_BG: Record<string, string> = {
  Financiero:  "#fef3c7", Construcción:"#fff7ed", Logística:  "#e0f2fe",
  Tecnología:  "#f5f3ff", Comercio:    "#d1fae5",  Minería:    "#fef3c7",
  Alimentos:   "#dcfce7", Salud:       "#ffe4e6",
};

/* ─── Company card ──────────────────────────────────────────────────────────── */
function CompanyCard({ company, index }: { company: typeof COMPANIES[0]; index: number }) {
  const navigate = useNavigate();
  const color  = SECTOR_COLORS[company.sector] ?? "#b45309";
  const bg     = SECTOR_BG[company.sector]     ?? "#fef3c7";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.055, ease: "easeOut" }}
      onClick={() => navigate(`/portal/empresa/${company.id}`)}
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5
                 hover:border-[hsl(43_78%_50%/0.6)] hover:shadow-lg shadow-sm
                 transition-all duration-200 relative overflow-hidden"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
           style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      {/* Sector badge */}
      <span className="inline-flex items-center text-[11px] font-bold tracking-widest uppercase
                       px-2.5 py-1 rounded-full"
            style={{ color, background: bg }}>
        {company.sector}
      </span>

      {/* Name */}
      <h3 className="mt-3 font-semibold text-slate-800 text-[15px] leading-snug
                     group-hover:text-[hsl(43_78%_38%)] transition-colors duration-200">
        {company.nombre}
      </h3>

      {/* NIT */}
      <p className="mt-1 text-xs text-slate-400">NIT {company.nit}</p>

      {/* PHVA pills + arrow */}
      <div className="flex items-center gap-1.5 mt-4">
        {["P","H","V","A"].map((l) => (
          <span key={l}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50
                       flex items-center justify-center text-xs font-bold text-slate-400
                       group-hover:border-[hsl(43_78%_50%/0.5)] group-hover:text-[hsl(43_78%_42%)]
                       group-hover:bg-amber-50 transition-all duration-200">
            {l}
          </span>
        ))}
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[hsl(43_78%_50%)]
                                  group-hover:translate-x-0.5 transition-all duration-200 ml-auto" />
      </div>
    </motion.div>
  );
}

/* ─── Admin panel ───────────────────────────────────────────────────────────── */
function AdminPanel() {
  const { users, changeRole } = useAuth();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Users className="w-3.5 h-3.5 text-amber-700" />
        </div>
        <h2 className="font-semibold text-slate-800 text-sm">Gestión de Usuarios</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200
                            flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-amber-700">{u.nombre[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
              <p className="text-xs text-slate-400 truncate">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => changeRole(u.id, e.target.value as "admin" | "cliente")}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5
                         text-slate-700 cursor-pointer focus:outline-none
                         focus:border-[hsl(43_78%_45%)] focus:ring-2 focus:ring-[hsl(43_78%_50%/0.15)]"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function PortalDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate("/portal", { replace: true });
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-[hsl(40_82%_46%)] via-[hsl(44_80%_54%)] to-[hsl(40_82%_46%)]" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={sisoLogo} alt="SISO"
              className="w-9 h-9 rounded-full border-2 border-[hsl(43_78%_50%/0.6)] shadow-sm" />
            <div className="leading-none">
              <span className="font-display tracking-[0.14em] text-gradient-gold text-lg">SISO</span>
              <span className="hidden sm:inline text-slate-400 mx-2 text-sm">·</span>
              <span className="hidden sm:inline text-sm text-slate-500">Portal Empresarial</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser.role === "admin" && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase
                               text-amber-700 border border-amber-300 bg-amber-50 px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </span>
            )}
            <span className="hidden md:block text-sm text-slate-600 font-medium">{currentUser.nombre}</span>
            <button onClick={() => { logout(); navigate("/portal"); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600
                         px-3 py-2 rounded-xl hover:bg-red-50 transition-all font-medium">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }} className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
            <h1 className="font-display text-2xl tracking-[0.06em] text-gradient-gold">Empresas</h1>
          </div>
          <p className="text-sm text-slate-500 ml-[42px]">
            Selecciona una empresa para gestionar su ciclo PHVA.
          </p>
        </motion.div>

        <div className={`grid gap-6 ${currentUser.role === "admin" ? "xl:grid-cols-[1fr_360px]" : ""}`}>
          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANIES.map((c, i) => <CompanyCard key={c.id} company={c} index={i} />)}
          </div>
          {/* Admin panel */}
          {currentUser.role === "admin" && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}
