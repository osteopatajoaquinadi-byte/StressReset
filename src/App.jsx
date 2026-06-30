import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Welcome from "./components/Welcome";
import Assessment from "./components/Assessment";
import PhenotypeResult from "./components/PhenotypeResult";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import BreathingSession from "./components/BreathingSession";
import { MAIN_BLOCKS, BLOCK_GUT } from "./data/quizQuestions";
import { calculatePhenotype } from "./utils/scoring";

// ── Stages ─────────────────────────────────────────────────────
// loading | welcome | quiz | gut_quiz | result | auth | dashboard | breathing

export default function App() {
  const [stage, setStage] = useState("loading");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [breathingType, setBreathingType] = useState("morning");
  const [mainAnswers, setMainAnswers] = useState(null);

  const flatMainQuestions = MAIN_BLOCKS.flatMap((block) =>
    block.questions.map((text, index) => ({
      blockKey: block.key,
      blockTitle: block.title,
      index,
      text,
    }))
  );
  const flatGutQuestions = BLOCK_GUT.questions.map((text, index) => ({
    blockKey: "GUT",
    blockTitle: "Profundización intestinal",
    index,
    text,
  }));

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    // Check for saved local profile first (demo mode)
    const localProfile = localStorage.getItem("sr_profile");
    if (localProfile) {
      try {
        setProfile(JSON.parse(localProfile));
        setStage("dashboard");
        return;
      } catch (e) {
        localStorage.removeItem("sr_profile");
      }
    }

    // Then check Supabase session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        fetchProfile(s.user.id);
      } else {
        setStage("welcome");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (event === "SIGNED_IN" && s) {
          setSession(s);
          const pending = localStorage.getItem("sr_pending_result");
          if (pending) {
            const r = JSON.parse(pending);
            setResult(r);
            const saved = await saveProfileToDb(s.user.id, r);
            if (saved) {
              setProfile(saved);
              localStorage.removeItem("sr_pending_result");
              localStorage.removeItem("sr_profile");
              setStage("dashboard");
            }
          } else {
            fetchProfile(s.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setProfile(null);
          setResult(null);
          localStorage.removeItem("sr_profile");
          localStorage.removeItem("sr_completions");
          setStage("welcome");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("sr_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      setProfile(data);
      setStage("dashboard");
    } else {
      setStage("welcome");
    }
  }

  async function saveProfileToDb(userId, r) {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("sr_profiles")
      .upsert({
        id: userId,
        phenotype: r.dominant,
        secondary: r.secondary,
        is_mixed: r.isMixed,
        percentages: r.percentages,
        scores: r.scores,
        gut_subtype: r.gutSubtype,
        program_start_date: today,
      })
      .select()
      .single();
    if (error) {
      console.error("saveProfile error:", error);
      return null;
    }
    return data;
  }

  // ── Quiz flow ─────────────────────────────────────────────────
  function handleMainComplete(flatSelections) {
    const answers = { A: [], B: [], C: [] };
    flatMainQuestions.forEach((q, i) => {
      answers[q.blockKey].push(flatSelections[i]);
    });
    setMainAnswers(answers);
    const preliminary = calculatePhenotype(answers);
    if (preliminary.dominant === "C") {
      setStage("gut_quiz");
    } else {
      setResult(preliminary);
      setStage("result");
    }
  }

  function handleGutComplete(flatGutSelections) {
    const answers = { ...mainAnswers, GUT: flatGutSelections };
    const final = calculatePhenotype(answers);
    setResult(final);
    setStage("result");
  }

  // ── Start program ─────────────────────────────────────────────
  // Va directo al dashboard. Guarda el perfil localmente.
  // Si hay sesión de Supabase, también guarda en la base de datos.
  async function handleStartProgram() {
    const today = new Date().toISOString().split("T")[0];
    const localProfile = {
      phenotype: result.dominant,
      secondary: result.secondary,
      is_mixed: result.isMixed,
      percentages: result.percentages,
      scores: result.scores,
      gut_subtype: result.gutSubtype,
      program_start_date: today,
    };

    // Guardar localmente (siempre funciona)
    localStorage.setItem("sr_profile", JSON.stringify(localProfile));
    setProfile(localProfile);

    // Si hay sesión, guardar también en Supabase
    if (session) {
      await saveProfileToDb(session.user.id, result);
    }

    setStage("dashboard");
  }

  // ── Sign out / restart ────────────────────────────────────────
  function handleRestart() {
    setMainAnswers(null);
    setResult(null);
    localStorage.removeItem("sr_profile");
    localStorage.removeItem("sr_completions");
    setStage("welcome");
  }

  async function handleSignOut() {
    localStorage.removeItem("sr_profile");
    localStorage.removeItem("sr_completions");
    if (session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setProfile(null);
    setResult(null);
    setStage("welcome");
  }

  // ── Breathing ─────────────────────────────────────────────────
  function openBreathing(type) {
    setBreathingType(type || "morning");
    setStage("breathing");
  }

  // ── Render ────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="font-serif italic text-[18px] text-sage animate-pulse">
          Stress Reset
        </div>
      </div>
    );
  }

  if (stage === "welcome") {
    return <Welcome onStart={() => setStage("quiz")} />;
  }

  if (stage === "quiz") {
    return (
      <Assessment
        key="main"
        flatQuestions={flatMainQuestions}
        onComplete={handleMainComplete}
        title="Autoevaluación"
        eyebrowPrefix="Paso"
      />
    );
  }

  if (stage === "gut_quiz") {
    return (
      <Assessment
        key="gut"
        flatQuestions={flatGutQuestions}
        onComplete={handleGutComplete}
        title="Profundización"
        eyebrowPrefix="Paso adicional"
      />
    );
  }

  if (stage === "result" && result) {
    return (
      <PhenotypeResult
        result={result}
        onStartProgram={handleStartProgram}
        onRestart={handleRestart}
      />
    );
  }

  if (stage === "dashboard" && profile) {
    return (
      <Dashboard
        profile={profile}
        session={session}
        onOpenBreathing={openBreathing}
        onSignOut={handleSignOut}
      />
    );
  }

  if (stage === "breathing" && profile) {
    return (
      <BreathingSession
        phenotype={profile.phenotype}
        sessionType={breathingType}
        onClose={() => setStage("dashboard")}
      />
    );
  }

  return null;
}
