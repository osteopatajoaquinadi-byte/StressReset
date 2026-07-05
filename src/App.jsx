import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Welcome from "./components/Welcome";
import Assessment from "./components/Assessment";
import PhenotypeResult from "./components/PhenotypeResult";
import Dashboard from "./components/Dashboard";
import BreathingSession from "./components/BreathingSession";
import BottomNav from "./components/BottomNav";
import PlanView from "./components/PlanView";
import BreatheTab from "./components/BreatheTab";
import PillarsHub from "./components/PillarsHub";
import ProfileTab from "./components/ProfileTab";
import { MAIN_BLOCKS, BLOCK_GUT } from "./data/quizQuestions";
import { calculatePhenotype } from "./utils/scoring";

// Stages: loading | welcome | quiz | gut_quiz | result | app | breathing
export default function App() {
  const [stage, setStage] = useState("loading");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [result, setResult] = useState(null);
  const [mainAnswers, setMainAnswers] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [breathingType, setBreathingType] = useState("morning");
  const [breathingDuration, setBreathingDuration] = useState(5);

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
    const localProfile = localStorage.getItem("sr_profile");
    if (localProfile) {
      try {
        setProfile(JSON.parse(localProfile));
        setStage("app");
        return;
      } catch (e) { localStorage.removeItem("sr_profile"); }
    }

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
          fetchProfile(s.user.id);
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
      .from("sr_profiles").select("*").eq("id", userId).maybeSingle();
    if (data) {
      setProfile(data);
      setStage("app");
    } else {
      setStage("welcome");
    }
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

  // ── Start program ─────────────────────────────────────────────
  function handleStartProgram() {
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
    localStorage.setItem("sr_profile", JSON.stringify(localProfile));
    setProfile(localProfile);
    setActiveTab("today");
    setStage("app");
  }

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
    setBreathingType(patternKey === "4-8" ? "evening" : patternKey === "4-2-6-2" ? "morning" : "morning");
    setBreathingDuration(duration);
    setStage("breathing");
  }

  function openBreathingFromPillars() {
    setActiveTab("breathe");
  }

  function handleBreathingClose() {
    // Log session
    try {
      const log = JSON.parse(localStorage.getItem("sr_breathing_log") || "[]");
      log.push({
        date: new Date().toISOString().split("T")[0],
        minutes: breathingDuration,
        pattern: breathingType,
        timestamp: Date.now(),
      });
      localStorage.setItem("sr_breathing_log", JSON.stringify(log));
    } catch (e) {}
    setStage("app");
  }

  // ── Render ────────────────────────────────────────────────────
  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="font-serif italic text-[18px] text-sage animate-pulse">Stress Reset</div>
      </div>
    );
  }

  if (stage === "welcome") {
    return <Welcome onStart={() => setStage("quiz")} />;
  }

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

  // ── Main app with tabs ────────────────────────────────────────
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
          <ProfileTab profile={profile} onReevaluate={handleReevaluate} onSignOut={handleRestart} />
        )}
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  return null;
}
