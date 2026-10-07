import { useSearchParams } from "react-router-dom";

/**
 * Guarda un valor de string en la URL (?key=valor) en vez de en useState —
 * así sobrevive a Ctrl+Shift+R (recarga forzada) y al botón "atrás" del
 * navegador, igual que ya hacía activeNav/sub en CampusDashboard.tsx. Se usa
 * para "qué item específico tengo abierto" (ej. programaId) y "en qué
 * pestaña estoy" (ej. programaTab) en cada vista de lista/detalle, para que
 * recargar la página te deje exactamente donde estabas, no en la lista
 * general. `replace: true` para no llenar el historial de "atrás" con cada
 * clic de pestaña/fila.
 */
export function useUrlState(key: string, defaultValue = ""): [string, (next: string | null) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = (next: string | null) => {
    setSearchParams((prev) => {
      const copy = new URLSearchParams(prev);
      if (next === null || next === "") copy.delete(key);
      else copy.set(key, next);
      return copy;
    }, { replace: true });
  };

  return [value, setValue];
}
