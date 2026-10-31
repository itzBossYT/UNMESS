import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  isFirebaseConfigured,
  firebaseConfig,
  saveFirebaseCredentials
} from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('unmess_user');
    return saved ? JSON.parse(saved) : { 
      uid: 'guest-1', 
      displayName: 'Hackathon Innovator', 
      email: 'innovator@hackathon.dev', 
      isAnonymous: true 
    };
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const u = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Hackathon Innovator',
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: false,
        };
        setCurrentUser(u);
        localStorage.setItem('unmess_user', JSON.stringify(u));
      } else {
        const guest = { 
          uid: 'guest-1', 
          displayName: 'Hackathon Innovator', 
          email: 'innovator@hackathon.dev', 
          isAnonymous: true 
        };
        setCurrentUser(guest);
        localStorage.setItem('unmess_user', JSON.stringify(guest));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);

    // If Firebase isn't configured, use competition demo session
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      const demoUser = {
        uid: 'google-demo-user',
        displayName: 'Google Verified Mind',
        email: 'user@gmail.com',
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
        isAnonymous: false
      };
      setCurrentUser(demoUser);
      localStorage.setItem('unmess_user', JSON.stringify(demoUser));
      return demoUser;
    }

    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } catch (err) {
      console.warn('[Firebase Auth Google Notice]:', err.code, err.message);

      let friendlyMessage = err.message;
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
        friendlyMessage = `Google Sign-In is not enabled yet in Firebase Console. Go to: Firebase Console (hackathon-339c8) > Authentication > Sign-in method > Google > Enable.`;
      } else if (err.code === 'auth/popup-blocked') {
        friendlyMessage = 'Popup was blocked by your browser. Please allow popups for localhost:3000 or use 1-Click Instant Login.';
      } else if (err.code === 'auth/unauthorized-domain') {
        friendlyMessage = `Domain "localhost" is not authorized in Firebase Console > Authentication > Settings > Authorized domains.`;
      }

      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const loginDemoGoogle = () => {
    setAuthError(null);
    const demoUser = {
      uid: `google-${Date.now()}`,
      displayName: 'Google Verified Mind',
      email: 'innovator@gmail.com',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user',
      isAnonymous: false
    };
    setCurrentUser(demoUser);
    localStorage.setItem('unmess_user', JSON.stringify(demoUser));
    return demoUser;
  };

  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      const u = { uid: `user-${Date.now()}`, displayName: email.split('@')[0], email, isAnonymous: false };
      setCurrentUser(u);
      localStorage.setItem('unmess_user', JSON.stringify(u));
      return u;
    }

    try {
      // First attempt sign-in
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      // If user doesn't exist, automatically create the account!
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
        try {
          const newRes = await createUserWithEmailAndPassword(auth, email, password);
          return newRes.user;
        } catch (regErr) {
          setAuthError(regErr.message);
          throw regErr;
        }
      }
      setAuthError(err.message);
      throw err;
    }
  };

  const registerWithEmail = async (email, password) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      const u = { uid: `user-${Date.now()}`, displayName: email.split('@')[0], email, isAnonymous: false };
      setCurrentUser(u);
      localStorage.setItem('unmess_user', JSON.stringify(u));
      return u;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const setCustomProfile = (name, email) => {
    const u = {
      uid: `profile-${Date.now()}`,
      displayName: name || 'Hackathon Innovator',
      email: email || 'innovator@hackathon.firebase',
      isAnonymous: false,
    };
    setCurrentUser(u);
    localStorage.setItem('unmess_user', JSON.stringify(u));
  };

  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      try { await fbSignOut(auth); } catch (e) {}
    }
    const guest = { 
      uid: 'guest-1', 
      displayName: 'Hackathon Innovator', 
      email: 'innovator@hackathon.dev', 
      isAnonymous: true 
    };
    setCurrentUser(guest);
    localStorage.setItem('unmess_user', JSON.stringify(guest));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        setAuthError,
        isFirebaseOnline: isFirebaseConfigured,
        firebaseConfig,
        saveFirebaseCredentials,
        loginWithGoogle,
        loginDemoGoogle,
        loginWithEmail,
        registerWithEmail,
        setCustomProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
