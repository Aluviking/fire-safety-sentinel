/* ─── Carrusel de clientes ─────────────────────────────────────────────────── */

/* Logos mockup — reemplazar src con imágenes reales cuando estén disponibles */
const clients = [
  {
    name: "Cemex Colombia",
    logo: (
      <svg viewBox="0 0 80 32" className="w-20 h-8" fill="none">
        <rect x="1" y="1" width="78" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <text x="40" y="21" textAnchor="middle" fontFamily="serif" fontSize="13" fontWeight="700" fill="currentColor" letterSpacing="2">CEMEX</text>
      </svg>
    ),
  },
  {
    name: "Bavaria",
    logo: (
      <svg viewBox="0 0 80 32" className="w-20 h-8" fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        <text x="16" y="20" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="currentColor">B</text>
        <text x="48" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor" letterSpacing="1">BAVARIA</text>
      </svg>
    ),
  },
  {
    name: "Ecopetrol",
    logo: (
      <svg viewBox="0 0 90 32" className="w-24 h-8" fill="none">
        <path d="M4 16 L16 4 L28 16 L16 28 Z" stroke="currentColor" strokeWidth="1.5" />
        <text x="16" y="20" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="currentColor">E</text>
        <text x="58" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor" letterSpacing="0.5">ECOPETROL</text>
      </svg>
    ),
  },
  {
    name: "Argos",
    logo: (
      <svg viewBox="0 0 72 32" className="w-[72px] h-8" fill="none">
        <path d="M8 26 L20 6 L32 26 Z" stroke="currentColor" strokeWidth="1.5" />
        <text x="52" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="currentColor" letterSpacing="1">ARGOS</text>
      </svg>
    ),
  },
  {
    name: "Bancolombia",
    logo: (
      <svg viewBox="0 0 100 32" className="w-28 h-8" fill="none">
        <rect x="1" y="6" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <text x="11" y="21" textAnchor="middle" fontFamily="serif" fontSize="12" fontWeight="800" fill="currentColor">B</text>
        <text x="62" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="currentColor" letterSpacing="0.5">BANCOLOMBIA</text>
      </svg>
    ),
  },
  {
    name: "Grupo Éxito",
    logo: (
      <svg viewBox="0 0 76 32" className="w-20 h-8" fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        <text x="16" y="20" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="800" fill="currentColor">X</text>
        <text x="50" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor" letterSpacing="1">ÉXITO</text>
      </svg>
    ),
  },
  {
    name: "ISA",
    logo: (
      <svg viewBox="0 0 56 32" className="w-14 h-8" fill="none">
        <path d="M4 4 H52 V28 H4 Z" stroke="currentColor" strokeWidth="1.5" rx="2" />
        <text x="28" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="currentColor" letterSpacing="3">ISA</text>
      </svg>
    ),
  },
  {
    name: "Nutresa",
    logo: (
      <svg viewBox="0 0 84 32" className="w-24 h-8" fill="none">
        <path d="M4 28 V10 L16 4 L28 10 V28" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <text x="58" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="currentColor" letterSpacing="1">NUTRESA</text>
      </svg>
    ),
  },
  {
    name: "Claro",
    logo: (
      <svg viewBox="0 0 68 32" className="w-[68px] h-8" fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1" />
        <text x="46" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="currentColor" letterSpacing="1">CLARO</text>
      </svg>
    ),
  },
  {
    name: "Alpina",
    logo: (
      <svg viewBox="0 0 72 32" className="w-[72px] h-8" fill="none">
        <path d="M4 26 L16 6 L28 26" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 20 H23" stroke="currentColor" strokeWidth="1" />
        <text x="50" y="21" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="600" fill="currentColor" letterSpacing="1">ALPINA</text>
      </svg>
    ),
  },
];

const ClientsSection = () => {
  const loopItems = [...clients, ...clients, ...clients];

  return (
    <section className="relative py-9 border-y border-[hsl(35_10%_12%)] bg-[hsl(30_8%_5%)] overflow-hidden">

      {/* Fade lateral */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10
                      bg-gradient-to-r from-[hsl(30_8%_5%)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10
                      bg-gradient-to-l from-[hsl(30_8%_5%)] to-transparent" />

      {/* Encabezado */}
      <p className="text-center font-body text-[10px] tracking-[0.24em] uppercase font-semibold
                    text-foreground/28 mb-7">
        Empresas que confían en SISO
      </p>

      {/* Carrusel único */}
      <div className="flex overflow-hidden">
        <div
          className="flex items-center gap-14"
          style={{
            animation: "marquee-clients 55s linear infinite",
            width: "max-content",
          }}
        >
          {loopItems.map((c, i) => (
            <div
              key={i}
              title={c.name}
              className="shrink-0 text-white/25 hover:text-white/55 transition-colors duration-500"
            >
              {c.logo}
            </div>
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
