# Coastal Alpine Tech Email Agent - Development Guidelines

## Overview

The Coastal Alpine Tech (CAT) Email Agent is a privacy-first AI email management system built on these core principles:

- **Zero Data Retention**: In-memory processing only, no storage beyond immediate operations
- **NZ Privacy Act2020 Compliance**: All 13 Privacy Principles embedded in architecture
- **User Control**: You own and control all data access
- **Transparency**: Open-source, auditable, clear documentation
- **No Third-Party Sharing**: Data never leaves your device or Gmail (which you control)

This is not just a privacy statement-it's enforced in code through guardrails, data handlers, and preferences managers.

## Project Structure

```
src/
|-- agent/
| |-- email-agent.ts # Main agent with privacy enforcement
| `-- tools/
| `-- email-tools.ts # Tool definitions and implementations
|-- adapters/
| |-- gmail.ts # Gmail API integration
| `-- types.ts # Shared TypeScript interfaces
|-- classifiers/
| `-- spam-classifier.ts # Spam detection (no retention)
|-- security/ *** PRIVACY LAYER ***
| |-- privacy-guardrails.ts # Operation validation & audit logs
| |-- data-handler.ts # In-memory processing, auto-cleanup
| `-- preferences.ts # Local-only user preferences
|-- utils/
| `-- logger.ts # Logging (no email content)
`-- index.ts # Entry point

tests/
`-- email-agent.test.ts # Unit tests
```

## Key Patterns

### Tool Definitions
- All Claude tools are defined in `EmailTools` with proper JSON schema
- Tools return JSON stringified results for Claude parsing
- New tools should be added to `getToolDefinitions()` array

### Gmail Integration
- `GmailAdapter` is a wrapper around Google's Gmail API
- All Gmail operations go through this adapter for consistency
- Includes message parsing, label management, and email actions

### Spam Classification
- `SpamClassifier` provides configurable spam detection
- Uses keyword patterns, sender reputation, and content analysis
- Can be tuned by adding custom keywords/patterns
- **Critical**: No email content is retained after classification

### Privacy Enforcement Layer (Security Module)
- **PrivacyGuardrails**: Validates all operations before execution
 - Blocks data export, contact scraping, third-party sharing
 - Maintains content-free audit logs for compliance
 - Enforces in-memory-only processing
 - Detects and prevents privacy violations

- **DataHandler**: Manages in-memory data lifecycle
 - Volatile storage with auto-cleanup (default: 30s TTL)
 - Session data cleared between commands
 - Email content never retained
 - Hard-delete on session end

- **PreferencesManager**: Local-only user preferences
 - Block lists (sender emails only)
 - Reply templates (stored locally)
 - Unsubscribe lists (domains only)
 - Custom spam keywords
 - **NEVER synced to cloud, NEVER shared**

### Agent Interaction Flow
1. User provides natural language command
2. Agent validates command privacy (blocks exports, scraping, etc.)
3. Clears previous session data
4. Builds privacy-aware system prompt
5. Claude analyzes command and uses appropriate tools
6. Agent executes tools with guardrail validation
7. Claude formulates response (no data retained)
8. Session data auto-cleared on completion

## Code Style

- **TypeScript**: Strict mode enabled
- **Imports**: Use ES modules (`import/export`)
- **Naming**: camelCase for functions/variables, PascalCase for classes
- **Error Handling**: Always log errors with context
- **Comments**: Minimal - only explain WHY, not WHAT (names should be clear)

## Environment Setup

Required environment variables:
```
ANTHROPIC_API_KEY=your_key
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token (after OAuth)
```

## Development Commands

```bash
npm run dev # Run with ts-node
npm run build # Compile TypeScript
npm run typecheck # Check types
npm run lint # Run ESLint
npm run test # Run tests
```

## Adding New Features

### New Email Tool
1. Add tool definition to `EmailTools.getToolDefinitions()`
2. Implement execution method in `EmailTools.executeToolCall()`
3. Add unit tests in `tests/`

### New Classifier Rule
1. Add detection method to `SpamClassifier`
2. Update `classify()` method to use it
3. Test with sample emails

### New Commands
- Commands are processed naturally through Claude
- No need to hardcode commands - natural language handles it
- System prompt guides Claude's behavior

