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

  // Flat question lists (built once)
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

  // ── Auth init ─────────────────────────────────────────────────
  useEffect(() => {
    // 1. Check current session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        fetchProfile(s.user.id);
      } else {
        setStage("welcome");
      }
    });

    // 2. Listen for auth changes (magic link click, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (event === "SIGNED_IN" && s) {
          setSession(s);
          // Check for a pending result saved before auth flow
          const pending = localStorage.getItem("sr_pending_result");
          if (pending) {
            const r = JSON.parse(pending);
            setResult(r);
            const saved = await saveProfileToDb(s.user.id, r);
            if (saved) {
              setProfile(saved);
              localStorage.removeItem("sr_pending_result");
              setStage("dashboard");
            }
          } else {
            fetchProfile(s.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setProfile(null);
          setResult(null);
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

  // ── Start program (after result) ──────────────────────────────
  async function handleStartProgram() {
    if (!session) {
      // Save result to localStorage, then go to auth
      localStorage.setItem("sr_pending_result", JSON.stringify(result));
      setStage("auth");
    } else {
      // Already logged in: save profile and go to dashboard
      const saved = await saveProfileToDb(session.user.id, result);
      if (saved) {
        setProfile(saved);
        setStage("dashboard");
      }
    }
  }

  // ── Sign out ──────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut();
    // onAuthStateChange → SIGNED_OUT handles state reset
  }

  // ── Restart quiz ──────────────────────────────────────────────
  function handleRestart() {
    setMainAnswers(null);
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

  if (stage === "auth") {
    return (
      <Auth
        phenotypeKey={result?.dominant}
        onBack={() => setStage("result")}
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
