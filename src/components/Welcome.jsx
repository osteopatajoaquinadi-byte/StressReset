export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sage-soft flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-10 sm:py-16">
        <div className="font-serif text-chloro text-base font-medium mb-auto flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-chloro rotate-45" />
          Stress Reset
        </div>

        <div className="flex-1 flex flex-col justify-center py-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-sage mb-5">
            Basado en PNI clínica · 28 días
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium leading-tight tracking-tight text-ink mb-5">
            Descubramos cómo está respondiendo tu <em className="italic text-chloro">sistema nervioso</em>.
          </h1>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-4">
            Vamos a evaluar, a través de 24 preguntas breves, cómo se
            encuentra tu sistema nervioso en este momento. Con ese resultado
            podemos estructurar un plan ajustado a lo que tu cuerpo necesita
            — no al promedio.
          </p>
          <p className="text-ink-soft text-[14px] leading-relaxed mb-8">
            Toma unos 4 minutos. No hay respuestas correctas ni incorrectas
            — solo tu experiencia reciente.
          </p>

          <div className="flex flex-col gap-2.5 mb-8">
            {[
              "Identificamos tu patrón de estrés (fenotipo A, B o C)",
              "Te mostramos qué hacer y qué evitar según tu resultado",
              "Te proponemos un plan personalizado de 28 días",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 text-sm text-sage font-medium">
                <span className="w-1 h-1 rounded-full bg-chloro flex-shrink-0 mt-1.5" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors"
        >
          Comenzar evaluación
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-mute text-center mt-4">
          Joaquín Adi · Clínica Sakros
        </p>
      </div>
    </div>
  );
}
