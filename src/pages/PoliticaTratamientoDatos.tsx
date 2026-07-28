import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import sisoLogo from "@/assets/siso-logo.png";

const PoliticaTratamientoDatos = () => {
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
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary font-body font-bold text-xs tracking-[0.15em] uppercase">
            Normativa &amp; Legal
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-[0.95] mb-3">
          POLÍTICA DE <span className="text-gradient-gold">TRATAMIENTO DE DATOS</span>
        </h1>
        <p className="font-body text-sm text-muted-foreground mb-12">
          Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long" })}
        </p>

        <div className="space-y-10 font-body text-[15px] text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">1. Responsable del tratamiento</h2>
            <p>
              SISO — Asesoría y Gestión Empresarial S.A.S. (en adelante, "SISO"), con domicilio en Colombia,
              es responsable del tratamiento de los datos personales que sus clientes, contratistas, aspirantes,
              estudiantes y usuarios del sitio web le suministran en el marco de sus servicios de asesoría,
              consultoría, auditoría, formación y bienestar en Seguridad y Salud en el Trabajo (SST).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">2. Marco normativo</h2>
            <p>
              Esta política se expide en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás
              normas que los modifiquen, reglamenten o sustituyan, que regulan el derecho constitucional que
              tienen todas las personas a conocer, actualizar y rectificar la información que se haya recolectado
              sobre ellas en bases de datos o archivos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">3. Datos que recolectamos</h2>
            <p className="mb-3">Según el servicio solicitado, SISO puede recolectar:</p>
            <ul className="list-disc list-inside space-y-1.5 marker:text-primary">
              <li>Datos de identificación y contacto (nombre, documento, teléfono, correo electrónico, empresa).</li>
              <li>Datos académicos y de formación, para la inscripción y certificación en programas de capacitación.</li>
              <li>Datos laborales y organizacionales, en el marco de procesos de asesoría, consultoría y auditoría.</li>
              <li>Datos de navegación del sitio web, con fines estadísticos y de mejora del servicio.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">4. Finalidad del tratamiento</h2>
            <p className="mb-3">Los datos recolectados se utilizan para:</p>
            <ul className="list-disc list-inside space-y-1.5 marker:text-primary">
              <li>Gestionar la prestación de los servicios de asesoría, consultoría, auditoría, formación y bienestar.</li>
              <li>Expedir certificados y constancias de los programas de formación cursados.</li>
              <li>Atender solicitudes, quejas, reclamos y peticiones (PQRS).</li>
              <li>Enviar información comercial y novedades relacionadas con nuestros servicios, cuando exista autorización previa.</li>
              <li>Dar cumplimiento a obligaciones legales, contractuales y regulatorias aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">5. Derechos de los titulares</h2>
            <p className="mb-3">Como titular de los datos, usted tiene derecho a:</p>
            <ul className="list-disc list-inside space-y-1.5 marker:text-primary">
              <li>Conocer, actualizar y rectificar sus datos personales.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos personales.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
              <li>Revocar la autorización y/o solicitar la supresión de sus datos, cuando no exista un deber legal o contractual que lo impida.</li>
              <li>Acceder de forma gratuita a sus datos personales tratados por SISO.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">6. Procedimiento para ejercer sus derechos</h2>
            <p>
              Las solicitudes de acceso, consulta, rectificación, actualización o supresión de datos personales
              pueden presentarse mediante correo electrónico a{" "}
              <a href="mailto:gerencia@siso.com.co" className="text-primary hover:underline">gerencia@siso.com.co</a>,
              indicando el nombre completo, número de identificación y el detalle de la solicitud. SISO dará
              respuesta dentro de los plazos establecidos por la normatividad vigente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">7. Seguridad de la información</h2>
            <p>
              SISO implementa medidas técnicas, humanas y administrativas razonables para proteger los datos
              personales contra acceso no autorizado, pérdida, alteración o uso indebido.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-foreground mb-3">8. Contacto</h2>
            <p>
              Para cualquier inquietud relacionada con esta política, puede escribirnos a{" "}
              <a href="mailto:gerencia@siso.com.co" className="text-primary hover:underline">gerencia@siso.com.co</a>{" "}
              o comunicarse al +57 318 180 0010.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PoliticaTratamientoDatos;
