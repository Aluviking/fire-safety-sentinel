import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CampusAuthProvider } from "./context/CampusAuthContext";
import { ErrorBoundary } from "./ErrorBoundary";

const CampusLogin = lazy(() => import("./pages/campus/CampusLogin"));
const CampusDashboard = lazy(() => import("./pages/campus/CampusDashboard"));
const EstudianteDashboard = lazy(() => import("./pages/campus/EstudianteDashboard"));
const DocenteDashboard = lazy(() => import("./pages/campus/DocenteDashboard"));
const PreinscripcionPublica = lazy(() => import("./pages/campus/PreinscripcionPublica"));

const App = () => {
  // Si se llegó a render limpio, cualquier bandera de "ya intenté recargar"
  // que haya quedado de un error anterior en esta misma pestaña ya no aplica
  // — se limpia para que un problema futuro real tenga su propio intento.
  useEffect(() => {
    sessionStorage.removeItem("campus_error_reload_intentado");
  }, []);

  return (
    <BrowserRouter basename="/campus-virtual">
      <CampusAuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-[#F1F5F9]" />}>
            <Routes>
              <Route path="/" element={<CampusLogin />} />
              <Route path="/dashboard" element={<CampusDashboard />} />
              <Route path="/estudiante" element={<EstudianteDashboard />} />
              <Route path="/docente" element={<DocenteDashboard />} />
              <Route path="/inscripcion" element={<PreinscripcionPublica />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </CampusAuthProvider>
    </BrowserRouter>
  );
};

export default App;
