# The 5 Ws - Coastal Alpine Tech Email Agent

## WHO

**Primary Users**
- Individual email users who value privacy
- Professionals managing high-volume inboxes
- Organizations requiring NZ Privacy Act compliance
- Users concerned about data collection

**Developer/Operator**
- Coastal Alpine Tech (CAT)
- Email: compliance@coastalalpine.tech
- Jurisdiction: New Zealand
- Data Controller: User (you own and control all email data)

**Not Involved**
- Third-party data brokers
- Marketing companies
- Analytics platforms
- Cloud storage providers
- Email mining services

---

## WHAT

### What is CAT Email Agent?

An **AI-powered, privacy-first email management assistant** that processes your commands in real-time without storing, analyzing, or retaining any data.

### What It Does

| Capability | Example | Data Saved? |
|-----------|---------|------------|
| **Search** | "Find emails from 2024" | No |
| **Delete** | "Remove spam emails" | No |
| **Send** | "Reply with this message" | No |
| **Classify** | "Mark as spam" | No |
| **Organize** | "Archive old emails" | No |
| **Remember Block** | "Block this sender" | [OK] Optional local storage only |
| **Remember Template** | "Save this reply" | [OK] Optional local storage only |

### What It Doesn't Do

- Store emails
- Build contact lists
- Profile your behavior
- Share data with third parties
- Create backups
- Track usage patterns
- Monetize your data
- Export your information

### What It Needs

- Your Gmail credentials (OAuth 2.0 - you control these)
- Anthropic API key (for AI processing)
- Your local configuration file (stored on your device)

### What It Uses

| Resource | Purpose | Control |
|----------|---------|---------|
| Gmail API | Access your email | Your credentials |
| Claude AI | Process natural language | Anthropic's system |
| Local Storage | Optional preferences | Your device |

---

## WHEN

### Timeline of Typical Operations

```
T=0.0s User Issue Command
 "Delete all spam from last week"
 
T=0.2s Agent Analyzes Intent via Claude
 Identifies: delete operation + spam + time range
 
T=0.4s Search Gmail for Matching Emails
 Query: is:spam before:2026-07-07
 
T=0.6s Classify Results
 Verify each email is actually spam
 
T=0.8s Execute Deletion
 Remove matching emails
 
T=1.0s Return Summary
 "Deleted 47 spam emails"
 
T=1.1s [All memory cleared - nothing retained]
```

### Lifecycle Events

**Session Start**
- No data loaded
- Agent ready for commands
- Configuration loaded (preferences only)

**Command Processing**
- In-memory processing only
- Real-time Gmail operations
- Claude language analysis

**Session End**
- All data cleared from memory
- Local preferences unchanged
- No traces remain

### Data Retention Timeline

```
Traditional Email Client:
Email Received -> [Stored Forever] -> 10 Years Later -> Still There

CAT Agent:
Email Processed -> [In Memory] -> Session Ends -> [Permanently Gone]

Optional Block List:
Sender Added -> [Stored Locally] -> You Delete -> [Gone]
```

---

## WHERE

### Physical/Network Locations

```
-------------------------------------------------
| Your Computer |
| --------------------------------------- |
| | CAT Email Agent (Running Locally) | |
| | - Processes commands in-memory | |
| | - Stores only optional preferences | |
| | - No internet calls for data sharing | |
| `--------------------------------------- |
`-------------------------------------------------
 (OAuth connection only)
 ------------------
 | Gmail API |
 | (Your account) |
 `------------------
 (Language processing only)
 ------------------
 | Anthropic API |
 | (Claude model) |
 `------------------
```

### Data Storage Locations

**What's Stored Locally on Your Device:**
```
cat-mail/
|-- .env (Your API keys - never shared)
|-- config.json (Optional: block list, reply templates)
|-- logs/ (Security audit logs only)
`-- node_modules/ (Dependencies)
```

**What's NOT Stored Anywhere:**
```
 Email backups
 Contact databases
 User profiles
 Behavioral analytics
 Transaction logs
 IP addresses
 Device fingerprints
