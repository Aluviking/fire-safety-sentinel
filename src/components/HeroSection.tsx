import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MessageCircle, Heart, ClipboardCheck, BookOpen, ThumbsUp,
  Building2, GraduationCap,
} from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";
import heroImage from "@/assets/hero-firefighter.jpg";

/* Curva horizontal de los servicios: arco suave izq → centro → izq (en vw) */
const CURVE_VW = [0, 2.2, 4.4, 2.2, 0];

const services = [
  { id: "asesoria",    label: "ASESORÍA",    subs: ["ISO 9001", "ISO 14001", "ISO 45001", "SIG"],                        Icon: MessageCircle, href: "#svc-asesoria"    },
  { id: "consultoria", label: "CONSULTORÍA", subs: ["Gestión en Salud", "Gestión del Riesgo", "Gestión de Amenazas"],    Icon: Heart,         href: "#svc-consultoria" },
  { id: "auditoria",   label: "AUDITORÍA",   subs: ["Internas", "Externas", "Gap Analysis", "Seguimiento"],              Icon: ClipboardCheck, href: "#svc-auditoria"  },
  { id: "formacion",   label: "FORMACIÓN",   subs: ["Cursos", "Diplomados", "Seminarios"],                               Icon: BookOpen,      href: "#svc-formacion"   },
  { id: "bienestar",   label: "BIENESTAR",   subs: ["Clima Laboral", "Salud Mental", "Actividades"],                     Icon: ThumbsUp,      href: "#svc-bienestar"   },
];

