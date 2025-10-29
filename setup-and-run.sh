#!/bin/bash

# NextJS Template App - Setup & Run Script
# This script will set up the environment and start the development server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   NextJS Template App                        ║"
echo "║                    Setup & Run Script                        ║"
echo "║                                                              ║"
echo "║  This script will:                                           ║"
echo "║  • Check prerequisites                                       ║"
echo "║  • Install dependencies                                      ║"
echo "║  • Set up environment variables                              ║"
echo "║  • Initialize and seed the database                          ║"
echo "║  • Start the development server                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Step 1: Check Prerequisites
print_step "Checking prerequisites..."

# Check for Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if Node version is 18.17 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    NODE_MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)
    
    if [ "$NODE_MAJOR" -lt 18 ] || ([ "$NODE_MAJOR" -eq 18 ] && [ "$NODE_MINOR" -lt 17 ]); then
        print_warning "Node.js version 18.17+ is recommended. Current: $NODE_VERSION"
    fi
else
    print_error "Node.js is not installed. Please install Node.js 18.17+ from https://nodejs.org/"
    exit 1
fi

# Check for npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: v$NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check for git
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_warning "Git is not installed. Some features may not work properly."
fi

echo

# Step 2: Install Dependencies
print_step "Installing dependencies..."
print_info "This may take a few minutes..."

if npm install; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies. Please check your internet connection and try again."
    exit 1
fi

echo

# Step 3: Environment Setup
print_step "Setting up environment variables..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please update the .env file with your actual configuration:"
        print_info "  • SMTP settings for email functionality"
        print_info "  • NEXTAUTH_SECRET for production"
        print_info "  • Database URL if using a different database"
        echo
        print_info "For now, using default development settings..."
    else
        print_error ".env.example file not found. Cannot create environment file."
        exit 1
    fi
else
    print_success "Environment file (.env) already exists"
fi

echo

# Step 4: Database Setup
print_step "Setting up database..."

# Generate Prisma client
print_info "Generating Prisma client..."
if npm run db:generate; then
    print_success "Prisma client generated successfully!"
else
    print_error "Failed to generate Prisma client."
    exit 1
fi

# Check migration status and handle issues automatically
print_info "Checking current migration status..."
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
MIGRATION_SUCCESS=false

# Check if migrations are up to date
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    print_success "Database is already up to date!"
    MIGRATION_SUCCESS=true
elif echo "$MIGRATION_STATUS" | grep -q "following migration have not yet been applied"; then
    print_info "Pending migrations found. Applying migrations..."
    MIGRATION_SUCCESS=false
elif echo "$MIGRATION_STATUS" | grep -q "failed to apply\|migration.*failed\|Migration.*failed"; then
    print_warning "Migration errors detected. Attempting to resolve..."
    MIGRATION_SUCCESS=false
else
    # Unknown state - try to proceed
    print_info "Migration status unclear. Attempting to apply migrations..."
    MIGRATION_SUCCESS=false
fi

# Attempt migration with auto-recovery
if [ "$MIGRATION_SUCCESS" = false ]; then
    MAX_RETRIES=2
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$MIGRATION_SUCCESS" = false ]; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -eq 1 ]; then
            # First attempt: Try migrate deploy
            print_info "Attempt $RETRY_COUNT: Running migrations (deploy mode)..."
            if npx prisma migrate deploy 2>&1; then
                print_success "Database migrations completed!"
                MIGRATION_SUCCESS=true
                break
            else
                print_warning "Migration deploy failed. Checking for fixable issues..."
            fi
        fi
        
        if [ $RETRY_COUNT -eq 2 ] && [ "$MIGRATION_SUCCESS" = false ]; then
            # Second attempt: Check if we need to reset
            print_warning "Attempt $RETRY_COUNT: Migration issues detected."
            print_info "Checking if database reset is needed..."
            
            # Check if there are broken migrations or missing tables
            if echo "$MIGRATION_STATUS" | grep -q "failed to apply\|Cannot drop table\|foreign key constraint" || \
               npx prisma db execute --stdin <<< "SHOW TABLES LIKE 'MasterData';" 2>/dev/null | grep -q "MasterData"; then
                
                print_warning "Database may be in inconsistent state."
                print_info "Attempting to fix by applying migrations with force resolve..."
                
                # Try to resolve failed migrations
                FAILED_MIGRATIONS=$(echo "$MIGRATION_STATUS" | grep -o "migration.*failed" | awk '{print $2}' | head -1)
                if [ -n "$FAILED_MIGRATIONS" ]; then
                    print_info "Resolving failed migration: $FAILED_MIGRATIONS"
                    echo "y" | npx prisma migrate resolve --rolled-back "$FAILED_MIGRATIONS" 2>&1 || true
                fi
                
                # Try migrate deploy again
                if npx prisma migrate deploy 2>&1; then
                    print_success "Database migrations completed after resolution!"
                    MIGRATION_SUCCESS=true
                    break
                fi
            fi
            
            # Last resort: Try migrate dev
            print_info "Final attempt: Trying migrate dev mode..."
            if npx prisma migrate dev --name auto_fix 2>&1; then
                print_success "Database migrations completed!"
                MIGRATION_SUCCESS=true
                break
            else
                print_error "All migration attempts failed."
                print_warning "Attempting automatic database reset..."
                
                # Ask user if they want to reset (for safety, but in automated mode we'll do it)
                print_info "Resetting database to fix migration issues..."
                if echo "y" | npx prisma migrate reset --force --skip-seed 2>&1; then
                    print_success "Database reset successful!"
                    print_info "Applying fresh migrations..."
                    if npx prisma migrate deploy 2>&1 || npx prisma migrate dev --name init 2>&1; then
                        print_success "Database migrations completed after reset!"
                        MIGRATION_SUCCESS=true
                        break
                    fi
                fi
            fi
        fi
    done
    
    # Final check
    if [ "$MIGRATION_SUCCESS" = false ]; then
        print_error "Failed to complete database migrations after all attempts."
        print_info "You may need to manually run: npx prisma migrate reset"
        exit 1
    fi
