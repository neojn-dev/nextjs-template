# Getting Started

This guide will help you set up the NextJS Template App from scratch and get it running on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | 18.17+ | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | Package manager (comes with Node.js) | Included with Node.js |
| **Git** | 2.30+ | Version control | [git-scm.com](https://git-scm.com/) |
| **MySQL** | 8.0+ | Database server | [mysql.com](https://dev.mysql.com/downloads/) |

### Optional but Recommended

| Software | Purpose |
|----------|---------|
| **VS Code** | Code editor with excellent TypeScript support |
| **Prisma Studio** | Visual database browser (included with Prisma) |
| **Postman / Insomnia** | API testing tools |

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url> my-nextjs-app
cd my-nextjs-app
```

### Step 2: Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install:
- Next.js and React dependencies
- Prisma ORM and client
- NextAuth.js for authentication
- UI components (shadcn/ui)
- Form libraries (React Hook Form, Zod)
- Chart libraries (Recharts)
- And many more...

**Installation Time**: ~2-5 minutes depending on internet speed

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create a new `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# NextAuth Configuration (CHANGE IN PRODUCTION!)
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"

# Application Settings
APP_NAME="NextJS Template App"
APP_URL="http://localhost:3000"

# Feature Flags
ENABLE_WORKFLOWS="true"
```

### Step 4: Database Setup

#### 4.1 Generate Prisma Client

Generate the Prisma client from your schema:

```bash
npm run db:generate
```

This command:
- Reads `prisma/schema.prisma`
- Generates TypeScript types
- Creates Prisma Client in `node_modules/.prisma/client`

#### 4.2 Run Database Migrations

Apply database migrations to create tables:

```bash
npm run db:migrate
```

This will:
- Create all database tables according to the schema
- Apply any pending migrations
- Create a migration history

#### 4.3 Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run db:seed
```

This creates:
- 3 test users (one per role)
- Sample data for doctors, teachers, engineers, lawyers
- Test file uploads
- Sample roles

### Step 5: Start Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## ✅ Verification

### Check if Everything Works

1. **Visit the homepage**: http://localhost:3000
2. **Try signing up**: http://localhost:3000/signup
3. **Check the dashboard**: http://localhost:3000/dashboard (after login)

### Test Accounts

After seeding, you can use these test accounts:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `password123` | Admin | Full access |
| `manager` | `password123` | Manager | Manager access |
| `analyst` | `password123` | Analyst | Analyst access |

## 📁 Project Structure Overview

After installation, your project structure will look like this:

```
my-nextjs-app/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes
│   ├── (auth)/            # Authentication pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # UI components (shadcn/ui)
│   └── website-components/ # Site components
├── lib/                    # Utility libraries
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── styles/                 # Global styles
└── docs/                   # Documentation (this folder)
```

## 🔧 Common Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:debug` | Start with debugging enabled |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Database

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

### Type Checking

| Command | Description |
|---------|-------------|
| `npm run type-check` | Check TypeScript types |
| `npm test` | Run tests (if configured) |

## 🐛 Troubleshooting Installation

### Issue: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Database connection error

**Solution**:
1. Verify MySQL is running
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `CREATE DATABASE database_name;`
4. Verify user has proper permissions

### Issue: Prisma client not found

**Solution**:
```bash
npm run db:generate
```

### Issue: Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill

# Or use a different port
PORT=3001 npm run dev
```

## 📚 Next Steps

Now that you have the project set up:

1. **Read the Project Overview**: [02-project-overview.md](./02-project-overview.md)
2. **Understand the Architecture**: [03-architecture.md](./03-architecture.md)
3. **Explore the Project Structure**: [04-project-structure.md](./04-project-structure.md)
4. **Learn About Authentication**: [06-authentication.md](./06-authentication.md)

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [NextAuth.js Quick Start](https://next-auth.js.org/getting-started/example)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Tips for New Developers

1. **Use VS Code**: Excellent TypeScript and React support
2. **Install Extensions**: 
   - Prisma
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
3. **Enable Debugging**: Use `npm run dev:debug` for debugging
4. **Check Prisma Studio**: Run `npm run db:studio` to visually browse your database
5. **Read Error Messages**: Next.js and TypeScript provide helpful error messages

---

**Next**: [Project Overview](./02-project-overview.md)

