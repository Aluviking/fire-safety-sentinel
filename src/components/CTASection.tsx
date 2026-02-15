import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contacto" className="section-padding relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
            Hablemos
          </span>
          <h2 className="font-display text-5xl md:text-7xl mt-3 text-foreground">
            ¿LISTO PARA <span className="text-gradient-fire">PROTEGER</span><br />SU ORGANIZACIÓN?
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Phone, label: "Llámenos", value: "+57 300 000 0000" },
            { icon: Mail, label: "Escríbanos", value: "info@siso.com.co" },
            { icon: MapPin, label: "Visítenos", value: "Colombia" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gradient-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-all"
            >
              <item.icon className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="font-body font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <a
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-fire text-primary-foreground px-10 py-5 rounded-xl font-body font-bold text-lg hover:opacity-90 transition-all glow-fire group"
          >
            Quiero Capacitarme
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="mt-4 text-sm text-muted-foreground font-body">
            Respuesta en menos de 24 horas
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
