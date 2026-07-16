# Privacy Notice - Coastal Alpine Tech Email Agent

**Effective Date:** July 14, 2026

## Executive Summary

The Coastal Alpine Tech (CAT) Email Agent is designed with **privacy-by-default** principles. We do **NOT** collect, store, or retain any personal information beyond what is necessary for immediate email operations you explicitly request.

---

## 1. What We Do NOT Do

- **No Email Storage**: We do not save email contents, subjects, or metadata
- **No Contact Collection**: We do not build or maintain contact lists
- **No Data Retention**: Information is processed in-memory and immediately discarded after operation
- **No Third-Party Sharing**: Your data is never shared with external services
- **No Profiling**: We do not analyze your email patterns for marketing or profiling
- **No Tracking**: We do not track your email behavior
- **No Cookies/Identifiers**: No persistent identifiers are stored

---

## 2. What We Do (In-Memory Operations Only)

The Agent processes information **only during your active request** for:

| Operation | Data Used | Stored After? | Purpose |
|-----------|-----------|---------------|---------|
| Search emails | Query string | No | Find matching emails |
| Read email | Email content | No | Display/analyze for your request |
| Delete email | Email ID | No | Execute deletion |
| Classify spam | Email content | No | Real-time classification |
| Send email | Recipient, subject, body | No | Delivery only |
| Block sender | Sender email address | [OK] Optional* | Only if you request "remember" |
| Reply template | Template content | [OK] Optional* | Only if you request "remember" |

*Only stored locally in your configuration if **explicitly requested** by you.

---

## 3. Compliance with NZ Privacy Act 2020

### Privacy Principles Compliance

| Principle | Implementation |
|-----------|-----------------|
| **PP1: Collection** | No collection beyond immediate operation needs |
| **PP2: Use** | Data used only for the operation you request |
| **PP3: Access** | You control all email access via your Gmail credentials |
| **PP4: Accuracy** | No data retained to become inaccurate |
| **PP5: Retention** | No retention-processed in-memory only |
| **PP6: Information** | Full disclosure in this notice |
| **PP7: Unique Identifiers** | No unique identifiers created |
| **PP8: Individual Participation** | You control all inputs and operations |
| **PP9: Individual Participation - Access** | You access email through Gmail directly |
| **PP10: Correction of Personal Info** | Not applicable-no personal info retained |
| **PP11: Accuracy & Safety** | Data accuracy maintained via pass-through only |
| **PP12: Openness** | Full transparency in this notice |
| **PP13: Information Accuracy** | No inaccurate data can accumulate |

---

## 4. Data Flow Architecture

```
Your Email Request
 
 CAT Agent (In-Memory)
 
 Gmail API (Your Credentials)
 
 Your Gmail Account
 
 Agent Response
 
 [Memory Cleared]
```

**Key Principle**: Data enters, is processed, exits. No copies. No storage.

---

## 5. What You Can Request (Safe Operations)

### Safe Memory Operations (Optional Storage)

If you explicitly ask, we can remember:

1. **Block List**: "Remember to block sender@spam.com"
 - Stores only sender email addresses
 - Used only for future delete/spam operations
 - Stored locally in your configuration

2. **Reply Templates**: "Remember this reply message"
 - Stores template text only
 - No recipient information
 - Stored locally in your configuration

3. **Unsubscribe List**: "Remember to unsubscribe from this domain"
 - Stores domain addresses only
 - Used for future unsubscribe operations
 - Stored locally in your configuration

**All stored data is encrypted and stored locally on your device only.**

---

## 6. Technical Security Guardrails

### Built-in Protections

```typescript
// Example guardrails enforced in code:

 BLOCKED:
- Exporting email lists
- Creating backups of emails
- Forwarding emails to external services
- Scraping contact information
- Building recipient databases
- Storing authentication tokens
- Creating email archives

[OK] ALLOWED:
- Reading email for immediate processing
- Deleting emails you request
- Sending emails on your behalf
- Searching for emails
- Classifying spam in real-time
```

