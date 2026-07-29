import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Maintenance from "./pages/Maintenance";

const NotFound = lazy(() => import("./pages/NotFound"));
const PoliticaTratamientoDatos = lazy(() => import("./pages/PoliticaTratamientoDatos"));
const PoliticaSST = lazy(() => import("./pages/PoliticaSST"));

// Muestra la pantalla de mantenimiento en TODO el sitio mientras se trabaja.
// Para volver a publicar el sitio completo, cambia esto a false.
const MAINTENANCE_MODE = false;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          {MAINTENANCE_MODE ? (
            <Routes>
              <Route path="*" element={<Maintenance />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/politica-tratamiento-datos" element={<PoliticaTratamientoDatos />} />
              <Route path="/politica-sst" element={<PoliticaSST />} />
              {/* Portal Empresarial y Campus Virtual (GFO Academy) aun no se
                  publican: el login de Portal usa credenciales de prueba en
                  el propio codigo cliente y Campus todavia esta en desarrollo.
                  Sus paginas siguen en el repo, solo no estan enrutadas aqui. */}
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
