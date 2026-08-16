import { useState, useEffect, useRef, useCallback } from "react";

// ── Patrones respiratorios ──────────────────────────────────────
// Cada fase tiene: label (texto principal), hint (instrucción debajo),
// seconds, scale (tamaño del orbe), y growing (si el orbe crece o decrece)
const PATTERNS = {
  "5-5": {
    name: "5-5",
    desc: "Frecuencia resonante · 6 resp/min",
    phases: [
      { label: "Inhala", hint: "por la nariz, lento y profundo", seconds: 5, scale: 1.14, growing: true },
      { label: "Exhala", hint: "por la nariz, suave y controlado", seconds: 5, scale: 0.84, growing: false },
    ],
  },
  "4-8": {
    name: "4-8",
    desc: "Exhalación larga · activa vago ventral",
    phases: [
      { label: "Inhala", hint: "por la nariz, 4 segundos", seconds: 4, scale: 1.12, growing: true },
      { label: "Exhala largo", hint: "por la nariz o boca, lento y continuo", seconds: 8, scale: 0.82, growing: false },
    ],
  },
  "4-2-6-2": {
    name: "4-2-6-2",
    desc: "Respiración activante · vagal ventral",
    phases: [
      { label: "Inhala", hint: "por la nariz, con energía", seconds: 4, scale: 1.12, growing: true },
      { label: "Sostén", hint: "mantén el aire, relaja los hombros", seconds: 2, scale: 1.12, growing: false },
      { label: "Exhala", hint: "por la nariz, suave y controlado", seconds: 6, scale: 0.84, growing: false },
      { label: "Sostén", hint: "vacío, sin forzar", seconds: 2, scale: 0.84, growing: false },
    ],
  },
  "sigh": {
    name: "Suspiro",
    desc: "Suspiro fisiológico · reset rápido",
    phases: [
      { label: "Inhala", hint: "por la nariz, profundo", seconds: 3, scale: 1.06, growing: true },
      { label: "Pausa", hint: "breve, sin soltar el aire", seconds: 1, scale: 1.08, growing: false },
      { label: "Inhala más", hint: "un sorbo extra por la nariz", seconds: 2, scale: 1.16, growing: true },
      { label: "Suelta todo", hint: "por la boca, largo y completo", seconds: 6, scale: 0.82, growing: false },
    ],
  },
};

function getPatternKey(phenotype, sessionType) {
  if (PATTERNS[sessionType]) return sessionType;
  if (phenotype === "A" && sessionType === "evening") return "4-8";
  if (phenotype === "B") return "4-2-6-2";
  return "5-5";
}

// Countdown states
const STATE_PREP = "prep";       // 3-2-1 countdown
const STATE_ACTIVE = "active";   // breathing session
const STATE_DONE = "done";       // session complete

