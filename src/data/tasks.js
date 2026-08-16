// Tareas del plan de 28 días — Stress Reset
// Clasificación de evidencia auditada 2025:
//   A = ECAs / meta-análisis con efecto robusto → ⭐ Esencial (si además required=true)
//   B = mecanismo claro + estudios positivos → Recomendada
//   C = plausibilidad + evidencia escasa → Opcional (◦)
//
// sortOrder = horario del día para ordenar (formato HHMM):
//   600  = al despertar
//   700-730 = mañana temprano (respiración, caminata)
//   750  = ducha matutina
//   800-830 = desayuno
//   900  = mañana media (pausas activas empiezan aquí)
//   1000 = flexible / distribuido durante el día
//   1200-1400 = mediodía / almuerzo
//   1700 = tarde
//   2000 = cena
//   2130-2230 = pre-sueño y sueño

const ALL_TASKS = [
  // ── PILAR 1 · Regulación autonómica ─────────────────────────
  {
    key: "breathing_morning",
    pillar: 1,
    label: "Respiración matutina · 5 min",
    time: "7:00",
    sortOrder: 700,
    action: "breathing",
    breathingType: "morning",
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "physiological_sigh",
    pillar: 1,
    label: "Suspiro fisiológico · 5 min",
    time: "cualquier momento",
    sortOrder: 1000,
    action: "breathing",
    breathingType: "sigh",
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "breathing_evening",
    pillar: 1,
    label: "Respiración pre-sueño · 5 min",
    time: "22:30",
    sortOrder: 2230,
    action: "breathing",
    breathingType: "evening",
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "weighted_blanket",
    pillar: 1,
    label: "Manta pesada · 15-20 min antes de dormir",
    time: "22:00",
    sortOrder: 2200,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B"],
    evidence: "B",
    required: false,
  },
  {
    key: "concentrative_meditation",
    pillar: 1,
    label: "Meditación concentrativa · 5-10 min",
    time: "mañana o noche",
    sortOrder: 830,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
    evidence: "C",
    required: false,
  },

  // ── PILAR 2 · Movimiento ─────────────────────────────────────
  {
    key: "morning_walk",
    pillar: 2,
    label: "Caminata con luz solar · 20 min",
    time: "7:30",
    sortOrder: 730,
    action: null,
    weekFrom: 1,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "strength_session",
    pillar: 2,
    label: "Sesión de fuerza · 30-40 min",
    time: "mañana o tarde",
    sortOrder: 1000,
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "restorative_movement",
    pillar: 2,
    label: "Movimiento suave · yoga / estiramientos",
    time: "mañana o tarde",
    sortOrder: 1000,
    action: null,
    weekFrom: 3,
    phenotypes: ["B"],
    evidence: "B",
    required: false,
  },
  {
    key: "active_breaks",
    pillar: 2,
    label: "Pausa activa cada 30 min (3 min)",
    time: "todo el día",
    sortOrder: 900,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: false,
  },

  // ── PILAR 3 · Ritmos circadianos ─────────────────────────────
  {
    key: "consistent_wake",
    pillar: 3,
    label: "Misma hora de despertar que ayer",
    time: "al despertar",
    sortOrder: 600,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "dim_lights",
    pillar: 3,
    label: "Luz tenue 90 min antes de dormir",
    time: "21:30",
    sortOrder: 2130,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "no_screens",
    pillar: 3,
    label: "Sin pantallas brillantes · modo nocturno",
    time: "22:00",
    sortOrder: 2200,
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "B", "C"],
    evidence: "B",
    required: false,
  },
  {
    key: "cool_room",
    pillar: 3,
    label: "Habitación fresca · 18-20°C al dormir",
    time: "noche",
    sortOrder: 2245,
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
    evidence: "A",
    required: false,
  },

  // ── PILAR 4 · Nutrición / ayuno ──────────────────────────────
  {
    key: "protein_breakfast",
    pillar: 4,
    label: "Romper ayuno con proteína + grasa",
    time: "mañana",
    sortOrder: 820,
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
    evidence: "B",
    required: false,
  },
  {
    key: "fixed_meals_b",
    pillar: 4,
    label: "3 comidas a horario fijo · no saltear",
    time: "todo el día",
    sortOrder: 900,
    action: null,
    weekFrom: 2,
    phenotypes: ["B"],
    evidence: "B",
    required: true,
  },
  {
    key: "no_refined",
    pillar: 4,
    label: "Sin azúcar refinada ni ultraprocesados",
    time: "todo el día",
    sortOrder: 900,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "B", "C"],
    evidence: "A",
    required: true,
  },
  {
    key: "omega3_meal",
    pillar: 4,
    label: "Comida con omega-3 · pescado / nueces",
    time: "almuerzo o cena",
    sortOrder: 1300,
    action: null,
    weekFrom: 3,
    phenotypes: ["C"],
    evidence: "A",
    required: false,
  },
  {
    key: "eating_window_12",
    pillar: 4,
    label: "Ventana de comida 12:12 · cierra 20:00",
    time: "20:00",
    sortOrder: 2000,
    action: null,
    weekFrom: 2,
    phenotypes: ["A", "C"],
    evidence: "A",
    required: true,
  },

  // ── PILAR 5 · Hormesis ────────────────────────────────────────
  {
    key: "cold_shower",
    pillar: 5,
    label: "Ducha fría final · 30-60 seg",
    time: "ducha matutina",
    sortOrder: 750,
    action: null,
    weekFrom: 3,
    phenotypes: ["A", "C"],
    evidence: "B",
    required: false,
  },
  {
    key: "brief_sprint",
    pillar: 5,
    label: "Sprints breves · 4-6 × 15 seg",
    time: "mañana",
    sortOrder: 1030,
    action: null,
    weekFrom: 4,
    phenotypes: ["A", "C"],
    evidence: "B",
    required: false,
  },
  {
    key: "heat_session",
    pillar: 5,
    label: "Baño caliente prolongado · 20 min",
    time: "tarde",
    sortOrder: 1700,
    action: null,
    weekFrom: 3,
    phenotypes: ["B"],
    evidence: "C",
    required: false,
  },
  {
    key: "sauna_heat",
    pillar: 5,
    label: "Sauna · 15-20 min a 80-100°C",
    time: "tarde",
    sortOrder: 1700,
    action: null,
    weekFrom: 4,
    phenotypes: ["A", "B", "C"],
    evidence: "B",
    required: false,
  },
];

/**
 * Devuelve las tareas activas para un día y fenotipo dados,
 * ordenadas cronológicamente por sortOrder.
 */
export function getTasksForDay(phenotype, day) {
  const week = Math.ceil(Math.max(1, day) / 7);
  return ALL_TASKS
    .filter((t) => t.phenotypes.includes(phenotype) && t.weekFrom <= week)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Clasificación visual de cada tarea basada en evidencia + required.
 * Devuelve: 'essential' | 'recommended' | 'optional'
 */
export function classifyTask(task) {
  if (task.required && task.evidence === "A") return "essential";
  if (task.required && task.evidence === "B") return "essential";
  if (task.evidence === "C") return "optional";
  return "recommended";
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

export const EVIDENCE_LABELS = {
  A: "Evidencia firme",
  B: "Evidencia razonable",
  C: "Evidencia limitada",
};
