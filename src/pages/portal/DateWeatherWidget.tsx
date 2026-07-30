import { useEffect, useState } from "react";
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning } from "lucide-react";

/* ─── Clima real (Open-Meteo, sin API key) — sede de referencia: Bogotá ──── */
const WEATHER_CODE_INFO: Record<number, { label: string; Icon: React.ElementType }> = {
  0: { label: "Despejado", Icon: Sun },
  1: { label: "Parcialmente nublado", Icon: CloudSun },
  2: { label: "Parcialmente nublado", Icon: CloudSun },
  3: { label: "Nublado", Icon: Cloud },
  45: { label: "Niebla", Icon: CloudFog },
  48: { label: "Niebla", Icon: CloudFog },
  51: { label: "Llovizna", Icon: CloudDrizzle },
  53: { label: "Llovizna", Icon: CloudDrizzle },
  55: { label: "Llovizna", Icon: CloudDrizzle },
  61: { label: "Lluvia", Icon: CloudRain },
  63: { label: "Lluvia", Icon: CloudRain },
  65: { label: "Lluvia fuerte", Icon: CloudRain },
  71: { label: "Nieve", Icon: CloudSnow },
  73: { label: "Nieve", Icon: CloudSnow },
  75: { label: "Nieve fuerte", Icon: CloudSnow },
  80: { label: "Chubascos", Icon: CloudRain },
  81: { label: "Chubascos", Icon: CloudRain },
  82: { label: "Chubascos fuertes", Icon: CloudRain },
  95: { label: "Tormenta", Icon: CloudLightning },
  96: { label: "Tormenta", Icon: CloudLightning },
  99: { label: "Tormenta", Icon: CloudLightning },
};

function useWeather() {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=4.711&longitude=-74.0721" +
      "&current=temperature_2m,weather_code&timezone=America%2FBogota"
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const temp = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        if (typeof temp === "number" && typeof code === "number") setWeather({ temp, code });
      })
      .catch(() => { /* si falla, el widget simplemente no muestra clima */ });
    return () => { cancelled = true; };
  }, []);

  return weather;
}

function todayLabel(): string {
  const raw = new Date().toLocaleDateString("es-CO", {
    timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long",
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Reloj en vivo, siempre en hora de Colombia (independiente de dónde esté el usuario). */
function useColombiaClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

/**
 * Widget flotante de fecha + clima + hora de Colombia, reutilizado en el hero
 * del Dashboard y en el hero de la vista de Empresa (PortalEmpresa).
 */
export function DateWeatherWidget() {
  const weather = useWeather();
  const clock = useColombiaClock();
  const info = weather ? (WEATHER_CODE_INFO[weather.code] ?? { label: "—", Icon: Cloud }) : null;
  const Icon = info?.Icon ?? Cloud;

  return (
    <div className="absolute top-5 right-5 z-20 flex items-center gap-2.5 bg-white/10 backdrop-blur-md
                     border border-white/20 rounded-2xl pl-3 pr-4 py-2.5">
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-amber-300" />
      </div>
      <div className="leading-tight">
        <p className="text-white text-xs font-semibold">{todayLabel()}</p>
        <p className="text-white/70 text-[11px] mt-0.5">
          {weather ? `${Math.round(weather.temp)}°C · ${info?.label}` : "Cargando clima..."}
        </p>
        <p className="text-white/50 text-[10px] mt-0.5 font-mono tracking-wide">
          {clock} · Colombia
        </p>
      </div>
    </div>
  );
}
