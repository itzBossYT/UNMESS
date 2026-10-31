import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import UnmessLogo from './UnmessLogo';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Trash2, 
  Edit3, 
  Plus, 
  Clock, 
  Bell, 
  Copy, 
  Check, 
  ArrowRight, 
  Tag, 
  Zap, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Split
} from 'lucide-react';
import { downloadFile, exportToICS } from '../services/exportService';
import confetti from 'canvas-confetti';

export default function ExtractedItemsList({ activeTab, onOpenExport }) {
  const { 
    currentSession, 
    toggleTaskComplete, 
    updateTask, 
    deleteTask, 
    addTask, 
    updateCleanedProse, 
    loadDemoSession 
  } = useApp();

  const [copiedProse, setCopiedProse] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('P2');
  const [newTaskEst, setNewTaskEst] = useState('30m');

  const { tasks = [], deadlines = [], reminders = [], ideas = [], cleanedProse = '' } = currentSession || {};

  // Calculate Cognitive Load
  const totalMinutes = tasks.reduce((acc, t) => {
    const timeStr = t.estimatedTime || '30m';
    if (timeStr.includes('h')) {
      const hours = parseFloat(timeStr) || 1;
      return acc + hours * 60;
    }
    const mins = parseInt(timeStr) || 30;
    return acc + mins;
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const isOverloaded = totalMinutes > 240; // Over 4h deep focus load

  const handleCopyProse = () => {
    navigator.clipboard.writeText(cleanedProse);
    setCopiedProse(true);
    setTimeout(() => setCopiedProse(false), 2000);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEditTask = (taskId) => {
    if (editTitle.trim()) {
      updateTask(taskId, { title: editTitle.trim() });
    }
    setEditingTaskId(null);
  };

  const handleCreateNewTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      estimatedTime: newTaskEst,
      category: 'General',
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleExportICS = (item) => {
    const taskObj = {
      title: item.title,
      priority: 'P1',
      estimatedTime: '1h',
      deadlineText: item.deadlineText || 'Today'
    };
    const icsContent = exportToICS([taskObj], []);
    downloadFile(icsContent, `${item.title.replace(/\s+/g, '_')}.ics`, 'text/calendar');
  };

  // Deconstruct a task into atomic sub-tasks
  const handleDeconstructTask = (task) => {
    const subTasks = [
      { id: `${task.id}-st1`, title: `Scope & outline deliverables for ${task.title}`, completed: false, time: '15m' },
      { id: `${task.id}-st2`, title: `Execute core implementation & assets`, completed: false, time: '20m' },
      { id: `${task.id}-st3`, title: `Verify output & finalize polish`, completed: false, time: '10m' },
    ];
    updateTask(task.id, { subTasks, isDeconstructed: true });
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.6 }
    });
  };

  const toggleSubTask = (task, subTaskId) => {
    const subs = task.subTasks || [];
    const updated = subs.map(s => s.id === subTaskId ? { ...s, completed: !s.completed } : s);
    const allDone = updated.length > 0 && updated.every(s => s.completed);
    updateTask(task.id, { subTasks: updated, completed: allDone });
    if (allDone) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // If Synthesis / Polished Prose Tab is active (The Core "Turn Chaos into Clarity" pitch!)
  if (activeTab === 'synthesis') {
    return (
      <div className="flex flex-col gap-4 animate-fade-in">
        <div className="bg-slate-50 dark:bg-zinc-950/80 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center">
                <UnmessLogo className="w-4 h-4 text-tertiary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                  Synthesized Clarity Prose
                </span>
                <span className="text-[11px] text-tertiary font-mono font-semibold">
                  Cognitive decompression complete • Polished executive summary
                </span>
              </div>
            </div>
            {cleanedProse && (
              <button
                onClick={handleCopyProse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-xs font-label text-slate-800 dark:text-on-surface transition-all border border-slate-200 dark:border-zinc-700 shadow-sm"
              >
                {copiedProse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-primary" />}
                <span className="font-semibold">{copiedProse ? 'Copied!' : 'Copy Prose'}</span>
              </button>
            )}
          </div>

          {cleanedProse ? (
            <textarea
              value={cleanedProse}
              onChange={(e) => updateCleanedProse(e.target.value)}
              rows={8}
              className="w-full bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-on-surface font-body p-4 rounded-xl border border-slate-200 dark:border-zinc-800 leading-relaxed outline-none focus:border-primary shadow-inner resize-none"
              placeholder="Cleaned prose will appear here..."
            />
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs font-label">
              No synthesized prose generated yet. Run UNMESS on the left to decompress your thoughts.
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-on-surface-variant font-mono pt-1 border-t border-slate-200 dark:border-zinc-800">
            <span>Directly editable executive summary</span>
            <span className="text-tertiary font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ready for team sync
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Determine what to display based on tab
  const showTasks = activeTab === 'all' || activeTab === 'tasks';
  const showDeadlines = activeTab === 'all' || activeTab === 'deadlines';
  const showReminders = activeTab === 'all' || activeTab === 'reminders';
  const hasAnyData = tasks.length > 0 || deadlines.length > 0 || reminders.length > 0;

  return (
    <div className="flex flex-col gap-4 max-h-[580px] overflow-y-auto pr-1">
      {/* Workload Sanity & Cognitive Burnout Meter */}
      {tasks.length > 0 && (
        <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
          isOverloaded 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
        }`}>
          <div className="flex items-center gap-2.5">
            {isOverloaded ? (
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-on-surface">
                {isOverloaded ? 'Cognitive Overload Warning' : 'Balanced Cognitive Flow'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono">
                Total Load: {hours}h {remainingMins}m across {tasks.length} tasks • Capacity SLA: 4.5h deep focus
              </span>
            </div>
          </div>

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
            isOverloaded ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isOverloaded ? 'Heavy Load' : 'Optimal'}
          </span>
        </div>
      )}

      {/* Quick Add Task Form */}
      {isAddingTask ? (
        <form onSubmit={handleCreateNewTask} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-primary/40 flex flex-col gap-3 shadow-md animate-fade-in">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task description..."
            autoFocus
            className="w-full bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-on-surface p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 outline-none"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-on-surface rounded-lg p-1.5 border border-slate-200 dark:border-zinc-700 outline-none"
              >
                <option value="P1">P1 - Urgent</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Normal</option>
                <option value="P4">P4 - Low</option>
              </select>

              <input
                type="text"
                value={newTaskEst}
                onChange={(e) => setNewTaskEst(e.target.value)}
                placeholder="Est time (e.g. 45m)"
                className="bg-white dark:bg-zinc-800 text-xs text-slate-900 dark:text-on-surface rounded-lg p-1.5 border border-slate-200 dark:border-zinc-700 w-28 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-sm"
              >
                Save Task
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 text-xs font-label text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:border-primary/60 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-all font-semibold"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
          <span>Add Custom Action Item</span>
        </button>
      )}

      {/* TASKS LIST */}
      {showTasks && tasks.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {activeTab === 'all' && (
            <div className="flex items-center justify-between text-xs font-label text-slate-500 dark:text-on-surface-variant uppercase tracking-wider font-bold pt-1">
              <span>Action Items ({tasks.length})</span>
            </div>
          )}

          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const isP1 = task.priority === 'P1';
            const isP2 = task.priority === 'P2';
            const isP3 = task.priority === 'P3';
            const subTasks = task.subTasks || [];
            const subDoneCount = subTasks.filter(s => s.completed).length;

            const accentBorder = isP1 
              ? 'border-l-4 border-l-rose-500 hover:border-l-rose-400 hover:shadow-[0_8px_28px_rgba(244,63,94,0.18)]' 
              : isP2 
              ? 'border-l-4 border-l-violet-500 hover:border-l-violet-400 hover:shadow-[0_8px_28px_rgba(167,139,250,0.18)]' 
              : isP3 
              ? 'border-l-4 border-l-emerald-500 hover:border-l-emerald-400 hover:shadow-[0_8px_28px_rgba(52,211,153,0.18)]' 
              : 'border-l-4 border-l-slate-400 hover:shadow-md';

            return (
              <article
                key={task.id}
                className={`group rounded-2xl p-4 transition-all shadow-sm flex flex-col gap-3 border border-slate-200 dark:border-zinc-800/80 hover-lift ${accentBorder} ${
                  task.completed
                    ? 'bg-slate-50/70 dark:bg-zinc-950/40 opacity-55'
                    : 'bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskComplete(task.id)}
                      className="mt-0.5 text-primary hover:text-tertiary transition-colors flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-primary" />
                      )}
                    </button>

                    <div className="flex flex-col flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditTask(task.id)}
                            className="bg-slate-100 dark:bg-zinc-800 text-xs text-slate-900 dark:text-on-surface p-1.5 rounded border border-primary flex-1 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditTask(task.id)}
                            className="px-2 py-1 text-xs rounded bg-primary text-white font-bold"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-xs sm:text-sm font-semibold tracking-tight transition-all ${
                            task.completed
                              ? 'line-through text-slate-400 dark:text-zinc-500'
                              : 'text-slate-900 dark:text-on-surface'
                          }`}
                        >
                          {task.title}
                        </span>
                      )}

                      {/* Meta badges: Priority, Duration, Category, Deconstruct Button */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            isP1
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                              : isP2
                              ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {task.priority || 'P2'}
                        </span>

                        {task.estimatedTime && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-on-surface-variant flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {task.estimatedTime}
                          </span>
                        )}

                        {task.category && (
                          <span className="text-[10px] font-label text-slate-500 dark:text-on-surface-variant bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                            #{task.category}
                          </span>
                        )}

                        {/* Deconstruct Action Pill */}
                        {subTasks.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleDeconstructTask(task)}
                            className="text-[10px] font-mono text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded flex items-center gap-1 transition-colors border border-primary/20"
                            title="Break down into atomic sub-tasks"
                          >
                            <Split className="w-3 h-3" />
                            <span>Deconstruct</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded font-bold">
                            {subDoneCount}/{subTasks.length} Steps
                          </span>
                        )}
                      </div>

                      {/* Sub-Tasks Checklist Section */}
                      {subTasks.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col gap-1.5 pl-2">
                          {subTasks.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => toggleSubTask(task, sub.id)}
                                className="text-primary hover:text-emerald-400 transition-colors"
                              >
                                {sub.completed ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                                )}
                              </button>
                              <span className={`text-[11px] ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                                {sub.title}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 ml-auto">{sub.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => startEditTask(task)}
                      className="p-1 text-slate-400 hover:text-primary transition-colors rounded"
                      title="Edit task title"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-error transition-colors rounded"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* DEADLINES LIST */}
      {showDeadlines && deadlines.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2">
          {activeTab === 'all' && (
            <div className="text-xs font-label text-slate-500 dark:text-on-surface-variant uppercase tracking-wider font-bold">
              Hard Deadlines ({deadlines.length})
            </div>
          )}
          {deadlines.map((dl) => (
            <div
              key={dl.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-500/20 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-all hover-lift"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-on-surface">{dl.title}</span>
                  <span className="text-[10px] text-rose-500 font-mono font-bold">{dl.deadlineText}</span>
                </div>
              </div>
              <button
                onClick={() => handleExportICS(dl)}
                className="text-xs font-label px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-on-surface border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5 font-mono text-[11px] font-semibold"
              >
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Sync to Cal
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REMINDERS LIST */}
      {showReminders && reminders.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-2">
          {activeTab === 'all' && (
            <div className="text-xs font-label text-slate-500 dark:text-on-surface-variant uppercase tracking-wider font-bold">
              Key Reminders ({reminders.length})
            </div>
          )}
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/20 flex items-center gap-3 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-on-surface">{rem.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!hasAnyData && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 dark:text-on-surface-variant animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-glow">
            <UnmessLogo className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-headline font-bold text-slate-800 dark:text-on-surface">
            Ready for your thoughts
          </p>
          <p className="text-xs text-slate-500 dark:text-on-surface-variant mt-1 max-w-xs font-body">
            Type or speak in the stream on the left, then press <span className="font-mono text-primary font-bold">⌘⏎</span> to extract actionable clarity.
          </p>
          <button
            onClick={loadDemoSession}
            type="button"
            className="mt-4 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Load Competition Demo</span>
          </button>
        </div>
      )}
    </div>
  );
}
