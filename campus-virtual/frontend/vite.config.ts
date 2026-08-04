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
});
