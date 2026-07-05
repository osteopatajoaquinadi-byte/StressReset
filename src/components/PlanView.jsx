import { useState, useEffect } from "react";
import { getTasksForDay, PILLAR_LABELS } from "../data/tasks";

function daysBetween(startIso, todayIso) {
  const s = new Date(startIso);
  const t = new Date(todayIso);
  return Math.max(0, Math.floor((t - s) / 86400000));
}

function loadLocalCompletions() {
  try { return JSON.parse(localStorage.getItem("sr_completions") || "{}"); }
  catch { return {}; }
}

export default function PlanView({ profile }) {
  const today = new Date().toISOString().split("T")[0];
  const startDate = profile.program_start_date || today;
  const currentDay = Math.min(daysBetween(startDate, today) + 1, 28);
  const [expandedWeek, setExpandedWeek] = useState(Math.ceil(currentDay / 7));
  const completions = loadLocalCompletions();

  const weeks = [1, 2, 3, 4];
  const weekNames = ["Fundamentos", "Construir hábito", "Ampliar", "Consolidar"];
  const weekDescs = [
    "Respiración + caminata diaria",
    "+ vagal + circadiano + nutrición base",
    "+ fuerza/movimiento + frío/calor",
    "+ sprints + sauna + integración completa",
  ];

  return (
    <div className="max-w-md mx-auto px-5 pt-8 pb-24">
      <div className="font-mono text-[9.5px] uppercase tracking-widest text-sage mb-2">
        Plan de 28 días · Fenotipo {profile.phenotype}
      </div>
      <h1 className="font-serif text-[22px] font-medium tracking-tight text-ink leading-snug mb-6">
        Tu programa <em className="italic text-chloro">paso a paso</em>.
      </h1>

      {/* Progress overview */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const dateStr = new Date(new Date(startDate).getTime() + i * 86400000)
            .toISOString().split("T")[0];
          const hasDone = (completions[dateStr] || []).length > 0;
          const isToday = day === currentDay;
          const isPast = day < currentDay;
          const isFuture = day > currentDay;
          return (
            <div
              key={day}
              className={`flex-1 h-2 rounded-full ${
                isToday ? "bg-gold" :
                hasDone ? "bg-chloro" :
                isPast ? "bg-sage/40" :
                "bg-bone-soft"
              }`}
              title={`Día ${day}`}
            />
          );
        })}
      </div>

      {/* Weeks */}
      <div className="flex flex-col gap-3">
        {weeks.map((weekNum) => {
          const isOpen = expandedWeek === weekNum;
          const isCurrent = Math.ceil(currentDay / 7) === weekNum;
          const isLocked = weekNum > Math.ceil(currentDay / 7);
          const weekTasks = getTasksForDay(profile.phenotype, weekNum * 7);
          const prevWeekTasks = weekNum > 1 ? getTasksForDay(profile.phenotype, (weekNum - 1) * 7) : [];
          const newTasks = weekTasks.filter(t => !prevWeekTasks.find(p => p.key === t.key));

          return (
            <div key={weekNum} className={`rounded-xl border transition-colors ${
              isCurrent ? "border-chloro/30 bg-paper" :
              isLocked ? "border-line bg-bone-soft/50" :
              "border-line bg-paper"
            }`}>
              <button
                onClick={() => setExpandedWeek(isOpen ? null : weekNum)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[12px] font-semibold ${
                  isCurrent ? "bg-chloro text-paper" :
                  isLocked ? "bg-bone-soft text-mute" :
                  "bg-sage-soft text-chloro"
                }`}>
                  S{weekNum}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium ${isLocked ? "text-mute" : "text-ink"}`}>
                    {weekNames[weekNum - 1]}
                  </div>
                  <div className="text-[11px] text-mute mt-0.5">{weekDescs[weekNum - 1]}</div>
                </div>
                {isCurrent && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-chloro bg-sage-soft px-2 py-1 rounded-full">
                    Actual
                  </span>
                )}
                <svg width="12" height="12" viewBox="0 0 12 12" className={`text-mute transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-line/50">
                  {newTasks.length > 0 && weekNum > 1 && (
                    <div className="font-mono text-[9px] uppercase tracking-widest text-sage mt-3 mb-2">
                      Nuevas esta semana
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-3">
                    {weekTasks.map((task) => {
                      const isNew = newTasks.find(t => t.key === task.key);
                      return (
                        <div key={task.key} className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isNew && weekNum > 1 ? "bg-gold" : "bg-chloro/40"
                          }`} />
                          <span className={`text-[12.5px] ${isLocked ? "text-mute" : "text-ink-soft"}`}>
                            {task.label}
                          </span>
                          <span className="font-mono text-[9px] text-mute ml-auto">
                            {PILLAR_LABELS[task.pillar]?.split("·")[1]?.trim()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="font-mono text-[10px] text-mute mt-3">
                    {weekTasks.length} tareas/día
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
