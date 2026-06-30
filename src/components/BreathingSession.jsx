import { useState, useEffect, useRef } from "react";

// ── Patrones respiratorios por fenotipo y momento ──────────────
// Fuente: StressReset_Paciente caps 8 (Pilar 1)
const PATTERNS = {
  "5-5": {
    name: "5-5",
    desc: "Frecuencia resonante · 6 resp/min",
    phases: [
      { label: "Inhala", seconds: 5, scale: 1.12 },
      { label: "Exhala", seconds: 5, scale: 0.86 },
    ],
  },
  "4-8": {
    name: "4-8",
    desc: "Exhalación larga · activa vago ventral",
    phases: [
      { label: "Inhala", seconds: 4, scale: 1.1 },
      { label: "Exhala", seconds: 8, scale: 0.86 },
    ],
  },
  "4-2-6-2": {
    name: "4-2-6-2",
    desc: "Respiración activante · vagal ventral",
    phases: [
      { label: "Inhala", seconds: 4, scale: 1.1 },
      { label: "Sostén", seconds: 2, scale: 1.1 },
      { label: "Exhala", seconds: 6, scale: 0.86 },
      { label: "Sostén", seconds: 2, scale: 0.86 },
    ],
  },
};

function getPatternKey(phenotype, sessionType) {
  if (phenotype === "A" && sessionType === "evening") return "4-8";
  if (phenotype === "B") return "4-2-6-2";
  return "5-5";
}

const SESSION_MINUTES = 5;

export default function BreathingSession({ phenotype, sessionType = "morning", onClose }) {
  const patternKey = getPatternKey(phenotype, sessionType);
  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;

  const totalSecs = SESSION_MINUTES * 60;
  const cycleSecs = phases.reduce((s, p) => s + p.seconds, 0);
  const totalCycles = Math.floor(totalSecs / cycleSecs);

  // Timer state
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].seconds);
  const [cycleNum, setCycleNum] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  // Orb animation state (controlled separately for smooth CSS transitions)
  const [orbScale, setOrbScale] = useState(phases[0].scale);
  const [orbTransition, setOrbTransition] = useState(`transform ${phases[0].seconds * 0.88}s ease-in-out`);

  // Refs for interval access without stale closures
  const ref = useRef({ phaseIdx: 0, timeLeft: phases[0].seconds, cycleNum: 1, elapsed: 0 });

  // Kick off orb animation on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOrbScale(phases[0].scale);
    }, 80);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!running || done) return;

    const interval = setInterval(() => {
      const r = ref.current;
      r.elapsed += 1;
      r.timeLeft -= 1;
      setElapsed(r.elapsed);

      // Session complete
      if (r.elapsed >= totalSecs) {
        setDone(true);
        setRunning(false);
        return;
      }

      // Phase complete — advance
      if (r.timeLeft <= 0) {
        const nextIdx = (r.phaseIdx + 1) % phases.length;
        const nextPhase = phases[nextIdx];

        if (nextIdx === 0) {
          r.cycleNum += 1;
          setCycleNum(r.cycleNum);
        }

        r.phaseIdx = nextIdx;
        r.timeLeft = nextPhase.seconds;
        setPhaseIdx(nextIdx);
        setTimeLeft(nextPhase.seconds);

        // Animate orb
        setOrbTransition(`transform ${nextPhase.seconds * 0.88}s ease-in-out`);
        setOrbScale(nextPhase.scale);
      } else {
        setTimeLeft(r.timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [running, done]);

  const currentPhase = phases[phaseIdx];
  const secsRemaining = totalSecs - elapsed;
  const minsLeft = Math.floor(secsRemaining / 60);
  const secsLeft = secsRemaining % 60;

  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{
        background: "radial-gradient(circle at 50% 44%, #1E5F3F 0%, #164A30 65%, #0D3323 100%)",
      }}
    >
      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-6 pb-0 text-white/60 font-mono text-[10px] uppercase tracking-widest">
        <span>{pattern.name} · {pattern.desc.split("·")[0].trim()}</span>
        <span>Ciclo {Math.min(cycleNum, totalCycles)}/{totalCycles}</span>
      </div>

      {/* Orb area */}
      <div className="flex-1 flex items-center justify-center">
        <div
          style={{
            width: "62vw",
            maxWidth: 240,
            aspectRatio: "1",
            borderRadius: "50%",
            transform: `scale(${orbScale})`,
            transition: orbTransition,
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.04) 58%, transparent 78%)",
            border: "1px solid rgba(255,255,255,0.16)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              inset: "18%",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
          {/* Text */}
          <div className="text-center text-white z-10">
            <div className="font-serif italic text-[23px] tracking-tight leading-none">
              {done ? "Listo" : currentPhase.label}
            </div>
            {!done && (
              <div className="font-mono text-[11px] uppercase tracking-widest opacity-65 mt-2">
                {timeLeft}s
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="px-6 pb-10 text-center text-white">
        {done ? (
          <>
            <div className="font-serif text-[18px] mb-1">Sesión completada</div>
            <div className="font-mono text-[11px] text-white/60 mb-5">
              {totalCycles} ciclos · {SESSION_MINUTES} minutos
            </div>
            <button
              onClick={onClose}
              className="bg-white/12 border border-white/22 text-white font-mono text-[11px] uppercase tracking-widest px-6 py-3 rounded-full"
            >
              Volver al plan
            </button>
          </>
        ) : (
          <>
            <div className="font-serif text-[15px] mb-1">{pattern.desc}</div>
            <div className="font-mono text-[11px] text-white/55 mb-5">
              {minsLeft}:{String(secsLeft).padStart(2, "0")} restantes
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setRunning((r) => !r)}
                className="bg-white/12 border border-white/22 text-white font-mono text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full"
              >
                {running ? "Pausa" : "Continuar"}
              </button>
              <button
                onClick={onClose}
                className="bg-white/12 border border-white/22 text-white font-mono text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full"
              >
                Terminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
