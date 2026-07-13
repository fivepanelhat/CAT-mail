import Anthropic from '@anthropic-ai/sdk';
import { GmailAdapter } from '../adapters/gmail.js';
import { SpamClassifier } from '../classifiers/spam-classifier.js';
import { EmailTools } from './tools/email-tools.js';
import { logger } from '../utils/logger.js';
import { AgentResponse, EmailAgentCommand } from '../adapters/types.js';

export class EmailAgent {
  private client: Anthropic;
  private gmail: GmailAdapter;
  private classifier: SpamClassifier;
  private tools: EmailTools;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  constructor(gmail: GmailAdapter, apiKey: string) {
    this.gmail = gmail;
    this.classifier = new SpamClassifier();
    this.tools = new EmailTools(gmail, this.classifier);
    this.client = new Anthropic({ apiKey });
  }

  async processCommand(command: string): Promise<AgentResponse> {
    logger.info('Processing command', { command });

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
    return `You are CAT Mail, an intelligent email management assistant. Your role is to help users manage their email inbox efficiently.

Your capabilities:
- Search for emails by sender, subject, date, and keywords
- Identify and classify spam emails
- Delete unwanted emails
- Mark emails as spam
- Archive emails
- Help with unsubscribing from mailing lists
- Send emails

Guidelines:
1. Be professional and concise in your responses
2. Always confirm actions before executing them, especially destructive ones like delete
3. Provide clear explanations of what you're doing and why
4. When users ask to delete emails, search first and summarize what will be deleted
5. Be helpful in identifying spam and problematic senders
6. For bulk operations, always show the count of affected emails
7. Respond in plain, easy-to-understand English

When a user gives a command like "delete all emails from SEEK.COM", you should:
1. Search for emails matching that criteria
2. Show the user what will be deleted
3. Execute the delete action
4. Confirm completion with a summary

Remember: The user's email management is important. Take time to understand their intent and execute actions carefully.`;
  }

  resetConversation(): void {
    this.conversationHistory = [];
    logger.info('Conversation history reset');
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
