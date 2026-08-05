import { useEffect, useImperativeHandle, useRef, forwardRef, useState } from "react";

// Site key — pública, segura de exponer en el navegador (la que de verdad
// importa es la secret key, que solo vive en el servidor).
const SITE_KEY = "6LddeXctAAAAALTS_ndGP130NS5cwYFxb1q3bqef";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        params: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    __onRecaptchaLoad?: () => void;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    window.__onRecaptchaLoad = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
  return scriptLoadingPromise;
}

export interface RecaptchaHandle {
  reset: () => void;
}

const Recaptcha = forwardRef<RecaptchaHandle, { onChange: (token: string | null) => void }>(
  ({ onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      loadRecaptchaScript().then(() => {
        if (cancelled || !containerRef.current || widgetId.current !== null) return;
        widgetId.current = window.grecaptcha!.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => onChange(token),
          "expired-callback": () => onChange(null),
        });
        setReady(true);
      });
      return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
        onChange(null);
      },
    }));

    return (
      <div className="flex justify-center">
        <div ref={containerRef} className={ready ? "" : "hidden"} />
        {!ready && (
          <div className="h-[78px] w-[304px] max-w-full rounded-md bg-slate-100 animate-pulse" />
        )}
      </div>
    );
  }
);

Recaptcha.displayName = "Recaptcha";
export default Recaptcha;
