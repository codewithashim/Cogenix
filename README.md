# Cogenix - AI Chat Interface with Memory & Context

<div align="center">

**A modern, feature-rich AI chat application built with Next.js 15, featuring persistent conversations, intelligent memory context, and seamless Ollama integration.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

**Cogenix** is an intelligent conversational AI platform designed to provide seamless interactions with local AI models through Ollama. Built with modern web technologies, it offers a production-ready solution for deploying AI chat interfaces with enterprise-grade features.

### Purpose

The primary goal of Cogenix is to:

- **Democratize AI Access**: Provide an intuitive interface for interacting with locally-run AI models via Ollama
- **Preserve Context**: Maintain conversation history and context across sessions using MongoDB persistence
- **Enable Organization**: Offer thread-based conversation management for better workflow organization
- **Enhance User Experience**: Deliver real-time streaming responses with a beautiful, responsive UI
- **Ensure Privacy**: Keep all conversations local and secure with self-hosted infrastructure

### Use Cases

- **Personal AI Assistant**: Daily tasks, brainstorming, and research
- **Development Tool**: Code assistance, debugging, and technical documentation
- **Learning Platform**: Educational conversations and knowledge exploration
- **Enterprise Solution**: Internal AI-powered support and documentation systems

---

## ✨ Features

### Core Functionality

- 💬 **Real-time Streaming Chat**: Experience AI responses as they're generated with server-sent events
- 🧠 **Intelligent Memory Context**: AI remembers and references previous conversations
- 🗂️ **Thread Management**: Organize conversations into separate threads with persistent storage
- 🎨 **Advanced Theme System**: 
  - Light Mode - Clean, professional interface
  - Dark Mode - Eye-friendly, reduced strain
  - System Mode - Automatically syncs with OS preferences
- 📊 **Token Statistics**: Track prompt and completion tokens for usage monitoring
- 🔄 **Data Persistence**: All conversations securely stored in MongoDB
- 🎯 **Model Selection**: Switch between different Ollama models on-the-fly
- ⚡ **Performance Optimized**: Built with Next.js 15 Turbopack for lightning-fast development
- 🎭 **Type-Safe**: Full TypeScript implementation for robust code quality

### Technical Features

