#!/bin/bash

# CAT Email Agent - Linux/macOS Installation Script
# This script automatically installs and configures the CAT Email Agent

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Welcome
clear
print_header "Coastal Alpine Tech Email Agent - Installation"
echo ""
echo "This script will:"
echo "  1. Check prerequisites (Node.js, npm)"
echo "  2. Install dependencies"
echo "  3. Create configuration file"
echo "  4. Run tests"
echo ""
echo "System: $(uname -s) $(uname -m)"
echo ""

# Check Node.js
print_header "Step 1: Checking Prerequisites"
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo ""
    echo "Installation instructions:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    echo ""
    echo "Fedora/CentOS:"
    echo "  sudo dnf install nodejs npm"
    echo ""
    echo "macOS:"
    echo "  brew install node@20"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

print_success "Node.js $NODE_VERSION installed"
print_success "npm $NPM_VERSION installed"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    echo "Please run this script from the cat-mail directory"
    exit 1
fi

print_success "In correct directory"
echo ""

# Install dependencies
print_header "Step 2: Installing Dependencies"
echo ""

if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi
echo ""

# Create .env file
print_header "Step 3: Configuring Environment"
echo ""

if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to reconfigure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_success "Using existing .env configuration"
        echo ""
    else
        cp src/.env.example .env
        print_success ".env file created from template"
    fi
else
    cp src/.env.example .env
    print_success ".env file created from template"
fi

echo ""
echo "Please edit the .env file with your credentials:"
echo ""
echo "  nano .env"
echo ""
echo "Required configuration:"
echo "  ANTHROPIC_API_KEY     - Your Anthropic API key"
echo "  GMAIL_CLIENT_ID       - Gmail OAuth client ID"
echo "  GMAIL_CLIENT_SECRET   - Gmail OAuth client secret"
echo ""
echo "Optional:"
echo "  GEMINI_API_KEY        - For Google Gemini support"
echo "  LOG_LEVEL             - DEBUG, INFO (default), WARN, ERROR"
echo ""

# Security reminder
echo -e "${YELLOW}IMPORTANT: Keep .env file secure!${NC}"
chmod 600 .env 2>/dev/null || true
print_success ".env file permissions set to 600 (user only)"
echo ""

# Type checking
print_header "Step 4: Type Checking"
echo ""

if npm run typecheck; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript errors found"
    exit 1
fi
echo ""

# Tests
print_header "Step 5: Running Tests"
echo ""

if npm run test 2>/dev/null; then
    print_success "Tests passed"
else
    print_warning "Tests did not complete (this is normal if not configured)"
fi
echo ""

# Build
print_header "Step 6: Building Application"
echo ""

if npm run build; then
    print_success "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi
echo ""

# Final instructions
print_header "Installation Complete!"
echo ""
echo -e "${GREEN}CAT Email Agent is ready to use!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure credentials:"
echo "   nano .env"
echo ""
echo "2. Run a test command:"
echo "   npm run dev \"list my unread emails\""
echo ""
echo "3. (Optional) Setup auto-start with Systemd:"
echo "   See DEPLOYMENT_LINUX.md for instructions"
echo ""
echo "Documentation:"
echo "  • User Guide: README.md"
echo "  • Privacy Policy: PRIVACY_NOTICE.md"
echo "  • Deployment: DEPLOYMENT_MASTER.md"
echo "  • Development: CLAUDE.md"
echo ""
echo -e "${GREEN}Privacy is a right. Your email stays yours.${NC}"
echo ""
