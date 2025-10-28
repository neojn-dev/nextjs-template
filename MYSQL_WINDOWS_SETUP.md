# MySQL Setup Guide for Windows - Step by Step

## Overview

This guide will help you set up MySQL Server on Windows for your NextJS application. Your project is already configured to use MySQL.

---

## Step 1: Download MySQL Community Server

1. Go to https://dev.mysql.com/downloads/mysql/
2. Look for **MySQL Community Server**
3. Choose the latest version (e.g., 8.0.x LTS)
4. Click **Download** for Windows (MySQL installer for Windows)
5. Choose the file: `mysql-installer-web-community-8.0.x.msi` (smaller file, downloads during installation)

---

## Step 2: Run MySQL Installer

1. Open the downloaded `.msi` file
2. Click **Next** on the welcome screen
3. Accept the license agreement and click **Next**

### Choose Setup Type
- Select: **Developer Default** (includes MySQL Server, MySQL Workbench, etc.)
- Click **Next**

### Check Requirements
- If prompted to install prerequisites, click **Execute** and let it complete
- Click **Next** when done

### Installation
- Click **Execute** to install MySQL Server and tools
- Wait for installation to complete (5-10 minutes)
- Click **Next**

---

## Step 3: Configure MySQL Server

### Server Configuration Type
1. Select: **Standalone MySQL Server / Classic MySQL Replication**
2. Click **Next**

### Server Configuration
- **Config Type**: Development Machine
- **Connectivity**:
  - TCP/IP: Enable (checked)
  - Port: **3306** (default - keep this)
  - Enable X Protocol on Port: Leave unchecked (optional)
- Click **Next**

### Authentication Method
- Select: **Use Strong Password Encryption for Authentication (Recommended)**
- Click **Next**

