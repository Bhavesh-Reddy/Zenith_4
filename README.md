# Zenith_4 - Multi-Project Development Workspace

A comprehensive development workspace containing multiple full-stack applications and automation workflows.

## 🚀 Projects Overview

### 1. **Forge** - Professional Productivity Workspace
A modern, feature-rich productivity application inspired by Notion, built with React and Express.

**Key Features:**
- 📝 Rich text editor with TipTap integration
- 📊 Project planning and management tools
- 📅 Integrated calendar system
- ✅ Task management
- 👥 Team collaboration features
- 🌙 Dark/Light mode support
- 📱 Responsive design
- 💾 MongoDB data persistence

**Tech Stack:**
- **Frontend:** React 19, TipTap Editor, Lucide Icons, React Router
- **Backend:** Express.js, MongoDB, Mongoose
- **Styling:** Custom CSS with CSS variables
- **Development:** Concurrently, Nodemon

### 2. **Mistral Chat** - AI-Powered Chat Application
A production-ready AI chat application inspired by Google Gemini, powered by Mistral-7B via Hugging Face.

**Key Features:**
- 💬 AI chat with Mistral-7B model
- 🌗 Dark/Light theme switching
- 📂 Chat history management
- 🔊 Text-to-speech with ElevenLabs
- 🎤 Voice input support
- 🔍 Circle-to-search functionality
- ⚙️ Customizable settings
- 📤 Export chat functionality
- 📸 Screenshot capture

**Tech Stack:**
- **Frontend:** React 18, Vite, Lucide Icons, React Markdown
- **Backend:** Express.js, Hugging Face API, ElevenLabs API
- **Features:** Tesseract.js for OCR, html2canvas for screenshots
- **Styling:** Custom CSS with theme system

### 3. **Automation Workflows** - N8N Integration
Pre-configured automation workflow for Telegram Drive to YouTube upload process.

**Features:**
- 🔄 Automated file processing from Google Drive
- 📺 YouTube video upload automation
- 📊 Google Sheets logging
- 🔗 Webhook-triggered workflows
- ⚡ One-command execution

## 📁 Project Structure

```
Zenith_4/
├── forge/                          # Forge Productivity App
│   ├── backend/                    # Express.js backend
│   │   ├── models/                 # MongoDB models
│   │   ├── routes/                 # API routes
│   │   └── server.js              # Main server file
│   ├── src/                       # React frontend
│   │   ├── components/            # React components
│   │   ├── services/              # API services
│   │   └── App.js                 # Main app component
│   └── package.json               # Dependencies
│
├── mistral-chat/                   # AI Chat Application
│   ├── frontend/                   # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/        # React components
│   │   │   ├── context/           # React contexts
│   │   │   └── services/          # API services
│   │   └── package.json
│   └── backend/                    # Express.js backend
│       ├── routes/                # API routes
│       └── server.js              # Main server file
│
├── forge-backup-backend/           # Backup of Forge backend
├── Automation.json                 # N8N workflow configuration
├── requirements.txt                # Project dependencies
└── README.md                      # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (for Forge project)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Zenith_4
```

### 2. Setup Forge Project
```bash
cd forge
npm install
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI
npm run dev
```
Access at: http://localhost:3000

### 3. Setup Mistral Chat
```bash
# Backend setup
cd mistral-chat/backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev

# Frontend setup (new terminal)
cd mistral-chat/frontend
npm install
npm run dev
```
Access at: http://localhost:5173

## 🔑 Environment Configuration

### Forge Project (.env)
```env
MONGODB_URI=mongodb://localhost:27017/forge
PORT=5001
NODE_ENV=development
```

### Mistral Chat Project (.env)
```env
PORT=5000
HUGGINGFACE_API_KEY=hf_your_token_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here  # Optional
```

## 🎯 API Keys Setup

### Hugging Face (Required for Mistral Chat)
1. Visit https://huggingface.co/settings/tokens
2. Create a new token (read access)
3. Add to `.env` file

### ElevenLabs (Optional for TTS)
1. Visit https://elevenlabs.io/app/settings/api-keys
2. Create a new API key
3. Add to `.env` file

## 🚀 Development Commands

### Forge Project
```bash
npm start          # Start React development server
npm run server     # Start Express backend only
npm run dev        # Start both frontend and backend
npm run build      # Build for production
npm test           # Run tests
```

### Mistral Chat
```bash
# Backend
npm run dev        # Start with nodemon
npm start          # Start production server

# Frontend
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🎨 Features Showcase

### Forge Productivity Features
- **Rich Text Editor:** Full-featured editor with formatting, links, images
- **Project Management:** Kanban boards, task tracking, project planning
- **Calendar Integration:** Event scheduling and management
- **Team Collaboration:** Comments, sharing, notifications
- **Dark Mode:** System-wide theme switching
- **Responsive Design:** Works on desktop, tablet, and mobile

### Mistral Chat AI Features
- **Advanced AI Chat:** Powered by Mistral-7B model
- **Voice Interaction:** Speech-to-text and text-to-speech
- **Visual Search:** Circle-to-search on any content
- **Chat Management:** History, export, rename conversations
- **Customization:** Themes, fonts, settings persistence
- **Screenshot Tools:** Capture and share conversations

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Error (Forge):**
- Ensure MongoDB is running locally
- Check connection string in `.env`
- Verify database permissions

**Hugging Face Model Loading (Mistral Chat):**
- Free tier models load on-demand (30-60 seconds)
- Check API key validity
- Monitor rate limits

**Port Conflicts:**
- Forge: Frontend (3000), Backend (5001)
- Mistral Chat: Frontend (5173), Backend (5000)
- Change ports in respective config files if needed

## 📦 Production Deployment

### Docker Support
Each project includes Docker configuration for containerized deployment.

### Environment Variables
Ensure all required environment variables are set in production:
- Database connections
- API keys
- CORS origins
- Security configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see individual project files for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review project-specific README files
3. Open an issue on GitHub

---

**Built with ❤️ using modern web technologies**
