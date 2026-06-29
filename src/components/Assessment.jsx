import { useState } from "react";
import { SCALE_OPTIONS } from "../data/quizQuestions";

/**
 * Recibe una lista plana de preguntas: [{ blockKey, blockTitle, index, text }]
 * y va mostrando una por una con barra de progreso.
 */
export default function Assessment({ flatQuestions, onComplete, title, eyebrowPrefix }) {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState(
    new Array(flatQuestions.length).fill(null)
  );

  const current = flatQuestions[step];
  const progress = ((step + 1) / flatQuestions.length) * 100;
  const isLast = step === flatQuestions.length - 1;

  function selectValue(value) {
    const next = [...selections];
    next[step] = value;
    setSelections(next);

    // Pequeño delay para que se vea el estado seleccionado antes de avanzar
    setTimeout(() => {
      if (isLast) {
        onComplete(next);
      } else {
        setStep(step + 1);
      }
    }, 220);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="font-mono text-[10px] uppercase tracking-widest text-mute disabled:opacity-0"
          >
            ← Anterior
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
            {eyebrowPrefix} {step + 1} de {flatQuestions.length}
          </span>
        </div>

        <div className="h-[3px] bg-bone-soft rounded-full mb-7 overflow-hidden">
          <div
            className="h-full bg-chloro rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-3">
          {title} · {current.blockTitle}
        </p>
        <h2 className="font-serif text-[19px] font-medium leading-snug tracking-tight text-ink mb-7">
          {current.text}
        </h2>

        <div className="flex flex-col gap-2.5">
          {SCALE_OPTIONS.map((opt) => {
            const isSelected = selections[step] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => selectValue(opt.value)}
                className={`flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border text-[13px] transition-colors ${
                  isSelected
                    ? "border-chloro bg-sage-soft text-ink"
                    : "border-line bg-paper text-ink-soft hover:border-sage"
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${
                    isSelected ? "border-chloro bg-chloro" : "border-line"
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-paper" />
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
