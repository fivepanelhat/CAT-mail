export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  plainTextBody?: string;
  htmlBody?: string;
  timestamp: Date;
  labels: string[];
  isUnread: boolean;
  isSpam: boolean;
  hasAttachments: boolean;
}

export interface EmailAction {
  type: 'delete' | 'archive' | 'spam' | 'unsubscribe' | 'label' | 'move';
  emailIds: string[];
  labelId?: string;
  reason?: string;
}

export interface SpamClassification {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
}

export interface AgentResponse {
  action: EmailAction | EmailAction[];
  message: string;
  details: {
    processed: number;
    skipped: number;
    errors: string[];
  };
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    mimeType: string;
    headers: Array<{ name: string; value: string }>;
    parts?: GmailMessagePart[];
  };
  sizeEstimate: number;
  historyId?: string;
  internalDate: string;
}

export interface GmailMessagePart {
  mimeType: string;
  filename?: string;
  headers?: Array<{ name: string; value: string }>;
  body?: {
    size: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface EmailAgentCommand {
  command: string;
  parameters?: Record<string, unknown>;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
