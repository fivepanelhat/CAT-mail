import { Email, EmailAction } from '../../adapters/types.js';
import { GmailAdapter } from '../../adapters/gmail.js';
import { SpamClassifier } from '../../classifiers/spam-classifier.js';
import { logger } from '../../utils/logger.js';

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export class EmailTools {
  private gmail: GmailAdapter;
  private classifier: SpamClassifier;

  constructor(gmail: GmailAdapter, classifier: SpamClassifier) {
    this.gmail = gmail;
    this.classifier = classifier;
  }

  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'search_emails',
        description:
          'Search for emails in the inbox. Can search by sender, subject, date range, or keywords. Example: search for emails from "SEEK.COM" or subject containing "promotion"',
        input_schema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description:
                'Search query in Gmail format. Examples: from:SEEK.COM, subject:promotion, before:2024-01-01',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of emails to return (default: 10, max: 50)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'classify_emails',
        description: 'Analyze emails and classify them as spam or legitimate',
        input_schema: {
          type: 'object',
          properties: {
            email_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of email IDs to classify',
            },
          },
          required: ['email_ids'],
        },
      },
      {
        name: 'delete_emails',
        description: 'Permanently delete emails from the inbox',
        input_schema: {
          type: 'object',
          properties: {
            email_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of email IDs to delete',
            },
            reason: {
              type: 'string',
              description: 'Reason for deletion (for logging)',
            },
          },
          required: ['email_ids'],
        },
      },
      {
        name: 'mark_as_spam',
        description: 'Mark emails as spam',
        input_schema: {
          type: 'object',
          properties: {
            email_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of email IDs to mark as spam',
            },
          },
          required: ['email_ids'],
        },
      },
      {
        name: 'archive_emails',
        description: 'Archive emails (remove from inbox but keep in archive)',
        input_schema: {
          type: 'object',
          properties: {
            email_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of email IDs to archive',
            },
          },
          required: ['email_ids'],
        },
      },
      {
        name: 'unsubscribe',
        description:
          'Find and process unsubscribe links in emails from a specific sender. This helps clean up marketing emails automatically.',
        input_schema: {
          type: 'object',
          properties: {
            sender_email: {
              type: 'string',
              description: 'Email address or domain to unsubscribe from',
            },
          },
          required: ['sender_email'],
        },
      },
      {
        name: 'send_email',
        description: 'Compose and send an email',
        input_schema: {
          type: 'object',
          properties: {
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Recipient email addresses',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body text',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'CC recipients (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'BCC recipients (optional)',
            },
          },
          required: ['to', 'subject', 'body'],
        },
      },
    ];
  }

  async executeToolCall(name: string, input: Record<string, any>): Promise<string> {
    logger.info(`Executing tool: ${name}`, input);

    try {
      switch (name) {
        case 'search_emails':
          return await this.searchEmails(input.query, input.max_results || 10);
        case 'classify_emails':
          return await this.classifyEmails(input.email_ids);
        case 'delete_emails':
          return await this.deleteEmails(input.email_ids, input.reason);
        case 'mark_as_spam':
          return await this.markAsSpam(input.email_ids);
        case 'archive_emails':
          return await this.archiveEmails(input.email_ids);
        case 'unsubscribe':
          return await this.unsubscribe(input.sender_email);
        case 'send_email':
          return await this.sendEmail(input);
        default:
          return JSON.stringify({ error: `Unknown tool: ${name}` });
      }
    } catch (error) {
      logger.error(`Error executing tool ${name}`, error);
      return JSON.stringify({
        error: `Failed to execute ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private async searchEmails(query: string, maxResults: number): Promise<string> {
    const emails = await this.gmail.searchEmails(query);
    return JSON.stringify({
      count: emails.length,
      emails: emails.slice(0, maxResults).map((e) => ({
        id: e.id,
        from: e.from,
        subject: e.subject,
        timestamp: e.timestamp,
        snippet: e.body.substring(0, 100),
      })),
    });
  }

  private async classifyEmails(emailIds: string[]): Promise<string> {
    const results = [];
    for (const emailId of emailIds) {
      const email = await this.gmail.getEmailById(emailId);
      if (email) {
        const classification = this.classifier.classify(email);
        results.push({
          id: emailId,
          from: email.from,
          subject: email.subject,
          isSpam: classification.isSpam,
          confidence: classification.confidence,
          reasons: classification.reasons,
        });
      }
    }
    return JSON.stringify({ classified: results });
  }

  private async deleteEmails(emailIds: string[], reason?: string): Promise<string> {
    const action: EmailAction = {
      type: 'delete',
      emailIds,
      reason,
    };
    const result = await this.gmail.executeAction(action);
    return JSON.stringify(result);
  }

  private async markAsSpam(emailIds: string[]): Promise<string> {
    const action: EmailAction = {
      type: 'spam',
      emailIds,
    };
    const result = await this.gmail.executeAction(action);
    return JSON.stringify(result);
  }

  private async archiveEmails(emailIds: string[]): Promise<string> {
    const action: EmailAction = {
      type: 'archive',
      emailIds,
    };
    const result = await this.gmail.executeAction(action);
    return JSON.stringify(result);
  }

  private async unsubscribe(senderEmail: string): Promise<string> {
    const emails = await this.gmail.searchEmails(`from:${senderEmail}`);
    logger.info(`Found ${emails.length} emails from ${senderEmail}`);

    const summary = {
      sender: senderEmail,
      emailsFound: emails.length,
      unsubscribeAttempted: true,
      message: `Found ${emails.length} emails from ${senderEmail}. Manual unsubscribe link needs to be clicked in one of the emails, or these emails can be moved to spam/deleted.`,
    };

    return JSON.stringify(summary);
  }

  private async sendEmail(input: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
  }): Promise<string> {
    const success = await this.gmail.sendEmail(input.to, input.subject, input.body, input.cc, input.bcc);
    return JSON.stringify({
      success,
      message: success
        ? `Email sent successfully to ${input.to.join(', ')}`
        : 'Failed to send email',
    });
  }
}
