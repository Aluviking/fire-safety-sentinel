import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Award, Clock, ThumbsUp, BadgeCheck } from "lucide-react";

const stats = [
  { value: 500, suffix: "+", label: "Brigadas Formadas",         icon: Award,      desc: "en todo el país" },
  { value: 20,  suffix: "",  label: "Años de Experiencia",       icon: Clock,      desc: "2006 – 2026" },
  { value: 98,  suffix: "%", label: "Satisfacción de Clientes",  icon: ThumbsUp,   desc: "tasa de aprobación" },
  { value: 5,   suffix: "",  label: "Certificaciones Internac.", icon: BadgeCheck, desc: "normas cumplidas" },
];

const Counter = ({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span className="font-display text-4xl sm:text-5xl md:text-6xl tabular-nums text-[hsl(43_15%_93%)]">
      {count}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(40_75%_16%)] via-[hsl(43_78%_22%)] to-[hsl(40_75%_16%)]" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_92%_64%/0.5)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_92%_64%/0.5)] to-transparent" />
      <div className="hidden sm:flex absolute inset-0 items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[250px] rounded-full bg-[hsl(43_78%_50%/0.1)] blur-[70px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.09 }}
                className="flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl border border-[hsl(43_92%_64%/0.15)] bg-[hsl(43_78%_50%/0.06)]"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(43_92%_64%/0.15)] flex items-center justify-center mb-3 shrink-0">
                  <Icon className="w-5 h-5 text-[hsl(43_92%_64%)]" />
                </div>
                <Counter target={stat.value} suffix={stat.suffix} inView={isInView} />
                <p className="font-body font-semibold text-[hsl(43_15%_90%)] mt-1.5 text-[12px] sm:text-sm leading-tight">
                  {stat.label}
                </p>
                <p className="font-body text-[hsl(43_30%_60%)] text-[10px] sm:text-[11px] mt-0.5">
                  {stat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
