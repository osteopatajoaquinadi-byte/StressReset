import { PHENOTYPES } from "../data/phenotypes";
import InstallPWA from "./InstallPWA";

function formatDate(d) {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

function AccessBadge({ status, tier, expiresAt }) {
  if (!status || status === "loading") return null;

  const isAccessActive = (status === "paid" || status === "trial");

  let label, desc, color, bg, icon;

  if (tier === "full" && isAccessActive) {
    label = "Programa completo · activo";
    desc = expiresAt ? `Vigente hasta ${formatDate(expiresAt)}` : "Sin vencimiento";
    color = "text-chloro"; bg = "bg-sage-soft border-chloro/25"; icon = "★";
  } else if (tier === "week1" && isAccessActive) {
    label = "Semana 1 · activo";
    desc = "Tienes acceso a la primera semana del programa.";
    color = "text-chloro"; bg = "bg-sage-soft border-chloro/25"; icon = "◐";
  } else if (status === "expired") {
    label = "Acceso expirado";
    desc = expiresAt ? `Venció el ${formatDate(expiresAt)}` : "Tu acceso expiró.";
    color = "text-warn"; bg = "bg-paper border-warn/30"; icon = "!";
  } else if (status === "revoked") {
    label = "Acceso revocado";
    desc = "Contacta a hola@sakros.cl si crees que es un error.";
    color = "text-warn"; bg = "bg-paper border-warn/30"; icon = "!";
  } else {
    label = "Acceso gratuito";
    desc = "Puedes usar el suspiro fisiológico. Compra el programa para desbloquear tu plan personalizado.";
    color = "text-mute"; bg = "bg-paper border-line"; icon = "○";
  }

  return (
    <div className={`${bg} border rounded-xl p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full bg-paper flex items-center justify-center flex-shrink-0 ${color} font-mono text-[15px] font-bold`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-mono text-[9.5px] uppercase tracking-widest font-semibold mb-1 ${color}`}>
            {label}
          </div>
          <div className="text-[12px] text-ink-soft leading-snug">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileTab({
  profile, session, accessStatus, tier = "free", expiresAt,
  onReevaluate, onSignOut, onRequestUpgrade,
}) {
  const phenotype = PHENOTYPES[profile.phenotype];
  const secondary = profile.secondary ? PHENOTYPES[profile.secondary] : null;
  const pct = profile.percentages || { A: 33, B: 33, C: 34 };
  const today = new Date().toISOString().split("T")[0];
  const startDate = profile.program_start_date || today;
  const dayNum = Math.min(
    Math.max(1, Math.floor((new Date(today) - new Date(startDate)) / 86400000) + 1),
    28
  );

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-24">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
        Tu perfil
      </div>
      <h1 className="font-serif text-[22px] font-medium tracking-tight text-ink leading-snug mb-6">
        Fenotipo <em className="italic" style={{ color: phenotype.color }}>
          {phenotype.key} · {phenotype.name}
        </em>
      </h1>

      {/* Phenotype card */}
      <div className="rounded-xl text-paper p-5 mb-4" style={{ backgroundColor: phenotype.color }}>
        <p className="italic text-[14px] opacity-90 mb-3">"{phenotype.phrase}"</p>
        <p className="text-[12.5px] opacity-85 leading-relaxed mb-4">{phenotype.description}</p>

        <div className="flex items-center gap-1.5 font-mono text-[10.5px] opacity-80">
          <span>A</span>
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden flex">
            <span className="h-full bg-white/90" style={{ width: `${pct.A}%` }} />
            <span className="h-full bg-white/50" style={{ width: `${pct.B}%` }} />
            <span className="h-full bg-white/28" style={{ width: `${pct.C}%` }} />
          </div>
          <span>{pct.A}·{pct.B}·{pct.C}</span>
        </div>

        {profile.is_mixed && secondary && (
          <p className="font-mono text-[10px] uppercase tracking-wide opacity-75 mt-2">
            Mixto con rasgos de {secondary.key} · {secondary.name}
          </p>
        )}
        {profile.gut_subtype && (
          <p className="font-mono text-[10px] uppercase tracking-wide opacity-75 mt-1">
            Subtipo intestinal: {profile.gut_subtype}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-paper rounded-xl border border-line p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-mute mb-1">Día del programa</div>
          <div className="font-serif text-[24px] font-medium text-ink">{dayNum}<span className="text-mute text-[12px]">/28</span></div>
        </div>
        <div className="bg-paper rounded-xl border border-line p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-mute mb-1">Semana</div>
          <div className="font-serif text-[24px] font-medium text-ink">{Math.ceil(dayNum / 7)}<span className="text-mute text-[12px]">/4</span></div>
        </div>
      </div>

      {/* Lo que sí / lo que no */}
      <div className="bg-paper rounded-xl border border-line p-4 mb-4">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-good mb-2">● Lo que SÍ para ti</div>
        <ul className="space-y-1">
          {phenotype.doFirst.map((item, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-ink-soft leading-snug">
              <span className="text-good flex-shrink-0">·</span><span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-paper rounded-xl border border-line p-4 mb-6">
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-warn mb-2">○ Lo que NO al inicio</div>
        <ul className="space-y-1">
          {phenotype.avoidFirst.map((item, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-ink-soft leading-snug">
              <span className="text-warn flex-shrink-0">·</span><span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Access status */}
      <AccessBadge
        status={accessStatus}
        tier={tier}
        expiresAt={expiresAt || (profile?.access_expires_at ? new Date(profile.access_expires_at) : null)}
      />

      {/* CTA de upgrade si free/week1 */}
      {onRequestUpgrade && (accessStatus !== "paid" || tier === "week1") && (
        <button
          onClick={onRequestUpgrade}
          className="w-full bg-chloro text-paper font-sans font-medium text-[13px] py-3 rounded-xl hover:bg-chloro-deep transition-colors mb-3"
        >
          {tier === "week1" ? "Completar programa" : "Ver planes de acceso"}
        </button>
      )}

      {/* Install PWA prompt */}
      <InstallPWA />

      {/* Actions */}
      <button
        onClick={onReevaluate}
        className="w-full text-[13px] text-sage border border-line rounded-xl py-3 hover:border-sage transition-colors mb-3"
      >
        Reevaluar mi fenotipo
      </button>
      <button
        onClick={onSignOut}
        className="w-full text-[13px] text-mute border border-line rounded-xl py-3 hover:border-line transition-colors"
      >
        {session ? "Cerrar sesión" : "Reiniciar programa"}
      </button>
    </div>
  );
}
