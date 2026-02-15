import { motion } from "framer-motion";
import { ChevronDown, Shield, Flame } from "lucide-react";
import heroImage from "@/assets/hero-firefighter.jpg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Bombero profesional con equipo de seguridad"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Animated fire particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              bottom: "10%",
            }}
            animate={{
              y: [0, -200, -400],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-gradient-fire" />
            <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
              Seguridad & Excelencia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] mb-6"
          >
            <span className="text-foreground">PROTEGEMOS</span>
            <br />
            <span className="text-gradient-fire">LO QUE</span>
            <br />
            <span className="text-foreground">IMPORTA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg text-muted-foreground font-body max-w-lg mb-10 leading-relaxed"
          >
            Auditorías de seguridad, formación de brigadas de emergencia y consultoría especializada bajo los más altos estándares internacionales.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#servicios"
              className="group flex items-center gap-3 bg-gradient-fire text-primary-foreground px-8 py-4 rounded-lg font-body font-bold text-base hover:opacity-90 transition-all glow-fire-sm"
            >
              <Flame className="w-5 h-5" />
              Nuestros Servicios
            </a>
            <a
              href="#auditorias"
              className="flex items-center gap-3 border border-primary/30 text-foreground px-8 py-4 rounded-lg font-body font-semibold text-base hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              <Shield className="w-5 h-5 text-primary" />
              Solicitar Auditoría
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-primary/60" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
