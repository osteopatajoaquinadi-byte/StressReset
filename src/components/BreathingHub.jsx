import { useState } from "react";

const PATTERNS = [
  {
    key: "5-5",
    name: "Respiración 5-5",
    desc: "Frecuencia resonante — 6 respiraciones por minuto. Máxima sincronización entre corazón y respiración.",
    for: "Todos los fenotipos. La práctica base.",
    sessionType: "morning",
    color: "chloro",
  },
  {
    key: "4-8",
    name: "Exhalación larga 4-8",
    desc: "La exhalación prolongada activa el vago ventral con más fuerza. Baja la frecuencia cardíaca y el cortisol en minutos.",
    for: "Ideal para fenotipo A y para antes de dormir.",
    sessionType: "evening",
    color: "sage",
  },
  {
    key: "4-2-6-2",
    name: "Respiración activante 4-2-6-2",
    desc: "Inhala 4 · sostén 2 · exhala 6 · sostén 2. Activa el vago ventral sin someter — despierta la energía sin activar simpático.",
    for: "Ideal para fenotipo B en la mañana.",
    sessionType: "morning",
    color: "gold",
  },
];

const DURATIONS = [3, 5, 10];

export default function BreathingHub({ onStartSession }) {
  const [selectedDuration, setSelectedDuration] = useState(5);

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-24">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
        Pilar 1 · Regulación autonómica
      </div>
      <h1 className="font-serif text-[24px] font-medium tracking-tight text-ink leading-tight mb-2">
        Sesiones de <em className="italic text-chloro">respiración</em>
      </h1>
      <p className="text-[13px] text-ink-soft leading-relaxed mb-6">
        La respiración es el único proceso autonómico que puedes controlar
        voluntariamente. Cada patrón activa circuitos distintos de tu sistema
        nervioso.
      </p>

      {/* Duration selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-[10px] text-mute uppercase tracking-widest">
          Duración:
        </span>
        <div className="flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`font-mono text-[11px] px-3 py-1.5 rounded-lg transition-colors ${
                selectedDuration === d
                  ? "bg-chloro text-paper"
                  : "bg-bone-soft text-mute hover:bg-bone"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Pattern cards */}
      <div className="flex flex-col gap-3">
        {PATTERNS.map((p) => (
          <div
            key={p.key}
            className="bg-paper rounded-xl border border-line p-5 hover:border-sage transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-serif text-[16px] font-medium text-ink mb-1">
                  {p.name}
                </h3>
                <p className="text-[12.5px] text-ink-soft leading-relaxed mb-2">
                  {p.desc}
                </p>
                <p className="font-mono text-[9.5px] uppercase tracking-widest text-sage">
                  {p.for}
                </p>
              </div>
            </div>
            <button
              onClick={() => onStartSession(p.sessionType, selectedDuration)}
              className="mt-3 w-full bg-chloro text-paper font-sans text-[13px] font-medium py-3 rounded-xl hover:bg-chloro-deep transition-colors flex items-center justify-center gap-2"
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                <path d="M1 1l8 5-8 5V1z" fill="currentColor" />
              </svg>
              Iniciar · {selectedDuration} min
            </button>
          </div>
        ))}
      </div>

      {/* Educational callout */}
      <div className="mt-6 p-4 bg-gold-soft border-l-2 border-gold rounded-r-xl">
        <p className="font-mono text-[9.5px] uppercase tracking-widest text-gold font-semibold mb-1.5">
          Pista práctica
        </p>
        <p className="text-[11.5px] text-ink-soft leading-relaxed">
          El verdadero impacto está en hacerla todos los días, especialmente
          cuando estás bien. Estás entrenando el sistema, no apagando un
          incendio. 5 minutos diarios constantes pesan más que una hora un
          sábado.
        </p>
      </div>
    </div>
  );
}
