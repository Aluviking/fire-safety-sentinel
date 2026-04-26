import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BadgeCheck } from "lucide-react";

const certs = [
  { name: "IADC",      sub: "Rig Pass",         detail: "International Association of Drilling Contractors" },
  { name: "ISO 9001",  sub: "Calidad",           detail: "Sistema de Gestión de Calidad" },
  { name: "ISO 14001", sub: "Ambiente",          detail: "Sistema de Gestión Ambiental" },
  { name: "ISO 45001", sub: "SST",               detail: "Seguridad y Salud en el Trabajo" },
  { name: "RUC",       sub: "Responsabilidad",   detail: "Registro Único de Contratistas" },
  { name: "OHSAS",     sub: "Seguridad",         detail: "Occupational Health & Safety" },
  { name: "BASC",      sub: "Comercio",          detail: "Business Anti-Smuggling Coalition" },
];

const CertificationsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="certificaciones" className="py-16 sm:py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(43_30%_94%)]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(hsl(43 78% 50% / 0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.4)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.4)] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-[hsl(40_75%_33%)] font-body font-bold text-xs sm:text-sm tracking-[0.18em] uppercase">
            <span className="w-6 h-px bg-[hsl(43_78%_45%)]" />
            Respaldo internacional
            <span className="w-6 h-px bg-[hsl(43_78%_45%)]" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[hsl(30_8%_12%)] leading-[0.9]">
            CERTIFICACIONES{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 35%), hsl(43 78% 48%), hsl(43 92% 58%))" }}
            >
              DE EXCELENCIA
            </span>
          </h2>
          <p className="font-body text-[hsl(30_6%_40%)] max-w-lg mx-auto mt-4 text-base leading-relaxed">
            Sellos internacionales que avalan nuestro compromiso con la calidad, seguridad y cumplimiento normativo en cada proceso.
          </p>
        </motion.div>

        {/* ── Static grid: big cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-10"
        >
          {certs.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
              className="group relative rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "hsl(43 40% 98%)",
                border: "2px solid hsl(43 50% 75% / 0.5)",
                boxShadow: "0 4px 24px hsl(43 78% 50% / 0.08)",
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, hsl(43 78% 50% / 0.08), transparent)" }}
              />
              <BadgeCheck
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 mb-2 sm:mb-3 relative z-10 transition-colors duration-300"
                style={{ color: "hsl(43 78% 42%)" }}
              />
              <span
                className="font-display text-xl sm:text-2xl md:text-3xl leading-none relative z-10 bg-clip-text text-transparent mb-1 sm:mb-2"
                style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 30%), hsl(43 78% 48%))" }}
              >
                {cert.name}
              </span>
              <span className="text-xs sm:text-sm font-body font-semibold text-[hsl(30_6%_35%)] relative z-10">
                {cert.sub}
              </span>
              <span className="text-[10px] sm:text-[11px] font-body text-[hsl(30_6%_50%)] mt-1 sm:mt-1.5 relative z-10 leading-relaxed hidden sm:block">
                {cert.detail}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Badge bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[hsl(43_78%_50%/0.1)] border border-[hsl(43_78%_50%/0.35)]">
            <BadgeCheck className="w-5 h-5 text-[hsl(43_78%_42%)] shrink-0" />
            <span className="font-body text-sm font-semibold text-[hsl(30_6%_30%)] tracking-wide">
              20 años cumpliendo estándares de clase mundial · 2006 – 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationsSection;