### Audit Logging (Security Only)

We maintain security logs that contain:
- [OK] Timestamp of operations
- [OK] Type of operation (delete, send, search)
- [OK] Operation success/failure status
- **Never**: Email content, sender/recipient names, email subjects

Logs are stored locally and rotated weekly.

---

## 7. Your Rights Under NZ Privacy Act

You have the right to:

1. **Request What We Hold**: Ask what data is stored (answer: minimal to none)
2. **Request Access**: Review any stored preference lists
3. **Request Deletion**: Delete any stored preferences
4. **Request Correction**: Update stored preferences
5. **Complaint**: Contact Privacy Commissioner if concerned

**Contact:** compliance@coastalalpine.tech

---

## 8. Email Credentials & Authentication

### What We Never Store

```
 Gmail Refresh Tokens (except for OAuth session)
 Email Passwords
 API Keys (only in your environment)
 Session Information
 Device Identifiers
```

### What Stays in Your Control

```
[OK] Your Gmail Account
[OK] Your OAuth Tokens (refresh locally, never sent to us)
[OK] Your Environment Variables
[OK] Your API Credentials
```

---

## 9. Third-Party Services

### External Integrations

| Service | Access | Data Shared | Purpose |
|---------|--------|-------------|---------|
| **Gmail API** | Direct (Your Credentials) | None | Email operations |
| **Anthropic Claude** | API Call Only | Question text only | Language processing |
| **Telemetry** | None | None | We don't use telemetry |

**Important**: Claude API processes your question/command but does NOT store it. See Anthropic's [Privacy Policy](https://www.anthropic.com/privacy).

---

## 10. Changes to This Notice

We will notify you of material changes to this privacy notice by:
- Updating the version date
- Committing changes to the repository
- No email notifications (we don't have your email address)

**Current Version**: 1.0 (July 14, 2026)

---

## 11. CAT Compliance Statement

Coastal Alpine Tech (CAT) operates under strict data minimization principles:

[OK] **Data Minimization**: Only process what's necessary 
[OK] **Privacy by Design**: Privacy embedded in architecture 
[OK] **Transparent Operations**: Clear about what we do/don't do 
[OK] **User Control**: You control all data operations 
[OK] **Local Processing**: Data stays on your device 
[OK] **No Monetization**: No selling or trading data 
[OK] **Ephemeral Design**: Delete-by-default architecture 

---

## 12. Questions?

If you have privacy concerns or questions:

1. **Check CLAUDE.md** - Technical implementation details
2. **Review Code** - Full transparency in source code
3. **Contact** - compliance@coastalalpine.tech

We believe privacy is a right, not a feature.

---

## Appendix A: What "In-Memory" Means

```
Traditional Email Clients:
Email -> Storage -> Retrieve -> Display -> Store

CAT Agent (In-Memory):
Email -> Process -> Display -> [Immediate Deletion]
 
 Stays RAM
 
 Lost on Agent Exit
```

No hard disk. No database. No persistence.

---

## Appendix B: Operation Safety Examples

```
SAFE [OK]
"Delete all emails from SEEK.COM"
-> Searches, finds emails, deletes, returns count
-> No information retained

"Show me unread emails"
-> Lists subject lines only during response
-> Immediately forgotten

"Send reply: Looking forward to meeting"
-> Composes and sends message
-> Text not stored (except in Gmail sent folder, your choice)

UNSAFE (Agent Refuses)
"Save all my email addresses"
-> BLOCKED - No contact scraping

"Export my emails to CSV"
-> BLOCKED - No data export

"Forward emails to external service"
-> BLOCKED - No third-party sharing

"Remember all senders from last month"
-> BLOCKED - No mass data retention
```

---

## Document Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-14 | Initial privacy notice, NZ Privacy Act alignment |

**Last Updated**: July 14, 2026

---

*This privacy notice is aligned with the Personal Information Protection Principles of the Privacy Act 2020 (New Zealand) and reflects the privacy-first design of the Coastal Alpine Tech Email Agent.*
