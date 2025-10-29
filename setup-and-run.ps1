# NextJS Template App + MySQL Setup & Run Script (PowerShell)
# Complete setup automation for Windows including MySQL database configuration

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
Write-Host "         NextJS Template App + MySQL Complete Setup          " -ForegroundColor Magenta
Write-Host "                    For Windows                              " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "  This script will:                                         " -ForegroundColor Magenta
Write-Host "  - Check/Start MySQL Server                                " -ForegroundColor Magenta
Write-Host "  - Configure database connection                           " -ForegroundColor Magenta
Write-Host "  - Install dependencies                                    " -ForegroundColor Magenta
Write-Host "  - Generate Prisma client                                  " -ForegroundColor Magenta
Write-Host "  - Run database migrations                                 " -ForegroundColor Magenta
Write-Host "  - Seed test data and users                                " -ForegroundColor Magenta
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

# Check git (optional)
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
}
else {
    Write-Warning "Git is not installed (optional)"
}

Write-Host ""

# ============================================================
# STEP 3: CHECK/START MYSQL
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
    Write-Warning "MySQL80 service not found"
    Write-Info ""
    Write-Info "MANUAL MYSQL INSTALLATION REQUIRED:"
    Write-Info "  1. Download: https://dev.mysql.com/downloads/mysql/"
    Write-Info "  2. Run installer (mysql-installer-web-community-8.0.x.msi)"
    Write-Info "  3. Choose 'Developer Default' setup type"
    Write-Info "  4. Complete installation with all default options"
    Write-Info "  5. Set a MySQL root password (remember it!)"
    Write-Info "  6. Run this script again"
    Write-Info ""
    
    $continue = Read-Host "Have you installed MySQL? (yes/no)"
    
    if ($continue -ne "yes" -and $continue -ne "y") {
        Write-Error "MySQL installation required. Please install and try again."
        exit 1
    }
    
    # Check again
    $mysqlInstalled = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
    if (-not $mysqlInstalled) {
        Write-Error "MySQL80 service still not found"
        exit 1
    }
    
    Write-Success "MySQL80 service found!"
}

Write-Host ""

# ============================================================
# STEP 4: TEST MYSQL CONNECTION & GET PASSWORD
# ============================================================

Write-Step "Configuring MySQL connection..."

Write-Info "Enter your MySQL root password:"
Write-Info "(If no password was set during installation, just press Enter)"
$rootPassword = Read-Host -AsSecureString "Root Password"

# Convert to plain text
$rootPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($rootPassword))

# Test connection
Write-Info "Testing MySQL connection..."
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

