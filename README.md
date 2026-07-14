# 🔒 Coastal Alpine Tech Email Agent

**🔐 Privacy-First | 🧠 AI-Powered | ⚡ Security-Hardened | 📧 Email Management**

> 🎯 NZ Privacy Act 2020 Compliant | ✅ Zero Data Retention | 🚀 Production Ready

**🌐 [View Landing Page on Vercel](https://catmailagent.vercel.app) | 📖 [Documentation](#-documentation) | 🚀 [Quick Start](#-quick-start)**

---

## 🚨 The Problem We're Solving

### ❌ Traditional Email Management is Broken

**Privacy Nightmare:**
- 📊 Your email client stores **everything** - forever
- 👀 Companies track your email patterns for profit
- 🔗 Third-party services get access to your inbox
- 📱 No control over what's collected or retained
- 🤝 Your data gets sold or "anonymized" for research

**Security Risk:**
- 🔓 Centralized storage = centralized target for hackers
- 🔑 Weak password management puts you at risk
- 📧 Spam and phishing emails flood your inbox
- 🗑️ No way to permanently delete sensitive emails
- 🚫 Can't control who sees your communications

**Inefficiency:**
- 🔍 Manual spam filtering is exhausting
- 📤 Repetitive email tasks waste hours
- 🎯 No natural language commands
- 📋 Complex folder structures and rules
- ⏰ No automation without coding

### ✅ Our Solution

**CAT Email Agent solves these problems:**

| Problem | Solution |
|---------|----------|
| **Privacy nightmare** | 🔒 Zero data retention - in-memory only |
| **Data tracking** | 🚫 No profiling, no behavioral analysis |
| **Third-party sharing** | 🛡️ Blocked by design - never shared |
| **No control** | 👤 You control everything via OAuth |
| **Security risk** | ✅ Fully encrypted, validated inputs |
| **Manual spam** | 🤖 AI-powered automatic classification |
| **Repetitive tasks** | ⚡ Natural language automation |
| **Complex setup** | 🚀 5-minute installation |
| **No transparency** | 📖 Open source, fully auditable |
| **No compliance** | 🎯 NZ Privacy Act 2020 compliant |

---

## 🎯 How It Works

```
Your Email Command (Natural Language)
    ↓
🔒 Privacy Validation (Block dangerous operations)
    ↓
🧠 Claude AI or Google Gemini (Understand intent)
    ↓
📧 Gmail API (Your credentials only)
    ↓
✅ Execute Operation (Search, delete, send, etc.)
    ↓
🧹 Auto-Cleanup (All data immediately deleted)
    ↓
🎯 Result (Your email stays yours)
```

**Key Guarantee**: Data enters → is processed → exits → memory cleared. ✅ No copies. No storage. No sharing.

---

An intelligent, privacy-focused AI email agent for managing your inbox. The Coastal Alpine Tech (CAT) Email Agent understands natural language commands, automatically filters spam, and keeps your email organized—**without ever storing, retaining, or sharing your data**.

## 🎯 Core Philosophy

**No Data Collection. No Storage. No Third Parties.**

Every operation is processed in-memory and immediately forgotten. Your email stays yours.

## ✨ Features

- **Natural Language Commands**: "Delete all emails from SEEK.COM" or "Block this sender"
- **Intelligent Spam Detection**: Real-time spam classification without retention
- **Privacy-First Operations**: Read, delete, archive—all processed in-memory
- **Optional Local Preferences**: Remember block lists, reply templates (stored locally only)
- **Conversational AI**: Clear, concise English responses with professional tone
- **NZ Privacy Act 2020 Compliant**: Full alignment with all 13 Privacy Principles
- **Transparent Operations**: Audit logs, no email content stored, user-controlled

## 🔐 Privacy Guarantees

✅ **No Email Storage** - Content processed in-memory only  
✅ **No Contact Scraping** - Addresses never collected or exported  
✅ **No Data Retention** - Information deleted after operation  
✅ **No Third-Party Sharing** - Data stays with you  
✅ **No Tracking/Profiling** - No behavioral analysis  
✅ **No Monetization** - Your data is never sold  
✅ **Full Transparency** - Audit logs, source code, clear policies  

**Read the full privacy guarantees in [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md)**

## 📋 What It Does vs. Doesn't Do

| Operation | Supported | Data Stored? |
|-----------|-----------|-------------|
| Search emails | ✅ Yes | ❌ No |
| Delete emails | ✅ Yes | ❌ No |
| Send emails | ✅ Yes | ❌ No |
| Mark as spam | ✅ Yes | ❌ No |
| Archive emails | ✅ Yes | ❌ No |
| Remember block list | ✅ Yes* | ✅ Local only |
| Remember reply template | ✅ Yes* | ✅ Local only |
| **Export emails** | ❌ No | N/A |
| **Backup emails** | ❌ No | N/A |
| **Scrape contacts** | ❌ No | N/A |
| **Share with 3rd party** | ❌ No | N/A |

*Stored only on your device, never transmitted or shared

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Gmail API credentials (OAuth 2.0)
- Anthropic API key

### Installation

```bash
git clone <repo-url>
cd cat-mail
npm install
```

### Configuration

1. Create a `.env` file:

```env
ANTHROPIC_API_KEY=your_api_key_here
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
```

2. Set up Gmail OAuth 2.0 credentials via [Google Cloud Console](https://console.cloud.google.com)

### Usage Examples

```bash
# Search and delete spam
npm run dev "delete all spam emails from last week"

# Block a sender
npm run dev "block emails from promotions@store.com"

# Send an email
npm run dev "send email to client@example.com about the meeting"

# Organize by date
npm run dev "archive emails older than 6 months"

# Remember a reply template
npm run dev "remember this reply: Thanks, I'll get back to you soon"
```

## 🏗️ Architecture

- **Email Agent**: Claude-powered orchestrator with privacy guardrails
- **Privacy Guardrails**: Enforcement layer preventing data collection
- **Data Handler**: In-memory processing with automatic cleanup
- **Gmail Adapter**: OAuth 2.0 interface to your email
- **Spam Classifier**: Real-time detection without data retention
- **Preferences Manager**: Local-only user preferences storage

## 🔒 Security & Compliance

**Built-in Protections:**
- ✅ In-memory processing only
- ✅ Auto-cleanup on session end
- ✅ No email content in logs
- ✅ Audit trail (operations only, no content)
- ✅ Privacy-first system prompts
- ✅ Blocked dangerous operations

**Legal Compliance:**
- ✅ NZ Privacy Act 2020 (All 13 Principles)
- ✅ CAT Compliance Standards
- ✅ Data Minimization Principles
- ✅ GDPR-adjacent protections

## 📖 Documentation

- **[PRIVACY_NOTICE.md](PRIVACY_NOTICE.md)** - Full privacy policy (NZ Privacy Act aligned)
- **[FIVE_WS.md](FIVE_WS.md)** - Who, What, When, Where, Why explained
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines and architecture

## 💻 Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test

# Build for production
npm run build

# Run with debugging
npm run dev "your command here"
```

## 📁 Project Structure

```
cat-mail/
├── src/
│   ├── index.ts                          # Entry point
│   ├── agent/
│   │   ├── email-agent.ts               # Main agent with privacy controls
│   │   └── tools/email-tools.ts         # Tool definitions
│   ├── adapters/
│   │   ├── gmail.ts                     # Gmail API wrapper
│   │   └── types.ts                     # TypeScript interfaces
│   ├── classifiers/
│   │   └── spam-classifier.ts           # Spam detection
│   ├── security/
│   │   ├── privacy-guardrails.ts        # Privacy enforcement
│   │   ├── data-handler.ts              # In-memory processing
│   │   └── preferences.ts               # Local preferences
│   └── utils/
│       └── logger.ts                    # Logging (no content)
├── tests/
│   └── email-agent.test.ts
├── PRIVACY_NOTICE.md                    # Privacy policy
├── FIVE_WS.md                           # 5 Ws framework
├── CLAUDE.md                            # Development guide
├── .env.example
├── package.json
└── README.md (this file)
```

## ✋ What We Don't Do

```
❌ Store emails
❌ Save contact lists
❌ Export data
❌ Create backups
❌ Track behavior
❌ Profile users
❌ Share with third parties
❌ Monetize data
❌ Store authentication tokens
❌ Retain conversation history
```

## 🆘 Privacy Questions?

1. **Read**: [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md) for complete policy
2. **Understand**: [FIVE_WS.md](FIVE_WS.md) for the full picture
3. **Verify**: Check the source code in `src/security/` for enforcement
4. **Contact**: compliance@coastalalpine.tech

## 📜 License

MIT

---

**Coastal Alpine Tech** | Privacy is a Right, Not a Feature | [View Privacy Policy](PRIVACY_NOTICE.md)
