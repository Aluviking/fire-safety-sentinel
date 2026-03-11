import { motion } from "framer-motion";
import { Shield, ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-firefighter.jpg";

// Reduced to 8 particles for better mobile performance
const ashParticles = [
  { w: 3, h: 3, left: 7,  bottom: 12, delay: 0,   dur: 13, dX: [0,  22,  10] },
  { w: 2, h: 2, left: 16, bottom: 28, delay: 1.8, dur: 10, dX: [0, -18,  -8] },
  { w: 1, h: 1, left: 37, bottom: 22, delay: 2.4, dur: 11, dX: [0, -24, -12] },
  { w: 2, h: 2, left: 46, bottom: 35, delay: 1.1, dur: 14, dX: [0,  18,  32] },
  { w: 3, h: 3, left: 63, bottom: 26, delay: 0.7, dur: 12, dX: [0,  10,  24] },
  { w: 2, h: 2, left: 72, bottom: 9,  delay: 2.2, dur: 15, dX: [0, -22, -38] },
  { w: 3, h: 3, left: 11, bottom: 40, delay: 3.4, dur: 8,  dX: [0, -11, -26] },
  { w: 1, h: 1, left: 81, bottom: 19, delay: 1.6, dur: 10, dX: [0,  16,   9] },
];

const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* ── Imagen de fondo ── */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Bombero profesional con equipo de seguridad"
          className="w-full h-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(30_8%_4%/0.97)] via-[hsl(30_8%_6%/0.85)] to-[hsl(40_25%_12%/0.5)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(30_8%_5%/0.5)] via-transparent to-transparent" />
      </div>

      {/* ── Orbs — solo visibles en pantallas grandes ── */}
      <div className="hidden md:block absolute top-1/3 right-[18%] w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.06)] blur-[100px] pointer-events-none" />
      <div className="hidden md:block absolute bottom-1/4 right-[6%] w-[240px] h-[240px] rounded-full bg-[hsl(43_92%_64%/0.04)] blur-[70px] pointer-events-none" />

      {/* ── Partículas — hidden on mobile for performance ── */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden">
        {ashParticles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[hsl(43_78%_50%/0.45)]"
            style={{ width: p.w, height: p.h, left: `${p.left}%`, bottom: `${p.bottom}%`, filter: "blur(0.4px)" }}
            animate={{ y: [0, -220, -460], x: p.dX, opacity: [0, 0.5, 0], scale: [0.5, 1.1, 0.3] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── Contenido ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-2xl">

          {/* Badge pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[hsl(43_78%_50%/0.3)] bg-[hsl(43_78%_50%/0.08)] backdrop-blur-sm flex-wrap"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-primary font-body font-bold text-[10px] sm:text-xs tracking-[0.15em] uppercase whitespace-nowrap">
              20 Años · 2006–2026
            </span>
            <span className="hidden sm:inline text-[hsl(43_78%_50%/0.5)] text-[10px]">✦</span>
            <span className="hidden sm:inline text-primary/70 font-body text-[10px] sm:text-xs">
              Seguridad &amp; Excelencia
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="font-display leading-[0.88] mb-5 sm:mb-7 tracking-wide"
            style={{ fontSize: "clamp(2.8rem, 11vw, 7.5rem)" }}
          >
            <span className="text-foreground">PROTEGEMOS</span>
            <br />
            <span className="text-gradient-gold">LO QUE</span>
            <br />
            <span className="text-foreground">IMPORTA</span>
          </motion.h1>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="text-sm sm:text-[15px] text-muted-foreground font-body max-w-md mb-7 sm:mb-9 leading-[1.75]"
          >
            Formación de brigadas, consultoría en salud laboral, asesoría en SIG
            y bienestar empresarial. Soluciones integrales en SST alineadas con
            la normativa colombiana e internacional.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col xs:flex-row flex-wrap gap-3"
          >
            <a
              href="#servicios"
              className="group relative inline-flex items-center justify-center gap-2 bg-gradient-fire text-primary-foreground px-6 sm:px-8 py-3.5 rounded-xl font-body font-bold text-sm hover:opacity-90 active:scale-95 transition-all glow-gold-sm overflow-hidden btn-shimmer w-full xs:w-auto"
            >
              Nuestros Servicios
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 border border-[hsl(43_78%_50%/0.25)] bg-[hsl(43_78%_50%/0.06)] backdrop-blur-sm text-foreground/85 px-6 sm:px-8 py-3.5 rounded-xl font-body font-semibold text-sm hover:border-[hsl(43_78%_50%/0.45)] hover:text-foreground active:scale-95 transition-all w-full xs:w-auto"
            >
              <Shield className="w-4 h-4 text-primary shrink-0" />
              Solicitar Asesoría
            </a>
          </motion.div>

          {/* Micro-stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.0 }}
            className="flex flex-wrap gap-y-4 mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-[hsl(43_78%_50%/0.12)]"
          >
            {[
              { value: "500+", label: "Brigadas formadas" },
              { value: "20",   label: "Años de experiencia" },
              { value: "98%",  label: "Satisfacción cliente" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && <div className="w-px h-9 bg-[hsl(43_78%_50%/0.15)] mx-5 sm:mx-7" />}
                <div>
                  <p className="font-display text-2xl sm:text-3xl text-gradient-gold leading-none">{s.value}</p>
                  <p className="font-body text-[11px] text-muted-foreground mt-1 tracking-wide">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.25 }}
            className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6 sm:mt-8"
          >
            <div className="flex -space-x-1.5 shrink-0">
              {["MG", "LC", "CR"].map((init) => (
                <div
                  key={init}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(40_75%_30%)] to-[hsl(43_78%_48%)] border-2 border-background flex items-center justify-center text-[9px] font-body font-bold text-[hsl(43_15%_93%)]"
                >
                  {init}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {[1,2,3,4,5].map(n => <Star key={n} className="w-3 h-3 fill-primary text-primary" />)}
            </div>
            <span className="text-[11px] font-body text-muted-foreground">
              +500 empresas confían en SISO
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
