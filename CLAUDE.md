# CAT Mail - Project Guidelines

## Overview

CAT Mail is an AI-powered email management agent that uses Claude to understand natural language commands and automate email operations. It reads, writes, deletes emails, and handles spam filtering intelligently.

## Project Structure

```
src/
├── agent/
│   ├── email-agent.ts       # Main agent orchestrator
│   └── tools/
│       └── email-tools.ts   # Tool definitions and implementations
├── adapters/
│   ├── gmail.ts             # Gmail API integration
│   └── types.ts             # Shared TypeScript interfaces
├── classifiers/
│   └── spam-classifier.ts   # Spam detection logic
├── utils/
│   └── logger.ts            # Logging utility
└── index.ts                 # Entry point

tests/
└── email-agent.test.ts      # Unit tests
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

### Agent Interaction Flow
1. User provides natural language command
2. Agent builds system prompt and sends to Claude
3. Claude analyzes command and uses appropriate tools
4. Agent executes tools and returns results to Claude
5. Claude formulates response and confirms with user

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
npm run dev          # Run with ts-node
npm run build        # Compile TypeScript
npm run typecheck    # Check types
npm run lint         # Run ESLint
npm run test         # Run tests
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

## Future Enhancements

- [ ] Calendar integration for email scheduling
- [ ] Sentiment analysis for emails
- [ ] Template-based email responses
- [ ] Multi-account support
- [ ] Mobile app integration
- [ ] Email scheduling
- [ ] Advanced filtering rules

## Performance Considerations

- Gmail API has rate limits - implement backoff for bulk operations
- Email parsing is memory-intensive for large bodies - stream if needed
- Classifier runs on all emails - consider caching for repeated emails

## Security Notes

- Never log email contents in production
- Store credentials in `.env`, never in code
- Use OAuth2 refresh tokens, not hardcoded credentials
- Validate all user inputs before Gmail operations
