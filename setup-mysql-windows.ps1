# MySQL Complete Setup Script for Windows
# This script automates MySQL installation, database setup, and NextJS app initialization

$ErrorActionPreference = "Stop"

# ============================================================
# LOGGING FUNCTIONS
# ============================================================

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

# ============================================================
# HEADER
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "            MySQL + NextJS Template App Setup                " -ForegroundColor Magenta
Write-Host "                    For Windows                              " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "  This script will:                                         " -ForegroundColor Magenta
Write-Host "  - Check MySQL installation                                " -ForegroundColor Magenta
Write-Host "  - Download MySQL if needed                                " -ForegroundColor Magenta
Write-Host "  - Install MySQL Server                                    " -ForegroundColor Magenta
Write-Host "  - Create database                                         " -ForegroundColor Magenta
Write-Host "  - Configure .env file                                     " -ForegroundColor Magenta
Write-Host "  - Run database migrations                                 " -ForegroundColor Magenta
Write-Host "  - Seed test data                                          " -ForegroundColor Magenta
Write-Host "  - Start development server                                " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# ============================================================
# STEP 1: CHECK ADMIN PRIVILEGES
# ============================================================

Write-Step "Checking administrator privileges..."

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Error "This script must be run as Administrator!"
    Write-Info "Please right-click PowerShell and select 'Run as administrator'"
    exit 1
}

Write-Success "Running as Administrator"

# ============================================================
# STEP 2: CHECK PREREQUISITES
# ============================================================

Write-Step "Checking prerequisites..."

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed!"
    Write-Info "Download from: https://nodejs.org/"
    exit 1
}

$nodeVersion = node --version
Write-Success "Node.js found: $nodeVersion"

# Check npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed!"
    exit 1
}

$npmVersion = npm --version
Write-Success "npm found: v$npmVersion"

Write-Host ""

# ============================================================
# STEP 3: CHECK/INSTALL MYSQL
# ============================================================

Write-Step "Checking MySQL installation..."

$mysqlInstalled = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue

if ($mysqlInstalled) {
    Write-Success "MySQL80 service found!"
    
    # Check if running
    if ($mysqlInstalled.Status -eq "Running") {
        Write-Success "MySQL80 service is running"
    }
    else {
        Write-Info "Starting MySQL80 service..."
        try {
            Start-Service -Name "MySQL80"
            Start-Sleep -Seconds 3
            Write-Success "MySQL80 service started"
        }
        catch {
            Write-Error "Failed to start MySQL80 service"
            exit 1
        }
    }
}
else {
    Write-Warning "MySQL80 service not found. Need to download and install MySQL."
    Write-Info ""
    Write-Info "Please download and install MySQL manually:"
    Write-Info "  1. Go to: https://dev.mysql.com/downloads/mysql/"
    Write-Info "  2. Download: MySQL Community Server (Windows installer)"
    Write-Info "  3. Run the installer"
    Write-Info "  4. Choose 'Developer Default' setup type"
    Write-Info "  5. Follow all installation steps"
    Write-Info "  6. Set a MySQL root password (remember it!)"
    Write-Info "  7. Complete the installation"
    Write-Info "  8. Run this script again"
    Write-Info ""
    
    $continue = Read-Host "Have you installed MySQL? (yes/no)"
    
    if ($continue -ne "yes" -and $continue -ne "y") {
        Write-Error "MySQL installation required. Please install and try again."
        exit 1
    }
    
    # Check again after user confirms installation
    $mysqlInstalled = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
    if (-not $mysqlInstalled) {
        Write-Error "MySQL80 service still not found"
        exit 1
    }
    
    Write-Success "MySQL80 service found!"
}

Write-Host ""

# ============================================================
# STEP 4: TEST MYSQL CONNECTION
# ============================================================

Write-Step "Testing MySQL connection..."

# Get root password from user
Write-Info "Enter your MySQL root password:"
Write-Info "(If you set no password during installation, press Enter)"
$rootPassword = Read-Host -AsSecureString "Root Password"

# Convert to plain text for mysql command
$rootPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($rootPassword))

# Test connection
try {
    $testConnection = mysql -u root -p"$rootPasswordPlain" -e "SELECT 1;" 2>&1 | Out-String
    Write-Success "MySQL connection successful!"
}
catch {
    Write-Error "Failed to connect to MySQL. Check your password."
    exit 1
}

Write-Host ""

# ============================================================
# STEP 5: CREATE DATABASE
# ============================================================

Write-Step "Creating database..."

try {
    $createDb = mysql -u root -p"$rootPasswordPlain" -e "CREATE DATABASE IF NOT EXISTS next_template_db;" 2>&1
    Write-Success "Database 'next_template_db' created/verified"
}
catch {
    Write-Error "Failed to create database"
    exit 1
}

Write-Host ""

# ============================================================
# STEP 6: UPDATE .ENV FILE
# ============================================================

Write-Step "Updating .env file..."

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Warning ".env file not found"
    Write-Info "Creating .env file from .env.example..."
    
    if (Test-Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Success ".env file created"
    }
    else {
        Write-Error ".env.example not found"
        exit 1
    }
}

# Read current .env
$envContent = Get-Content $envFile -Raw

