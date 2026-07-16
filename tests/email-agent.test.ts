import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SpamClassifier } from '../src/classifiers/spam-classifier.js';
import { Email } from '../src/adapters/types.js';

describe('SpamClassifier', () => {
 let classifier: SpamClassifier;
 let testEmail: Email;

 beforeEach(() => {
 classifier = new SpamClassifier();
 testEmail = {
 id: 'test-1',
 threadId: 'thread-1',
 from: 'sender@example.com',
 to: ['user@gmail.com'],
 subject: 'Test Email',
 body: 'This is a test email',
 timestamp: new Date(),
 labels: ['INBOX'],
 isUnread: false,
 isSpam: false,
 hasAttachments: false,
 };
 });

 it('should classify legitimate emails correctly', () => {
 const result = classifier.classify(testEmail);
 expect(result.isSpam).toBe(false);
 expect(result.confidence).toBeLessThan(0.5);
 });

 it('should detect spam keywords', () => {
 const spamEmail = {
 ...testEmail,
 subject: 'URGENT ACTION REQUIRED!!!',
 body: 'Click here now for limited time offer to claim your prize!',
 };
 const result = classifier.classify(spamEmail);
 expect(result.isSpam).toBe(true);
 expect(result.reasons.length).toBeGreaterThan(0);
 });

 it('should detect suspicious senders', () => {
 const suspiciousEmail = {
 ...testEmail,
 from: 'noreply@example.com',
 };
 const result = classifier.classify(suspiciousEmail);
 expect(result.confidence).toBeGreaterThan(0);
 expect(result.reasons.some((r) => r.includes('Suspicious sender'))).toBe(true);
 });

 it('should detect all caps subjects', () => {
 const capsEmail = {
 ...testEmail,
 subject: 'THIS IS ALL CAPS AND SHOULD BE FLAGGED',
 };
 const result = classifier.classify(capsEmail);
 expect(result.isSpam).toBe(true);
 });

 it('should allow adding custom spam keywords', () => {
 classifier.addSpamKeyword('customkeyword');
 const emailWithCustomKeyword = {
 ...testEmail,
 body: 'This email contains customkeyword in the body',
 };
 const result = classifier.classify(emailWithCustomKeyword);
 expect(result.confidence).toBeGreaterThan(0);
 expect(result.reasons.some((r) => r.includes('spam keywords'))).toBe(true);
 });

 it('should allow adding blacklisted domains', () => {
 classifier.addBlacklist('malicious.com');
 const maliciousEmail = {
 ...testEmail,
 from: 'user@malicious.com',
 };
 const result = classifier.classify(maliciousEmail);
 expect(result.isSpam).toBe(true);
 expect(result.confidence).toBeGreaterThanOrEqual(0.5);
 });
});
