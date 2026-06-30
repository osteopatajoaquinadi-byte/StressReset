// Tareas del plan de 28 días — Stress Reset
// Fuente: StressReset_Paciente caps 8-12
// La visibilidad de cada tarea depende de: phenotype y semana del programa

const ALL_TASKS = [
  // ── PILAR 1 · Regulación autonómica / vagal ──────────────────
  {
    key: "breathing_morning",
    pillar: 1,
    label: "Respiración matutina · 5 min",
    time: "7:00",
    action: "breathing",
    breathingType: "morning",
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "breathing_evening",
    pillar: 1,
    label: "Respiración pre-sueño · 5 min",
    time: "22:30",
    action: "breathing",
    breathingType: "evening",
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "vagal_practice",
    pillar: 1,
    label: "Práctica vagal · canto / gárgaras / inmersión facial",
    time: "cualquier momento",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
  },

  // ── PILAR 2 · Movimiento ──────────────────────────────────────
  {
    key: "morning_walk",
    pillar: 2,
    label: "Caminata con luz solar · 20 min",
    time: "7:30",
    action: null,
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "active_breaks",
    pillar: 2,
    label: "Pausa activa cada 30 min (3 min)",
    time: "todo el día",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "strength_session",
    pillar: 2,
    label: "Sesión de fuerza · 30-40 min",
    time: "mañana o tarde",
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
  },
  {
    key: "restorative_movement",
    pillar: 2,
    label: "Movimiento suave · yoga / estiramientos",
    time: "mañana o tarde",
    action: null,
    weekFrom: 3,
    phenotypes: ["B"],
  },

  // ── PILAR 3 · Ritmos circadianos ─────────────────────────────
  {
    key: "consistent_wake",
    pillar: 3,
    label: "Misma hora de despertar que ayer",
    time: "mañana",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "dim_lights",
    pillar: 3,
    label: "Luz tenue 90 min antes de dormir",
    time: "21:30",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "no_screens",
    pillar: 3,
    label: "Sin pantallas brillantes · modo nocturno activo",
    time: "22:00",
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "cool_room",
    pillar: 3,
    label: "Habitación fresca · 18-20°C al dormir",
    time: "noche",
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
  },

  // ── PILAR 4 · Nutrición / ayuno ──────────────────────────────
  {
    key: "eating_window_12",
    pillar: 4,
    label: "Ventana de comida 12:12 · cierra 20:00",
    time: "20:00",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "C"],
  },
  {
    key: "fixed_meals_b",
    pillar: 4,
    label: "3 comidas a horario fijo · no saltear",
    time: "todo el día",
    action: null,
    weekFrom: 2,
    phenotypes: ["B"],
  },
  {
    key: "no_refined",
    pillar: 4,
    label: "Sin azúcar refinada ni ultraprocesados",
    time: "todo el día",
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
  },
  {
    key: "protein_breakfast",
    pillar: 4,
    label: "Romper ayuno con proteína + grasa",
    time: "mañana",
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
  },
  {
    key: "omega3_meal",
    pillar: 4,
    label: "Comida con omega-3 · pescado / nueces",
    time: "almuerzo o cena",
    action: null,
    weekFrom: 3,
    phenotypes: ["C"],
  },

  // ── PILAR 5 · Hormesis ────────────────────────────────────────
  {
    key: "cold_shower",
    pillar: 5,
    label: "Ducha fría final · 30-60 seg",
    time: "ducha",
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
  },
  {
    key: "heat_session",
    pillar: 5,
    label: "Baño caliente prolongado · 20 min",
    time: "tarde",
    action: null,
    weekFrom: 3,
    phenotypes: ["B"],
  },
  {
    key: "brief_sprint",
    pillar: 5,
    label: "Sprints breves · 4-6 x 15 seg con descanso",
    time: "mañana",
    action: null,
    weekFrom: 4,
    phenotypes: ["A", "C"],
  },
  {
    key: "sauna_heat",
    pillar: 5,
    label: "Sauna · 15-20 min a 80-100°C",
    time: "tarde",
    action: null,
    weekFrom: 4,
    phenotypes: ["A", "B", "C"],
  },
];

/**
 * Devuelve las tareas activas para un día y fenotipo dados.
 * La semana se calcula desde el día del programa (1-28).
 */
export function getTasksForDay(phenotype, day) {
  const week = Math.ceil(Math.max(1, day) / 7);
  return ALL_TASKS.filter(
    (t) => t.phenotypes.includes(phenotype) && t.weekFrom <= week
  );
}

export const PILLAR_LABELS = {
  1: "Pilar 1 · vagal",
  2: "Pilar 2 · movimiento",
  3: "Pilar 3 · circadiano",
  4: "Pilar 4 · nutrición",
  5: "Pilar 5 · hormesis",
};

export const PILLAR_COLORS = {
  1: "text-chloro",
  2: "text-sage",
  3: "text-good",
  4: "text-gold",
  5: "text-warn",
};
