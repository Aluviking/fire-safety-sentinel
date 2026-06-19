/* ─── Carrusel premium de clientes ────────────────────────────────────────── */

const clients = [
  {
    name: "Cemex Colombia",
    logo: (
      <svg viewBox="0 0 110 40" className="h-9 w-auto" fill="none">
        <rect x="1.5" y="1.5" width="107" height="37" rx="5" stroke="currentColor" strokeWidth="1.8"/>
        <text x="55" y="26" textAnchor="middle" fontFamily="Georgia,serif" fontSize="15" fontWeight="700" fill="currentColor" letterSpacing="3">CEMEX</text>
      </svg>
    ),
  },
  {
    name: "Bavaria S.A.",
    logo: (
      <svg viewBox="0 0 110 40" className="h-9 w-auto" fill="none">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.8"/>
        <text x="20" y="25" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="800" fill="currentColor">B</text>
        <text x="68" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="currentColor" letterSpacing="2">BAVARIA</text>
      </svg>
    ),
  },
  {
    name: "Ecopetrol",
    logo: (
      <svg viewBox="0 0 120 40" className="h-9 w-auto" fill="none">
        <path d="M20 6 L34 20 L20 34 L6 20 Z" stroke="currentColor" strokeWidth="1.8"/>
        <text x="20" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="currentColor">E</text>
        <text x="74" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="currentColor" letterSpacing="1">ECOPETROL</text>
      </svg>
    ),
  },
  {
    name: "Cementos Argos",
    logo: (
      <svg viewBox="0 0 96 40" className="h-9 w-auto" fill="none">
        <path d="M10 32 L24 8 L38 32 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M15 25 H33" stroke="currentColor" strokeWidth="1.2"/>
        <text x="66" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="currentColor" letterSpacing="1.5">ARGOS</text>
      </svg>
    ),
  },
  {
    name: "Bancolombia",
    logo: (
      <svg viewBox="0 0 130 40" className="h-9 w-auto" fill="none">
        <rect x="2" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.8"/>
        <text x="14" y="25" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fontWeight="800" fill="currentColor">B</text>
        <text x="78" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor" letterSpacing="1">BANCOLOMBIA</text>
      </svg>
    ),
  },
  {
    name: "Grupo Éxito",
    logo: (
      <svg viewBox="0 0 96 40" className="h-9 w-auto" fill="none">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M13 20 H27 M20 13 V27" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        <text x="62" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="currentColor" letterSpacing="1">ÉXITO</text>
      </svg>
    ),
  },
  {
    name: "ISA Intercolombia",
    logo: (
      <svg viewBox="0 0 72 40" className="h-9 w-auto" fill="none">
        <rect x="2" y="6" width="68" height="28" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M2 14 H70" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
        <path d="M2 26 H70" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/>
        <text x="36" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="800" fill="currentColor" letterSpacing="4">ISA</text>
      </svg>
    ),
  },
  {
    name: "Nutresa",
    logo: (
      <svg viewBox="0 0 106 40" className="h-9 w-auto" fill="none">
        <path d="M6 32 V14 L20 6 L34 14 V32" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="1.4"/>
        <text x="72" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="currentColor" letterSpacing="1.5">NUTRESA</text>
      </svg>
    ),
  },
  {
    name: "Claro Colombia",
    logo: (
      <svg viewBox="0 0 96 40" className="h-9 w-auto" fill="none">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="20" cy="20" r="8"  stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="20" cy="20" r="2"  fill="currentColor"/>
        <text x="62" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="600" fill="currentColor" letterSpacing="1.5">CLARO</text>
      </svg>
    ),
  },
  {
    name: "Alpina",
    logo: (
      <svg viewBox="0 0 96 40" className="h-9 w-auto" fill="none">
        <path d="M6 32 L20 8 L34 32" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M12 24 H28" stroke="currentColor" strokeWidth="1.3"/>
        <text x="66" y="25" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="currentColor" letterSpacing="2">ALPINA</text>
      </svg>
    ),
  },
];

/* Tarjeta de logo — glass con glow dorado al hover */
const LogoCard = ({ name, logo }: { name: string; logo: React.ReactNode }) => (
  <div
    title={name}
    className="shrink-0 flex items-center justify-center
               px-7 py-4 rounded-2xl
               border border-[hsl(43_78%_50%/0.1)]
               bg-[hsl(35_10%_8%/0.7)]
               text-white/28
               hover:text-white/70
               hover:border-[hsl(43_78%_50%/0.38)]
               hover:bg-[hsl(43_78%_50%/0.05)]
               hover:shadow-[0_0_22px_hsl(43_78%_50%/0.14),inset_0_1px_0_hsl(43_78%_50%/0.12)]
               transition-all duration-400 cursor-default"
  >
    {logo}
  </div>
);

import React from "react";

const ClientsSection = () => {
  const loopItems = [...clients, ...clients, ...clients];

  return (
    <section className="relative py-10 overflow-hidden bg-[hsl(30_8%_5%)]">

      {/* Línea dorada superior */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />
      {/* Línea dorada inferior */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />

      {/* Glow ambiente central */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-32
                      bg-[hsl(43_78%_50%/0.03)] blur-3xl" />

      {/* Fade lateral */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10
                      bg-gradient-to-r from-[hsl(30_8%_5%)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10
                      bg-gradient-to-l from-[hsl(30_8%_5%)] to-transparent" />

      {/* Encabezado con líneas decorativas */}
      <div className="flex items-center justify-center gap-4 mb-8 px-8">
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[hsl(43_78%_50%/0.35)]" />
        <p className="font-body text-[10px] tracking-[0.28em] uppercase font-semibold text-foreground/35 whitespace-nowrap">
          Empresas que confían en SISO
        </p>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[hsl(43_78%_50%/0.35)]" />
      </div>

      {/* Carrusel */}
      <div className="flex overflow-hidden">
        <div
          className="flex items-center gap-4"
          style={{
            animation: "marquee-clients 60s linear infinite",
            width: "max-content",
          }}
        >
          {loopItems.map((c, i) => (
            <LogoCard key={i} name={c.name} logo={c.logo} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-clients {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

export default ClientsSection;
