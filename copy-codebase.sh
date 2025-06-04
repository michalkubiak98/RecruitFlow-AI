#!/bin/bash

# Copy entire codebase to clipboard for sharing with LLMs
# Usage: ./copy-codebase.sh

echo "🚀 Copying RecruitFlow codebase to clipboard..."

# Check if xclip is installed
if ! command -v xclip &> /dev/null; then
    echo "❌ xclip not found. Installing..."
    sudo apt update && sudo apt install -y xclip
fi

# Create temporary file
TEMP_FILE=$(mktemp)

# Add header
cat << 'EOF' >> "$TEMP_FILE"
# 🎯 RECRUITFLOW - TAURI + REACT + TYPESCRIPT CODEBASE

## 📁 PROJECT STRUCTURE:
```
recruitflow/
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatInterface.tsx
│   │   ├── Candidates/
│   │   │   ├── CandidatesSidebar.tsx
│   │   │   ├── CandidateModal.tsx
│   │   ├── Search/
│   │   │   ├── SearchResultsModal.tsx
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useCandidates.ts
│   ├── services/
│   │   ├── ai.ts
│   │   ├── database/
│   │   │   ├── tauri-commands.ts
│   │   ├── storage/
│   │   │   ├── chatStorage.ts
│   ├── utils/
│   │   ├── animations.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
├── src-tauri/
│   ├── tauri.conf.json
│   ├── Cargo.toml
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 💻 TECH STACK:
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Framer Motion + Lucide Icons
- **State**: Custom React hooks + Local storage persistence
- **Desktop**: Tauri (Rust backend)
- **AI Integration**: OpenAI-style API calls
- **Persistence**: LocalStorage with auto-save

---

EOF

# Function to add file with proper formatting
add_file() {
    local file_path="$1"
    local display_path="${file_path#./}"
    
    echo "" >> "$TEMP_FILE"
    echo "## 📄 \`$display_path\`" >> "$TEMP_FILE"
    echo "\`\`\`$(get_language "$file_path")" >> "$TEMP_FILE"
    cat "$file_path" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "\`\`\`" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
}

# Function to determine language for syntax highlighting
get_language() {
    case "$1" in
        *.tsx) echo "tsx" ;;
        *.ts) echo "typescript" ;;
        *.js) echo "javascript" ;;
        *.jsx) echo "jsx" ;;
        *.json) echo "json" ;;
        *.toml) echo "toml" ;;
        *.rs) echo "rust" ;;
        *.css) echo "css" ;;
        *.md) echo "markdown" ;;
        *) echo "text" ;;
    esac
}

# Change to project directory (assumes script is run from project root)
cd "$(dirname "$0")"

echo "📋 Adding configuration files..."

# Add main config files
if [ -f "package.json" ]; then add_file "package.json"; fi
if [ -f "tsconfig.json" ]; then add_file "tsconfig.json"; fi
if [ -f "vite.config.ts" ]; then add_file "vite.config.ts"; fi
if [ -f "tailwind.config.js" ]; then add_file "tailwind.config.js"; fi

echo "📋 Adding Tauri configuration..."

# Add Tauri files
if [ -f "src-tauri/tauri.conf.json" ]; then add_file "src-tauri/tauri.conf.json"; fi
if [ -f "src-tauri/Cargo.toml" ]; then add_file "src-tauri/Cargo.toml"; fi

echo "📋 Adding TypeScript source files..."

# Add all TypeScript/TSX files in order of importance
important_files=(
    "src/types.ts"
    "src/main.tsx"
    "src/App.tsx"
    "src/components/Layout/MainLayout.tsx"
    "src/components/Chat/ChatInterface.tsx"
    "src/components/Candidates/CandidatesSidebar.tsx"
    "src/components/Candidates/CandidateModal.tsx"
    "src/components/Search/SearchResultsModal.tsx"
    "src/hooks/useChat.ts"
    "src/hooks/useCandidates.ts"
    "src/services/ai.ts"
    "src/services/database/tauri-commands.ts"
    "src/services/storage/chatStorage.ts"
    "src/utils/animations.ts"
)

# Add important files first
for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        add_file "$file"
    fi
done

echo "📋 Adding any remaining TypeScript files..."

# Find and add any other TS/TSX files we might have missed
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    # Check if file wasn't already added
    file_added=false
    for important_file in "${important_files[@]}"; do
        if [ "$file" = "$important_file" ]; then
            file_added=true
            break
        fi
    done
    
    if [ "$file_added" = false ]; then
        echo "  ➕ $file"
        add_file "$file"
    fi
done

echo "📋 Adding CSS files..."

# Add any CSS files
find src -name "*.css" | while read -r file; do
    if [ -f "$file" ]; then
        echo "  🎨 $file"
        add_file "$file"
    fi
done

echo "📋 Adding other important files..."

# Add any other important files
other_files=(
    "index.html"
    "README.md"
    ".gitignore"
)

for file in "${other_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  📄 $file"
        add_file "$file"
    fi
done

# Add footer
cat << 'EOF' >> "$TEMP_FILE"

---

## 🎯 KEY FEATURES IMPLEMENTED:

### ✅ **AI Chat Interface**
- Natural language processing for candidate management
- Persistent chat history across app sessions
- Real-time search and filtering
- Delete confirmations and error handling

### ✅ **Candidate Management**
- CRUD operations via AI commands
- Detailed candidate profiles with modal editing
- Industry-specific categorization (life science, food science)
- Notes, salary, location, and skills tracking

### ✅ **Search & Filtering**
- AI-powered search with multiple criteria
- Modal results display with candidate details
- Real-time filtering in sidebar

### ✅ **Persistence & Storage**
- LocalStorage persistence for chat and candidates
- Auto-save functionality
- Data survives app restarts

### ✅ **UI/UX Polish**
- Smooth Framer Motion animations
- Dark theme with consistent styling
- Responsive design with Tailwind CSS
- Loading states and error handling
- Toast notifications for user feedback

### ✅ **Desktop Integration**
- Tauri-based desktop application
- Cross-platform compatibility
- Native performance with web technologies

## 🚀 **CURRENT STATUS:**
- Fully functional AI chat interface
- Complete candidate management system
- Persistent data storage
- Polished animations and UI
- Ready for production deployment

This is a complete, working Tauri + React + TypeScript application for AI-powered candidate management.

EOF

echo "📋 Copying to clipboard..."

# Copy to clipboard
cat "$TEMP_FILE" | xclip -selection clipboard

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ SUCCESS! Entire codebase copied to clipboard!"
echo ""
echo "📊 SUMMARY:"
echo "   • All TypeScript/TSX files included"
echo "   • Configuration files included"
echo "   • Folder structure documented"
echo "   • Ready to paste into LLM chat"
echo ""
echo "🎯 You can now paste this into Claude, ChatGPT, or any other LLM!"
echo "   The codebase includes complete implementation details and context."
echo ""