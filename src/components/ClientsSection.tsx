/* ─── Carrusel premium de clientes ────────────────────────────────────────── */
import logoAchiras from "@/assets/clientes/achiras-gigantenas.png";
import logoAmericana from "@/assets/clientes/americana-de-trenzados.png";
import logoCabarria from "@/assets/clientes/cabarria-iqa.png";
import logoCaoba from "@/assets/clientes/caoba-entertainment.jpg";
import logoChazey from "@/assets/clientes/chazey-partners.png";
import logoCovinoc from "@/assets/clientes/covinoc.png";
import logoFodesep from "@/assets/clientes/fodesep.png";
import logoHelpAndLife from "@/assets/clientes/help-and-life-medical.png";
import logoChefrito from "@/assets/clientes/chefrito.png";
import logoIngeteknia from "@/assets/clientes/ingeteknia.png";
import logoJalo from "@/assets/clientes/jalo-rent.png";
import logoLamerica from "@/assets/clientes/lamerica.png";
import logoModitelas from "@/assets/clientes/moditelas.png";
import logoOpenLogistica from "@/assets/clientes/open-logistica.jpg";
import logoQualitas from "@/assets/clientes/qualitas-seguros.png";
import logoRadioCaribe from "@/assets/clientes/radio-comunicaciones-caribe.jpg";
import logoRehabet from "@/assets/clientes/rehabet.png";
import logoSotecol from "@/assets/clientes/sotecol.jpg";
import logoSoluagro from "@/assets/clientes/soluagro.png";
import logoTourVacation from "@/assets/clientes/tour-vacation.jpg";
import logoTransmares from "@/assets/clientes/transmares.png";
import logoVolador from "@/assets/clientes/volador-colombia.png";

const clients = [
  { name: "Achiras Giganteñas y Productos S.A.S.", logo: logoAchiras },
  { name: "Americana de Trenzados S.A.", logo: logoAmericana },
  { name: "Cabarria IQA S.A.S.", logo: logoCabarria },
  { name: "Caoba Entertainment S.A.S.", logo: logoCaoba },
  { name: "Chazey Partners Colombia SAS", logo: logoChazey },
  { name: "Covinoc", logo: logoCovinoc },
  { name: "Fodesep", logo: logoFodesep },
  { name: "Help and Life Medical SAS", logo: logoHelpAndLife },
  { name: "Chefrito", logo: logoChefrito },
  { name: "Ingeteknia Consultores Ltda.", logo: logoIngeteknia },
  { name: "Jalo Rent SAS", logo: logoJalo },
  { name: "Lamerica CI SAS", logo: logoLamerica },
  { name: "Moditelas", logo: logoModitelas },
  { name: "Open Logística S.A.S.", logo: logoOpenLogistica },
  { name: "Quálitas Compañía de Seguros Colombia S.A.", logo: logoQualitas },
  { name: "Radio Comunicaciones del Caribe Ltda.", logo: logoRadioCaribe },
  { name: "Rehabet", logo: logoRehabet },
  { name: "Sociedad Técnica Colombiana SAS (Sotecol)", logo: logoSotecol },
  { name: "Soluagro Soluciones Agropecuarias S.A.", logo: logoSoluagro },
  { name: "Tour Vacation Hoteles Azul SAS BIC", logo: logoTourVacation },
  { name: "Transmares Logística Integral SAS", logo: logoTransmares },
  { name: "Volador Colombia", logo: logoVolador },
];

/* Tarjeta de logo — fondo blanco, glow dorado al hover */
const LogoCard = ({ name, logo }: { name: string; logo: string }) => (
  <div
    title={name}
    className="shrink-0 w-[110px] h-[76px] sm:w-[130px] sm:h-[88px] flex items-center justify-center
               p-3 sm:p-4 rounded-xl
               bg-white
               border border-[hsl(43_78%_50%/0.12)]
               hover:border-[hsl(43_78%_50%/0.45)]
               hover:shadow-[0_0_22px_hsl(43_78%_50%/0.2)]
               transition-all duration-300"
  >
    <img src={logo} alt={name} className="max-w-full max-h-full object-contain" loading="lazy" />
  </div>
);

const ClientsSection = () => {
  const loopItems = [...clients, ...clients, ...clients];

  return (
    <section className="relative py-10 overflow-hidden bg-[hsl(30_8%_5%)]">

      {/* Línea dorada superior */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />
      {/* Línea dorada inferior */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(43_78%_50%/0.25)] to-transparent" />

      {/* Glow ambiente central */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-32
                      bg-[hsl(43_78%_50%/0.03)] blur-3xl" />

      {/* Fade lateral */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10
                      bg-gradient-to-r from-[hsl(30_8%_5%)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10
                      bg-gradient-to-l from-[hsl(30_8%_5%)] to-transparent" />

      {/* Encabezado con líneas decorativas */}
      <div className="flex items-center justify-center gap-4 mb-8 px-8">
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[hsl(43_78%_50%/0.35)]" />
        <p className="font-body text-[10px] tracking-[0.28em] uppercase font-semibold text-foreground/35 whitespace-nowrap">
          Empresas que confían en SISO
        </p>
        <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[hsl(43_78%_50%/0.35)]" />
      </div>

      {/* Carrusel */}
      <div className="flex overflow-hidden">
        <div
          className="flex items-center gap-4"
          style={{
            animation: "marquee-clients 90s linear infinite",
            width: "max-content",
          }}
        >
          {loopItems.map((c, i) => (
            <LogoCard key={i} name={c.name} logo={c.logo} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-clients {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
};

export default ClientsSection;
