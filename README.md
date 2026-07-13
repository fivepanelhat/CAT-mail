# CAT Mail

An intelligent AI-powered email agent for managing your inbox. CAT Mail understands natural language commands, automatically filters spam, and helps keep your email organized with minimal effort.

## Features

- **Natural Language Commands**: "Delete all emails from SEEK.COM" or "Unsubscribe from marketing emails"
- **Intelligent Spam Detection**: Automatically identifies and removes spam
- **Email Automation**: Read, write, delete, and organize emails
- **Smart Unsubscribe**: Automatically handles unsubscribe requests
- **Conversational AI**: Responds in clear, concise English with professional tone options
- **Inbox Management**: Archive, label, and organize emails intelligently

## Getting Started

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

1. Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your_api_key_here
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
```

2. Set up Gmail API credentials via Google Cloud Console

### Usage

```bash
npm run dev
```

## Architecture

- **Email Agent**: Main orchestrator for email operations
- **Gmail Adapter**: Interface with Gmail API
- **Claude Integration**: Natural language processing and decision-making
- **Email Classifier**: Spam detection and email categorization
- **Action Executor**: Execute email operations (delete, archive, unsubscribe, etc.)

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test

# Build for production
npm run build
```

## Project Structure

```
cat-mail/
├── src/
│   ├── index.ts              # Entry point
│   ├── agent/
│   │   ├── email-agent.ts    # Main email agent
│   │   └── tools/            # Tool definitions for Claude
│   ├── adapters/
│   │   ├── gmail.ts          # Gmail API adapter
│   │   └── types.ts          # Type definitions
│   ├── classifiers/
│   │   └── spam-classifier.ts # Spam detection logic
│   └── utils/
│       └── logger.ts         # Logging utility
├── tests/
│   └── email-agent.test.ts
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

## License

MIT
