# Database Setup Guide for Windows

## Current Configuration

Your project uses **MySQL** database. The `.env` file currently has:
```
DATABASE_URL="mysql://root@localhost:3306/next_template_db"
```

This means:
- Database Type: MySQL
- Host: localhost
- Port: 3306 (default MySQL port)
- Username: root
- Password: (empty/blank)
- Database Name: next_template_db

---

## Option 1: Use SQLite (Easiest - Recommended for Development)

SQLite is file-based and requires no server setup. Perfect for Windows development.

### Step 1: Update Prisma Schema

Edit `prisma/schema.prisma` line 8-10:

**From:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**To:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update .env File

Edit `.env` line 2:

**From:**
```
DATABASE_URL="mysql://root@localhost:3306/next_template_db"
```

**To:**
```
DATABASE_URL="file:./prisma/dev.db"
```

### Step 3: Reset and Migrate Database

Open PowerShell as Administrator and run:

```powershell
cd C:\path\to\nextjs-template

# Remove old migrations
Remove-Item -Path "prisma/migrations" -Recurse -Force

# Create new migration
npm run db:migrate -- --name init

# Seed the database
npm run db:seed
```

### Step 4: Start the Server

```powershell
npm run dev
```

✅ **Done! SQLite is ready to use.**

---

## Option 2: Use MySQL (Requires Setup)

If you prefer MySQL, follow these steps:

### Step 1: Install MySQL

#### Method A: Using MySQL Installer (Recommended)

1. Download **MySQL Community Server** from https://dev.mysql.com/downloads/mysql/
2. Run the installer
3. Choose "Server only" (you don't need Workbench)
4. Accept default configuration
5. During setup:
   - TCP/IP connection: YES
   - Port: 3306 (default)
   - Authentication: Use Strong Password Encryption
6. Create MySQL Service with default settings
7. Create root password (remember this!)
8. **Important:** Keep root password blank OR update `.env` with your password

#### Method B: Using Chocolatey

```powershell
# Open PowerShell as Administrator
choco install mysql
```

#### Method C: Using Docker (Advanced)

```powershell
# First install Docker Desktop from https://www.docker.com/products/docker-desktop

# Run MySQL in Docker
docker run --name mysql -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=next_template_db -p 3306:3306 -d mysql:8.0
```

### Step 2: Verify MySQL Installation

Open PowerShell and test the connection:

```powershell
# Check if MySQL is running
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# Test connection
mysql -u root -p

# If prompted for password, leave blank and press Enter
# You should see: mysql>
# Type: EXIT
```

### Step 3: Create Database

```powershell
# Login to MySQL without password (if root has no password)
mysql -u root

# Or with password
mysql -u root -p
```

Then run in MySQL prompt:
```sql
CREATE DATABASE IF NOT EXISTS next_template_db;
EXIT;
```

### Step 4: Update .env File

If your root user has a password, update `.env` line 2:

```
DATABASE_URL="mysql://root:your_password@localhost:3306/next_template_db"
```

If root has no password:
```
DATABASE_URL="mysql://root@localhost:3306/next_template_db"
```

### Step 5: Run Migrations and Seed

```powershell
npm run db:migrate
npm run db:seed
```

### Step 6: Start the Server

```powershell
npm run dev
```

---

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Cause:** Wrong password or user

**Solution:**
1. Check your root password
2. Update `.env` with correct credentials:
   ```
   DATABASE_URL="mysql://root:your_password@localhost:3306/next_template_db"
   ```
3. Run migrations again: `npm run db:migrate`

### Error: "Can't connect to MySQL server on 'localhost'"

**Cause:** MySQL service not running

**Solution for Windows:**
```powershell
# Start MySQL service
Start-Service MySQL80

# Check status
Get-Service MySQL80

# Stop (if needed)
Stop-Service MySQL80
```

### Error: "Unknown database 'next_template_db'"

**Cause:** Database doesn't exist

**Solution:**
```powershell
mysql -u root

# In MySQL prompt:
CREATE DATABASE next_template_db;
EXIT;

# Then run
npm run db:migrate
npm run db:seed
```

### Port 3306 Already in Use

**Solution:**
```powershell
# Find process using port 3306
netstat -ano | findstr :3306

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

## Verify Database Setup

### For SQLite:
Check if file exists:
```powershell
Test-Path "prisma/dev.db"
# Should return: True
```

### For MySQL:
```powershell
mysql -u root -e "SELECT DATABASE();"
# Should show: next_template_db
```

Or use Prisma Studio:
```powershell
npm run db:studio
```

---

## Important: Test Accounts After Setup

Once database is ready, you can login with:

| Username | Password    | Role  |
|----------|-------------|-------|
| admin    | password123 | Admin |
| manager  | password123 | Manager |
| analyst  | password123 | Analyst |

These are created automatically by `npm run db:seed`

---

## Quick Start Comparison

| Method | Setup Time | Complexity | Recommended For |
|--------|-----------|-----------|-----------------|
| **SQLite** | 2 minutes | Very Easy | Development |
| **MySQL Local** | 15 minutes | Medium | Production |
| **MySQL Docker** | 5 minutes | Medium | Advanced Users |
| **MySQL Remote** | 5 minutes | Easy | Team/Production |

---

## Next Steps

1. Choose your database option above
2. Follow the setup steps
3. Run: `npm run db:migrate`
4. Run: `npm run db:seed`
5. Run: `npm run dev`
6. Open: http://localhost:3000
7. Login with test accounts above

---

**For more help:** Check the errors closely or refer back to these troubleshooting steps.
