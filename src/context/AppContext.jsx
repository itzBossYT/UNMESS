import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { unmessEntropy } from '../services/aiRouter';
import { saveUnmessSession, fetchUserHistory } from '../services/firebase';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

const DEFAULT_CHAOS = "";

const INITIAL_SESSION = {
  cleanedProse: "",
  chaosScore: 0,
  tasks: [],
  deadlines: [],
  reminders: [],
  ideas: [],
  dailySchedule: [],
  provider: "Cascade Ready",
  tokens: 0,
  latencyMs: 0,
  timestamp: new Date().toISOString()
};

export function AppProvider({ children }) {
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'studio' | 'planner' | 'matrix' | 'insights'
  const [chaosText, setChaosText] = useState(DEFAULT_CHAOS);
  const [extractionMode, setExtractionMode] = useState('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [currentSession, setCurrentSession] = useState(() => {
    // Purge any stale legacy mock session storage from early iterations
    try {
      localStorage.removeItem('unmess_current_session');
      const saved = localStorage.getItem('unmess_session_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.tasks && Array.isArray(parsed.tasks)) {
          const hasOldMocks = parsed.tasks.some(t => 
            t.title?.includes('Q3 budget') || 
            t.title?.includes('website design') || 
            t.title?.includes('physics test') || 
            t.title?.includes('English presentation')
          );
          if (!hasOldMocks) return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_SESSION;
  });

  const [history, setHistory] = useState([]);
  const [totalTokensSaved, setTotalTokensSaved] = useState(() => {
    return Number(localStorage.getItem('unmess_tokens_saved') || '0');
  });

  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('unmess_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  const [isShaderActive, setIsShaderActive] = useState(() => {
    const saved = localStorage.getItem('unmess_shader_active');
    return saved !== null ? saved === 'true' : true;
  });

  // API Keys cascade from localStorage or .env
  const [userKeys, setUserKeys] = useState(() => {
    const saved = localStorage.getItem('unmess_api_keys');
    return saved ? JSON.parse(saved) : {
      groq: import.meta.env.VITE_GROQ_API_KEY || '',
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
      openai: import.meta.env.VITE_OPENAI_API_KEY || '',
      openrouter: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    };
  });

  // Sync dark class on document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('unmess_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('unmess_shader_active', isShaderActive.toString());
  }, [isShaderActive]);

  useEffect(() => {
    localStorage.setItem('unmess_api_keys', JSON.stringify(userKeys));
  }, [userKeys]);

  useEffect(() => {
    localStorage.setItem('unmess_session_v3', JSON.stringify(currentSession));
  }, [currentSession]);

  // Load history on mount or auth change
  useEffect(() => {
    async function loadHist() {
      const hist = await fetchUserHistory(currentUser?.uid);
      setHistory(hist || []);
    }
    loadHist();
  }, [currentUser]);

  // Main Action: UNMESS the chaos
  const runUnmess = async (rawInput, modeOverride) => {
    const mode = modeOverride || extractionMode;
    const input = rawInput !== undefined ? rawInput : chaosText;
    if (!input || !input.trim()) return;

    setIsProcessing(true);
    try {
      const data = await unmessEntropy(input, userKeys, mode);
      
      const newSession = {
        ...data.result,
        provider: data.provider,
        tokens: data.tokens,
        latencyMs: data.latencyMs,
        notice: data.notice,
        timestamp: new Date().toISOString()
      };

      setCurrentSession(newSession);

      // Increment token tracking
      const newTokens = totalTokensSaved + (data.tokens || 180);
      setTotalTokensSaved(newTokens);
      localStorage.setItem('unmess_tokens_saved', newTokens.toString());

      // Save to Firebase / LocalStorage
      await saveUnmessSession(currentUser?.uid, {
        rawInput: input,
        session: newSession,
        createdAt: new Date().toISOString()
      });

      // Refresh history list
      const updatedHist = await fetchUserHistory(currentUser?.uid);
      setHistory(updatedHist || []);

      // Celebration burst for clarity
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#a78bfa', '#34d399', '#ffffff']
      });

    } catch (err) {
      console.error('UNMESS Processing Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSession = () => {
    setCurrentSession(INITIAL_SESSION);
    setChaosText("");
    localStorage.removeItem('unmess_session_v3');
  };

  const loadDemoSession = () => {
    const demo = {
      cleanedProse: "Finalize the production presentation deck and backend deployment before 3:00 PM sync. Ensure the multi-model AI failover cascade and API latency thresholds are verified in staging.",
      chaosScore: 8.4,
      tasks: [
        { id: 'd-1', title: 'Finalize Hackathon presentation deck slides', priority: 'P1', estimatedTime: '45m', completed: false, category: 'Competition' },
        { id: 'd-2', title: 'Verify Firebase Cloud Firestore sync and auth domain', priority: 'P1', estimatedTime: '30m', completed: false, category: 'Engineering' },
        { id: 'd-3', title: 'Benchmark AI cascade failover response latency under 250ms', priority: 'P2', estimatedTime: '20m', completed: true, category: 'Performance' },
        { id: 'd-4', title: 'Record 2-minute demo video walkthrough', priority: 'P2', estimatedTime: '1h', completed: false, category: 'Submission' }
      ],
      deadlines: [
        { id: 'dl-1', title: 'Final Presentation Sync with Judges', deadlineText: 'Today at 3:00 PM', urgencyScore: 9.8 },
        { id: 'dl-2', title: 'Devpost Project Submission Portal Closes', deadlineText: 'Tonight at 11:59 PM', urgencyScore: 9.5 }
      ],
      reminders: [
        { id: 'rm-1', text: 'Keep television glitch texture on for retro-cyber aesthetic during demo' },
        { id: 'rm-2', text: 'Highlight zero data retention privacy policy during presentation' }
      ],
      ideas: [
        { id: 'id-1', text: 'Add voice wave animated synthesizer for live spoken brain dumps' }
      ],
      dailySchedule: [
        { time: '09:00 AM - 10:30 AM', title: 'Deep Work: Finalize Presentation Deck', type: 'Focus Block' },
        { time: '10:30 AM - 10:45 AM', title: 'Cognitive Reset & Hydration', type: 'Buffer' },
        { time: '10:45 AM - 12:00 PM', title: 'Firebase Cloud Firestore Sync Validation', type: 'High Priority' },
        { time: '02:30 PM - 03:00 PM', title: 'Judge Presentation Pitch Prep', type: 'Review' }
      ],
      provider: 'Groq (Qwen 3.8)',
      tokens: 384,
      latencyMs: 142,
      timestamp: new Date().toISOString()
    };
    setCurrentSession(demo);
    setChaosText("Need to finalize the presentation deck before 3pm sync with judges, deploy Firebase sync to cloud, test the AI failover cascade latency, and record the 2min demo video before portal closes tonight!");
  };

  const toggleTaskComplete = (taskId) => {
    setCurrentSession((prev) => {
      const updatedTasks = (prev.tasks || []).map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            confetti({
              particleCount: 25,
              spread: 45,
              origin: { y: 0.7 },
              colors: ['#34d399', '#a78bfa']
            });
          }
          return { ...t, completed: nextState };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const updateTask = (taskId, fields) => {
    setCurrentSession((prev) => {
      const updated = (prev.tasks || []).map((t) => (t.id === taskId ? { ...t, ...fields } : t));
      return { ...prev, tasks: updated };
    });
  };

  const deleteTask = (taskId) => {
    setCurrentSession((prev) => {
      const updated = (prev.tasks || []).filter((t) => t.id !== taskId);
      return { ...prev, tasks: updated };
    });
  };

  const addTask = (taskObj) => {
    setCurrentSession((prev) => {
      const newTask = {
        id: `custom-${Date.now()}`,
        completed: false,
        priority: 'P2',
        estimatedTime: '30m',
        category: 'General',
        ...taskObj
      };
      return { ...prev, tasks: [newTask, ...(prev.tasks || [])] };
    });
  };

  const updateCleanedProse = (newProse) => {
    setCurrentSession((prev) => ({ ...prev, cleanedProse: newProse }));
  };

  const reorderSchedule = (fromIndex, toIndex) => {
    setCurrentSession((prev) => {
      const schedule = [...(prev.dailySchedule || [])];
      const [moved] = schedule.splice(fromIndex, 1);
      schedule.splice(toIndex, 0, moved);
      return { ...prev, dailySchedule: schedule };
    });
  };

  const saveKeys = (newKeys) => {
    setUserKeys(newKeys);
    localStorage.setItem('unmess_api_keys', JSON.stringify(newKeys));
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        chaosText,
        setChaosText,
        extractionMode,
        setExtractionMode,
        isProcessing,
        currentSession,
        setCurrentSession,
        history,
        totalTokensSaved,
        isDarkMode,
        setIsDarkMode,
        isShaderActive,
        setIsShaderActive,
        userKeys,
        saveKeys,
        runUnmess,
        clearSession,
        loadDemoSession,
        toggleTaskComplete,
        updateTask,
        deleteTask,
        addTask,
        updateCleanedProse,
        reorderSchedule
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
