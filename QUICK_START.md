# Quick Start Guide - CAT Email Agent

**Get up and running in 5 minutes**

---

## Prerequisites

- **Node.js 18+** (download from [nodejs.org](https://nodejs.org))
- **Gmail OAuth credentials** (from [Google Cloud Console](https://console.cloud.google.com))
- **AI API Key** (Claude or Gemini)
  - Claude: [Anthropic](https://console.anthropic.com)
  - Gemini: [Google AI Studio](https://makersuite.google.com)

---

## Installation

### Windows

```powershell
# 1. Clone/Extract the project
git clone https://github.com/coastalalpine/cat-mail.git
cd cat-mail

# 2. Run installer
powershell -ExecutionPolicy Bypass -File install.ps1

# 3. Edit configuration
notepad .env

# 4. Run agent
npm run dev "delete spam emails"
```

### Linux/macOS

```bash
# 1. Clone/Extract the project
git clone https://github.com/coastalalpine/cat-mail.git
cd cat-mail

# 2. Make installer executable and run
chmod +x install.sh
bash install.sh

# 3. Edit configuration
nano .env

# 4. Run agent
npm run dev "delete spam emails"
```

---

## Configuration

### Step 1: Create `.env` File

```bash
cp src/.env.example .env
```

### Step 2: Add Gmail OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download and copy credentials to `.env`:

```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
```

### Step 3: Choose Your AI Service

#### Option A: Claude (Anthropic)

1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env`:

```env
AI_SERVICE=claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

#### Option B: Gemini (Google)

1. Get API key from [Google AI Studio](https://makersuite.google.com)
2. Add to `.env`:

```env
AI_SERVICE=gemini
GEMINI_API_KEY=your-gemini-key-here
```

### Step 4: Optional Configuration

```env
# Logging level
LOG_LEVEL=INFO    # DEBUG, INFO (default), WARN, ERROR

# Gmail settings
TARGET_EMAIL=your@email.com
GMAIL_REFRESH_TOKEN=optional-refresh-token
```

---

## Your First Command

```bash
# List unread emails
npm run dev "show my unread emails"

# Delete spam
npm run dev "delete all spam emails"

# Block a sender
npm run dev "block sender@domain.com"

# Send an email
npm run dev "send email to client@example.com about meeting"

# Archive old emails
npm run dev "archive emails from 2024"
```

---

## Security

### Secure Your Configuration

**Linux/macOS:**
```bash
chmod 600 .env
```

**Windows:**
- Right-click `.env` → Properties → Security
- Remove all users except yourself
- Give yourself Full Control

### Never Share Your `.env` File

- ❌ Don't commit to git
- ❌ Don't upload to cloud
- ❌ Don't share publicly
- ✅ Keep it local and secure

---

## Troubleshooting

### "Node.js not found"

**Windows:**
- Download from [nodejs.org](https://nodejs.org) and install
- Or: `choco install nodejs` (Chocolatey)

**Linux/macOS:**
- Ubuntu/Debian: `sudo apt install nodejs npm`
- Fedora: `sudo dnf install nodejs npm`
- macOS: `brew install node@20`

### "Gmail API not working"

1. Check credentials in Google Cloud Console
2. Ensure Gmail API is enabled
3. Verify OAuth app settings
4. Try regenerating credentials

### "API key invalid"

- Claude: Check Anthropic console (may need billing setup)
- Gemini: Check Google AI Studio key is valid
- Both: Make sure key is in `.env`

### "Port 3000 in use"

The app may need port 3000 for OAuth. Either:
- Close other apps using port 3000
- Or change: `GMAIL_REDIRECT_URI=http://localhost:3001/callback`

---

## Next Steps

### 1. Learn More

- **Full Guide**: [README.md](README.md)
- **Privacy**: [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md)
- **Deployment**: [DEPLOYMENT_MASTER.md](DEPLOYMENT_MASTER.md)

### 2. Explore Features

```bash
# Search emails
npm run dev "find emails from last week"

# Classify spam
npm run dev "show me spam emails from today"

# Organize
npm run dev "archive promotional emails"

# Remember for later
npm run dev "remember: thanks, I'll follow up tomorrow"
```

### 3. Setup Auto-Start (Optional)

**Linux:**
See [DEPLOYMENT_LINUX.md](DEPLOYMENT_LINUX.md) - Systemd service setup

**Windows:**
See [DEPLOYMENT_WINDOWS.md](DEPLOYMENT_WINDOWS.md) - Task Scheduler setup

---

## Commands You Can Use

### Email Operations

```bash
# Search
"find emails from [sender]"
"show me [subject]"
"list emails from [date]"

# Delete
"delete emails from [sender]"
"remove spam emails"
"delete all promotional emails"

# Archive
"archive emails from [year]"
"move old emails to archive"

# Send
"send email to [recipient] about [subject]"
"reply with [message]"

# Classify
"mark as spam"
"identify spam emails"
"show me spam"

# Block
"block [sender]"
"remember to block [domain]"

# Remember
"remember this reply: [message]"
"save this template"
```

---

## Understanding Your Agent

### What It Does ✅

- Understands natural language
- Searches your Gmail
- Deletes unwanted emails
- Marks spam
- Sends emails
- Blocks senders (locally)
- Learns your preferences

### What It Doesn't Do ❌

- Store your emails
- Collect your contacts
- Export data
- Share with third parties
- Track your behavior
- Retain information

---

## Privacy Promise

```
🔒 Your privacy is protected by default:

✅ All email processing happens in memory
✅ Nothing is saved to disk
✅ No data is shared with third parties
✅ No tracking or profiling
✅ Audit logs never contain email content
✅ NZ Privacy Act 2020 compliant
```

---

## Getting Help

### Documentation

- [README.md](README.md) - Full user guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [SECURITY.md](SECURITY.md) - Security details
- [DEPLOYMENT_MASTER.md](DEPLOYMENT_MASTER.md) - All platforms

### Support

- GitHub Issues: [Report bugs](https://github.com/coastalalpine/cat-mail/issues)
- Discussions: [Ask questions](https://github.com/coastalalpine/cat-mail/discussions)
- Security: Email `security@coastalalpine.tech`

---

## Visual Design

The project includes a beautiful liquid morphism UI design:

- View locally: Open `VISUAL_DESIGN.html` in browser
- Online: Visit [cat-mail.vercel.app](https://cat-mail.vercel.app)
- Static site: Deployed on Vercel

---

## Common Questions

**Q: Which AI service should I use?**
A: Claude is recommended (most capable), but Gemini works great too. Choose based on your API availability.

**Q: Is my email secure?**
A: Yes! Everything is processed in-memory and immediately deleted. Never stored.

**Q: Can I run this offline?**
A: Almost. You need Gmail API and AI API for best results, but local preferences work offline.

**Q: How much storage does it need?**
A: ~100 MB for the application. Email data is not stored locally.

**Q: Can I automate it?**
A: Yes! Set up Systemd (Linux) or Task Scheduler (Windows) for auto-start.

---

## What's Next?

1. ✅ Install and configure
2. ✅ Try your first command
3. ✅ Read [README.md](README.md)
4. ✅ Review [PRIVACY_NOTICE.md](PRIVACY_NOTICE.md)
5. ✅ Set up auto-start (optional)
6. ✅ Enjoy hands-free email management!

---

**Ready to streamline your email?** Start with your first command above! 🚀

*Privacy is a right. Your email stays yours.* 🔒
