#!/usr/bin/env pwsh
# CAT Email Agent - Windows Installation Script
# Run with: powershell -ExecutionPolicy Bypass -File install.ps1

Clear-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Coastal Alpine Tech Email Agent - Installation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will:"
Write-Host " 1. Check prerequisites (Node.js, npm)"
Write-Host " 2. Install dependencies"
Write-Host " 3. Create configuration file"
Write-Host ""

# Check Node.js
Write-Host "Step 1: Checking Node.js..." -ForegroundColor Cyan
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if ($null -eq $nodeCmd) {
 Write-Host "ERROR: Node.js is not installed" -ForegroundColor Red
 Write-Host ""
 Write-Host "Installation options:"
 Write-Host " 1. Download from https://nodejs.org (LTS recommended)"
 Write-Host " 2. Run: choco install nodejs -y"
 Write-Host ""
 exit 1
}

$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "OK Node.js $nodeVersion installed" -ForegroundColor Green
Write-Host "OK npm $npmVersion installed" -ForegroundColor Green
Write-Host ""

# Check package.json
if (-not (Test-Path "package.json")) {
 Write-Host "ERROR: package.json not found" -ForegroundColor Red
 exit 1
}

Write-Host "OK In correct directory" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Step 2: Installing Dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
 Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
 exit 1
}
Write-Host "OK Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create .env if needed
Write-Host "Step 3: Checking Configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
 Write-Host "Creating .env template..." -ForegroundColor Yellow
 $template = @"
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:3000/callback
TARGET_EMAIL=your@email.com

AI_SERVICE=claude
ANTHROPIC_API_KEY=sk-ant-your-key

LOG_LEVEL=INFO
"@
 Set-Content -Path ".env" -Value $template
 Write-Host "OK Created .env file" -ForegroundColor Green
}
else {
 Write-Host "OK .env file exists" -ForegroundColor Green
}
Write-Host ""

# Type checking
Write-Host "Step 4: Running Type Check..." -ForegroundColor Cyan
npm run type-check 2>&1 | Out-Null
Write-Host "OK Type checking complete" -ForegroundColor Green
Write-Host ""

# Success
Write-Host "================================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host " 1. Edit .env with your API credentials"
Write-Host " 2. Run: npm run dev (command)"
Write-Host " 3. See README.md for examples"
Write-Host ""
