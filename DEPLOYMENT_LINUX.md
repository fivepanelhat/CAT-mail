# CAT Email Agent - Linux Deployment Guide

**Privacy-First Email Management on Linux**

---

## Prerequisites for Linux

### Supported Distributions
- Ubuntu 20.04+ (LTS recommended)
- Debian 11+
- Fedora 35+
- CentOS 8+
- Arch Linux
- Any Linux with Node.js 18+

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 1 core | 2+ cores |
| **RAM** | 256 MB | 512 MB+ |
| **Storage** | 100 MB | 500 MB+ |
| **Node.js** | 18.0.0 | 20.0.0+ |
| **npm** | 8.0.0 | 9.0.0+ |

---

## Installation (Linux)

### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
# Update package manager
sudo apt update
sudo apt upgrade -y

# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version # Should be v20.x.x
npm --version # Should be 9.x.x or higher
```

**Fedora/CentOS:**
```bash
# Install Node.js
sudo dnf install nodejs npm

# Verify
node --version
npm --version
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm

# Verify
node --version
npm --version
```

### Step 2: Clone and Setup Project

```bash
# Clone the repository
cd ~
git clone <repo-url> cat-mail
cd cat-mail

# Install dependencies
npm install

# Verify installation
npm run typecheck # Should compile without errors
```

### Step 3: Configure Environment

```bash
# Copy example config
cp src/.env.example .env

# Edit with your credentials
nano .env
# or
vim .env
```

**Edit `.env`:**
```env
# Required: Anthropic API
ANTHROPIC_API_KEY=sk-your-key-here

# Required: Gmail OAuth
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback

# Optional: Logging level
LOG_LEVEL=INFO
```

### Step 4: Set Permissions

```bash
# Make scripts executable (if needed)
chmod +x src/index.ts

# Ensure .env is private
chmod 600 .env
```

---

## Running on Linux

### Quick Start
```bash
# Run a single command
npm run dev "delete all spam emails"

# Or with more details
npm run dev "search emails from 2024"
```

### Development Mode
```bash
# Watch for changes and reload
npm run dev
```

### Production Build
```bash
# Compile TypeScript
npm run build

# Run compiled version
node dist/index.js "your command here"
```

---

## Memory Usage (Linux)

### Typical Memory Footprint

| State | Memory Usage | Notes |
|-------|--------------|-------|
| **Startup** | ~50-80 MB | Node.js + dependencies loaded |
| **Idle** | ~80-120 MB | Agent ready, no active operations |
| **Processing** | ~150-250 MB | Email processing in progress |
| **Peak** | ~300 MB | During large email batch operations |
| **After Cleanup** | ~80-120 MB | Back to baseline after operation |

### Memory Profiling

**Check memory usage in real-time:**
```bash
# Get PID of node process
ps aux | grep node

# Monitor memory usage
watch -n 1 'ps aux | grep node'

# Or use htop for interactive view
htop
# Press 'M' to sort by memory usage
```

**Get detailed memory stats:**
```bash
# Add this to your code temporarily for profiling
node --expose-gc src/index.ts "test command"

# This exposes garbage collection for analysis
```

### Memory Optimization Tips

```bash
# Run with memory limit (if needed)
node --max-old-space-size=256 dist/index.js "command"

# Options:
# --max-old-space-size=256 -> 256 MB max
# --max-old-space-size=512 -> 512 MB max
# --max-old-space-size=1024 -> 1 GB max
```

### Memory Behavior

```
Session Start
 (~80 MB)
Command Processing
 (~150-250 MB - in-memory email data)
Email Operations
 (~200 MB peak)
Result Generated
 (~150 MB)
[Automatic Cleanup]
 (~80 MB baseline)
```

**Key Point**: Memory returns to baseline immediately after operation. No persistent memory growth.

---

## Systemd Service (Auto-Start)

### Create Service File

```bash
# Create service file
sudo nano /etc/systemd/system/cat-mail.service
```

**Service Configuration:**
```ini
[Unit]
Description=Coastal Alpine Tech Email Agent
After=network.target
StartLimitIntervalSec=60
StartLimitBurst=3

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/cat-mail
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js

# Restart policy
Restart=on-failure
RestartSec=5s

# Resource limits
MemoryLimit=512M
CPUQuota=50%

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cat-mail

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start
sudo systemctl enable cat-mail.service

# Start service
sudo systemctl start cat-mail.service

# Check status
sudo systemctl status cat-mail.service

# View logs
sudo journalctl -u cat-mail -f
```

---

## Docker Deployment (Linux)

### Create Dockerfile

**`Dockerfile`:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port (for OAuth callback)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
 CMD node -e "console.log('healthy')" || exit 1

# Run compiled app
CMD ["node", "dist/index.js"]
```

### Build and Run Docker

```bash
# Build image
docker build -t cat-mail:latest .

# Run container
docker run -it \
 --env-file .env \
 --memory 512m \
 --cpus 1 \
 --name cat-mail-agent \
 cat-mail:latest

# Run with command
docker run -it \
 --env-file .env \
 --memory 512m \
 cat-mail:latest \
 "delete spam emails"

# View logs
docker logs cat-mail-agent

# Stop container
docker stop cat-mail-agent
```

