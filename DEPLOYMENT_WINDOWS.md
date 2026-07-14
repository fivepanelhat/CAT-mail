# CAT Email Agent - Windows Deployment Guide

**Privacy-First Email Management on Windows**

---

## 🪟 Prerequisites for Windows

### Supported Windows Versions
- Windows 10 (Build 19041+)
- Windows 11 (Recommended)
- Windows Server 2019+
- Windows Server 2022+

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 1 core | 2+ cores |
| **RAM** | 256 MB | 512 MB+ |
| **Storage** | 100 MB | 500 MB+ |
| **Node.js** | 18.0.0 | 20.0.0+ (LTS) |
| **npm** | 8.0.0 | 9.0.0+ |

### Software Requirements
- PowerShell 5.0+ (or PowerShell 7+)
- Git for Windows (optional, for cloning)

---

## 📦 Installation (Windows)

### Step 1: Install Node.js

#### Option A: Direct Download (Recommended)

1. Visit [nodejs.org](https://nodejs.org)
2. Download LTS version (20.x)
3. Run installer (.msi)
4. Follow installer wizard:
   - Accept license
   - Choose installation path
   - Include npm
   - Accept defaults

#### Option B: Chocolatey

```powershell
# Open PowerShell as Administrator

# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs -y

# Verify
node --version
npm --version
```

#### Option C: Windows Package Manager

```powershell
# Open PowerShell as Administrator

# Install Node.js
winget install OpenJS.NodeJS

# Verify
node --version
npm --version
```

#### Verify Installation

```powershell
# Test Node.js
node --version    # Should be v20.x.x or higher
npm --version     # Should be 9.x.x or higher

# Test npm
npm list -g --depth=0  # Shows globally installed packages
```

### Step 2: Clone and Setup Project

```powershell
# Navigate to your projects folder
cd $env:USERPROFILE\Documents

# Clone repository (or extract ZIP)
git clone <repo-url> cat-mail
cd cat-mail

# Install dependencies
npm install

# Verify installation
npm run typecheck  # Should compile without errors
```

**Alternative without Git:**
```powershell
# Download as ZIP from repository
# Extract to: $env:USERPROFILE\Documents\cat-mail
cd $env:USERPROFILE\Documents\cat-mail
npm install
```

### Step 3: Configure Environment

```powershell
# Copy example config
Copy-Item src\.env.example .env

# Edit with Notepad
notepad .env
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

### Step 4: Security Setup

```powershell
# Restrict .env file to current user only
$acl = Get-Acl ".env"
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    [System.Security.Principal.WindowsIdentity]::GetCurrent().User,
    "FullControl",
    "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl ".env" $acl

# Verify
Get-Acl .env | Format-List
```

---

## 🚀 Running on Windows

### Quick Start

```powershell
# Run a single command
npm run dev "delete all spam emails"

# Search emails
npm run dev "find unread emails from 2024"

# Block a sender
npm run dev "block notifications@store.com"
```

### Development Mode

```powershell
# Watch for file changes (auto-reload)
npm run dev
```

### Production Build

```powershell
# Compile TypeScript
npm run build

# Run compiled version
node dist\index.js "your command here"
```

---

## 📊 Memory Usage (Windows)

### Typical Memory Footprint

| State | Memory Usage | Notes |
|-------|--------------|-------|
| **Startup** | ~50-80 MB | Node.js + dependencies |
| **Idle** | ~80-120 MB | Agent ready, no operations |
| **Processing** | ~150-250 MB | Email processing in progress |
| **Peak** | ~300 MB | Large email batch operations |
| **After Cleanup** | ~80-120 MB | Returns to baseline |

### Check Memory Usage

#### Method 1: Task Manager

```
1. Press Ctrl + Shift + Esc (Task Manager)
2. Click "Details" tab
3. Find "node.exe" process
4. Check "Memory" column
```

#### Method 2: PowerShell

```powershell
# Get memory usage of Node process
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object Name, WorkingSet64

# Convert to MB
Get-Process | Where-Object {$_.ProcessName -eq "node"} | 
  Select-Object Name, @{Name="Memory (MB)";Expression={[math]::Round($_.WorkingSet64/1MB, 2)}}

# Continuous monitoring
while($true) {
    Clear-Host
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | 
      Select-Object Name, @{Name="Memory (MB)";Expression={[math]::Round($_.WorkingSet64/1MB, 2)}}
    Start-Sleep -Seconds 2
}
```

### Memory Optimization

```powershell
# Run with memory limit
$env:NODE_OPTIONS = "--max-old-space-size=512"
npm run dev

# Clear environment variable when done
$env:NODE_OPTIONS = ""

# Memory limit options:
# --max-old-space-size=256   → 256 MB max
# --max-old-space-size=512   → 512 MB max
# --max-old-space-size=1024  → 1 GB max
```

### Memory Behavior

```
Session Start
    ↓ (~80 MB)
Command Processing
    ↓ (~150-250 MB - in-memory email data)
Email Operations
    ↓ (~200 MB peak)
Result Generated
    ↓ (~150 MB)
[Automatic Cleanup]
    ↓ (~80 MB baseline)
```

**Key Point**: Memory returns to baseline immediately. No persistent growth.

---

## 🔄 Windows Task Scheduler (Auto-Start)

### Create Scheduled Task

```powershell
# Create basic scheduled task
$TaskName = "CAT-Email-Agent"
$TaskDescription = "Coastal Alpine Tech Email Agent"
$TaskAction = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" `
    -Argument "D:\cat-mail\dist\index.js" `
    -WorkingDirectory "D:\cat-mail"

$TaskTrigger = New-ScheduledTaskTrigger -AtStartup

$TaskSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable `
    -DontStopIfGoingOnBatteries `
    -AllowStartIfOnBatteries `
    -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName `
    -Action $TaskAction `
    -Trigger $TaskTrigger `
    -Settings $TaskSettings `
    -Description $TaskDescription `
    -RunLevel Highest
```

### Manage Scheduled Task

```powershell
# List scheduled tasks
Get-ScheduledTask | Where-Object {$_.TaskName -like "*CAT*"}

# Enable task
Enable-ScheduledTask -TaskName "CAT-Email-Agent"

# Disable task
Disable-ScheduledTask -TaskName "CAT-Email-Agent"

# View task details
Get-ScheduledTaskInfo -TaskName "CAT-Email-Agent"

# Remove task
Unregister-ScheduledTask -TaskName "CAT-Email-Agent" -Confirm:$false

# View logs
Get-EventLog -LogName "Windows PowerShell" -Source PowerShell | 
  Where-Object {$_.Message -like "*CAT*"} | 
  Select-Object -Last 10
```

---

## 🐳 Docker for Windows

### Prerequisites

1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. Enable WSL 2 backend
3. Allocate sufficient resources (Settings → Resources)

### Build and Run

```powershell
# Build Docker image
docker build -t cat-mail:latest .

# Run container
docker run -it `
  --env-file .env `
  --memory 512m `
  --cpus 1 `
  --name cat-mail-agent `
  cat-mail:latest

# Run with command
docker run -it `
  --env-file .env `
  --memory 512m `
  cat-mail:latest `
  "delete spam emails"

# View logs
docker logs cat-mail-agent

# Stop container
docker stop cat-mail-agent
```

### Docker Compose

```powershell
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔒 Security Hardening (Windows)

### Secure .env File

```powershell
# Restrict to current user only
$acl = Get-Acl ".env"
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    [System.Security.Principal.WindowsIdentity]::GetCurrent().User,
    "FullControl",
    "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl ".env" $acl
```

### Windows Defender Exclusion

```powershell
# Add folder to Windows Defender exclusion list
Add-MpPreference -ExclusionPath "D:\cat-mail" -Force

# Verify
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
```

### Firewall Configuration

```powershell
# Allow port 3000 (OAuth callback)
New-NetFirewallRule -DisplayName "CAT Mail - OAuth" `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 3000

# View rules
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*CAT*"}

# Remove rule
Remove-NetFirewallRule -DisplayName "CAT Mail - OAuth" -Confirm:$false
```

---

## 📈 Performance Monitoring (Windows)

### Performance Monitor

```powershell
# Open Performance Monitor
perfmon

# Or via PowerShell
Get-Counter '\Process(node#*)\% Processor Time' -Continuous
Get-Counter '\Process(node#*)\Working Set - Private' -Continuous
```

### Event Viewer

```powershell
# View application events
eventvwr.msc

# Or via PowerShell
Get-EventLog -LogName "Application" -EntryType "Error" -Newest 10
```

### Resource Monitor

```powershell
# Open Resource Monitor
resmon.exe

# View process details
Get-Process | Where-Object {$_.ProcessName -eq "node"} | 
  Format-List ProcessName, WorkingSet64, CPU, Threads
```

---

## 🆘 Troubleshooting (Windows)

### PowerShell Execution Policy

```powershell
# If you get "execution policy" error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify
Get-ExecutionPolicy
```

### Port Already in Use

```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

# Get process details
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill process
Stop-Process -Id <PID> -Force

# Or use different port in .env
# GMAIL_REDIRECT_URI=http://localhost:3001/callback
```

### Out of Memory

```powershell
# Check available memory
Get-WmiObject Win32_OperatingSystem | 
  Select-Object @{Name="Total Memory (GB)"; Expression={[math]::Round($_.TotalVisibleMemorySize/1MB, 2)}},
                 @{Name="Free Memory (GB)"; Expression={[math]::Round($_.FreePhysicalMemory/1MB, 2)}}

# Increase Node.js memory limit
$env:NODE_OPTIONS = "--max-old-space-size=1024"
npm run dev
```

### Gmail OAuth Issues

```powershell
# Test network connectivity
Test-NetConnection -ComputerName accounts.google.com -Port 443

# Verify environment variables
$env:GMAIL_CLIENT_ID
$env:GMAIL_CLIENT_SECRET

# Test API access
npm run typecheck
npm test
```

### Node/npm Not Found

```powershell
# Verify installation
node --version
npm --version

# If not found, add to PATH
# 1. Open "Environment Variables"
# 2. Add: C:\Program Files\nodejs
# 3. Restart PowerShell

# Or reinstall Node.js
```

---

## 📝 Logging (Windows)

### View Logs

```powershell
# Real-time log viewing
Get-Content .\logs\audit.log -Tail 50 -Wait

# Search logs
Select-String "ERROR" .\logs\audit.log

# Export logs
Get-Content .\logs\audit.log | Out-File audit-backup.txt
```

### Windows Event Log

```powershell
# View PowerShell event log
Get-EventLog -LogName "Windows PowerShell" -Newest 20

# Export to CSV
Get-EventLog -LogName "Application" | Export-Csv -Path events.csv
```

---

## ✅ Windows Deployment Checklist

- [ ] Windows 10/11 or Server 2019+
- [ ] Node.js 18+ installed and verified
- [ ] npm 8+ installed and verified
- [ ] Project cloned/extracted
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and secured
- [ ] Gmail OAuth configured
- [ ] Anthropic API key set
- [ ] Typecheck passes (`npm run typecheck`)
- [ ] Tests pass (`npm run test`)
- [ ] First command runs successfully
- [ ] Memory usage monitored
- [ ] Optional: Docker Desktop installed
- [ ] Optional: Task Scheduler configured
- [ ] Optional: Windows Defender exclusion added

---

## 🚀 Production Deployment (Windows)

### Recommended Setup

```
┌──────────────────────────────────────┐
│    Windows Task Scheduler            │
│    (Run at Startup)                  │
├──────────────────────────────────────┤
│  CAT Email Agent                     │
│  - Memory: 512 MB limit              │
│  - Priority: Normal                  │
│  - Auto-restart on failure           │
├──────────────────────────────────────┤
│  Config & Logs (Local Storage)       │
│  - C:\Users\[user]\cat-mail\config   │
│  - C:\Users\[user]\cat-mail\logs     │
├──────────────────────────────────────┤
│  Gmail API (OAuth 2.0)               │
│  Anthropic API (Language)            │
└──────────────────────────────────────┘
```

### Setup Steps

```powershell
# 1. Build for production
npm run build

# 2. Test build
node dist\index.js "test command"

# 3. Create scheduled task (see section above)
# 4. Monitor performance
# 5. Set up log rotation
```

---

## 📞 Windows Support

**Node.js Issues**: Reinstall from nodejs.org or use Chocolatey  
**Permission Errors**: Run PowerShell as Administrator  
**Port Conflicts**: Use netstat or Get-NetTCPConnection to find process  
**Memory Issues**: Check Task Manager, adjust NODE_OPTIONS  
**OAuth Issues**: Verify firewall allows port 3000  

---

## 🔗 Useful Windows Commands

```powershell
# Get Node processes
Get-Process | Where-Object {$_.ProcessName -like "node*"}

# Kill all Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# View environment variables
Get-ChildItem Env:NODE*
Get-ChildItem Env:GMAIL*

# Create folder
New-Item -ItemType Directory -Path "C:\path\to\folder" -Force

# View file size
(Get-Item ".\cat-mail").SizeOnDisk / 1MB
```

---

**Last Updated**: July 14, 2026  
**Status**: ✅ Production Ready for Windows  

*Privacy is a right. Windows is familiar.*