### Accounts and Roles
1. **MySQL Root Password**:
   - Username: `root` (default)
   - Password: **Enter a strong password** (you'll need this)
   - Confirm Password: (repeat password)
   
   **Example password:** `Admin@123` or `MySecurePass2024`

2. **MySQL User Accounts** (optional, keep defaults)
3. Click **Next**

### Windows Service
- **Configure MySQL Server as a Windows Service**: CHECKED
- **Service Name**: MySQL80 (or latest version)
- **Start the MySQL Server at System Startup**: CHECKED
- Click **Next**

### Complete Configuration
- Click **Finish** to complete setup
- MySQL Server will start automatically

---

## Step 4: Verify MySQL Installation

### Method 1: Check if Service is Running

Open PowerShell and run:
```powershell
Get-Service MySQL80
```

You should see:
```
Status   Name               DisplayName
------   ----               -----------
Running  MySQL80            MySQL80
```

### Method 2: Test Connection

Open PowerShell and run:
```powershell
mysql -u root -p
```

- When prompted for password, enter the password you set in Step 3
- You should see the MySQL prompt: `mysql>`
- Type: `EXIT` to quit

---

## Step 5: Create the Database

Open PowerShell and run:
```powershell
mysql -u root -p
```

Enter your password when prompted.

Then copy and paste this command:
```sql
CREATE DATABASE IF NOT EXISTS next_template_db;
```

Verify it was created:
```sql
SHOW DATABASES;
```

You should see `next_template_db` in the list.

Type: `EXIT` to quit MySQL

---

## Step 6: Update .env File

Your `.env` file should already have this (line 2):
```
DATABASE_URL="mysql://root@localhost:3306/next_template_db"
```

**If you used a different password**, update it to:
```
DATABASE_URL="mysql://root:YourPassword@localhost:3306/next_template_db"
```

Replace `YourPassword` with the actual password you set in Step 3.

**Example:**
```
DATABASE_URL="mysql://root:Admin@123@localhost:3306/next_template_db"
```

---

## Step 7: Run Database Migrations

Open PowerShell as Administrator and navigate to your project:

```powershell
cd C:\Users\NEOJN_01\Desktop\nextjs-template
```

Run these commands:

```powershell
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

You should see output showing migrations are running.

---

## Step 8: Verify Database Setup

### Using Prisma Studio (Visual Database Browser)

Run this command:
```powershell
npm run db:studio
```

This will open your browser at http://localhost:5555 showing your database with all tables and data.

### Using MySQL Command Line

Verify tables were created:
```powershell
mysql -u root -p next_template_db -e "SHOW TABLES;"
```

You should see tables like: `User`, `Role`, `Account`, `Session`, etc.

---

## Step 9: Start Development Server

```powershell
npm run dev
```

The app will start at http://localhost:3000

---

## Login with Test Accounts

After successful setup, you can login at http://localhost:3000 with:

| Username | Password    | Role    |
|----------|-------------|---------|
| admin    | password123 | Admin   |
| manager  | password123 | Manager |
| analyst  | password123 | Analyst |

---

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Cause:** Wrong password

**Solution:**
1. Verify the password you entered in Step 3
2. Update `.env` line 2 with correct password:
   ```
   DATABASE_URL="mysql://root:YourCorrectPassword@localhost:3306/next_template_db"
   ```
3. Run again: `npm run db:migrate`

---

### Error: "Can't connect to MySQL server on 'localhost' (10061)"

**Cause:** MySQL service is not running

**Solution:**

Check if MySQL is running:
```powershell
Get-Service MySQL80
```

If status is not "Running", start it:
```powershell
Start-Service MySQL80
```

To make it always start with Windows:
```powershell
Set-Service -Name MySQL80 -StartupType Automatic
```

---

### Error: "Unknown database 'next_template_db'"

**Cause:** Database wasn't created

**Solution:**
```powershell
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE next_template_db;
EXIT;

# Run migrations
npm run db:migrate
```

---

### Error: "Port 3306 is already in use"

**Cause:** Another MySQL instance is running

**Solution:**
```powershell
# Find what's using port 3306
netstat -ano | findstr :3306

# You'll see something like: TCP ... LISTENING 12345
# 12345 is the Process ID (PID)

# Stop that process
taskkill /PID 12345 /F

# Or stop MySQL service
Stop-Service MySQL80
```

---

### How to Change MySQL Root Password

If you forgot your password or want to change it:

```powershell
# Open MySQL without password (Windows Service will let you)
mysql -u root

# Then run:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewPassword123';
FLUSH PRIVILEGES;
EXIT;

# Update your .env file with new password
```

---

## Useful MySQL Commands

```powershell
# Check MySQL version
mysql --version

# Test connection
mysql -u root -p -e "SELECT VERSION();"

# List all databases
mysql -u root -p -e "SHOW DATABASES;"

# View database tables
mysql -u root -p next_template_db -e "SHOW TABLES;"

# Count users in database
mysql -u root -p next_template_db -e "SELECT COUNT(*) FROM User;"

# Stop MySQL Service
Stop-Service MySQL80

# Start MySQL Service
Start-Service MySQL80

# Check service status
Get-Service MySQL80
```

---

## Quick Reference - Full Setup

```powershell
# 1. Navigate to project
cd C:\Users\NEOJN_01\Desktop\nextjs-template

# 2. Verify MySQL is running
Get-Service MySQL80

# 3. Create database (if not done)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS next_template_db;"

# 4. Run migrations
npm run db:migrate

# 5. Seed database
npm run db:seed

# 6. Start development server
npm run dev

# 7. Open in browser
# http://localhost:3000
```

---

## Next Steps

1. ✅ Follow Steps 1-9 above
2. ✅ Start the development server: `npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Login with test account (admin/password123)
5. ✅ Explore the application

---

## Important Notes

- **MySQL Port 3306** must be free (not used by another app)
- **MySQL Service** must be running for app to work
- **Password in .env** must match the root password you set during installation
- **Database name** must be `next_template_db` (configured in Prisma)
- **Keep .env file secure** - don't commit to Git with real passwords

---

## Need Help?

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Verify MySQL is running: `Get-Service MySQL80`
3. Test connection: `mysql -u root -p`
4. Check `.env` file has correct credentials
5. Review error messages carefully - they often indicate the exact problem

---

**Setup completed! Ready to develop with MySQL on Windows.** 🚀