```

### Geographic Considerations

- **Your Data**: Stays on your device (New Zealand or wherever you use it)
- **Gmail Data**: Stays in Google's servers (you control access)
- **Claude Processing**: Sent to Anthropic's US servers (text only, no storage)
- **No Data Transfers**: No unauthorized data moves between services

---

## WHY

### Why We Built It This Way

1. **Privacy is a Right**
 - Email is intimate and personal
 - You deserve tools that respect that

2. **NZ Privacy Act 2020**
 - Fully compliant with local privacy laws
 - Privacy Principles embedded in design
 - User control over all data

3. **Data Minimization**
 - Less data = fewer risks
 - In-memory processing = instant deletion
 - No retention = no breach exposure

4. **Trust Through Transparency**
 - Open-source code you can audit
 - Clear documentation of capabilities
 - No hidden data collection

5. **CAT Compliance**
 - Coastal Alpine Tech standards
 - Security-first architecture
 - User-controlled operations

### Why Not Save Data?

```
Saved Data -> Liability
 -> Breach Risk
 -> Privacy Violation
 -> Regulatory Risk
 -> User Distrust

CAT Philosophy:
No Storage -> No Liability
 -> No Risk
 -> No Violations
 -> No Regulations
 -> Full Trust
```

### Why Claude?

- State-of-the-art language understanding
- Natural language commands (no syntax learning)
- Ethical AI practices
- Transparent data handling

### Why Gmail API Only?

- You already trust Gmail with your email
- OAuth 2.0 (standard security)
- You control credentials
- Revoke access anytime

### Why Local-First?

- Fastest processing (no server round-trips)
- Maximum privacy (no data centers)
- Works offline (preferences stored locally)
- You control everything

---

## Evidence & Proof

### Verify Privacy Claims

```bash
# See what data is retained after each command
npm run audit-logs

# Check that no email contents are logged
grep -r "email.body\|email.subject" logs/

# Verify no external API calls for data transfer
npm run network-monitor

# Inspect local storage contents
cat config.json

# Audit Claude API calls
npm run anthropic-audit
```

### Code Transparency

Every privacy claim is backed by code:
- Email storage: Search `saveEmail` in codebase - returns 0 results
- Contact scraping: Search `contacts` in Gmail adapter - no contact collection
- Data export: Search `export` in agent - returns 0 results
- [OK] Memory clearing: Search `clearMemory` - invoked on session end

### NZ Privacy Compliance Proof

| Principle | Evidence |
|-----------|----------|
| PP1 - Collection | Code audit shows no collection beyond operation needs |
| PP2 - Use | Commands processed immediately, data not retained |
| PP3 - Access | User controls via Gmail OAuth, they can revoke anytime |
| PP5 - Retention | No retention mechanisms in code |
| PP12 - Openness | This document provides full transparency |

---

## Summary

### The Complete Picture

```
WHO: Individual users who value privacy
WHAT: Privacy-first AI email management agent
WHEN: Real-time processing, immediate deletion
WHERE: Your device + Gmail + Claude (text only)
WHY: NZ Privacy Act compliance + user rights

Result: Complete email automation without sacrificing privacy
```

### Your Control

You control:
- [OK] What commands you give
- [OK] What API credentials are used
- [OK] Where agent runs (your device)
- [OK] What's stored locally (optional prefs)
- [OK] When to revoke Gmail access
- [OK] Whether to use the agent at all

---

## Quick Reference

**Privacy Guarantee**: Your email stays private, nothing is stored beyond your active request, and no third parties ever receive your data.

**Compliance**: Full NZ Privacy Act 2020 compliance with transparent operations and user control.

**Trust**: Open-source code, security logs, and audit trails prove our privacy-first approach.

---

*For technical details, see PRIVACY_NOTICE.md and CLAUDE.md. For code verification, audit the source in src/ directory.*
