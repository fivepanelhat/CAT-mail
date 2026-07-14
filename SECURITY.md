# Security Hardening & Attack Prevention

**CAT Email Agent - Comprehensive Security Guide**

---

## 🔒 Security Overview

This document outlines all security measures implemented in CAT Email Agent to prevent:

- ✅ XSS (Cross-Site Scripting) attacks
- ✅ SQL Injection
- ✅ Command Injection
- ✅ Path Traversal
- ✅ XXE (XML External Entity) attacks
- ✅ LDAP Injection
- ✅ Malicious input/code execution
- ✅ Data exposure
- ✅ CSRF attacks
- ✅ Rate limiting exploitation

---

## 🛡️ Input Validation & Sanitization

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
❌ SELECT, INSERT, UPDATE, DELETE, DROP, EXEC, UNION
❌ Comments (-- /* */)
❌ Quote characters (single/double)
❌ Semicolons

// Command injection patterns
❌ Shell metacharacters (&|;<>$`(){})
❌ Command names (sh, bash, cmd, powershell, rm, nc)

// XSS patterns
❌ <script>, javascript:, onerror=, onclick=, eval()
❌ <iframe>, <embed>, <object>, <img>, <svg>

// Path traversal
❌ ../ or ..\

// XXE/XML
❌ <!DOCTYPE, <!ENTITY

// LDAP Injection
❌ Special characters (*()\\)
```

---

## 🔐 Authentication & Authorization

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
✅ Stored in .env file only (never in code)
✅ Never logged
✅ Never sent to third parties
✅ Environment-variable based access
❌ Never exposed in error messages
❌ Never stored in git
```

---

## 🔒 XSS Prevention

### Output Encoding

All text displayed to users is sanitized:

```typescript
sanitizeForDisplay(text) {
  return text
    .replace(/&/g, '&amp;')      // &
    .replace(/</g, '&lt;')       // <
    .replace(/>/g, '&gt;')       // >
    .replace(/"/g, '&quot;')     // "
    .replace(/'/g, '&#x27;')     // '
    .replace(/\//g, '&#x2F;');   // /
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

## 💉 SQL Injection Prevention

### No Direct SQL Queries

CAT Email Agent does NOT use SQL. All email operations go through:

1. **Gmail API** - Authenticated requests only
2. **Local file storage** - JSON (no SQL)
3. **In-memory storage** - Data structures only

### Query Parameterization

If SQL were used (future), all queries would be parameterized:

```typescript
// ✅ GOOD: Parameterized
db.query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ BAD: String concatenation (never used)
db.query('SELECT * FROM users WHERE email = ' + email);
```

---

## 🎯 Command Injection Prevention

### No Shell Execution

The application never executes shell commands:

```typescript
// ❌ NEVER: Shell execution
exec(`gmail search ${command}`);
spawn('bash', ['-c', command]);

// ✅ ALWAYS: API calls only
await gmail.searchEmails(query);
```

### Safe Gmail API Usage

```typescript
// Safe: Parameterized API calls
gmail.users.messages.list({
  userId: 'me',
  q: sanitizedQuery  // Validated first
});
```

---

## 🔍 Path Traversal Prevention

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
✅ ~/.cat-mail/config.json
✅ ~/.cat-mail/logs/
✅ ./config/

Blocked paths:
❌ /etc/passwd
❌ ../../../etc/passwd
❌ C:\Windows\System32
❌ Any absolute paths outside app
```

---

## 🆔 CSRF Prevention

### No State-Changing GET Requests

All state-changing operations use:
- ✅ POST requests
- ✅ Validated CSRF tokens
- ✅ Same-origin checks

### Same-Origin Policy

```
Requests from: https://cat-mail.vercel.app
Allowed to: Gmail API (user's OAuth), Anthropic API (API key)
Blocked: Any third-party domain
```

---

## 🔐 Rate Limiting

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
Email search:     100 ops/min
Email delete:     100 ops/min
Send email:       50 ops/min
Classify spam:    100 ops/min
Total:            500 ops/min
```

---

## 📊 Data Protection

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
✅ Emails: Never stored
✅ Contacts: Never collected
✅ Metadata: Never retained
✅ Headers: Processed, not saved
✅ Content: Never logged
❌ User behavior: Not tracked
❌ Email patterns: Not analyzed
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

## 🔒 API Security

### Anthropic Claude API

```
✅ HTTPS only (TLS 1.3)
✅ API key authentication
✅ Text queries only (no email content)
✅ No data retention (Anthropic's policy)
✅ Standard error handling
❌ Never sends email bodies
❌ Never sends attachments
```

### Google Gemini API

```
✅ HTTPS only (TLS 1.3)
✅ API key authentication
✅ Text queries only
✅ Standard error handling
❌ Never sends email bodies
❌ Never sends sensitive data
```

### Gmail API

```
✅ OAuth 2.0 authentication
✅ User-provided credentials
✅ Scoped permissions (email only)
✅ Standard Google security
✅ HTTPS/TLS encrypted
```

---

## 🔐 Deployment Security

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
✅ Contains sensitive keys
✅ Never committed to git
✅ Accessible to app only
✅ Restricted permissions (600)

Vercel secrets:
✅ Encrypted at rest
✅ Never logged
✅ Only accessible to app
✅ Rotatable
```

### HTTPS/TLS

```
✅ All connections encrypted
✅ TLS 1.3 minimum
✅ Certificate validation
✅ HSTS enabled (Vercel default)
```

---

## 🧪 Security Testing

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
✅ XSS injection attempts
✅ SQL injection attempts
✅ Command injection attempts
✅ Path traversal attempts
✅ CSRF attacks
✅ Rate limiting bypass
✅ Authentication bypass
✅ Authorization bypass
✅ Data exposure
✅ DoS attacks
```

---

## 🚨 Incident Response

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

## 📋 Security Checklist

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

## 🔐 Best Practices for Users

### Secure Your Installation

```bash
# Secure .env file (Linux/Mac)
chmod 600 .env

# Secure .env file (Windows)
# Right-click → Properties → Security → Advanced
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
node --version  # Check current
# Update from nodejs.org or brew

# Update dependencies
npm update
npm audit fix
```

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Gmail API Security](https://developers.google.com/gmail/api/guides/authorizing-requests)
- [NZ Privacy Act 2020](https://www.privacy.org.nz/publications/privacy-act-2020/)

---

## 🆘 Getting Help

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

## ✅ Compliance

### NZ Privacy Act 2020

✅ PP1: Collect only what's needed
✅ PP2: Use data only for stated purpose
✅ PP3-13: All other principles met

### GDPR-Adjacent

While CAT doesn't process EU data, it follows GDPR principles:
- ✅ Data minimization
- ✅ Purpose limitation
- ✅ Storage limitation
- ✅ Integrity and confidentiality

### Industry Standards

- ✅ OWASP guidelines
- ✅ Node.js best practices
- ✅ OAuth 2.0 standards
- ✅ TLS/HTTPS standards

---

**Last Updated**: July 14, 2026  
**Status**: ✅ Security Hardened  
**Audit Level**: Comprehensive

*Security is not a feature—it's a requirement.*