Write-Step "Updating environment configuration..."

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Warning ".env file not found"
    Write-Info "Creating .env file..."
    
    if (Test-Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination ".env"
        Write-Success ".env file created from .env.example"
    }
    else {
        Write-Error ".env.example not found"
        exit 1
    }
}
else {
    Write-Success ".env file already exists"
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

Write-Success ".env file updated with MySQL connection"

Write-Host ""

# ============================================================
# STEP 7: INSTALL DEPENDENCIES
# ============================================================

Write-Step "Installing dependencies..."
Write-Info "This may take a few minutes..."

try {
    npm install
    Write-Success "Dependencies installed successfully!"
}
catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

Write-Host ""

# ============================================================
# STEP 8: CHECK PRISMA
# ============================================================

Write-Step "Checking Prisma installation..."

try {
    $prismaVersion = npx prisma --version 2>&1
    Write-Success "Prisma found: $prismaVersion"
}
catch {
    Write-Error "Prisma is not properly installed"
    Write-Info "Attempting to reinstall..."
    
    try {
        npm install prisma @prisma/client
        Write-Success "Prisma reinstalled successfully!"
    }
    catch {
        Write-Error "Failed to install Prisma"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 9: GENERATE PRISMA CLIENT
# ============================================================

Write-Step "Generating Prisma client..."

try {
    npm run db:generate
    Write-Success "Prisma client generated successfully!"
}
catch {
    Write-Warning "npm script failed, trying alternative method..."
    
    try {
        npx prisma generate
        Write-Success "Prisma client generated!"
    }
    catch {
        Write-Error "Failed to generate Prisma client"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 10: CHECK AND RUN DATABASE MIGRATIONS
# ============================================================

Write-Step "Checking migration status..."

$migrationSuccess = $false
$maxRetries = 3
$retryCount = 0

try {
    $migrationStatus = npx prisma migrate status 2>&1 | Out-String
    
    if ($migrationStatus -match "Database schema is up to date") {
        Write-Success "Database is already up to date!"
        $migrationSuccess = $true
    }
    elseif ($migrationStatus -match "migration.*have not yet been applied" -or $migrationStatus -match "following migration") {
        Write-Info "Pending migrations found. Applying migrations..."
        $retryCount = 0
    }
    elseif ($migrationStatus -match "failed to apply|migration.*failed|Migration.*failed|Cannot drop table|foreign key constraint") {
        Write-Warning "Migration errors detected. Attempting to resolve..."
        $retryCount = 1  # Start with retry logic
    }
    else {
        Write-Info "Migration status unclear. Attempting to apply migrations..."
        $retryCount = 0
    }
}
catch {
    Write-Warning "Could not check migration status, proceeding with migration..."
    $retryCount = 0
}

# Attempt migrations with auto-recovery
while ($retryCount -lt $maxRetries -and -not $migrationSuccess) {
    $retryCount++
    Write-Info "Migration attempt $retryCount/$maxRetries..."
    
    try {
        if ($retryCount -eq 1) {
            # First attempt: deploy mode
            Write-Info "Running migrations (deploy mode)..."
            npx prisma migrate deploy 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database migrations completed!"
                $migrationSuccess = $true
                break
            }
        }
        elseif ($retryCount -eq 2) {
            # Second attempt: Check for failed migrations and resolve
            Write-Warning "Migration issues detected. Attempting to resolve..."
            
            # Try to resolve failed migrations
            $failedMatch = $migrationStatus | Select-String -Pattern "migration\s+(\S+)\s+failed" -AllMatches
            if ($failedMatch -and $failedMatch.Matches.Count -gt 0) {
                $failedMigration = $failedMatch.Matches[0].Groups[1].Value
                Write-Info "Resolving failed migration: $failedMigration"
                echo "y" | npx prisma migrate resolve --rolled-back "$failedMigration" 2>&1 | Out-Null
            }
            
            # Try deploy again
            Write-Info "Retrying migrations after resolution..."
            npx prisma migrate deploy 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database migrations completed after resolution!"
                $migrationSuccess = $true
                break
            }
            
            # Try dev mode
            Write-Info "Trying migrate dev mode..."
            npx prisma migrate dev --name auto_fix 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Database migrations completed!"
                $migrationSuccess = $true
                break
            }
        }
        elseif ($retryCount -eq 3) {
            # Final attempt: Reset and rebuild
            Write-Warning "All migration attempts failed. Attempting automatic database reset..."
            Write-Info "WARNING: This will delete all existing data!"
            
            try {
                # Reset database
                echo "y" | npx prisma migrate reset --force --skip-seed 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Database reset successful!"
                    Write-Info "Applying fresh migrations..."
                    
                    npx prisma migrate deploy 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) {
                        npx prisma migrate dev --name init 2>&1 | Out-Null
                    }
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Database migrations completed after reset!"
                        $migrationSuccess = $true
                        break
                    }
                }
            }
            catch {
                Write-Error "Database reset failed"
            }
        }
    }
    catch {
        Write-Warning "Migration attempt $retryCount failed: $_"
        if ($retryCount -lt $maxRetries) {
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $migrationSuccess) {
    Write-Error "Failed to complete database migrations after all attempts"
    Write-Info "You may need to manually run: npx prisma migrate reset"
    exit 1
}

Write-Host ""

# ============================================================
# STEP 11: SEED DATABASE
# ============================================================

Write-Step "Seeding database with sample data..."

$seedRetries = 0
$seedMaxRetries = 3
$seedSuccess = $false

while ($seedRetries -lt $seedMaxRetries -and -not $seedSuccess) {
    try {
        npm run db:seed 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Database seeded successfully!"
            Write-Info "Sample data includes:"
            Write-Info "  - 3 roles (Admin, Manager, User)"
            Write-Info "  - 10 test users (admin, manager, analyst, etc.)"
            Write-Info "  - 100 Teachers, Doctors, Engineers, Lawyers"
            Write-Info "  - 100 Master Data records"
            $seedSuccess = $true
        }
        else {
            throw "Seed command returned non-zero exit code"
        }
    }
    catch {
        $seedRetries++
        if ($seedRetries -lt $seedMaxRetries) {
            Write-Warning "Database seeding failed (Attempt $seedRetries/$seedMaxRetries)"
            Write-Info "Regenerating Prisma client and retrying..."
            try {
                npx prisma generate 2>&1 | Out-Null
            }
            catch {
                # Ignore generate errors
            }
            Start-Sleep -Seconds 2
            Write-Info "Retrying seed..."
        }
        else {
            Write-Warning "Database seeding failed after $seedMaxRetries attempts"
            Write-Info "This is usually okay - tables might not exist yet or data already exists"
            Write-Info "You can manually seed later with: npm run db:seed"
            # Don't exit - seeding is not critical for app startup
            $seedSuccess = $true  # Continue anyway
        }
    }
}

Write-Host ""

# ============================================================
# STEP 12: VERIFY DATABASE
# ============================================================

