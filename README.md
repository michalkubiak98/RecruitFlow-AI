# 🤖 Rolodex.ai - Universal AI Entity Manager

**The only entity management system that adapts to YOUR workflow**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri-blue)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 🎯 What is Rolodex.ai?

Rolodex.ai is a **universal AI-powered entity management system** that adapts to any industry, any workflow, any data structure. Unlike rigid CRM systems, Rolodex.ai learns YOUR fields, YOUR terminology, and YOUR processes.

### ⚡ Configure Once, Use Forever

- **🏗️ Dynamic Fields**: Create text, boolean, and dropdown fields on-the-fly
- **🤖 AI Adaptation**: AI automatically understands your custom configuration
- **🔍 Smart Search**: Natural language queries across all your custom fields
- **💾 Zero Vendor Lock-in**: Your data, your fields, your control
- **🚀 Any Industry**: Recruitment, sales, inventory, contacts, projects - anything

---

## 🌟 Why Rolodex.ai?

### Traditional CRMs:

❌ Fixed fields you can't change  
❌ Complex setup requiring IT teams  
❌ Industry-specific with no flexibility  
❌ Expensive per-user licensing  
❌ Cloud-only with data lock-in

### Rolodex.ai:

✅ **Completely configurable** - any fields you need  
✅ **AI-powered** - natural language everything  
✅ **Desktop native** - fast, secure, works offline  
✅ **Open source** - modify and extend freely  
✅ **Your data stays yours** - no cloud requirements

---

## 🎮 See It In Action

### For Recruitment Agencies

```
🎯 "Add Sarah developer Cork 70k life science can drive"
🔍 "Show me developers from Cork and Dublin below 80k"
📊 "Find all candidates in food science who can drive"
```

### For Sales Teams

```
🎯 "Add TechCorp hot lead enterprise 500k Q1"
🔍 "Show me hot leads in enterprise above 200k"
📊 "Find all Q1 prospects in technology sector"
```

### For Event Management

```
🎯 "Add Conference2024 confirmed 500 attendees catering"
🔍 "Show confirmed events above 200 attendees"
📊 "Find all events needing catering this month"
```

**The AI adapts to YOUR terminology and YOUR workflow!**

---

## 🚀 Quick Start

### 1. Download & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/rolodx-ai.git
cd rolodx-ai

# Install dependencies
npm install

# Start development
npm run tauri:dev
```

### 2. Configure Your Fields

1. Click the **⚙️ Settings** icon
2. Go to **Custom Fields** tab
3. Add your fields:
   - **Text**: Names, locations, descriptions
   - **Dropdown**: Industries, statuses, categories
   - **Boolean**: Yes/no questions, checkboxes

### 3. Start Managing

```
"Add John frontend developer Dublin 60k technology"
"Show me all developers in Dublin"
"Update John's salary to 70k"
```

**The AI immediately understands your configuration!**

---

## 🛠️ Key Features

### 🎨 Dynamic Configuration

- **Custom Fields**: Add unlimited text, boolean, and dropdown fields
- **Smart Validation**: Prevents conflicts and overlapping options
- **Real-time Updates**: Changes reflect instantly across the entire app
- **Export Ready**: Excel exports include all your custom fields

### 🤖 AI-Powered Everything

- **Natural Language**: "Show me hot leads above 100k in Q1"
- **Multi-value Search**: "Find people from Cork and Dublin"
- **Smart Parsing**: Understands your terminology automatically
- **Context Aware**: AI adapts to your field configuration

### 💻 Modern Desktop Experience

- **Native Performance**: Built with Tauri for speed and security
- **Offline First**: Works without internet connection
- **Cross-Platform**: Windows, macOS, and Linux support
- **Your Data**: Everything stored locally under your control

### 🔍 Advanced Search & Filtering

- **AI Chat Interface**: Ask questions in plain English
- **Visual Filters**: Point-and-click filtering by any field
- **Search Results Modal**: Detailed results with all field data
- **Export & Reports**: Generate Excel reports with custom fields

---

## 🏢 Use Cases

### 👥 Recruitment & HR

- **Custom Fields**: Skills, salary ranges, visa status, remote preference
- **AI Queries**: "Find remote developers with React skills below 80k"
- **Smart Matching**: Location preferences, skill overlaps, availability

### 💼 Sales & CRM

- **Custom Fields**: Deal size, probability, contact method, industry
- **AI Queries**: "Show hot prospects above 200k in Q4"
- **Pipeline Management**: Status tracking, follow-up reminders

### 📅 Event Management

- **Custom Fields**: Venue capacity, catering needs, equipment, budget
- **AI Queries**: "Find venues above 200 capacity with catering"
- **Resource Planning**: Equipment allocation, staffing needs

### 🏪 Inventory Management

- **Custom Fields**: SKU, supplier, reorder level, location, category
- **AI Queries**: "Show low stock items from Supplier A"
- **Stock Control**: Reorder alerts, location tracking

### 🎓 Educational Administration

- **Custom Fields**: Grade level, subjects, parent contacts, special needs
- **AI Queries**: "Find grade 3 students needing math support"
- **Student Tracking**: Progress monitoring, communication logs

### 🏥 Healthcare Administration

- **Custom Fields**: Specialties, insurance, appointment types, referrals
- **AI Queries**: "Find cardiology patients with Medicare"
- **Patient Management**: Appointment scheduling, referral tracking

---

## 📱 Screenshots

### Dynamic Settings Configuration

_Configure any fields for any industry with smart validation_

### AI Chat Interface

_Natural language queries that understand your custom fields_

### Modern Table View

_Professional data display with responsive design_

### Advanced Search & Filtering

_Point-and-click filtering with export capabilities_

---

## 🔧 Installation & Setup

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Rust** 1.70.0 or higher
- **Platform-specific requirements** (see detailed guide below)

### Development Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/rolodx-ai.git
cd rolodx-ai
npm install

# Start development server
npm run tauri:dev
```

