import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Maintenance from "./pages/Maintenance";

const NotFound = lazy(() => import("./pages/NotFound"));
const PoliticaTratamientoDatos = lazy(() => import("./pages/PoliticaTratamientoDatos"));
const PoliticaSST = lazy(() => import("./pages/PoliticaSST"));
const PortalPage = lazy(() => import("./pages/portal/PortalPage"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const PortalUsuarios = lazy(() => import("./pages/portal/PortalUsuarios"));
const PortalPermisos = lazy(() => import("./pages/portal/PortalPermisos"));
const PortalHistorial = lazy(() => import("./pages/portal/PortalHistorial"));
const PortalPublicidad = lazy(() => import("./pages/portal/PortalPublicidad"));
const PortalEmpresa = lazy(() => import("./pages/portal/PortalEmpresa"));

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
        <AuthProvider>
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
              {/* Portal Empresarial: backend real (PHP+MySQL) en Hostinger. */}
              <Route path="/portal" element={<PortalPage />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />
              <Route path="/portal/dashboard/usuarios" element={<PortalUsuarios />} />
              <Route path="/portal/dashboard/permisos" element={<PortalPermisos />} />
              <Route path="/portal/dashboard/historial" element={<PortalHistorial />} />
              <Route path="/portal/dashboard/publicidad" element={<PortalPublicidad />} />
              <Route path="/portal/empresa/:id" element={<PortalEmpresa />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
