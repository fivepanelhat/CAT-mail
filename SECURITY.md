# Security Hardening & Attack Prevention

**CAT Email Agent - Comprehensive Security Guide**

---

## Security Overview

This document outlines all security measures implemented in CAT Email Agent to prevent:

- [OK] XSS (Cross-Site Scripting) attacks
- [OK] SQL Injection
- [OK] Command Injection
- [OK] Path Traversal
- [OK] XXE (XML External Entity) attacks
- [OK] LDAP Injection
- [OK] Malicious input/code execution
- [OK] Data exposure
- [OK] CSRF attacks
- [OK] Rate limiting exploitation

---

## Input Validation & Sanitization

### InputValidator Class

Located in `src/security/input-validator.ts`, this class provides comprehensive input validation:

```typescript
// Validates user commands
const validation = inputValidator.validateCommand(command);
if (!validation.valid) {
 return { error: validation.reason };
}

// Sanitizes emails
const { valid, sanitized } = inputValidator.sanitizeEmail(email);

// Sanitizes domains
const { valid, sanitized } = inputValidator.sanitizeDomain(domain);

// Validates email IDs
const { valid } = inputValidator.validateEmailIds(emailIds);
```

### Dangerous Patterns Blocked

```typescript
// SQL Injection patterns
 SELECT, INSERT, UPDATE, DELETE, DROP, EXEC, UNION
 Comments (-- /* */)
 Quote characters (single/double)
 Semicolons

// Command injection patterns
 Shell metacharacters (&|;<>$`(){})
 Command names (sh, bash, cmd, powershell, rm, nc)

// XSS patterns
 <script>, javascript:, onerror=, onclick=, eval()
 <iframe>, <embed>, <object>, <img>, <svg>

// Path traversal
 ../ or ..\

// XXE/XML
 <!DOCTYPE, <!ENTITY

// LDAP Injection
 Special characters (*()\\)
```

---

## Authentication & Authorization

### Gmail OAuth 2.0

```typescript
// User controls all authentication
- OAuth 2.0 (standard security protocol)
- User-provided credentials only
- Tokens never logged
- Refresh tokens rotated automatically
- Access can be revoked anytime
```

### API Keys

```
[OK] Stored in .env file only (never in code)
[OK] Never logged
[OK] Never sent to third parties
[OK] Environment-variable based access
 Never exposed in error messages
 Never stored in git
