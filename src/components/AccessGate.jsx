import { PHENOTYPES } from "../data/phenotypes";
import { BrandMark } from "./Brand";

// URL del producto en Hotmart. Cambiar cuando se cree.
const HOTMART_PRODUCT_URL = "https://pay.hotmart.com/XXXXX";

/**
 * Muro de acceso comercial.
 * Aparece cuando:
 *   - El usuario terminó el quiz pero no tiene acceso pagado
 *   - Se le muestra el fenotipo con una vista parcial (gancho)
 *   - Botón para comprar en Hotmart
 *   - Botón secundario "Ya compré" que abre auth
 *
 * Estado "expired" / "revoked" muestra variante distinta.
 */
export default function AccessGate({ result, status, onSignIn, onGoBack }) {
  const phenotype = result ? PHENOTYPES[result.dominant] : null;

  const isExpired = status === "expired";
  const isRevoked = status === "revoked";
  const isPreview = !status || status === "free" || status === "loading";

  const title = isExpired
    ? "Tu acceso expiró"
    : isRevoked
    ? "Tu acceso fue revocado"
    : "Empieza tu programa de 28 días";

  const intro = isExpired
    ? "Tu acceso al programa Stress Reset venció. Puedes renovarlo para volver a acceder a tu plan personalizado, las sesiones de respiración y todas las herramientas."
    : isRevoked
    ? "Tu acceso fue revocado (posiblemente por reembolso o chargeback). Si crees que es un error, escríbenos."
    : phenotype
    ? `Ya conocemos tu fenotipo: ${phenotype.key} · ${phenotype.name}. Ahora accede al programa completo de 28 días personalizado a tu perfil.`
    : "Accede al programa completo de 28 días personalizado a tu fenotipo de estrés.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-sage-soft flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <BrandMark size="sm" />
          {onGoBack && (
            <button onClick={onGoBack} className="font-mono text-[9px] uppercase tracking-widest text-mute">
              ← Volver
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center py-6">
          {isPreview && phenotype && (
            <div
              className="rounded-2xl text-paper p-5 mb-6"
              style={{ background: phenotype.color }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-80 mb-1">
                Tu fenotipo
              </div>
              <div className="font-serif text-[24px] leading-tight font-medium mb-1">
                {phenotype.key} · <em className="italic">{phenotype.name}</em>
              </div>
              <p className="text-[13px] opacity-90 italic mt-2">"{phenotype.phrase}"</p>
            </div>
          )}

          <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-3">
            Stress Reset · Programa completo
          </div>
          <h1 className="font-serif text-[26px] font-medium tracking-tight text-ink leading-tight mb-4">
            {title}
          </h1>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-6">
            {intro}
          </p>

          {isPreview && (
            <div className="bg-paper border border-line rounded-xl p-4 mb-6">
              <div className="font-mono text-[9.5px] uppercase tracking-widest text-chloro font-semibold mb-3">
                Qué incluye
              </div>
              <ul className="space-y-2.5">
                {[
                  "Plan personalizado de 28 días según tu fenotipo",
                  "Sesiones guiadas de respiración (5-5, 4-8, 4-2-6-2, suspiro fisiológico)",
                  "5 pilares con protocolo específico y explicación clínica",
                  "Seguimiento diario con tareas y progreso",
                  "12 meses de acceso completo desde tu compra",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[12.5px] text-ink-soft leading-snug">
                    <span className="text-chloro flex-shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isRevoked && (
            <a
              href={HOTMART_PRODUCT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl text-center hover:bg-chloro-deep transition-colors mb-3"
            >
              {isExpired ? "Renovar acceso" : "Empezar programa"}
            </a>
          )}

          <button
            onClick={onSignIn}
            className="w-full text-[13px] text-sage border border-line rounded-xl py-3 hover:border-sage transition-colors"
          >
            {isPreview ? "Ya compré · Iniciar sesión" : "Iniciar sesión"}
          </button>

          {isRevoked && (
            <p className="text-[11px] text-mute text-center mt-4">
              Contacto: hola@sakros.cl
            </p>
          )}
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-mute text-center">
          Joaquín Adi · Clínica Sakros
        </p>
      </div>
    </div>
  );
}
