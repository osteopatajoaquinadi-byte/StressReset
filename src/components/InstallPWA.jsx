import { useEffect, useState } from "react";

/**
 * Bloque para el tab Perfil que:
 * - Detecta si la app se puede instalar (Android/desktop Chrome)
 * - En iOS muestra las instrucciones manuales de "Añadir a pantalla de inicio"
 * - Se oculta si ya está instalada como PWA
 */
export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    if (window.navigator.standalone) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  if (installed) {
    return (
      <div className="bg-sage-soft border border-chloro/25 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-chloro flex items-center justify-center flex-shrink-0">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M1 6l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-widest text-chloro font-semibold mb-1">
              App instalada
            </div>
            <div className="text-[12.5px] text-ink-soft leading-snug">
              Stress Reset está instalada en tu dispositivo. Puedes abrirla desde el ícono en tu pantalla de inicio.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (deferredPrompt) {
    return (
      <div className="bg-paper border border-chloro/30 rounded-xl p-4 mb-4">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-chloro font-semibold mb-2">
          ★ Instalar Stress Reset
        </div>
        <p className="text-[12.5px] text-ink-soft leading-relaxed mb-3">
          Instala la app en tu dispositivo para acceso rápido, funcionamiento sin conexión y una experiencia como app nativa.
        </p>
        <button
          onClick={async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") setInstalled(true);
            setDeferredPrompt(null);
          }}
          className="w-full bg-chloro text-paper font-sans font-medium text-[13.5px] py-3 rounded-xl hover:bg-chloro-deep transition-colors"
        >
          Instalar app
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="bg-paper border border-line rounded-xl p-4 mb-4">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage font-semibold mb-2">
          ★ Instalar en iPhone / iPad
        </div>
        <p className="text-[12.5px] text-ink-soft leading-relaxed mb-2">
          Para usar Stress Reset como app en tu dispositivo:
        </p>
        <ol className="text-[12px] text-ink-soft leading-relaxed space-y-1 pl-4 list-decimal">
          <li>Toca el botón <span className="font-semibold">Compartir</span> en la barra inferior de Safari.</li>
          <li>Desliza y elige <span className="font-semibold">"Añadir a pantalla de inicio"</span>.</li>
          <li>Toca <span className="font-semibold">Añadir</span>.</li>
        </ol>
        <p className="text-[11px] text-mute mt-2 italic">
          Solo funciona desde Safari — no desde Chrome u otros navegadores en iOS.
        </p>
      </div>
    );
  }

  return null;
}
