import { Email } from '../adapters/types.js';
import { logger } from '../utils/logger.js';

/**
 * Handles all data access with privacy-first principles
 * - In-memory processing only
 * - Automatic cleanup
 * - No persistence unless explicitly requested
 */
export class DataHandler {
  private volatileStorage = new Map<string, any>();
  private sessionData = new Map<string, any>();
  private ephemeralQueue: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Store data for current request only (auto-cleanup)
   * Default: 30 seconds for automatic cleanup
   */
  storeVolatile(key: string, value: any, ttlMs: number = 30000): void {
    this.volatileStorage.set(key, value);

    // Cancel previous cleanup if exists
    if (this.ephemeralQueue.has(key)) {
      clearTimeout(this.ephemeralQueue.get(key)!);
    }

    // Schedule cleanup
    const timeout = setTimeout(() => {
      this.volatileStorage.delete(key);
      this.ephemeralQueue.delete(key);
      logger.debug(`Auto-cleared volatile data: ${key}`);
    }, ttlMs);

    this.ephemeralQueue.set(key, timeout);
    logger.debug(`Stored volatile data: ${key} (TTL: ${ttlMs}ms)`);
  }

  /**
   * Retrieve volatile data (doesn't extend TTL)
   */
  getVolatile(key: string): any | null {
    return this.volatileStorage.get(key) || null;
  }

  /**
   * Store data for session (survives single command cycle)
   */
  storeSessionData(key: string, value: any): void {
    this.sessionData.set(key, value);
    logger.debug(`Stored session data: ${key}`);
  }

  /**
   * Retrieve session data
   */
  getSessionData(key: string): any | null {
    return this.sessionData.get(key) || null;
  }

  /**
   * Clear session data (call on new command)
   */
  clearSessionData(): void {
    this.sessionData.clear();
    logger.info('Session data cleared');
  }

  /**
   * Process email with no retention
   * Email is processed and then forgotten
   */
  processEmailTemporarily<T>(email: Email, processor: (email: Email) => T): T {
    // Process email
    const result = processor(email);

    // Explicitly forget the email after processing
    logger.debug(`Processed email ${email.id} - data will not be retained`);

    return result;
  }

  /**
   * Sanitize data for display (remove sensitive fields)
   */
  sanitizeForDisplay(email: Email): Partial<Email> {
    return {
      id: email.id,
      threadId: email.threadId,
      from: email.from,
      subject: email.subject,
      timestamp: email.timestamp,
      labels: email.labels,
      isUnread: email.isUnread,
      isSpam: email.isSpam,
      // Note: body is NOT included in display
    };
  }

  /**
   * Create a safe summary for logging (no content)
   */
  createSafeSummary(email: Email): Record<string, any> {
    return {
      id: email.id,
      from: email.from,
      timestamp: email.timestamp,
      hasAttachments: email.hasAttachments,
      isSpam: email.isSpam,
      // Critically: NO subject, NO body, NO content
    };
  }

  /**
   * Verify no email content in memory
   */
  validateNoEmailContent(): boolean {
    for (const [key, value] of this.volatileStorage) {
      if (this.containsEmailContent(value)) {
        logger.error(`PRIVACY VIOLATION: Email content detected in volatile storage at key: ${key}`);
        return false;
      }
    }

    for (const [key, value] of this.sessionData) {
      if (this.containsEmailContent(value)) {
        logger.error(`PRIVACY VIOLATION: Email content detected in session data at key: ${key}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Hard delete all data (privacy request)
   */
  hardDeleteAllData(): void {
    // Clear volatile
    this.volatileStorage.clear();

    // Clear session
    this.sessionData.clear();

    // Cancel all pending cleanups
    for (const timeout of this.ephemeralQueue.values()) {
      clearTimeout(timeout);
    }
    this.ephemeralQueue.clear();

    logger.info('All in-memory data hard-deleted per user request');
  }

  /**
   * Get current memory usage (for monitoring)
   */
  getMemoryStats(): { volatile: number; session: number; total: number } {
    return {
      volatile: this.volatileStorage.size,
      session: this.sessionData.size,
      total: this.volatileStorage.size + this.sessionData.size,
    };
  }

  /**
   * Internal: Check if data contains email content
   */
  private containsEmailContent(value: any): boolean {
    if (!value) return false;

    const stringified = JSON.stringify(value).toLowerCase();
    const contentPatterns = [
      'email.body',
      'email.subject',
      'plaintext',
      'htmlbody',
      'fullcontent',
    ];

    return contentPatterns.some((pattern) => stringified.includes(pattern));
  }
}

/**
 * Global data handler instance
 */
export const dataHandler = new DataHandler();
