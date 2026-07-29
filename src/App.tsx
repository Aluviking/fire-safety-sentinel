import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));
const PoliticaTratamientoDatos = lazy(() => import("./pages/PoliticaTratamientoDatos"));
const PoliticaSST = lazy(() => import("./pages/PoliticaSST"));
const PortalPage = lazy(() => import("./pages/portal/PortalPage"));
const PortalDashboard = lazy(() => import("./pages/portal/PortalDashboard"));
const PortalEmpresa = lazy(() => import("./pages/portal/PortalEmpresa"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/politica-tratamiento-datos" element={<PoliticaTratamientoDatos />} />
              <Route path="/politica-sst" element={<PoliticaSST />} />
              <Route path="/portal" element={<PortalPage />} />
              <Route path="/portal/dashboard" element={<PortalDashboard />} />
              <Route path="/portal/empresa/:id" element={<PortalEmpresa />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
