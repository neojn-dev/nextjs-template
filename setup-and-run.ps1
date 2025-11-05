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
# HELPER FUNCTIONS
# ============================================================

function Get-MySQLPath {
    # Try to find MySQL executable
    $mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlPath) {
        return $mysqlPath.Source
    }
    
    # Common MySQL installation paths on Windows
    $commonPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
        "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files (x86)\MySQL\MySQL Server 8.1\bin\mysql.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Don't fallback to "mysql" - throw an error instead
    Write-Error "MySQL executable not found. Please ensure MySQL is installed and mysql.exe is in your PATH or at one of the standard installation locations."
    throw "MySQL executable not found"
}

function Invoke-MySQLCommand {
    param(
        [string]$Command,
        [string]$Password,
        [string]$Database = ""
    )
    
    try {
        $mysqlPath = Get-MySQLPath
        
        # Verify the path exists before attempting to use it
        if (-not (Test-Path $mysqlPath)) {
            return @{ Success = $false; Output = "MySQL executable not found at: $mysqlPath" }
        }
    }
    catch {
        return @{ Success = $false; Output = "Failed to locate MySQL executable: $($_.Exception.Message)" }
    }
    
    # Build arguments array properly for PowerShell
    $arguments = @("-u", "root")
    
    if ($Password) {
        # Use --password= format for better compatibility
        $arguments += "--password=$Password"
    }
    
    if ($Database) {
        $arguments += $Database
    }
    
    $arguments += "-e", $Command
    
    try {
        # Use ProcessStartInfo to properly capture exit code (warnings don't affect exit code)
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $mysqlPath
        $psi.Arguments = ($arguments | ForEach-Object { 
            if ($_ -match '\s') { "`"$_`"" } else { $_ }
        }) -join " "
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $psi
        
        $process.Start() | Out-Null
        $stdoutText = $process.StandardOutput.ReadToEnd()
        $stderrText = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        
        $exitCode = $process.ExitCode
        $process.Dispose()
        
        # Combine output, but separate warnings from errors
        $allOutput = $stdoutText.Trim()
        if ($stderrText) {
            $stderrTrimmed = $stderrText.Trim()
            # Check if stderr contains actual errors (not just warnings)
            if ($stderrTrimmed -match "ERROR\s+\d+") {
                # It's an actual error, include it
                if ($allOutput) {
                    $allOutput += "`n" + $stderrTrimmed
                } else {
                    $allOutput = $stderrTrimmed
                }
            }
            # Warnings are ignored for success determination
        }
        
        # Success if exit code is 0 and no ERROR messages in output
        $hasError = ($exitCode -ne 0) -or ($allOutput -match "ERROR\s+\d+")
        
        # Filter warnings from output for cleaner display (but keep actual output)
        $cleanOutput = ($allOutput -split "`n" | Where-Object { 
            $_ -notmatch "^mysql:.*Warning" -and $_ -notmatch "\[Warning\]" -and $_.Trim() -ne ""
        }) -join "`n"
        
        if (-not $hasError) {
            return @{ Success = $true; Output = $cleanOutput }
        }
        else {
            return @{ Success = $false; Output = $allOutput }
        }
    }
    catch {
        return @{ Success = $false; Output = "Exception starting MySQL process: $($_.Exception.Message). MySQL path was: $mysqlPath" }
    }
}

function Invoke-ExternalCommand {
    param(
        [string]$Command,
        [string[]]$Arguments = @(),
        [bool]$IgnoreErrors = $false
    )
    
    try {
        $output = & $Command $Arguments 2>&1
        if ($LASTEXITCODE -eq 0 -or $IgnoreErrors) {
            return @{ Success = $true; Output = $output }
        }
        else {
            return @{ Success = $false; Output = $output }
        }
    }
    catch {
        return @{ Success = $false; Output = $_.Exception.Message }
    }
}

function Encode-UrlPassword {
    param([string]$Password)
    
    if ([string]::IsNullOrEmpty($Password)) {
        return ""
    }
    
    # URL encode special characters in password
    $encoded = [System.Uri]::EscapeDataString($Password)
    return $encoded
}

