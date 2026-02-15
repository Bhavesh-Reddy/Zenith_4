import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  pages,
  favoritePages,
  currentPageId, 
  currentView,
  onSelectPage, 
  onSelectView,
  onCreatePage, 
  onDuplicatePage,
  onDeletePage,
  onToggleFavorite,
  onToggleSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    favs: false,
    private: false
  });

  const toggleSection = (sec) => {
    setSectionsCollapsed(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const filteredPages = pages.filter(page => 
    (page.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const PageRow = ({ page, isFavoriteSection = false }) => (
    <div 
      className={`page-row ${currentPageId === page._id && currentView === 'editor' ? 'active' : ''}`}
      onClick={() => { onSelectPage(page._id); onSelectView('editor'); }}
    >
      <span className="page-icon">{page.icon || '📄'}</span>
      <span className="page-title">{page.title || 'Untitled'}</span>
      
      <div className="row-actions">
        {!isFavoriteSection && (
          <button 
            className={`action-icon star ${page.favorite ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(page._id); }}
          >
            ★
          </button>
        )}
        <button 
          className="action-icon"
          onClick={(e) => { e.stopPropagation(); onDuplicatePage(page._id); }}
        >
          ⎘
        </button>
        <button 
          className="action-icon delete"
          onClick={(e) => { e.stopPropagation(); onDeletePage(page._id); }}
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="sidebar">
      {/* 1. Header & Search */}
      <div className="sidebar-top">
        <div className="workspace-header">
          <div className="workspace-logo">F</div>
          <div className="workspace-info">
            <span className="workspace-name">Forge Workspace</span>
            <span className="workspace-plan">Pro Plan</span>
          </div>
          <button className="collapse-btn" onClick={onToggleSidebar}>«</button>
        </div>

        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="nav-menu">
          <div className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectView('dashboard')}>
            <span className="nav-icon">🏠</span> Home
          </div>
          <div className={`nav-item ${currentView === 'planner' ? 'active' : ''}`} onClick={() => onSelectView('planner')}>
            <span className="nav-icon">📊</span> Project Planner
          </div>
          <div className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => onSelectView('calendar')}>
            <span className="nav-icon">📅</span> Calendar
          </div>
          <div className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`} onClick={() => onSelectView('tasks')}>
            <span className="nav-icon">✅</span> Tasks
          </div>
          <div className={`nav-item ${currentView === 'team' ? 'active' : ''}`} onClick={() => onSelectView('team')}>
            <span className="nav-icon">👥</span> Team
          </div>
        </div>
      </div>

      {/* 2. Scrollable Pages Area */}
      <div className="sidebar-scroll">
        {/* Favorites Section */}
        {favoritePages.length > 0 && !searchQuery && (
          <div className="sidebar-section">
            <div className="section-header" onClick={() => toggleSection('favs')}>
              <span>FAVORITES</span>
            </div>
            {!sectionsCollapsed.favs && (
              <div className="section-content">
                {favoritePages.map(page => (
                  <PageRow key={`fav-${page._id}`} page={page} isFavoriteSection={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Private Pages Section */}
        <div className="sidebar-section">
          <div className="section-header">
            <span>PRIVATE</span>
            <button className="add-btn" onClick={onCreatePage}>+</button>
          </div>
          <div className="section-content">
            {searchQuery ? (
              filteredPages.map(page => <PageRow key={page._id} page={page} />)
            ) : (
              pages.map(page => <PageRow key={page._id} page={page} />)
            )}
            {pages.length === 0 && !searchQuery && (
              <div className="empty-state">No pages yet</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Actions */}
      <div className="sidebar-footer">
        <div className="footer-item">
          <span className="footer-icon">⚡</span> Templates
        </div>
        <div className="footer-item">
          <span className="footer-icon">🗑️</span> Trash
        </div>
        <div className="footer-item invite">
          <span className="footer-icon">👋</span> Invite Team
        </div>
      </div>
    </div>
  );
};

export default Sidebar;