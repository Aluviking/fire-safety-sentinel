import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const PoliticaSST = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[hsl(43_78%_50%/0.15)] bg-[hsl(30_8%_4%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-primary transition-colors justify-self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Link>

          <Link to="/" className="flex flex-col items-center gap-2 group justify-self-center">
            <img src={sisoLogo} alt="SISO Logo" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover glow-gold-sm group-hover:scale-105 transition-transform duration-300" />
            <span
              className="font-display text-2xl sm:text-3xl tracking-[0.1em] bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(40 75% 42%), hsl(43 78% 56%), hsl(43 92% 68%))" }}
            >
              SISO
            </span>
          </Link>

          <span aria-hidden="true" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(43_78%_50%/0.25)] bg-[hsl(43_78%_50%/0.07)] mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary font-body font-bold text-xs tracking-[0.15em] uppercase">
            Normativa &amp; Legal
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-[0.95] mb-3">
          POLÍTICA DE <span className="text-gradient-gold">SEGURIDAD Y SALUD EN EL TRABAJO</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
        </p>

        <div className="space-y-10 font-body text-[15px] text-muted-foreground leading-relaxed">
          <section>
            <p>
              SISO — Asesoría y Gestión Empresarial S.A.S., con 20 años de trayectoria (2006–2026) acompañando
              a entidades públicas y privadas en la gestión integral de la Seguridad y Salud en el Trabajo,
              declara su compromiso con el bienestar de sus colaboradores, contratistas, aprendices y visitantes,
              en cumplimiento del Decreto 1072 de 2015, la Resolución 0312 de 2019 y demás normativa vigente
              en materia de SST en Colombia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">Compromiso de la Alta Dirección</h2>
            <p>
              La Gerencia General de SISO asigna los recursos humanos, técnicos y financieros necesarios para
              el diseño, implementación, evaluación y mejora continua de su Sistema de Gestión de Seguridad y
              Salud en el Trabajo (SG-SST), promoviendo una cultura de autocuidado y prevención en todos los
              niveles de la organización.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">Objetivos</h2>
            <ul className="list-disc list-inside space-y-1.5 marker:text-primary">
              <li>Identificar, evaluar y controlar los peligros y riesgos que puedan afectar la seguridad y salud de los trabajadores.</li>
              <li>Prevenir accidentes de trabajo y enfermedades laborales mediante la intervención de las condiciones de trabajo.</li>
              <li>Cumplir la normatividad nacional vigente en materia de riesgos laborales.</li>
              <li>Garantizar la participación activa de los trabajadores y sus representantes en el SG-SST.</li>
              <li>Promover entornos de trabajo seguros, saludables e inclusivos, y programas de bienestar integral.</li>
              <li>Mejorar continuamente el desempeño del SG-SST a través del seguimiento a indicadores y auditorías periódicas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">Alcance</h2>
            <p>
              Esta política aplica a todos los procesos, sedes, colaboradores directos, contratistas y
              proveedores que desarrollen actividades por cuenta o en representación de SISO, así como a
              las organizaciones clientes que reciben nuestros servicios de asesoría, consultoría, auditoría
              y formación en SST.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">Vigencia</h2>
            <p>
              Esta política será revisada y actualizada periódicamente por la Alta Dirección de SISO, o cuando
              se presenten cambios normativos, organizacionales o de contexto que así lo requieran.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">Contacto</h2>
            <p>
              Para consultas sobre esta política, escríbanos a{" "}
              <a href="mailto:gerencia@siso.com.co" className="text-primary hover:underline">gerencia@siso.com.co</a>{" "}
              o comuníquese al +57 318 180 0010.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PoliticaSST;
