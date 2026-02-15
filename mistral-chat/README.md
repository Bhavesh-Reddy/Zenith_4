# 🚀 Mistral Chat — Full Setup Guide

A production-ready AI chat app inspired by Google Gemini, powered by Mistral-7B via Hugging Face.

---

## 📁 Project Structure

```
mistral-chat/
├── frontend/                   # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # Collapsible sidebar with chat history
│   │   │   ├── Sidebar.css
│   │   │   ├── ChatArea.jsx        # Main chat view + input bar
│   │   │   ├── ChatArea.css
│   │   │   ├── ChatMessage.jsx     # Individual message bubble
│   │   │   ├── ChatMessage.css
│   │   │   ├── CircleSearch.jsx    # Circle-to-search feature
│   │   │   ├── CircleSearch.css
│   │   │   ├── SettingsPanel.jsx   # Settings modal
│   │   │   ├── SettingsPanel.css
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── TypingIndicator.css
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx    # Light/Dark theme
│   │   │   ├── ChatContext.jsx     # Chat sessions & history
│   │   │   └── SettingsContext.jsx # User settings
│   │   ├── services/
│   │   │   └── api.js              # API calls
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css               # Global theme variables
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # Node.js + Express backend
│   ├── routes/
│   │   ├── chat.js             # Mistral AI via Hugging Face
│   │   ├── tts.js              # ElevenLabs TTS
│   │   └── search.js          # Circle-to-search image analysis
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 🔑 API Keys (`.env`)

```env
PORT=5000

# Required for AI chat
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx

# Optional - for voice output
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxx
```

### Getting your Hugging Face API key:
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read access is enough)
3. Paste it in `.env`

### Getting your ElevenLabs API key:
1. Go to https://elevenlabs.io/app/settings/api-keys
2. Create a new key
3. Paste it in `.env`

---

## ✨ Features

| Feature | Status | Notes |
|---------|--------|-------|
| 💬 AI Chat | ✅ | Mistral-7B via Hugging Face |
| 🌗 Dark/Light Mode | ✅ | Persisted in localStorage |
| 📂 Chat History | ✅ | Sidebar with rename/delete |
| 🔊 Text to Speech | ✅ | ElevenLabs + browser TTS fallback |
| 🎤 Voice Input | ✅ | Web Speech API |
| 🔍 Circle to Search | ✅ | No screen share required |
| ⚙️ Settings | ✅ | Font, size, theme, profile |
| 📤 Export Chat | ✅ | Download as JSON |
| 📸 Screenshot | ✅ | Capture current view |

---

## 🎨 UI Highlights

- **Gold & warm brown palette** — light & dark variants
- **Cormorant Garamond + DM Sans** typography
- **Collapsible sidebar** — just like Claude.ai
- **Suggestion chips** — on welcome screen
- **Markdown rendering** — tables, code, lists

---

## 🔧 Troubleshooting

**Model loading error (503):** Hugging Face free tier loads models on demand. Wait 30–60 seconds and retry.

**Rate limit (429):** Too many requests. Wait a minute.

**API key invalid (401):** Check your HUGGINGFACE_API_KEY in .env

**TTS not working:** ElevenLabs key is optional — app falls back to browser speech synthesis automatically.

**Circle to Search:** Draws on top of the current page using html2canvas. No screen share permissions needed.
