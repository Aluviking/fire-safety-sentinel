import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    text: "Llevo varios años trabajando con este equipo y siempre han demostrado un compromiso inquebrantable. La comunicación es constante y clara, y los resultados hablan por sí solos.",
    name: "Mariana Gómez",
    role: "Directora de Operaciones",
  },
  {
    text: "Me impresionó la calidad de la formación y la seriedad con la que abordan cada proceso. Son una empresa con altos estándares y un trato humano excepcional.",
    name: "Laura Castaño",
    role: "Gerente de Seguridad Industrial",
  },
  {
    text: "Desde el primer contacto me sentí respaldado por profesionales. Su enfoque estructurado y su puntualidad en cada entrega me dieron la confianza que buscaba.",
    name: "Carlos Ramírez",
    role: "Coordinador HSEQ",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonios" className="section-padding relative" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-body font-semibold text-sm tracking-widest uppercase">
            Lo que dicen de nosotros
          </span>
          <h2 className="font-display text-5xl md:text-6xl mt-3 mb-14 text-foreground">
            TESTIMONIOS
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <Quote className="w-12 h-12 text-primary/20 mx-auto mb-6" />

          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <blockquote className="font-body text-xl md:text-2xl text-foreground leading-relaxed italic mb-8">
              "{testimonials[current].text}"
            </blockquote>
            <div>
              <p className="font-body font-bold text-foreground">{testimonials[current].name}</p>
              <p className="font-body text-sm text-muted-foreground">{testimonials[current].role}</p>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current ? "bg-primary w-8" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-border hover:border-primary/40 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
