import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getTasksForDay, PILLAR_LABELS, PILLAR_COLORS } from "../data/tasks";
import { PHENOTYPES } from "../data/phenotypes";

function daysBetween(startIso, todayIso) {
  const s = new Date(startIso);
  const t = new Date(todayIso);
  return Math.max(0, Math.floor((t - s) / 86400000));
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function loadLocalCompletions() {
  try {
    return JSON.parse(localStorage.getItem("sr_completions") || "{}");
  } catch { return {}; }
}

function saveLocalCompletions(data) {
  localStorage.setItem("sr_completions", JSON.stringify(data));
}

export default function Dashboard({ profile, session, onOpenBreathing, onSignOut }) {
  const [completions, setCompletions] = useState(new Set());
  const [weekDots, setWeekDots] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const phenotype = PHENOTYPES[profile.phenotype];
  const startDate = profile.program_start_date || today;
  const dayNum = daysBetween(startDate, today) + 1;
  const weekNum = Math.ceil(Math.min(dayNum, 28) / 7);
  const clampedDay = Math.min(Math.max(dayNum, 1), 28);
  const tasks = getTasksForDay(profile.phenotype, clampedDay);
  const hasAuth = session && session.user;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    if (hasAuth) {
      loadFromSupabase();
    } else {
      loadFromLocal();
    }
  }, []);

  function loadFromLocal() {
    const all = loadLocalCompletions();
    const todayDone = new Set(all[today] || []);
    setCompletions(todayDone);
    const dots = {};
    last7.forEach((d) => { dots[d] = (all[d] || []).length > 0; });
    setWeekDots(dots);
    setLoading(false);
  }

  async function loadFromSupabase() {
    try {
      const weekAgo = last7[0];
      const { data } = await supabase
        .from("sr_completions")
        .select("date, task_key")
        .eq("user_id", session.user.id)
        .gte("date", weekAgo);
      if (data) {
        const todayDone = new Set(
          data.filter((r) => r.date === today).map((r) => r.task_key)
        );
        setCompletions(todayDone);
        const dots = {};
        last7.forEach((d) => { dots[d] = data.some((r) => r.date === d); });
        setWeekDots(dots);
      }
    } catch (e) {
      console.error("loadFromSupabase:", e);
      loadFromLocal(); // fallback
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskKey) {
    const isDone = completions.has(taskKey);
    const next = new Set(completions);

    if (isDone) {
      next.delete(taskKey);
    } else {
      next.add(taskKey);
    }
    setCompletions(next);
    setWeekDots((prev) => ({ ...prev, [today]: next.size > 0 }));

    // Persist
    if (hasAuth) {
      if (isDone) {
        await supabase.from("sr_completions").delete()
          .eq("user_id", session.user.id).eq("date", today).eq("task_key", taskKey);
      } else {
        await supabase.from("sr_completions").upsert({
          user_id: session.user.id, date: today, task_key: taskKey,
        });
      }
    } else {
      const all = loadLocalCompletions();
      all[today] = Array.from(next);
      saveLocalCompletions(all);
    }
  }

  const doneCount = tasks.filter((t) => completions.has(t.key)).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const progressPct = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-bone">
      <div className="max-w-md mx-auto px-5 pt-8 pb-16">

        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-1.5">
              Día {clampedDay} de 28 · Semana {weekNum}
            </div>
            <h1 className="font-serif text-[22px] font-medium tracking-tight text-ink leading-snug">
              Buen día. <br />
              Fenotipo{" "}
              <em className="italic" style={{ color: phenotype.color }}>
                {phenotype.key} · {phenotype.name.split(" ").pop()}
              </em>
              .
            </h1>
          </div>
          <button
            onClick={onSignOut}
            className="font-mono text-[9px] uppercase tracking-widest text-mute hover:text-ink mt-1 transition-colors"
          >
            Reiniciar
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 bg-bone-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-chloro rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-mute flex-shrink-0">
            {doneCount}/{tasks.length}
          </span>
        </div>

        {/* Task list */}
        <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-3">
          Hoy
        </div>

        {loading ? (
          <div className="font-mono text-[11px] text-mute text-center py-10">
            Cargando...
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-5">
            {tasks.map((task) => {
              const isDone = completions.has(task.key);
              return (
                <div
                  key={task.key}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
                    isDone
                      ? "bg-sage-soft border-transparent"
                      : "bg-paper border-line"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.key)}
                    className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex-shrink-0 flex items-center justify-center transition-colors ${
                      isDone
                        ? "border-chloro bg-chloro"
                        : "border-line hover:border-sage"
                    }`}
                  >
                    {isDone && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] leading-snug ${
                      isDone ? "line-through text-mute" : "text-ink"
                    }`}>
                      {task.label}
                    </div>
                    <div className={`font-mono text-[9.5px] uppercase tracking-wide mt-0.5 ${
                      PILLAR_COLORS[task.pillar] || "text-mute"
                    }`}>
                      {PILLAR_LABELS[task.pillar]}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.action === "breathing" && !isDone && (
                      <button
                        onClick={() => onOpenBreathing(task.breathingType || "morning")}
                        className="w-7 h-7 rounded-full border border-chloro/35 bg-sage-soft flex items-center justify-center hover:bg-chloro hover:border-chloro transition-colors group"
                      >
                        <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                          <path d="M1 1.5l6 3-6 3V1.5z" fill="currentColor"
                            className="text-chloro group-hover:text-paper transition-colors" />
                        </svg>
                      </button>
                    )}
                    <span className="font-mono text-[10px] text-mute">{task.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All done */}
        {allDone && !loading && (
          <div className="bg-sage-soft border border-[#C8DDD1] rounded-xl p-4 text-center mb-5">
            <div className="font-mono text-[9.5px] uppercase tracking-widest text-chloro mb-1">
              ✓ Día completo
            </div>
            <div className="font-serif text-[13.5px] text-ink">
              Tu sistema nervioso lo va a notar mañana.
            </div>
          </div>
        )}

        {/* Weekly dots */}
        <div className="bg-paper rounded-xl border border-line p-4 mt-2">
          <div className="font-mono text-[9.5px] uppercase tracking-widest text-mute mb-3">
            Esta semana
          </div>
          <div className="flex gap-2">
            {last7.map((dateStr, i) => {
              const d = new Date(dateStr + "T12:00:00");
              const dow = d.getDay();
              const label = DAY_LABELS[dow === 0 ? 6 : dow - 1];
              const isToday = dateStr === today;
              const hasDone = weekDots[dateStr];
              return (
                <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[9px] text-mute">{label}</span>
                  <div className={`w-full aspect-square rounded-[6px] ${
                    isToday ? "bg-gold" : hasDone ? "bg-chloro" : "bg-bone-soft"
                  }`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