### Production Build

```bash
# Build for your platform
npm run tauri:build

# Cross-platform builds
npm run tauri:build -- --target x86_64-pc-windows-gnu  # Windows
npm run tauri:build -- --target x86_64-apple-darwin    # macOS
npm run tauri:build -- --target x86_64-unknown-linux-gnu # Linux
```

### Environment Configuration

```bash
# Create .env file
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Dynamic Components**: Forms and displays adapt to field configuration
- **Real-time Updates**: React state management with persistence
- **Modern UI**: Tailwind CSS with responsive design
- **Type Safety**: Full TypeScript coverage with dynamic types

### Backend (Tauri + Rust)

- **Native Performance**: Desktop app with web UI
- **Secure Storage**: Local data with no cloud dependencies
- **Cross-Platform**: Single codebase for all platforms
- **Small Footprint**: Minimal resource usage

### AI Integration (OpenAI)

- **Dynamic Prompts**: Generated based on current field configuration
- **Function Calling**: Structured data manipulation through AI
- **Context Aware**: Understands field types and relationships
- **Natural Language**: Full conversational interface

---

## 🛡️ Security & Privacy

### Local-First Architecture

- **Your Data Stays Yours**: Everything stored locally on your device
- **No Cloud Dependencies**: Works completely offline
- **No Telemetry**: Zero data collection or tracking
- **Open Source**: Full transparency, audit the code yourself

### Enterprise Ready

- **Role-Based Access**: Configure user permissions (coming soon)
- **Data Encryption**: Secure local storage options (coming soon)
- **Audit Trails**: Track all data changes (coming soon)
- **Backup Integration**: Sync with your preferred backup solution

---

## 🤝 Contributing

We welcome contributions from developers who want to make entity management better for everyone!

### Development Setup

```bash
# Fork the repository
git clone https://github.com/yourusername/rolodx-ai.git
cd rolodx-ai

# Install dependencies
npm install

# Start development
npm run tauri:dev

# Run tests
npm test
npm run test:rust
```

### Areas for Contribution

- **New Field Types**: Date pickers, file uploads, rich text
- **AI Enhancements**: Local AI models, custom prompts
- **UI/UX Improvements**: Accessibility, mobile responsiveness
- **Integrations**: APIs, import/export formats
- **Documentation**: Tutorials, examples, translations

### Coding Standards

- **TypeScript**: Strict typing with comprehensive interfaces
- **React**: Functional components with hooks
- **Rust**: Safe, efficient code with proper error handling
- **Testing**: Unit tests for critical functionality

---

## 📚 Documentation

### User Guides

- [Getting Started](docs/getting-started.md)
- [Field Configuration](docs/field-configuration.md)
- [AI Chat Guide](docs/ai-chat-guide.md)
- [Import/Export](docs/import-export.md)

### Developer Docs

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Custom Field Types](docs/custom-fields.md)
- [AI Integration](docs/ai-integration.md)

### Examples

- [Recruitment Setup](examples/recruitment.md)
- [Sales CRM Setup](examples/sales-crm.md)
- [Event Management](examples/event-management.md)
- [Inventory Tracking](examples/inventory.md)

---

## 💬 Community & Support

### Get Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community chat
- **Discord Server**: Real-time community support (coming soon)
- **Documentation**: Comprehensive guides and tutorials

### Stay Updated

- **GitHub Releases**: Download the latest versions
- **Release Notes**: See what's new in each version
- **Roadmap**: Track upcoming features and improvements

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:

- ✅ **Commercial use** - Use in your business freely
- ✅ **Modification** - Customize and extend as needed
- ✅ **Distribution** - Share with others
- ✅ **Private use** - Use internally without restrictions
- ❗ **Attribution** - Keep license and copyright notices

---

## 🙏 Acknowledgments

### Built With Amazing Open Source

- **[Tauri](https://tauri.app/)** - Desktop app framework
- **[React](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[OpenAI](https://openai.com/)** - AI integration

### Inspired By

- The need for truly flexible business software
- Frustration with rigid, expensive CRM systems
- The power of AI to understand human intent
- The open source community's collaborative spirit

---

## 🚀 Transform Your Workflow Today

**Stop adapting to your software. Make your software adapt to you.**

[📥 Download Rolodex.ai](https://github.com/yourusername/rolodx-ai/releases) | [📖 Read the Docs](docs/) | [💬 Join the Community](https://github.com/yourusername/rolodx-ai/discussions)

---

_Rolodex.ai - Because every business is unique, and your software should be too._
