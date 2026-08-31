import { PHENOTYPES } from "../data/phenotypes";
import { BrandMark } from "./Brand";

// URLs de Hotmart — reemplazar con URLs reales al crear los productos.
const HOTMART_URLS = {
  week1: "https://pay.hotmart.com/PRODUCT_WEEK1",
  full: "https://pay.hotmart.com/PRODUCT_FULL",
  upgrade: "https://pay.hotmart.com/PRODUCT_UPGRADE", // week1 → full (USD 30)
};

export default function AccessGate({
  result, status, tier,
  onSignIn, onGoBack,
  reason = "start",   // 'start' | 'lockedTask' | 'lockedWeek' | 'lockedPattern'
}) {
  const phenotype = result ? PHENOTYPES[result.dominant || result.phenotype] : null;

  const isExpired = status === "expired";
  const isRevoked = status === "revoked";
  const isUpgrade = tier === "week1";
  const isSignedIn = status === "paid" || status === "trial" || status === "expired" || status === "revoked" || tier !== "free";

  let title, intro;
  if (isRevoked) {
    title = "Tu acceso fue revocado";
    intro = "Contáctanos si crees que fue un error.";
  } else if (isExpired) {
    title = "Tu acceso expiró";
    intro = "Puedes renovarlo para volver a acceder al programa.";
  } else if (isUpgrade) {
    title = "Completa tu programa";
    intro = phenotype
      ? `Tienes acceso a la semana 1. Continúa con las semanas 2, 3 y 4 del programa personalizado para tu fenotipo ${phenotype.key} · ${phenotype.name}.`
      : "Continúa con las semanas 2, 3 y 4 del programa completo.";
  } else if (reason === "lockedTask") {
    title = "Esta práctica requiere acceso";
    intro = "El suspiro fisiológico está disponible gratis. Para desbloquear el plan completo con las tareas de tu fenotipo, elige una opción.";
  } else if (reason === "lockedWeek") {
    title = "Desbloquea el programa completo";
    intro = "Ya estás usando la semana 1. Continúa el programa de 28 días para consolidar los cambios en tu sistema nervioso.";
  } else if (reason === "lockedPattern") {
    title = "Otras respiraciones";
    intro = "Además del suspiro fisiológico gratuito, el programa incluye respiración resonante 5-5, exhalación larga 4-8 y activación ventral 4-2-6-2 — cada una con su indicación clínica.";
  } else {
    title = "Empieza tu programa";
    intro = phenotype
      ? `Ya conocemos tu fenotipo: ${phenotype.key} · ${phenotype.name}. Elige cómo quieres empezar.`
      : "Elige cómo quieres empezar tu programa de regulación del estrés.";
  }

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

        <div className="flex-1 flex flex-col justify-center py-4">
          {phenotype && !isUpgrade && (
            <div className="rounded-2xl text-paper p-4 mb-5" style={{ background: phenotype.color }}>
              <div className="font-mono text-[9.5px] uppercase tracking-widest opacity-80 mb-1">
                Tu fenotipo
              </div>
              <div className="font-serif text-[22px] leading-tight font-medium">
                {phenotype.key} · <em className="italic">{phenotype.name}</em>
              </div>
            </div>
          )}

          <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
            Stress Reset
          </div>
          <h1 className="font-serif text-[24px] font-medium tracking-tight text-ink leading-tight mb-3">
            {title}
          </h1>
          <p className="text-[13.5px] text-ink-soft leading-relaxed mb-6">
            {intro}
          </p>

          {/* CTAs según variante */}
          {!isRevoked && (
            <div className="flex flex-col gap-3 mb-4">
              {isUpgrade ? (
                <PriceCard
                  eyebrow="Upgrade"
                  title="Programa completo · 28 días"
                  price="USD 30"
                  originalPrice="USD 40"
                  discountNote="Descuento aplicado por tu compra de semana 1"
                  features={[
                    "Semanas 2, 3 y 4 desbloqueadas",
                    "Todos los patrones de respiración",
                    "5 pilares con protocolo completo",
                    "12 meses de acceso",
                  ]}
                  href={HOTMART_URLS.upgrade}
                  featured
                />
              ) : isExpired ? (
                <>
                  <PriceCard
                    eyebrow="Renovar"
                    title="Programa completo · 28 días"
                    price="USD 40"
                    features={["Acceso completo por otros 12 meses"]}
                    href={HOTMART_URLS.full}
                    featured
                  />
                </>
              ) : (
                <>
                  <PriceCard
                    eyebrow="Prueba"
                    title="Semana 1 · Fundamentos"
                    price="USD 10"
                    features={[
                      "Respiración matutina y pre-sueño guiadas",
                      "Caminata con luz solar",
                      "Acceso permanente a la semana 1",
                      "Puedes actualizar al completo por USD 30",
                    ]}
                    href={HOTMART_URLS.week1}
                  />
                  <PriceCard
                    eyebrow="Recomendado"
                    title="Programa completo · 28 días"
                    price="USD 40"
                    features={[
                      "Las 4 semanas del programa (28 días)",
                      "Todos los patrones de respiración",
                      "5 pilares con protocolo por fenotipo",
                      "12 meses de acceso completo",
                    ]}
                    href={HOTMART_URLS.full}
                    featured
                  />
                </>
              )}
            </div>
          )}

          {!isSignedIn && (
            <button
              onClick={onSignIn}
              className="w-full text-[12.5px] text-sage border border-line rounded-xl py-2.5 hover:border-sage transition-colors"
            >
              Ya compré · Iniciar sesión
            </button>
          )}

          {isRevoked && (
            <p className="text-[11px] text-mute text-center mt-4">
              Contacto: hola@sakros.cl
            </p>
          )}
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-mute text-center mt-6">
          Joaquín Adi · Clínica Sakros
        </p>
      </div>
    </div>
  );
}

function PriceCard({ eyebrow, title, price, originalPrice, discountNote, features, href, featured }) {
  const border = featured ? "border-chloro" : "border-line";
  const bg = featured ? "bg-sage-soft" : "bg-paper";
  const btnClass = featured
    ? "bg-chloro text-paper hover:bg-chloro-deep"
    : "bg-paper text-chloro border border-chloro hover:bg-sage-soft";

  return (
    <div className={`${bg} border ${border} rounded-2xl p-4`}>
      <div className="flex justify-between items-baseline mb-1">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage font-semibold">
          {eyebrow}
        </div>
        <div className="text-right">
          {originalPrice && (
            <span className="font-mono text-[11px] text-mute line-through mr-1.5">
              {originalPrice}
            </span>
          )}
          <span className="font-serif text-[20px] font-medium text-chloro">
            {price}
          </span>
        </div>
      </div>
      <div className="font-serif text-[16px] text-ink mb-2 leading-tight">{title}</div>
      {discountNote && (
        <p className="text-[11px] text-chloro italic mb-2">{discountNote}</p>
      )}
      <ul className="space-y-1.5 mb-4">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-[12px] text-ink-soft leading-snug">
            <span className="text-chloro flex-shrink-0 mt-0.5">·</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full ${btnClass} text-center font-sans font-medium text-[13.5px] py-2.5 rounded-xl transition-colors`}
      >
        Empezar
      </a>
    </div>
  );
}
