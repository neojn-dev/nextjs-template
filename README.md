# NextJS Template App

A comprehensive, production-ready Next.js 15 starter template with authentication, data management, workflows, file management, and modern UI components.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.8-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

## 🚀 Features

### Core Stack
- **Next.js 15** with App Router and TypeScript
- **Prisma** with MySQL database
- **NextAuth.js** with credentials provider
- **TailwindCSS** + **shadcn/ui** components
- **Framer Motion** for smooth animations
- **Zod** for type-safe validation

### Authentication & Security
- ✅ Complete signup/signin flow with email verification
- ✅ Password reset functionality
- ✅ Role-based access control (Admin, Manager, User)
- ✅ Secure password hashing with bcrypt
- ✅ CSRF protection and secure cookies
- ✅ Session management with JWT

### Data Management
- ✅ Comprehensive forms with 15+ input types
- ✅ Real-time validation with Zod schemas
- ✅ File upload with security validation
- ✅ Data tables with sorting, filtering, pagination
- ✅ Bulk Excel/CSV import/export
- ✅ Master data management (Teachers, Doctors, Engineers, Lawyers, etc.)

### Advanced Features
- ✅ Workflow system for transfer requests (approval flows)
- ✅ File manager with folder structure
- ✅ Dashboard with analytics and KPIs
- ✅ Email notifications (SMTP)
- ✅ User profile management with avatar upload

### UI/UX
- ✅ Responsive design (mobile → desktop)
- ✅ Accessible components with ARIA labels
- ✅ Smooth animations and transitions
- ✅ Dark/light theme ready
- ✅ Loading states and error handling

---

## 📋 Prerequisites

### Required Software

