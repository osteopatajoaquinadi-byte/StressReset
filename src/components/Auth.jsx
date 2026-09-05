import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth({ phenotypeKey, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
    setNotice("");

    try {
      let result;
      if (mode === "signup") {
        // emailRedirectTo: URL a la que Supabase redirige tras confirmar el email.
        // Debe estar en la whitelist de Redirect URLs en Supabase Dashboard.
        // Usa la origen actual → funciona igual en dev (localhost) y en producción.
        const emailRedirectTo = `${window.location.origin}/`;

        result = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo,
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
        const msg = result.error.message || "";
        if (msg.includes("Invalid login")) {
          setError("Email o contraseña incorrectos. ¿Necesitas crear una cuenta?");
        } else if (msg.includes("already registered")) {
          setError("Ese email ya tiene cuenta. Usa 'Iniciar sesión'.");
          setMode("login");
        } else if (msg.includes("Email not confirmed")) {
          setError("Todavía no confirmaste tu email. Revisa tu bandeja de entrada y spam. Si no llega, escribe a hola@sakros.cl");
        } else if (msg.toLowerCase().includes("rate limit") || msg.includes("email rate limit")) {
          setError("Hemos superado el límite temporal de envío de emails. Espera 30 minutos y vuelve a intentarlo, o escribe a hola@sakros.cl");
        } else if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("send")) {
          setError("No pudimos enviar el email de confirmación. Escribe a hola@sakros.cl para activar tu cuenta manualmente.");
        } else {
          setError(msg || "Hubo un problema. Intenta de nuevo.");
        }
      } else if (mode === "signup") {
        // Caso: signup exitoso pero sin sesión → Supabase requiere confirmar email
        if (!result.data?.session) {
          setNotice(
            "Cuenta creada. Te enviamos un email de confirmación a " + email.trim().toLowerCase() +
            ". Revisa tu bandeja de entrada y también la carpeta de spam — el email puede tardar unos minutos. " +
            "Si no llega en 15 minutos, escribe a hola@sakros.cl con tu email para activar tu cuenta manualmente."
          );
          setMode("login");
          setPassword("");
        }
        // Si data.session existe, onAuthStateChange redirige automáticamente
      }
    } catch (e) {
      setError("Hubo un problema. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email || !email.includes("@")) {
      setError("Ingresa tu email primero.");
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const emailRedirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo },
      });
      if (error) {
        const msg = error.message || "";
        if (msg.toLowerCase().includes("rate limit")) {
          setError("Superamos el límite de reenvíos. Espera 30 minutos o escribe a hola@sakros.cl");
        } else {
          setError(msg || "No pudimos reenviar el email. Escribe a hola@sakros.cl");
        }
      } else {
        setNotice("Email reenviado. Revisa tu bandeja de entrada y la carpeta de spam.");
      }
    } catch (e) {
      setError("No pudimos reenviar el email. Escribe a hola@sakros.cl");
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
          {notice && (
            <div className="bg-sage-soft border border-chloro/25 rounded-xl p-3 mb-3">
              <p className="text-[12.5px] text-ink-soft leading-snug">{notice}</p>
            </div>
          )}

          {/* Botón de reenvío: aparece si hay notice de cuenta creada o error de email no confirmado */}
          {mode === "login" && (notice || (error && error.includes("confirm"))) && email.includes("@") && (
            <button
              onClick={handleResendConfirmation}
              disabled={loading}
              className="w-full text-[12.5px] text-sage border border-sage/50 rounded-xl py-2.5 hover:bg-sage-soft transition-colors mb-3 disabled:opacity-50"
            >
              {loading ? "Reenviando..." : "Reenviar email de confirmación"}
            </button>
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
