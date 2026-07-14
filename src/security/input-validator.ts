import { logger } from '../utils/logger.js';

/**
 * Input validation and sanitization
 * Prevents: XSS, injection attacks, command injection, SQL injection
 */
export class InputValidator {
  /**
   * Dangerous patterns that indicate attempted attacks
   */
  private dangerousPatterns = [
    // SQL Injection patterns
    /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bEXEC\b|\bUNION\b)/i,
    /(-{2}|\/\*|\*\/|;|'|")/,

    // Command injection patterns
    /[&|;<>$`(){}[\]]/,
    /(\bsh\b|\bbash\b|\bcmd\b|\bpowershell\b|\bnc\b|\brm\b|\brm -rf\b)/i,

    // XSS patterns
    /(<script|javascript:|onerror=|onclick=|onload=|eval\(|expression\()/i,
    /(<iframe|<embed|<object|<img|<svg)/i,

    // Path traversal
    /\.\.(\/|\\)/,

    // XXE/XML attacks
    /<!DOCTYPE|<!ENTITY/i,

    // LDAP injection
    /[*()\\]/,
  ];

  /**
   * Allowed email operation commands
   */
  private allowedOperations = [
    'search',
    'delete',
    'archive',
    'send',
    'classify',
    'unsubscribe',
    'block',
    'remember',
  ];

  /**
   * Validate user command input
   */
  validateCommand(command: string): { valid: boolean; reason?: string } {
    if (!command) {
      return { valid: false, reason: 'Command cannot be empty' };
    }

    if (typeof command !== 'string') {
      return { valid: false, reason: 'Command must be a string' };
    }

    if (command.length > 5000) {
      return { valid: false, reason: 'Command exceeds maximum length' };
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(command)) {
        logger.warn('Dangerous pattern detected in command', { pattern: pattern.source });
        return { valid: false, reason: 'Command contains invalid characters or patterns' };
      }
    }

    // Check for null bytes
    if (command.includes('\x00')) {
      return { valid: false, reason: 'Command contains null bytes' };
    }

    return { valid: true };
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): { valid: boolean; sanitized?: string; reason?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, reason: 'Invalid email format' };
    }

    const trimmed = email.trim().toLowerCase();

    // RFC 5322 simplified email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, reason: 'Invalid email format' };
    }

    // Check length
    if (trimmed.length > 254) {
      return { valid: false, reason: 'Email too long' };
    }

    // Check for dangerous patterns
    if (this.containsDangerousPatterns(trimmed)) {
      return { valid: false, reason: 'Email contains invalid characters' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Sanitize domain name
   */
  sanitizeDomain(domain: string): { valid: boolean; sanitized?: string; reason?: string } {
    if (!domain || typeof domain !== 'string') {
      return { valid: false, reason: 'Invalid domain format' };
    }

    const trimmed = domain.trim().toLowerCase();

    // Domain regex: alphanumeric, hyphens, dots, underscores
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
    if (!domainRegex.test(trimmed)) {
      return { valid: false, reason: 'Invalid domain format' };
    }

    // Check length
    if (trimmed.length > 253) {
      return { valid: false, reason: 'Domain too long' };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Sanitize text for display (XSS prevention)
   */
  sanitizeForDisplay(text: string): string {
    if (typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email IDs (Gmail message IDs)
   */
  validateEmailIds(emailIds: string[]): { valid: boolean; reason?: string } {
    if (!Array.isArray(emailIds)) {
      return { valid: false, reason: 'Email IDs must be an array' };
    }

    if (emailIds.length === 0) {
      return { valid: false, reason: 'Email IDs array cannot be empty' };
    }

    if (emailIds.length > 1000) {
      return { valid: false, reason: 'Too many email IDs (max 1000)' };
    }

    for (const id of emailIds) {
      if (typeof id !== 'string' || id.length === 0 || id.length > 100) {
        return { valid: false, reason: 'Invalid email ID format' };
      }

      // Gmail IDs are alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(id)) {
        return { valid: false, reason: 'Invalid email ID characters' };
      }
    }

    return { valid: true };
  }

  /**
   * Validate API responses
   */
  validateApiResponse(response: any): { valid: boolean; reason?: string } {
    if (!response) {
      return { valid: false, reason: 'Response is empty' };
    }

    // Ensure response is JSON-serializable
    try {
      JSON.stringify(response);
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Response is not valid JSON' };
    }
  }

  /**
   * Check for dangerous patterns in string
   */
  private containsDangerousPatterns(text: string): boolean {
    return this.dangerousPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Rate limiting check (simple version)
   */
  checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowSeconds: number = 60
  ): { allowed: boolean; remaining: number } {
    // This is a placeholder - in production use Redis or similar
    // For now, return allowed
    logger.debug(`Rate limit check for ${identifier}`);
    return { allowed: true, remaining: maxRequests };
  }
}

/**
 * Global input validator instance
 */
export const inputValidator = new InputValidator();
