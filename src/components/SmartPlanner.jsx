import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Zap, 
  RotateCw, 
  CheckSquare, 
  Square, 
  ArrowUp, 
  ArrowDown, 
  GripVertical, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SmartPlanner() {
  const { currentSession, setCurrentSession, toggleTaskComplete, reorderSchedule } = useApp();
  const [isReplanning, setIsReplanning] = useState(false);

  const { tasks = [], dailySchedule = [] } = currentSession || {};

  const handleReplan = () => {
    setIsReplanning(true);
    setTimeout(() => {
      // Intelligently sort tasks by urgencyScore descending and rebuild schedule
      const sorted = [...tasks].sort((a, b) => (b.urgencyScore || 5) - (a.urgencyScore || 5));
      const slots = [
        { time: '09:00 - 11:30', slotName: 'Peak Cognitive (Deep Work)' },
        { time: '11:45 - 12:30', slotName: 'High Focus Execution' },
        { time: '13:30 - 14:45', slotName: 'Collaborative & Meetings' },
        { time: '15:00 - 16:00', slotName: 'Operational & Quick Wins' },
        { time: '16:30 - 17:15', slotName: 'Daily Wrap-up & Review' },
      ];

      const newSchedule = sorted.slice(0, 5).map((t, idx) => ({
        taskId: t.id,
        title: t.title,
        timeSlot: slots[idx]?.time || 'Flexible',
        blockType: slots[idx]?.slotName || 'Buffer Slot',
        estimatedTime: t.estimatedTime || '45m',
        priority: t.priority || 'P2',
      }));

      setCurrentSession((prev) => ({ ...prev, dailySchedule: newSchedule }));
      setIsReplanning(false);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.5 },
      });
    }, 600);
  };

  const completedCount = dailySchedule.filter((item) => {
    const matching = tasks.find((t) => t.id === item.taskId);
    return matching?.completed;
  }).length;

  const totalMinutes = dailySchedule.length * 60; // Approximate
  const capacityPercent = Math.min(95, Math.max(40, dailySchedule.length * 18));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-container/70 border border-slate-200 dark:border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-600 dark:text-on-surface-variant font-bold">
              Cognitive Engine v3.4
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-headline font-bold tracking-tight text-slate-900 dark:text-on-surface">
            Smart Daily Planner
          </h1>
          <p className="text-sm text-slate-600 dark:text-on-surface-variant max-w-2xl leading-relaxed">
            AI-scheduled workload distribution based on cognitive load, deadlines, and natural focus cycles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-xl bg-slate-100 dark:bg-surface-container/80 border border-slate-200 dark:border-outline-variant/30 text-slate-600 dark:text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span className="font-semibold">Chrono-Sequenced</span>
          </div>

          <button
            onClick={handleReplan}
            disabled={isReplanning}
            type="button"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-slate-950 dark:text-on-primary font-label text-xs font-semibold tracking-wide transition-all shadow-glow hover:bg-primary-container hover:text-white active:scale-95"
          >
            <RotateCw className={`w-4 h-4 ${isReplanning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>{isReplanning ? 'Re-sequencing...' : 'Token-Efficient Replan'}</span>
          </button>
        </div>
      </header>

      {/* Optimal Schedule Summary Card */}
      <section className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-slate-200/90 dark:border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary shadow-glow">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono text-tertiary font-bold">
                Optimal Workload Schedule
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-surface-container-highest text-slate-700 dark:text-on-surface-variant font-mono font-bold">
                {completedCount}/{dailySchedule.length} Completed
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-on-surface mt-1">
              Today's Focus: {dailySchedule.length} blocks <span className="text-slate-400 mx-1">•</span> ~4.5 hrs estimated <span className="text-slate-400 mx-1">•</span> Peak window: 09:30 - 12:00
            </p>
          </div>
        </div>

        {/* Cognitive Capacity Gauge */}
        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-on-surface-variant font-mono font-medium">Cognitive Capacity</span>
            <span className="font-mono text-primary font-bold">{capacityPercent}% Utilized</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-surface-container-highest rounded-full overflow-hidden border border-slate-300 dark:border-outline-variant/20">
            <div
              className="h-full bg-gradient-to-r from-primary via-tertiary to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline Blocks List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono text-slate-600 dark:text-on-surface-variant font-bold">
                Timeline Blocks
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-surface-container-high text-slate-800 dark:text-on-surface border border-slate-200 dark:border-outline-variant/30 font-semibold">
                Auto-Chronosequenced
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-on-surface-variant font-mono">
              Use arrows to adjust schedule order
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {dailySchedule.map((block, idx) => {
              const matchedTask = tasks.find((t) => t.id === block.taskId);
              const isDone = matchedTask?.completed;

              return (
                <div
                  key={block.taskId || idx}
                  className={`group p-4 sm:p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 transition-all shadow-md flex items-start gap-4 border ${
                    isDone
                      ? 'opacity-60 bg-slate-50/50 dark:bg-surface-container-lowest/40 border-slate-200 dark:border-outline-variant/20'
                      : 'hover:border-primary/50 border-slate-200/90 dark:border-outline-variant/30'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="pt-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => matchedTask && toggleTaskComplete(matchedTask.id)}
                      className="text-primary hover:text-tertiary transition-colors"
                    >
                      {isDone ? (
                        <CheckSquare className="w-5 h-5 text-tertiary" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 dark:text-secondary-fixed" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full">
                        {block.timeSlot}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-surface-container-highest text-tertiary font-bold">
                          {block.blockType}
                        </span>
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => reorderSchedule(idx, idx - 1)}
                            className="p-1 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-surface-container"
                            title="Move earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === dailySchedule.length - 1}
                            onClick={() => reorderSchedule(idx, idx + 1)}
                            className="p-1 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface disabled:opacity-30 rounded hover:bg-slate-100 dark:hover:bg-surface-container"
                            title="Move later"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <h3
                      className={`text-sm font-headline font-bold text-slate-900 dark:text-on-surface mt-2 transition-all cursor-pointer ${
                        isDone ? 'line-through text-slate-400 dark:text-on-surface-variant' : ''
                      }`}
                      onClick={() => matchedTask && toggleTaskComplete(matchedTask.id)}
                    >
                      {block.title}
                    </h3>

                    {matchedTask?.description && (
                      <p className="text-xs text-slate-600 dark:text-on-surface-variant mt-1 leading-relaxed">
                        {matchedTask.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-outline-variant/30 text-[11px] font-mono text-slate-500 dark:text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {block.estimatedTime || '1 hr'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <BrainCircuit className="w-3.5 h-3.5 text-tertiary" />
                        {block.priority === 'P1' ? 'High Focus Required' : 'Standard Cadence'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {dailySchedule.length === 0 && (
              <div className="p-12 text-center text-slate-500 dark:text-on-surface-variant glass-panel rounded-2xl bg-white/80 dark:bg-surface-container/50 border border-slate-200 dark:border-zinc-800">
                <Calendar className="w-8 h-8 text-primary/40 mx-auto mb-2" />
                <p className="text-xs">No schedule generated yet.</p>
                <button
                  onClick={handleReplan}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-slate-950 font-bold text-xs shadow-glow hover:bg-primary-container hover:text-white transition-all"
                >
                  Generate Plan Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Column: Energy Allocation & Cognitive Guard */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-surface-container/60 border border-slate-200/90 dark:border-outline-variant/30 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                Cognitive Guardrails
              </h3>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-tertiary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-on-surface">15-Min Buffer Active</span>
                  <span className="text-[11px] text-slate-500 dark:text-on-surface-variant mt-0.5">
                    Prevents schedule bleed and cognitive fatigue between high-demand blocks.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container-low border border-slate-200 dark:border-outline-variant/30 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 dark:text-on-surface">Peak Window Protected</span>
                  <span className="text-[11px] text-slate-500 dark:text-on-surface-variant mt-0.5">
                    Critical P1 tasks assigned to morning peak neurochemical hours.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-outline-variant/30 flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-on-surface-variant">
              <span>Biological Urgency: Synced</span>
              <span className="text-tertiary font-bold">Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
