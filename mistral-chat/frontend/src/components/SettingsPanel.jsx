import React, { useState } from 'react';
import {
  X, User, Type, Palette, Volume2, Mic, Share2, Download,
  Copy, Check, Globe, Info, ChevronRight, Sparkles, Camera
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import './SettingsPanel.css';

const FONT_FAMILIES = [
  { id: 'dm-sans', label: 'DM Sans', preview: 'Clean & Modern' },
  { id: 'cormorant', label: 'Cormorant Garamond', preview: 'Elegant & Serif' },
  { id: 'system', label: 'System Default', preview: 'Native & Fast' },
  { id: 'mono', label: 'Monospace', preview: 'Technical & Code' },
];

const FONT_SIZES = [
  { id: 'small', label: 'Small', px: '13px' },
  { id: 'medium', label: 'Medium', px: '15px' },
  { id: 'large', label: 'Large', px: '17px' },
];

export default function SettingsPanel({ onClose }) {
  const { settings, updateSetting } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const { sessions, activeChatId, activeSession } = useChat();
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZenM Chat',
          text: activeSession
            ? `Check out my conversation: "${activeSession.title}"`
            : 'Check out ZenM Chat!',
          url
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!activeSession) return;
    const data = {
      title: activeSession.title,
      messages: activeSession.messages,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScreenshot = async () => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(document.body, { scale: 1 });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ZenM-chat-screenshot.png';
      a.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI & Voice', icon: Sparkles },
    { id: 'share', label: 'Share', icon: Share2 },
  ];

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel animate-scale-in">
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-tab ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">

          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="settings-section-group">
              <div className="settings-user-card">
                <div className="settings-avatar">
                  {settings.userName.charAt(0).toUpperCase()}
                </div>
                <div className="settings-user-info">
                  <span className="settings-user-name">{settings.userName}</span>
                  <span className="settings-user-plan">Free Plan · {sessions.length} conversations</span>
                </div>
              </div>

              <div className="settings-section">
                <label className="settings-label">Display Name</label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={e => updateSetting('userName', e.target.value)}
                  placeholder="Your name"
                  className="settings-input"
                  maxLength={30}
                />
              </div>

              <div className="settings-section">
                <label className="settings-label">Current Chat</label>
                <div className="settings-info-row">
                  {activeSession
                    ? <span className="settings-info-value">{activeSession.title}</span>
                    : <span className="settings-info-muted">No active conversation</span>}
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="settings-section-group">
              <div className="settings-section">
                <label className="settings-label">Theme</label>
                <div className="theme-cards">
                  <button
                    className={`theme-card light ${theme === 'light' ? 'selected' : ''}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    <div className="theme-card-preview light-preview" />
                    <span>Light</span>
                    {theme === 'light' && <Check size={14} />}
                  </button>
                  <button
                    className={`theme-card dark ${theme === 'dark' ? 'selected' : ''}`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    <div className="theme-card-preview dark-preview" />
                    <span>Dark</span>
                    {theme === 'dark' && <Check size={14} />}
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <label className="settings-label">Font Size</label>
                <div className="font-size-btns">
                  {FONT_SIZES.map(f => (
                    <button
                      key={f.id}
                      className={`font-size-btn ${settings.fontSize === f.id ? 'active' : ''}`}
                      onClick={() => updateSetting('fontSize', f.id)}
                      style={{ fontSize: f.px }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <label className="settings-label">Font Style</label>
                <div className="font-family-list">
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.id}
                      className={`font-family-btn ${settings.fontFamily === f.id ? 'active' : ''}`}
                      onClick={() => updateSetting('fontFamily', f.id)}
                      style={{ fontFamily: f.id === 'dm-sans' ? "'DM Sans', sans-serif" : f.id === 'cormorant' ? "'Cormorant Garamond', serif" : f.id === 'system' ? 'system-ui' : 'monospace' }}
                    >
                      <span className="font-name">{f.label}</span>
                      <span className="font-preview">{f.preview}</span>
                      {settings.fontFamily === f.id && <Check size={14} className="font-check" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI & Voice */}
          {activeTab === 'ai' && (
            <div className="settings-section-group">
              <div className="settings-section">
                <label className="settings-label">Voice Features</label>
                <div className="toggle-rows">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <Volume2 size={16} />
                      <div>
                        <span>Text to Speech</span>
                        <p>Read AI responses aloud (requires ElevenLabs key)</p>
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${settings.ttsEnabled ? 'on' : ''}`}
                      onClick={() => updateSetting('ttsEnabled', !settings.ttsEnabled)}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <Mic size={16} />
                      <div>
                        <span>Voice Input</span>
                        <p>Speak your messages using microphone</p>
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${settings.voiceInputEnabled ? 'on' : ''}`}
                      onClick={() => updateSetting('voiceInputEnabled', !settings.voiceInputEnabled)}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <Info size={16} />
                      <div>
                        <span>Show Timestamps</span>
                        <p>Show time for each message</p>
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${settings.showTimestamps ? 'on' : ''}`}
                      onClick={() => updateSetting('showTimestamps', !settings.showTimestamps)}
                    />
                  </div>
                </div>
              </div>
              <div className="settings-section">
                <div className="settings-info-box">
                  <Info size={14} />
                  <p>Add your API keys to the backend <code>.env</code> file to enable AI features. See <code>.env.example</code> for reference.</p>
                </div>
              </div>
            </div>
          )}

          {/* Share */}
          {activeTab === 'share' && (
            <div className="settings-section-group">
              <div className="settings-section">
                <label className="settings-label">Share & Export</label>
                <div className="share-actions">
                  <button className="share-action-btn" onClick={handleShare}>
                    <div className="share-action-icon">
                      {copied ? <Check size={18} /> : <Share2 size={18} />}
                    </div>
                    <div>
                      <span>{copied ? 'Link Copied!' : 'Share App'}</span>
                      <p>Share ZenM Chat with others</p>
                    </div>
                    <ChevronRight size={16} className="share-arrow" />
                  </button>

                  <button
                    className={`share-action-btn ${!activeSession ? 'disabled' : ''}`}
                    onClick={handleExport}
                    disabled={!activeSession}
                  >
                    <div className="share-action-icon">
                      <Download size={18} />
                    </div>
                    <div>
                      <span>Export Chat</span>
                      <p>{activeSession ? `Export "${activeSession.title}"` : 'Open a chat to export'}</p>
                    </div>
                    <ChevronRight size={16} className="share-arrow" />
                  </button>

                  <button className="share-action-btn" onClick={handleScreenshot}>
                    <div className="share-action-icon">
                      <Camera size={18} />
                    </div>
                    <div>
                      <span>Screenshot</span>
                      <p>Save a screenshot of current view</p>
                    </div>
                    <ChevronRight size={16} className="share-arrow" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
