import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Welcome from "./components/Welcome";
import Assessment from "./components/Assessment";
import PhenotypeResult from "./components/PhenotypeResult";
import Auth from "./components/Auth";
import AccessGate from "./components/AccessGate";
import Dashboard from "./components/Dashboard";
import BreathingSession from "./components/BreathingSession";
import BottomNav from "./components/BottomNav";
import UpdatePrompt from "./components/UpdatePrompt";
import PlanView from "./components/PlanView";
import BreatheTab from "./components/BreatheTab";
import PillarsHub from "./components/PillarsHub";
import ProfileTab from "./components/ProfileTab";
import { MAIN_BLOCKS, BLOCK_GUT } from "./data/quizQuestions";
import { calculatePhenotype } from "./utils/scoring";
import { useAccess } from "./hooks/useAccess";

// Stages:
//   loading | welcome | quiz | gut_quiz | result | gate | auth | app | breathing
export default function App() {
  const [stage, setStage] = useState("loading");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [mainAnswers, setMainAnswers] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [breathingType, setBreathingType] = useState("morning");
  const [breathingDuration, setBreathingDuration] = useState(5);

  const { status: accessStatus, recheck: recheckAccess } = useAccess(session);

  const flatMainQuestions = MAIN_BLOCKS.flatMap((block) =>
    block.questions.map((text, index) => ({
      blockKey: block.key, blockTitle: block.title, index, text,
    }))
  );
  const flatGutQuestions = BLOCK_GUT.questions.map((text, index) => ({
    blockKey: "GUT", blockTitle: "Profundización intestinal", index, text,
  }));

  // ── Init ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        fetchProfileFromDb(s.user.id);
      } else {
        // No hay sesión: revisamos si hay perfil local (usuario freemium sin cuenta)
        const localProfile = localStorage.getItem("sr_profile");
        if (localProfile) {
          try {
            setProfile(JSON.parse(localProfile));
            // Sin sesión y con perfil local → puede seguir a "app" pero será freemium
            setStage("app");
            return;
          } catch { localStorage.removeItem("sr_profile"); }
        }
        setStage("welcome");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        if (event === "SIGNED_IN" && s) {
          setSession(s);
          await fetchProfileFromDb(s.user.id);
          await recheckAccess();
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

  async function fetchProfileFromDb(userId) {
    const { data } = await supabase
      .from("sr_profiles").select("*").eq("id", userId).maybeSingle();
    if (data && data.phenotype) {
      setProfile(data);
      setStage("app");
    } else {
      // Hay cuenta pero aún no completó el quiz
      setStage("welcome");
    }
  }

  async function saveProfileToDb(userId, r) {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("sr_profiles")
      .upsert({
        id: userId,
        email: session?.user?.email,
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
    return data;
  }

  // ── Quiz flow ─────────────────────────────────────────────────
  function handleMainComplete(flatSelections) {
    const answers = { A: [], B: [], C: [] };
    flatMainQuestions.forEach((q, i) => { answers[q.blockKey].push(flatSelections[i]); });
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

  // ── Start program: usuario quiere entrar al plan ─────────────
  // Decisión clave: si tiene acceso pagado, entra directo.
  // Si no, va al gate comercial.
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

    // Si hay sesión, guarda en Supabase
    if (session) {
      const saved = await saveProfileToDb(session.user.id, result);
      if (saved) setProfile(saved);

      await recheckAccess();
      // Si tiene acceso vigente, entra al programa
      if (accessStatus === "paid" || accessStatus === "trial") {
        setActiveTab("today");
        setStage("app");
        return;
      }
      // Sin acceso, muestra gate
      setStage("gate");
      return;
    }

    // Sin sesión: guarda perfil local y muestra gate para pedir compra
    localStorage.setItem("sr_profile", JSON.stringify(localProfile));
    setProfile(localProfile);
    setStage("gate");
  }

  // Reinicio: solo limpia local, NO cierra sesión Supabase
  function handleRestart() {
    setMainAnswers(null);
    setResult(null);
    localStorage.removeItem("sr_profile");
    localStorage.removeItem("sr_completions");
    localStorage.removeItem("sr_breathing_log");
    setProfile(null);
    setActiveTab("today");
    setStage("welcome");
  }

  // Sign out real
  async function handleSignOut() {
    await supabase.auth.signOut();
    handleRestart();
  }

  function handleReevaluate() {
    setMainAnswers(null);
    setResult(null);
    setStage("quiz");
  }

  // ── Breathing ─────────────────────────────────────────────────
  function openBreathingFromDashboard(type) {
    setBreathingType(type || "morning");
    setBreathingDuration(5);
    setStage("breathing");
  }
  function openBreathingFromTab(patternKey, duration) {
    setBreathingType(patternKey);
    setBreathingDuration(duration);
    setStage("breathing");
  }
  function openBreathingFromPillars() { setActiveTab("breathe"); }

  function handleBreathingClose() {
    try {
      const log = JSON.parse(localStorage.getItem("sr_breathing_log") || "[]");
      log.push({
        date: new Date().toISOString().split("T")[0],
        minutes: breathingDuration, pattern: breathingType, timestamp: Date.now(),
      });
      localStorage.setItem("sr_breathing_log", JSON.stringify(log));
    } catch {}
    setStage("app");
  }

  // ── Auto-redirect si el acceso cambia mientras está en la app ─
  useEffect(() => {
    if (stage !== "app") return;
    if (!session) return; // freemium local: no aplica
    if (accessStatus === "expired" || accessStatus === "revoked") {
      setStage("gate");
    }
  }, [accessStatus, stage, session]);

  // ── Render ────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-bone flex flex-col items-center justify-center gap-3">
        <div className="font-serif text-chloro font-medium text-[20px] flex items-center gap-2.5 animate-pulse">
          <span className="inline-block w-2.5 h-2.5 bg-chloro rotate-45 rounded-[1px]" />
          Stress Reset
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-sage">
          Regulación del estrés basada en ciencia
        </div>
      </div>
    );
  }

  if (stage === "welcome") return <Welcome onStart={() => setStage("quiz")} />;

  if (stage === "quiz") {
    return (
      <Assessment key="main" flatQuestions={flatMainQuestions}
        onComplete={handleMainComplete} title="Autoevaluación" eyebrowPrefix="Paso" />
    );
  }

  if (stage === "gut_quiz") {
    return (
      <Assessment key="gut" flatQuestions={flatGutQuestions}
        onComplete={handleGutComplete} title="Profundización" eyebrowPrefix="Paso adicional" />
    );
  }

  if (stage === "result" && result) {
    return (
      <PhenotypeResult result={result}
        onStartProgram={handleStartProgram} onRestart={handleRestart} />
    );
  }

  if (stage === "gate") {
    return (
      <AccessGate
        result={result || profile}
        status={accessStatus}
        onSignIn={() => setStage("auth")}
        onGoBack={result ? () => setStage("result") : () => setStage("welcome")}
      />
    );
  }

  if (stage === "auth") {
    return (
      <Auth
        phenotypeKey={result?.dominant || profile?.phenotype}
        onBack={() => setStage(result ? "result" : "welcome")}
      />
    );
  }

  if (stage === "breathing" && profile) {
    return (
      <BreathingSession
        phenotype={profile.phenotype}
        sessionType={breathingType}
        duration={breathingDuration}
        onClose={handleBreathingClose}
      />
    );
  }

  if (stage === "app" && profile) {
    return (
      <div className="min-h-screen bg-bone">
        {activeTab === "today" && (
          <Dashboard profile={profile} session={session}
            onOpenBreathing={openBreathingFromDashboard} onSignOut={handleRestart} />
        )}
        {activeTab === "plan" && <PlanView profile={profile} />}
        {activeTab === "breathe" && <BreatheTab onStartSession={openBreathingFromTab} />}
        {activeTab === "pillars" && (
          <PillarsHub profile={profile} onOpenBreathing={openBreathingFromPillars} />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            profile={profile}
            session={session}
            accessStatus={accessStatus}
            onReevaluate={handleReevaluate}
            onSignOut={session ? handleSignOut : handleRestart}
          />
        )}
        <BottomNav active={activeTab} onChange={setActiveTab} />
        <UpdatePrompt />
      </div>
    );
  }

  return null;
}