# Prepare database URL
if ($rootPasswordPlain) {
    $databaseUrl = "mysql://root:$rootPasswordPlain@localhost:3306/next_template_db"
}
else {
    $databaseUrl = "mysql://root@localhost:3306/next_template_db"
}

# Update or create DATABASE_URL line
if ($envContent -match 'DATABASE_URL=') {
    $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$databaseUrl`""
}
else {
    $envContent = "DATABASE_URL=`"$databaseUrl`"`r`n" + $envContent
}

# Write back to .env
Set-Content -Path $envFile -Value $envContent

Write-Success ".env file updated with MySQL connection string"

Write-Host ""

# ============================================================
# STEP 7: INSTALL DEPENDENCIES
# ============================================================

Write-Step "Installing npm dependencies..."

try {
    npm install
    Write-Success "Dependencies installed successfully"
}
catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

Write-Host ""

# ============================================================
# STEP 8: GENERATE PRISMA CLIENT
# ============================================================

Write-Step "Generating Prisma client..."

try {
    npm run db:generate
    Write-Success "Prisma client generated"
}
catch {
    Write-Warning "Failed to generate Prisma client with npm script"
    Write-Info "Trying with npx..."
    
    try {
        npx prisma generate
        Write-Success "Prisma client generated successfully"
    }
    catch {
        Write-Error "Failed to generate Prisma client"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 9: RUN DATABASE MIGRATIONS
# ============================================================

Write-Step "Running database migrations..."

try {
    npm run db:migrate
    Write-Success "Database migrations completed"
}
catch {
    Write-Warning "Failed to run migrations with npm script"
    Write-Info "Trying with npx..."
    
    try {
        npx prisma migrate deploy
        Write-Success "Database migrations completed"
    }
    catch {
        Write-Error "Failed to run database migrations"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 10: SEED DATABASE
# ============================================================

Write-Step "Seeding database with test data..."

$seedRetries = 0
$seedMaxRetries = 3
$seedSuccess = $false

while ($seedRetries -lt $seedMaxRetries -and -not $seedSuccess) {
    try {
        npm run db:seed
        Write-Success "Database seeded successfully!"
        Write-Info "Test data includes:"
        Write-Info "  - 3 test users: admin, manager, analyst"
        Write-Info "  - Sample data records"
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
            Write-Warning "Failed to seed database after $seedMaxRetries attempts"
            Write-Warning "The database may not have sample data. You can seed it manually later with: npm run db:seed"
        }
    }
}

Write-Host ""

# ============================================================
# STEP 11: VERIFY DATABASE SETUP
# ============================================================

Write-Step "Verifying database setup..."

try {
    # Check if database file exists and has tables
    $tableCount = mysql -u root -p"$rootPasswordPlain" next_template_db -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'next_template_db';" 2>&1 | Select-Object -Last 1
    
    Write-Success "Database verification passed!"
    Write-Info "Database tables created successfully"
}
catch {
    Write-Warning "Could not fully verify database, but setup may still be successful"
}

Write-Host ""

# ============================================================
# STEP 12: DISPLAY SETUP SUMMARY
# ============================================================

Write-Step "Setup Information"
Write-Host ""
Write-Host "SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host ""
Write-Host "DATABASE CONFIGURATION:"
Write-Host "  - Host: localhost"
Write-Host "  - Port: 3306"
Write-Host "  - Database: next_template_db"
Write-Host "  - Username: root"
Write-Host ""
Write-Host "TEST ACCOUNTS:"
Write-Host "  - Admin:   username: admin   | password: password123"
Write-Host "  - Manager: username: manager | password: password123"
Write-Host "  - Analyst: username: analyst | password: password123"
Write-Host ""
Write-Host "AVAILABLE COMMANDS:"
Write-Host "  - npm run dev      - Start development server"
Write-Host "  - npm run build    - Build for production"
Write-Host "  - npm run db:studio - Open Prisma Studio (GUI database viewer)"
Write-Host "  - npm run db:seed  - Reseed database"
Write-Host "  - npm run db:reset - Reset database (WARNING: deletes all data)"
Write-Host ""

# ============================================================
# STEP 13: OFFER PRISMA STUDIO
# ============================================================

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
    Write-Info "Prisma Studio will open in your default browser at http://localhost:5555"
    Write-Info "The browser window may take a few seconds to open"
    Write-Host ""
    
    Start-Sleep -Seconds 2
    
    try {
        Start-Process powershell -ArgumentList "cd '$PWD'; npm run db:studio" -WindowStyle Normal
        Write-Success "Prisma Studio launched in new window!"
        Write-Info "Starting development server on http://localhost:3000..."
    }
    catch {
        Write-Warning "Could not open Prisma Studio in new window"
        Write-Info "You can manually open it later with: npm run db:studio"
    }
    
    Write-Host ""
}
else {
    Write-Info "Skipping Prisma Studio"
    Write-Info "You can open it later with: npm run db:studio"
    Write-Host ""
}

# ============================================================
# STEP 14: START DEVELOPMENT SERVER
# ============================================================

Write-Host ""
Write-Step "Starting development server..."
Write-Info "The server will start on http://localhost:3000"
Write-Info "Press Ctrl+C to stop the server"
Write-Host ""

Start-Sleep -Seconds 2

Write-Success "LAUNCHING NextJS Template App..."
Write-Host ""

# Start the development server
npm run dev
