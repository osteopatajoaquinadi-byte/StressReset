// Motor de cálculo de fenotipo — Stress Reset
// Reglas validadas en StressReset_Paciente_Parte2_caps7-9_v0.3.pdf, Capítulo 7
//
// - Cada bloque (A, B, C) tiene 8 preguntas, escala 0-3 → máx 24 por bloque.
// - El fenotipo dominante es el bloque de mayor puntaje.
// - Si la diferencia entre el mayor y el segundo mayor es ≤ 3 puntos, el
//   resultado es MIXTO (se reportan ambos).
// - Si C es dominante, se evalúa el subpuntaje intestinal (5 preguntas,
//   máx 15). Si supera 9, el subtipo es C2 (intestino predominante);
//   si no, C1.

export const MIX_THRESHOLD = 3;
export const GUT_C2_CUTOFF = 9;
export const MAX_BLOCK_SCORE = 24;
export const MAX_GUT_SCORE = 15;

/**
 * @param {Object} answers - { [blockKey]: number[] } respuestas 0-3 por bloque
 * @returns {Object} resultado con puntajes, fenotipo dominante, mixto, subtipo C
 */
export function calculatePhenotype(answers) {
  const scores = {
    A: sumBlock(answers.A),
    B: sumBlock(answers.B),
    C: sumBlock(answers.C),
  };

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topKey, topScore] = ranked[0];
  const [secondKey, secondScore] = ranked[1];

  const isMixed = topScore - secondScore <= MIX_THRESHOLD && topScore > 0;

  let gutScore = null;
  let gutSubtype = null;
  if (topKey === "C" && answers.GUT) {
    gutScore = sumBlock(answers.GUT);
    gutSubtype = gutScore > GUT_C2_CUTOFF ? "C2" : "C1";
  }

  // Porcentajes para visualización (barra de mezcla A·B·C)
  const total = scores.A + scores.B + scores.C;
  const percentages = {
    A: total > 0 ? Math.round((scores.A / total) * 100) : 33,
    B: total > 0 ? Math.round((scores.B / total) * 100) : 33,
    C: total > 0 ? Math.round((scores.C / total) * 100) : 34,
  };

  return {
    scores,
    percentages,
    dominant: topKey,
    dominantScore: topScore,
    secondary: isMixed ? secondKey : null,
    secondaryScore: isMixed ? secondScore : null,
    isMixed,
    gutScore,
    gutSubtype,
  };
}

function sumBlock(blockAnswers) {
  if (!blockAnswers) return 0;
  return blockAnswers.reduce((sum, v) => sum + (Number(v) || 0), 0);
}

/**
 * Helper para inicializar el estado de respuestas vacío.
 */
export function createEmptyAnswers(blocks) {
  const answers = {};
  blocks.forEach((block) => {
    answers[block.key] = new Array(block.questions.length).fill(null);
  });
  return answers;
}
