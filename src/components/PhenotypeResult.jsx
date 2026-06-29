import { PHENOTYPES } from "../data/phenotypes";

export default function PhenotypeResult({ result, onRestart }) {
  const dominant = PHENOTYPES[result.dominant];
  const secondary = result.secondary ? PHENOTYPES[result.secondary] : null;

  return (
    <div className="min-h-screen bg-bone flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Banner */}
        <div
          className="px-6 pt-8 pb-7 text-paper"
          style={{ backgroundColor: dominant.color }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full mb-4">
            <span className="bg-paper text-[9.5px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ color: dominant.color }}>
              {dominant.key}
            </span>
            {result.isMixed ? "Tu fenotipo dominante (mixto)" : "Tu fenotipo dominante"}
          </div>
          <h1 className="font-serif text-[26px] font-medium leading-tight tracking-tight mb-2">
            {dominant.name.split(" ").map((w, i) =>
              i === dominant.name.split(" ").length - 1 ? (
                <em key={i} className="italic">{w}</em>
              ) : (
                <span key={i}>{w} </span>
              )
            )}
          </h1>
          <p className="italic text-[13px] opacity-90">"{dominant.phrase}"</p>

          <div className="flex items-center gap-1.5 mt-4 font-mono text-[10.5px] opacity-85">
            <span>A</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden flex">
              <span className="h-full bg-paper" style={{ width: `${result.percentages.A}%` }} />
              <span className="h-full bg-white/50" style={{ width: `${result.percentages.B}%` }} />
              <span className="h-full bg-white/30" style={{ width: `${result.percentages.C}%` }} />
            </div>
            <span>
              {result.percentages.A}·{result.percentages.B}·{result.percentages.C}
            </span>
          </div>

          {result.isMixed && secondary && (
            <p className="font-mono text-[10px] uppercase tracking-wide opacity-80 mt-3">
              Mixto con rasgos de {secondary.key} · {secondary.name}
            </p>
          )}
          {result.gutSubtype && (
            <p className="font-mono text-[10px] uppercase tracking-wide opacity-80 mt-1">
              Subtipo intestinal: {result.gutSubtype}{" "}
              {result.gutSubtype === "C2" ? "(intestino predominante)" : "(sin predominio intestinal claro)"}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 flex-1">
          <p className="text-[12.5px] text-ink-soft leading-relaxed mb-5">
            {dominant.description}
          </p>

          <ResultBlock label="● Señales típicas en tu resultado" items={dominant.signs} tone="neutral" />
          <ResultBlock label="● Lo que SÍ al inicio" items={dominant.doFirst} tone="good" />
          <ResultBlock label="○ Lo que NO al inicio" items={dominant.avoidFirst} tone="warn" />

          {result.isMixed && secondary && (
            <div className="mt-6 p-4 bg-sage-soft rounded-xl border border-[#D4E0D7]">
              <p className="font-mono text-[9.5px] uppercase tracking-widest text-chloro mb-2">
                Tienes rasgos secundarios de {secondary.key}
              </p>
              <p className="text-[12px] text-ink-soft leading-relaxed">
                Trabaja primero las recomendaciones de tu fenotipo dominante. A
                las 4 semanas, reevalúa — es común que el puntaje secundario
                baje también, porque los fenotipos se sostienen entre sí.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gold-soft border-l-2 border-gold rounded-r-xl">
            <p className="font-mono text-[9.5px] uppercase tracking-widest text-gold font-semibold mb-1.5">
              Pista práctica
            </p>
            <p className="text-[11.5px] text-ink-soft leading-relaxed">
              Este resultado es una primera hipótesis, no una etiqueta fija. A
              medida que practiques los pilares, vas a afinar tu lectura de tu
              propio cuerpo.
            </p>
          </div>
        </div>

        <div className="px-6 pb-8">
          <button
            onClick={onRestart}
            className="w-full font-sans text-[12.5px] text-sage border border-line rounded-xl py-3 hover:border-sage transition-colors"
          >
            Repetir evaluación
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultBlock({ label, items, tone }) {
  const toneColor =
    tone === "good" ? "text-good" : tone === "warn" ? "text-warn" : "text-sage";
  return (
    <div className="mb-5">
      <p className={`font-mono text-[9.5px] uppercase tracking-widest font-semibold mb-2 ${toneColor}`}>
        {label}
      </p>
      <ul className="text-[12px] text-ink-soft leading-relaxed space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-mute">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
