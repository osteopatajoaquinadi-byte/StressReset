// Cuestionario de fenotipo de estrés — Stress Reset
// Validado en StressReset_Paciente_Parte2_caps7-9_v0.3.pdf, Capítulo 7
// Escala: 0 = Nunca o casi nunca · 1 = Algunas veces · 2 = Frecuentemente · 3 = Casi todo el tiempo

export const SCALE_OPTIONS = [
  { value: 0, label: "Nunca o casi nunca" },
  { value: 1, label: "Algunas veces" },
  { value: 2, label: "Frecuentemente" },
  { value: 3, label: "Casi todo el tiempo" },
];

export const BLOCK_A = {
  key: "A",
  title: "Activación simpática",
  questions: [
    "Me cuesta \u201capagar la cabeza\u201d al final del día.",
    "Mi pulso o el latido en el pecho se aceleran fácil.",
    "Me cuesta más de 20 minutos dormirme la mayoría de las noches.",
    "Reacciono con irritabilidad a estímulos pequeños.",
    "Tengo tensión en mandíbula, cuello u hombros la mayor parte del día.",
    "Aunque tenga tiempo libre, no logro relajarme.",
    "Despierto con sobresalto o más temprano de lo que querría.",
    "Cuando algo me preocupa, lo pienso en bucle y no puedo soltar.",
  ],
};

export const BLOCK_B = {
  key: "B",
  title: "Colapso dorsal",
  questions: [
    "Despierto cansado aunque haya dormido suficiente.",
    "Las cosas que antes disfrutaba ya no me producen mucho.",
    "Siento que estoy \u201cdetrás de un vidrio\u201d \u2014 como anestesiado emocionalmente.",
    "Me dan ganas de quedarme en cama o evitar salir.",
    "Si me paro rápido, me mareo o se me oscurece la vista.",
    "Mi deseo sexual está claramente más bajo que mi línea base.",
    "Necesito siestas durante el día para funcionar.",
    "Me cuesta arrancar tareas, aunque sé que las tengo que hacer.",
  ],
};

export const BLOCK_C = {
  key: "C",
  title: "Carga inflamatoria",
  questions: [
    "Tengo dolores cambiantes (articulares, musculares) que aparecen y se van.",
    "Tengo niebla mental \u2014 me cuesta concentrarme o encontrar palabras.",
    "Mi digestión es irregular: hinchazón, gases, tránsito que cambia.",
    "Reacciono mal a varios alimentos (no necesariamente alergia franca).",
    "Me da más fácil que al promedio resfriarme, herpes labial, infecciones leves.",
    "Tengo \u201csiempre\u201d algo: algo me duele, algo me molesta.",
    "Estoy cansado aun habiendo descansado.",
    "Mi piel ha empeorado (acné adulto, dermatitis, picor sin causa clara).",
  ],
};

export const BLOCK_GUT = {
  key: "GUT",
  title: "Subpuntaje intestinal",
  subtitle: "Solo se interpreta si tu mayor puntaje es Bloque C.",
  questions: [
    "Después de comer ciertos alimentos me hincho visiblemente.",
    "Mis deposiciones varían mucho de un día a otro.",
    "Tengo episodios de \u201cse me bajó la energía\u201d después de comer.",
    "He probado dietas y noto que algunos alimentos me caen mal aunque no sea alérgico.",
    "Mi digestión empeora cuando estoy estresado.",
  ],
};

export const ALL_BLOCKS = [BLOCK_A, BLOCK_B, BLOCK_C, BLOCK_GUT];

// Total de preguntas principales (sin contar el sub-bloque intestinal,
// que solo se le muestra al usuario si C resulta dominante).
export const MAIN_BLOCKS = [BLOCK_A, BLOCK_B, BLOCK_C];
export const TOTAL_MAIN_QUESTIONS = MAIN_BLOCKS.reduce(
  (sum, b) => sum + b.questions.length,
  0
); // 24
