# NextJS Template App - Setup & Run Script (PowerShell)
# This script will set up the environment and start the development server

$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Step {
    param($Message)
    Write-Host "📋 $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) {
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

# Print header
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                   NextJS Template App                        ║" -ForegroundColor Magenta
Write-Host "║                    Setup & Run Script                        ║" -ForegroundColor Magenta
Write-Host "║                                                              ║" -ForegroundColor Magenta
Write-Host "║  This script will:                                           ║" -ForegroundColor Magenta
Write-Host "║  • Check prerequisites                                       ║" -ForegroundColor Magenta
Write-Host "║  • Install dependencies                                      ║" -ForegroundColor Magenta
Write-Host "║  • Set up environment variables                              ║" -ForegroundColor Magenta
Write-Host "║  • Initialize and seed the database                          ║" -ForegroundColor Magenta
Write-Host "║  • Start the development server                              ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check Prerequisites
Write-Step "Checking prerequisites..."

# Check for Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
    
    # Check if Node version is 18.17 or higher
    $versionMatch = $nodeVersion -match 'v(\d+)\.(\d+)\.'
    if ($versionMatch) {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        
        if ($major -lt 18 -or ($major -eq 18 -and $minor -lt 17)) {
            Write-Warning "Node.js version 18.17+ is recommended. Current: $nodeVersion"
        }
    }
}
else {
    Write-Error "Node.js is not installed. Please install Node.js 18.17+ from https://nodejs.org/"
    exit 1
}

# Check for npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Success "npm found: v$npmVersion"
}
else {
    Write-Error "npm is not installed. Please install npm."
    exit 1
}

# Check for git
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
}
else {
    Write-Warning "Git is not installed. Some features may not work properly."
}

Write-Host ""

# Step 2: Install Dependencies
Write-Step "Installing dependencies..."
Write-Info "This may take a few minutes..."

try {
    npm install
    Write-Success "Dependencies installed successfully!"
}
catch {
    Write-Error "Failed to install dependencies. Please check your internet connection and try again."
    exit 1
}

Write-Host ""

# Step 3: Environment Setup
Write-Step "Setting up environment variables..."

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Success "Created .env file from .env.example"
        Write-Warning "Please update the .env file with your actual configuration:"
        Write-Info "  • SMTP settings for email functionality"
        Write-Info "  • NEXTAUTH_SECRET for production"
        Write-Info "  • Database URL if using a different database"
        Write-Host ""
        Write-Info "For now, using default development settings..."
    }
    else {
        Write-Error ".env.example file not found. Cannot create environment file."
        exit 1
    }
}
else {
    Write-Success "Environment file (.env) already exists"
}

Write-Host ""

# Step 4: Database Setup
Write-Step "Setting up database..."

# Generate Prisma client
Write-Info "Generating Prisma client..."
try {
    npm run db:generate
    Write-Success "Prisma client generated successfully!"
}
catch {
    Write-Error "Failed to generate Prisma client."
    exit 1
}

# Run database migrations
Write-Info "Running database migrations..."
try {
    npm run db:migrate
    Write-Success "Database migrations completed!"
}
catch {
    Write-Error "Failed to run database migrations."
    exit 1
}

# Seed the database
Write-Info "Seeding database with sample data..."
try {
    npm run db:seed
    Write-Success "Database seeded successfully!"
    Write-Info "Sample data includes:"
    Write-Info "  • 3 test users (admin, manager, analyst)"
    Write-Info "  • 50 sample MyData records"
    Write-Info "  • Sample file uploads"
}
catch {
    Write-Error "Failed to seed database."
    exit 1
}

Write-Host ""

# Step 5: Final Setup Check
Write-Step "Verifying setup..."

$requiredFiles = @("package.json", "next.config.js", "prisma/schema.prisma", ".env")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "$file exists"
    }
    else {
        Write-Error "$file is missing"
        exit 1
    }
}

Write-Host ""

# Step 6: Display Setup Information
Write-Step "Setup Information"
Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Test Accounts:"
Write-Host "  • Admin:   username: admin   | password: password123 | role: ROLE1"
Write-Host "  • Manager: username: manager | password: password123 | role: ROLE2" 
Write-Host "  • Analyst: username: analyst | password: password123 | role: ROLE3"
Write-Host ""
Write-Host "🔗 Useful URLs (once server starts):"
Write-Host "  • Application:     http://localhost:3000"
Write-Host "  • API Reference:   http://localhost:3000/docs/api-reference"
Write-Host "  • Prisma Studio:   Run 'npm run db:studio' in another terminal"
Write-Host ""
Write-Host "📝 Available Scripts:"
Write-Host "  • npm run dev      - Start development server"
Write-Host "  • npm run build    - Build for production"
Write-Host "  • npm run db:studio - Open Prisma Studio"
Write-Host "  • npm run db:seed  - Reseed database"
Write-Host "  • npm run db:reset - Reset database"
Write-Host ""

# Step 7: Start Development Server
Write-Host ""
Write-Step "Starting development server..."
Write-Info "The server will start on http://localhost:3000"
Write-Info "Press Ctrl+C to stop the server"
Write-Host ""
Write-Success "🚀 Launching NextJS Template App..."

# Wait a moment for user to read
Start-Sleep -Seconds 2

# Start the development server
npm run dev

