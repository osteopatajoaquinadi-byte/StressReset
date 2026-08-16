export function BrandMark({ size = "md", className = "" }) {
  const sizes = {
    sm: { text: "text-[13px]", diamond: "w-1.5 h-1.5", gap: "gap-1.5" },
    md: { text: "text-[15px]", diamond: "w-2 h-2", gap: "gap-2" },
    lg: { text: "text-[20px]", diamond: "w-2.5 h-2.5", gap: "gap-2.5" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`font-serif text-chloro font-medium flex items-center ${s.gap} ${className}`}>
      <span className={`inline-block ${s.diamond} bg-chloro rotate-45 rounded-[1px]`} />
      <span className={s.text}>Stress Reset</span>
    </div>
  );
}

export function BrandFull({ className = "" }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="font-serif text-chloro font-medium text-[22px] flex items-center justify-center gap-2.5 mb-1.5">
        <span className="inline-block w-2.5 h-2.5 bg-chloro rotate-45 rounded-[1px]" />
        Stress Reset
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-sage">
        Regulación del estrés basada en ciencia
      </div>
    </div>
  );
}

export function BrandFooter({ className = "" }) {
  return (
    <div className={`font-mono text-[9px] uppercase tracking-widest text-mute text-center ${className}`}>
      <span className="inline-block w-1 h-1 bg-mute/40 rotate-45 mr-1.5 mb-[1px]" />
      Stress Reset · Joaquín Adi · Clínica Sakros
    </div>
  );
}