```

---

## XSS Prevention

### Output Encoding

All text displayed to users is sanitized:

```typescript
sanitizeForDisplay(text) {
 return text
 .replace(/&/g, '&amp;') // &
 .replace(/</g, '&lt;') // <
 .replace(/>/g, '&gt;') // >
 .replace(/"/g, '&quot;') // "
 .replace(/'/g, '&#x27;') // '
 .replace(/\//g, '&#x2F;'); // /
}
```

### HTML Escaping in Responses

All email content displayed is HTML-escaped to prevent script injection.

### Content Security Policy (CSP)

Vercel deployment includes CSP headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## SQL Injection Prevention

### No Direct SQL Queries

CAT Email Agent does NOT use SQL. All email operations go through:

1. **Gmail API** - Authenticated requests only
2. **Local file storage** - JSON (no SQL)
3. **In-memory storage** - Data structures only

### Query Parameterization

If SQL were used (future), all queries would be parameterized:

```typescript
// [OK] GOOD: Parameterized
db.query('SELECT * FROM users WHERE email = ?', [email]);

// BAD: String concatenation (never used)
db.query('SELECT * FROM users WHERE email = ' + email);
```

---

## Command Injection Prevention

### No Shell Execution

The application never executes shell commands:

```typescript
// NEVER: Shell execution
exec(`gmail search ${command}`);
spawn('bash', ['-c', command]);

// [OK] ALWAYS: API calls only
await gmail.searchEmails(query);
```

### Safe Gmail API Usage

```typescript
// Safe: Parameterized API calls
gmail.users.messages.list({
 userId: 'me',
 q: sanitizedQuery // Validated first
});
```

---

## Path Traversal Prevention

### File Path Validation

```typescript
// Block parent directory traversal
if (path.includes('..') || path.includes('..\\')) {
 reject('Invalid path');
}

// Only allow files in expected directories
const allowedDirs = ['./config', './logs'];
if (!allowedDirs.some(dir => path.startsWith(dir))) {
 reject('Path outside allowed directories');
}
```

### Local Storage Restrictions

```
Allowed paths:
[OK] ~/.cat-mail/config.json
[OK] ~/.cat-mail/logs/
[OK] ./config/

Blocked paths:
 /etc/passwd
 ../../../etc/passwd
 C:\Windows\System32
 Any absolute paths outside app
```

---

## CSRF Prevention

### No State-Changing GET Requests

All state-changing operations use:
- [OK] POST requests
- [OK] Validated CSRF tokens
- [OK] Same-origin checks

### Same-Origin Policy

```
Requests from: https://cat-mail.vercel.app
Allowed to: Gmail API (user's OAuth), Anthropic API (API key)
Blocked: Any third-party domain
```

---

## Rate Limiting

### Implementation

```typescript
// Check rate limits before processing
const { allowed, remaining } = inputValidator.checkRateLimit(
 userId,
 maxRequests = 100,
 windowSeconds = 60
);

if (!allowed) {
 return { error: 'Rate limit exceeded' };
}
```

### Limits (Per User, Per Minute)

```
Email search: 100 ops/min
Email delete: 100 ops/min
Send email: 50 ops/min
Classify spam: 100 ops/min
Total: 500 ops/min
```

---

## Data Protection

### In-Memory Processing

```
Email data lifecycle:
1. Loaded into RAM
2. Processed (search, delete, etc.)
3. Response generated
4. RAM cleared immediately
5. Not written to disk
6. Not logged
7. Not sent to third parties
```

### No Data Retention

```
[OK] Emails: Never stored
[OK] Contacts: Never collected
[OK] Metadata: Never retained
[OK] Headers: Processed, not saved
[OK] Content: Never logged
 User behavior: Not tracked
 Email patterns: Not analyzed
```

### Secure Deletion

```typescript
// Volatile storage auto-cleanup
dataHandler.storeVolatile('emails', data, 30000); // 30s TTL

// Hard delete on session end
dataHandler.hardDeleteAllData(); // Complete wipe

// Garbage collection
global.gc?.(); // Force V8 garbage collection
```

---

## API Security

### Anthropic Claude API

```
[OK] HTTPS only (TLS 1.3)
[OK] API key authentication
[OK] Text queries only (no email content)
[OK] No data retention (Anthropic's policy)
[OK] Standard error handling
 Never sends email bodies
 Never sends attachments
```

### Google Gemini API

```
[OK] HTTPS only (TLS 1.3)
[OK] API key authentication
[OK] Text queries only
[OK] Standard error handling
 Never sends email bodies
 Never sends sensitive data
```

### Gmail API

```
[OK] OAuth 2.0 authentication
[OK] User-provided credentials
[OK] Scoped permissions (email only)
[OK] Standard Google security
[OK] HTTPS/TLS encrypted
```

---

## Deployment Security

### Vercel Security Headers

Automatically enforced in production:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Environment Variables

```
.env file:
[OK] Contains sensitive keys
[OK] Never committed to git
[OK] Accessible to app only
[OK] Restricted permissions (600)

Vercel secrets:
[OK] Encrypted at rest
[OK] Never logged
[OK] Only accessible to app
[OK] Rotatable
```

### HTTPS/TLS

```
[OK] All connections encrypted
[OK] TLS 1.3 minimum
[OK] Certificate validation
[OK] HSTS enabled (Vercel default)
```

---

## Security Testing

### Input Validation Tests

```bash
npm run test -- input-validator

# Tests cover:
- SQL injection patterns
- XSS patterns
- Command injection patterns
- Path traversal attempts
- Rate limiting
- Invalid formats
```

### Penetration Testing Checklist

```
[OK] XSS injection attempts
[OK] SQL injection attempts
[OK] Command injection attempts
[OK] Path traversal attempts
[OK] CSRF attacks
[OK] Rate limiting bypass
[OK] Authentication bypass
[OK] Authorization bypass
[OK] Data exposure
[OK] DoS attacks
```

---

## Incident Response

### If an Exploit is Found

1. **Immediately** stop the affected component
2. **Document** the vulnerability
3. **Notify** users via GitHub security advisory
4. **Fix** the issue with security patch
5. **Test** extensively
6. **Release** patched version
7. **Audit** similar code patterns

### Reporting Security Issues

**Do NOT** open public GitHub issues for security vulnerabilities.

Instead, email: `security@coastalalpine.tech`

---

## Security Checklist

### Pre-Deployment

- [ ] All inputs validated
- [ ] All outputs sanitized
- [ ] No hardcoded secrets
- [ ] No SQL queries (or parameterized)
- [ ] No shell execution
- [ ] No data retention
- [ ] TLS/HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Logging doesn't expose secrets

### Production Monitoring

- [ ] Monitor error logs for attacks
- [ ] Check rate limiting metrics
- [ ] Verify data isn't being retained
- [ ] Audit memory usage patterns
- [ ] Review API logs (non-production)
- [ ] Check for unauthorized access

### Ongoing Maintenance

- [ ] Keep dependencies updated
- [ ] Review security advisories
- [ ] Penetration test quarterly
- [ ] Update security policies
- [ ] Train developers on security
- [ ] Review access logs

---

## Best Practices for Users

### Secure Your Installation

```bash
# Secure .env file (Linux/Mac)
chmod 600 .env

# Secure .env file (Windows)
# Right-click -> Properties -> Security -> Advanced
# Remove all users except yourself
```

### Rotate Credentials

```bash
# Monthly: Regenerate Gmail OAuth token
# Monthly: Rotate Anthropic/Gemini API key
# Update .env with new credentials
```

### Monitor Access

```bash
# Check audit logs regularly
tail -f logs/audit.log

# Look for:
- Unusual operation patterns
- Failed authentication attempts
- Rate limit hits
- Error spikes
```

### Keep Systems Updated

```bash
# Update Node.js regularly
node --version # Check current
# Update from nodejs.org or brew

# Update dependencies
npm update
npm audit fix
```

---

## Security Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Gmail API Security](https://developers.google.com/gmail/api/guides/authorizing-requests)
- [NZ Privacy Act 2020](https://www.privacy.org.nz/publications/privacy-act-2020/)

---

## Getting Help

### Security Questions

Email: `security@coastalalpine.tech`

### Reporting Vulnerabilities

**Never post vulnerabilities publicly.** Email security contact with:
- Vulnerability description
- Steps to reproduce
- Potential impact
- Your name/organization

### Follow-Up

We'll:
1. Acknowledge receipt within 24 hours
2. Confirm fix timeline
3. Keep you updated on progress
4. Credit you in security advisory (if desired)

---

## [OK] Compliance

### NZ Privacy Act 2020

[OK] PP1: Collect only what's needed
[OK] PP2: Use data only for stated purpose
[OK] PP3-13: All other principles met

### GDPR-Adjacent

While CAT doesn't process EU data, it follows GDPR principles:
- [OK] Data minimization
- [OK] Purpose limitation
- [OK] Storage limitation
- [OK] Integrity and confidentiality

### Industry Standards

- [OK] OWASP guidelines
- [OK] Node.js best practices
- [OK] OAuth 2.0 standards
- [OK] TLS/HTTPS standards

---

**Last Updated**: July 14, 2026 
**Status**: [OK] Security Hardened 
**Audit Level**: Comprehensive

*Security is not a feature-it's a requirement.*

## Fleet security principles

- **No silent exfiltration** of personal or tenant operational data
- Prefer **local-first** processing; third-party AI only with explicit operator configuration and UI/docs disclosure
- Report vulnerabilities via GitHub Security Advisories or the maintainer contact on the org profile
- High-stakes production changes require human approval (HITL)

## Data sales and third parties

- **We do not sell personal information or customer operational data to third parties.**
- Optional AI or cloud services run only when configured by the operator; processing must be disclosed (in-product and/or docs).
- Prefer local-first paths so third-party transfer is unnecessary by default.

## NZ Privacy Act and Te Mana Raraunga

- Design in accordance with the **Privacy Act 2020**.
- Operate in accordance with **Te Mana Raraunga** principles for Māori data sovereignty interests.
- Align AI features with **NZ AI safety** / responsible AI expectations (HITL, transparency, no silent training on private content).

