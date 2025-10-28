# Windows Setup Guide for NextJS Template

This guide provides step-by-step instructions for running the NextJS Template on Windows.

## Prerequisites

Before starting, ensure you have the following installed on your Windows machine:

### 1. Node.js (v18.17+)
- **Download**: Visit https://nodejs.org/
- **Steps**:
  1. Download the LTS (Long Term Support) version
  2. Run the installer (.msi file)
  3. Follow the installation wizard (keep default options)
  4. Restart your computer after installation

- **Verify Installation**:
  - Open Command Prompt (cmd.exe) or PowerShell
  - Run: `node --version` (should show v18.x.x or higher)
  - Run: `npm --version` (should show 9.x.x or higher)

### 2. Git (Optional but Recommended)
- **Download**: Visit https://git-scm.com/download/win
- **Steps**:
  1. Download and run the installer
  2. Follow the installation wizard with default options
  3. Restart your computer

- **Verify Installation**:
  - Open Command Prompt or PowerShell
  - Run: `git --version`

### 3. Code Editor (Optional)
- Recommended: [Visual Studio Code](https://code.visualstudio.com/)
- Or any other code editor of your choice

---

## Step-by-Step Setup Instructions

### Step 1: Download or Clone the Project

**Option A: Using Git (Recommended)**
```powershell
git clone <repository-url>
cd nextjs-template
```

**Option B: Using ZIP File**
1. Download the project as ZIP
2. Extract it to your desired location
3. Open Command Prompt or PowerShell
4. Navigate to the project folder: `cd path\to\nextjs-template`

### Step 2: Open PowerShell as Administrator

1. Right-click on PowerShell
2. Select "Run as administrator"
3. Navigate to your project folder:
   ```powershell
   cd C:\path\to\nextjs-template
   ```

### Step 3: Run the Automated Setup Script

Execute the setup script:
```powershell
.\setup-and-run.ps1
```

If you get an error about execution policies, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the setup script again.

**The script will:**
- Check for Node.js and npm
- Install project dependencies (npm install)
- Generate Prisma client
- Set up the database
- Create sample data and users
- Start the development server

### Step 4: Manual Setup (If Script Fails)

If the automated script doesn't work, follow these manual steps:

#### 4a. Install Dependencies
```powershell
npm install
```

#### 4b. Generate Prisma Client
```powershell
npm run db:generate
```

#### 4c. Run Database Migrations
```powershell
npm run db:migrate
```

#### 4d. Seed the Database
```powershell
npm run db:seed
```

#### 4e. Start Development Server
```powershell
npm run dev
```

### Step 5: Access the Application

Once the server starts, open your web browser and go to:
- **Main App**: http://localhost:3000

---

## Test Accounts

After setup, you can log in with these test accounts:

| Role    | Username | Password    | Role ID |
|---------|----------|-------------|---------|
| Admin   | admin    | password123 | ROLE1   |
| Manager | manager  | password123 | ROLE2   |
| Analyst | analyst  | password123 | ROLE3   |

---

## Available Commands

After setup, you can use these commands in PowerShell:

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Open Prisma Studio (database GUI)
npm run db:studio

# Reseed the database
npm run db:seed

# Reset database (warning: deletes all data)
npm run db:reset

# Run linting
npm run lint

# Format code
npm run format
```

---

## Troubleshooting

### Issue: PowerShell Execution Policy Error

**Error**: "cannot be loaded because running scripts is disabled"

**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Node or npm Not Found

**Solution**:
1. Verify Node.js is installed: `node --version`
2. If not installed, download from https://nodejs.org/
3. Restart Command Prompt/PowerShell after installing Node.js
4. Restart your computer if needed

### Issue: npm install Fails

**Solution**:
1. Clear npm cache:
   ```powershell
   npm cache clean --force
   ```
2. Delete `node_modules` folder and `package-lock.json`
3. Try installing again:
   ```powershell
   npm install
   ```

### Issue: Database Migration Errors

**Solution**:
1. Delete the SQLite database file (if using SQLite):
   ```powershell
   Remove-Item -Path "prisma\dev.db" -Force
   ```
2. Run migrations again:
   ```powershell
   npm run db:migrate
   npm run db:seed
   ```

### Issue: Port 3000 Already in Use

**Error**: "Port 3000 is already in use"

**Solution**:
- Find and close the process using port 3000, or
- Specify a different port:
  ```powershell
  npm run dev -- -p 3001
  ```

### Issue: NEXTAUTH_SECRET Not Set

**Solution**:
1. Generate a secret:
   ```powershell
   npm run generate-auth-secret
   ```
   Or use this PowerShell command:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
   ```
2. Add to `.env` file:
   ```
   NEXTAUTH_SECRET=<generated-secret-here>
   ```

---

## Environment Configuration

### Configure .env File

Edit the `.env` file in the project root with your settings:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Email (if using SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourapp.com"
```

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs/
- **NextAuth.js Documentation**: https://next-auth.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Getting Help

If you encounter any issues:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Check the project's README.md
4. Review logs in the console
5. Delete `node_modules` and run `npm install` again

---

## Next Steps

After successful setup:

1. **Explore the Admin Panel**: Navigate to http://localhost:3000/admin
2. **Check Database**: Open Prisma Studio with `npm run db:studio`
3. **Read Documentation**: Review CMS_DOCUMENTATION.md and CMS_WEBSITE_SETUP.md
4. **Create Content**: Start creating pages using the CMS

---

**Last Updated**: October 28, 2025