/* ─── Curvas + nodos CSS (sin distorsión oval) ───────────────────────────────── */
const ConnectingLines = () => {
  const EPS = [10, 30, 50, 70, 90];
  // Extensión extra en unidades SVG más allá de x=100, proporcional a CURVE_VW
  const EXTEND_X = [0, 18, 36, 18, 0];

  return (
    <div className="relative w-full h-full overflow-visible">
      <style>{`
        @keyframes nodeFade   { 0%,100% { opacity:0.28; } 50% { opacity:0.78; } }
        @keyframes originFade { 0%,100% { opacity:0.55; } 50% { opacity:1;    } }
      `}</style>

      {/* SVG solo para curvas — overflow visible para que se extienda al panel de servicios */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
        overflow="visible"
      >
        {EPS.map((y, i) => (
          <path
            key={i}
            d={`M 0,50 C 55,50 45,${y} ${100 + EXTEND_X[i]},${y}`}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.1"
            strokeDasharray="3 2.8"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Nodo origen — div CSS, siempre circular */}
      <div
        className="absolute left-0 top-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          animation: "originFade 3s ease-in-out infinite",
        }}
      >
        <div className="absolute -inset-[7px] rounded-full border border-[hsl(43,78%,52%)] opacity-30" />
        <div className="w-[7px] h-[7px] rounded-full bg-gradient-to-br from-[hsl(44,90%,74%)] to-[hsl(32,80%,50%)]" />
      </div>

      {/* Nodos destino — desplazados horizontalmente según la curva de cada fila */}
      {EPS.map((yPct, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${yPct}%`,
            left: `calc(100% + ${CURVE_VW[i]}vw)`,
            transform: "translate(-50%, -50%)",
            animation: `nodeFade 3s ease-in-out ${i * 0.42}s infinite`,
          }}
        >
          <div className="absolute -inset-[7px] rounded-full border border-[hsl(43,78%,52%)] opacity-25" />
          <div className="w-[7px] h-[7px] rounded-full bg-gradient-to-br from-[hsl(44,90%,72%)] to-[hsl(26,78%,44%)]" />
        </div>
      ))}
    </div>
  );
};

/* ─── HERO ──────────────────────────────────────────────────────────────────── */
const HeroSection = () => (
  <section
    id="inicio"
    className="relative isolate h-[100svh] min-h-[560px] flex flex-col overflow-hidden bg-[#0a0a0a]"
  >
    {/* Bombero de fondo */}
    <div className="absolute inset-0 z-0 pointer-events-none">
      <img src={heroImage} alt="" aria-hidden="true"
        className="w-full h-full object-cover object-[68%_center]"
        loading="eager" fetchPriority="high" />
      <div className="absolute inset-0 bg-black/72" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/92 via-transparent to-[#0a0a0a]/30" />
    </div>

    {/* Barra dorada izquierda */}
    <div className="absolute z-[1] left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b from-[hsl(43_78%_50%)] via-[hsl(43_78%_50%/0.65)] to-transparent pointer-events-none" />

    {/* Glow ambiente */}
    <div className="absolute z-[1] top-1/3 left-[22%] w-[480px] h-[480px] rounded-full bg-[hsl(43_78%_50%/0.055)] blur-[130px] pointer-events-none" />

    {/* CONTENIDO */}
    <div
      className="relative z-10 flex-1 flex flex-col w-full min-h-0"
      style={{
        paddingTop:    "clamp(10px,1.4vh,20px)",
        paddingBottom: "clamp(10px,1.4vh,20px)",
        paddingLeft:   "clamp(22px,6vw,110px)",
        paddingRight:  "clamp(16px,2.8vw,56px)",
      }}
    >
      {/* GRID principal */}
      <div
        className="flex-1 flex flex-col xl:flex-row xl:items-stretch min-h-0"
        style={{ gap: "clamp(6px,1vh,14px)" }}
      >

        {/* ── COLUMNA IZQUIERDA ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-row items-center justify-center
                     xl:flex-col xl:items-center xl:text-center xl:justify-center
                     xl:w-[200px] 2xl:w-[240px] xl:shrink-0"
          style={{ gap: "clamp(10px,2vw,16px)" }}
        >
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="absolute -inset-5 rounded-full bg-[hsl(43_78%_50%/0.16)] blur-2xl pointer-events-none" />
            <div className="absolute -inset-2.5 rounded-full border-2 border-dashed border-[hsl(43_78%_50%/0.28)] pointer-events-none" />
            <div className="absolute -inset-1 rounded-full border border-[hsl(43_78%_50%/0.5)] pointer-events-none" />
            <img src={sisoLogo} alt="SISO Logo"
              className="relative rounded-full object-cover
                         border-[3px] border-[hsl(43_78%_50%/0.65)]
                         shadow-[0_0_80px_hsl(43_78%_50%/0.35),0_0_30px_hsl(43_78%_50%/0.5)]
                         w-[clamp(48px,10vh,120px)] h-[clamp(48px,10vh,120px)]
                         xl:w-[clamp(110px,23vh,200px)] xl:h-[clamp(110px,23vh,200px)]"
            />
          </div>

          {/* SISO + badge + tagline */}
          <div className="flex flex-col items-start xl:items-center"
               style={{ gap: "clamp(4px,0.8vh,16px)" }}>
            <h1 className="font-display tracking-[0.14em] text-gradient-gold leading-none
                           text-[clamp(2rem,6vh,5rem)] xl:text-[clamp(3rem,18vh,9.5rem)]">
              SISO
            </h1>

            {/* Badge 20 años + Tagline */}
            <div className="flex flex-col items-start xl:items-center"
                 style={{ gap: "clamp(4px,0.7vh,10px)" }}>
              <div className="inline-flex items-center gap-2 px-3.5 rounded-full
                              border border-[hsl(43_78%_50%/0.45)] bg-[hsl(43_78%_50%/0.09)]"
                   style={{ paddingTop: "clamp(5px,0.9vh,11px)", paddingBottom: "clamp(5px,0.9vh,11px)" }}>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                <span className="font-body font-bold tracking-[0.16em] text-primary uppercase"
                      style={{ fontSize: "clamp(12px,1.8vh,18px)" }}>
                  20 AÑOS
                </span>
                <span className="text-[hsl(43_78%_50%/0.45)]" style={{ fontSize: "11px" }}>✦</span>
                <span className="font-body text-primary/75"
                      style={{ fontSize: "clamp(12px,1.8vh,18px)" }}>
                  2006 – 2026
                </span>
              </div>

              <p className="font-body text-muted-foreground/85 leading-snug"
                 style={{ fontSize: "clamp(13px,1.9vh,19px)" }}>
                Asesoría y Gestión Empresarial S.A.S.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── SVG CURVAS — ancho real para que se aprecien ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 0.5 }}
          className="hidden xl:block xl:w-[160px] 2xl:w-[210px] shrink-0 self-stretch relative z-20"
        >
          <ConnectingLines />
        </motion.div>

        {/* ── SERVICIOS ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {services.map((svc, i) => (
            <motion.a
              key={svc.id}
              href={svc.href}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.56, delay: 0.18 + i * 0.08, ease: "easeOut" }}
              whileHover={{ x: 4, scale: 1.013, transition: { type: "spring", stiffness: 520, damping: 28 } }}
              className="flex items-center flex-1 min-h-0
                         border-b border-[hsl(43_78%_50%/0.12)] last:border-0
                         hover:bg-[hsl(43_78%_50%/0.04)]
                         transition-colors duration-150 group"
              style={{
                gap:          "clamp(10px,2vh,22px)",
                paddingLeft:  `calc(clamp(8px, 2vw, 36px) + ${CURVE_VW[i]}vw)`,
                paddingRight: "clamp(8px,2vw,36px)",
              }}
            >
              {/* Icono borde punteado */}
              <div className="rounded-full shrink-0 flex items-center justify-center
                              border-2 border-dashed border-[hsl(43_78%_50%/0.55)]
                              bg-[hsl(43_78%_50%/0.06)]
                              group-hover:border-[hsl(43_78%_50%/0.9)]
                              group-hover:bg-[hsl(43_78%_50%/0.14)]
                              group-hover:shadow-[0_0_34px_hsl(43_78%_50%/0.35)]
                              group-hover:scale-[1.16]
                              transition-all duration-150"
                   style={{ width: "clamp(32px,8.5vh,82px)", height: "clamp(32px,8.5vh,82px)" }}>
                <svc.Icon className="text-primary group-hover:scale-110 transition-transform duration-150"
                  style={{ width: "clamp(13px,3.8vh,36px)", height: "clamp(13px,3.8vh,36px)" }} />
              </div>

              {/* Nombre | línea punteada | bullets | número */}
              <div className="min-w-0 flex-1 flex items-center overflow-hidden" style={{ gap: "clamp(5px,1.2vw,22px)" }}>

                <p className="svc-label-size font-display tracking-[0.14em] leading-tight shrink-0
                               text-[hsl(43_90%_60%)] group-hover:text-[hsl(43_90%_70%)]
                               transition-colors duration-200">
                  {svc.label}
                </p>

                <div className="flex-1 self-center border-b border-dashed border-[hsl(43_78%_50%/0.2)]
                                group-hover:border-[hsl(43_78%_50%/0.38)] transition-colors duration-200" />

                <ul className="font-body text-white/75 leading-snug shrink-0 text-right
                               group-hover:text-white/92 transition-colors duration-200"
                    style={{ fontSize: "clamp(10px,1.8vh,14px)", minWidth: "clamp(60px,14vw,280px)" }}>
                  {svc.subs.map((sub) => (
                    <li key={sub}
                        className="overflow-hidden text-ellipsis whitespace-nowrap
                                   xl:whitespace-normal xl:overflow-visible">
                      {sub}
                    </li>
                  ))}
                </ul>

                <span className="hidden xl:inline shrink-0 font-display leading-none select-none
                                 text-primary/10 group-hover:text-primary/24 transition-colors duration-200"
                      style={{ fontSize: "clamp(17px,5vh,44px)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </motion.a>
          ))}

          {/* ── BOTONES CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex gap-3 border-t border-[hsl(43_78%_50%/0.18)] flex-wrap"
            style={{
              paddingTop:   "clamp(8px,1.3vh,16px)",
              paddingBottom:"clamp(4px,0.8vh,10px)",
              paddingLeft:  "clamp(8px,2vw,36px)",
              paddingRight: "clamp(8px,2vw,36px)",
            }}
          >
            {/* Portal Empresarial — sólido dorado con shimmer */}
            <Link
              to="/portal"
              className="group relative flex-1 min-w-[160px] overflow-hidden
                         flex items-center gap-0
                         bg-gradient-to-r from-[hsl(40_82%_46%)] to-[hsl(44_80%_54%)]
                         text-black font-body font-extrabold
                         shadow-[0_4px_22px_hsl(43_78%_50%/0.45),inset_0_1px_0_rgba(255,255,255,0.28)]
                         hover:shadow-[0_6px_30px_hsl(43_78%_50%/0.62)]
                         hover:brightness-105 active:scale-[0.97] transition-all duration-200"
              style={{
                borderRadius: "clamp(8px,1.1vh,13px)",
                fontSize: "clamp(11px,1.7vh,15px)",
              }}
            >
              {/* Icon badge */}
              <span className="flex items-center justify-center bg-black/18 self-stretch shrink-0
                               border-r border-black/12"
                    style={{ padding: "clamp(9px,1.5vh,16px) clamp(12px,1.5vw,18px)" }}>
                <Building2 style={{ width: "clamp(15px,2.1vh,20px)", height: "clamp(15px,2.1vh,20px)" }} />
              </span>
              <span className="flex-1 text-center tracking-[0.08em] uppercase"
                    style={{ padding: "clamp(9px,1.5vh,16px) clamp(10px,1.2vw,16px)" }}>
                Portal Empresarial
              </span>
              {/* Shimmer */}
              <span className="absolute inset-0 -skew-x-12 -translate-x-full
                               group-hover:translate-x-full pointer-events-none
                               bg-gradient-to-r from-transparent via-white/22 to-transparent
                               transition-transform duration-700" />
            </Link>

            {/* Campus Virtual — oscuro con borde dorado */}
            <a
              href="https://site2.q10.com/login?ReturnUrl=%2F&aplentId=0d310659-db68-4e7b-af78-aa3ab62eb1f2"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-1 min-w-[140px] overflow-hidden
                         flex items-center gap-0
                         bg-[#0f0f0f] border-2 border-[hsl(43_78%_50%/0.65)]
                         text-[hsl(43_85%_63%)] font-body font-extrabold
                         hover:border-[hsl(43_78%_50%)] hover:bg-[hsl(43_78%_50%/0.07)]
                         hover:text-[hsl(43_88%_70%)]
                         active:scale-[0.97] transition-all duration-200"
              style={{
                borderRadius: "clamp(8px,1.1vh,13px)",
                fontSize: "clamp(11px,1.7vh,15px)",
              }}
            >
              <span className="flex items-center justify-center bg-[hsl(43_78%_50%/0.1)] self-stretch shrink-0
                               border-r border-[hsl(43_78%_50%/0.25)]"
                    style={{ padding: "clamp(9px,1.5vh,16px) clamp(12px,1.5vw,18px)" }}>
                <GraduationCap style={{ width: "clamp(15px,2.1vh,20px)", height: "clamp(15px,2.1vh,20px)" }} />
              </span>
              <span className="flex-1 text-center tracking-[0.08em] uppercase"
                    style={{ padding: "clamp(9px,1.5vh,16px) clamp(10px,1.2vw,16px)" }}>
                Campus Virtual
              </span>
            </a>
          </motion.div>
        </div>

      </div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.0 }}
        className="flex flex-wrap border-t border-[hsl(43_78%_50%/0.15)]"
        style={{ marginTop: "clamp(4px,0.8vh,10px)", paddingTop: "clamp(4px,0.8vh,10px)" }}
      >
        {[
          { value: "500+", label: "Brigadas formadas" },
          { value: "20",   label: "Años de experiencia" },
          { value: "98%",  label: "Satisfacción cliente" },
        ].map((s, i) => (
          <div key={s.label} className="flex items-center">
            {i > 0 && (
              <div className="bg-[hsl(43_78%_50%/0.2)]"
                   style={{ width:"1px", height:"clamp(18px,2.8vh,32px)", margin:"0 clamp(14px,2.5vw,30px)" }} />
            )}
            <div>
              <p className="font-display text-gradient-gold leading-none"
                 style={{ fontSize: "clamp(16px,3.4vh,30px)" }}>{s.value}</p>
              <p className="font-body text-muted-foreground tracking-wide"
                 style={{ fontSize: "clamp(9px,1vh,11px)", marginTop: "clamp(1px,0.3vh,4px)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

    </div>
  </section>
);

export default HeroSection;
