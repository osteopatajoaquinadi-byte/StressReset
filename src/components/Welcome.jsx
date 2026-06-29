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
          <h1 className="font-serif text-3xl sm:text-4xl font-medium leading-tight tracking-tight text-ink mb-4">
            No todos los estreses se <em className="italic text-chloro">regulan</em> igual.
          </h1>
          <p className="text-ink-soft text-[15px] leading-relaxed mb-8">
            Tu sistema nervioso tiene un patrón. Lo identificamos con una
            evaluación de 4 minutos y te mostramos exactamente qué hacer con
            tu resultado — no con el promedio.
          </p>

          <div className="flex flex-col gap-2.5 mb-8">
            {[
              "Fenotipado clínico de estrés (A · B · C)",
              "Recomendaciones específicas para tu patrón",
              "Basado en neurofisiología, PNI y medicina evolutiva",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-sage font-medium">
                <span className="w-1 h-1 rounded-full bg-chloro flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors"
        >
          Empezar evaluación
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-mute text-center mt-4">
          Joaquín Adi · Clínica Sakros
        </p>
      </div>
    </div>
  );
}
