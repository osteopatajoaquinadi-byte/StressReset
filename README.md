# Stress Reset — App

Plataforma companion del ebook *Stress Reset* (gestión del estrés crónico
basada en psiconeuroinmunología clínica). Motor de evaluación y fenotipado
en React.

## Qué hace esta versión (MVP)

- **Autoevaluación de 24 ítems** en 3 bloques (activación simpática / colapso
  dorsal / carga inflamatoria), validada en la Edición Paciente del ebook
  (Capítulo 7).
- **Motor de cálculo de fenotipo real**: determina el fenotipo dominante
  (A · Motor revolucionado / B · Motor apagado / C · Cuerpo inflamado),
  detecta resultados mixtos (diferencia ≤ 3 puntos entre los dos bloques
  más altos), y — si C es dominante — activa un sub-cuestionario intestinal
  de 5 ítems para distinguir subtipo C1/C2.
- **Pantalla de resultado** con recomendaciones específicas ("lo que SÍ /
  lo que NO al inicio") por fenotipo.

## Stack

- React 18 + Vite
- Tailwind CSS (paleta y tipografías propias — ver `tailwind.config.js`)
- Sin backend por ahora — todo el cálculo corre en el cliente. Migración a
  Supabase planeada si el producto valida tracción comercial.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
```

Genera `dist/` listo para desplegar en Vercel (output estático).

## Estructura

```
src/
  data/
    quizQuestions.js   — las 24 preguntas + sub-bloque intestinal
    phenotypes.js       — contenido de los 3 fenotipos (señales, qué sí/no)
  utils/
    scoring.js          — motor de cálculo de fenotipo
  components/
    Welcome.jsx
    Assessment.jsx       — quiz paso a paso, reutilizado para el sub-bloque
    PhenotypeResult.jsx
  App.jsx                — orquesta el flujo: welcome → quiz → (gut quiz) → result
```

## Roadmap

- [ ] Dashboard diario (Pilares 1-5, tracking de HRV)
- [ ] Sesión de respiración guiada con temporizador real
- [ ] Plan de 28 días (calendario + contenido diario por fenotipo)
- [ ] Persistencia (Supabase) y autenticación
- [ ] Integración con Hotmart (compra → acceso)

---

Joaquín Adi · Clínica Sakros · [stressreset.cl](https://stressreset.cl)
