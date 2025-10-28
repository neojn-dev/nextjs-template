# NextJS Template App - Setup & Run Script (PowerShell)
# This script will set up the environment and start the development server

$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Step {
    param($Message)
    Write-Host "[STEP] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
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
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "                   NextJS Template App                      " -ForegroundColor Magenta
Write-Host "                    Setup & Run Script                      " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "  This script will:                                         " -ForegroundColor Magenta
Write-Host "  - Check prerequisites                                     " -ForegroundColor Magenta
Write-Host "  - Install dependencies                                    " -ForegroundColor Magenta
Write-Host "  - Set up environment variables                            " -ForegroundColor Magenta
Write-Host "  - Initialize and seed the database                        " -ForegroundColor Magenta
Write-Host "  - Start the development server                            " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
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
        Write-Info "  - SMTP settings for email functionality"
        Write-Info "  - NEXTAUTH_SECRET for production"
        Write-Info "  - Database URL if using a different database"
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

# Check if Prisma is installed
Write-Info "Checking Prisma installation..."
try {
    $prismaVersion = npx prisma --version 2>&1
    Write-Success "Prisma found: $prismaVersion"
}
catch {
    Write-Error "Prisma is not properly installed. Attempting to reinstall..."
    try {
        npm install prisma @prisma/client
        Write-Success "Prisma reinstalled successfully!"
    }
    catch {
        Write-Error "Failed to install Prisma. Please check your Node.js installation."
        exit 1
    }
}

# Generate Prisma client
Write-Info "Generating Prisma client..."
try {
    npm run db:generate
    Write-Success "Prisma client generated successfully!"
}
catch {
    Write-Error "Failed to generate Prisma client."
    Write-Info "Trying alternative method..."
    try {
        npx prisma generate
        Write-Success "Prisma client generated using alternative method!"
    }
    catch {
        Write-Error "Failed to generate Prisma client even with alternative method."
        exit 1
    }
}

# Run database migrations
Write-Info "Running database migrations..."
try {
    npm run db:migrate
    Write-Success "Database migrations completed!"
}
catch {
    Write-Error "Failed to run database migrations."
    Write-Info "Trying alternative method..."
    try {
        npx prisma migrate deploy
        Write-Success "Database migrations completed using alternative method!"
    }
    catch {
        Write-Error "Failed to run migrations even with alternative method."
        exit 1
    }
}

# Seed the database
Write-Info "Seeding database with sample data..."
$seedRetries = 0
$seedMaxRetries = 3
$seedSuccess = $false

while ($seedRetries -lt $seedMaxRetries -and -not $seedSuccess) {
    try {
        npm run db:seed
        Write-Success "Database seeded successfully!"
        Write-Info "Sample data includes:"
        Write-Info "  - 3 test users: admin, manager, analyst"
        Write-Info "  - 50 sample MyData records"
        Write-Info "  - Sample file uploads"
        $seedSuccess = $true
    }
    catch {
        $seedRetries++
        if ($seedRetries -lt $seedMaxRetries) {
            Write-Warning "Database seeding failed (Attempt $seedRetries/$seedMaxRetries). Retrying..."
            Start-Sleep -Seconds 2
        }
        else {
            Write-Error "Failed to seed database after $seedMaxRetries attempts."
            Write-Warning "The database may not have sample data. You can seed it manually later with: npm run db:seed"
        }
    }
}

Write-Host ""

# Verify database was created
Write-Info "Verifying database setup..."
try {
    $dbCheckResult = npx prisma db execute --stdin <<< "SELECT COUNT(*) as record_count FROM sqlite_master WHERE type='table';" 2>&1
    Write-Success "Database verification passed!"
}
catch {
    Write-Warning "Could not fully verify database, but setup may still be successful."
}

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
Write-Host "SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host ""
Write-Host "TEST ACCOUNTS:"
Write-Host "  - Admin:   username: admin   | password: password123 | role: ROLE1"
Write-Host "  - Manager: username: manager | password: password123 | role: ROLE2" 
Write-Host "  - Analyst: username: analyst | password: password123 | role: ROLE3"
Write-Host ""
Write-Host "USEFUL URLs (once server starts):"
Write-Host "  - Application:     http://localhost:3000"
Write-Host "  - API Reference:   http://localhost:3000/docs/api-reference"
Write-Host "  - Prisma Studio:   Run 'npm run db:studio' in another terminal"
Write-Host ""
Write-Host "AVAILABLE SCRIPTS:"
Write-Host "  - npm run dev      - Start development server"
Write-Host "  - npm run build    - Build for production"
Write-Host "  - npm run db:studio - Open Prisma Studio"
Write-Host "  - npm run db:seed  - Reseed database"
Write-Host "  - npm run db:reset - Reset database"
Write-Host ""

# Step 7: Start Development Server
Write-Host ""
Write-Step "Starting development server..."
Write-Info "The server will start on http://localhost:3000"
Write-Info "Press Ctrl+C to stop the server"
Write-Host ""

# Ask user if they want to open Prisma Studio
Write-Host ""
Write-Step "Prisma Studio Option"
Write-Host "Would you like to open Prisma Studio in a new window?"
Write-Host "  1. Yes - Open Prisma Studio"
Write-Host "  2. No - Skip Prisma Studio"
Write-Host ""

$prismaChoice = Read-Host "Enter your choice (1 or 2)"

if ($prismaChoice -eq "1") {
    Write-Success "Opening Prisma Studio in a new window..."
    Write-Host ""
    Write-Info "Note: Prisma Studio will open in your default browser at http://localhost:5555"
    Write-Info "The browser window may take a few seconds to open."
    Write-Host ""
    
    # Wait a moment before starting Prisma Studio
    Start-Sleep -Seconds 2
    
    # Open Prisma Studio in a new PowerShell window
    try {
        Start-Process powershell -ArgumentList "cd '$PWD'; npm run db:studio" -WindowStyle Normal
        Write-Success "Prisma Studio launched in new window!"
        Write-Info "Starting development server on http://localhost:3000..."
    }
    catch {
        Write-Warning "Could not open Prisma Studio in new window."
        Write-Info "You can manually open it later with: npm run db:studio"
    }
    
    Write-Host ""
}
else {
    Write-Info "Skipping Prisma Studio."
    Write-Info "You can open it later with: npm run db:studio"
    Write-Host ""
}

Write-Success "LAUNCHING NextJS Template App..."

# Wait a moment for user to read
Start-Sleep -Seconds 2

# Start the development server
npm run dev

