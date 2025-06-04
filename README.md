# 🤖 Rolodex.ai

**AI-powered contact management desktop application built with Tauri, React, and TypeScript**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-blue)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Screenshots](#-screenshots)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Environment Configuration](#-environment-configuration)
7. [Running the Application](#-running-the-application)
8. [Building for Production](#-building-for-production)
9. [Cross-Platform Building](#-cross-platform-building)
10. [Project Structure](#-project-structure)
11. [Development Workflow](#-development-workflow)
12. [Deployment](#-deployment)
13. [Troubleshooting](#-troubleshooting)
14. [Contributing](#-contributing)
15. [License](#-license)

---

## 🎯 Overview

Rolodex.ai is a modern desktop application designed to streamline contact management using artificial intelligence. Built with Tauri for native performance and React for a smooth user interface, it provides an intuitive chat-based interface for managing candidates in life science and food science industries.

### Why Rolodex.ai?

- **AI-Powered**: Natural language processing for candidate management
- **Desktop Native**: Fast, secure, and works offline
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Industry-Focused**: Specialized for life science and food science recruitment
- **Modern Stack**: Built with the latest web technologies wrapped in Rust

---

## ✨ Features

### 🤖 AI Chat Interface

- Natural language commands for candidate management
- Persistent chat history across sessions
- Smart search and filtering with AI understanding
- Delete confirmations and error handling

### 👥 Candidate Management

- Complete CRUD operations via AI commands
- Detailed candidate profiles with modal editing
- Industry-specific categorization (life science, food science)
- Notes, salary, location, and skills tracking

### 🔍 Search & Filtering

- AI-powered search with multiple criteria
- Modal results display with detailed candidate information
- Real-time filtering in sidebar
- Export capabilities to Excel format

### 💾 Persistence & Storage

- LocalStorage persistence for chat and candidates
- Auto-save functionality
- Data survives application restarts

### 🎨 UI/UX

- Dark theme with consistent styling
- Responsive design with Tailwind CSS
- Loading states and comprehensive error handling
- Toast notifications for user feedback

---

## 📱 Screenshots

_Add screenshots here showing the main interface, chat functionality, and candidate management_

---

## 🔧 Prerequisites

### For All Platforms

#### Node.js and npm

**Required Version:** Node.js 18.0.0 or higher

**Installation:**

**Windows:**

1. Download from https://nodejs.org/
2. Run the installer (.msi file)
3. Verify installation:

```cmd
node --version
npm --version
```

**macOS:**

```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian):**

```bash
# Update package index
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**Linux (CentOS/RHEL/Fedora):**

```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs npm

# Verify installation
node --version
npm --version
```

#### Rust and Cargo

**Required Version:** Rust 1.70.0 or higher

**Installation (All Platforms):**

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart your terminal or run:
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

**Windows Additional Steps:**

1. Install Microsoft C++ Build Tools
2. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
3. Install with "C++ build tools" workload

### Platform-Specific Prerequisites

#### Windows

```cmd
# Install WebView2 (usually pre-installed on Windows 10/11)
# If needed, download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

#### macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)

```bash
# Install required system dependencies
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Linux (CentOS/RHEL/Fedora)

```bash
# Install required system dependencies
sudo dnf install webkit2gtk3-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel

# For older versions, use yum instead of dnf
```

#### Linux (Arch)

```bash
# Install required system dependencies
sudo pacman -S webkit2gtk \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/michalkubiak98/Rolodex-AI.git

# Navigate to the project directory
cd Rolodex-AI

# Verify you're in the correct directory
ls -la
# You should see: src/, src-tauri/, package.json, etc.
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This will install all dependencies listed in package.json
# Including React, TypeScript, Tailwind CSS, and development tools
```

### Step 3: Install Tauri CLI

```bash
# Install Tauri CLI globally (recommended)
npm install -g @tauri-apps/cli

# Or install locally (project-specific)
npm install --save-dev @tauri-apps/cli

# Verify Tauri installation
npx tauri --version
```

### Step 4: Verify Installation

```bash
# Check all prerequisites
node --version    # Should be 18.0.0+
npm --version     # Should be 8.0.0+
rustc --version   # Should be 1.70.0+
cargo --version   # Should be 1.70.0+
npx tauri --version # Should show Tauri CLI version
```

---

## 🔑 Environment Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```bash
# Create the environment file
touch .env

# Open in your preferred editor
nano .env
# or
code .env
# or
vim .env
```

### .env File Contents

```env
# OpenAI API Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Development Configuration
NODE_ENV=development
VITE_APP_ENV=development
```

### Getting Your OpenAI API Key

1. **Sign up/Login** to OpenAI: https://platform.openai.com/
2. **Navigate** to API Keys: https://platform.openai.com/api-keys
3. **Click** "Create new secret key"
4. **Copy** the key (starts with `sk-`)
5. **Add** billing information (required for API access)
6. **Replace** `your_openai_api_key_here` in your `.env` file

### Security Notes

⚠️ **NEVER commit your `.env` file to version control**

- The `.gitignore` file already excludes `.env`
- Your API key should remain private
- Each developer needs their own API key

---

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the development server with hot reload
npm run tauri:dev

# Alternative command
npx tauri dev
```

**What happens:**

1. Vite development server starts on `http://localhost:1420`
2. React app compiles with hot reload enabled
3. Tauri desktop window opens with your app
4. Changes to code automatically reload the app

### Development Troubleshooting

**If the app doesn't start:**

```bash
# Check if ports are available
netstat -an | grep 1420

# Kill any processes using the port (Linux/macOS)
lsof -ti:1420 | xargs kill -9

# Kill any processes using the port (Windows)
netstat -ano | findstr :1420
taskkill /PID [PID_NUMBER] /F
```

**If you get Rust compilation errors:**

```bash
# Clean the Rust build cache
cd src-tauri
cargo clean
cd ..

# Try again
npm run tauri:dev
```

**If you get Node.js dependency errors:**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Building for Production

### Build for Your Current Platform

```bash
# Build the production application
npm run tauri:build

# Alternative command
npx tauri build
```

**Build Output Locations:**

**Windows:**

# Windows: src-tauri/target/release/rolodex-ai.exe

- Installer: `src-tauri/target/release/bundle/nsis/Rolodex.ai_X.X.X_x64-setup.exe`

**macOS:**

- App Bundle: `src-tauri/target/release/bundle/macos/Rolodex.ai.app`
- DMG: `src-tauri/target/release/bundle/dmg/Rolodex.ai_X.X.X_x64.dmg`

**Linux:**

- Binary: `src-tauri/target/release/rolodex-ai`
- AppImage: `src-tauri/target/release/bundle/appimage/rolodex-ai_X.X.X_amd64.AppImage`
- Deb: `src-tauri/target/release/bundle/deb/rolodex-ai_X.X.X_amd64.deb`

### Build Configuration

The build process:

1. Compiles TypeScript to JavaScript
2. Bundles React app with Vite
3. Compiles Rust backend
4. Creates platform-specific packages

---

## 🌍 Cross-Platform Building

### Building for Windows (from Linux/macOS)

```bash
# Install Windows target
rustup target add x86_64-pc-windows-gnu

# Install cross-compilation tools (Linux)
sudo apt install mingw-w64

# Install cross-compilation tools (macOS)
brew install mingw-w64

# Build for Windows
npm run tauri:build -- --target x86_64-pc-windows-gnu
```

**Note:** Cross-compilation has limitations. For full Windows features (code signing, MSI installers), build on Windows.

### Building for macOS (from Linux - Advanced)

```bash
# This requires significant setup and is not recommended
# Use GitHub Actions or a macOS machine instead
```

### Building for Linux (from Windows/macOS)

```bash
# Install Linux target
rustup target add x86_64-unknown-linux-gnu

# Build for Linux (requires Docker or VM)
npm run tauri:build -- --target x86_64-unknown-linux-gnu
```

### Recommended: GitHub Actions for Multi-Platform Builds

Create `.github/workflows/build.yml`:

```yaml
name: Build Multi-Platform

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-20.04, windows-latest, macos-latest]

    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-20.04'
        run: |
          sudo apt update
          sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Install dependencies
        run: npm install

      - name: Build app
        run: npm run tauri:build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
```

---

## 📁 Project Structure

```
rolodex-ai/
├── 📁 src/                          # React frontend source code
│   ├── 📁 components/               # React components
│   │   ├── 📁 Chat/                # Chat interface components
│   │   │   └── ChatInterface.tsx   # Main chat component
│   │   ├── 📁 Candidates/          # Candidate management components
│   │   │   ├── CandidatesSidebar.tsx
│   │   │   ├── CandidateModal.tsx
│   │   │   └── CandidatesTable.tsx
│   │   ├── 📁 Search/              # Search and filter components
│   │   │   └── SearchResultsModal.tsx
│   │   └── 📁 Layout/              # Layout components
│   │       └── MainLayout.tsx
│   ├── 📁 hooks/                    # Custom React hooks
│   │   ├── useChat.ts              # Chat state management
│   │   └── useCandidates.ts        # Candidate data management
│   ├── 📁 services/                 # Business logic and API calls
│   │   ├── 📁 ai/                  # AI service integration
│   │   │   ├── config.ts           # OpenAI configuration
│   │   │   └── parser.ts           # Natural language processing
│   │   ├── 📁 database/            # Data persistence
│   │   │   └── tauri-commands.ts   # Mock database service
│   │   └── 📁 storage/             # Local storage utilities
│   │       └── chatStorage.ts
│   ├── 📁 utils/                    # Utility functions
│   │   ├── cn.ts                   # CSS class utilities
│   │   └── export.ts               # Export functionality
│   ├── 📁 styles/                   # CSS and styling
│   │   └── globals.css             # Global styles with Tailwind
│   ├── types.ts                     # TypeScript type definitions
│   ├── App.tsx                      # Main React application
│   └── main.tsx                     # React entry point
├── 📁 src-tauri/                    # Tauri backend (Rust)
│   ├── 📁 src/                     # Rust source code
│   │   ├── lib.rs                  # Main Rust library
│   │   └── main.rs                 # Rust application entry
│   ├── tauri.conf.json             # Tauri configuration
│   ├── Cargo.toml                  # Rust dependencies
│   └── build.rs                    # Build script
├── 📁 public/                       # Static assets
├── package.json                     # Node.js dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.ts                  # Vite build configuration
├── .gitignore                      # Git ignore rules
├── .env                            # Environment variables (create this)
└── README.md                       # This file
```

### Key Files Explained

- **`src/App.tsx`**: Main React application component
- **`src-tauri/tauri.conf.json`**: Tauri app configuration (window size, permissions, etc.)
- **`src/services/ai/parser.ts`**: Core AI logic for natural language processing
- **`src/hooks/useCandidates.ts`**: State management for candidate data
- **`package.json`**: Defines npm scripts and dependencies

---

## 💻 Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run tauri:dev

# 4. Make your changes
# ... code ...

# 5. Test your changes
npm run build  # Check for TypeScript errors
npm run tauri:build  # Test production build

# 6. Commit your changes
git add .
git commit -m "feat: your feature description"
git push origin your-branch
```

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server only
npm run tauri:dev        # Start Tauri app in development mode

# Building
npm run build            # Build frontend only
npm run tauri:build      # Build complete Tauri application

# Linting and Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting errors automatically

# Tauri Commands
npm run tauri            # Access Tauri CLI
npx tauri info           # Show system info and dependencies
npx tauri dev            # Alternative development command
npx tauri build          # Alternative build command
```

### Code Style and Standards

This project uses:

- **ESLint**: For code linting
- **Prettier**: For code formatting (configure in your editor)
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling

### Recommended Editor Setup

**VS Code Extensions:**

```json
{
  "recommendations": [
    "tauri-apps.tauri-vscode",
    "rust-lang.rust-analyzer",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode"
  ]
}
```

**VS Code Settings (`.vscode/settings.json`):**

```json
{
  "rust-analyzer.linkedProjects": ["./src-tauri/Cargo.toml"],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## 🚀 Deployment

### Desktop Application Distribution

#### Windows Distribution

```bash
# Build Windows installer
npm run tauri:build

# Output: src-tauri/target/release/bundle/nsis/RecruitFlow AI_X.X.X_x64-setup.exe
# Distribute this .exe file to users
```

#### macOS Distribution

```bash
# Build macOS app
npm run tauri:build

# Output: src-tauri/target/release/bundle/dmg/RecruitFlow AI_X.X.X_x64.dmg
# Distribute this .dmg file to users
```

#### Linux Distribution

```bash
# Build Linux packages
npm run tauri:build

# Outputs:
# - AppImage: src-tauri/target/release/bundle/appimage/recruitflow-ai_X.X.X_amd64.AppImage
# - Deb package: src-tauri/target/release/bundle/deb/recruitflow-ai_X.X.X_amd64.deb
```

### Portable USB Version

For a portable version (like you built for Windows):

```bash
# Build without installer
npm run tauri:build

# Copy the raw executable
# Windows: src-tauri/target/release/recruitflow-ai.exe
# Linux: src-tauri/target/release/recruitflow-ai
# macOS: src-tauri/target/release/bundle/macos/RecruitFlow AI.app
```

### Code Signing (Optional)

For production distribution, consider code signing:

**Windows:**

- Requires Windows code signing certificate
- Configure in `tauri.conf.json` under `bundle.windows.signtool`

**macOS:**

- Requires Apple Developer account
- Configure in `tauri.conf.json` under `bundle.macOS.signing`

### Auto-Updates (Advanced)

Tauri supports auto-updates. Configure in `tauri.conf.json`:

```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://your-update-server.com/updates"]
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Command not found: tauri"

**Problem:** Tauri CLI not installed or not in PATH

**Solution:**

```bash
# Install Tauri CLI globally
npm install -g @tauri-apps/cli

# Or use npx (temporary installation)
npx tauri --version
```

#### 2. "WebView2 not found" (Windows)

**Problem:** WebView2 runtime missing on Windows

**Solutions:**

```bash
# Option 1: Download WebView2 runtime
# Go to: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

# Option 2: Bundle WebView2 with your app
# Add to tauri.conf.json:
{
  "bundle": {
    "windows": {
      "webviewInstallMode": {
        "type": "embedBootstrapper"
      }
    }
  }
}
```

#### 3. Rust Compilation Errors

**Problem:** Rust compilation fails

**Solutions:**

```bash
# Update Rust
rustup update

# Clean build cache
cd src-tauri
cargo clean
cd ..

# Check Rust version (requires 1.70.0+)
rustc --version

# Reinstall if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### 4. Node.js/npm Issues

**Problem:** npm install fails or version conflicts

**Solutions:**

```bash
# Check Node.js version (requires 18.0.0+)
node --version

# Clear npm cache
npm cache clean --force

# Delete and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Use specific Node.js version with nvm
nvm install 18
nvm use 18
```

#### 5. OpenAI API Issues

**Problem:** AI features not working

**Check:**

1. API key is correct in `.env` file
2. API key has billing enabled
3. No firewall blocking requests

**Debug:**

```bash
# Check if environment variable is loaded
echo $VITE_OPENAI_API_KEY

# Test API key manually
curl -H "Authorization: Bearer your-api-key" \
  https://api.openai.com/v1/models
```

#### 6. Build Fails on Linux

**Problem:** Missing system dependencies

**Ubuntu/Debian Solution:**

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**CentOS/RHEL/Fedora Solution:**

```bash
sudo dnf install webkit2gtk3-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

#### 7. Cross-Compilation Issues

**Problem:** Building for different platforms fails

**Solutions:**

```bash
# Install target platform
rustup target add x86_64-pc-windows-gnu

# Install cross-compilation tools (Linux to Windows)
sudo apt install mingw-w64

# Use GitHub Actions for reliable cross-compilation
# See deployment section for workflow file
```

#### 8. App Doesn't Start

**Problem:** Built app fails to launch

**Debug Steps:**

```bash
# Run from terminal to see error messages
./recruitflow-ai  # Linux
./RecruitFlow\ AI.app/Contents/MacOS/RecruitFlow\ AI  # macOS

# Check system requirements
npx tauri info

# Verify all dependencies
ldd ./recruitflow-ai  # Linux - check shared libraries
```

#### 9. Hot Reload Not Working

**Problem:** Development server doesn't refresh on changes

**Solutions:**

```bash
# Check if port 1420 is available
netstat -an | grep 1420

# Kill conflicting processes
lsof -ti:1420 | xargs kill -9  # Linux/macOS
taskkill /f /im node.exe  # Windows

# Restart development server
npm run tauri:dev
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: Development mode shows errors in terminal
2. **Tauri Documentation**: https://tauri.app/v1/guides/
3. **GitHub Issues**: Search existing issues or create a new one
4. **Discord**: Tauri community Discord server
5. **Stack Overflow**: Tag questions with `tauri` and `react`

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Setting Up for Development

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:

```bash
git clone https://github.com/YOUR-USERNAME/recruitflow-ai.git
cd recruitflow-ai
```

3. **Create a branch** for your feature:

```bash
git checkout -b feature/your-feature-name
```

4. **Install dependencies**:

```bash
npm install
```

5. **Set up environment**:

```bash
cp .env.example .env
# Add your OpenAI API key
```

6. **Start development**:

```bash
npm run tauri:dev
```

### Making Changes

1. **Follow the code style**:

   - Use TypeScript for type safety
   - Follow ESLint rules
   - Use Tailwind CSS for styling
   - Add comments for complex logic

2. **Test your changes**:

   - Test in development mode
   - Test production build
   - Test on multiple platforms if possible

3. **Commit your changes**:

```bash
git add .
git commit -m "feat: add new feature description"
```

### Submitting a Pull Request

1. **Push to your fork**:

```bash
git push origin feature/your-feature-name
```

2. **Create Pull Request** on GitHub with:
   - Clear description of changes
   - Screenshots if UI changes
   - Testing instructions

### Coding Standards

- **TypeScript**: Use proper types, avoid `any`
- **Components**: Keep components small and focused
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for functions
- **Git**: Use conventional commit messages

### Areas for Contribution

- **Features**: New AI capabilities, UI improvements
- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve README, add code comments
- **Testing**: Add unit tests, integration tests
- **Performance**: Optimize bundle size, runtime performance
- **Accessibility**: Improve keyboard navigation, screen readers

---

## 🙏 Acknowledgments

- **Tauri Team**: For the amazing desktop app framework
- **React Team**: For the robust UI library
- **OpenAI**: For the powerful AI API
- **Tailwind CSS**: For the utility-first CSS framework
- **Contributors**: Everyone who helps improve this project

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❗ License and copyright notice required

---

## 📞 Support

- **Documentation**: This README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/michalkubiak98/Rolodex-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/michalkubiak98/Rolodex-AI/discussions)

---

**Made with ❤️ by the Rolodex.ai team**
