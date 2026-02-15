import React, { useState, useRef } from 'react';
import {
  Plus, Search, MessageSquare, Trash2, Edit3, Check, X,
  Sun, Moon, Settings, ChevronRight, Star, Clock,
  MoreHorizontal, PenSquare, Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import './Sidebar.css';

function groupByDate(sessions) {
  const now = Date.now();
  const day = 86400000;
  const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };

  sessions.forEach(s => {
    const diff = now - s.updatedAt;
    if (diff < day) groups['Today'].push(s);
    else if (diff < 2 * day) groups['Yesterday'].push(s);
    else if (diff < 7 * day) groups['This Week'].push(s);
    else groups['Older'].push(s);
  });

  return groups;
}

export default function Sidebar({ onSettingsOpen, collapsed, onToggle }) {
  const { theme, toggleTheme } = useTheme();
  const { sessions, activeChatId, createNewChat, loadChat, deleteChat, renameChat } = useChat();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const editRef = useRef(null);

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = groupByDate(filteredSessions);

  const startEdit = (s, e) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditValue(s.title);
    setContextMenu(null);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const confirmEdit = (id) => {
    if (editValue.trim()) renameChat(id, editValue.trim());
    setEditingId(null);
  };

  const handleContextMenu = (e, s) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id: s.id, x: e.clientX, y: e.clientY, session: s });
  };

  if (collapsed) {
    return (
      <div className="sidebar-collapsed">
        <button className="sidebar-icon-btn" onClick={onToggle} title="Expand sidebar">
          <PenSquare size={18} />
        </button>
        <button className="sidebar-icon-btn new-chat-icon" onClick={createNewChat} title="New chat">
          <Plus size={18} />
        </button>
        <div className="sidebar-icon-divider" />
        {sessions.slice(0, 8).map(s => (
          <button
            key={s.id}
            className={`sidebar-icon-btn ${s.id === activeChatId ? 'active' : ''}`}
            onClick={() => loadChat(s.id)}
            title={s.title}
          >
            <MessageSquare size={16} />
          </button>
        ))}
        <div className="sidebar-icon-spacer" />
        <button className="sidebar-icon-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="sidebar-icon-btn" onClick={onSettingsOpen} title="Settings">
          <Settings size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Sparkles size={16} />
            </div>
            <span className="brand-name">ZenM</span>
          </div>
          <div className="sidebar-header-actions">
            <button className="header-action-btn" onClick={onToggle} title="Collapse">
              <ChevronRight size={16} />
            </button>
            <button className="header-action-btn new-chat-btn" onClick={createNewChat} title="New chat">
              <PenSquare size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button className="new-chat-full-btn" onClick={createNewChat}>
          <Plus size={16} />
          <span>New conversation</span>
        </button>

        {/* Chat History */}
        <div className="sidebar-history">
          {filteredSessions.length === 0 && (
            <div className="empty-history">
              <MessageSquare size={28} />
              <p>{searchQuery ? 'No results found' : 'No conversations yet'}</p>
              <span>{searchQuery ? 'Try a different search' : 'Start a new chat!'}</span>
            </div>
          )}

          {Object.entries(grouped).map(([group, items]) => {
            if (!items.length) return null;
            return (
              <div key={group} className="history-group">
                <div className="group-label">
                  <Clock size={11} />
                  <span>{group}</span>
                </div>
                {items.map(s => (
                  <div
                    key={s.id}
                    className={`chat-item ${s.id === activeChatId ? 'active' : ''}`}
                    onClick={() => loadChat(s.id)}
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onContextMenu={e => handleContextMenu(e, s)}
                  >
                    <div className="chat-item-icon">
                      {s.id === activeChatId
                        ? <MessageSquare size={14} />
                        : <MessageSquare size={14} />}
                    </div>

                    {editingId === s.id ? (
                      <div className="chat-item-edit">
                        <input
                          ref={editRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmEdit(s.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={e => e.stopPropagation()}
                          className="chat-item-edit-input"
                        />
                        <button
                          className="chat-item-action-btn confirm"
                          onClick={e => { e.stopPropagation(); confirmEdit(s.id); }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          className="chat-item-action-btn cancel"
                          onClick={e => { e.stopPropagation(); setEditingId(null); }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="chat-item-title">{s.title}</span>
                        {(hoveredId === s.id || s.id === activeChatId) && (
                          <div className="chat-item-actions">
                            <button
                              className="chat-item-action-btn"
                              onClick={e => startEdit(s, e)}
                              title="Rename"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              className="chat-item-action-btn delete"
                              onClick={e => { e.stopPropagation(); deleteChat(s.id); }}
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {settings.userName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{settings.userName}</span>
              <span className="user-plan">Free Plan</span>
            </div>
          </div>

          <div className="footer-actions">
            <button
              className="footer-btn theme-toggle"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <span className="theme-toggle-track">
                <span className={`theme-toggle-thumb ${theme}`}>
                  {theme === 'light' ? <Sun size={10} /> : <Moon size={10} />}
                </span>
              </span>
              <span>{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
            </button>

            <button className="footer-btn" onClick={onSettingsOpen}>
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button onClick={e => startEdit(contextMenu.session, e)}>
            <Edit3 size={13} /> Rename
          </button>
          <button
            className="danger"
            onClick={() => { deleteChat(contextMenu.id); setContextMenu(null); }}
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
      {contextMenu && (
        <div className="context-menu-backdrop" onClick={() => setContextMenu(null)} />
      )}
    </>
  );
}