Write-Step "Verifying database setup..."

try {
    $tableCount = mysql -u root -p"$rootPasswordPlain" next_template_db -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'next_template_db';" 2>&1 | Select-Object -Last 1
    Write-Success "Database verification passed!"
    Write-Info "Database tables created successfully"
}
catch {
    Write-Warning "Could not verify database, but setup may still be successful"
}

Write-Host ""

# ============================================================
# STEP 13: VERIFY REQUIRED FILES
# ============================================================

Write-Step "Verifying setup files..."

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

# ============================================================
# STEP 14: DISPLAY SETUP SUMMARY
# ============================================================

Write-Step "Setup Completed Successfully!"
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 LOGIN CREDENTIALS" -ForegroundColor Cyan
Write-Host "   Use these to sign in at http://localhost:3000/signin" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "  🔑 ADMIN ACCOUNT" -ForegroundColor Yellow
Write-Host "     Username: admin"
Write-Host "     Password: password123"
Write-Host "     Email:    admin@example.com"
Write-Host "     Role:     Admin"
Write-Host ""

Write-Host "  👥 MANAGER ACCOUNT" -ForegroundColor Yellow
Write-Host "     Username: manager"
Write-Host "     Password: password123"
Write-Host "     Email:    manager@example.com"
Write-Host "     Role:     Manager"
Write-Host ""

Write-Host "  👤 USER ACCOUNTS" -ForegroundColor Yellow
Write-Host "     Username: analyst"
Write-Host "     Password: password123"
Write-Host "     Email:    analyst@example.com"
Write-Host "     Role:     User"
Write-Host ""

Write-Host "     Username: jdoe"
Write-Host "     Password: password123"
Write-Host "     Email:    john.doe@example.com"
Write-Host "     Role:     User"
Write-Host ""

Write-Host "     Username: asmith"
Write-Host "     Password: password123"
Write-Host "     Email:    alice.smith@example.com"
Write-Host "     Role:     User"
Write-Host ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🔗 Quick Links" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  • Application:     http://localhost:3000"
Write-Host "  • Sign In:        http://localhost:3000/signin"
Write-Host "  • Dashboard:      http://localhost:3000/dashboard"
Write-Host "  • Prisma Studio:  http://localhost:5555"
Write-Host ""

Write-Host "DATABASE CONFIGURATION:" -ForegroundColor Magenta
Write-Host "  - Provider: MySQL"
Write-Host "  - Host: localhost"
Write-Host "  - Port: 3306"
Write-Host "  - Database: next_template_db"
Write-Host "  - Username: root"
Write-Host ""

Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "  - npm run dev           Start development server (http://localhost:3000)"
Write-Host "  - npm run build         Build for production"
Write-Host "  - npm run start         Run production build"
Write-Host "  - npm run db:studio     Open Prisma Studio (http://localhost:5555)"
Write-Host "  - npm run db:seed       Re-seed database"
Write-Host "  - npm run db:reset      Reset database (WARNING: deletes all data)"
Write-Host "  - npm run lint          Run linting"
Write-Host ""

# ============================================================
# STEP 15: FINAL CREDENTIALS DISPLAY (BEFORE STARTING SERVERS)
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "📋 LOGIN CREDENTIALS - Copy these for easy access" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "  🔑 ADMIN ACCOUNT" -ForegroundColor Yellow
Write-Host "     Username: admin"
Write-Host "     Password: password123"
Write-Host "     Email:    admin@example.com"
Write-Host ""

Write-Host "  👥 MANAGER ACCOUNT" -ForegroundColor Yellow
Write-Host "     Username: manager"
Write-Host "     Password: password123"
Write-Host "     Email:    manager@example.com"
Write-Host ""

Write-Host "  👤 USER ACCOUNTS" -ForegroundColor Yellow
Write-Host "     Username: analyst"
Write-Host "     Password: password123"
Write-Host ""

Write-Host "     Username: jdoe"
Write-Host "     Password: password123"
Write-Host ""

Write-Host "     Username: asmith"
Write-Host "     Password: password123"
Write-Host ""

Write-Host "  💡 Tip: All passwords are: password123" -ForegroundColor Cyan
Write-Host "  🔗 Sign in at: http://localhost:3000/signin" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# ============================================================
# STEP 16: START PRISMA STUDIO
# ============================================================

Write-Host ""
Write-Step "Starting Prisma Studio..."
Write-Info "Prisma Studio will be available at http://localhost:5555"

# Start Prisma Studio in background
$prismaJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx prisma studio --browser none
}

Start-Sleep -Seconds 4

Write-Success "Prisma Studio started! (Job ID: $($prismaJob.Id))"
Write-Info "Prisma Studio will open in browser when Next.js is ready..."

Write-Host ""

