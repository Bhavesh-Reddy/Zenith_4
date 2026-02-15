import React, { useState } from 'react';
import { Copy, Check, Volume2, VolumeX, User, Sparkles, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettings } from '../context/SettingsContext';
import { synthesizeSpeech } from '../services/api';
import './ChatMessage.css';

export default function ChatMessage({ message }) {
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioObj, setAudioObj] = useState(null);

  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      if (audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
      }
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setAudioObj(null);
      return;
    }

    setIsSpeaking(true);

    try {
      const blob = await synthesizeSpeech(message.content.substring(0, 2000));
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setAudioObj(audio);
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioObj(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        setAudioObj(null);
        URL.revokeObjectURL(url);
        // Fallback to browser TTS
        useBrowserTTS(message.content);
      };
    } catch {
      useBrowserTTS(message.content);
    }
  };

  const useBrowserTTS = (text) => {
    if (!window.speechSynthesis) { setIsSpeaking(false); return; }
    const utter = new SpeechSynthesisUtterance(text.substring(0, 1000));
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (message.isImage) {
    return (
      <div className={`chat-message ${isUser ? 'user' : 'assistant'} animate-fade-in`}>
        <div className="message-avatar">
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>
        <div className="message-body">
          <div className="message-image-card">
            <img src={message.imageData} alt="Circle search capture" className="message-image" />
            <div className="message-image-label">Circle to Search</div>
          </div>
          {settings.showTimestamps && (
            <div className="message-meta">
              <Clock size={11} /> {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''} animate-fade-in`}>
      <div className="message-avatar">
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div className="message-body">
        <div className="message-bubble">
          {isUser ? (
            <>
              {message.images && message.images.length > 0 && (
                <div className="message-images">
                  {message.images.map((img, i) => (
                    <img key={i} src={img.data} alt={img.name} className="message-inline-image"
                      onClick={() => window.open(img.data)} />
                  ))}
                </div>
              )}
              <p className="message-text">{message.content}</p>
            </>
          ) : (
            <div className="message-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code {...props}>{children}</code>
                    ) : (
                      <pre><code className={className} {...props}>{children}</code></pre>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="message-actions">
          {settings.showTimestamps && (
            <span className="message-time">
              <Clock size={11} /> {formatTime(message.timestamp)}
            </span>
          )}
          {!isUser && !isError && (
            <>
              <button
                className="msg-action-btn"
                onClick={handleCopy}
                title="Copy"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
              {settings.ttsEnabled && (
                <button
                  className={`msg-action-btn ${isSpeaking ? 'active' : ''}`}
                  onClick={handleSpeak}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}