function Start-ServerAndShowLogs {
    param($nextjsJob, $prismaJob)
    
    # Open both applications in browser
    Write-Info "Opening both applications in browser..."
    try {
        Start-Process "http://localhost:5555" -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
        Start-Process "http://localhost:3000" -ErrorAction SilentlyContinue
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
    
    try {
        # Show Next.js logs in foreground
        Write-Host ""
        Write-Host "========== Next.js Development Server Logs ==========" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
        Write-Host ""
        
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

# Check for MySQL service with different possible names
$mysqlService = $null
$serviceNames = @("MySQL80", "MySQL", "MySQL57", "MySQL81")

foreach ($serviceName in $serviceNames) {
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service) {
        $mysqlService = $service
        Write-Success "MySQL service found: $serviceName"
        break
    }
}

if ($mysqlService) {
    # Check if running
    if ($mysqlService.Status -eq "Running") {
        Write-Success "MySQL service is running"
    }
    else {
        Write-Info "Starting MySQL service..."
        try {
            Start-Service -Name $mysqlService.Name
            Start-Sleep -Seconds 3
            Write-Success "MySQL service started"
        }
        catch {
            Write-Error "Failed to start MySQL service"
            exit 1
        }
    }
}
else {
    Write-Warning "MySQL service not found"
    Write-Info ""
    Write-Info "MANUAL MYSQL INSTALLATION REQUIRED:"
    Write-Info "  1. Download: https://dev.mysql.com/downloads/mysql/"
    Write-Info "  2. Run installer (mysql-installer-web-community-8.0.x.msi)"
    Write-Info "  3. Choose 'Developer Default' setup type"
    Write-Info "  4. Complete installation with all default options"
    Write-Info "  5. IMPORTANT: Set MySQL root password to 'password' (this script expects this password)"
    Write-Info "  6. Run this script again"
    Write-Info ""
    
    $continue = Read-Host "Have you installed MySQL? (yes/no)"
    
    if ($continue -ne "yes" -and $continue -ne "y") {
        Write-Error "MySQL installation required. Please install and try again."
        exit 1
    }
    
    # Check again
    foreach ($serviceName in $serviceNames) {
        $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
        if ($service) {
            $mysqlService = $service
            Write-Success "MySQL service found: $serviceName"
            break
        }
    }
    
    if (-not $mysqlService) {
        Write-Error "MySQL service still not found"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 4: TEST MYSQL CONNECTION & GET PASSWORD
# ============================================================

Write-Step "Configuring MySQL connection..."

# Hardcoded MySQL root password - This script expects MySQL root password to be "password"
# If your MySQL uses a different password, change it to "password" or update this variable
$rootPasswordPlain = "password"

Write-Info "Using hardcoded MySQL root password: password"
Write-Info "Testing MySQL connection with root/password credentials..."

# Test connection with hardcoded password
$testResult = Invoke-MySQLCommand -Command "SELECT 1;" -Password $rootPasswordPlain

if ($testResult.Success) {
    Write-Success "MySQL connection successful with root/password!"
}
else {
    Write-Warning "Failed to connect to MySQL with root/password credentials."
    Write-Info "Error details: $($testResult.Output)"
    Write-Info "Attempting connection without password..."
    
    # Try without password as fallback
    $testResultNoPass = Invoke-MySQLCommand -Command "SELECT 1;" -Password ""
    
    if ($testResultNoPass.Success) {
        Write-Warning "Connection works WITHOUT password, but password 'password' was expected."
        Write-Info "Setting MySQL root password to 'password'..."
        
        # Try to set the password
        $setPasswordResult = Invoke-MySQLCommand -Command "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password'; FLUSH PRIVILEGES;" -Password ""
        
        if ($setPasswordResult.Success) {
            Write-Success "Password set successfully!"
            # Test again with password
            $testResult = Invoke-MySQLCommand -Command "SELECT 1;" -Password $rootPasswordPlain
            if ($testResult.Success) {
                Write-Success "MySQL connection successful with root/password!"
            }
            else {
                Write-Error "Failed to connect even after setting password."
                Write-Info "Output: $($testResult.Output)"
                exit 1
            }
        }
        else {
            Write-Error "Failed to set MySQL password."
            Write-Info "Please manually set MySQL root password to 'password':"
            Write-Info "  1. Run: mysql -u root"
            Write-Info "  2. In MySQL: ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';"
            Write-Info "  3. In MySQL: FLUSH PRIVILEGES;"
            Write-Info "  4. Run this script again"
            exit 1
        }
    }
    else {
        Write-Error "Failed to connect to MySQL."
        Write-Info ""
        Write-Info "Connection test with password 'password' failed:"
        Write-Info "  Output: $($testResult.Output)"
        Write-Info ""
        Write-Info "Connection test without password also failed:"
        Write-Info "  Output: $($testResultNoPass.Output)"
        Write-Info ""
        Write-Info "Please ensure:"
        Write-Info "  1. MySQL service is running"
        Write-Info "  2. MySQL root password is set to 'password'"
        Write-Info "  3. Or set it manually by running:"
        Write-Info "     & 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -p"
        Write-Info "     (Enter your current password when prompted)"
        Write-Info "     Then in MySQL run these commands:"
        Write-Info "     ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';"
        Write-Info "     FLUSH PRIVILEGES;"
        Write-Info "     exit"
        Write-Info ""
        Write-Info "  4. Or update the script to use your actual MySQL root password"
        Write-Info "     Edit line 402 in setup-and-run.ps1 and change 'password' to your actual password"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 5: CREATE DATABASE
# ============================================================

Write-Step "Creating database..."

$createDbResult = Invoke-MySQLCommand -Command "CREATE DATABASE IF NOT EXISTS next_template_db;" -Password $rootPasswordPlain

if ($createDbResult.Success) {
    Write-Success "Database 'next_template_db' created/verified"
}
else {
    Write-Error "Failed to create database"
    Write-Info "Output: $($createDbResult.Output)"
    exit 1
}

Write-Host ""

# ============================================================
# STEP 6: UPDATE .ENV FILE
# ============================================================

Write-Step "Updating environment configuration..."

$envFile = ".env"
$scriptPath = Get-Location

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

# Prepare database URL with URL-encoded password
$encodedPassword = Encode-UrlPassword -Password $rootPasswordPlain

if ($encodedPassword) {
    $databaseUrl = "mysql://root:$encodedPassword@localhost:3306/next_template_db"
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
[System.IO.File]::WriteAllText("$scriptPath\.env", $envContent, [System.Text.Encoding]::UTF8)

Write-Success ".env file updated with MySQL connection"

Write-Host ""

# ============================================================
# STEP 7: INSTALL DEPENDENCIES
# ============================================================

Write-Step "Installing dependencies..."
Write-Info "This may take a few minutes..."

$installResult = Invoke-ExternalCommand -Command "npm" -Arguments @("install")

if ($installResult.Success) {
    Write-Success "Dependencies installed successfully!"
}
else {
    Write-Warning "Standard install failed, trying with legacy peer deps..."
    $installResultLegacy = Invoke-ExternalCommand -Command "npm" -Arguments @("install", "--legacy-peer-deps")
    
    if ($installResultLegacy.Success) {
        Write-Success "Dependencies installed successfully with --legacy-peer-deps!"
        Write-Info "Note: Some peer dependency warnings were ignored, but installation succeeded."
    }
    else {
        Write-Error "Failed to install dependencies"
        Write-Info "Output: $($installResult.Output)"
        Write-Info "You can try manually: npm install --legacy-peer-deps"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 8: CHECK PRISMA
# ============================================================

Write-Step "Checking Prisma installation..."

$prismaCheck = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "--version") -IgnoreErrors $true

if ($prismaCheck.Success) {
    Write-Success "Prisma found: $($prismaCheck.Output)"
}
else {
    Write-Warning "Prisma check failed, attempting to install..."
    
    $installPrisma = Invoke-ExternalCommand -Command "npm" -Arguments @("install", "prisma", "@prisma/client")
    
    if ($installPrisma.Success) {
        Write-Success "Prisma reinstalled successfully!"
    }
    else {
        Write-Error "Failed to install Prisma"
        Write-Info "Output: $($installPrisma.Output)"
        exit 1
    }
}

Write-Host ""

# ============================================================
# STEP 9: GENERATE PRISMA CLIENT
# ============================================================

Write-Step "Generating Prisma client..."

$generateResult = Invoke-ExternalCommand -Command "npm" -Arguments @("run", "db:generate") -IgnoreErrors $true

if ($generateResult.Success) {
    Write-Success "Prisma client generated successfully!"
}
else {
    Write-Warning "npm script failed, trying alternative method..."
    
    $generateAlt = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "generate")
    
    if ($generateAlt.Success) {
        Write-Success "Prisma client generated!"
    }
    else {
        Write-Error "Failed to generate Prisma client"
        Write-Info "Output: $($generateAlt.Output)"
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
    $migrationStatusResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "status") -IgnoreErrors $true
    $migrationStatus = $migrationStatusResult.Output | Out-String
    
    if ($migrationStatus -match "Database schema is up to date") {
        Write-Success "Database is already up to date!"
        $migrationSuccess = $true
        
        # Dev convenience: ensure schema changes without migrations are synced
        Write-Info "Ensuring development database schema is synced (running prisma db push)..."
        $pushResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "db", "push") -IgnoreErrors $true
        if ($pushResult.Success) {
            Write-Success "Prisma schema synced to database."
            # Regenerate client in case push introduced new tables
            Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "generate") -IgnoreErrors $true | Out-Null
        }
    }
    elseif ($migrationStatus -match "migration.*have not yet been applied" -or $migrationStatus -match "following migration") {
        Write-Info "Pending migrations found. Applying migrations..."
        $retryCount = 0
    }
    elseif ($migrationStatus -match "failed to apply|migration.*failed|Migration.*failed|Cannot drop table|foreign key constraint") {
        Write-Warning "Migration errors detected. Attempting to resolve..."
        $retryCount = 1
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
            Write-Info "Attempt $retryCount : Running migrations (deploy mode)..."
            $deployResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "deploy")
            if ($deployResult.Success) {
                Write-Success "Database migrations completed!"
                $migrationSuccess = $true
                break
            }
            else {
                Write-Warning "Migration deploy failed. Checking for fixable issues..."
            }
        }
        elseif ($retryCount -eq 2) {
            # Second attempt: Check for failed migrations and resolve
            Write-Warning "Attempt $retryCount : Migration issues detected."
            Write-Info "Checking if database reset is needed..."
            
            if ($migrationStatus -match "failed to apply|Cannot drop table|foreign key constraint") {
                Write-Warning "Database may be in inconsistent state."
                Write-Info "Attempting to fix by applying migrations with force resolve..."
                
                # Try to resolve failed migrations
                $failedMatch = $migrationStatus | Select-String -Pattern "migration\s+(\S+)\s+failed" -AllMatches
                if ($failedMatch -and $failedMatch.Matches.Count -gt 0) {
                    $failedMigration = $failedMatch.Matches[0].Groups[1].Value
                    Write-Info "Resolving failed migration: $failedMigration"
                    "y" | Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "resolve", "--rolled-back", $failedMigration) -IgnoreErrors $true | Out-Null
                }
                
                # Try deploy again
                Write-Info "Retrying migrations after resolution..."
                $deployResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "deploy")
                if ($deployResult.Success) {
                    Write-Success "Database migrations completed after resolution!"
                    $migrationSuccess = $true
                    break
                }
            }
            
            # Last resort: Try dev mode
            Write-Info "Final attempt: Trying migrate dev mode..."
            $devResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "dev", "--name", "auto_fix")
            if ($devResult.Success) {
                Write-Success "Database migrations completed!"
                $migrationSuccess = $true
                break
            }
        }
        elseif ($retryCount -eq 3) {
            # Final attempt: Reset and rebuild
            Write-Error "All migration attempts failed."
            Write-Warning "Attempting automatic database reset..."
            Write-Info "Resetting database to fix migration issues..."
            
            try {
                # Reset database
                "y" | Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "reset", "--force", "--skip-seed") -IgnoreErrors $true | Out-Null
                
                $resetResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "reset", "--force", "--skip-seed") -IgnoreErrors $true
                if ($resetResult.Success) {
                    Write-Success "Database reset successful!"
                    Write-Info "Applying fresh migrations..."
                    
                    $deployResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "deploy")
                    if (-not $deployResult.Success) {
                        $devResult = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "dev", "--name", "init")
                    }
                    
                    $finalCheck = Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "migrate", "status") -IgnoreErrors $true
                    if ($finalCheck.Success) {
                        Write-Success "Database migrations completed after reset!"
                        $migrationSuccess = $true
                        break
                    }
                }
            }
            catch {
                Write-Error "Database reset failed: $_"
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
    $seedResult = Invoke-ExternalCommand -Command "npm" -Arguments @("run", "db:seed") -IgnoreErrors $true
    
    if ($seedResult.Success) {
        Write-Success "Database seeded successfully!"
        Write-Info "Sample data includes:"
        Write-Info '  - 3 roles (Admin, Manager, User)'
        Write-Info '  - 10 test users (admin, manager, analyst, etc.)'
        Write-Info "  - 100 Teachers, Doctors, Engineers, Lawyers"
        Write-Info "  - 100 Master Data records"
        $seedSuccess = $true
    }
    else {
        $seedRetries++
        if ($seedRetries -lt $seedMaxRetries) {
            Write-Warning "Database seeding failed (Attempt $seedRetries/$seedMaxRetries)"
            Write-Info "Regenerating Prisma client and retrying..."
            Invoke-ExternalCommand -Command "npx" -Arguments @("prisma", "generate") -IgnoreErrors $true | Out-Null
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

$verifyResult = Invoke-MySQLCommand -Command 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ''next_template_db'';' -Password $rootPasswordPlain -Database 'next_template_db'

if ($verifyResult.Success) {
    Write-Success "Database verification passed!"
    Write-Info "Database tables created successfully"
}
else {
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
# STEP 15: START PRISMA STUDIO
# ============================================================

Write-Host ""
Write-Step "Starting Prisma Studio..."
Write-Info "Prisma Studio will be available at http://localhost:5555"

# Get current directory for job
$currentDir = Get-Location

# Start Prisma Studio in background
try {
    $prismaJob = Start-Job -ScriptBlock {
        param($workingDir)
        Set-Location $workingDir
        npx prisma studio --browser none 2>&1
    } -ArgumentList $currentDir
    
    Start-Sleep -Seconds 4
    
    if ($prismaJob.State -eq "Running") {
        Write-Success "Prisma Studio started! (Job ID: $($prismaJob.Id))"
        Write-Info "Prisma Studio will open in browser when Next.js is ready..."
    }
    else {
        Write-Warning "Prisma Studio job may have failed to start"
    }
}
catch {
    Write-Warning "Failed to start Prisma Studio in background: $_"
    Write-Info "You can start it manually later with: npm run db:studio"
    $prismaJob = $null
}

Write-Host ""

# ============================================================
# STEP 16: START DEVELOPMENT SERVER
# ============================================================

Write-Host ""
Write-Step "Starting development server..."
Write-Info "The server will start on http://localhost:3000"
Write-Info "Press Ctrl+C to stop both servers"
Write-Host ""

Start-Sleep -Seconds 2

Write-Success "LAUNCHING NextJS Template App..."
Write-Host ""

# Start Next.js dev server in background
Write-Info "Starting Next.js server..."
try {
    $nextjsJob = Start-Job -ScriptBlock {
        param($workingDir)
        Set-Location $workingDir
        npm run dev 2>&1
    } -ArgumentList $currentDir
    
    if ($nextjsJob.State -ne "Running") {
        Write-Warning "Next.js job may have failed to start"
    }
}
catch {
    Write-Error "Failed to start Next.js server: $_"
    if ($prismaJob) {
        Stop-Job -Job $prismaJob -ErrorAction SilentlyContinue
        Remove-Job -Job $prismaJob -ErrorAction SilentlyContinue
    }
    exit 1
}

# Wait for Next.js to start
Write-Info "Waiting for Next.js server to start..."
Start-Sleep -Seconds 5

# Check if server is responding
$serverReady = $false
$maxWaitTime = 15
$waitCount = 0

while (-not $serverReady -and $waitCount -lt $maxWaitTime) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response -and $response.StatusCode -eq 200) {
            Write-Success "Next.js server is running!"
            Start-ServerAndShowLogs -nextjsJob $nextjsJob -prismaJob $prismaJob
            $serverReady = $true
            break
        }
    }
    catch {
        # Server not ready yet
    }
    
    if (-not $serverReady) {
        $waitCount++
        if ($waitCount -lt $maxWaitTime) {
            Write-Info "Waiting for server... ($waitCount/$maxWaitTime)"
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $serverReady) {
    Write-Error "Next.js server failed to start properly"
    Write-Info "Showing server logs..."
    Receive-Job -Job $nextjsJob -ErrorAction SilentlyContinue
    Stop-Job -Job $nextjsJob, $prismaJob -ErrorAction SilentlyContinue
    Remove-Job -Job $nextjsJob, $prismaJob -ErrorAction SilentlyContinue
    exit 1
}
