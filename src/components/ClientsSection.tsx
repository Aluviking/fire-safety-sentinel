/* ─── Carrusel de clientes ─────────────────────────────────────────────────── */

const clients = [
  { name: "Cemex Colombia",      abbr: "CX" },
  { name: "Bavaria S.A.",        abbr: "BV" },
  { name: "Ecopetrol",           abbr: "EP" },
  { name: "Cementos Argos",      abbr: "AR" },
  { name: "Bancolombia",         abbr: "BC" },
  { name: "Grupo Éxito",         abbr: "GE" },
  { name: "ISA Intercolombia",   abbr: "IS" },
  { name: "Nutresa",             abbr: "NT" },
  { name: "Claro Colombia",      abbr: "CL" },
  { name: "ETB",                 abbr: "ET" },
  { name: "Alpina",              abbr: "AL" },
  { name: "Acerías Paz del Río", abbr: "AP" },
];

/* Logo card individual */
const LogoCard = ({ name, abbr }: { name: string; abbr: string }) => (
  <div
    className="flex items-center gap-3 px-5 py-3 rounded-xl shrink-0
               border border-[hsl(43_78%_50%/0.13)] bg-[hsl(35_10%_8%/0.7)]
               hover:border-[hsl(43_78%_50%/0.35)] hover:bg-[hsl(43_78%_50%/0.05)]
               transition-all duration-300 group select-none"
  >
    {/* Monograma */}
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                 bg-gradient-to-br from-[hsl(40_75%_32%)] to-[hsl(43_78%_46%)]
                 group-hover:from-[hsl(40_78%_38%)] group-hover:to-[hsl(43_82%_54%)]
                 transition-all duration-300"
    >
      <span className="font-display text-[11px] font-bold tracking-wider text-black/80">
        {abbr}
      </span>
    </div>
    {/* Nombre */}
    <span className="font-body text-sm font-medium text-muted-foreground/70
                     group-hover:text-muted-foreground/95 transition-colors duration-300
                     whitespace-nowrap">
      {name}
    </span>
  </div>
);

const ClientsSection = () => {
  /* Duplicamos para el loop infinito */
  const row1 = [...clients, ...clients];
  const row2 = [...clients].reverse();
  const row2Loop = [...row2, ...row2];

  return (
    <section className="relative py-10 border-y border-[hsl(35_10%_12%)] bg-[hsl(30_8%_5%)] overflow-hidden">

      {/* Gradientes laterales para fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10
                      bg-gradient-to-r from-[hsl(30_8%_5%)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10
                      bg-gradient-to-l from-[hsl(30_8%_5%)] to-transparent" />

      {/* Encabezado centrado */}
      <div className="text-center mb-7 px-4">
        <p className="font-body text-[11px] tracking-[0.22em] uppercase font-semibold text-foreground/30">
          Empresas que confían en SISO
        </p>
      </div>

      {/* ── Fila 1: izquierda → ── */}
      <div className="flex overflow-hidden mb-3">
        <div
          className="flex gap-3"
          style={{
            animation: "marquee-left 32s linear infinite",
            width: "max-content",
          }}
        >
          {row1.map((c, i) => (
            <LogoCard key={`r1-${i}`} name={c.name} abbr={c.abbr} />
          ))}
        </div>
      </div>

      {/* ── Fila 2: ← derecha (inversa) ── */}
      <div className="flex overflow-hidden">
        <div
          className="flex gap-3"
          style={{
            animation: "marquee-right 38s linear infinite",
            width: "max-content",
          }}
        >
          {row2Loop.map((c, i) => (
            <LogoCard key={`r2-${i}`} name={c.name} abbr={c.abbr} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
};

export default ClientsSection;