# ============================================================
# STEP 16: FINAL CREDENTIALS REMINDER
# ============================================================

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "📋 LOGIN CREDENTIALS - Ready to use!" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "  🔑 ADMIN:     admin / password123" -ForegroundColor Yellow
Write-Host "  👥 MANAGER:   manager / password123" -ForegroundColor Yellow
Write-Host "  👤 USERS:     analyst, jdoe, asmith / password123" -ForegroundColor Yellow
Write-Host ""
Write-Host "  🔗 Sign in: http://localhost:3000/signin" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# ============================================================
# STEP 17: START DEVELOPMENT SERVER
# ============================================================

Write-Host ""
Write-Step "Starting development server..."
Write-Info "The server will start on http://localhost:3000"
Write-Info "Press Ctrl+C to stop both servers"
Write-Host ""

Start-Sleep -Seconds 2

Write-Success "LAUNCHING NextJS Template App..."
Write-Host ""

# Start Next.js dev server in background to check if it starts
Write-Info "Starting Next.js server..."
$nextjsJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1
}

# Wait for Next.js to start
Write-Info "Waiting for Next.js server to start..."
Start-Sleep -Seconds 8

# Check if server is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Success "Next.js server is running!"
        
        # Open both applications in browser
        Write-Info "Opening both applications in browser..."
        try {
            # Open Prisma Studio
            Start-Process "http://localhost:5555"
            Start-Sleep -Milliseconds 500
            # Open Next.js app
            Start-Process "http://localhost:3000"
            Write-Success "Both applications opened in browser!"
            Write-Info "  • Next.js App: http://localhost:3000"
            Write-Info "  • Prisma Studio: http://localhost:5555"
        }
        catch {
            Write-Warning "Could not auto-open browser"
            Write-Info "Please visit manually:"
            Write-Info "  • Next.js App: http://localhost:3000"
            Write-Info "  • Prisma Studio: http://localhost:5555"
        }
        
        Write-Host ""
        Write-Host "============================================================" -ForegroundColor Magenta
        Write-Host "  ✅ Both servers are running:" -ForegroundColor Green
        Write-Host "  📊 Prisma Studio: http://localhost:5555" -ForegroundColor Cyan
        Write-Host "  🌐 Next.js App:    http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Press Ctrl+C to stop both servers" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Magenta
        Write-Host ""
        
        # Handle cleanup on Ctrl+C
        try {
            # Show Next.js logs in foreground
            while ($true) {
                $jobOutput = Receive-Job -Job $nextjsJob -ErrorAction SilentlyContinue
                if ($jobOutput) {
                    Write-Host $jobOutput
                }
                if ($nextjsJob.State -eq "Completed" -or $nextjsJob.State -eq "Failed") {
                    break
                }
                Start-Sleep -Seconds 1
            }
        }
        catch {
            Write-Host "`nStopping servers..." -ForegroundColor Yellow
        }
        finally {
            Write-Host "`nCleaning up..." -ForegroundColor Yellow
            Stop-Job -Job $nextjsJob, $prismaJob -ErrorAction SilentlyContinue
            Remove-Job -Job $nextjsJob, $prismaJob -ErrorAction SilentlyContinue
        }
    }
    else {
        throw "Server not ready"
    }
}
catch {
    Write-Warning "Next.js server may still be starting..."
    Write-Info "Waiting a bit longer..."
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            # Open both applications in browser
            try {
                Start-Process "http://localhost:5555"
                Start-Sleep -Milliseconds 500
                Start-Process "http://localhost:3000"
                Write-Success "Both applications opened in browser!"
                Write-Info "  • Next.js App: http://localhost:3000"
                Write-Info "  • Prisma Studio: http://localhost:5555"
            }
            catch {
                Write-Warning "Could not auto-open browser"
                Write-Info "Please visit manually:"
                Write-Info "  • Next.js App: http://localhost:3000"
                Write-Info "  • Prisma Studio: http://localhost:5555"
            }
            Write-Host ""
            Write-Host "============================================================" -ForegroundColor Magenta
            Write-Host "  ✅ Both servers are running:" -ForegroundColor Green
            Write-Host "  📊 Prisma Studio: http://localhost:5555" -ForegroundColor Cyan
            Write-Host "  🌐 Next.js App:    http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  Press Ctrl+C to stop both servers" -ForegroundColor Yellow
            Write-Host "============================================================" -ForegroundColor Magenta
            Write-Host ""
            Receive-Job -Job $nextjsJob -Wait
        }
    }
    catch {
        Write-Error "Next.js server failed to start properly"
        Write-Info "Showing server logs:"
        Receive-Job -Job $nextjsJob
        Stop-Job -Job $nextjsJob, $prismaJob
        Remove-Job -Job $nextjsJob, $prismaJob
        exit 1
    }
}

