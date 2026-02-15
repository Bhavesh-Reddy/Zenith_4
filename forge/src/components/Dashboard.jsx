import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ onSelectView, onCreatePage, pages = [] }) => {
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Get the 3 most recent pages (mock logic)
  const recentPages = pages.slice(0, 3);

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <h1 className="hero-title">
          {greeting}, <span className="text-gradient">User</span>
        </h1>
        <p className="hero-subtitle">You have 12 tasks pending and 2 events today.</p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => onSelectView('tasks')}>
          <div className="stat-icon indigo">✅</div>
          <div className="stat-content">
            <div className="stat-value">12</div>
            <div className="stat-label">My Tasks</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => onSelectView('planner')}>
          <div className="stat-icon cyan">📊</div>
          <div className="stat-content">
            <div className="stat-value">4</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>
        <div className="stat-card" onClick={() => onSelectView('team')}>
          <div className="stat-icon purple">👥</div>
          <div className="stat-content">
            <div className="stat-value">8</div>
            <div className="stat-label">Team Members</div>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Left Column: Recent Activity */}
        <div className="main-left">
          <div className="section-header">
            <h2>Jump Back In</h2>
          </div>
          <div className="recent-list">
            {recentPages.length > 0 ? (
              recentPages.map(page => (
                <div key={page._id} className="recent-item" onClick={() => onSelectView('editor')}>
                  <div className="recent-icon-wrapper">{page.icon || '📄'}</div>
                  <div className="recent-info">
                    <div className="recent-title">{page.title || 'Untitled'}</div>
                    <div className="recent-meta">Edited recently</div>
                  </div>
                  <div className="recent-arrow">→</div>
                </div>
              ))
            ) : (
              <div className="empty-dash">No pages created yet.</div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="main-right">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="actions-list">
            <button className="action-card primary" onClick={onCreatePage}>
              <span className="ac-icon">+</span>
              Create New Page
            </button>
            <button className="action-card" onClick={() => onSelectView('calendar')}>
              <span className="ac-icon">📅</span>
              Schedule Event
            </button>
            <button className="action-card" onClick={() => onSelectView('team')}>
              <span className="ac-icon">✉️</span>
              Invite Team
            </button>
          </div>

          <div className="pro-tip">
            <div className="tip-title">💡 Pro Tip</div>
            <p>Type <code>/</code> in the editor to instantly add headings, lists, or images.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;