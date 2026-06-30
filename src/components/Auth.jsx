import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ phenotypeKey, onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: window.location.origin,
          data: { source: "stressreset", phenotype: phenotypeKey },
        },
      });
      if (err) throw err;
      setSent(true);
    } catch (e) {
      setError("Hubo un problema al enviar el email. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-sage-soft border border-[#D4E0D7] flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-5 9 5" stroke="#1E5F3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="font-serif text-[24px] font-medium tracking-tight text-ink mb-3">
            Revisa tu email
          </h2>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-2">
            Enviamos un link de acceso a
          </p>
          <p className="font-mono text-[13px] text-chloro mb-6">{email}</p>
          <p className="text-[13px] text-mute leading-relaxed">
            Haz clic en el link del email — no necesitas contraseña. Puedes
            cerrar esta pestaña y abrir el link desde el email.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mute mt-8">
            El link expira en 60 minutos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-10">
        <button
          onClick={onBack}
          className="font-mono text-[10px] uppercase tracking-widest text-mute mb-10 self-start hover:text-sage"
        >
          ← Volver
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-3">
            Guarda tu resultado
          </div>
          <h2 className="font-serif text-[26px] font-medium tracking-tight text-ink leading-tight mb-3">
            Empieza tu programa de 28 días.
          </h2>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-8">
            Ingresa tu email para guardar tu fenotipo y acceder al dashboard
            diario. Sin contraseña — te enviamos un link de acceso directo.
          </p>

          <label className="font-mono text-[10px] uppercase tracking-widest text-mute mb-2 block">
            Email
          </label>
          <input
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-3.5 rounded-xl border border-line bg-bone text-ink font-sans text-[15px] outline-none focus:border-chloro focus:bg-paper transition-colors mb-3 placeholder-mute"
          />
          {error && (
            <p className="text-warn text-[12px] font-mono mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar link de acceso"}
          </button>

          <p className="text-[11.5px] text-mute text-center mt-4 leading-relaxed">
            Sin spam. Solo el link de acceso a tu programa.
          </p>
        </div>
      </div>
    </div>
  );
}
