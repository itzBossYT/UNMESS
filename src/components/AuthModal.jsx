import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Flame,
  Key,
  Database,
  ExternalLink,
  Check,
  Edit2,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    loginWithGoogle, 
    loginDemoGoogle,
    loginWithEmail, 
    registerWithEmail, 
    setCustomProfile,
    logout, 
    isFirebaseOnline,
    firebaseConfig,
    saveFirebaseCredentials,
    authError,
    setAuthError 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'firebase-config' | 'profile'
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customName, setCustomName] = useState(currentUser?.displayName || 'Hackathon Innovator');
  const [customEmail, setCustomEmail] = useState(currentUser?.email || 'innovator@hackathon.dev');

  // Firebase Config State (Includes databaseURL)
  const [fbApiKey, setFbApiKey] = useState(firebaseConfig?.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(firebaseConfig?.projectId || 'hackathon-339c8');
  const [fbAuthDomain, setFbAuthDomain] = useState(firebaseConfig?.authDomain || 'hackathon-339c8.firebaseapp.com');
  const [fbDatabaseURL, setFbDatabaseURL] = useState(firebaseConfig?.databaseURL || 'https://hackathon-339c8-default-rtdb.firebaseio.com');
  const [configSaved, setConfigSaved] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantGoogleDemo = () => {
    loginDemoGoogle();
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.6 }
    });
    onClose();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setCustomProfile(customName, customEmail);
    onClose();
  };

  const handleSaveFbConfig = (e) => {
    e.preventDefault();
    saveFirebaseCredentials({
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim(),
      databaseURL: fbDatabaseURL.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: `${fbProjectId.trim()}.firebasestorage.app`,
      messagingSenderId: "",
      appId: ""
    });
    setConfigSaved(true);
  };

  const consoleLink = `https://console.firebase.google.com/project/${fbProjectId || 'hackathon-339c8'}/authentication/providers`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-modal-pop">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-glow">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                Account & Firebase Cloud
              </h2>
              <span className="text-[11px] text-tertiary font-mono font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isFirebaseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                Project: {firebaseConfig?.projectId || 'hackathon-339c8'} • {isFirebaseOnline ? 'Cloud Synced' : 'Offline'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-on-surface rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-4 pt-2 gap-2 text-xs font-label">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'login'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-on-surface'
            }`}
          >
            Sign In / Profile
          </button>

          <button
            onClick={() => setActiveTab('firebase-config')}
            className={`pb-2 px-3 border-b-2 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'firebase-config'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-on-surface'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase & DatabaseURL</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {activeTab === 'login' && (
            <>
              {!currentUser?.isAnonymous ? (
                <div className="flex flex-col items-center gap-4 text-center py-2 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center text-white text-2xl font-bold shadow-glow">
                    {currentUser?.displayName?.[0]?.toUpperCase() || 'H'}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base font-headline font-bold text-slate-900 dark:text-on-surface">
                      {currentUser?.displayName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-on-surface-variant font-mono">
                      {currentUser?.email}
                    </span>
                    <span className="text-[10px] text-tertiary font-mono font-bold mt-1 bg-tertiary/10 px-2.5 py-0.5 rounded-full inline-block mx-auto border border-tertiary/20">
                      Authenticated Session Active
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-on-surface hover:text-error text-xs font-semibold transition-colors border border-slate-200 dark:border-zinc-700"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Google Sign In Button */}
                  <button
                    onClick={handleGoogle}
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-on-surface font-headline font-bold text-xs tracking-wide flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {/* Official Multicolor Google G */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{submitting ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
                  </button>

                  {/* Diagnostic Banner if Google Auth error occurs */}
                  {(errorMsg || authError) && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-2 text-xs text-amber-500 animate-fade-in">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">Firebase Authentication Notice</span>
                          <span className="text-[11px] leading-relaxed text-slate-700 dark:text-zinc-300">
                            {errorMsg || authError}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                        <a
                          href={consoleLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>Open Firebase Console</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={handleInstantGoogleDemo}
                          className="ml-auto px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-[10px] hover:bg-amber-400 transition-colors"
                        >
                          ⚡ 1-Click Instant Demo Login
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 my-1">
                    <div className="h-px bg-slate-200 dark:border-zinc-800 flex-1" />
                    <span className="text-[10px] uppercase font-mono text-slate-400">or email login</span>
                    <div className="h-px bg-slate-200 dark:border-zinc-800 flex-1" />
                  </div>

                  {/* Email & Password Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-label text-slate-600 dark:text-on-surface-variant font-medium">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@hackathon.dev"
                          required
                          className="w-full bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-on-surface pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-label text-slate-600 dark:text-on-surface-variant font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-on-surface pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 px-4 rounded-xl bg-primary text-white font-headline font-bold text-xs tracking-wide shadow-glow hover:opacity-95 transition-all mt-1 disabled:opacity-50"
                    >
                      {submitting ? 'Authenticating...' : isRegister ? 'Create Account & Sign In' : 'Sign In with Email'}
                    </button>
                  </form>

                  {/* Fast Instant Demo Login Pills */}
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">Competition Shortcuts:</span>
                    <button
                      type="button"
                      onClick={handleInstantGoogleDemo}
                      className="text-[11px] font-mono text-tertiary hover:underline font-bold flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Instant Judge / Competitor Login
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'firebase-config' && (
            <form onSubmit={handleSaveFbConfig} className="flex flex-col gap-3.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs flex flex-col gap-1">
                <span className="font-bold text-slate-900 dark:text-on-surface flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  <span>Firebase Project: {fbProjectId}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-on-surface-variant font-body">
                  Configured from your project. Realtime Database URL and Firestore enabled.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-on-surface-variant font-medium">
                  Web API Key (apiKey)
                </label>
                <input
                  type="text"
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-on-surface p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono text-slate-600 dark:text-on-surface-variant font-medium">
                  Database URL (databaseURL)
                </label>
                <input
                  type="text"
                  value={fbDatabaseURL}
                  onChange={(e) => setFbDatabaseURL(e.target.value)}
                  placeholder="https://hackathon-339c8-default-rtdb.firebaseio.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-on-surface p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono">
                  Realtime Database sync endpoint
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-on-surface-variant font-medium">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    placeholder="hackathon-339c8.firebaseapp.com"
                    className="w-full bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-on-surface p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-on-surface-variant font-medium">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    placeholder="hackathon-339c8"
                    className="w-full bg-slate-50 dark:bg-zinc-950 text-xs font-mono text-slate-900 dark:text-on-surface p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {configSaved ? (
                  <span className="text-xs text-tertiary font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Keys Saved! Reloading...
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90"
                >
                  Save & Reload Sync
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
