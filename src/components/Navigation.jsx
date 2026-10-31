import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import UnmessLogo from './UnmessLogo';
import { 
  Home,
  Terminal, 
  Calendar, 
  Grid, 
  Activity, 
  Sun, 
  Moon, 
  Sliders, 
  User as UserIcon, 
  Radio,
  Zap,
  Download,
  ChevronRight,
  Headphones,
  Network,
  Search
} from 'lucide-react';

export default function Navigation({ onOpenSettings, onOpenAuth, onOpenCommandPalette }) {
  const { 
    activeView, 
    setActiveView, 
    isDarkMode, 
    setIsDarkMode, 
    isShaderActive, 
    setIsShaderActive,
    currentSession,
    totalTokensSaved
  } = useApp();

  const { currentUser, isFirebaseOnline } = useAuth();

  // If on Landing Page, the landing page renders its own custom floating header
  if (activeView === 'landing') {
    return null;
  }

  const navItems = [
    { id: 'landing', label: 'Homepage / Overview', icon: Home },
    { id: 'studio', label: 'De-Mess Studio', icon: Terminal },
    { id: 'focus', label: 'Focus Flow & Audio', icon: Headphones },
    { id: 'mindmap', label: 'Cognitive Topology', icon: Network },
    { id: 'planner', label: 'Smart Planner', icon: Calendar },
    { id: 'matrix', label: 'Task Matrix', icon: Grid },
    { id: 'insights', label: 'Insights & History', icon: Activity },
  ];

  const currentViewLabel = navItems.find(i => i.id === activeView)?.label || 'De-Mess Studio';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/90 dark:bg-surface-container-lowest/85 backdrop-blur-xl z-50 flex flex-col justify-between p-4 shadow-[1px_0_12px_rgba(0,0,0,0.04)] dark:shadow-[1px_0_12px_rgba(0,0,0,0.5)] border-r border-slate-200/90 dark:border-outline-variant/30 hidden md:flex">
        <div className="flex flex-col gap-5">
          {/* Logo & Tagline (Clicking switches to Landing Page) */}
          <button 
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 px-2 py-1 text-left group"
            title="Go to Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center font-bold shadow-glow group-hover:scale-105 transition-transform">
              <UnmessLogo className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-headline font-bold tracking-wider text-slate-900 dark:text-on-surface uppercase group-hover:text-primary transition-colors">
                UNMESS
              </span>
              <span className="text-[10px] text-tertiary font-mono font-semibold">
                Chaos → Clarity
              </span>
            </div>
          </button>

          {/* Quick Command Launcher Pill */}
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900/90 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs text-slate-600 dark:text-on-surface-variant transition-all border border-slate-200/80 dark:border-zinc-800"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-primary" />
              <span>Search / Action</span>
            </div>
            <span className="text-[10px] font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 font-bold">
              ⌘K
            </span>
          </button>

          {/* Efficiency Metric Pill */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-surface-container/70 border border-slate-200/80 dark:border-outline-variant/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-on-surface-variant">Cognitive Efficiency</span>
              <span className="text-[10px] text-tertiary font-mono font-bold">98.6%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-tertiary h-full rounded-full w-[98.6%] transition-all duration-700"></div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-secondary mt-2 flex justify-between font-mono">
              <span>{totalTokensSaved.toLocaleString()} tokens spared</span>
              <span className="text-tertiary flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-label font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-violet-600 text-white shadow-glow font-semibold scale-[1.02]'
                      : 'text-slate-600 dark:text-on-surface-variant hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.id === 'studio' && currentSession?.tasks?.length > 0 && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/20 dark:bg-surface-container-lowest text-white dark:text-primary font-mono font-bold">
                      {currentSession.tasks.length}
                    </span>
                  )}
                  {item.id === 'focus' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-mono font-bold">
                      Live
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Status & User Profile */}
        <div className="flex flex-col gap-3">
          {/* Active AI Cascade Status Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-container/60 border border-slate-200/80 dark:border-outline-variant/30 text-[11px] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-semibold text-slate-800 dark:text-on-surface">Cascade Active</span>
              </div>
              <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded font-bold">
                Auto Failover
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-on-surface-variant font-mono truncate">
              Groq • Gemini • GPT • OpenRouter
            </div>
          </div>

          {/* User Account / Auth Button */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-outline-variant/30 flex items-center justify-between">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 text-left group hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-800 dark:text-on-surface leading-none truncate max-w-[110px]">
                  {currentUser?.displayName || 'Hackathon Innovator'}
                </span>
                <span className="text-[10px] text-tertiary leading-none mt-1 flex items-center gap-1 font-mono font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseOnline ? 'bg-tertiary' : 'bg-primary'}`} />
                  {isFirebaseOnline ? 'Firebase Cloud' : 'Local Storage'}
                </span>
              </div>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-100 dark:hover:bg-surface-container rounded-lg transition-colors"
              title="Settings & API Keys"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white/90 dark:bg-surface/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-outline-variant/30 z-40 flex items-center justify-between px-4 sm:px-8 shadow-sm dark:shadow-none">
        {/* Left: Clean Breadcrumb & Quick Command */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-on-surface-variant font-label">
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-on-surface">{currentViewLabel}</span>
          </div>

          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-surface-container/70 hover:bg-slate-200 dark:hover:bg-surface-container-high border border-slate-200/80 dark:border-outline-variant/30 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-on-surface transition-colors shadow-sm"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Quick Command</span>
            <span className="font-mono text-[10px] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-zinc-700 font-bold ml-0.5">⌘K</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-container/70 border border-slate-200/80 dark:border-outline-variant/30 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            <span className="text-slate-500 dark:text-on-surface-variant">Active Node:</span>
            <span className="text-tertiary font-bold">
              {currentSession?.provider || 'Groq Qwen 3.8'}
            </span>
            <span className="text-slate-400 dark:text-secondary-fixed">•</span>
            <span className="text-primary font-semibold">
              {currentSession?.latencyMs ? `${currentSession.latencyMs}ms` : '18ms'}
            </span>
          </div>
        </div>

        {/* Right: Quick Controls & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick controls: Shader pause, Theme toggle, Settings */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-container/60 p-1 rounded-xl border border-slate-200/80 dark:border-outline-variant/30">
            {/* Animated shader toggle */}
            <button
              onClick={() => setIsShaderActive(!isShaderActive)}
              className={`p-1.5 rounded-lg transition-colors text-xs ${
                isShaderActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
              }`}
              title={isShaderActive ? "Pause Background Texture (Saves Battery/GPU)" : "Resume Glitch Video Texture"}
            >
              <Radio className={`w-4 h-4 ${isShaderActive ? 'animate-pulse' : ''}`} />
            </button>

            {/* Dark / Light toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-surface-container-high rounded-lg transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-500 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface hover:bg-slate-200 dark:hover:bg-surface-container-high rounded-lg transition-colors"
              title="Open Settings & API Keys"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* Auth Button */}
          <button
            onClick={onOpenAuth}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center text-white shadow-glow hover:scale-105 transition-transform"
            title="User Account & Firebase"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#09090b]/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 z-50 flex md:hidden items-center justify-between px-2 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-primary font-bold' : 'text-slate-500 dark:text-on-surface-variant'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-label">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
