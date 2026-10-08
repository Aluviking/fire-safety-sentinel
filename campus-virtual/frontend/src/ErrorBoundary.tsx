import { Component, type ReactNode } from "react";

const RELOAD_FLAG = "campus_error_reload_intentado";

/**
 * Red de seguridad contra la pantalla en blanco. Causa más común: el
 * navegador tenía cargada (o en caché) una versión anterior de la página, y
 * al intentar traer una pieza de código que ya no existe en el servidor
 * (porque se reemplazó al subir una versión nueva) la carga falla sin aviso
 * y React se queda sin nada que mostrar. En vez de dejar al estudiante
 * varado, se recarga una sola vez automáticamente — eso ya trae la versión
 * actual completa. Si el error sigue después de esa recarga (uno real, no
 * de versión vieja), se evita el bucle infinito y se muestra un aviso con
 * botón para reintentar a mano.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    if (!sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) return null;
      return (
        <div
          style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 14, fontFamily: "system-ui, sans-serif", padding: 24, textAlign: "center",
            background: "#F1F5F9",
          }}
        >
          <p style={{ fontWeight: 600, color: "#1e293b", fontSize: 15 }}>Hubo un problema cargando la página.</p>
          <button
            onClick={() => { sessionStorage.removeItem(RELOAD_FLAG); window.location.reload(); }}
            style={{
              background: "#C41717", color: "white", border: "none", borderRadius: 10,
              padding: "10px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
