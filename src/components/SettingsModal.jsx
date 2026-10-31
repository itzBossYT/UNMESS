import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Sliders, 
  Moon, 
  Sun, 
  Radio, 
  Key, 
  ExternalLink, 
  Check, 
  Cpu, 
  ShieldCheck,
  FileCode,
  Sparkles
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    isDarkMode, 
    setIsDarkMode, 
    isShaderActive, 
    setIsShaderActive, 
    userKeys, 
    saveKeys 
  } = useApp();

  const [keysState, setKeysState] = useState({ ...userKeys });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveKeys = (e) => {
    e.preventDefault();
    saveKeys(keysState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl border border-outline-variant/40 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-headline font-bold text-on-surface uppercase tracking-wide">
                Settings & AI Model Cascade
              </h2>
              <span className="text-[11px] text-on-surface-variant">
                Configure appearance, hardware performance, and API keys
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Section 1: Appearance & Performance */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant">
              Visual & Performance Optimization
            </span>

            {/* Dark / Light Mode Toggle */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                  {isDarkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-on-surface">Interface Theme</span>
                  <span className="text-[11px] text-on-surface-variant">
                    {isDarkMode ? 'Obsidian developer dark theme' : 'High-contrast clean light theme'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-on-surface border border-outline-variant/30 transition-colors"
              >
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>

            {/* Animated WebGL Background Toggle */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-on-surface">Animated Fluid Shader</span>
                    {isShaderActive ? (
                      <span className="text-[10px] font-mono text-tertiary font-bold bg-tertiary/10 px-1.5 rounded">60 FPS</span>
                    ) : (
                      <span className="text-[10px] font-mono text-secondary-fixed bg-surface-container-highest px-1.5 rounded">Paused</span>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Turn off to save GPU/battery on low-end laptops & PCs
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsShaderActive(!isShaderActive)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isShaderActive
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:text-on-surface'
                }`}
              >
                {isShaderActive ? 'Enabled' : 'Paused'}
              </button>
            </div>
          </div>

          {/* Section 2: AI Multi-Model Cascade */}
          <form onSubmit={handleSaveKeys} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-primary" />
                Multi-Model API Cascade
              </span>
              <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
                Fallback: 1 → 2 → 3 → 4
              </span>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Provide any keys you have. UNMESS will try the fastest model first and automatically cascade if quota exhausts or rate limits trigger! 
              You can also edit <code className="text-primary bg-surface-container-highest px-1 rounded">API_KEYS.txt</code> directly.
            </p>

            {/* Groq Key */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  Groq API Key (Fastest Tier)
                </label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={keysState.groq || ''}
                onChange={(e) => setKeysState({ ...keysState, groq: e.target.value })}
                placeholder="gsk_..."
                className="w-full bg-surface-container-lowest text-xs text-on-surface font-mono p-2.5 rounded-xl border border-outline-variant/40 outline-none focus:border-primary"
              />
            </div>

            {/* Gemini Key */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={keysState.gemini || ''}
                onChange={(e) => setKeysState({ ...keysState, gemini: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full bg-surface-container-lowest text-xs text-on-surface font-mono p-2.5 rounded-xl border border-outline-variant/40 outline-none focus:border-primary"
              />
            </div>

            {/* OpenAI Key */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  OpenAI / ChatGPT Key
                </label>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
                >
                  OpenAI Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={keysState.openai || ''}
                onChange={(e) => setKeysState({ ...keysState, openai: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-surface-container-lowest text-xs text-on-surface font-mono p-2.5 rounded-xl border border-outline-variant/40 outline-none focus:border-primary"
              />
            </div>

            {/* OpenRouter Key */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  OpenRouter API Key
                </label>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-mono"
                >
                  OpenRouter Keys <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={keysState.openrouter || ''}
                onChange={(e) => setKeysState({ ...keysState, openrouter: e.target.value })}
                placeholder="sk-or-v1-..."
                className="w-full bg-surface-container-lowest text-xs text-on-surface font-mono p-2.5 rounded-xl border border-outline-variant/40 outline-none focus:border-primary"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-mono text-tertiary flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> API Cascade Saved Securely!
                </span>
              ) : (
                <span className="text-[11px] font-mono text-secondary-fixed">
                  Saved only in your browser storage
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-glow hover:bg-primary-container transition-all"
              >
                Save AI Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

