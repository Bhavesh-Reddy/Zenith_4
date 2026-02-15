import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ChatContext = createContext(null);

const STORAGE_KEY = 'mistral-chat-sessions';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeChatId, setActiveChatId] = useState(null);

  const activeSession = sessions.find(s => s.id === activeChatId) || null;
  const messages = activeSession?.messages || [];

  const updateAndPersist = useCallback((newSessions) => {
    setSessions(newSessions);
    saveSessions(newSessions);
  }, []);

  const createNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  const startSessionIfNeeded = useCallback((firstUserMessage) => {
    if (activeChatId) return activeChatId;
    const newId = uuidv4();
    const title = firstUserMessage.length > 40
      ? firstUserMessage.substring(0, 40) + '...'
      : firstUserMessage;
    const newSession = {
      id: newId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions(prev => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveChatId(newId);
    return newId;
  }, [activeChatId]);

  const addMessage = useCallback((msg, chatId) => {
    const targetId = chatId || activeChatId;
    if (!targetId) return;
    const newMsg = { ...msg, id: msg.id || uuidv4(), timestamp: msg.timestamp || Date.now() };
    setSessions(prev => {
      const exists = prev.find(s => s.id === targetId);
      if (!exists) return prev;
      const updated = prev.map(s => {
        if (s.id !== targetId) return s;
        return {
          ...s,
          messages: [...s.messages, newMsg],
          updatedAt: Date.now()
        };
      });
      saveSessions(updated);
      return updated;
    });
  }, [activeChatId]);

  const loadChat = useCallback((id) => {
    setActiveChatId(id);
  }, []);

  const deleteChat = useCallback((id) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    if (activeChatId === id) setActiveChatId(null);
  }, [activeChatId]);

  const renameChat = useCallback((id, newTitle) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, title: newTitle } : s);
      saveSessions(updated);
      return updated;
    });
  }, []);

  return (
    <ChatContext.Provider value={{
      sessions,
      activeChatId,
      activeSession,
      messages,
      createNewChat,
      startSessionIfNeeded,
      addMessage,
      loadChat,
      deleteChat,
      renameChat,
      setActiveChatId
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
