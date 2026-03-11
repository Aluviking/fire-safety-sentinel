import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    text: "Llevo varios años trabajando con este equipo y siempre han demostrado un compromiso inquebrantable. La comunicación es constante y clara, y los resultados hablan por sí solos.",
    name: "Mariana Gómez",
    role: "Directora de Operaciones",
    initials: "MG",
  },
  {
    text: "Me impresionó la calidad de la formación y la seriedad con la que abordan cada proceso. Son una empresa con altos estándares y un trato humano excepcional.",
    name: "Laura Castaño",
    role: "Gerente de Seguridad Industrial",
    initials: "LC",
  },
  {
    text: "Desde el primer contacto me sentí respaldado por profesionales. Su enfoque estructurado y su puntualidad en cada entrega me dieron la confianza que buscaba.",
    name: "Carlos Ramírez",
    role: "Coordinador HSEQ",
    initials: "CR",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);

  return (
    <section id="testimonios" className="section-padding relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[hsl(35_10%_10%)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.15)] to-transparent" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[hsl(43_78%_50%/0.04)] blur-[90px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="section-label justify-center mb-4 block">
            <span className="w-5 sm:w-6 h-px bg-primary" />
            Lo que dicen de nosotros
            <span className="w-5 sm:w-6 h-px bg-primary" />
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground">
            TESTIMONIOS
          </h2>
        </motion.div>

        {/* Desktop: 3 cards — Mobile: carousel */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl hover:glass-card-hover transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              <div className="h-[2px] bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)]" />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-primary text-primary" />)}
                </div>
                <Quote className="w-7 h-7 text-[hsl(43_78%_50%/0.2)] mb-3" />
                <blockquote className="font-body text-[13px] text-foreground/80 leading-[1.75] italic flex-1 mb-6">
                  "{t.text}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-body font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(40 75% 28%), hsl(43 78% 48%))", color: "hsl(43 15% 93%)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground text-[13px]">{t.name}</p>
                    <p className="font-body text-muted-foreground text-[11px] mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: single card carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="md:hidden"
        >
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-[hsl(40_75%_28%)] via-[hsl(43_78%_50%)] to-[hsl(43_92%_64%)]" />
            <div className="p-6">
              <div className="flex gap-0.5 mb-4">
                {[1,2,3,4,5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-primary text-primary" />)}
              </div>
              <Quote className="w-7 h-7 text-[hsl(43_78%_50%/0.2)] mb-3" />
              <motion.blockquote
                key={current}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="font-body text-[14px] text-foreground/80 leading-[1.75] italic mb-6"
              >
                "{testimonials[current].text}"
              </motion.blockquote>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-body font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(40 75% 28%), hsl(43 78% 48%))", color: "hsl(43 15% 93%)" }}
                >
                  {testimonials[current].initials}
                </div>
                <div>
                  <p className="font-body font-semibold text-foreground text-[13px]">{testimonials[current].name}</p>
                  <p className="font-body text-muted-foreground text-[11px] mt-0.5">{testimonials[current].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border border-[hsl(43_78%_50%/0.25)] flex items-center justify-center hover:border-[hsl(43_78%_50%/0.5)] active:scale-95 transition-all touch-manipulation"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all touch-manipulation ${i === current ? "w-7 bg-primary" : "w-2 bg-muted-foreground/30"}`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-11 h-11 rounded-full border border-[hsl(43_78%_50%/0.25)] flex items-center justify-center hover:border-[hsl(43_78%_50%/0.5)] active:scale-95 transition-all touch-manipulation"
              aria-label="Siguiente"
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
