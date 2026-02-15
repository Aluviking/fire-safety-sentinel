import { Flame } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-display text-2xl text-gradient-fire tracking-wider">SISO</span>
          <span className="text-xs text-muted-foreground font-body">
            Asesoría y Gestión Empresarial SAS
          </span>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          © {new Date().getFullYear()} SISO. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
