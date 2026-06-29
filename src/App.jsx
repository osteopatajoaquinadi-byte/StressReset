import { useState } from "react";
import Welcome from "./components/Welcome";
import Assessment from "./components/Assessment";
import PhenotypeResult from "./components/PhenotypeResult";
import { MAIN_BLOCKS, BLOCK_GUT } from "./data/quizQuestions";
import { calculatePhenotype } from "./utils/scoring";

// "welcome" → "main_quiz" → "gut_quiz" (condicional) → "result"
export default function App() {
  const [stage, setStage] = useState("welcome");
  const [mainAnswers, setMainAnswers] = useState(null);
  const [result, setResult] = useState(null);

  // Preguntas principales (24), aplanadas con metadata de bloque
  const flatMainQuestions = MAIN_BLOCKS.flatMap((block) =>
    block.questions.map((text, index) => ({
      blockKey: block.key,
      blockTitle: block.title,
      index,
      text,
    }))
  );

  const flatGutQuestions = BLOCK_GUT.questions.map((text, index) => ({
    blockKey: "GUT",
    blockTitle: BLOCK_GUT.title,
    index,
    text,
  }));

  function handleMainComplete(flatSelections) {
    // Reconstruir respuestas por bloque
    const answers = { A: [], B: [], C: [] };
    flatMainQuestions.forEach((q, i) => {
      answers[q.blockKey].push(flatSelections[i]);
    });
    setMainAnswers(answers);

    // Calcular preliminarmente para saber si C domina y necesitamos el sub-bloque
    const preliminary = calculatePhenotype(answers);
    if (preliminary.dominant === "C") {
      setStage("gut_quiz");
    } else {
      setResult(preliminary);
      setStage("result");
    }
  }

  function handleGutComplete(flatGutSelections) {
    const answers = { ...mainAnswers, GUT: flatGutSelections };
    const final = calculatePhenotype(answers);
    setResult(final);
    setStage("result");
  }

  function handleRestart() {
    setMainAnswers(null);
    setResult(null);
    setStage("welcome");
  }

  if (stage === "welcome") {
    return <Welcome onStart={() => setStage("main_quiz")} />;
  }

  if (stage === "main_quiz") {
    return (
      <Assessment
        key="main"
        flatQuestions={flatMainQuestions}
        onComplete={handleMainComplete}
        title="Autoevaluación"
        eyebrowPrefix="Paso"
      />
    );
  }

  if (stage === "gut_quiz") {
    return (
      <Assessment
        key="gut"
        flatQuestions={flatGutQuestions}
        onComplete={handleGutComplete}
        title="Profundización"
        eyebrowPrefix="Paso adicional"
      />
    );
  }

  if (stage === "result" && result) {
    return <PhenotypeResult result={result} onRestart={handleRestart} />;
  }

  return null;
}
