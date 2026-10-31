import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SpeechService } from '../services/speechService';
import UnmessLogo from './UnmessLogo';
import {
  Mic,
  MicOff,
  Clipboard,
  Trash2,
  CheckSquare,
  Clock,
  Bell,
  FileText,
  Download,
  Zap,
  Volume2,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  FileUp
} from 'lucide-react';
import ExtractedItemsList from './ExtractedItemsList';

const QUICK_INSPIRATIONS = [
  {
    label: "Hackathon Sprint",
    text: "Need to wrap up our presentation deck before the 3:00 PM sync with judges, deploy Cloud Firestore sync in Firebase, benchmark the AI cascade failovers under 250ms latency, and record our 2-minute demo video before portal closes tonight."
  },
  {
    label: "Product Sync Dump",
    text: "Product sync notes: Alex leads the payment refactor by next Wednesday. Sarah reported onboarding drop-off rose 14%, need cohort retention analysis tomorrow morning. Reminder to schedule user design interviews."
  },
  {
    label: "Daily Responsibilities",
    text: "Doctor appointment Tuesday at 11am, order ergonomic split keyboard for desk setup, send invoice to client before Friday 5pm, review pull request #42 for webhook retries, and buy groceries on way home."
  }
];

export default function Studio({ onOpenExport }) {
  const {
    chaosText,
    setChaosText,
    extractionMode,
    setExtractionMode,
    isProcessing,
    currentSession,
    runUnmess,
    clearSession,
    loadDemoSession
  } = useApp();

  const [activeTab, setActiveTab] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedCleaned, setCopiedCleaned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const speechRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setChaosText((prev) => prev ? `${prev}\n\n[Imported ${file.name}]:\n${text}` : text);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setChaosText((prev) => prev ? `${prev}\n\n[Imported ${file.name}]:\n${text}` : text);
      };
      reader.readAsText(file);
    }
  };

  // Dictation timer
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger UNMESS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isProcessing && chaosText.trim()) {
          runUnmess(chaosText, extractionMode);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chaosText, extractionMode, isProcessing, runUnmess]);

  // Voice dictation setup
  const toggleDictation = () => {
    if (isListening) {
      if (speechRef.current) speechRef.current.stop();
      setIsListening(false);
    } else {
      speechRef.current = new SpeechService(
        (transcript) => {
          setChaosText((prev) => prev ? `${prev} ${transcript}` : transcript);
        },
        (error) => {
          console.warn('Voice recognition error', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      const started = speechRef.current.start();
      if (started) {
        setIsListening(true);
      } else {
        alert('Speech recognition is not supported in this browser or microphone access was denied.');
      }
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setChaosText((prev) => (prev ? `${prev}\n${clipText}` : clipText));
      }
    } catch (e) {
      alert('Unable to access clipboard. Please paste manually with Ctrl+V / Cmd+V.');
    }
  };

  const charCount = chaosText.length;
  const wordCount = chaosText.trim() ? chaosText.trim().split(/\s+/).length : 0;
  const hasExtractedData = (currentSession?.tasks?.length > 0) || (currentSession?.deadlines?.length > 0) || currentSession?.cleanedProse;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
      {/* Top Studio Control Bar */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-panel shadow-md border border-slate-200/90 dark:border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-tertiary/20 border border-primary/30 flex items-center justify-center text-primary shadow-glow">
            <UnmessLogo className="w-6 h-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                De-Mess Studio
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                Cascade Engine Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant font-label">
              Convert unstructured cognitive entropy into deterministic action units
            </p>
          </div>
        </div>

        {/* Realtime Engine Routing & Quick Canvas Reset */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-slate-500 dark:text-on-surface-variant">Active Model:</span>
            <span className="text-slate-800 dark:text-on-surface font-semibold">
              {currentSession?.provider || 'Groq Qwen 3.8'}
            </span>
            <span className="text-primary text-[11px] bg-primary/10 px-2 py-0.5 rounded font-bold">
              {currentSession?.latencyMs ? `${currentSession.latencyMs}ms` : '124ms'}
            </span>
          </div>

          <button
            onClick={loadDemoSession}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-on-surface font-label transition-colors border border-slate-200 dark:border-zinc-800"
            title="Load Hackathon Demo Dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-tertiary" />
            <span className="font-semibold text-xs">Load Demo</span>
          </button>

          <button
            onClick={clearSession}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/80 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-on-surface-variant font-label transition-colors border border-slate-200 dark:border-zinc-800"
            title="Clear all text and extracted units"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="font-semibold text-xs">Reset</span>
          </button>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Stream (Entropy Capture) */}
        <section className="lg:col-span-5 flex flex-col gap-5 glass-panel rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200/90 dark:border-zinc-800/80 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface tracking-tight uppercase">
                Capture Thoughts
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-on-surface-variant uppercase tracking-widest bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full font-bold border border-slate-200 dark:border-zinc-800">
              Input Stream
            </span>
          </div>

          {/* Quick Inspiration Prompts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-label text-slate-500 dark:text-on-surface-variant font-medium">
              Quick Samples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_INSPIRATIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setChaosText(item.text)}
                  type="button"
                  className="text-[11px] font-label px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-all text-left shadow-sm active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Text Area Card (with Drag & Drop Support) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col bg-slate-50 dark:bg-zinc-950/80 rounded-2xl p-4 border transition-all shadow-inner ${isDragging
              ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
              : 'border-slate-200 dark:border-zinc-800 focus-within:border-primary/60'
              }`}
          >
            <div className="flex items-center justify-between pb-3 text-xs text-slate-500 dark:text-on-surface-variant">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>{charCount} characters</span>
                <span className="text-slate-400 dark:text-zinc-600">•</span>
                <span>{wordCount} words</span>
                {isDragging && (
                  <span className="text-primary font-bold animate-pulse ml-2">
                    Drop file to import!
                  </span>
                )}
              </div>
              {chaosText && (
                <button
                  onClick={() => setChaosText('')}
                  type="button"
                  className="flex items-center gap-1 text-slate-400 hover:text-error transition-colors text-xs font-label"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              value={chaosText}
              onChange={(e) => setChaosText(e.target.value)}
              placeholder="Dump your chaotic thoughts, voice note transcripts, unorganized meeting notes, deadlines, or drag & drop files here..."
              rows={9}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-on-surface font-body leading-relaxed outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
            />

            {/* Dictation Live Audio Visualizer Banner */}
            {isListening && (
              <div className="my-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-red-500">
                    Listening ({recordingSeconds}s)...
                  </span>
                </div>
                {/* Audio Waves */}
                <div className="flex items-center gap-1 h-6">
                  <div className="w-1 bg-red-500 rounded-full wave-bar-1" />
                  <div className="w-1 bg-red-500 rounded-full wave-bar-2" />
                  <div className="w-1 bg-red-500 rounded-full wave-bar-3" />
                  <div className="w-1 bg-red-500 rounded-full wave-bar-4" />
                  <div className="w-1 bg-red-500 rounded-full wave-bar-5" />
                </div>
              </div>
            )}

            {/* Bottom Controls Strip: Dictate, Paste, File Upload */}
            <div className="flex items-center justify-between pt-3 mt-2 bg-slate-100/90 dark:bg-zinc-900/70 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl border-t border-slate-200 dark:border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDictation}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-label flex items-center gap-1.5 transition-all ${isListening
                    ? 'bg-red-500 text-white font-bold shadow-glow animate-pulse'
                    : 'bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-on-surface border border-slate-200 dark:border-zinc-700 shadow-sm'
                    }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Dictation</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-primary" />
                      <span>Voice Dictate</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePasteClipboard}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-700 dark:text-on-surface font-label flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Paste
                </button>

                {/* File Upload Input & Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.json,.csv,.log,.vtt,.srt"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs text-slate-700 dark:text-on-surface font-label flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-zinc-700 shadow-sm"
                  title="Import text notes, transcript, or log file"
                >
                  <FileUp className="w-3.5 h-3.5 text-tertiary" />
                  <span>Upload File</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500 dark:text-on-surface-variant hidden sm:inline">
                UTF-8 Client Buffer • Drag & Drop Ready
              </span>
            </div>
          </div>

          {/* Parsing Strategy Segmented Control */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-label uppercase font-bold text-slate-500 dark:text-on-surface-variant tracking-wider">
              Extraction Strategy
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExtractionMode('balanced')}
                className={`p-3 rounded-xl flex flex-col gap-1 text-left transition-all border ${extractionMode === 'balanced'
                  ? 'bg-primary/15 border-primary/60 text-primary shadow-sm font-semibold'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <UnmessLogo className="w-3.5 h-3.5 text-primary" />
                  Balanced
                </span>
                <span className="text-[10px] text-slate-500 dark:text-on-surface-variant line-clamp-1">
                  Full decomposition
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExtractionMode('aggressive')}
                className={`p-3 rounded-xl flex flex-col gap-1 text-left transition-all border ${extractionMode === 'aggressive'
                  ? 'bg-primary/15 border-primary/60 text-primary shadow-sm font-semibold'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Action First
                </span>
                <span className="text-[10px] text-slate-500 dark:text-on-surface-variant line-clamp-1">
                  Zero-fluff tasks
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExtractionMode('executive')}
                className={`p-3 rounded-xl flex flex-col gap-1 text-left transition-all border ${extractionMode === 'executive'
                  ? 'bg-primary/15 border-primary/60 text-primary shadow-sm font-semibold'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  Exec Brief
                </span>
                <span className="text-[10px] text-slate-500 dark:text-on-surface-variant line-clamp-1">
                  Clean prose summary
                </span>
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => runUnmess(chaosText, extractionMode)}
              disabled={isProcessing || !chaosText.trim()}
              type="button"
              className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-primary to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-headline font-bold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(167,139,250,0.4)] hover:shadow-[0_0_40px_rgba(167,139,250,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Clarity...</span>
                </>
              ) : (
                <>
                  <UnmessLogo className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span>UNMESS & Extract Clarity</span>
                  <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded text-white ml-2">
                    ⌘⏎
                  </span>
                </>
              )}
            </button>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-on-surface-variant px-1 font-label">
              <span>Deterministic Neural Engine</span>
              <span className="flex items-center gap-1 text-tertiary font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                Zero Data Retention Safe
              </span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Intelligence & Structured Clarity */}
        <section className="lg:col-span-7 flex flex-col gap-5 glass-panel rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200/90 dark:border-zinc-800/80 relative min-h-[660px]">
          {/* Header & Export Hub Button */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-tertiary" />
              <h2 className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface tracking-tight uppercase">
                Structured Intelligence
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExport}
                disabled={!hasExtractedData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs font-label text-slate-800 dark:text-on-surface transition-all border border-slate-200 dark:border-zinc-800 shadow-sm disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold">Export Plan</span>
              </button>
              {hasExtractedData && (
                <span className="text-[11px] font-mono bg-tertiary/10 text-tertiary px-2.5 py-1 rounded-lg font-bold border border-tertiary/20">
                  Ready
                </span>
              )}
            </div>
          </div>

          {/* Animated Processing State (Executive Neural Pipeline) */}
          {isProcessing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
                  <UnmessLogo className="w-9 h-9 text-primary animate-pulse" />
                </div>
                <div className="absolute -inset-2 rounded-3xl border border-primary/20 animate-ping opacity-30" />
              </div>

              <h3 className="text-base font-headline font-bold text-slate-900 dark:text-on-surface mb-2">
                Decompressing Cognitive Entropy
              </h3>
              <p className="text-xs text-slate-500 dark:text-on-surface-variant max-w-sm mb-6 font-body">
                Parsing unstructured thoughts, isolating deadlines, prioritizing actions, and synthesizing cleaned prose...
              </p>

              {/* Step Progression Indicators */}
              <div className="flex flex-col gap-2.5 w-full max-w-xs text-left font-mono text-xs">
                <div className="flex items-center gap-2 text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>1. Parsing syntactic tokens</span>
                </div>
                <div className="flex items-center gap-2 text-violet-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span>2. Extracting discrete deliverables</span>
                </div>
                <div className="flex items-center gap-2 text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  <span>3. Computing urgency matrix & timeline</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Output Category Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto text-xs font-label">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'all'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-on-surface font-bold shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                    }`}
                >
                  <span>All Units</span>
                  <span className="text-[10px] font-mono bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded-full">
                    {(currentSession?.tasks?.length || 0) + (currentSession?.deadlines?.length || 0) + (currentSession?.reminders?.length || 0)}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'tasks'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-on-surface font-bold shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                    }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-primary" />
                  <span>Tasks</span>
                  <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.2 rounded-full">
                    {currentSession?.tasks?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('deadlines')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'deadlines'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-on-surface font-bold shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                    }`}
                >
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Deadlines</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-500 px-1.5 py-0.2 rounded-full">
                    {currentSession?.deadlines?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'reminders'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-on-surface font-bold shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                    }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reminders</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded-full">
                    {currentSession?.reminders?.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('synthesis')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ml-auto ${activeTab === 'synthesis'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-on-surface font-bold shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                    }`}
                >
                  <FileText className="w-3.5 h-3.5 text-tertiary" />
                  <span>Cleaned Prose</span>
                </button>
              </div>

              {/* Render Structured Content or Clean Empty State */}
              <div className="flex-1 flex flex-col">
                <ExtractedItemsList
                  activeTab={activeTab}
                  onOpenExport={onOpenExport}
                />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
