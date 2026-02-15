import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import ProjectPlanner from './components/ProjectPlanner';
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Tasks from './components/Tasks';
import Team from './components/Team';
import { pagesAPI } from './services/api';
import './App.css';

function App() {
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'comment', message: 'New comment on "Project Plan"', time: '5 min ago', read: false },
    { id: 2, type: 'mention', message: 'You were mentioned in "Meeting Notes"', time: '1 hour ago', read: false },
    { id: 3, type: 'update', message: 'Page "Dashboard" was updated', time: '2 hours ago', read: true },
  ]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('forge-dark-mode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('forge-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pagesAPI.getAll();
      setPages(data);
      if (data.length === 0) {
        await createWelcomePage();
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, []);

  const createWelcomePage = async () => {
    try {
      const welcomePage = {
        title: 'Getting Started with Forge',
        icon: '📘',
        content: '<h1>Welcome to Forge</h1><p>Your professional workspace for productivity and collaboration.</p><h2>Quick Start Guide:</h2><ul><li><p><strong>Create Pages:</strong> Click the + button in the sidebar</p></li><li><p><strong>Organize:</strong> Use favorites and folders</p></li><li><p><strong>Collaborate:</strong> Share pages with your team</p></li><li><p><strong>Plan Projects:</strong> Use the Project Planner</p></li><li><p><strong>Schedule:</strong> Manage events in Calendar</p></li></ul>',
        favorite: true,
      };
      const newPage = await pagesAPI.create(welcomePage);
      setPages([newPage]);
      setCurrentPageId(newPage._id);
    } catch (err) {
      console.error('Failed to create welcome page');
    }
  };

  const createNewPage = async () => {
    try {
      const newPage = await pagesAPI.create({
        title: 'Untitled',
        icon: '📄',
        content: '',
        favorite: false,
      });
      setPages([newPage, ...pages]);
      setCurrentPageId(newPage._id);
      setCurrentView('editor');
    } catch (err) {
      alert('Failed to create page');
    }
  };

  const duplicatePage = async (pageId) => {
    try {
      const duplicated = await pagesAPI.duplicate(pageId);
      setPages([duplicated, ...pages]);
      setCurrentPageId(duplicated._id);
      setCurrentView('editor');
    } catch (err) {
      console.error('Failed to duplicate page');
    }
  };

  const deletePage = async (pageId) => {
    try {
      await pagesAPI.delete(pageId);
      const updatedPages = pages.filter(p => p._id !== pageId);
      setPages(updatedPages);
      if (currentPageId === pageId) {
        if (updatedPages.length > 0) {
          setCurrentPageId(updatedPages[0]._id);
        } else {
          setCurrentPageId(null);
          setCurrentView('dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to delete page');
    }
  };

  const updatePage = async (pageId, updates) => {
    try {
      setPages(pages.map(p => p._id === pageId ? { ...p, ...updates } : p));
      await pagesAPI.update(pageId, updates);
    } catch (err) {
      loadPages();
    }
  };

  const toggleFavorite = async (pageId) => {
    try {
      const updated = await pagesAPI.toggleFavorite(pageId);
      setPages(pages.map(p => p._id === pageId ? updated : p));
    } catch (err) {
      console.error('Failed to toggle favorite');
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const currentPage = pages.find(p => p._id === currentPageId);
  const favoritePages = pages.filter(p => p.favorite);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return { icon: '🏠', title: 'Home' };
      case 'planner': return { icon: '📊', title: 'Projects' };
      case 'calendar': return { icon: '📅', title: 'Calendar' };
      case 'tasks': return { icon: '✅', title: 'Tasks' };
      case 'team': return { icon: '👥', title: 'Team' };
      case 'settings': return { icon: '⚙️', title: 'Settings' };
      case 'editor': 
        return currentPage 
          ? { icon: currentPage.icon, title: currentPage.title || 'Untitled' }
          : { icon: '📄', title: 'Editor' };
      default: return { icon: '🏠', title: 'Home' };
    }
  };

  const viewInfo = getViewTitle();

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Forge...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Connection Failed</div>
          <div className="error-message">{error}</div>
          <div className="error-hint">
            Make sure MongoDB and the backend server are running.
            <br /><code>npm run dev</code>
          </div>
          <button onClick={loadPages} className="retry-btn">Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {sidebarOpen && (
        <Sidebar
          pages={pages}
          favoritePages={favoritePages}
          currentPageId={currentPageId}
          currentView={currentView}
          darkMode={darkMode}
          onSelectPage={(pageId) => {
            setCurrentPageId(pageId);
            setCurrentView('editor');
          }}
          onSelectView={setCurrentView}
          onCreatePage={createNewPage}
          onDuplicatePage={duplicatePage}
          onDeletePage={deletePage}
          onToggleFavorite={toggleFavorite}
          onToggleSidebar={() => setSidebarOpen(false)}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      )}
      
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-left">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="sidebar-toggle">
                ☰
              </button>
            )}
            <div className="logo">
              <div className="logo-icon">F</div>
              FORGE
            </div>
            <div className="breadcrumb">
              <span className="breadcrumb-icon">{viewInfo.icon}</span>
              <span className="breadcrumb-title">{viewInfo.title}</span>
            </div>
          </div>
          
          <div className="top-bar-actions">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="top-bar-btn theme-toggle"
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            <button 
              onClick={() => setShowNotifications(true)} 
              className="top-bar-btn"
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            
            <button 
              onClick={() => setShowComments(true)} 
              className="top-bar-btn"
            >
              💬 Comments
            </button>
            
            <button 
              onClick={() => setShowShare(true)} 
              className="top-bar-btn share-btn"
            >
              ↗ Share
            </button>
          </div>
        </div>
        
        <div className="editor-area">
          {currentView === 'dashboard' && (
            <Dashboard 
              onSelectView={setCurrentView}
              onCreatePage={createNewPage}
              pages={pages}
              darkMode={darkMode}
            />
          )}
          {currentView === 'editor' && currentPage && (
            <Editor
              key={currentPage._id}
              page={currentPage}
              onUpdate={(updates) => updatePage(currentPage._id, updates)}
            />
          )}
          {currentView === 'planner' && <ProjectPlanner />}
          {currentView === 'calendar' && <Calendar />}
          {currentView === 'tasks' && <Tasks />}
          {currentView === 'team' && <Team />}
          {currentView === 'settings' && <Settings darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />}
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid var(--border-color)',
                    background: notif.read ? 'transparent' : 'var(--indigo-50)',
                    cursor: 'pointer'
                  }}
                  onClick={() => markNotificationRead(notif.id)}
                >
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {notif.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Comments</h3>
              <button onClick={() => setShowComments(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '40px 20px' }}>
                No comments yet. Start a conversation!
              </p>
            </div>
            <div className="modal-footer">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)'
                }}
              />
              <button className="btn-primary">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Share</h3>
              <button onClick={() => setShowShare(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Share Link
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value="https://forge.app/shared/abc123" 
                    readOnly
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button className="btn-secondary" onClick={() => alert('Link copied!')}>
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Invite by Email
                </label>
                <input 
                  type="email" 
                  placeholder="colleague@company.com"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowShare(false)}>Cancel</button>
              <button className="btn-primary">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;