### Docker Compose

**`docker-compose.yml`:**
```yaml
version: '3.8'

services:
 cat-mail:
 build: .
 container_name: cat-mail-agent
 environment:
 - NODE_ENV=production
 - LOG_LEVEL=INFO
 env_file:
 - .env
 volumes:
 - ./config.json:/app/config.json:rw
 - ./logs:/app/logs:rw
 deploy:
 resources:
 limits:
 cpus: '1'
 memory: 512M
 reservations:
 cpus: '0.5'
 memory: 256M
 restart: unless-stopped
 ports:
 - "3000:3000"
 healthcheck:
 test: ["CMD", "node", "-e", "console.log('healthy')"]
 interval: 30s
 timeout: 10s
 retries: 3
```

**Run with Docker Compose:**
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Security Hardening (Linux)

### File Permissions

```bash
# Restrict .env file
chmod 600 ~/.cat-mail/.env

# Restrict logs
chmod 700 ~/cat-mail/logs

# Restrict preferences
chmod 600 ~/cat-mail/config.json
```

### Firewall Configuration

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 3000/tcp # OAuth callback port

# Firewalld (Fedora/CentOS)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Run as Non-Root User

```bash
# Create dedicated user
sudo useradd -m -s /bin/bash cat-mail-user

# Set up directories
sudo mkdir -p /opt/cat-mail
sudo chown cat-mail-user:cat-mail-user /opt/cat-mail

# Switch to user
su - cat-mail-user
```

---

## Performance Monitoring (Linux)

### System Monitoring

```bash
# Real-time resource usage
top -p $(pgrep -f "node dist/index.js")

# Memory trend
free -h
watch -n 1 free -h

# Disk usage
df -h
du -sh ~/cat-mail/*

# Network (if using remote APIs)
iftop
nethogs
```

### Process Monitoring

```bash
# Get detailed process info
ps aux | grep node

# Monitor CPU and memory
ps -eo pid,ppid,%cpu,%mem,cmd --sort=-%mem | head

# Long-running process check
ps -eo pid,cmd,etimes --sort=etimes
```

---

## Troubleshooting (Linux)

### Permission Denied

```bash
# Fix node executable
sudo chmod +x /usr/bin/node

# Or reinstall Node.js
sudo apt remove nodejs npm
sudo apt install nodejs npm
```

### Out of Memory

```bash
# Increase available memory
# Edit docker-compose or service file limits

# Check system memory
free -h

# Clear cache
sudo sync; echo 3 > /proc/sys/vm/drop_caches
```

### Gmail OAuth Issues

```bash
# Check network connectivity
curl -I https://accounts.google.com

# Verify API credentials
echo $GMAIL_CLIENT_ID
echo $GMAIL_CLIENT_SECRET

# Test API access
npm run typecheck # Verify TypeScript
npm test # Run tests
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
GMAIL_REDIRECT_URI=http://localhost:3001/callback npm run dev
```

---

## Logging (Linux)

### View Logs

```bash
# Direct logs
tail -f logs/audit.log

# System logs (if using systemd)
journalctl -u cat-mail.service -f

# Filter by level
grep "ERROR" logs/audit.log
```

### Log Rotation

**`/etc/logrotate.d/cat-mail`:**
```
/home/username/cat-mail/logs/*.log {
 daily
 missingok
 rotate 7
 compress
 delaycompress
 notifempty
 create 0640 username username
 sharedscripts
}
```

---

## [OK] Linux Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] npm 8+ installed
- [ ] Project cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and secured (`chmod 600`)
- [ ] Gmail OAuth configured
- [ ] Anthropic API key set
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Tests pass (`npm run test`)
- [ ] First command runs successfully
- [ ] Memory usage monitored
- [ ] Optional: Docker setup complete
- [ ] Optional: Systemd service configured

---

## Production Deployment (Linux)

### Recommended Setup

```
-------------------------------------
| Systemd Service (Auto-Start) |
|-------------------------------------
| CAT Email Agent |
| - Memory limit: 512 MB |
| - CPU quota: 50% |
| - Auto-restart on failure |
|-------------------------------------
| Config/Preferences (Local Storage) |
| - /home/user/cat-mail/config.json |
| - /home/user/cat-mail/logs/ |
|-------------------------------------
| Gmail API (OAuth 2.0) |
| Anthropic API (Language) |
`-------------------------------------
```

### Setup Steps

```bash
# 1. Install and build
npm install
npm run build

# 2. Create service
sudo nano /etc/systemd/system/cat-mail.service
# [Use configuration from section above]

# 3. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable cat-mail.service
sudo systemctl start cat-mail.service

# 4. Monitor
sudo journalctl -u cat-mail -f
```

---

## Linux Support

**Distribution Issues**: Check distro-specific Node.js installation 
**Memory Issues**: Monitor with `top`, adjust limits in systemd/docker 
**Permission Issues**: Verify user ownership with `ls -l` 
**Network Issues**: Check firewall with `ufw status` or `firewall-cmd --list-all` 

---

**Last Updated**: July 14, 2026 
**Status**: [OK] Production Ready for Linux 

*Privacy is a right. Linux is freedom.*
