import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UnmessLogo from './UnmessLogo';
import { 
  Search, 
  Terminal, 
  Calendar, 
  Grid, 
  Activity, 
  Headphones, 
  Network, 
  Download, 
  Trash2, 
  Zap, 
  Sun, 
  Moon, 
  Radio, 
  Copy, 
  Check, 
  Flame, 
  ExternalLink,
  X,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CommandPalette({ isOpen, onClose }) {
  const { 
    activeView, 
    setActiveView, 
    currentSession, 
    clearSession, 
    loadDemoSession, 
    isDarkMode, 
    setIsDarkMode, 
    isShaderActive, 
    setIsShaderActive 
  } = useApp();

  const [query, setQuery] = useState('');
  const [copiedSlack, setCopiedSlack] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or window event
          window.dispatchEvent(new CustomEvent('toggle-command-palette'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySlackUpdate = () => {
    const { tasks = [], deadlines = [] } = currentSession || {};
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);

    let text = `*Daily Standup Update (via UNMESS Clarity)*\n\n`;
    if (completed.length > 0) {
      text += `*Completed Today:*\n` + completed.map(t => `• ✅ ${t.title}`).join('\n') + `\n\n`;
    }
    text += `*In Progress / Next Up:*\n` + pending.map(t => `• ⏳ [${t.priority || 'P2'}] ${t.title} (${t.estimatedTime || '30m'})`).join('\n') + `\n\n`;
    if (deadlines.length > 0) {
      text += `*Hard Deadlines:*\n` + deadlines.map(d => `• ⏰ ${d.title} - ${d.deadlineText}`).join('\n');
    }

    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => {
      setCopiedSlack(false);
      onClose();
    }, 1500);
  };

  const commands = [
    {
      id: 'view-studio',
      label: 'Open De-Mess Studio',
      category: 'Navigation',
      icon: Terminal,
      action: () => { setActiveView('studio'); onClose(); }
    },
    {
      id: 'view-focus',
      label: 'Launch Deep Work Focus Mode (Pomodoro & Ambient Audio)',
      category: 'Execution',
      icon: Headphones,
      action: () => { setActiveView('focus'); onClose(); }
    },
    {
      id: 'view-mindmap',
      label: 'Open Cognitive Topology (Visual Mind Map)',
      category: 'Visualization',
      icon: Network,
      action: () => { setActiveView('mindmap'); onClose(); }
    },
    {
      id: 'view-planner',
      label: 'Open Smart Daily Planner',
      category: 'Navigation',
      icon: Calendar,
      action: () => { setActiveView('planner'); onClose(); }
    },
    {
      id: 'view-matrix',
      label: 'Open Task Urgency-Impact Matrix (Eisenhower)',
      category: 'Navigation',
      icon: Grid,
      action: () => { setActiveView('matrix'); onClose(); }
    },
    {
      id: 'view-insights',
      label: 'Open Cognitive Insights & Telemetry',
      category: 'Navigation',
      icon: Activity,
      action: () => { setActiveView('insights'); onClose(); }
    },
    {
      id: 'act-demo',
      label: 'Load Hackathon Demo Dataset',
      category: 'Actions',
      icon: Zap,
      action: () => { loadDemoSession(); onClose(); }
    },
    {
      id: 'act-slack',
      label: copiedSlack ? 'Copied to Clipboard!' : 'Format & Copy Slack / Discord Daily Standup',
      category: 'Productivity',
      icon: MessageSquare,
      action: handleCopySlackUpdate
    },
    {
      id: 'act-theme',
      label: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
      category: 'Settings',
      icon: isDarkMode ? Sun : Moon,
      action: () => { setIsDarkMode(!isDarkMode); onClose(); }
    },
    {
      id: 'act-glitch',
      label: `${isShaderActive ? 'Pause' : 'Resume'} Television Glitch Video`,
      category: 'Performance',
      icon: Radio,
      action: () => { setIsShaderActive(!isShaderActive); onClose(); }
    },
    {
      id: 'act-reset',
      label: 'Clear Workspace & Reset Canvas',
      category: 'Danger',
      icon: Trash2,
      action: () => { clearSession(); onClose(); }
    }
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl rounded-2xl glass-panel shadow-2xl border border-slate-200/90 dark:border-zinc-700/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/80">
          <Search className="w-5 h-5 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search workspace..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-on-surface outline-none placeholder:text-slate-400 font-body"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-500 font-bold">
            ESC
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-[340px] overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 dark:hover:bg-zinc-800/80 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 dark:text-on-surface">
                      {cmd.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {cmd.category}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter ↵
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <UnmessLogo className="w-3.5 h-3.5 text-primary" />
            <span>UNMESS Quick Command Hub</span>
          </div>
          <span>Shortcut: ⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}

