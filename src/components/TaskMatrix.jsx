import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Clock, Zap, Sparkles, CheckSquare, Square, ArrowRight, ShieldAlert } from 'lucide-react';

export default function TaskMatrix() {
  const { currentSession, toggleTaskComplete } = useApp();
  const { tasks = [] } = currentSession || {};

  // Eisenhower categorization:
  // Q1: Do First (P1 priority or high urgency >= 8.5)
  const q1Tasks = tasks.filter((t) => t.priority === 'P1' || (t.urgencyScore && t.urgencyScore >= 8.5));

  // Q2: Schedule / Deep Work (P2 priority or urgency >= 7.0)
  const q2Tasks = tasks.filter((t) => !q1Tasks.includes(t) && (t.priority === 'P2' || (t.urgencyScore && t.urgencyScore >= 7.0)));

  // Q3: Quick Wins / Operational (P3 or short duration <= 20m)
  const q3Tasks = tasks.filter(
    (t) =>
      !q1Tasks.includes(t) &&
      !q2Tasks.includes(t) &&
      (t.priority === 'P3' || (t.estimatedTime && (t.estimatedTime.includes('15') || t.estimatedTime.includes('10'))))
  );

  // Q4: Delegate / Backlog (Remaining tasks, P4, or speculative)
  const q4Tasks = tasks.filter((t) => !q1Tasks.includes(t) && !q2Tasks.includes(t) && !q3Tasks.includes(t));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-container/70 border border-slate-200 dark:border-outline-variant/30">
            <Flame className="w-3.5 h-3.5 text-error" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-on-surface-variant font-bold">
              AI Priority Assistant
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-headline font-bold tracking-tight text-slate-900 dark:text-on-surface">
            Task Urgency-Impact Matrix
          </h1>
          <p className="text-sm text-slate-600 dark:text-on-surface-variant max-w-2xl leading-relaxed">
            AI-computed ranking determining what deserves your immediate attention first based on deadline proximity and effort complexity.
          </p>
        </div>

        {/* Priority Assistant Banner */}
        <div className="flex items-center gap-2 bg-white/90 dark:bg-surface-container-high/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-outline-variant/30 text-xs font-mono shadow-sm">
          <Sparkles className="w-4 h-4 text-tertiary" />
          <span className="text-slate-600 dark:text-on-surface-variant">Top Recommendation:</span>
          <span className="text-primary font-bold">
            {q1Tasks[0]?.title || 'All Critical Items Handled'}
          </span>
        </div>
      </header>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QUADRANT 1: DO FIRST (Urgent & High Impact) */}
        <div className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 border border-error/30 flex flex-col gap-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-error/15 text-error flex items-center justify-center font-bold">
                Q1
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-error" />
                  Do First • Critical Urgency
                </span>
                <span className="text-[10px] text-error font-mono font-medium">
                  Imminent deadlines & high stakes
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-error/10 text-error font-bold border border-error/20">
              {q1Tasks.length} Action{q1Tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {q1Tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-error/20 flex items-start justify-between gap-3 hover:bg-slate-100 dark:hover:bg-surface-container transition-all"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-error hover:text-tertiary transition-colors"
                  >
                    {task.completed ? <CheckSquare className="w-4 h-4 text-tertiary" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-xs font-bold text-slate-900 dark:text-on-surface ${task.completed ? 'line-through text-slate-400 dark:text-on-surface-variant' : ''}`}>
                      {task.title}
                    </span>
                    {task.deadline && (
                      <span className="text-[10px] text-error font-mono mt-0.5 font-semibold">
                        Due: {task.deadline}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-error bg-error/10 px-2 py-0.5 rounded font-bold">
                  Score: {task.urgencyScore || 9.5}
                </span>
              </div>
            ))}

            {q1Tasks.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-secondary-fixed py-6 text-center">No critical fire drill tasks right now!</p>
            )}
          </div>
        </div>

        {/* QUADRANT 2: SCHEDULE / DEEP WORK (High Impact & Strategic) */}
        <div className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 border border-primary/30 flex flex-col gap-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                Q2
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Schedule • High Focus
                </span>
                <span className="text-[10px] text-primary font-mono font-medium">
                  High strategic value & deeper effort
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
              {q2Tasks.length} Action{q2Tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {q2Tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 flex items-start justify-between gap-3 hover:bg-slate-100 dark:hover:bg-surface-container transition-all"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-primary hover:text-tertiary transition-colors"
                  >
                    {task.completed ? <CheckSquare className="w-4 h-4 text-tertiary" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-xs font-bold text-slate-900 dark:text-on-surface ${task.completed ? 'line-through text-slate-400 dark:text-on-surface-variant' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono mt-0.5">
                      Est: {task.estimatedTime || '1.5 hrs'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                  Score: {task.urgencyScore || 7.5}
                </span>
              </div>
            ))}

            {q2Tasks.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-secondary-fixed py-6 text-center">No deep work items queued.</p>
            )}
          </div>
        </div>

        {/* QUADRANT 3: QUICK WINS (< 20 Min / Operational) */}
        <div className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 border border-tertiary/30 flex flex-col gap-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center font-bold">
                Q3
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-tertiary" />
                  Quick Wins • Low Effort
                </span>
                <span className="text-[10px] text-tertiary font-mono font-medium">
                  Rapid execution in under 20 minutes
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-bold border border-tertiary/20">
              {q3Tasks.length} Action{q3Tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {q3Tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 flex items-start justify-between gap-3 hover:bg-slate-100 dark:hover:bg-surface-container transition-all"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-tertiary hover:text-primary transition-colors"
                  >
                    {task.completed ? <CheckSquare className="w-4 h-4 text-tertiary" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-xs font-bold text-slate-900 dark:text-on-surface ${task.completed ? 'line-through text-slate-400 dark:text-on-surface-variant' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-secondary-fixed font-mono mt-0.5">
                      Fast execution • {task.estimatedTime || '15m'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 px-2 py-0.5 rounded font-bold">
                  Score: {task.urgencyScore || 6.0}
                </span>
              </div>
            ))}

            {q3Tasks.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-secondary-fixed py-6 text-center">No quick wins remaining.</p>
            )}
          </div>
        </div>

        {/* QUADRANT 4: BACKLOG & EXPLORATION (Low Urgency) */}
        <div className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 border border-slate-200/90 dark:border-outline-variant/40 flex flex-col gap-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-on-surface flex items-center justify-center font-bold">
                Q4
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-on-surface-variant" />
                  Someday / Backlog
                </span>
                <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono font-medium">
                  Lower priority or speculative ideas
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-highest text-slate-600 dark:text-on-surface-variant font-bold">
              {q4Tasks.length} Action{q4Tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {q4Tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 flex items-start justify-between gap-3 hover:bg-slate-100 dark:hover:bg-surface-container transition-all"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-slate-400 dark:text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {task.completed ? <CheckSquare className="w-4 h-4 text-tertiary" /> : <Square className="w-4 h-4" />}
                  </button>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`text-xs font-bold text-slate-900 dark:text-on-surface ${task.completed ? 'line-through text-slate-400 dark:text-on-surface-variant' : ''}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-secondary-fixed font-mono mt-0.5">
                      Low cognitive pressure
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-600 dark:text-on-surface-variant bg-slate-200 dark:bg-surface-container-highest px-2 py-0.5 rounded font-bold">
                  Score: {task.urgencyScore || 3.5}
                </span>
              </div>
            ))}

            {q4Tasks.length === 0 && (
              <p className="text-xs text-slate-400 dark:text-secondary-fixed py-6 text-center">Backlog is completely empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
