import dotenv from 'dotenv';
import { google } from 'googleapis';
import { EmailAgent } from './agent/email-agent.js';
import { GmailAdapter } from './adapters/gmail.js';
import { logger, LogLevel } from './utils/logger.js';

dotenv.config();

async function initializeAuth() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/callback'
  );

  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

async function main() {
  logger.setLevel(LogLevel.INFO);

  if (!process.env.ANTHROPIC_API_KEY) {
    logger.error('ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    logger.error('Gmail API credentials are not configured');
    logger.info('Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET environment variables');
    process.exit(1);
  }

  try {
    const auth = await initializeAuth();
    const gmail = new GmailAdapter(auth);
    const agent = new EmailAgent(gmail, process.env.ANTHROPIC_API_KEY);

    logger.info('CAT Mail Email Agent initialized successfully');

    // Example usage
    const command = process.argv[2] || 'List my unread emails';

    logger.info(`Executing command: ${command}`);
    const response = await agent.processCommand(command);

    console.log('\n=== Agent Response ===');
    console.log(response.message);
    console.log('\nDetails:', response.details);

    if (response.action && Array.isArray(response.action) && response.action.length > 0) {
      console.log('\nActions taken:');
      response.action.forEach((action) => {
        console.log(`- ${action.tool}: ${JSON.stringify(action.input)}`);
      });
    }
  } catch (error) {
    logger.error('Failed to initialize CAT Mail', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unexpected error', error);
  process.exit(1);
});

export { EmailAgent, GmailAdapter };
