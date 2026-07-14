# CAT Email Agent - Windows Installation Script
# This script automatically installs and configures the CAT Email Agent
# Run with: powershell -ExecutionPolicy Bypass -File install.ps1

param(
    [switch]$SkipNodeCheck = $false
)

# Colors
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

# Welcome
Clear-Host
Write-Header "Coastal Alpine Tech Email Agent - Installation"

Write-Host "This script will:"
Write-Host "  1. Check prerequisites (Node.js, npm)"
Write-Host "  2. Install dependencies"
Write-Host "  3. Create configuration file"
Write-Host "  4. Run tests"
Write-Host ""
Write-Host "System: Windows $(([environment]::OSVersion).VersionString)"
Write-Host ""

# Check Node.js
Write-Header "Step 1: Checking Prerequisites"

if (-not $SkipNodeCheck) {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($null -eq $nodeCmd) {
        Write-Error-Custom "Node.js is not installed"
        Write-Host ""
        Write-Host "Installation options:"
        Write-Host ""
        Write-Host "Option 1: Download from https://nodejs.org (LTS recommended)"
        Write-Host ""
        Write-Host "Option 2: Install with Chocolatey:"
        Write-Host "  choco install nodejs -y"
        Write-Host ""
        Write-Host "Option 3: Install with Windows Package Manager:"
        Write-Host "  winget install OpenJS.NodeJS"
        Write-Host ""
        exit 1
    }

    $nodeVersion = & node --version
    $npmVersion = & npm --version

    Write-Success "Node.js $nodeVersion installed"
    Write-Success "npm $npmVersion installed"
}
else {
    Write-Warning "Skipped Node.js check"
}
Write-Host ""

# Check directory
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "package.json not found"
    Write-Host "Please run this script from the cat-mail directory"
    exit 1
}

Write-Success "In correct directory"
Write-Host ""

# Install dependencies
Write-Header "Step 2: Installing Dependencies"

$npmOutput = & npm install 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Dependencies installed successfully"
}
else {
    Write-Error-Custom "Failed to install dependencies"
    Write-Host $npmOutput
    exit 1
}
Write-Host ""

# Create .env file
Write-Header "Step 3: Configuring Environment"

if (Test-Path ".env") {
    Write-Warning ".env file already exists"
    $response = Read-Host "Do you want to reconfigure? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Copy-Item "src\.env.example" ".env" -Force
        Write-Success ".env file created from template"
    }
    else {
        Write-Success "Using existing .env configuration"
    }
}
else {
    Copy-Item "src\.env.example" ".env"
    Write-Success ".env file created from template"
}

Write-Host ""
Write-Host "Please edit the .env file with your credentials:"
Write-Host ""
Write-Host "  notepad .env"
Write-Host ""
Write-Host "Required configuration:"
Write-Host "  ANTHROPIC_API_KEY     - Your Anthropic API key"
Write-Host "  GMAIL_CLIENT_ID       - Gmail OAuth client ID"
Write-Host "  GMAIL_CLIENT_SECRET   - Gmail OAuth client secret"
Write-Host ""
Write-Host "Optional:"
Write-Host "  GEMINI_API_KEY        - For Google Gemini support"
Write-Host "  LOG_LEVEL             - DEBUG, INFO (default), WARN, ERROR"
Write-Host ""

# Secure .env file
Write-Warning "IMPORTANT: Securing .env file..."
try {
    $acl = Get-Acl ".env"
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        [System.Security.Principal.WindowsIdentity]::GetCurrent().User,
        "FullControl",
        "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl ".env" $acl
    Write-Success ".env file secured (user access only)"
}
catch {
    Write-Warning "Could not set file permissions: $_"
}
Write-Host ""

# Type checking
Write-Header "Step 4: Type Checking"

$typecheckOutput = & npm run typecheck 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "TypeScript compilation successful"
}
else {
    Write-Error-Custom "TypeScript errors found"
    Write-Host $typecheckOutput
    exit 1
}
Write-Host ""

# Tests
Write-Header "Step 5: Running Tests"

$testOutput = & npm run test 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Tests passed"
}
else {
    Write-Warning "Tests did not complete (this is normal if not configured)"
}
Write-Host ""

# Build
Write-Header "Step 6: Building Application"

$buildOutput = & npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Application built successfully"
}
else {
    Write-Error-Custom "Build failed"
    Write-Host $buildOutput
    exit 1
}
Write-Host ""

# Final instructions
Write-Header "Installation Complete!"
Write-Host "CAT Email Agent is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host ""
Write-Host "1. Configure credentials:"
Write-Host "   notepad .env"
Write-Host ""
Write-Host "2. Run a test command:"
Write-Host "   npm run dev `"list my unread emails`""
Write-Host ""
Write-Host "3. (Optional) Setup auto-start with Task Scheduler:"
Write-Host "   See DEPLOYMENT_WINDOWS.md for instructions"
Write-Host ""
Write-Host "Documentation:"
Write-Host "  • User Guide: README.md"
Write-Host "  • Privacy Policy: PRIVACY_NOTICE.md"
Write-Host "  • Deployment: DEPLOYMENT_MASTER.md"
Write-Host "  • Development: CLAUDE.md"
Write-Host ""
Write-Host "Privacy is a right. Your email stays yours." -ForegroundColor Green
Write-Host ""

# Pause to show completion
Read-Host "Press Enter to exit"
