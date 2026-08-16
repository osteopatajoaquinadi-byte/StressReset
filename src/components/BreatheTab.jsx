import { useState } from "react";

const PATTERNS = [
  {
    key: "5-5",
    name: "5-5",
    desc: "Frecuencia resonante",
    detail: "6 respiraciones por minuto. La frecuencia que más amplifica la resonancia entre respiración y latido cardíaco. Base de todo el programa.",
    for: "Todos los fenotipos · práctica diaria",
  },
  {
    key: "4-8",
    name: "4-8",
    desc: "Exhalación larga",
    detail: "Inhala 4, exhala 8. La exhalación prolongada activa el vago ventral con más fuerza. Ideal para calmar un sistema que no puede apagar.",
    for: "Fenotipo A · antes de dormir",
  },
  {
    key: "4-2-6-2",
    name: "4-2-6-2",
    desc: "Activante ventral",
    detail: "Inhala 4, sostén 2, exhala 6, sostén 2. Activa la rama vagal ventral — la de conexión social y presencia. No es calma: es despertar.",
    for: "Fenotipo B · por la mañana",
  },
  {
    key: "sigh",
    name: "Suspiro",
    desc: "Suspiro fisiológico",
    detail: "Doble inhalación por nariz (inhala — pausa — inhala un poco más) y exhala largo y completo por la boca. El mecanismo más rápido documentado para bajar la activación simpática en tiempo real. Reinflate los alvéolos colapsados y activa el vago en segundos.",
    for: "Todos los fenotipos · reset rápido · ansiedad aguda",
  },
];

const DURATIONS = [3, 5, 10];

function getSessionHistory() {
  try { return JSON.parse(localStorage.getItem("sr_breathing_log") || "[]"); }
  catch { return []; }
}

export default function BreatheTab({ onStartSession }) {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [duration, setDuration] = useState(5);

  const history = getSessionHistory();
  const todayStr = new Date().toISOString().split("T")[0];
  const todaySessions = history.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((s, e) => s + (e.minutes || 0), 0);

  function handleStart() {
    if (!selectedPattern) return;
    onStartSession(selectedPattern, duration);
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-24">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
        Pilar 1 · Regulación autonómica
      </div>
      <h1 className="font-serif text-[22px] font-medium tracking-tight text-ink leading-snug mb-2">
        Sesión de <em className="italic text-chloro">respiración</em>.
      </h1>
      <p className="text-[13px] text-ink-soft leading-relaxed mb-6">
        Elige un patrón y una duración. El orbe te guía el ritmo — solo síguelo.
      </p>

      {/* Today stats */}
      {todaySessions.length > 0 && (
        <div className="bg-sage-soft rounded-xl p-3.5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-chloro/10 flex items-center justify-center font-serif text-chloro text-[16px]">
            {todaySessions.length}
          </div>
          <div>
            <div className="text-[12.5px] text-ink font-medium">
              {todaySessions.length} {todaySessions.length === 1 ? "sesión" : "sesiones"} hoy
            </div>
            <div className="font-mono text-[10px] text-mute">{todayMinutes} min totales</div>
          </div>
        </div>
      )}

      {/* Pattern selector */}
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-3">
        Patrón respiratorio
      </div>
      <div className="flex flex-col gap-2.5 mb-6">
        {PATTERNS.map((p) => {
          const isSelected = selectedPattern === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setSelectedPattern(p.key)}
              className={`text-left px-4 py-3.5 rounded-xl border transition-colors ${
                isSelected
                  ? "border-chloro bg-sage-soft"
                  : "border-line bg-paper hover:border-sage"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-mono text-[14px] font-semibold ${isSelected ? "text-chloro" : "text-ink"}`}>
                  {p.name}
                </span>
                <span className="text-[12px] text-mute">— {p.desc}</span>
              </div>
              {isSelected && (
                <>
                  <p className="text-[12px] text-ink-soft leading-relaxed mt-2">{p.detail}</p>
                  <p className="font-mono text-[9.5px] text-sage uppercase tracking-wide mt-2">{p.for}</p>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Duration */}
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-3">
        Duración
      </div>
      <div className="flex gap-2.5 mb-8">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDuration(d)}
            className={`flex-1 py-3 rounded-xl border font-mono text-[13px] transition-colors ${
              duration === d
                ? "border-chloro bg-sage-soft text-chloro font-semibold"
                : "border-line bg-paper text-mute hover:border-sage"
            }`}
          >
            {d} min
          </button>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!selectedPattern}
        className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {selectedPattern ? "Iniciar sesión" : "Elige un patrón"}
      </button>
    </div>
  );
}
