import { logger } from '../utils/logger.js';

export interface UserPreferences {
  blockList: string[]; // Only sender emails, no contact info
  replyTemplates: Map<string, string>; // Template name → template text
  unsubscribeList: string[]; // Only domain addresses
  spamKeywords: string[];
  version: number;
}

/**
 * Local-only preferences storage
 * Stored only in user's config file
 * Never sent to third parties
 * Can be deleted anytime
 */
export class PreferencesManager {
  private preferences: UserPreferences = {
    blockList: [],
    replyTemplates: new Map(),
    unsubscribeList: [],
    spamKeywords: [],
    version: 1,
  };

  private isDirty = false;

  /**
   * Add sender to block list
   * Only stores email address, nothing else
   */
  addToBlockList(senderEmail: string): boolean {
    if (!this.isValidEmail(senderEmail)) {
      logger.warn(`Invalid email format: ${senderEmail}`);
      return false;
    }

    if (!this.preferences.blockList.includes(senderEmail)) {
      this.preferences.blockList.push(senderEmail);
      this.isDirty = true;
      logger.info(`Added to block list: ${senderEmail}`);
      return true;
    }

    return false;
  }

  /**
   * Remove from block list
   */
  removeFromBlockList(senderEmail: string): boolean {
    const index = this.preferences.blockList.indexOf(senderEmail);
    if (index > -1) {
      this.preferences.blockList.splice(index, 1);
      this.isDirty = true;
      logger.info(`Removed from block list: ${senderEmail}`);
      return true;
    }
    return false;
  }

  /**
   * Get block list
   */
  getBlockList(): string[] {
    return [...this.preferences.blockList];
  }

  /**
   * Check if sender is blocked
   */
  isBlocked(senderEmail: string): boolean {
    return this.preferences.blockList.includes(senderEmail);
  }

  /**
   * Add reply template
   * Only stores template text, no contact info
   */
  addReplyTemplate(name: string, template: string): boolean {
    if (!name || !template) {
      logger.warn('Template name and content are required');
      return false;
    }

    if (name.length > 50) {
      logger.warn('Template name must be 50 characters or less');
      return false;
    }

    this.preferences.replyTemplates.set(name, template);
    this.isDirty = true;
    logger.info(`Added reply template: ${name}`);
    return true;
  }

  /**
   * Get reply template
   */
  getReplyTemplate(name: string): string | null {
    return this.preferences.replyTemplates.get(name) || null;
  }

  /**
   * List all reply templates (names only)
   */
  listReplyTemplates(): string[] {
    return Array.from(this.preferences.replyTemplates.keys());
  }

  /**
   * Remove reply template
   */
  removeReplyTemplate(name: string): boolean {
    const had = this.preferences.replyTemplates.has(name);
    if (had) {
      this.preferences.replyTemplates.delete(name);
      this.isDirty = true;
      logger.info(`Removed reply template: ${name}`);
    }
    return had;
  }

  /**
   * Add domain to unsubscribe list
   * Only stores domain, no personal info
   */
  addUnsubscribeDomain(domain: string): boolean {
    if (!this.isValidDomain(domain)) {
      logger.warn(`Invalid domain format: ${domain}`);
      return false;
    }

    if (!this.preferences.unsubscribeList.includes(domain)) {
      this.preferences.unsubscribeList.push(domain);
      this.isDirty = true;
      logger.info(`Added to unsubscribe list: ${domain}`);
      return true;
    }

    return false;
  }

  /**
   * Remove from unsubscribe list
   */
  removeUnsubscribeDomain(domain: string): boolean {
    const index = this.preferences.unsubscribeList.indexOf(domain);
    if (index > -1) {
      this.preferences.unsubscribeList.splice(index, 1);
      this.isDirty = true;
      logger.info(`Removed from unsubscribe list: ${domain}`);
      return true;
    }
    return false;
  }

  /**
   * Get unsubscribe list
   */
  getUnsubscribeList(): string[] {
    return [...this.preferences.unsubscribeList];
  }

  /**
   * Check if domain is in unsubscribe list
   */
  isUnsubscribed(domain: string): boolean {
    return this.preferences.unsubscribeList.includes(domain);
  }

  /**
   * Add custom spam keyword (for classifier)
   */
  addSpamKeyword(keyword: string): boolean {
    if (!keyword || keyword.length > 100) {
      logger.warn('Keyword must be provided and under 100 characters');
      return false;
    }

    const lowerKeyword = keyword.toLowerCase();
    if (!this.preferences.spamKeywords.includes(lowerKeyword)) {
      this.preferences.spamKeywords.push(lowerKeyword);
      this.isDirty = true;
      logger.info(`Added spam keyword: ${keyword}`);
      return true;
    }

    return false;
  }

  /**
   * Remove spam keyword
   */
  removeSpamKeyword(keyword: string): boolean {
    const lowerKeyword = keyword.toLowerCase();
    const index = this.preferences.spamKeywords.indexOf(lowerKeyword);
    if (index > -1) {
      this.preferences.spamKeywords.splice(index, 1);
      this.isDirty = true;
      logger.info(`Removed spam keyword: ${keyword}`);
      return true;
    }
    return false;
  }

  /**
   * Get all preferences (for local storage only)
   */
  getAllPreferences(): UserPreferences {
    return {
      blockList: [...this.preferences.blockList],
      replyTemplates: new Map(this.preferences.replyTemplates),
      unsubscribeList: [...this.preferences.unsubscribeList],
      spamKeywords: [...this.preferences.spamKeywords],
      version: this.preferences.version,
    };
  }

  /**
   * Check if preferences have unsaved changes
   */
  hasChanges(): boolean {
    return this.isDirty;
  }

  /**
   * Mark preferences as saved
   */
  markSaved(): void {
    this.isDirty = false;
  }

  /**
   * Reset all preferences (user deletion request)
   */
  deleteAllPreferences(): void {
    this.preferences = {
      blockList: [],
      replyTemplates: new Map(),
      unsubscribeList: [],
      spamKeywords: [],
      version: 1,
    };
    this.isDirty = true;
    logger.info('All preferences deleted per user request');
  }

  /**
   * Import preferences from JSON
   */
  importFromJson(json: string): boolean {
    try {
      const data = JSON.parse(json);

      this.preferences.blockList = data.blockList || [];
      this.preferences.unsubscribeList = data.unsubscribeList || [];
      this.preferences.spamKeywords = data.spamKeywords || [];

      if (data.replyTemplates && typeof data.replyTemplates === 'object') {
        this.preferences.replyTemplates = new Map(Object.entries(data.replyTemplates));
      }

      this.isDirty = true;
      logger.info('Preferences imported successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import preferences', error);
      return false;
    }
  }

  /**
   * Export preferences to JSON (for backup)
   */
  exportToJson(): string {
    const data = {
      blockList: this.preferences.blockList,
      replyTemplates: Object.fromEntries(this.preferences.replyTemplates),
      unsubscribeList: this.preferences.unsubscribeList,
      spamKeywords: this.preferences.spamKeywords,
      version: this.preferences.version,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  }
}

/**
 * Global preferences manager instance
 */
export const preferencesManager = new PreferencesManager();
