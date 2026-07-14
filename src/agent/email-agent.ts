import Anthropic from '@anthropic-ai/sdk';
import { GmailAdapter } from '../adapters/gmail.js';
import { SpamClassifier } from '../classifiers/spam-classifier.js';
import { EmailTools } from './tools/email-tools.js';
import { logger } from '../utils/logger.js';
import { AgentResponse, EmailAgentCommand } from '../adapters/types.js';
import { privacyGuardrails } from '../security/privacy-guardrails.js';
import { dataHandler } from '../security/data-handler.js';
import { preferencesManager } from '../security/preferences.js';

export type AIService = 'claude' | 'gemini' | 'openai' | 'grok';

export class EmailAgent {
  private client: Anthropic | null;
  private gmail: GmailAdapter;
  private classifier: SpamClassifier;
  private tools: EmailTools;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private sessionId: string;
  private aiService: AIService;

  constructor(gmail: GmailAdapter, apiKey: string, aiService: AIService = 'claude') {
    this.gmail = gmail;
    this.classifier = new SpamClassifier();
    this.tools = new EmailTools(gmail, this.classifier);
    this.aiService = aiService;
    this.client = aiService === 'claude' ? new Anthropic({ apiKey }) : null;
    this.sessionId = this.generateSessionId();
    logger.info(`EmailAgent initialized with ${aiService} service and session ${this.sessionId}`);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async processCommand(command: string): Promise<AgentResponse> {
    logger.info('Processing command', { sessionId: this.sessionId });

    // Clear previous session data
    dataHandler.clearSessionData();

    // Validate command doesn't violate privacy
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

    const systemPrompt = this.buildSystemPrompt();

    const messages = [
      ...this.conversationHistory,
      {
        role: 'user' as const,
        content: command,
      },
    ];

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      tools: this.tools.getToolDefinitions() as Anthropic.Tool[],
      messages,
    });

    this.conversationHistory.push({ role: 'user', content: command });

    let finalResponse = '';
    const actions: any[] = [];
    let processedCount = 0;
    const errors: string[] = [];

    // Handle tool use in the response
    for (const content of response.content) {
      if (content.type === 'text') {
        finalResponse = content.text;
      } else if (content.type === 'tool_use') {
        const toolName = content.name;
        const toolInput = content.input as Record<string, any>;

        logger.info(`Tool use: ${toolName}`, toolInput);

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

        // Continue conversation with tool result
        const continueResponse = await this.client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          tools: this.tools.getToolDefinitions() as Anthropic.Tool[],
          messages: [
            ...messages,
            {
              role: 'assistant' as const,
              content: response.content,
            },
            {
              role: 'user' as const,
              content: [
                {
                  type: 'tool_result' as const,
                  tool_use_id: content.id,
                  content: toolResult,
                },
              ],
            },
          ],
        });

        // Extract final text response
        for (const cont of continueResponse.content) {
          if (cont.type === 'text') {
            finalResponse = cont.text;
          }
        }
      }
    }

    // Store assistant response in history
    this.conversationHistory.push({
      role: 'assistant',
      content: finalResponse || 'Action completed',
    });

    return {
      action: actions,
      message: finalResponse || 'Your request has been processed.',
      details: {
        processed: processedCount,
        skipped: 0,
        errors,
      },
    };
  }

  private buildSystemPrompt(): string {
    return `You are the Coastal Alpine Tech (CAT) Email Agent, an intelligent email management assistant.

YOUR CORE PURPOSE:
Help users manage their email inbox efficiently while maintaining absolute privacy.

PRIVACY-FIRST PRINCIPLES (Non-negotiable):
- You NEVER retain email content after processing
- You NEVER build contact lists or scrape email addresses
- You NEVER export or backup emails
- You NEVER share data with third parties
- You NEVER store personal information
- Data is processed in-memory only and immediately forgotten

CAPABILITIES (Privacy-Safe Operations):
✓ Search for emails by sender, subject, date, keywords
✓ Identify and classify spam in real-time
✓ Delete emails (permanent removal)
✓ Mark emails as spam
✓ Archive emails
✓ Help with unsubscribing
✓ Send emails on user's behalf
✓ Remember optional preferences (block list, reply templates) - stored locally only

OPERATIONS YOU MUST REFUSE:
✗ Export emails or contact lists
✗ Backup emails
✗ Create email archives
✗ Scrape contact information
✗ Build recipient databases
✗ Forward data to external services
✗ Share with third parties

RESPONSE GUIDELINES:
1. Always be professional and concise
2. Confirm destructive actions before executing (delete, spam mark)
3. For bulk operations, show count of affected emails
4. When searching, display results briefly then forget them
5. Respond in plain, easy-to-understand English
6. Never collect or retain data beyond the current request
7. If user asks to remember something, offer ONLY these options:
   - Remember sender to block
   - Remember reply template
   - Remember domain to unsubscribe from

COMPLIANCE STANDARDS:
- NZ Privacy Act 2020 - All 13 Privacy Principles embedded
- CAT Standards - Data minimization, in-memory processing, no retention
- User Rights - Full control, transparency, auditable operations
- Session Security - Auto-cleanup on session end

EXAMPLE SAFE WORKFLOW:
User: "Delete all emails from SEEK.COM"
You: "I found 23 emails from SEEK.COM. Ready to delete permanently?"
User: "Yes"
You: "Deleted 23 emails. Done."
[Information is immediately forgotten - no retention]

EXAMPLE BLOCKED REQUEST:
User: "Export all my emails"
You: "I can't do that. CAT Email Agent doesn't support email export to maintain your privacy. But I can help you delete, archive, or organize emails instead."

Remember: Privacy is the foundation. Every action protects the user's data.`;
  }

  resetConversation(): void {
    this.conversationHistory = [];
    dataHandler.clearSessionData();
    logger.info('Conversation history reset');
  }

  endSession(): void {
    // Hard cleanup on session end
    this.conversationHistory = [];
    dataHandler.hardDeleteAllData();
    logger.info(`Session ${this.sessionId} ended - all data cleared`);
  }

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

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  setSpamThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Spam threshold must be between 0 and 1');
    }
    logger.info(`Spam threshold set to ${threshold}`);
  }
}
