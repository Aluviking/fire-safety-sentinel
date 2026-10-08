import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Cada módulo (login, panel admin, panel estudiante...) se carga con
// import() dinámico. Si el navegador tenía la página abierta o en caché
// justo antes de subir una versión nueva, puede intentar pedir el archivo
// de la versión anterior — que el servidor ya no tiene, porque se reemplazó
// al desplegar. Vite avisa ese fallo puntual con este evento; en vez de
// dejar la pantalla en blanco, se recarga para traer la versión actual
// completa (los archivos "congelados" como las imágenes/CSS no se ven
// afectados, solo el JS que cambia en cada despliegue).
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