- Server-Sent Events (SSE) for real-time streaming
- React Query for efficient state management and caching
- Feature-based architecture for scalability
- Responsive design with Tailwind CSS 4
- MongoDB with Mongoose ODM for data modeling
- RESTful API architecture
- Error handling and retry logic
- Connection pooling and optimization

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.5.5](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19.1.0](https://react.dev/) - Latest React with concurrent features
- **Language**: [TypeScript 5.x](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **State Management**: [TanStack React Query 5.90.3](https://tanstack.com/query) - Server state management
- **HTTP Client**: [Axios 1.12.2](https://axios-http.com/) - Promise-based HTTP client

### Backend
- **Database**: [MongoDB](https://www.mongodb.com/) - NoSQL document database
- **ODM**: [Mongoose 8.19.1](https://mongoosejs.com/) - MongoDB object modeling
- **AI Backend**: [Ollama](https://ollama.ai/) - Local AI model runtime
- **API**: Next.js API Routes - Serverless API endpoints

### Development Tools
- **Build Tool**: Turbopack - Next.js native bundler
- **Package Manager**: npm/yarn/pnpm - Dependency management
- **Code Quality**: ESLint, Prettier - Code formatting and linting

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v20.x or higher)
   ```bash
   # Check version
   node --version
   # Should output: v20.x.x or higher
   ```

2. **npm** (v10.x or higher) or **yarn** or **pnpm**
   ```bash
   npm --version
   ```

3. **MongoDB** (v6.0 or higher)
   - [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
   - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

4. **Ollama** (Latest version)
   - Install from [Ollama Official Website](https://ollama.ai/)
   - Ensure it's running on `http://localhost:11434`
   
   ```bash
   # Verify Ollama installation
   ollama --version
   
   # Pull a model (e.g., llama3)
   ollama pull llama3
   
   # Verify model is available
   ollama list
   ```

### Optional but Recommended

- **Git**: For version control
- **VS Code**: Recommended IDE with TypeScript support
- **MongoDB Compass**: GUI for MongoDB database management

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/cogenix.git

# Or using SSH
git clone git@github.com:yourusername/cogenix.git

# Navigate to project directory
cd cogenix
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

This will install all required dependencies listed in `package.json`.

---

## ⚙️ Configuration

### Step 1: Environment Variables

Create your environment configuration file:

```bash
# Copy the template
cp env.template .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your actual values:

```env
# =================================
# Backend Configuration
# =================================

# Ollama Backend URL
OLLAMA_URL=http://localhost:11434

# =================================
# Model Configuration
# =================================

# Default AI model (must be pulled in Ollama)
DEFAULT_MODEL=llama3

# =================================
# Database Configuration
# =================================

# MongoDB Connection String
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/cogenix

# Or MongoDB Atlas (recommended for production):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cogenix?retryWrites=true&w=majority

# =================================
# Application Settings
# =================================

# Node environment
NODE_ENV=development

# =================================
# Optional: Additional Configuration
# =================================

# Uncomment if using external AI services
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Uncomment if implementing authentication
# JWT_SECRET=your-super-secret-key-here

# Public variables (exposed to browser)
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Verify Ollama Setup

Ensure Ollama is running and has models available:

```bash
# Start Ollama (if not already running)
ollama serve

# In another terminal, verify connection
curl http://localhost:11434/api/tags

# Pull required models
ollama pull llama3      # Recommended default
ollama pull mistral     # Alternative option
ollama pull codellama   # For code-focused tasks
```

### Step 4: Verify MongoDB Connection

```bash
# If using local MongoDB, ensure it's running
mongosh

# Or test MongoDB Atlas connection
mongosh "your_mongodb_connection_string"
```

---

## 🏃 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

### Production Mode

Build and start the production server:

```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Verify Everything is Working

1. **Open the application**: Navigate to `http://localhost:3000`
2. **Check Ollama connection**: You should see available models in the UI
3. **Send a test message**: Type "Hello" and verify you get a response
4. **Check thread persistence**: Refresh the page and verify your conversation is saved

---

## 📁 Project Structure

```
cogenix/
├── public/                      # Static assets
│   ├── file.svg
│   ├── globe.svg
│   └── ...
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   ├── chat/           # Chat endpoints
│   │   │   │   └── route.ts    # POST /api/chat
│   │   │   ├── memory/         # Memory management
│   │   │   │   └── clear/
│   │   │   │       └── route.ts
│   │   │   ├── models/         # Model listing
│   │   │   │   └── route.ts
│   │   │   └── threads/        # Thread management
│   │   │       ├── route.ts    # GET/POST threads
│   │   │       └── [id]/
│   │   │           ├── route.ts
│   │   │           └── messages/
│   │   │               └── route.ts
│   │   ├── chat/               # Chat pages
│   │   │   └── [threadId]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── providers.tsx       # Context providers
│   │
│   ├── components/             # Shared components
│   │   ├── index.ts
│   │   └── SettingsModal.tsx
│   │
│   ├── config/                 # Configuration
│   │   ├── database.ts         # MongoDB connection
│   │   ├── env.ts              # Environment variables
│   │   └── index.ts
│   │
│   ├── constants/              # App constants
│   │   ├── api.ts              # API endpoints
│   │   └── index.ts
│   │
│   ├── contexts/               # React contexts
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── index.ts
│   │
│   ├── features/               # Feature modules
│   │   └── chat/               # Chat feature
│   │       ├── components/     # Chat components
│   │       │   ├── controls/
│   │       │   │   └── ModelSelector.tsx
│   │       │   ├── layout/
│   │       │   │   ├── ChatContainer.tsx
│   │       │   │   └── ChatContainerWithPersistence.tsx
│   │       │   ├── messages/
│   │       │   │   ├── ChatInput.tsx
│   │       │   │   ├── MemoryDisplay.tsx
│   │       │   │   └── MessageBubble.tsx
│   │       │   └── sidebar/
│   │       │       └── ThreadSidebar.tsx
│   │       ├── hooks/          # Custom React hooks
│   │       │   ├── useChat.ts
│   │       │   ├── useMemory.ts
│   │       │   ├── useModels.ts
│   │       │   ├── useThread.ts
│   │       │   └── useThreads.ts
│   │       ├── models/         # Data models
│   │       │   └── Thread.ts   # MongoDB Thread model
│   │       ├── services/       # API services
│   │       │   ├── chat.service.ts
│   │       │   ├── memory.service.ts
│   │       │   ├── model.service.ts
│   │       │   └── thread.service.ts
│   │       └── types/          # TypeScript types
│   │           ├── database.ts
│   │           └── index.ts
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── axios.ts            # Axios configuration
│   │   └── index.ts
│   │
│   ├── styles/                 # Global styles
│   │   └── globals.css
│   │
│   └── types/                  # Global TypeScript types
│       └── api.ts
│
├── .env.local                  # Environment variables (create from template)
├── env.template                # Environment template
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

### Architecture Overview

#### Feature-Based Architecture
The project uses a feature-based architecture where each feature (like `chat`) contains:
- **Components**: UI components specific to the feature
- **Hooks**: Custom React hooks for business logic
- **Services**: API communication layer
- **Types**: TypeScript type definitions
- **Models**: Database schemas and models

This structure provides:
- **Modularity**: Easy to add/remove features
- **Scalability**: Clear separation of concerns
- **Maintainability**: Related code stays together
- **Testability**: Isolated units for testing

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Chat Endpoints

##### Send Message
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "model": "llama3",
  "stream": true,
  "threadId": "optional-thread-id"
}
```

**Response (Streaming)**:
```
data: {"content": "Hello", "done": false}
data: {"content": "! I'm", "done": false}
data: {"content": " doing well", "done": false}
data: [DONE]
```

**Response (Non-Streaming)**:
```json
{
  "content": "Hello! I'm doing well, thank you for asking.",
  "model": "llama3",
  "context": [],
  "tokens": {
    "prompt": 10,
    "completion": 20,
    "total": 30
  }
}
```

#### 2. Model Endpoints

##### List Available Models
```http
GET /api/models
```

**Response**:
```json
{
  "models": [
    {
      "name": "llama3",
      "size": "7B",
      "modified_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### 3. Thread Endpoints

##### List Threads
```http
GET /api/threads
```

**Response**:
```json
{
  "threads": [
    {
      "_id": "thread-id",
      "title": "Conversation Title",
      "aiModel": "llama3",
      "messages": [...],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

##### Create Thread
```http
POST /api/threads
Content-Type: application/json

{
  "title": "New Conversation",
  "aiModel": "llama3"
}
```

##### Get Thread Messages
```http
GET /api/threads/:id/messages
```

##### Delete Thread
```http
DELETE /api/threads/:id
```

#### 4. Memory Endpoints

##### Clear Memory
```http
POST /api/memory/clear
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help make Cogenix better.

### Development Workflow

1. **Fork the Repository**
   ```bash
   # Click the 'Fork' button on GitHub
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/cogenix.git
   cd cogenix
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test Your Changes**
   ```bash
   # Ensure the application runs without errors
   npm run dev
   
   # Test all affected features manually
   # TODO: Add automated tests when available
   ```

6. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
   
   **Commit Message Convention:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

7. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Wait for review

### Code Style Guidelines

#### TypeScript/JavaScript
```typescript
// ✅ Good
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ✅ Use descriptive names
const fetchUserMessages = async (userId: string) => {
  // Implementation
};

// ❌ Avoid
const a = async (b: string) => {
  // Implementation
};
```

#### React Components
```tsx
// ✅ Good - Use functional components with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
};
```

#### File Organization
- One component per file
- Co-locate related files (component + styles + tests)
- Use index.ts for clean exports
- Keep files under 300 lines when possible

### Areas We Need Help

- 🧪 **Testing**: Setting up Jest and React Testing Library
- 📱 **Mobile Optimization**: Improving mobile responsiveness
- 🌐 **Internationalization**: Adding multi-language support
- ♿ **Accessibility**: Improving ARIA labels and keyboard navigation
- 📚 **Documentation**: Improving inline code documentation
- 🐛 **Bug Fixes**: Check the [Issues](https://github.com/yourusername/cogenix/issues) page
- ✨ **Features**: See [Feature Requests](https://github.com/yourusername/cogenix/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

### Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - OS: (e.g., Windows 11, macOS 14, Ubuntu 22.04)
   - Node version: (e.g., v20.10.0)
   - Browser: (e.g., Chrome 120, Firefox 121)
   - Ollama version: (e.g., 0.1.20)
6. **Screenshots**: If applicable
7. **Logs**: Console errors or server logs

### Feature Requests

We love new ideas! When suggesting features:

1. **Use Case**: Explain why this feature is needed
2. **Description**: Detailed description of the feature
3. **Mockups**: Wireframes or mockups if applicable
4. **Alternatives**: Alternative solutions you've considered

### Code Review Process

All PRs go through review:

1. **Automated Checks**: Linting and build checks (coming soon)
2. **Code Review**: At least one maintainer reviews the code
3. **Testing**: Manual testing of the feature
4. **Approval**: PR is merged after approval

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot connect to Ollama"

**Solution:**
```bash
# 1. Verify Ollama is running
curl http://localhost:11434/api/tags

# 2. If not running, start Ollama
ollama serve

# 3. Check if the port is correct in .env.local
OLLAMA_URL=http://localhost:11434
```

#### Issue: "MongoDB connection error"

**Solution:**
```bash
# 1. Check if MongoDB is running
mongosh

# 2. Verify connection string in .env.local
MONGODB_URI=mongodb://localhost:27017/cogenix

# 3. If using MongoDB Atlas, check:
#    - IP whitelist includes your IP
#    - Username and password are correct
#    - Database name is correct
```

#### Issue: "Module not found" errors

**Solution:**
```bash
# 1. Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install
```

#### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Option 1: Kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use a different port
PORT=3001 npm run dev
```

#### Issue: Model not responding or very slow

**Solution:**
- Check system resources (RAM, CPU)
- Ensure you're using an appropriate model size for your hardware
- Try a smaller model: `ollama pull llama2:7b`
- Check Ollama logs: `ollama logs`

### Getting Help

If you're still experiencing issues:

1. **Check existing issues**: [GitHub Issues](https://github.com/yourusername/cogenix/issues)
2. **Create a new issue**: Use the bug report template
3. **Join discussions**: [GitHub Discussions](https://github.com/yourusername/cogenix/discussions)

---

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cogenix)

1. **Click the button above** or go to [Vercel](https://vercel.com/new)
2. **Import your repository**
3. **Configure environment variables** in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `OLLAMA_URL`: Your hosted Ollama instance (or use a cloud provider)
   - `DEFAULT_MODEL`: Your default AI model
4. **Deploy**

**Note**: For production, you'll need:
- MongoDB Atlas (free tier available)
- Hosted Ollama instance or alternative AI backend

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**
- **Google Cloud Run**

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for platform-specific guides.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contact

**Project Maintainer**: Ashim

**Project Link**: [https://github.com/yourusername/cogenix](https://github.com/yourusername/cogenix)

**Issues**: [https://github.com/yourusername/cogenix/issues](https://github.com/yourusername/cogenix/issues)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Ollama](https://ollama.ai/) - Run large language models locally
- [MongoDB](https://www.mongodb.com/) - Database platform
- [Vercel](https://vercel.com/) - Hosting platform
- [TanStack Query](https://tanstack.com/query) - Data synchronization
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📊 Project Status

**Current Version**: 0.1.0

**Status**: Active Development

**Roadmap**:
- [ ] Add automated testing (Jest, React Testing Library)
- [ ] Implement user authentication
- [ ] Add support for multiple AI backends (OpenAI, Anthropic)
- [ ] Create Docker deployment configuration
- [ ] Add conversation export functionality
- [ ] Implement voice input/output
- [ ] Add plugin system for extensibility
- [ ] Create mobile applications (React Native)

---

<div align="center">

**Made with ❤️ by the Cogenix Team**

⭐ **Star us on GitHub** — it motivates us to keep improving!

</div>
