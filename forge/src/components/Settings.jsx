import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ darkMode, onToggleDarkMode }) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("My Workspace");

  return (
    <div className="settings-container">
      <h1 className="page-title">Settings</h1>
      
      <div className="settings-section">
        <h2 className="section-title">Appearance</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Dark Mode</span>
            <p className="setting-desc">Switch between light and dark themes</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={onToggleDarkMode} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Workspace</h2>
        <div className="setting-item vertical">
          <span className="setting-label">Workspace Name</span>
          <input 
            type="text" 
            className="setting-input" 
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Notifications</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Email Notifications</span>
            <p className="setting-desc">Receive updates via email</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={emailNotifications} 
              onChange={() => setEmailNotifications(!emailNotifications)} 
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Desktop Notifications</span>
            <p className="setting-desc">Show popups on your desktop</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={desktopNotifications} 
              onChange={() => setDesktopNotifications(!desktopNotifications)} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h2 className="section-title text-danger">Danger Zone</h2>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Delete Workspace</span>
            <p className="setting-desc">Permanently delete this workspace and all data</p>
          </div>
          <button className="btn-danger">Delete Workspace</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;