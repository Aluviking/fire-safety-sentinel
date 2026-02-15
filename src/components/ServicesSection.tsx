import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, BookOpen, Search, HeartPulse } from "lucide-react";

const services = [
  {
    icon: BookOpen,
    title: "FORMACIÓN DE BRIGADAS",
    description:
      "Fortalecemos la capacidad de respuesta ante emergencias con procesos formativos alineados a la normativa vigente.",
  },
  {
    icon: HeartPulse,
    title: "CAPACITACIÓN & ENTRENAMIENTO",
    description:
      "Formación especializada en RCP, uso del DEA, manejo de vía aérea y soporte vital con simuladores certificados.",
  },
  {
    icon: Search,
    title: "AUDITORÍAS DE SEGURIDAD",
    description:
      "Planeación, ejecución y seguimiento bajo estándares ISO, RUC, OHSAS, IADC RIG PASS y BASC.",
  },
  {
    icon: Shield,
    title: "CONSULTORÍA EMPRESARIAL",
    description:
      "Asesoría integral en sistemas de gestión de seguridad y salud en el trabajo para su organización.",
  },
];

const ServicesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="servicios" className="section-padding bg-gradient-dark relative" ref={ref}>
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
            Qué hacemos
          </span>
          <h2 className="font-display text-5xl md:text-7xl mt-3 text-foreground">
            NUESTROS <span className="text-gradient-fire">SERVICIOS</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative bg-gradient-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 to-transparent" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-2xl text-foreground mb-3 tracking-wide">
                  {service.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