| Software | Version | Purpose | Download |
|----------|---------|----------|----------|
| **Node.js** | 18.17+ | JavaScript runtime | [Download](https://nodejs.org/) |
| **npm** | Included with Node.js | Package manager | Comes with Node.js |
| **MySQL** | 8.0+ | Database server | [Download](https://dev.mysql.com/downloads/mysql/) |
| **Git** | Latest | Version control | [Download](https://git-scm.com/) |

### System Requirements

- **macOS**: macOS 10.15 or later
- **Windows**: Windows 10 or later
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: ~500MB for dependencies

---

## 🛠️ Installation & Setup

### Option 1: Automated Setup (Recommended)

The project includes automated setup scripts that handle all configuration steps.

#### For macOS/Linux:

```bash
# Clone the repository
git clone <repository-url> my-nextjs-app
cd my-nextjs-app

# Make script executable
chmod +x setup-and-run.sh

# Run the setup script
./setup-and-run.sh
```

#### For Windows:

```powershell
# Clone the repository
git clone <repository-url> my-nextjs-app
cd my-nextjs-app

# Run PowerShell script as Administrator
# Right-click PowerShell → "Run as Administrator"
.\setup-and-run.ps1
```

**What the automated script does:**
- ✅ Checks prerequisites (Node.js, npm, MySQL)
- ✅ Installs all dependencies (`npm install`)
- ✅ Configures MySQL database
- ✅ Creates/updates `.env` file with database connection
- ✅ Generates Prisma client
- ✅ Runs database migrations
- ✅ Seeds database with sample data
- ✅ Starts development server and Prisma Studio
- ✅ Opens browser automatically

**Note for Windows:** The script expects MySQL root password to be `password`. If your MySQL uses a different password, either:
- Change your MySQL root password to `password`, or
- Edit line 402 in `setup-and-run.ps1` to use your actual password

---

### Option 2: Manual Setup

If you prefer manual setup or need more control, follow these steps:

#### Step 1: Install MySQL

**macOS:**
```bash
# Using Homebrew (recommended)
brew install mysql

# Start MySQL service
brew services start mysql

# Set root password (you'll be prompted)
mysql_secure_installation
```

**Windows:**
1. Download MySQL Installer from [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
2. Run installer and choose "Developer Default" setup type
3. Complete installation with default options
4. **Important:** Set MySQL root password to `password` (or note your password for later)
5. Ensure MySQL service is running (check Services panel)

#### Step 2: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url> my-nextjs-app
cd my-nextjs-app

# Install dependencies
npm install
```

#### Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database - Update with your MySQL credentials
DATABASE_URL="mysql://root:password@localhost:3306/next_template_db"

# NextAuth - Generate a secret key for production
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email (SMTP) - Configure for email verification
# For Gmail, use App Password: https://support.google.com/accounts/answer/185833
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"

# App Settings
APP_NAME="NextJS Template App"
APP_URL="http://localhost:3000"

# Feature Flags
ENABLE_WORKFLOWS="true"
```

**Important:** Replace `password` in `DATABASE_URL` with your actual MySQL root password if different.

#### Step 4: Create Database

**macOS/Linux:**
```bash
mysql -u root -p
# Enter your MySQL root password when prompted

# In MySQL console:
CREATE DATABASE IF NOT EXISTS next_template_db;
exit;
```

**Windows:**
```powershell
# Open Command Prompt or PowerShell
mysql -u root -p
# Enter your MySQL root password when prompted

# In MySQL console:
CREATE DATABASE IF NOT EXISTS next_template_db;
exit;
```

#### Step 5: Setup Database Schema

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

#### Step 6: Start Development Server

**Terminal 1 - Development Server:**
```bash
npm run dev
```

**Terminal 2 - Prisma Studio (Optional but recommended):**
```bash
npm run db:studio
```

#### Step 7: Access the Application

- **Application**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)

---

## 👥 Test Accounts

After seeding, you can use these test accounts:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password123` | Admin | Administrator with full access |
| `manager` | `password123` | Manager | Team manager with project access |
| `analyst` | `password123` | User | Data analyst with analytics access |
| `jdoe` | `password123` | User | Regular user account |
| `asmith` | `password123` | User | Regular user account |

**Sign in at:** [http://localhost:3000/signin](http://localhost:3000/signin)

---

## 🏗️ Architecture Overview

This application follows a modern, full-stack architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React UI   │  │    Forms     │  │   Charts     │     │
│  │  Components  │  │  Validation  │  │  Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server (App Router)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Pages    │  │  API Routes  │  │  Middleware  │     │
│  │  (Server)    │  │  (Backend)   │  │  (Auth)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Validation  │  │    Email     │  │    Files     │     │
│  │    (Zod)     │  │   Service    │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Workflows  │  │     Auth      │                        │
│  │   Engine    │  │  (NextAuth)  │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Prisma     │──────────────▶│    MySQL     │            │
│  │     ORM      │              │   Database   │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Key Components:

1. **Frontend (React/Next.js)**: Server-rendered pages with React components
2. **API Routes**: RESTful endpoints for data operations
3. **Middleware**: Authentication and authorization checks
4. **Business Logic**: Validation, email, file management, workflows
5. **Data Layer**: Prisma ORM connects to MySQL database

---

## 📁 Project Structure

```
nextjs-template/
├── app/                          # Next.js 14 App Router
│   ├── (app)/                   # Protected app routes
│   │   ├── dashboard/           # Dashboard page
│   │   ├── users/               # User management
│   │   ├── roles/               # Role management
│   │   ├── teachers/            # Teachers CRUD
│   │   ├── doctors/             # Doctors CRUD
│   │   ├── engineers/           # Engineers CRUD
│   │   ├── lawyers/             # Lawyers CRUD
│   │   ├── files/               # File manager
│   │   ├── workflows/           # Workflow system
│   │   └── profile/             # User profile
│   ├── (auth)/                  # Authentication pages
│   │   ├── signin/              # Sign in page
│   │   ├── signup/              # Sign up page
│   │   ├── forgot-password/    # Password reset
│   │   └── verify/              # Email verification
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── users/               # User CRUD operations
│   │   ├── teachers/            # Teacher operations
│   │   ├── doctors/             # Doctor operations
│   │   ├── file-manager/        # File management APIs
│   │   └── workflows/           # Workflow APIs
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   ├── data-table/              # Data table components
│   ├── dashboard/               # Dashboard components
│   └── website-components/      # Site-wide components
├── lib/                         # Utility libraries
│   ├── validations/             # Zod schemas
│   ├── auth.ts                  # NextAuth configuration
│   ├── db.ts                    # Database connection
│   ├── email.ts                 # Email utilities
│   ├── file-manager.ts          # File management
│   └── workflows/               # Workflow logic
├── prisma/                      # Database
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Database seeding
│   └── migrations/              # Database migrations
├── hooks/                       # React hooks
├── types/                       # TypeScript definitions
├── styles/                      # Global styles
├── public/                      # Static assets
└── docs/                        # Documentation
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with Node.js inspector (debugging)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
npm run test            # Run tests

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:reset        # Reset database (WARNING: deletes all data)
```

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder. Here's a quick guide:

### 🚀 Getting Started
- **[Getting Started Guide](./docs/01-getting-started.md)** - Installation and first steps
- **[Project Overview](./docs/02-project-overview.md)** - High-level overview and features

### 🏗️ Architecture & Structure
- **[Architecture Guide](./docs/03-architecture.md)** - System architecture and design patterns
- **[Project Structure](./docs/04-project-structure.md)** - Detailed file organization
- **[Routing Guide](./docs/05-routing.md)** - Next.js App Router explained

### 🔐 Core Systems
- **[Authentication](./docs/06-authentication.md)** - Auth system with NextAuth.js
- **[Database](./docs/07-database.md)** - Database schema and Prisma ORM
- **[API Routes](./docs/08-api-routes.md)** - API endpoints and server logic

### 🎨 Frontend Development
- **[Components Overview](./docs/09-components-overview.md)** - Component architecture
- **[UI Components](./docs/10-ui-components.md)** - shadcn/ui components guide
- **[Forms & Validation](./docs/11-forms-validation.md)** - Form handling with Zod
- **[Data Tables](./docs/12-data-tables.md)** - TanStack Table implementation

### ⚡ Advanced Features
- **[Workflows](./docs/13-workflows.md)** - Transfer request workflow system
- **[File Management](./docs/14-file-management.md)** - File upload and management
- **[Dashboard Analytics](./docs/15-dashboard-analytics.md)** - Analytics and KPIs

### 🎨 Styling & UI/UX
- **[Styling & Theming](./docs/16-styling-theming.md)** - TailwindCSS and theming
- **[Animations](./docs/17-animations.md)** - Framer Motion animations

### 🛠️ Development & Deployment
- **[Development Guidelines](./docs/20-development-guidelines.md)** - Best practices
- **[Security](./docs/21-security.md)** - Security features
- **[Deployment](./docs/22-deployment.md)** - Production deployment guide
- **[Troubleshooting](./docs/23-troubleshooting.md)** - Common issues and solutions

### 📖 Code Walkthroughs (Essential Reading!)
- **[Code Walkthrough: Authentication](./docs/24-code-walkthrough-authentication.md)** - How auth works step-by-step
- **[Code Walkthrough: Pages](./docs/24-code-walkthrough-pages.md)** - How pages work with examples
- **[Code Walkthrough: API Routes](./docs/25-code-walkthrough-api-routes.md)** - API implementation details
- **[Code Walkthrough: Components](./docs/26-code-walkthrough-components.md)** - Component patterns
- **[Code Walkthrough: Database](./docs/27-code-walkthrough-database.md)** - Database queries explained

### 📋 Quick Reference
- **[Documentation Index](./docs/00-index.md)** - Complete documentation index
- **[Files & Folders Guide](./docs/28-files-folders-interactions.md)** - All files explained
- **[Quick Reference](./docs/29-files-quick-reference.md)** - Quick lookup guide

---

## 🧠 Code Overview (High-Level)

### How Authentication Works

1. **User Registration**: User fills signup form → API validates → Creates user in database → Sends verification email
2. **Email Verification**: User clicks link → API verifies token → Updates user status
3. **Login**: User enters credentials → API validates → Creates session → Returns JWT token
4. **Session Management**: NextAuth.js manages sessions using cookies and database
5. **Protected Routes**: Middleware checks authentication → Redirects if not authenticated

**Key Files:**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `lib/auth.ts` - Auth utilities
- `middleware.ts` - Route protection
- `app/(auth)/signin/page.tsx` - Login page

**Learn More:** [Authentication Documentation](./docs/06-authentication.md) | [Code Walkthrough](./docs/24-code-walkthrough-authentication.md)

### How Data Management Works

1. **CRUD Operations**: Forms submit data → API validates with Zod → Prisma queries database → Returns response
2. **Data Tables**: TanStack Table handles sorting, filtering, pagination client-side
3. **File Upload**: Files uploaded → Validated → Stored in `uploads/` → Metadata saved to database
4. **Workflows**: State machine manages approval flows → Email notifications sent → Status updated

**Key Files:**
- `app/api/users/route.ts` - User CRUD API
- `components/data-table/data-table.tsx` - Reusable data table
- `lib/file-manager.ts` - File management utilities
- `lib/workflows/transfer.ts` - Workflow logic

**Learn More:** [API Routes](./docs/08-api-routes.md) | [Data Tables](./docs/12-data-tables.md) | [Workflows](./docs/13-workflows.md)

### How Database Works

1. **Schema Definition**: Prisma schema defines models → Relationships → Indexes
2. **Migrations**: Schema changes → Generate migration → Apply to database
3. **Queries**: Prisma Client provides type-safe queries → Converts to SQL → Executes
4. **Relations**: Prisma handles JOINs automatically → Returns related data

**Key Files:**
- `prisma/schema.prisma` - Database schema
- `lib/db.ts` - Prisma client instance
- `prisma/seed.ts` - Seed data script

**Learn More:** [Database Documentation](./docs/07-database.md) | [Code Walkthrough](./docs/27-code-walkthrough-database.md)

### How Components Work

1. **UI Components**: shadcn/ui components → Customizable → Accessible → Type-safe
2. **Form Components**: React Hook Form → Zod validation → Error handling
3. **Data Table**: TanStack Table → Column definitions → Sorting/filtering → Pagination
4. **Layout Components**: Sidebar → Header → Footer → Responsive design

**Key Files:**
- `components/ui/` - shadcn/ui components
- `components/forms/` - Form components
- `components/data-table/data-table.tsx` - Data table component

**Learn More:** [Components Overview](./docs/09-components-overview.md) | [Code Walkthrough](./docs/26-code-walkthrough-components.md)

---

## 🗄️ Database Schema

### Core Models

- **User**: Authentication and user data
- **Role**: Role-based access control (Admin, Manager, User)
- **Session**: NextAuth session management
- **Account**: OAuth account linking
- **VerificationToken**: Email verification tokens
- **PasswordResetToken**: Password reset tokens

### Data Models

- **Teacher**: Teacher management
- **Doctor**: Doctor management
- **Engineer**: Engineer management
- **Lawyer**: Lawyer management
- **Employee**: Employee records
- **MasterData**: Generic master data

### Workflow Models

- **TransferRequest**: Transfer request workflow
- **WorkflowState**: Workflow state machine

### File Management

- **File**: File metadata
- **Folder**: Folder structure

**Full Schema:** See [`prisma/schema.prisma`](./prisma/schema.prisma)

**Learn More:** [Database Documentation](./docs/07-database.md)

---

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Email Verification**: Required before account activation
- ✅ **Password Reset**: Secure token-based reset
- ✅ **Session Security**: HttpOnly cookies, CSRF protection
- ✅ **Input Validation**: Server-side Zod validation
- ✅ **File Upload Security**: File type and size validation
- ✅ **Role-Based Access**: Middleware enforces permissions
- ✅ **SQL Injection Prevention**: Prisma ORM parameterized queries

**Learn More:** [Security Documentation](./docs/21-security.md)

---

## 📧 Email Configuration

The app uses SMTP for sending emails (verification, password reset, notifications).

### Gmail Setup

1. Enable 2-Step Verification in your Google Account
2. Generate App Password: [Google App Passwords](https://support.google.com/accounts/answer/185833)
3. Update `.env`:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

### Other Email Services

- **SendGrid**: Use SMTP relay settings
- **Mailgun**: Configure SMTP credentials
- **Amazon SES**: Use SMTP interface
- **Custom SMTP**: Any SMTP server configuration

**Learn More:** See email configuration in [Authentication Docs](./docs/06-authentication.md)

---

## 🚀 Deployment

### Environment Variables for Production

Update these in your production environment:

```env
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"
DATABASE_URL="mysql://user:password@host:3306/database"
SMTP_HOST="your-smtp-server.com"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-password"
```

### Recommended Platforms

- **Vercel**: Zero-config Next.js deployment
- **Netlify**: JAMstack deployment
- **Railway**: Full-stack deployment with MySQL
- **DigitalOcean**: App Platform
- **AWS**: Amplify or EC2

### Database Options

- **MySQL**: Production database (current setup)
- **PostgreSQL**: Alternative option (change Prisma provider)
- **PlanetScale**: Serverless MySQL
- **Supabase**: PostgreSQL with real-time

**Learn More:** [Deployment Guide](./docs/22-deployment.md)

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check MySQL is running
# macOS: brew services list
# Windows: Check Services panel

# Verify DATABASE_URL in .env
# Reset database if needed
npm run db:reset
npm run db:migrate
npm run db:seed
```

**Port Already in Use**
```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Prisma Client Not Generated**
```bash
npm run db:generate
```

**Migration Errors**
```bash
# Reset and reapply migrations
npm run db:reset
npm run db:migrate
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Learn More:** [Troubleshooting Guide](./docs/23-troubleshooting.md)

---

## 🧪 Testing

### Test Accounts

After seeding, use these accounts:

- **Admin**: `admin` / `password123`
- **Manager**: `manager` / `password123`
- **User**: `analyst` / `password123`

### Manual Testing Checklist

- [ ] User registration with email verification
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Role-based page access
- [ ] CRUD operations (Users, Teachers, Doctors, etc.)
- [ ] File upload and management
- [ ] Workflow approval flows
- [ ] Responsive design on mobile
- [ ] Accessibility with keyboard navigation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) team for the amazing framework
- [shadcn](https://github.com/shadcn) for the beautiful UI components
- [Prisma](https://prisma.io) team for the excellent ORM
- [NextAuth.js](https://next-auth.js.org) team for authentication
- All the open-source contributors who made this possible

---

## 📞 Support

- **Documentation**: See [`docs/`](./docs/) folder
- **Issues**: Check [Troubleshooting Guide](./docs/23-troubleshooting.md)
- **Questions**: Review documentation or create an issue

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

**Last Updated**: January 2025
**Version**: 1.0.0
