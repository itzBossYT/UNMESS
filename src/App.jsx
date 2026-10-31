import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Studio from './components/Studio';
import FocusMode from './components/FocusMode';
import MindMapView from './components/MindMapView';
import SmartPlanner from './components/SmartPlanner';
import TaskMatrix from './components/TaskMatrix';
import InsightsView from './components/InsightsView';
import TelevisionGlitchBackground from './components/TelevisionGlitchBackground';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import ExportModal from './components/ExportModal';
import CommandPalette from './components/CommandPalette';

function AppContent() {
  const { activeView, setActiveView, isShaderActive, isDarkMode } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Listen to custom window event for Command Palette
  useEffect(() => {
    const handleToggleCmd = () => {
      setIsCommandOpen((prev) => !prev);
    };
    window.addEventListener('toggle-command-palette', handleToggleCmd);
    return () => window.removeEventListener('toggle-command-palette', handleToggleCmd);
  }, []);

  return (
    <div className="min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container relative">
      {/* Background: Television Glitch Texture & CRT Scanlines */}
      <TelevisionGlitchBackground active={isShaderActive} isDark={isDarkMode} />

      {/* When on Landing Page, render the full-bleed Homepage */}
      {activeView === 'landing' ? (
        <LandingPage 
          onLaunchStudio={() => setActiveView('studio')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <>
          {/* Workspace Navigation (Sidebar + Header) */}
          <Navigation 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            onOpenAuth={() => setIsAuthOpen(true)} 
            onOpenCommandPalette={() => setIsCommandOpen(true)}
          />

          {/* Main Workspace Content Area */}
          <main className="relative z-10 md:pl-64 pt-20 px-4 sm:px-8 pb-12 transition-all">
            {activeView === 'studio' && (
              <Studio onOpenExport={() => setIsExportOpen(true)} />
            )}

            {activeView === 'focus' && (
              <FocusMode />
            )}

            {activeView === 'mindmap' && (
              <MindMapView />
            )}

            {activeView === 'planner' && (
              <SmartPlanner />
            )}

            {activeView === 'matrix' && (
              <TaskMatrix />
            )}

            {activeView === 'insights' && (
              <InsightsView />
            )}
          </main>
        </>
      )}

      {/* Global Modals & Command Hub */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
