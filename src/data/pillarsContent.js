// Contenido educativo de los 5 pilares — Stress Reset
// Fuente: StressReset_Paciente caps 8-12

export const PILLARS_CONTENT = [
  {
    id: 1,
    key: "vagal",
    name: "Regulación autonómica",
    shortName: "Vagal",
    tagline: "Tu nervio vago como interruptor",
    color: "#1E5F3F",
    icon: "🫁",
    intro:
      "La respiración es el único proceso autonómico que puedes controlar " +
      "voluntariamente. Cuando cambias tu ritmo respiratorio, le mandas señales " +
      "directas a tu sistema nervioso. A diferencia de pensar 'cálmate', " +
      "respirar de cierta manera realmente activa los circuitos fisiológicos de la calma.",
    benefits: [
      "Activa el tono vagal (el freno del sistema nervioso)",
      "Amplifica la arritmia sinusal respiratoria",
      "Baja la frecuencia cardíaca y la presión arterial",
      "Mejora la variabilidad cardíaca (HRV) en semanas",
      "Reduce la latencia de sueño (te duermes más rápido)",
    ],
    byPhenotype: {
      A: "Respiración 5-5 diaria + exhalación larga 4-8 antes de dormir. " +
         "Tu sistema está en activación permanente — el foco es frenar.",
      B: "Respiración 4-2-6-2 (activante, no calmante). Tu sistema está " +
         "colapsado — necesitas despertar el vago ventral, no calmarlo más.",
      C: "Respiración 5-5 como base. Combinala con inmersión facial fría " +
         "y caminata sin teléfono para máximo efecto antiinflamatorio.",
    },
    action: { type: "breathing", label: "Iniciar sesión de respiración" },
  },
  {
    id: 2,
    key: "movement",
    name: "Movimiento",
    shortName: "Movimiento",
    tagline: "Pausas activas > gimnasio",
    color: "#5B7A6A",
    icon: "🚶",
    intro:
      "El problema no es solo que te muevas poco — es que estás quieto demasiadas " +
      "horas seguidas. Una persona que va al gimnasio 3 veces por semana pero pasa " +
      "10 horas sentada, está peor que alguien que se mueve repartido todo el día.",
    benefits: [
      "Reactiva la lipoproteína lipasa muscular (limpia grasas de la sangre)",
      "Mantiene la sensibilidad a la insulina en el músculo activo",
      "Reduce la activación simpática de bajo grado por inactividad",
      "La masa muscular es el órgano más antiinflamatorio que tienes",
      "El NEAT (movimiento espontáneo) puede representar 300-700 kcal/día",
    ],
    byPhenotype: {
      A: "Aeróbico Zona 2 (3-4x/sem) + fuerza moderada (2x/sem). " +
         "Evita HIIT diario — suma cortisol sobre cortisol.",
      B: "Caminata diaria al aire libre (empezar con 10-15 min). " +
         "Si después del ejercicio quedas más cansado 24-48h, te pasaste.",
      C: "Mix aeróbico + fuerza (3-4x/sem). El ejercicio libera IL-6 muscular " +
         "antiinflamatoria. Vigila la recuperación.",
    },
    action: null,
    rule: "Regla 30/3: cada 30 minutos sentado, levántate y muévete 3 minutos.",
  },
  {
    id: 3,
    key: "circadian",
    name: "Ritmos circadianos",
    shortName: "Circadiano",
    tagline: "Tu reloj interno regula tu cortisol",
    color: "#2F7A52",
    icon: "☀️",
    intro:
      "Cuando tu ritmo circadiano se desordena, tu ritmo de cortisol se desordena " +
      "con él. Y un cortisol desordenado es, casi por definición, un sistema de " +
      "estrés desregulado. Arreglar tu ritmo es directamente arreglar tu cortisol.",
    benefits: [
      "Restaura el pico matutino de cortisol (CAR — cortisol awakening response)",
      "Permite la cascada nocturna de melatonina y reparación",
      "Resincroniza el ritmo del sistema inmune (relevante para fenotipo C)",
      "Reduce el 'jet lag social' de fin de semana",
      "Mejora la calidad y arquitectura del sueño",
    ],
    byPhenotype: {
      A: "Énfasis en apagar la noche: reducir luz 90 min antes de dormir, " +
         "respiración 4-8, no ejercicio intenso después de las 19:00.",
      B: "Énfasis en despertar potente: luz solar matutina brillante, " +
         "actividad física suave temprano, no dormir de más.",
      C: "Énfasis en consistencia: horarios fijos de sueño-vigilia " +
         "incluso los fines de semana, por el efecto sobre el ritmo inmune.",
    },
    action: null,
    protocol: [
      "Mañana: luz natural en los primeros 30-60 min. Sin lentes de sol.",
      "Cafeína: postergar 60-90 min tras despertar.",
      "Noche: luces cálidas y tenues 90 min antes de dormir.",
      "Temperatura: habitación fresca (18-20°C).",
      "Cierre de comida 3 horas antes de acostarse.",
    ],
  },
  {
    id: 4,
    key: "nutrition",
    name: "Nutrición y ayuno",
    shortName: "Ayuno",
    tagline: "Comer, ayunar, no inflamarte",
    color: "#C49A3F",
    icon: "🍽️",
    intro:
      "El ayuno intermitente no es 'saltarse el desayuno'. Es una intervención " +
      "metabólica con efectos documentados en sensibilidad a la insulina, autofagia, " +
      "sensibilidad al cortisol y reparación intestinal. No necesitas tener un perfil " +
      "inflamatorio para beneficiarte — cualquier fenotipo puede aplicarlo con la " +
      "dosificación correcta.",
    benefits: [
      "Beta-hidroxibutirato inhibe directamente el inflamasoma NLRP3",
      "Restaura la sensibilidad a la insulina",
      "Activa autofagia (limpieza celular) a partir de 14-16h de ayuno",
      "Reactiva el complejo motor migratorio (barrido intestinal)",
      "Resensibiliza el receptor glucocorticoide (mejora tu respuesta al cortisol)",
      "Estabiliza la glucemia y reduce la inflamación postprandial",
    ],
    byPhenotype: {
      A: "Ventana 12:12 estable, alineada con luz solar. " +
         "Si toleras bien tras 2 semanas, opcional progresar a 14:10. " +
         "No partas con 16:8 — puede agravar la ansiedad.",
      B: "Ventana 12:12 SOLAMENTE. No progreses a ayunos más largos. " +
         "Prioriza densidad nutricional: proteína, hierro, B12, vitamina D. " +
         "La cetogénica está contraindicada al inicio.",
      C: "Ventana 12:12 → 14:10 → 16:8 según tolerancia. Aquí está " +
         "el mayor beneficio antiinflamatorio. Combina con eliminación " +
         "de gluten/A1 si tienes síntomas digestivos.",
    },
    action: { type: "fasting", label: "Activar tracker de ayuno" },
    rules: [
      "Rompe el ayuno con proteína + grasa, nunca con azúcar.",
      "Hidratación abundante: agua, té, café sin azúcar están permitidos.",
      "Cierra la ventana 3 horas antes de dormir.",
      "Si aparece mareo, taquicardia o irritabilidad: reduce inmediatamente.",
    ],
    warning:
      "Si tienes antecedentes de TCA, estás embarazada, en lactancia, " +
      "o tienes diabetes insulino-dependiente, consulta con tu médico antes.",
  },
  {
    id: 5,
    key: "hormesis",
    name: "Hormesis",
    shortName: "Hormesis",
    tagline: "Estresores breves que te hacen más fuerte",
    color: "#B8651E",
    icon: "🧊",
    intro:
      "La hormesis es una respuesta bifásica: dosis bajas y agudas de un estresor " +
      "generan adaptación; dosis altas y sostenidas generan daño. Tu sistema " +
      "necesita olas — subir y bajar. Lo que lo enferma es quedarse en marea " +
      "alta permanente. Estas herramientas le devuelven la oscilación.",
    benefits: [
      "Frío: liberación sostenida de noradrenalina y dopamina (horas)",
      "Frío: activa grasa parda termogénica y antiinflamatoria",
      "Calor/sauna: eleva proteínas de choque térmico (HSP) y hormona del crecimiento",
      "Hipoxia controlada: modula sistema nervioso autónomo",
      "Sprints breves: pulso agudo de cortisol que resensibiliza el receptor",
    ],
    byPhenotype: {
      A: "Frío moderado (30-90 seg), nunca como primera práctica si estás ansioso. " +
         "Calor: libre. Sprints: 1x/semana máximo al inicio.",
      B: "EVITAR frío al inicio — puede profundizar el colapso. Solo agua fresca. " +
         "Calor: sí, es activante y seguro. Sprints: solo cuando toleres ejercicio moderado.",
      C: "Frío: muy beneficioso para ti (efecto antiinflamatorio directo). " +
         "Calor: sí. Sprints: 1-2x/semana vigilando recuperación.",
    },
    action: null,
    tools: [
      {
        name: "Ducha fría",
        protocol: "Sem 1-2: 30-60 seg agua fría al final. Sem 3-4: 1-2 min. Avanzado: 2-3 min completos.",
        tip: "Respira lento durante el frío. Si jadeas, estás activando pánico, no adaptación.",
      },
      {
        name: "Sauna / baño caliente",
        protocol: "15-20 min a 80-100°C, 2-4x/semana. Alternativa: baño caliente 20 min.",
      },
      {
        name: "Sprints breves",
        protocol: "4-6 repeticiones de 15-20 seg al máximo, con 1-2 min de descanso completo entre cada una.",
      },
    ],
  },
];
