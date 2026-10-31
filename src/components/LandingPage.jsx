import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UnmessLogo from './UnmessLogo';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  Flame,
  BrainCircuit,
  Calendar,
  Download,
  ShieldCheck,
  Sliders,
  Sun,
  Moon,
  Radio,
  ChevronRight,
  Terminal,
  Grid,
  Activity,
  Layers,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Headphones,
  Network
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LandingPage({ onLaunchStudio, onOpenSettings, onOpenAuth }) {
  const {
    isDarkMode,
    setIsDarkMode,
    isShaderActive,
    setIsShaderActive,
    runUnmess,
    setChaosText
  } = useApp();

  const [sandboxInput, setSandboxInput] = useState(
    "Finalize presentation deck before 3:00 PM sync with judges. Deploy production backend to Firebase, verify multi-model router failovers, and review API latency."
  );
  const [sandboxProcessing, setSandboxProcessing] = useState(false);
  const [sandboxTransformed, setSandboxTransformed] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Bind scroll reveal animations
  useScrollAnimation();

  // Track dynamic scroll progress for top glowing bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const percent = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
        setScrollProgress(percent);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDecompressDemo = () => {
    setSandboxProcessing(true);
    setTimeout(() => {
      setSandboxProcessing(false);
      setSandboxTransformed(true);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#34d399', '#ffffff']
      });
    }, 500);
  };

  const handleLaunchWithInput = () => {
    setChaosText(sandboxInput);
    onLaunchStudio();
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-on-surface flex flex-col relative z-10 selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Animated Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-primary to-emerald-400 z-[100] transition-all duration-150 ease-out shadow-glow"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Floating Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/90 dark:bg-[#09090b]/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-zinc-800/80 z-50 flex items-center justify-between px-6 lg:px-12 transition-all shadow-sm dark:shadow-none">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container-high dark:bg-zinc-900/90 border border-primary/30 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <UnmessLogo className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-headline font-bold tracking-wider text-slate-900 dark:text-on-surface uppercase group-hover:text-primary transition-colors">
              UNMESS
            </span>
            <span className="text-[10px] text-tertiary font-mono tracking-tight -mt-0.5 font-bold">
              Turn Chaos Into Clarity
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-label text-slate-600 dark:text-on-surface-variant font-medium">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">Capabilities</a>
          <a href="#interactive-demo" className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">Interactive Demo</a>
          <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">Workflow</a>
          <a href="#architecture" className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">Architecture</a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Hardware & Theme Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setIsShaderActive(!isShaderActive)}
              className={`p-1.5 rounded-lg transition-colors text-xs ${isShaderActive ? 'text-primary bg-primary/10' : 'text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                }`}
              title={isShaderActive ? "Pause Glitch Texture (Saves Battery/GPU)" : "Resume Background Video"}
            >
              <Radio className={`w-4 h-4 ${isShaderActive ? 'animate-pulse' : ''}`} />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>
          </div>

          {/* Launch Studio CTA */}
          <button
            onClick={onLaunchStudio}
            className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-xs tracking-wide flex items-center gap-2 shadow-glow hover:opacity-95 active:scale-95 transition-all"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-36 pb-20 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col items-center text-center animate-fade-in-up">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm mb-6 animate-float">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-xs font-mono text-slate-600 dark:text-on-surface-variant font-medium">
            Executive Productivity System
          </span>
          <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold ml-1">
            Groq • Gemini • OpenRouter • Local
          </span>
        </div>

        {/* Main Pitch Headlines */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-headline font-extrabold tracking-tight text-slate-900 dark:text-on-surface max-w-4xl leading-[1.08]">
          Turn Chaos Into <span className="bg-gradient-to-r from-primary via-violet-500 to-tertiary bg-clip-text text-transparent">Clarity.</span>
        </h1>

        <p className="text-xl sm:text-2xl text-slate-600 dark:text-on-surface-variant font-headline font-medium mt-6 max-w-2xl leading-snug">
          "Your mind wasn't built to remember everything. <br className="hidden sm:inline" />
          <span className="text-slate-900 dark:text-on-surface font-semibold">Let UNMESS organize it.</span>"
        </p>

        <p className="text-sm sm:text-base text-slate-500 dark:text-secondary-fixed max-w-xl mt-4 leading-relaxed font-body">
          Transform unstructured thoughts, fragmented meeting notes, audio memos, and competing priorities into deterministic action items, scheduled time blocks, and synthesized briefings.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={onLaunchStudio}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm tracking-wide flex items-center gap-3 shadow-glow hover:opacity-95 active:scale-95 transition-all"
          >
            <UnmessLogo className="w-5 h-5 text-white" />
            <span>Launch De-Mess Studio</span>
            <span className="font-mono text-xs bg-black/25 px-2 py-0.5 rounded text-white ml-1">
              ⌘⏎
            </span>
          </button>

          <a
            href="#interactive-demo"
            className="px-7 py-4 rounded-2xl bg-white dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-on-surface font-headline font-bold text-sm border border-slate-200 dark:border-zinc-800 flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Live Interactive Demo</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </a>
        </div>

        {/* Real-Time Telemetry Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-16 pt-8 border-t border-slate-200 dark:border-zinc-800 text-left">
          <div className="p-4 rounded-xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 flex flex-col gap-1">
            <span className="text-xs font-mono text-tertiary font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-tertiary" /> &lt; 250ms Response
            </span>
            <span className="text-xs text-slate-900 dark:text-on-surface font-semibold">Deterministic Output</span>
            <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono">Zero cognitive wait time</span>
          </div>

          <div className="p-4 rounded-xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 flex flex-col gap-1">
            <span className="text-xs font-mono text-primary font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> -68% Token Overhead
            </span>
            <span className="text-xs text-slate-900 dark:text-on-surface font-semibold">Efficient Architecture</span>
            <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono">Lean compact schemas</span>
          </div>

          <div className="p-4 rounded-xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 flex flex-col gap-1">
            <span className="text-xs font-mono text-amber-500 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> Multi-Model Cascade
            </span>
            <span className="text-xs text-slate-900 dark:text-on-surface font-semibold">Automatic Failover</span>
            <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono">Zero dropped thoughts</span>
          </div>

          <div className="p-4 rounded-xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 flex flex-col gap-1">
            <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Private & Local
            </span>
            <span className="text-xs text-slate-900 dark:text-on-surface font-semibold">Privacy First</span>
            <span className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono">100% Client-side sandbox</span>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO SANDBOX */}
      <section id="interactive-demo" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto w-full reveal-on-scroll">
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-xs font-mono text-primary uppercase font-bold tracking-widest">
            Live Transformation Sandbox
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900 dark:text-on-surface mt-2">
            Watch Unstructured Chaos Decompress
          </h2>
          <p className="text-sm text-slate-600 dark:text-on-surface-variant mt-2 max-w-lg">
            Experience how raw scattered thoughts transform into clean readable prose, deadlines, and time-sequenced actions in real time.
          </p>
        </div>

        {/* Split Sandbox Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Input Chaos */}
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-slate-200 dark:border-zinc-800 hover-lift">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600 dark:text-on-surface-variant uppercase tracking-wider font-bold">
                  Raw Input (Entropy)
                </span>
                <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                  Unstructured
                </span>
              </div>
              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                rows={7}
                className="w-full bg-slate-50 dark:bg-zinc-950/80 text-xs sm:text-sm text-slate-900 dark:text-on-surface font-body p-4 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none resize-none leading-relaxed"
                placeholder="Type your messy stream of consciousness here..."
              />
            </div>

            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                onClick={handleDecompressDemo}
                disabled={sandboxProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-glow hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                {sandboxProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Decompressing...</span>
                  </>
                ) : (
                  <>
                    <UnmessLogo className="w-4 h-4 text-white" />
                    <span>Run UNMESS</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLaunchWithInput}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-on-surface border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 transition-colors"
                title="Send input into full studio workspace"
              >
                <span>Full Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary" />
              </button>
            </div>
          </div>

          {/* Right: Output Clarity */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-tertiary/40 hover-lift">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  <span className="text-xs font-mono text-tertiary uppercase tracking-wider font-bold">
                    Structured Clarity Output
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-bold border border-tertiary/20">
                  Organized
                </span>
              </div>

              {/* Polished Prose Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mb-1">
                  Synthesized Briefing
                </span>
                <p className="text-xs text-slate-800 dark:text-on-surface leading-relaxed font-body">
                  "The immediate priority is completing the presentation deck prior to the 3:00 PM sync with judges. Infrastructure milestones include deploying the backend to Firebase and verifying multi-model router failovers."
                </p>
              </div>

              {/* Extracted Action Units */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-500 dark:text-secondary-fixed font-bold uppercase tracking-wider">
                  Extracted Action Units
                </span>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs border-l-4 border-l-rose-500">
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500">
                      CRITICAL P1
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-on-surface">Finalize presentation deck</span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-500 flex items-center gap-1 font-bold">
                    <Clock className="w-3 h-3" /> Due: 3:00 PM
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs border-l-4 border-l-violet-500">
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/15 text-primary">
                      HIGH P2
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-on-surface">Deploy production to Firebase</span>
                  </div>
                  <span className="text-[11px] font-mono text-primary flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3" /> Cloud Firestore
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs border-l-4 border-l-emerald-500">
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-tertiary">
                      NORMAL P3
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-on-surface">Verify multi-model router failovers</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-secondary-fixed flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 30m effort
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-on-surface-variant font-mono">
              <span>Ready for execution</span>
              <button
                onClick={onLaunchStudio}
                className="text-primary hover:underline flex items-center gap-1 font-bold"
              >
                Open in Full Workspace →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES BENTO GRID */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto w-full reveal-on-scroll">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono text-tertiary uppercase font-bold tracking-widest">
            Executive Productivity
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900 dark:text-on-surface mt-2">
            Engineered for High-Pressure Execution
          </h2>
          <p className="text-sm text-slate-600 dark:text-on-surface-variant mt-2 max-w-lg">
            Built as a deterministic clarity workstation, not a conversational chatbot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-1">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">De-Mess Studio</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Stream-of-consciousness input, audio voice dictation, and presets. Convert chaotic meeting rambles into clean, actionable units.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-primary flex items-center gap-1 font-semibold">
              Voice Dictation • UTF-8 Buffer
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-2">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Priority Assistant</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                4-Quadrant Urgency-Impact Matrix. Automatically weighs approaching deadlines against mental effort to surface what deserves focus first.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-rose-500 flex items-center gap-1 font-semibold">
              Eisenhower Matrix • Urgency Scoring
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-3">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Smart Daily Planner</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Chrono-sequenced timeline blocks designed around deep work and operational focus, with built-in burnout buffers.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-tertiary flex items-center gap-1 font-semibold">
              Timeline Sequencing • Capacity Meter
            </div>
          </div>

          {/* Card 4 */}
          <div id="architecture" className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-1">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Multi-Model Cascade</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Cascades across Groq, Gemini, OpenRouter, and local smart NLP. If one provider rate limits, the next takes over seamlessly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-primary flex items-center gap-1 font-semibold">
              Zero Downtime • Auto Failover
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-2">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary/15 text-tertiary flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Universal Export Hub</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                1-click export to Markdown for Notion & Obsidian, iCalendar (.ics) for Google & Apple Calendar, Plain Text, or developer JSON.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-tertiary flex items-center gap-1 font-semibold">
              .ics • .md • .txt • .json
            </div>
          </div>

          {/* Card 6 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-3">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Deep Focus Engine</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Pomodoro timers with zero-latency Web Audio soundscapes: Cyber Rain, 40Hz Theta binaural beats, and Brown Noise.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-rose-500 flex items-center gap-1 font-semibold">
              Binaural Focus • 100% Offline
            </div>
          </div>

          {/* Card 7 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-1">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-primary flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Cognitive Topology</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Interactive 2D visual mind map. Graphically maps relationships between raw cognitive entropy, critical deadlines, and action clusters.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-primary flex items-center gap-1 font-semibold">
              Interactive 2D Graph • Zoom & Filter
            </div>
          </div>

          {/* Card 8 */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between hover-lift reveal-on-scroll stagger-2">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-on-surface flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-headline font-bold text-slate-900 dark:text-on-surface">Television Glitch Texture</h3>
              <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
                Atmospheric looping CRT texture with cybernetic scanlines. Includes instant hardware pause for battery and GPU optimization.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-500 dark:text-secondary-fixed flex items-center gap-1 font-semibold">
              Hardware Guard Toggle
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-5xl mx-auto w-full reveal-on-scroll">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono text-primary uppercase font-bold tracking-widest">
            Streamlined Execution
          </span>
          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900 dark:text-on-surface mt-2">
            From Mental Chaos to Action in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3 p-6 rounded-2xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 reveal-on-scroll stagger-1">
            <span className="text-3xl font-mono font-bold text-primary">01</span>
            <h3 className="text-base font-headline font-bold text-slate-900 dark:text-on-surface">Input Thoughts</h3>
            <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
              Paste fragmented notes, dictations, or unformatted meeting memos into the studio.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 reveal-on-scroll stagger-2">
            <span className="text-3xl font-mono font-bold text-tertiary">02</span>
            <h3 className="text-base font-headline font-bold text-slate-900 dark:text-on-surface">Automated Structuring</h3>
            <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
              UNMESS isolates tasks, extracts deadlines, scores urgency, and generates clean prose.
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-2xl glass-panel hover-lift border border-slate-200 dark:border-zinc-800 reveal-on-scroll stagger-3">
            <span className="text-3xl font-mono font-bold text-emerald-500">03</span>
            <h3 className="text-base font-headline font-bold text-slate-900 dark:text-on-surface">Plan & Export</h3>
            <p className="text-xs text-slate-600 dark:text-on-surface-variant leading-relaxed">
              Review your day's schedule, track action items, and sync to your calendar with 1 click.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto w-full reveal-on-scroll">
        <div className="p-10 rounded-3xl glass-panel border border-primary/40 text-center flex flex-col items-center gap-5 shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-primary/40 flex items-center justify-center shadow-glow animate-float">
            <UnmessLogo className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-headline font-bold text-slate-900 dark:text-on-surface">
            Ready to Turn Chaos Into Clarity?
          </h2>

          <p className="text-sm text-slate-600 dark:text-on-surface-variant max-w-md leading-relaxed">
            Stop letting deadlines and ideas slip away. Experience deterministic cognitive clarity today.
          </p>

          <button
            onClick={onLaunchStudio}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm tracking-wide shadow-glow hover:opacity-95 active:scale-95 transition-all mt-2"
          >
            Open UNMESS Studio Workspace
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 py-10 px-6 lg:px-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-on-surface-variant">
          <div className="flex items-center gap-2.5">
            <UnmessLogo className="w-4 h-4 text-primary" />
            <span className="font-bold uppercase text-slate-900 dark:text-on-surface">UNMESS</span>
            <span>—</span>
            <span>Turn Chaos into Clarity</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onLaunchStudio} className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">
              Studio Workspace
            </button>
            <span>•</span>
            <button onClick={onOpenSettings} className="hover:text-slate-900 dark:hover:text-on-surface transition-colors">
              API Keys
            </button>
            <span>•</span>
            <span className="text-tertiary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> All Nodes Nominal
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