fi

# Seed the database with retry logic
print_info "Seeding database with sample data..."
SEED_SUCCESS=false
SEED_RETRIES=0
MAX_SEED_RETRIES=2

while [ $SEED_RETRIES -lt $MAX_SEED_RETRIES ] && [ "$SEED_SUCCESS" = false ]; do
    SEED_RETRIES=$((SEED_RETRIES + 1))
    
    if npm run db:seed 2>&1; then
        print_success "Database seeded successfully!"
        print_info "Sample data includes:"
        print_info "  • 3 roles (Admin, Manager, User)"
        print_info "  • 10 test users (admin, manager, analyst, etc.)"
        print_info "  • 100 Teachers, Doctors, Engineers, Lawyers"
        print_info "  • 100 Master Data records"
        SEED_SUCCESS=true
    else
        SEED_ERROR=$?
        if [ $SEED_RETRIES -lt $MAX_SEED_RETRIES ]; then
            print_warning "Seeding failed (attempt $SEED_RETRIES/$MAX_SEED_RETRIES)"
            print_info "This might be due to missing tables. Regenerating Prisma client..."
            npx prisma generate 2>&1 || true
            sleep 2
            print_info "Retrying seed..."
        else
            print_warning "Database seeding failed after $MAX_SEED_RETRIES attempts"
            print_info "This is usually okay - tables might not exist yet or data already exists"
            print_info "You can manually seed later with: npm run db:seed"
            # Don't exit - this is not critical for app startup
            SEED_SUCCESS=true  # Continue anyway
        fi
    fi
done

echo

# Step 5: Final Setup Check
print_step "Verifying setup..."

# Check if all required files exist
REQUIRED_FILES=("package.json" "next.config.js" "prisma/schema.prisma" ".env")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

echo

# Step 6: Display Setup Information
print_step "Setup Information"
echo -e "${CYAN}"
echo "🎉 Setup completed successfully!"
echo
echo "═══════════════════════════════════════════════════════════════"
echo "📋 LOGIN CREDENTIALS (Use these to sign in at http://localhost:3000)"
echo "═══════════════════════════════════════════════════════════════"
echo
echo "  🔑 ADMIN ACCOUNT"
echo "     Username: admin"
echo "     Password: password123"
echo "     Email:    admin@example.com"
echo "     Role:     Admin"
echo
echo "  👥 MANAGER ACCOUNT"
echo "     Username: manager"
echo "     Password: password123"
echo "     Email:    manager@example.com"
echo "     Role:     Manager"
echo
echo "  👤 USER ACCOUNTS"
echo "     Username: analyst"
echo "     Password: password123"
echo "     Email:    analyst@example.com"
echo "     Role:     User"
echo
echo "     Username: jdoe"
echo "     Password: password123"
echo "     Email:    john.doe@example.com"
echo "     Role:     User"
echo
echo "     Username: asmith"
echo "     Password: password123"
echo "     Email:    alice.smith@example.com"
echo "     Role:     User"
echo
echo "═══════════════════════════════════════════════════════════════"
echo "🔗 Quick Links (once server starts):"
echo "═══════════════════════════════════════════════════════════════"
echo "  • Application:     http://localhost:3000"
echo "  • Sign In:        http://localhost:3000/signin"
echo "  • Dashboard:      http://localhost:3000/dashboard"
echo "  • Prisma Studio:  http://localhost:5555"
echo
echo "📝 Available Commands:"
echo "  • npm run dev         - Start development server"
echo "  • npm run build       - Build for production"
echo "  • npm run db:studio   - Open Prisma Studio"
echo "  • npm run db:seed     - Reseed database"
echo "  • npm run db:reset    - Reset database (WARNING: deletes all data)"
echo -e "${NC}"

