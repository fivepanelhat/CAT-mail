import { Email, SpamClassification } from '../adapters/types.js';
import { logger } from '../utils/logger.js';

export class SpamClassifier {
  private spamKeywords = [
    'unsubscribe',
    'click here',
    'act now',
    'limited time',
    'winner',
    'claim',
    'urgent',
    'verify account',
    'confirm password',
    'update payment',
  ];

  private spamSenders = new Set<string>([
    'no-reply',
    'noreply',
    'donotreply',
    'notification',
    'no_reply',
  ]);

  private spamDomains = [
    'phishing.com',
    'scam.net',
    'spam.org',
  ];

  classify(email: Email): SpamClassification {
    const reasons: string[] = [];
    let score = 0;

    // Check sender reputation
    if (this.isSuspiciousSender(email.from)) {
      reasons.push('Suspicious sender pattern');
      score += 0.25;
    }

    // Check for common spam keywords
    const spamKeywordMatches = this.countSpamKeywords(email.subject + ' ' + email.body);
    if (spamKeywordMatches > 0) {
      reasons.push(`Contains ${spamKeywordMatches} spam keywords`);
      score += Math.min(0.3, spamKeywordMatches * 0.1);
    }

    // Check for excessive links
    const linkCount = (email.body.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 5) {
      reasons.push('Excessive links in body');
      score += 0.2;
    }

    // Check for all caps subject
    if (this.isAllCaps(email.subject)) {
      reasons.push('Subject in all caps');
      score += 0.15;
    }

    // Check for suspicious formatting
    if (this.hasSuspiciousFormatting(email.body)) {
      reasons.push('Suspicious formatting');
      score += 0.15;
    }

    // Check if sender domain is blacklisted
    if (this.isDomainBlacklisted(email.from)) {
      reasons.push('Sender domain is blacklisted');
      score += 0.5;
    }

    // Check for very short or generic body
    if (email.body.length < 50 && this.isGenericContent(email.body)) {
      reasons.push('Generic short content');
      score += 0.2;
    }

    const isSpam = score >= 0.5;
    const confidence = Math.min(score, 1.0);

    logger.debug('Spam classification', {
      emailId: email.id,
      from: email.from,
      subject: email.subject,
      isSpam,
      confidence,
      reasons,
    });

    return { isSpam, confidence, reasons };
  }

  private isSuspiciousSender(from: string): boolean {
    const sender = from.toLowerCase();
    return Array.from(this.spamSenders).some((pattern) => sender.includes(pattern));
  }

  private countSpamKeywords(text: string): number {
    const lowerText = text.toLowerCase();
    return this.spamKeywords.filter((keyword) => lowerText.includes(keyword)).length;
  }

  private isAllCaps(text: string): boolean {
    const alphaChars = text.replace(/[^a-zA-Z]/g, '');
    if (alphaChars.length < 5) return false;
    const upperChars = alphaChars.replace(/[^A-Z]/g, '');
    return upperChars.length / alphaChars.length > 0.8;
  }

  private hasSuspiciousFormatting(text: string): boolean {
    const exclamationCount = (text.match(/!/g) || []).length;
    const dollarCount = (text.match(/\$/g) || []).length;
    return exclamationCount > 5 || dollarCount > 2;
  }

  private isDomainBlacklisted(from: string): boolean {
    const domain = from.split('@')[1]?.toLowerCase() || '';
    return this.spamDomains.some((d) => domain.includes(d));
  }

  private isGenericContent(text: string): boolean {
    const genericPhrases = ['hello', 'dear', 'regards', 'thank you'];
    const phrases = text.toLowerCase().split(/\s+/);
    return genericPhrases.some((p) => phrases.includes(p));
  }

  addSpamKeyword(keyword: string): void {
    this.spamKeywords.push(keyword.toLowerCase());
    logger.info(`Added spam keyword: ${keyword}`);
  }

  addSpamSender(pattern: string): void {
    this.spamSenders.add(pattern.toLowerCase());
    logger.info(`Added spam sender pattern: ${pattern}`);
  }

  addBlacklist(domain: string): void {
    this.spamDomains.push(domain.toLowerCase());
    logger.info(`Added domain to blacklist: ${domain}`);
  }
}
