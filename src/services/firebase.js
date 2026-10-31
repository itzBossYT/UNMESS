import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  push, 
  set 
} from 'firebase/database';

// Resolve configuration: Prioritize fresh .env values, then localStorage
function getInitialFirebaseConfig() {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  // If valid credentials exist in .env, prioritize them
  if (envApiKey && envApiKey.length > 10 && envApiKey !== "your_api_key_here") {
    const config = {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${envProjectId}-default-rtdb.firebaseio.com`,
      projectId: envProjectId || "hackathon-339c8",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
    };
    // Sync to localStorage
    try {
      localStorage.setItem('unmess_firebase_config', JSON.stringify(config));
    } catch (e) {}
    return config;
  }

  // Fallback to localStorage if custom entered
  const localSaved = localStorage.getItem('unmess_firebase_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.apiKey && parsed.apiKey.length > 10) return parsed;
    } catch (e) {}
  }

  return {
    apiKey: "",
    authDomain: "hackathon-339c8.firebaseapp.com",
    databaseURL: "https://hackathon-339c8-default-rtdb.firebaseio.com",
    projectId: "hackathon-339c8",
    storageBucket: "hackathon-339c8.firebasestorage.app",
    messagingSenderId: "",
    appId: ""
  };
}

const firebaseConfig = getInitialFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.apiKey.length > 10
);

let app = null;
let auth = null;
let db = null;
let rtdb = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Realtime Database if databaseURL configured
    if (firebaseConfig.databaseURL) {
      try {
        rtdb = getDatabase(app, firebaseConfig.databaseURL);
      } catch (rtdbErr) {
        console.warn('[UNMESS] Realtime Database init notice:', rtdbErr.message);
      }
    }

    // Configure Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    console.log('[UNMESS] Firebase initialized successfully for project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[UNMESS] Firebase init notice:', err.message);
  }
} else {
  console.log('[UNMESS] Running in local guest/offline mode.');
}

export { app, auth, db, rtdb, googleProvider, firebaseConfig };

export function saveFirebaseCredentials(config) {
  localStorage.setItem('unmess_firebase_config', JSON.stringify(config));
  window.location.reload();
}

/**
 * Unified Multi-Store Sync: Firestore + Realtime Database + LocalStorage
 */
export async function saveUnmessSession(userId, sessionData) {
  // 1. Instant LocalStorage Cache
  try {
    const existing = JSON.parse(localStorage.getItem('unmess_history') || '[]');
    const newEntry = {
      id: `session-${Date.now()}`,
      userId: userId || 'guest',
      createdAt: new Date().toISOString(),
      ...sessionData
    };
    existing.unshift(newEntry);
    localStorage.setItem('unmess_history', JSON.stringify(existing.slice(0, 50)));
  } catch (e) {
    console.error('Failed saving to localStorage', e);
  }

  // 2. Cloud Firestore Sync
  if (db && userId && userId !== 'guest') {
    try {
      await addDoc(collection(db, 'unmess_sessions'), {
        userId,
        createdAt: new Date().toISOString(),
        ...sessionData
      });
    } catch (err) {
      console.warn('Firestore write notice:', err.message);
    }
  }

  // 3. Realtime Database Sync (if databaseURL configured)
  if (rtdb && userId && userId !== 'guest') {
    try {
      const userSessionsRef = ref(rtdb, `users/${userId}/sessions`);
      const newSessionRef = push(userSessionsRef);
      await set(newSessionRef, {
        createdAt: new Date().toISOString(),
        ...sessionData
      });
    } catch (rtdbErr) {
      console.warn('Realtime Database write notice:', rtdbErr.message);
    }
  }

  return true;
}

export async function fetchUserHistory(userId) {
  // Query Cloud Firestore
  if (db && userId && userId !== 'guest') {
    try {
      const q = query(
        collection(db, 'unmess_sessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const list = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) return list;
    } catch (err) {
      console.warn('Firestore fetch notice:', err.message);
    }
  }

  return JSON.parse(localStorage.getItem('unmess_history') || '[]');
}
