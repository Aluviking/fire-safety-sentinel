import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Se sirve bajo siso.com.co/campus-virtual/ — mismo dominio, ruta propia,
// build totalmente separado del sitio principal y del Portal Empresarial.
export default defineConfig({
  base: "/campus-virtual/",
  server: {
    host: "::",
    port: 8082,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // El hosting (Hostinger) sirve archivos .mjs con Content-Type:
        // text/plain (no tiene ese tipo MIME mapeado) — los navegadores
        // RECHAZAN cargar un Worker/módulo cuando el servidor no manda un
        // tipo JS válido. Afecta al worker de pdf.js (pdf.worker.min.mjs,
        // visor de PDF embebido). Renombrar la salida a .js evita el
        // problema de raíz, sin depender de que el hosting soporte AddType
        // en .htaccess.
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? assetInfo.names?.[0] ?? "asset";
          const dot = name.lastIndexOf(".");
          const base = dot > 0 ? name.slice(0, dot) : name;
          const ext = dot > 0 ? name.slice(dot + 1) : "bin";
          const outExt = ext === "mjs" ? "js" : ext; // único cambio real: .mjs -> .js
          return `assets/${base}-[hash].${outExt}`;
        },
      },
    },
  },
});
