import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Banner sutil que aparece cuando el service worker detecta nueva versión.
 * Se posiciona sobre el bottom nav.
 */
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Chequea updates cada hora
        setInterval(() => r.update(), 60 * 60 * 1000);
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-ink text-paper rounded-xl shadow-lg p-3 flex items-center gap-3">
        <div className="flex-1 text-[12.5px] leading-snug">
          Hay una nueva versión disponible.
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-chloro text-paper text-[11px] uppercase tracking-wider font-mono font-semibold px-3 py-1.5 rounded-lg"
        >
          Actualizar
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-mute text-[11px] font-mono px-2"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
