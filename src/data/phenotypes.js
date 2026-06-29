// Contenido de los tres fenotipos — Stress Reset
// Fuente: StressReset_Paciente_Parte2_caps7-9_v0.3.pdf, Capítulo 7

export const PHENOTYPES = {
  A: {
    key: "A",
    name: "Motor revolucionado",
    phrase: "Estoy acelerado, no puedo apagar.",
    description:
      "Predominio simpático. El acelerador del sistema nervioso está pegado. " +
      "Tu cuerpo se quedó en modo amenaza, aunque la amenaza ya no esté.",
    color: "#1E5F3F",
    signs: [
      "Ansiedad, sensación de estar \u201cal límite\u201d",
      "Taquicardia o palpitaciones sin causa clara",
      "Insomnio de conciliación (te cuesta dormirte)",
      "Irritabilidad, impaciencia, reactividad emocional",
      "Tensión muscular sostenida (mandíbula, cuello, hombros)",
      "Dificultad para relajarte aunque tengas tiempo",
      "Despertares con sobresalto o muy temprano",
    ],
    doFirst: [
      "Respiración lenta 5-5 (o 4-8 antes de dormir)",
      "Prácticas vagales (inmersión facial fría, canto, gárgaras)",
      "Dormir temprano, horario consistente",
      "Aeróbico moderado · Zona 2",
      "Magnesio",
      "Ayuno corto 12:12 alineado con luz solar",
    ],
    avoidFirst: [
      "Entrenamiento de alta intensidad diario",
      "Ayunos largos (16:8 o más) sin estabilizar primero",
      "Frío extremo",
      "Cafeína vespertina, estimulantes",
    ],
  },
  B: {
    key: "B",
    name: "Motor apagado",
    phrase: "No tengo cuerda para nada.",
    description:
      "Predominio dorsal (rama vagal de inmovilización). Tu sistema nervioso " +
      "se replegó como estrategia de protección. Es la respuesta de " +
      "\u201chacerte el muerto\u201d sostenida en el tiempo.",
    color: "#5B7A6A",
    signs: [
      "Fatiga profunda, agotamiento sin esfuerzo",
      "Anhedonia (cosas que disfrutabas ya no te llaman)",
      "Embotamiento emocional, sensación de \u201cestar detrás de un vidrio\u201d",
      "Hipersomnia o necesidad imperiosa de siestas",
      "Hipotensión, mareo al ponerte de pie",
      "Disminución del deseo sexual",
      "Pensamientos lentos, sensación de \u201cestar congelado\u201d",
    ],
    doFirst: [
      "Exposición a luz solar matutina",
      "Caminata diaria al aire libre",
      "Contacto social cálido",
      "Prácticas vagales activantes (canto, gárgaras, espiración corta)",
      "Comer suficiente, a horarios fijos",
    ],
    avoidFirst: [
      "Ayunos largos",
      "Dietas restrictivas",
      "Frío intenso",
      "Meditaciones largas en silencio",
      "Aislamiento, sobreesfuerzo físico",
    ],
  },
  C: {
    key: "C",
    name: "Cuerpo inflamado",
    phrase: "Me duele todo y no es por nada.",
    description:
      "Predominio neuroinflamatorio. El problema central no es nervioso sino " +
      "inmune-metabólico: inflamación crónica de bajo grado que afecta " +
      "cerebro, intestino y músculo.",
    color: "#C49A3F",
    signs: [
      "Dolor difuso, articular o muscular sin causa clara",
      "Niebla mental, dificultad de concentración",
      "Síntomas digestivos (hinchazón, gases, tránsito irregular)",
      "Sensibilidades alimentarias múltiples",
      "Infecciones leves recurrentes",
      "Sensación de \u201csiempre estar con algo\u201d",
      "Fatiga que no mejora con descanso",
    ],
    doFirst: [
      "Nutrición densa en omega-3, polifenoles y fibra fermentable",
      "Ayuno intermitente progresivo",
      "Exposición a frío breve",
      "Movimiento frecuente",
      "Sueño bien estructurado",
      "Eliminación de prueba de gluten/A1 si predomina C2",
    ],
    avoidFirst: [
      "Dietas ultraprocesadas o altas en azúcar refinado",
      "Alcohol regular",
      "Falta de sueño sostenida",
      "Ejercicio de alta intensidad diario sin recuperación",
      "AINEs crónicos",
    ],
  },
};

export const PHENOTYPE_ORDER = ["A", "B", "C"];
