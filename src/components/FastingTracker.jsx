import { useEffect, useState } from "react";

// Umbrales clínicos con relevancia biológica
const MILESTONES = [
  { hours: 12, label: "12h", desc: "Ventana básica · glicógeno hepático agotándose", color: "text-sage" },
  { hours: 14, label: "14h", desc: "Cambio metabólico incipiente · lipólisis creciente", color: "text-chloro" },
  { hours: 16, label: "16h", desc: "Cetogénesis activa · β-hidroxibutirato en ascenso", color: "text-chloro" },
  { hours: 18, label: "18h", desc: "Autofagia significativa · NLRP3 inhibido", color: "text-gold" },
  { hours: 24, label: "24h", desc: "Ayuno prolongado · requiere criterio clínico", color: "text-warn" },
];

const STORAGE_KEY = "sr_fasting_state";
const HISTORY_KEY = "sr_fasting_history";

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}
function saveState(s) {
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

function formatShortDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function FastingTracker({ onClose, phenotype }) {
  const [state, setState] = useState(() => loadState());
  const [now, setNow] = useState(Date.now());
  const [history, setHistory] = useState(() => loadHistory());
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  // Tick cada 30s para actualizar contador
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  function startFast() {
    const newState = { startedAt: Date.now() };
    setState(newState);
    saveState(newState);
  }

  function confirmEndFast() {
    setShowConfirmEnd(true);
  }

  function endFast() {
    const durationMs = Date.now() - state.startedAt;
    const durationHours = durationMs / 3600000;
    const entry = {
      startedAt: state.startedAt,
      endedAt: Date.now(),
      durationMs,
      durationHours: Math.round(durationHours * 10) / 10,
    };
    const newHistory = [entry, ...history].slice(0, 30); // últimos 30
    setHistory(newHistory);
    saveHistory(newHistory);
    setState(null);
    saveState(null);
    setShowConfirmEnd(false);
  }

  const elapsedMs = state ? now - state.startedAt : 0;
  const elapsedHours = elapsedMs / 3600000;
  const currentMilestone = MILESTONES.filter(m => elapsedHours >= m.hours).pop();
  const nextMilestone = MILESTONES.find(m => elapsedHours < m.hours);

  // Estadísticas de la última semana
  const weekAgo = Date.now() - 7 * 86400000;
  const weekEntries = history.filter(e => e.endedAt >= weekAgo);
  const weekTotal = weekEntries.reduce((s, e) => s + e.durationHours, 0);
  const weekAvg = weekEntries.length > 0 ? weekTotal / weekEntries.length : 0;

  // Recomendación fenotípica
  const phenoAdvice = {
    A: "Meta para tu fenotipo: 12:12 estable, alineado con luz solar. No presiones progresión.",
    B: "Meta para tu fenotipo: solo 12:12. Evita ayunos más largos — pueden profundizar el colapso.",
    C: "Meta para tu fenotipo: progresión 12:12 → 14:10 → 16:8 según tolerancia. Aquí está tu mayor rendimiento antiinflamatorio.",
  }[phenotype] || "Empieza siempre con 12:12 y progresá gradualmente.";

  return (
    <div className="min-h-screen bg-bone flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-widest text-mute">
          ← Volver
        </button>
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage font-semibold">
          Pilar 4 · Ayuno
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {state ? (
          // ─── Modo: ayuno activo ─────────────────────────
          <>
            <div className="text-center py-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-sage mb-3">
                En ayuno desde {formatShortDate(new Date(state.startedAt).toISOString())}
              </div>
              <div className="font-serif text-[52px] font-medium text-chloro leading-none mb-2 tabular-nums">
                {formatDuration(elapsedMs)}
              </div>
              {currentMilestone && (
                <div className={`font-mono text-[10px] uppercase tracking-widest ${currentMilestone.color} mt-2`}>
                  ● Alcanzado: {currentMilestone.label}
                </div>
              )}
            </div>

            {currentMilestone && (
              <div className="bg-sage-soft border border-chloro/20 rounded-xl p-4 mb-4">
                <div className={`font-mono text-[9.5px] uppercase tracking-widest ${currentMilestone.color} font-semibold mb-2`}>
                  {currentMilestone.label} · Fisiología
                </div>
                <p className="text-[13px] text-ink-soft leading-snug">
                  {currentMilestone.desc}
                </p>
              </div>
            )}

            {nextMilestone && (
              <div className="bg-paper border border-line rounded-xl p-4 mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute">
                    Próximo umbral
                  </div>
                  <div className="font-mono text-[13px] text-ink">
                    {nextMilestone.label}
                  </div>
                </div>
                <div className="h-1.5 bg-bone rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chloro transition-all duration-1000"
                    style={{ width: `${Math.min(100, (elapsedHours / nextMilestone.hours) * 100)}%` }}
                  />
                </div>
                <p className="text-[11.5px] text-mute mt-2 leading-snug">
                  {nextMilestone.desc}
                </p>
              </div>
            )}

            {elapsedHours >= 20 && (
              <div className="bg-paper border border-warn/40 rounded-xl p-4 mb-4">
                <div className="font-mono text-[9.5px] uppercase tracking-widest text-warn font-semibold mb-1">
                  ⚠ Precaución
                </div>
                <p className="text-[12px] text-ink-soft leading-snug">
                  Ayunos mayores a 20 horas requieren criterio clínico y no forman parte del protocolo base
                  de Stress Reset. Considera romper el ayuno con proteína y grasa.
                </p>
              </div>
            )}

            {!showConfirmEnd ? (
              <button
                onClick={confirmEndFast}
                className="mt-auto w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors"
              >
                Romper ayuno
              </button>
            ) : (
              <div className="mt-auto flex flex-col gap-2.5">
                <p className="text-[12px] text-mute text-center">
                  ¿Confirmas romper el ayuno de {formatDuration(elapsedMs)}?
                </p>
                <button
                  onClick={endFast}
                  className="w-full bg-chloro text-paper font-sans font-medium text-[14px] py-3 rounded-xl"
                >
                  Sí, romper y registrar
                </button>
                <button
                  onClick={() => setShowConfirmEnd(false)}
                  className="w-full text-[12.5px] text-mute border border-line rounded-xl py-2.5"
                >
                  Cancelar
                </button>
              </div>
            )}
          </>
        ) : (
          // ─── Modo: sin ayuno activo ─────────────────────────
          <>
            <div className="py-6">
              <h1 className="font-serif text-[24px] font-medium tracking-tight text-ink leading-tight mb-3">
                Tracker de ayuno
              </h1>
              <p className="text-[13.5px] text-ink-soft leading-relaxed mb-4">
                Registra tu ventana de ayuno para acompañar la progresión del Pilar 4.
                Marca cuando cierres tu última comida del día.
              </p>

              <div className="bg-sage-soft border border-chloro/20 rounded-xl p-4 mb-6">
                <div className="font-mono text-[9.5px] uppercase tracking-widest text-chloro font-semibold mb-1.5">
                  Fenotipo {phenotype || "—"}
                </div>
                <p className="text-[12.5px] text-ink-soft leading-snug">
                  {phenoAdvice}
                </p>
              </div>

              <button
                onClick={startFast}
                className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors mb-6"
              >
                Empezar ayuno ahora
              </button>
            </div>

            {/* Umbrales de referencia */}
            <div className="mb-6">
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage font-semibold mb-3">
                Umbrales fisiológicos
              </div>
              <div className="flex flex-col gap-2">
                {MILESTONES.map((m) => (
                  <div key={m.hours} className="flex items-start gap-3 py-2">
                    <div className={`font-mono text-[13px] font-semibold ${m.color} w-10 flex-shrink-0`}>
                      {m.label}
                    </div>
                    <div className="text-[12px] text-ink-soft leading-snug flex-1">
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historial semanal */}
            {history.length > 0 && (
              <div className="mb-4">
                <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage font-semibold mb-3">
                  Últimos 7 días
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-paper border border-line rounded-xl p-3">
                    <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-1">
                      Ayunos
                    </div>
                    <div className="font-serif text-[22px] font-medium text-ink tabular-nums">
                      {weekEntries.length}
                    </div>
                  </div>
                  <div className="bg-paper border border-line rounded-xl p-3">
                    <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-1">
                      Promedio
                    </div>
                    <div className="font-serif text-[22px] font-medium text-ink tabular-nums">
                      {weekAvg.toFixed(1)}h
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {history.slice(0, 7).map((e, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-paper border border-line rounded-lg">
                      <div className="text-[12px] text-ink-soft">
                        {formatShortDate(new Date(e.startedAt).toISOString())}
                      </div>
                      <div className={`font-mono text-[12.5px] tabular-nums font-medium ${
                        e.durationHours >= 16 ? "text-chloro" :
                        e.durationHours >= 12 ? "text-sage" : "text-mute"
                      }`}>
                        {e.durationHours}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10.5px] text-mute leading-relaxed text-center mt-2">
              Herramienta educativa. El ayuno intermitente puede no ser adecuado en embarazo,
              lactancia, diabetes tipo 1, trastornos de conducta alimentaria y otras condiciones.
              Consulta con un profesional si tienes dudas.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
