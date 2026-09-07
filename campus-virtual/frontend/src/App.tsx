import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CampusAuthProvider } from "./context/CampusAuthContext";

const CampusLogin = lazy(() => import("./pages/campus/CampusLogin"));
const CampusDashboard = lazy(() => import("./pages/campus/CampusDashboard"));
const EstudianteDashboard = lazy(() => import("./pages/campus/EstudianteDashboard"));
const PreinscripcionPublica = lazy(() => import("./pages/campus/PreinscripcionPublica"));

const App = () => (
  <BrowserRouter basename="/campus-virtual">
    <CampusAuthProvider>
      <Suspense fallback={<div className="min-h-screen bg-[#F1F5F9]" />}>
        <Routes>
          <Route path="/" element={<CampusLogin />} />
          <Route path="/dashboard" element={<CampusDashboard />} />
          <Route path="/estudiante" element={<EstudianteDashboard />} />
          <Route path="/inscripcion" element={<PreinscripcionPublica />} />
        </Routes>
      </Suspense>
    </CampusAuthProvider>
  </BrowserRouter>
);

export default App;
