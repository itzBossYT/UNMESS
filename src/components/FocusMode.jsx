import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ambientSound } from '../services/ambientAudio';
import UnmessLogo from './UnmessLogo';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Zap, 
  Flame, 
  Check, 
  Radio, 
  Headphones, 
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DURATIONS = [
  { label: 'Pomodoro', minutes: 25, type: 'focus' },
  { label: 'Deep Work', minutes: 45, type: 'focus' },
  { label: 'Power Sprint', minutes: 15, type: 'focus' },
  { label: 'Quick Reset', minutes: 5, type: 'break' },
];

export default function FocusMode() {
  const { currentSession, toggleTaskComplete } = useApp();
  const { tasks = [] } = currentSession || {};

  // Active task selection
  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const [selectedTaskId, setSelectedTaskId] = useState(() => uncompletedTasks[0]?.id || tasks[0]?.id || null);

  // Timer states
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Audio states
  const [ambientTrack, setAmbientTrack] = useState('none');
  const [volume, setVolume] = useState(0.45);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || uncompletedTasks[0] || tasks[0];

  // Sync selected task if none set
  useEffect(() => {
    if (!selectedTaskId && uncompletedTasks.length > 0) {
      setSelectedTaskId(uncompletedTasks[0].id);
    }
  }, [uncompletedTasks, selectedTaskId]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#34d399', '#ffffff']
      });
      // Play ding if audio context active
      ambientSound.playTrack('none');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const handleSelectDuration = (minutes) => {
    setDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(durationMinutes * 60);
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleCompleteActiveTask = () => {
    if (activeTask) {
      toggleTaskComplete(activeTask.id);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#34d399', '#a78bfa', '#f59e0b']
      });

      // Advance to next uncompleted task
      const remaining = uncompletedTasks.filter((t) => t.id !== activeTask.id);
      if (remaining.length > 0) {
        setSelectedTaskId(remaining[0].id);
      }
    }
  };

  const handleTrackChange = (trackName) => {
    setAmbientTrack(trackName);
    ambientSound.playTrack(trackName);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSound.setVolume(val);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const totalSeconds = durationMinutes * 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;
  const strokeDashoffset = 565 - (565 * progressPercent) / 100;

  return (
    <div className={`flex flex-col gap-6 max-w-6xl mx-auto pb-24 ${isFullscreen ? 'p-8 bg-zinc-950 min-h-screen text-white' : ''}`}>
      {/* Top Banner */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-panel shadow-md border border-slate-200/90 dark:border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-tertiary/20 border border-primary/30 flex items-center justify-center text-primary shadow-glow">
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                Deep Work Focus Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase">
                Hyper-Focus Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant font-label">
              Distraction-free execution sandbox with built-in Web Audio focus soundscapes
            </p>
          </div>
        </div>

        {/* Fullscreen & Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-on-surface-variant transition-colors border border-slate-200 dark:border-zinc-800"
            title="Toggle Distraction-Free Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* Main Execution View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Massive Circular Focus Timer */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border border-slate-200/90 dark:border-zinc-800/80 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[90px] pointer-events-none" />

          {/* Duration Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 mb-8 z-10 text-xs font-label">
            {DURATIONS.map((dur) => (
              <button
                key={dur.label}
                onClick={() => handleSelectDuration(dur.minutes)}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                  durationMinutes === dur.minutes
                    ? 'bg-primary text-white shadow-glow'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                }`}
              >
                {dur.label} ({dur.minutes}m)
              </button>
            ))}
          </div>

          {/* Circular SVG Timer */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center z-10">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
              {/* Background Ring */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200 dark:text-zinc-800/80"
              />
              {/* Progress Ring with Neon Aura */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="9"
                strokeDasharray="565"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="text-primary transition-all duration-1000 ease-linear"
                style={{ filter: 'drop-shadow(0 0 12px rgba(167, 139, 250, 0.75))' }}
              />
            </svg>

            {/* Center Time Display */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold tracking-tight text-slate-900 dark:text-on-surface">
                {timeFormatted}
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-on-surface-variant font-bold mt-1">
                {isActive ? 'Deep Focus Active' : 'Paused / Standby'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 mt-8 z-10">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-on-surface-variant transition-colors border border-slate-200 dark:border-zinc-800 shadow-sm active:scale-95"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleToggleTimer}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary via-violet-600 to-tertiary text-white font-headline font-bold text-sm tracking-wide shadow-glow hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Pause Focus</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Flow Session</span>
                </>
              )}
            </button>
          </div>

          {/* Soundscape Control Bar */}
          <div className="w-full max-w-md mt-8 pt-6 border-t border-slate-200 dark:border-zinc-800/80 flex flex-col gap-3 z-10">
            <div className="flex items-center justify-between text-xs font-label">
              <span className="text-slate-600 dark:text-on-surface-variant flex items-center gap-1.5 font-semibold">
                <Headphones className="w-3.5 h-3.5 text-primary" />
                <span>Ambient Focus Audio (Web Audio Synthesizer)</span>
              </span>
              <span className="font-mono text-[10px] text-tertiary font-bold">100% Offline</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { id: 'none', label: 'Off' },
                { id: 'rain', label: '🌧️ Rain' },
                { id: 'binaural', label: '🧠 40Hz Beta' },
                { id: 'brown', label: '🌊 Calm Wave' },
              ].map((trk) => (
                <button
                  key={trk.id}
                  onClick={() => handleTrackChange(trk.id)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all font-semibold ${
                    ambientTrack === trk.id
                      ? 'bg-primary/20 border-primary text-primary shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {trk.label}
                </button>
              ))}
            </div>

            {ambientTrack !== 'none' && (
              <div className="flex items-center gap-3 pt-2">
                <Volume2 className="w-4 h-4 text-primary" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-500 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Active Mission & Task Queue */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Active Focus Target Card */}
          <div className="glass-panel rounded-3xl p-6 border-2 border-primary/40 shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest bg-primary/15 px-2.5 py-1 rounded-full border border-primary/30">
                Current Focus Mission
              </span>
              {activeTask?.priority && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-500">
                  {activeTask.priority}
                </span>
              )}
            </div>

            {activeTask ? (
              <div className="flex flex-col gap-2 my-2">
                <h2 className="text-xl font-headline font-bold text-slate-900 dark:text-on-surface leading-snug">
                  {activeTask.title}
                </h2>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Est: {activeTask.estimatedTime || '45m'}
                  </span>
                  <span>•</span>
                  <span>#{activeTask.category || 'Focus'}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs font-label">
                No active tasks left! All missions completed.
              </div>
            )}

            {activeTask && (
              <button
                onClick={handleCompleteActiveTask}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-headline font-bold text-xs tracking-wide shadow-glow flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Mark Mission Complete (Confetti)</span>
              </button>
            )}
          </div>

          {/* Up Next Queue */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/90 dark:border-zinc-800/80 shadow-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-tertiary" />
                <h3 className="text-xs font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                  Upcoming Priority Queue ({uncompletedTasks.length})
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {uncompletedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    task.id === selectedTaskId
                      ? 'bg-primary/10 border-primary/50 text-slate-900 dark:text-on-surface font-semibold shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-on-surface-variant hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="truncate">{task.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 flex-shrink-0">
                    {task.estimatedTime || '30m'}
                  </span>
                </div>
              ))}

              {uncompletedTasks.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Your queue is totally clear! Pure clarity achieved.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

