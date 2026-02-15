import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Mic, MicOff, Plus, Circle,
  Loader2, ArrowDown, Sparkles, X,
  FileText, Image, File
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import { sendMessage } from '../services/api';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import CircleSearch from './CircleSearch';
import './ChatArea.css';

const SUGGESTIONS = [
  { label: 'Create image', emoji: '🎨' },
  { label: 'Explore cricket', emoji: '🏏' },
  { label: 'Write anything', emoji: '✍️' },
  { label: 'Create a video', emoji: '🎬' },
  { label: 'Boost my day', emoji: '🚀' },
  { label: 'Help me learn', emoji: '🧠' },
];

const ACCEPTED_TYPES = '.txt,.md,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.cs,.html,.css,.json,.xml,.csv,.pdf,.png,.jpg,.jpeg,.gif,.webp';

function getFileIcon(type) {
  if (type.startsWith('image/')) return <Image size={13} />;
  if (type === 'application/pdf') return <FileText size={13} />;
  return <File size={13} />;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function readFileContent(file) {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: 'image', data: reader.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => resolve({ type: 'text', data: reader.result, name: file.name });
      reader.onerror = () => resolve({ type: 'text', data: '[Could not read file]', name: file.name });
      reader.readAsText(file);
    }
  });
}

export default function ChatArea() {
  const { messages, activeChatId, addMessage, startSessionIfNeeded } = useChat();
  const { settings } = useSettings();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCircleSearch, setShowCircleSearch] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [error, setError] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]); // { file, preview }

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback((force = false) => {
    if (force || settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [settings.autoScroll]);

  useEffect(() => { scrollToBottom(true); }, [messages.length]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

  // ── File attachment ──────────────────────────────────────────────
  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const valid = files.filter(f => {
      if (f.size > MAX_SIZE) {
        setError(`${f.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const previews = await Promise.all(valid.map(async (file) => {
      const content = await readFileContent(file);
      return { file, content };
    }));

    setAttachedFiles(prev => [...prev, ...previews]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ── Build message content with files ────────────────────────────
  const buildMessageContent = useCallback((text, files) => {
    if (!files.length) return text;

    let content = text ? text + '\n\n' : '';

    files.forEach(({ file, content: fileContent }) => {
      if (fileContent.type === 'image') {
        content += `[Attached image: ${file.name}]\n`;
      } else {
        const truncated = fileContent.data.length > 8000
          ? fileContent.data.substring(0, 8000) + '\n... (truncated)'
          : fileContent.data;
        content += `[File: ${file.name}]\n\`\`\`\n${truncated}\n\`\`\`\n`;
      }
    });

    return content.trim();
  }, []);

  // ── Submit ───────────────────────────────────────────────────────
  const submit = async (content) => {
    const text = (content || input).trim();
    const hasFiles = attachedFiles.length > 0;

    if (!text && !hasFiles) return;
    if (isLoading) return;

    const fullContent = buildMessageContent(text, attachedFiles);
    const displayText = text || `📎 ${attachedFiles.map(a => a.file.name).join(', ')}`;

    setInput('');
    setAttachedFiles([]);
    setError(null);
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const chatId = startSessionIfNeeded(displayText);

    // Show user message — with image previews if any
    const imageFiles = attachedFiles.filter(a => a.content.type === 'image');
    const userMsg = {
      role: 'user',
      content: displayText,
      fullContent,
      images: imageFiles.map(a => ({ name: a.file.name, data: a.content.data }))
    };
    addMessage(userMsg, chatId);

    const history = [...(messages || []), { role: 'user', content: fullContent }];

    try {
      const data = await sendMessage(history);
      if (data.success && data.message) {
        addMessage(data.message, chatId);
      } else {
        throw new Error(data.error || 'No response received');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to connect';
      addMessage({ role: 'assistant', content: `⚠️ ${errMsg}`, isError: true }, chatId);
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  // ── Voice ────────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (!settings.voiceInputEnabled) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Speech recognition not supported'); return; }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(transcript);
    };
    recognitionRef.current = rec;
    rec.start();
  }, [isListening, settings.voiceInputEnabled]);

  // ── Circle search ────────────────────────────────────────────────
  const handleCircleResult = useCallback((responseText, imageData, query) => {
    const chatId = startSessionIfNeeded('Circle to Search: ' + query);
    addMessage({ role: 'user', content: `🔍 "${query}"`, isImage: true, imageData }, chatId);
    addMessage({ role: 'assistant', content: responseText }, chatId);
    setShowCircleSearch(false);
  }, [startSessionIfNeeded, addMessage]);

  // ── Drag & drop ──────────────────────────────────────────────────
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    const fakeEvent = { target: { files }, currentTarget: { value: '' } };
    await handleFileSelect(fakeEvent);
  }, [handleFileSelect]);

  const handleDragOver = (e) => e.preventDefault();

  const isEmptyChat = !activeChatId || messages.length === 0;

  return (
    <div className="chat-area" onDrop={handleDrop} onDragOver={handleDragOver}>

      {/* Messages */}
      <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
        {isEmptyChat ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon"><Sparkles size={32} /></div>
              <p className="welcome-greeting">Hi {settings.userName}</p>
              <h1 className="welcome-heading">Where should we start?</h1>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, i) => (
              <ChatMessage key={msg.id || i} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
        <div ref={messagesEndRef} />

        {showScrollBtn && (
          <button className="scroll-to-bottom" onClick={() => scrollToBottom(true)}>
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Suggestion chips */}
      {isEmptyChat && (
        <div className="suggestions-area">
          <div className="suggestions-chips">
            {SUGGESTIONS.map(s => (
              <button key={s.label} className="suggestion-chip"
                onClick={() => { setInput(s.label); textareaRef.current?.focus(); }}>
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        {error && (
          <div className="input-error">
            ⚠️ {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Attached files preview */}
        {attachedFiles.length > 0 && (
          <div className="attachments-preview">
            {attachedFiles.map(({ file, content }, i) => (
              <div key={i} className="attachment-chip">
                {content.type === 'image' ? (
                  <img src={content.data} alt={file.name} className="attachment-thumb" />
                ) : (
                  <div className="attachment-icon">{getFileIcon(file.type)}</div>
                )}
                <div className="attachment-info">
                  <span className="attachment-name">{file.name}</span>
                  <span className="attachment-size">{formatBytes(file.size)}</span>
                </div>
                <button className="attachment-remove" onClick={() => removeAttachment(i)}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-wrapper">
          <div className="input-container">
            {/* Left actions */}
            <div className="input-left">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                className="input-icon-btn"
                title="Attach file (images, text, code, PDF)"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={18} />
              </button>
              <button
                className={`input-icon-btn ${showCircleSearch ? 'active' : ''}`}
                title="Lens Search — select any area on screen"
                onClick={() => setShowCircleSearch(true)}
              >
                <Circle size={16} />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="message-input"
              placeholder={attachedFiles.length ? 'Add a message... (optional)' : 'Ask Mistral...'}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />

            {/* Right actions */}
            <div className="input-right">
              {settings.voiceInputEnabled && (
                <button
                  className={`input-icon-btn mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleVoice}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}
              <button
                className={`send-btn ${((input.trim() || attachedFiles.length) && !isLoading) ? 'active' : ''}`}
                onClick={() => submit()}
                disabled={(!input.trim() && !attachedFiles.length) || isLoading}
                title="Send"
              >
                {isLoading
                  ? <Loader2 size={18} className="spin" />
                  : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
        <p className="input-disclaimer">Mistral can make mistakes. Verify important info.</p>
      </div>

      {showCircleSearch && (
        <CircleSearch onResult={handleCircleResult} onClose={() => setShowCircleSearch(false)} />
      )}
    </div>
  );
}