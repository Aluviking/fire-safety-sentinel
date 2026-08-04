import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const CampusLogin = lazy(() => import("./pages/campus/CampusLogin"));
const CampusDashboard = lazy(() => import("./pages/campus/CampusDashboard"));

const App = () => (
  <BrowserRouter basename="/campus-virtual">
    <Suspense fallback={<div className="min-h-screen bg-[#F1F5F9]" />}>
      <Routes>
        <Route path="/" element={<CampusLogin />} />
        <Route path="/dashboard" element={<CampusDashboard />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