export default function BreathingSession({ phenotype, sessionType = "morning", duration = 5, onClose }) {
  const SESSION_MINUTES = duration;
  const patternKey = getPatternKey(phenotype, sessionType);
  const pattern = PATTERNS[patternKey];
  const phases = pattern.phases;

  const totalSecs = SESSION_MINUTES * 60;
  const cycleSecs = phases.reduce((s, p) => s + p.seconds, 0);
  const totalCycles = Math.floor(totalSecs / cycleSecs);

  // State
  const [sessionState, setSessionState] = useState(STATE_PREP);
  const [prepCount, setPrepCount] = useState(3);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(phases[0].seconds);
  const [cycleNum, setCycleNum] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  // Orb
  const lastPhaseScale = phases[phases.length - 1].scale; // contracted/exhale state
  const [orbScale, setOrbScale] = useState(lastPhaseScale); // start contracted
  const [orbTransition, setOrbTransition] = useState("transform 0.3s ease-out");

  // Ref for interval
  const ref = useRef({
    phaseIdx: 0,
    timeLeft: phases[0].seconds,
    cycleNum: 1,
    elapsed: 0,
  });

  // ── Prep countdown (3-2-1) ───────────────────────────────────
  useEffect(() => {
    if (sessionState !== STATE_PREP) return;

    const interval = setInterval(() => {
      setPrepCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionState(STATE_ACTIVE);
          // Kick off first phase animation
          const firstPhase = phases[0];
          setOrbTransition(`transform ${firstPhase.seconds}s ease-in-out`);
          setOrbScale(firstPhase.scale);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState]);

  // ── Active session timer ─────────────────────────────────────
  useEffect(() => {
    if (sessionState !== STATE_ACTIVE || paused) return;

    const interval = setInterval(() => {
      const r = ref.current;
      r.elapsed += 1;
      r.timeLeft -= 1;
      setElapsed(r.elapsed);

      if (r.elapsed >= totalSecs) {
        setSessionState(STATE_DONE);
        setOrbTransition("transform 0.5s ease-out");
        setOrbScale(1.0);
        return;
      }

      if (r.timeLeft <= 0) {
        // Advance to next phase
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

        // Animate orb — full duration, matching the phase exactly
        setOrbTransition(`transform ${nextPhase.seconds}s ease-in-out`);
        setOrbScale(nextPhase.scale);
      } else {
        setTimeLeft(r.timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState, paused]);

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
      {/* Top bar */}
      <div className="flex justify-between items-center px-6 pt-6 text-white/55 font-mono text-[10px] uppercase tracking-widest">
        <span>{pattern.name} · {pattern.desc.split("·")[0].trim()}</span>
        {sessionState === STATE_ACTIVE && (
          <span>Ciclo {Math.min(cycleNum, totalCycles)}/{totalCycles}</span>
        )}
      </div>

      {/* Orb area */}
      <div className="flex-1 flex items-center justify-center">
        <div
          style={{
            width: "60vw",
            maxWidth: 230,
            aspectRatio: "1",
            borderRadius: "50%",
            transform: `scale(${orbScale})`,
            transition: orbTransition,
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.04) 58%, transparent 78%)",
            border: "1px solid rgba(255,255,255,0.14)",
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
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          />

          {/* Center text */}
          <div className="text-center text-white z-10 px-4">
            {sessionState === STATE_PREP && (
              <>
                <div className="font-serif italic text-[32px] tracking-tight leading-none">
                  {prepCount}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-55 mt-3">
                  Prepárate
                </div>
              </>
            )}
            {sessionState === STATE_ACTIVE && (
              <>
                <div className="font-serif italic text-[22px] tracking-tight leading-tight">
                  {currentPhase.label}
                </div>
                <div className="font-mono text-[12px] uppercase tracking-widest opacity-70 mt-1.5">
                  {timeLeft}
                </div>
                <div className="text-[12px] opacity-50 mt-2 leading-snug font-sans">
                  {currentPhase.hint}
                </div>
              </>
            )}
            {sessionState === STATE_DONE && (
              <>
                <div className="font-serif italic text-[22px] tracking-tight leading-none">
                  Listo
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-55 mt-3">
                  Sesión completada
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 text-center text-white">
        {sessionState === STATE_PREP && (
          <>
            <div className="font-serif text-[15px] mb-1">{pattern.desc}</div>
            <div className="font-mono text-[11px] text-white/50 mb-5">
              {SESSION_MINUTES} minutos · {totalCycles} ciclos
            </div>
          </>
        )}

        {sessionState === STATE_ACTIVE && (
          <>
            <div className="font-mono text-[11px] text-white/50 mb-5">
              {minsLeft}:{String(secsLeft).padStart(2, "0")} restantes
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setPaused((p) => !p)}
                className="bg-white/10 border border-white/20 text-white font-mono text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full"
              >
                {paused ? "Continuar" : "Pausa"}
              </button>
              <button
                onClick={onClose}
                className="bg-white/10 border border-white/20 text-white font-mono text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-full"
              >
                Terminar
              </button>
            </div>
          </>
        )}

        {sessionState === STATE_DONE && (
          <>
            <div className="font-mono text-[11px] text-white/55 mb-5">
              {totalCycles} ciclos · {SESSION_MINUTES} min
            </div>
            <button
              onClick={onClose}
              className="bg-white/10 border border-white/20 text-white font-mono text-[11px] uppercase tracking-widest px-6 py-3 rounded-full"
            >
              Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}