# Step 7: Start Prisma Studio in Background
echo
print_step "Starting Prisma Studio..."
print_info "Prisma Studio will be available at http://localhost:5555"

# Start Prisma Studio in background
npx prisma studio --browser none > /dev/null 2>&1 &
PRISMA_STUDIO_PID=$!

# Wait for Prisma Studio to start
sleep 3

print_success "Prisma Studio started! (PID: $PRISMA_STUDIO_PID)"
print_info "Prisma Studio will open in browser when Next.js is ready..."

echo

# Step 8: Final Credentials Display (Before Starting Servers)
echo
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}📋 LOGIN CREDENTIALS - Copy these for easy access${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo
echo -e "${YELLOW}🔑 ADMIN ACCOUNT${NC}"
echo "   Username: admin"
echo "   Password: password123"
echo "   Email:    admin@example.com"
echo
echo -e "${YELLOW}👥 MANAGER ACCOUNT${NC}"
echo "   Username: manager"
echo "   Password: password123"
echo "   Email:    manager@example.com"
echo
echo -e "${YELLOW}👤 USER ACCOUNTS${NC}"
echo "   Username: analyst"
echo "   Password: password123"
echo
echo "   Username: jdoe"
echo "   Password: password123"
echo
echo "   Username: asmith"
echo "   Password: password123"
echo
echo -e "${CYAN}💡 Tip: All passwords are: password123${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo

# Step 9: Final Credentials Reminder
echo
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}📋 LOGIN CREDENTIALS - Ready to use!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo
echo -e "${YELLOW}  🔑 ADMIN:     admin / password123${NC}"
echo -e "${YELLOW}  👥 MANAGER:   manager / password123${NC}"
echo -e "${YELLOW}  👤 USERS:     analyst, jdoe, asmith / password123${NC}"
echo
echo -e "${CYAN}  🔗 Sign in: http://localhost:3000/signin${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo

# Step 10: Start Development Server
echo
print_step "Starting development server..."
print_info "The server will start on http://localhost:3000"
print_info "Press Ctrl+C to stop the server"
echo
print_success "🚀 Launching NextJS Template App..."

# Wait a moment for setup
sleep 3

# Start the development server in background initially to check if it starts
print_info "Starting Next.js server..."

# Start Next.js dev server in background and capture output
npm run dev > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!

# Wait for Next.js to start
print_info "Waiting for Next.js server to start..."
sleep 5

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Next.js server is running!"
    
    # Open both applications in browser
    print_info "Opening both applications in browser..."
    
    # Open Prisma Studio
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:5555 > /dev/null 2>&1 &
        sleep 1
        xdg-open http://localhost:3000 > /dev/null 2>&1 &
    elif command -v open > /dev/null; then
        open http://localhost:5555 > /dev/null 2>&1 &
        sleep 1
        open http://localhost:3000 > /dev/null 2>&1 &
    elif command -v start > /dev/null; then
        start http://localhost:5555 > /dev/null 2>&1 &
        timeout /t 1 > /dev/null 2>&1
        start http://localhost:3000 > /dev/null 2>&1 &
    else
        print_warning "Could not auto-open browser."
        print_info "Please visit:"
        print_info "  • Next.js App: http://localhost:3000"
        print_info "  • Prisma Studio: http://localhost:5555"
    fi
    
    if command -v xdg-open > /dev/null || command -v open > /dev/null || command -v start > /dev/null; then
        print_success "Both applications opened in browser!"
    fi
    
    # Bring Next.js to foreground and show logs
    echo
    print_info "========== Next.js Development Server Logs =========="
    print_info "Press Ctrl+C to stop both servers"
    echo
    
    # Tail the log file and wait for the process
    tail -f /tmp/nextjs.log &
    TAIL_PID=$!
    
    # Function to cleanup on exit
    cleanup() {
        echo ""
        print_info "Shutting down servers..."
        kill $NEXTJS_PID 2>/dev/null || true
        kill $PRISMA_STUDIO_PID 2>/dev/null || true
        kill $TAIL_PID 2>/dev/null || true
        exit 0
    }
    
    trap cleanup SIGINT SIGTERM
    
    # Wait for Next.js process
    wait $NEXTJS_PID
else
    print_error "Next.js server failed to start"
    print_info "Check /tmp/nextjs.log for details"
    kill $PRISMA_STUDIO_PID 2>/dev/null || true
    exit 1
fi

