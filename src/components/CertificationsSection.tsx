import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BadgeCheck } from "lucide-react";

const certs = [
  { name: "ISO 9001",  sub: "Calidad" },
  { name: "ISO 14001", sub: "Ambiente" },
  { name: "ISO 45001", sub: "SST" },
  { name: "RUC",       sub: "Responsabilidad" },
  { name: "OHSAS",     sub: "Seguridad" },
  { name: "BASC",      sub: "Comercio" },
  { name: "IADC",      sub: "Rig Pass" },
];

const allCerts = [...certs, ...certs];

const CertificationsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="certificaciones" className="py-14 sm:py-20 relative overflow-hidden" ref={ref}>
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
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 text-[hsl(40_75%_33%)] font-body font-bold text-[10px] sm:text-xs tracking-[0.18em] uppercase">
            <span className="w-5 sm:w-6 h-px bg-[hsl(43_78%_45%)]" />
            Respaldo internacional
            <span className="w-5 sm:w-6 h-px bg-[hsl(43_78%_45%)]" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-[hsl(30_8%_12%)] leading-[0.9]">
            CERTIFICACIONES{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 35%), hsl(43 78% 48%), hsl(43 92% 58%))" }}
            >
              DE EXCELENCIA
            </span>
          </h2>
          <p className="font-body text-[hsl(30_6%_40%)] max-w-lg mx-auto mt-3 text-sm leading-relaxed">
            Sellos internacionales que avalan nuestro compromiso con la calidad, seguridad y cumplimiento normativo en cada proceso.
          </p>
        </motion.div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[hsl(43_30%_94%)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[hsl(43_30%_94%)] to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden">
            <div className="flex gap-3 sm:gap-4 animate-marquee w-max">
              {allCerts.map((cert, i) => (
                <div
                  key={i}
                  className="group relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl shrink-0 flex flex-col items-center justify-center gap-1 transition-all duration-300"
                  style={{
                    background: "hsl(43 40% 96% / 0.9)",
                    border: "1px solid hsl(43 50% 70% / 0.35)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, hsl(43 78% 50% / 0.1), transparent)" }}
                  />
                  <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(43_78%_45%/0.5)] group-hover:text-[hsl(43_78%_45%)] transition-colors" />
                  <span
                    className="font-display text-xl sm:text-2xl leading-none relative z-10 bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 35%), hsl(43 78% 50%))" }}
                  >
                    {cert.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-body text-[hsl(30_6%_45%)] mt-0.5 relative z-10 tracking-wide">
                    {cert.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Badge bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-10"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[hsl(43_78%_50%/0.1)] border border-[hsl(43_78%_50%/0.3)]">
            <BadgeCheck className="w-4 h-4 text-[hsl(43_78%_42%)] shrink-0" />
            <span className="font-body text-[11px] sm:text-xs font-semibold text-[hsl(30_6%_30%)] tracking-wide">
              20 años cumpliendo estándares de clase mundial · 2006 – 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificationsSection;
