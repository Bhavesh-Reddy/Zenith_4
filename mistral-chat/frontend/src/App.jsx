import React, { useState, useCallback, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  }, [isMobile]);

  return (
    <div className="app-layout">
      {/* Mobile backdrop */}
      {isMobile && mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={handleBackdropClick} />
      )}

      {/* Sidebar */}
      {!isMobile && !sidebarCollapsed ? (
        <Sidebar
          onSettingsOpen={() => setShowSettings(true)}
          collapsed={false}
          onToggle={handleToggleSidebar}
        />
      ) : !isMobile && sidebarCollapsed ? (
        <Sidebar
          onSettingsOpen={() => setShowSettings(true)}
          collapsed={true}
          onToggle={handleToggleSidebar}
        />
      ) : (
        <div className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
             style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1000 }}>
          <Sidebar
            onSettingsOpen={() => { setShowSettings(true); setMobileSidebarOpen(false); }}
            collapsed={false}
            onToggle={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main area */}
      <main className="app-main">
        {/* Mobile header with hamburger */}
        {isMobile && (
          <div className="mobile-header">
            <div className="mobile-header-brand">
              <div className="mobile-header-icon">
                <Sparkles size={14} />
              </div>
              <span className="mobile-header-title">Mistral</span>
            </div>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        )}
        <ChatArea />
      </main>

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}