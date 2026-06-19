import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";

const certs = [
  { name: "IADC",      sub: "Rig Pass",         detail: "International Association of Drilling Contractors" },
  { name: "ISO 9001",  sub: "Calidad",           detail: "Sistema de Gestión de Calidad" },
  { name: "ISO 14001", sub: "Ambiente",          detail: "Sistema de Gestión Ambiental" },
  { name: "ISO 45001", sub: "SST",               detail: "Seguridad y Salud en el Trabajo" },
  { name: "RUC",       sub: "Responsabilidad",   detail: "Registro Único de Contratistas" },
  { name: "OHSAS",     sub: "Seguridad",         detail: "Occupational Health & Safety" },
  { name: "BASC",      sub: "Comercio",          detail: "Business Anti-Smuggling Coalition" },
];

/* Tarjeta individual del carrusel */
const CertCard = ({ name, sub, detail }: { name: string; sub: string; detail: string }) => (
  <div
    className="shrink-0 flex flex-col items-center text-center
               w-52 px-6 py-7 rounded-2xl
               border border-[hsl(43_78%_50%/0.16)]
               bg-[hsl(35_10%_9%/0.9)]
               hover:border-[hsl(43_78%_50%/0.45)]
               hover:bg-[hsl(43_78%_50%/0.06)]
               hover:shadow-[0_0_28px_hsl(43_78%_50%/0.18),inset_0_1px_0_hsl(43_78%_50%/0.1)]
               transition-all duration-300 group cursor-default"
  >
    {/* Icono */}
    <div className="w-12 h-12 rounded-xl bg-[hsl(43_78%_50%/0.1)] flex items-center justify-center mb-4
                    group-hover:bg-[hsl(43_78%_50%/0.18)] transition-colors duration-300">
      <BadgeCheck className="w-6 h-6 text-primary/70 group-hover:text-primary transition-colors duration-300" />
    </div>

    {/* Nombre — display grande y legible */}
    <span
      className="font-display text-3xl leading-none mb-2 bg-clip-text text-transparent"
      style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 58%), hsl(43 92% 70%))" }}
    >
      {name}
    </span>

    {/* Sub-título */}
    <span className="font-body text-sm font-bold text-primary/60 tracking-[0.14em] uppercase mb-2">
      {sub}
    </span>

    {/* Detalle */}
    <span className="font-body text-sm text-muted-foreground/70 leading-relaxed">
      {detail}
    </span>
  </div>
);

const CertificationsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const loopItems = [...certs, ...certs, ...certs];

  return (
    <section id="certificaciones" className="py-20 sm:py-28 relative overflow-hidden bg-[hsl(30_8%_6%)]" ref={ref}>

      {/* Líneas decorativas */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.3)] to-transparent" />

      {/* Glow ambiente */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-64
                      bg-[hsl(43_78%_50%/0.03)] blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[hsl(43_78%_50%/0.5)]" />
            <span className="font-body text-xs font-bold tracking-[0.22em] uppercase text-primary/55">
              Respaldo internacional
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[hsl(43_78%_50%/0.5)]" />
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9] mb-4">
            CERTIFICACIONES{" "}
            <span className="text-gradient-gold">DE EXCELENCIA</span>
          </h2>

          <p className="font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Sellos internacionales que avalan nuestro compromiso con la calidad,
            seguridad y cumplimiento normativo en cada proceso.
          </p>
        </motion.div>
      </div>

      {/* Carrusel — full width fuera del max-w */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative"
      >
        {/* Fade lateral */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 z-10
                        bg-gradient-to-r from-[hsl(30_8%_6%)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 z-10
                        bg-gradient-to-l from-[hsl(30_8%_6%)] to-transparent" />

        <div className="flex overflow-hidden py-2">
          <div
            className="flex gap-4"
            style={{
              animation: "marquee-certs 48s linear infinite",
              width: "max-content",
            }}
          >
            {loopItems.map((c, i) => (
              <CertCard key={i} name={c.name} sub={c.sub} detail={c.detail} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Badge bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center mt-12"
      >
        <div className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full
                        bg-[hsl(43_78%_50%/0.08)] border border-[hsl(43_78%_50%/0.3)]">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <span className="font-body text-sm font-semibold text-foreground/80 tracking-wide">
            20 años cumpliendo estándares de clase mundial · 2006 – 2026
          </span>
        </div>
      </motion.div>

      <style>{`
        @keyframes marquee-certs {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

export default CertificationsSection;
