import { useState } from "react";
import { PILLARS_CONTENT } from "../data/pillarsContent";

export default function PillarsHub({ profile, onOpenBreathing }) {
  const [expanded, setExpanded] = useState(null);
  const phenotype = profile.phenotype;

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-24">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
        Intervenciones · Fenotipo {phenotype}
      </div>
      <h1 className="font-serif text-[22px] font-medium tracking-tight text-ink leading-snug mb-2">
        Los cinco <em className="italic text-chloro">pilares</em>.
      </h1>
      <p className="text-[13px] text-ink-soft leading-relaxed mb-6">
        Cada pilar actúa sobre un mecanismo distinto. Las recomendaciones están
        adaptadas a tu fenotipo — no son genéricas.
      </p>

      <div className="flex flex-col gap-3">
        {PILLARS_CONTENT.map((pillar) => {
          const isOpen = expanded === pillar.id;
          const rec = pillar.byPhenotype[phenotype];

          return (
            <div
              key={pillar.id}
              className={`rounded-xl border transition-colors overflow-hidden ${
                isOpen ? "border-line bg-paper" : "border-line bg-paper hover:border-sage"
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : pillar.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <span className="text-[22px] flex-shrink-0">{pillar.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-ink">{pillar.name}</div>
                  <div className="text-[11.5px] text-mute">{pillar.tagline}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12"
                  className={`text-mute transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-5 border-t border-line/50">
                  {/* Intro */}
                  <p className="text-[12.5px] text-ink-soft leading-relaxed mt-4 mb-4">
                    {pillar.intro}
                  </p>

                  {/* Benefits */}
                  <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
                    Beneficios
                  </div>
                  <ul className="mb-4 space-y-1.5">
                    {pillar.benefits.map((b, i) => (
                      <li key={i} className="flex gap-2 text-[12px] text-ink-soft leading-snug">
                        <span className="text-chloro flex-shrink-0 mt-0.5">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* For your phenotype */}
                  <div className="p-3.5 rounded-xl border-l-2 mb-4"
                    style={{ borderColor: pillar.color, background: "#EBF1ED" }}>
                    <div className="font-mono text-[9.5px] uppercase tracking-widest mb-1.5"
                      style={{ color: pillar.color }}>
                      Para tu fenotipo {phenotype}
                    </div>
                    <p className="text-[12px] text-ink-soft leading-relaxed">{rec}</p>
                  </div>

                  {/* Protocol list if present */}
                  {pillar.protocol && (
                    <div className="mb-4">
                      <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-2">
                        Protocolo mínimo
                      </div>
                      {pillar.protocol.map((step, i) => (
                        <div key={i} className="flex gap-2 text-[12px] text-ink-soft leading-snug mb-1.5">
                          <span className="text-mute flex-shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rules if present */}
                  {pillar.rules && (
                    <div className="mb-4">
                      <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-2">
                        Reglas no negociables
                      </div>
                      {pillar.rules.map((r, i) => (
                        <div key={i} className="flex gap-2 text-[12px] text-ink-soft leading-snug mb-1.5">
                          <span className="text-gold flex-shrink-0">▸</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rule callout */}
                  {pillar.rule && (
                    <div className="p-3 bg-gold-soft border-l-2 border-gold rounded-r-xl mb-4">
                      <div className="font-mono text-[9.5px] uppercase tracking-widest text-gold font-semibold mb-1">
                        Regla clave
                      </div>
                      <p className="text-[12px] text-ink-soft">{pillar.rule}</p>
                    </div>
                  )}

                  {/* Warning */}
                  {pillar.warning && (
                    <div className="p-3 bg-bone rounded-xl mb-4">
                      <p className="text-[11px] text-warn leading-relaxed">
                        ⚠ {pillar.warning}
                      </p>
                    </div>
                  )}

                  {/* Tools (hormesis) */}
                  {pillar.tools && (
                    <div className="mb-4">
                      <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-2">
                        Herramientas
                      </div>
                      {pillar.tools.map((tool, i) => (
                        <div key={i} className="p-3 bg-bone rounded-xl mb-2">
                          <div className="text-[13px] font-medium text-ink mb-1">{tool.name}</div>
                          <p className="text-[11.5px] text-ink-soft leading-relaxed">{tool.protocol}</p>
                          {tool.tip && (
                            <p className="text-[11px] text-sage italic mt-1.5">{tool.tip}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  {pillar.action && (
                    <button
                      onClick={() => {
                        if (pillar.action.type === "breathing") onOpenBreathing();
                      }}
                      className="w-full text-[13px] font-medium py-3 rounded-xl border border-chloro text-chloro hover:bg-sage-soft transition-colors"
                    >
                      {pillar.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
