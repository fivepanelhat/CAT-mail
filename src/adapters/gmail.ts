import { google } from 'googleapis';
import { logger } from '../utils/logger.js';
import {
 Email,
 GmailMessage,
 GmailLabel,
 EmailAction,
} from './types.js';

export class GmailAdapter {
 private gmail = google.gmail('v1');
 private auth: any;

 constructor(auth: any) {
 this.auth = auth;
 }

 async getEmailById(messageId: string): Promise<Email | null> {
 try {
 const message = await this.gmail.users.messages.get({
 auth: this.auth,
 userId: 'me',
 id: messageId,
 format: 'full',
 });

 return this.parseGmailMessage(message.data as GmailMessage);
 } catch (error) {
 logger.error(`Failed to get email ${messageId}`, error);
 return null;
 }
 }

 async listEmails(query: string = '', maxResults: number = 10): Promise<Email[]> {
 try {
 const messages = await this.gmail.users.messages.list({
 auth: this.auth,
 userId: 'me',
 q: query,
 maxResults,
 });

 if (!messages.data.messages) return [];

 const emails: Email[] = [];
 for (const msg of messages.data.messages) {
 const email = await this.getEmailById(msg.id);
 if (email) emails.push(email);
 }

 return emails;
 } catch (error) {
 logger.error('Failed to list emails', error);
 return [];
 }
 }

 async searchEmails(query: string): Promise<Email[]> {
 return this.listEmails(query, 50);
 }

 async deleteEmail(messageId: string): Promise<boolean> {
 try {
 await this.gmail.users.messages.delete({
 auth: this.auth,
 userId: 'me',
 id: messageId,
 });
 logger.info(`Deleted email ${messageId}`);
 return true;
 } catch (error) {
 logger.error(`Failed to delete email ${messageId}`, error);
 return false;
 }
 }

 async markAsSpam(messageId: string): Promise<boolean> {
 try {
 await this.gmail.users.messages.modify({
 auth: this.auth,
 userId: 'me',
 id: messageId,
 requestBody: {
 addLabelIds: ['SPAM'],
 },
 });
 logger.info(`Marked email ${messageId} as spam`);
 return true;
 } catch (error) {
 logger.error(`Failed to mark email ${messageId} as spam`, error);
 return false;
 }
 }

 async archiveEmail(messageId: string): Promise<boolean> {
 try {
 await this.gmail.users.messages.modify({
 auth: this.auth,
 userId: 'me',
 id: messageId,
 requestBody: {
 removeLabelIds: ['INBOX'],
 },
 });
 logger.info(`Archived email ${messageId}`);
 return true;
 } catch (error) {
 logger.error(`Failed to archive email ${messageId}`, error);
 return false;
 }
 }

 async addLabel(messageId: string, labelId: string): Promise<boolean> {
 try {
 await this.gmail.users.messages.modify({
 auth: this.auth,
 userId: 'me',
 id: messageId,
 requestBody: {
 addLabelIds: [labelId],
 },
 });
 return true;
 } catch (error) {
 logger.error(`Failed to add label ${labelId} to email ${messageId}`, error);
 return false;
 }
 }

 async getLabels(): Promise<GmailLabel[]> {
 try {
 const labels = await this.gmail.users.labels.list({
 auth: this.auth,
 userId: 'me',
 });
 return labels.data.labels || [];
 } catch (error) {
 logger.error('Failed to get labels', error);
 return [];
 }
 }

 async createLabel(name: string): Promise<GmailLabel | null> {
 try {
 const label = await this.gmail.users.labels.create({
 auth: this.auth,
 userId: 'me',
 requestBody: {
 name,
 labelListVisibility: 'labelShow',
 messageListVisibility: 'show',
 },
 });
 return label.data as GmailLabel;
 } catch (error) {
 logger.error(`Failed to create label ${name}`, error);
 return null;
 }
 }

 async sendEmail(
 to: string[],
 subject: string,
 body: string,
 cc?: string[],
 bcc?: string[]
 ): Promise<boolean> {
 try {
 const email = [
 `To: ${to.join(', ')}`,
 cc ? `Cc: ${cc.join(', ')}` : '',
 bcc ? `Bcc: ${bcc.join(', ')}` : '',
 `Subject: ${subject}`,
 '',
 body,
 ]
 .filter(Boolean)
 .join('\r\n');

 const encodedEmail = Buffer.from(email).toString('base64');

 await this.gmail.users.messages.send({
 auth: this.auth,
 userId: 'me',
 requestBody: {
 raw: encodedEmail,
 },
 });

 logger.info(`Sent email to ${to.join(', ')}`);
 return true;
 } catch (error) {
 logger.error('Failed to send email', error);
 return false;
 }
 }

 async executeAction(action: EmailAction): Promise<{ processed: number; errors: string[] }> {
 const results = { processed: 0, errors: [] as string[] };

 for (const emailId of action.emailIds) {
 try {
 switch (action.type) {
 case 'delete':
 await this.deleteEmail(emailId);
 results.processed++;
 break;
 case 'spam':
 await this.markAsSpam(emailId);
 results.processed++;
 break;
 case 'archive':
 await this.archiveEmail(emailId);
 results.processed++;
 break;
 case 'label':
 if (action.labelId) {
 await this.addLabel(emailId, action.labelId);
 results.processed++;
 }
 break;
 default:
 results.errors.push(`Unknown action type: ${action.type}`);
 }
 } catch (error) {
 results.errors.push(`Failed to ${action.type} email ${emailId}`);
 }
 }

 return results;
 }

 private parseGmailMessage(message: GmailMessage): Email {
 const headers = message.payload?.headers || [];
 const getHeader = (name: string) =>
 headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

 const from = getHeader('From');
 const to = getHeader('To').split(',').map((s) => s.trim());
 const cc = getHeader('Cc')
 ? getHeader('Cc')
 .split(',')
 .map((s) => s.trim())
 : [];
 const subject = getHeader('Subject');

 const body = this.extractBody(message.payload);
 const isUnread = message.labelIds?.includes('UNREAD') || false;
 const isSpam = message.labelIds?.includes('SPAM') || false;

 return {
 id: message.id,
 threadId: message.threadId,
 from,
 to,
 cc,
 subject,
 body,
 timestamp: new Date(parseInt(message.internalDate)),
 labels: message.labelIds || [],
 isUnread,
 isSpam,
 hasAttachments: this.hasAttachments(message.payload),
 };
 }

 private extractBody(payload?: any): string {
 if (!payload) return '';

 if (payload.body?.data) {
 try {
 return Buffer.from(payload.body.data, 'base64').toString('utf-8');
 } catch {
 return payload.body.data;
 }
 }

 if (payload.parts) {
 for (const part of payload.parts) {
 if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
 if (part.body?.data) {
 try {
 return Buffer.from(part.body.data, 'base64').toString('utf-8');
 } catch {
 return part.body.data;
 }
 }
 }
 }
 }

 return '';
 }

 private hasAttachments(payload?: any): boolean {
 if (!payload?.parts) return false;
 return payload.parts.some((part: any) => part.filename);
 }
}
