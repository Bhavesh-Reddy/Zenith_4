import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const DEFAULTS = {
  userName: 'Gopal',
  fontSize: 'medium',   // small | medium | large
  fontFamily: 'dm-sans', // dm-sans | cormorant | system | mono
  ttsEnabled: true,
  voiceInputEnabled: true,
  autoScroll: true,
  showTimestamps: false
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('mistral-settings');
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mistral-settings', JSON.stringify(settings));
    } catch {}

    const fontMap = {
      'dm-sans': "'DM Sans', sans-serif",
      'cormorant': "'Cormorant Garamond', serif",
      'system': "system-ui, sans-serif",
      'mono': "'Courier New', monospace"
    };

    const sizeMap = {
      small: '13px',
      medium: '15px',
      large: '17px'
    };

    document.documentElement.style.setProperty('--app-font', fontMap[settings.fontFamily] || fontMap['dm-sans']);
    document.documentElement.style.setProperty('--app-font-size', sizeMap[settings.fontSize] || '15px');
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
