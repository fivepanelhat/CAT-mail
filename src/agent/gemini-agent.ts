import { GmailAdapter } from '../adapters/gmail.js';
import { SpamClassifier } from '../classifiers/spam-classifier.js';
import { EmailTools } from './tools/email-tools.js';
import { logger } from '../utils/logger.js';
import { AgentResponse } from '../adapters/types.js';
import { privacyGuardrails } from '../security/privacy-guardrails.js';
import { dataHandler } from '../security/data-handler.js';
import { inputValidator } from '../security/input-validator.js';

/**
 * Gemini-powered email agent (alternative to Claude)
 * Compatible with Google's Gemini API
 */
export class GeminiEmailAgent {
  private gmail: GmailAdapter;
  private classifier: SpamClassifier;
  private tools: EmailTools;
  private conversationHistory: Array<{ role: 'user' | 'model'; content: string }> = [];
  private sessionId: string;
  private geminiApiKey: string;
  private geminiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

  constructor(gmail: GmailAdapter, geminiApiKey: string) {
    if (!geminiApiKey) {
      throw new Error('Gemini API key is required');
    }

    this.gmail = gmail;
    this.classifier = new SpamClassifier();
    this.tools = new EmailTools(gmail, this.classifier);
    this.geminiApiKey = geminiApiKey;
    this.sessionId = this.generateSessionId();
    logger.info(`GeminiEmailAgent initialized with session ${this.sessionId}`);
  }

  private generateSessionId(): string {
    return `gemini_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process command using Gemini API
   */
  async processCommand(command: string): Promise<AgentResponse> {
    // Validate input
    const validation = inputValidator.validateCommand(command);
    if (!validation.valid) {
      return {
        action: [],
        message: `Invalid command: ${validation.reason}`,
        details: {
          processed: 0,
          skipped: 0,
          errors: [validation.reason || 'Invalid input'],
        },
      };
    }

    logger.info('Processing Gemini command', { sessionId: this.sessionId });

    // Clear previous session data
    dataHandler.clearSessionData();

    // Validate command privacy
    if (!this.validateCommandPrivacy(command)) {
      const response: AgentResponse = {
        action: [],
        message:
          'This operation violates privacy guidelines. CAT Email Agent does not support data export, contact scraping, or third-party data sharing.',
        details: {
          processed: 0,
          skipped: 0,
          errors: ['Privacy policy violation detected'],
        },
      };
      privacyGuardrails.auditOperation('invalid_command', false, undefined, 'Privacy violation');
      return response;
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const response = await this.callGeminiAPI(command, systemPrompt);

      this.conversationHistory.push({ role: 'user', content: command });

      // Parse Gemini response
      let finalResponse = response;
      const actions: any[] = [];
      let processedCount = 0;
      const errors: string[] = [];

      // Extract tool calls from response if present
      if (response.includes('TOOL:')) {
        const toolMatches = response.match(/TOOL:\s*(\w+)\s*\((.*?)\)/g);
        if (toolMatches) {
          for (const toolMatch of toolMatches) {
            const [toolName, toolInput] = this.parseToolCall(toolMatch);

            if (toolName && toolInput) {
              const toolResult = await this.tools.executeToolCall(toolName, toolInput);
              const parsedResult = JSON.parse(toolResult);

              if (parsedResult.processed !== undefined) {
                processedCount += parsedResult.processed;
              }
              if (parsedResult.errors) {
                errors.push(...parsedResult.errors);
              }

              actions.push({
                tool: toolName,
                input: toolInput,
                result: parsedResult,
              });
            }
          }
        }
      }

      this.conversationHistory.push({ role: 'model', content: finalResponse });

      return {
        action: actions,
        message: finalResponse,
        details: {
          processed: processedCount,
          skipped: 0,
          errors,
        },
      };
    } catch (error) {
      logger.error('Gemini API error', error);
      return {
        action: [],
        message: `Error processing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          processed: 0,
          skipped: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(command: string, systemPrompt: string): Promise<string> {
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser command: ${command}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_UNSPECIFIED',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    try {
      const response = await fetch(`${this.geminiEndpoint}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error('No response from Gemini API');
    } catch (error) {
      logger.error('Gemini API call failed', error);
      throw error;
    }
  }

  /**
   * Parse tool call from response
   */
  private parseToolCall(toolMatch: string): [string | null, Record<string, any> | null] {
    const match = toolMatch.match(/TOOL:\s*(\w+)\s*\((.*?)\)/);
    if (!match) return [null, null];

    const toolName = match[1];
    const inputStr = match[2];

    try {
      const input = JSON.parse(inputStr);
      return [toolName, input];
    } catch {
      logger.warn(`Failed to parse tool input: ${inputStr}`);
      return [null, null];
    }
  }

  /**
   * Validate command privacy
   */
  private validateCommandPrivacy(command: string): boolean {
    const blockedTerms = [
      'export',
      'backup',
      'archive all',
      'save all emails',
      'download emails',
      'scrape contacts',
      'extract addresses',
      'collect senders',
      'gather recipients',
      'share with',
      'send to third party',
      'forward to external',
    ];

    const lowerCommand = command.toLowerCase();
    for (const term of blockedTerms) {
      if (lowerCommand.includes(term)) {
        logger.warn(`Blocked command containing privacy violation term: ${term}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(): string {
    return `You are the Coastal Alpine Tech (CAT) Email Agent, powered by Google Gemini.

YOUR CORE PURPOSE:
Help users manage their email inbox efficiently while maintaining absolute privacy.

PRIVACY-FIRST PRINCIPLES (Non-negotiable):
- You NEVER retain email content after processing
- You NEVER build contact lists or scrape email addresses
- You NEVER export or backup emails
- You NEVER share data with third parties
- You NEVER store personal information
- Data is processed in-memory only and immediately forgotten

AVAILABLE TOOLS (Format: TOOL: name({"param": "value"})):
- search_emails({"query": "from:sender@domain.com", "max_results": 10})
- delete_emails({"email_ids": ["id1", "id2"]})
- mark_as_spam({"email_ids": ["id1"]})
- archive_emails({"email_ids": ["id1"]})
- unsubscribe({"sender_email": "sender@domain.com"})
- send_email({"to": ["recipient@example.com"], "subject": "Subject", "body": "Message body"})

RESPONSE GUIDELINES:
1. Always be professional and concise
2. Confirm destructive actions before executing (delete, spam mark)
3. For bulk operations, show count of affected emails
4. When searching, display results briefly then forget them
5. Respond in plain, easy-to-understand English
6. Never collect or retain data beyond the current request
7. Use TOOL: format to invoke tools when needed

EXAMPLE WORKFLOW:
User: "Delete all emails from SEEK.COM"
Response: "I found 23 emails from SEEK.COM. Ready to delete permanently?"
(After confirmation)
Response: "Deleted 23 emails. Done."
[Information is immediately forgotten - no retention]

Remember: Privacy is the foundation. Every action protects the user's data.`;
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    this.conversationHistory = [];
    dataHandler.clearSessionData();
    logger.info('Gemini conversation history reset');
  }

  /**
   * End session (cleanup)
   */
  endSession(): void {
    this.conversationHistory = [];
    dataHandler.hardDeleteAllData();
    logger.info(`Gemini session ${this.sessionId} ended - all data cleared`);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): Array<{ role: 'user' | 'model'; content: string }> {
    return [...this.conversationHistory];
  }
}