## Testing

- Run `npm run test` to execute test suite
- Use `vitest` for assertions
- Mock Gmail API for unit tests (not production data)

## Deployment

Before deploying:
1. Run `npm run typecheck` - ensure no type errors
2. Run `npm run lint` - check code style
3. Run `npm run test` - verify all tests pass
4. Update `.env` with production credentials

## Common Tasks

### Debugging Email Operations
```typescript
logger.setLevel(LogLevel.DEBUG);
// Now logs will show detailed tool execution
```

### Adding Custom Spam Patterns
```typescript
classifier.addSpamKeyword('nft');
classifier.addBlacklist('crypto-scam.com');
```

### Extending Agent Capabilities
Update `buildSystemPrompt()` in EmailAgent to guide Claude's behavior in new ways.

## Privacy & Security Patterns

### Data Lifecycle (CRITICAL)
```
Email Received -> Process in RAM -> Generate Response -> DELETE from RAM -> Nothing Remains
```

**No email ever touches disk. No email ever leaves your device (except to Gmail, which you control).**

### Guardrail Examples
```typescript
// ALLOWED [OK]
validateOperation('delete', { emailIds: [...] }) // Returns true

// BLOCKED 
validateOperation('exportEmails', {...}) // Returns false
validateOperation('scrapeContacts', {...}) // Returns false
validateOperation('forwardToThirdParty', {...}) // Returns false
```

### Data Handler Usage Pattern
```typescript
// Volatile storage - auto-cleanup after 30s
dataHandler.storeVolatile('temp_emails', emails);

// Process email with guaranteed cleanup
const result = dataHandler.processEmailTemporarily(email, (e) => {
 return classify(e); // Email is forgotten after this
});

// Always clear session data
dataHandler.clearSessionData(); // On new command
dataHandler.hardDeleteAllData(); // On user request
```

### Preferences Pattern
```typescript
// These are ALLOWED (local only, never shared)
preferencesManager.addToBlockList('spam@sender.com');
preferencesManager.addReplyTemplate('thanks', 'Thanks for reaching out!');
preferencesManager.addUnsubscribeDomain('marketing.example.com');

// These queries DO NOT hit the network
const blocked = preferencesManager.getBlockList();
```

## Future Enhancements

- [ ] Enhanced spam machine learning (still no data retention)
- [ ] Sentiment analysis (processed in-memory only)
- [ ] Template-based email responses
- [ ] Advanced local filtering rules
- [ ] Preference backup/restore (encrypted, local)
- [ ] Enhanced audit reporting (content-free)

## Performance Considerations

- Gmail API rate limits: Implement backoff for bulk operations
- Email parsing: Stream large email bodies to avoid memory overload
- In-memory processing: Session TTLs prevent unbounded memory growth
- Audit logs: Rotate weekly to maintain manageable log file size

## Security Notes - MANDATORY

- [OK] **DO**: Log operation types (delete, search, send)
- [OK] **DO**: Log operation outcomes (success, failure)
- [OK] **DO**: Log error types (connection, invalid input)
- [OK] **DO**: Validate all user inputs

- **NEVER**: Log email contents, subjects, or snippets
- **NEVER**: Store email addresses (except block list)
- **NEVER**: Log user's Gmail credentials
- **NEVER**: Log API keys or tokens
- **NEVER**: Create backups of emails
- **NEVER**: Export email data

### Compliance Verification
```bash
# Find any email content in logs
grep -r "body\|subject\|snippet\|content" logs/
# Should return: (nothing)

# Check that exportEmails is blocked
grep -r "exportEmails" src/
# Should show: Only in blockedOps list

# Verify no third-party API calls for data
grep -r "POST.*external\|fetch.*third" src/
# Should return: (nothing)
```

## CAT Compliance Checklist

Before committing any changes:
- [ ] Privacy guardrails applied to new operations
- [ ] No email content logged anywhere
- [ ] Data cleared after processing
- [ ] Preferences stored locally only
- [ ] Tests verify privacy enforcement
- [ ] Audit logs contain no sensitive data
- [ ] Code review confirms no retention
- [ ] PRIVACY_NOTICE.md updated if needed
