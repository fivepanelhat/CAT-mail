import { logger } from '../utils/logger.js';

export interface OperationAuditLog {
 timestamp: Date;
 operationType: string;
 success: boolean;
 emailCount?: number;
 reason?: string;
}

type OperationType = 'delete' | 'send' | 'search' | 'archive' | 'spam' | 'unsubscribe';

export class PrivacyGuardrails {
 private auditLogs: OperationAuditLog[] = [];
 private maxAuditLogs = 1000;
 private blockedOperations = new Set<string>();
 private allowedOperations = new Set<OperationType>([
 'delete',
 'send',
 'search',
 'archive',
 'spam',
 'unsubscribe',
 ]);

 /**
 * Validate that an operation is allowed under privacy guidelines
 */
 validateOperation(operationType: string, context: Record<string, any>): boolean {
 // Block data export/scraping operations
 if (this.isBlockedOperation(operationType)) {
 logger.warn(`BLOCKED: Attempted ${operationType} - violates privacy policy`, context);
 return false;
 }

 // Validate no contact scraping
 if (operationType === 'search' && this.isContactScrapingAttempt(context)) {
 logger.warn('BLOCKED: Contact scraping detected', context);
 return false;
 }

 // Validate no email archiving/backup
 if (operationType === 'export' || operationType === 'backup') {
 logger.warn('BLOCKED: Email export/backup attempted', context);
 return false;
 }

 logger.info(`Validated operation: ${operationType}`);
 return true;
 }

 /**
 * Log operations for security audit (content-free)
 */
 auditOperation(operationType: string, success: boolean, emailCount?: number, reason?: string): void {
 const log: OperationAuditLog = {
 timestamp: new Date(),
 operationType,
 success,
 emailCount,
 reason,
 };

 this.auditLogs.push(log);

 // Maintain size limit
 if (this.auditLogs.length > this.maxAuditLogs) {
 this.auditLogs = this.auditLogs.slice(-this.maxAuditLogs);
 }

 logger.info(`Audit: ${operationType} - ${success ? 'SUCCESS' : 'FAILED'}`, {
 emailCount,
 reason,
 });
 }

 /**
 * Ensure no email content is stored in logs
 */
 sanitizeForLogging(data: any): any {
 if (!data) return data;

 const sanitized = JSON.parse(JSON.stringify(data));

 // Remove sensitive email fields
 const sensitiveFields = [
 'body',
 'htmlBody',
 'plainTextBody',
 'content',
 'message',
 'fullEmail',
 'rawEmail',
 ];

 const removeSensitiveData = (obj: any): void => {
 if (typeof obj !== 'object' || obj === null) return;

 for (const field of sensitiveFields) {
 if (field in obj) {
 delete obj[field];
 }
 }

 for (const key in obj) {
 if (typeof obj[key] === 'object') {
 removeSensitiveData(obj[key]);
 }
 }
 };

 removeSensitiveData(sanitized);
 return sanitized;
 }

 /**
 * Verify no third-party data sharing
 */
 validateNoThirdPartySharing(destination: string): boolean {
 const allowedDestinations = ['gmail.api', 'anthropic.api', 'local.storage'];

 if (!allowedDestinations.some((d) => destination.toLowerCase().includes(d))) {
 logger.error('BLOCKED: Attempted third-party data sharing', { destination });
 return false;
 }

 return true;
 }

 /**
 * Verify data minimization - only necessary fields
 */
 validateDataMinimization(operation: string, data: Record<string, any>): boolean {
 const allowedFieldsByOperation: Record<string, Set<string>> = {
 delete: new Set(['emailIds', 'reason']),
 send: new Set(['to', 'subject', 'body', 'cc', 'bcc']),
 search: new Set(['query', 'maxResults']),
 archive: new Set(['emailIds']),
 spam: new Set(['emailIds']),
 classify: new Set(['emailIds']),
 unsubscribe: new Set(['senderEmail']),
 };

 const allowedFields = allowedFieldsByOperation[operation];
 if (!allowedFields) {
 logger.warn(`Unknown operation: ${operation}`);
 return true; // Allow unknown operations to fail gracefully elsewhere
 }

 const dataKeys = new Set(Object.keys(data));
 const extraFields = Array.from(dataKeys).filter((k) => !allowedFields.has(k));

 if (extraFields.length > 0) {
 logger.warn(`Attempted to pass extra fields for ${operation}`, { extraFields });
 return false;
 }

 return true;
 }

 /**
 * Enforce in-memory processing - validate no persistence
 */
 validateInMemoryOnly(operationType: string): boolean {
 const diskWriteOperations = ['saveEmail', 'backupEmail', 'archiveEmail', 'exportEmail', 'cacheEmail'];

 if (diskWriteOperations.includes(operationType)) {
 logger.error('BLOCKED: Attempted persistent storage', { operationType });
 return false;
 }

 return true;
 }

 /**
 * Get audit logs (content-sanitized)
 */
 getAuditLogs(limit: number = 100): OperationAuditLog[] {
 return this.auditLogs.slice(-limit);
 }

 /**
 * Clear old audit logs (weekly rotation)
 */
 rotateAuditLogs(daysToKeep: number = 7): number {
 const cutoffDate = new Date();
 cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

 const beforeCount = this.auditLogs.length;
 this.auditLogs = this.auditLogs.filter((log) => log.timestamp > cutoffDate);
 const removed = beforeCount - this.auditLogs.length;

 logger.info(`Audit logs rotated: removed ${removed} old entries`);
 return removed;
 }

 /**
 * Clear all audit logs on demand (privacy request)
 */
 clearAllAuditLogs(): void {
 this.auditLogs = [];
 logger.info('All audit logs cleared per user request');
 }

 /**
 * Export audit logs for GDPR/NZ Privacy Act requests
 */
 exportAuditLogs(): OperationAuditLog[] {
 return [...this.auditLogs];
 }

 /**
 * Check if operation is explicitly blocked
 */
 private isBlockedOperation(operationType: string): boolean {
 const blockedOps = [
 'exportEmails',
 'backupEmails',
 'archiveEmails',
 'scrapeContacts',
 'buildContactList',
 'createEmailDatabase',
 'profileBehavior',
 'trackUsage',
 'forwardToThirdParty',
 'shareWithAnalytics',
 'monetizeData',
 'sellData',
 ];

 return blockedOps.includes(operationType);
 }

 /**
 * Detect contact scraping attempts
 */
 private isContactScrapingAttempt(context: Record<string, any>): boolean {
 const scrapingIndicators = [
 'allContacts',
 'extractContacts',
 'collectAddresses',
 'gatherSenders',
 'buildContactList',
 'exportRecipients',
 'list all recipients',
 'all senders',
 ];

 const contextStr = JSON.stringify(context).toLowerCase();
 return scrapingIndicators.some((indicator) => contextStr.includes(indicator));
 }
}

/**
 * Global privacy guardrails instance
 */
export const privacyGuardrails = new PrivacyGuardrails();
