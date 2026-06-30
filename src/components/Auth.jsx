import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ phenotypeKey, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email || !email.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }
    if (!password || password.length < 6) {
      setError("La contraseña necesita al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let result;
      if (mode === "signup") {
        result = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { source: "stressreset", phenotype: phenotypeKey },
          },
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
      }

      if (result.error) {
        if (result.error.message.includes("Invalid login")) {
          setError("Email o contraseña incorrectos. ¿Necesitas crear una cuenta?");
        } else if (result.error.message.includes("already registered")) {
          setError("Ese email ya tiene cuenta. Usa 'Iniciar sesión'.");
          setMode("login");
        } else {
          setError(result.error.message);
        }
      }
      // Si fue exitoso, onAuthStateChange en App.jsx maneja el redirect
    } catch (e) {
      setError("Hubo un problema. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
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
            {mode === "signup" ? "Crea tu cuenta" : "Bienvenido de vuelta"}
          </div>
          <h2 className="font-serif text-[26px] font-medium tracking-tight text-ink leading-tight mb-3">
            {mode === "signup"
              ? "Guarda tu resultado y empieza tu programa."
              : "Retoma tu programa de 28 días."}
          </h2>
          <p className="text-[14px] text-ink-soft leading-relaxed mb-8">
            {mode === "signup"
              ? "Crea una cuenta para guardar tu fenotipo y acceder al dashboard diario con tu plan personalizado."
              : "Ingresa con tu email y contraseña para volver a tu dashboard."}
          </p>

          <label className="font-mono text-[10px] uppercase tracking-widest text-mute mb-2 block">
            Email
          </label>
          <input
            type="email"
            placeholder="tuemail@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-line bg-bone text-ink font-sans text-[15px] outline-none focus:border-chloro focus:bg-paper transition-colors mb-4 placeholder-mute"
          />

          <label className="font-mono text-[10px] uppercase tracking-widest text-mute mb-2 block">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-3.5 rounded-xl border border-line bg-bone text-ink font-sans text-[15px] outline-none focus:border-chloro focus:bg-paper transition-colors mb-3 placeholder-mute"
          />

          {error && (
            <p className="text-warn text-[12px] font-mono mb-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-chloro text-paper font-sans font-medium text-[15px] py-4 rounded-xl hover:bg-chloro-deep transition-colors disabled:opacity-60 mb-3"
          >
            {loading
              ? "Cargando..."
              : mode === "signup"
              ? "Crear cuenta y empezar"
              : "Iniciar sesión"}
          </button>

          <button
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
            }}
            className="text-[13px] text-sage text-center hover:text-chloro transition-colors"
          >
            {mode === "signup"
              ? "Ya tengo cuenta → iniciar sesión"
              : "No tengo cuenta → crear una"}
          </button>
        </div>
      </div>
    </div>
  );
}
