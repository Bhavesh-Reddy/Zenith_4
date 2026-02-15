import React from 'react';
import { Sparkles } from 'lucide-react';
import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator animate-fade-in">
      <div className="typing-avatar">
        <Sparkles size={14} />
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot" style={{ animationDelay: '200ms' }} />
        <span className="typing-dot" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
