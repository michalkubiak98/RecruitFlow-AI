#!/bin/bash

# Copy entire codebase to clipboard for sharing with LLMs
# Usage: ./copy-codebase.sh

echo "🚀 Copying Rolodex AI codebase to clipboard..."

# Check if required tools are installed
if ! command -v xclip &> /dev/null; then
    echo "❌ xclip not found. Installing..."
    sudo apt update && sudo apt install -y xclip
fi

if ! command -v tree &> /dev/null; then
    echo "❌ tree not found. Installing..."
    sudo apt update && sudo apt install -y tree
fi

# Create temporary file
TEMP_FILE=$(mktemp)

# Add header with dynamic project structure
cat << 'EOF' >> "$TEMP_FILE"
# 🎯 ROLODEX AI - TAURI + REACT + TYPESCRIPT CODEBASE

## 📁 PROJECT STRUCTURE:
```
EOF

# Add dynamic tree structure (excluding build folders)
echo "📋 Generating project structure..."
tree -I 'node_modules|dist|src-tauri|build|coverage|.git|.next|out' >> "$TEMP_FILE"

cat << 'EOF' >> "$TEMP_FILE"
```

## 💻 TECH STACK:
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS v4 + Lucide Icons  
- **State Management**: TanStack React Query + Custom hooks
- **Desktop**: Tauri (Rust backend)
- **AI Integration**: OpenAI API
- **Data Processing**: ExcelJS for file handling
- **Notifications**: React Hot Toast
- **Utilities**: Date-fns, UUID, clsx, tailwind-merge

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
        *.html) echo "html" ;;
        *) echo "text" ;;
    esac
}

# Change to project directory (assumes script is run from project root)
cd "$(dirname "$0")"

echo "📋 Adding configuration files..."

# Add main config files first
if [ -f "package.json" ]; then 
    echo "  ✅ package.json"
    add_file "package.json"
fi

if [ -f "README.md" ]; then 
    echo "  ✅ README.md"
    add_file "README.md"
fi

# Add other config files
config_files=(
    "tsconfig.json"
    "vite.config.ts" 
    "tailwind.config.js"
    "tailwind.config.ts"
    ".eslintrc.json"
    ".eslintrc.js"
    "prettier.config.js"
    "index.html"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        add_file "$file"
    fi
done

echo "📋 Adding global CSS files..."

# Find and add all CSS files
find . -name "*.css" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./build/*" | while read -r file; do
    if [ -f "$file" ]; then
        echo "  🎨 $file"
        add_file "$file"
    fi
done

echo "📋 Adding all TypeScript source files..."

# Find and add all TS/TSX files, excluding node_modules and build folders
find src -name "*.ts" -o -name "*.tsx" | sort | while read -r file; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
        add_file "$file"
    fi
done

echo "📋 Adding Tauri configuration..."

# Add Tauri files if they exist
tauri_files=(
    "src-tauri/tauri.conf.json"
    "src-tauri/Cargo.toml"
    "src-tauri/src/main.rs"
    "src-tauri/src/lib.rs"
)

for file in "${tauri_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ⚙️  $file"
        add_file "$file"
    fi
done

echo "📋 Adding other important files..."

# Add any other important files
other_files=(
    ".gitignore"
    ".env.example"
    ".env.local"
    "vercel.json"
    "netlify.toml"
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

## 🎯 ROLODEX AI - PROJECT OVERVIEW

### ✅ **Core Features**
- AI-powered contact management and organization
- Modern React + TypeScript architecture  
- Desktop application with Tauri framework
- Real-time data processing and search
- Professional UI with Tailwind CSS v4
- File import/export capabilities with ExcelJS

### ✅ **Development Stack**
- **Frontend**: React 18 + TypeScript + Vite for fast development
- **Styling**: Tailwind CSS v4 with modern design patterns
- **State**: TanStack React Query for server state management
- **Desktop**: Tauri for cross-platform native performance
- **AI**: OpenAI API integration for intelligent features
- **Notifications**: React Hot Toast for user feedback

### ✅ **Project Structure**
- Clean separation of concerns with organized folder structure
- TypeScript throughout for type safety
- Modern tooling with ESLint and Prettier
- Optimized build process with Vite

## 🚀 **CURRENT STATUS:**
This is a complete, modern Tauri + React + TypeScript application for AI-powered contact management and organization.

EOF

echo "📋 Copying to clipboard..."

# Copy to clipboard
cat "$TEMP_FILE" | xclip -selection clipboard

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ SUCCESS! Entire Rolodex AI codebase copied to clipboard!"
echo ""
echo "📊 SUMMARY:"
echo "   • Dynamic project structure with tree command"
echo "   • All TypeScript/TSX files included"
echo "   • Global CSS files included"
echo "   • Configuration files included"
echo "   • README and package.json included"
echo "   • Ready to paste into LLM chat"
echo ""
echo "🎯 You can now paste this into Claude, ChatGPT, or any other LLM!"
echo "   The codebase includes complete implementation details and context."
echo ""