## Workflows: Transfer Requests

Feature-gated by `ENABLE_WORKFLOWS=true` (default). Adds a Workflows section with a Transfer Requests flow:

- User creates a request with attachments and selects a Supervisor.
- Supervisor reviews: approve, request changes (with comment), reject; may assign a Manager.
- Manager finalizes: approve or reject; may request changes.

States: Draft → Submitted → SupervisorApproved | SupervisorChangesRequested | SupervisorRejected → ManagerApproved | ManagerChangesRequested | ManagerRejected.

API endpoints under `/api/workflows/transfer-requests/*` include list with pagination, details, actions, approver listing, resubmit, and stats. Email notifications are sent on key transitions (configure SMTP in `.env`).

Run migrations after pulling:

```bash
npx prisma migrate dev
```

# NextJS Template App

A comprehensive, production-ready Next.js 14 starter template with authentication, data management, and modern UI components.

## 🚀 Features

### Core Stack
- **Next.js 14** with App Router and TypeScript
- **Prisma** with SQLite database
- **NextAuth.js** with credentials provider
- **TailwindCSS** + **shadcn/ui** components
- **Framer Motion** for smooth animations
- **Zod** for type-safe validation

### Authentication & Security
- ✅ Complete signup/signin flow with email verification
- ✅ Password reset functionality
- ✅ Role-based access control (ROLE1, ROLE2, ROLE3)
- ✅ Secure password hashing with bcrypt
- ✅ CSRF protection and secure cookies
- ✅ Session management with JWT

### Data Management
- ✅ Comprehensive form with 15+ input types
- ✅ Real-time validation with Zod schemas
- ✅ File upload with security validation
- ✅ Dummy data generation for testing
- 🚧 Advanced data table (TanStack Table)
- 🚧 Bulk Excel/CSV import with preview
- 🚧 Export functionality

### UI/UX
- ✅ Responsive design (mobile → desktop)
- ✅ Accessible components with ARIA labels
- ✅ Smooth animations and transitions
- ✅ Dark/light theme ready
- ✅ Loading states and error handling

### Developer Experience
- ✅ TypeScript with strict mode
- ✅ ESLint and Prettier configuration
- ✅ Database migrations and seeding
- ✅ Environment variable validation
- ✅ Comprehensive error handling
- ✅ **Server-side debugging** with Node.js inspector
- ✅ **VS Code debugging** configurations
- ✅ **Debug utilities** for API, DB, and Auth operations

## 📋 Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm
- Git

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url> my-nextjs-app
cd my-nextjs-app
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth - CHANGE THESE IN PRODUCTION
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (SMTP) - Configure for email verification
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"

# App Settings
APP_NAME="NextJS Template App"
APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🐛 Server-Side Debugging

### Debug Scripts

```bash
# Enable debugging (recommended for most cases)
npm run dev:debug

# Enable debugging with break on start (pauses immediately)
npm run dev:debug-brk

# Enable remote debugging (for Docker/containers)
npm run dev:debug-remote

# Enable debugging with verbose logging
npm run dev:debug-verbose

# Debug production build
npm run start:debug
```

### Quick Debug Setup

1. **Start debug server:**
   ```bash
   npm run dev:debug
   ```

2. **Connect Chrome DevTools:**
   - Open `chrome://inspect`
   - Click **Configure...** and add `localhost:9229`
   - Find your Next.js app and click **inspect**

3. **Set breakpoints:**
   - Go to Sources tab in DevTools
   - Find your files (use Ctrl+P/⌘+P to search)
   - Click line numbers to set breakpoints

### VS Code Debugging

- Use **F5** to start debugging with pre-configured launch configurations
- Available configurations:
  - Debug Next.js (Server)
  - Debug Next.js (Server + Client)
  - Debug Next.js (Production)
  - Debug API Route
  - Attach to Next.js

### Debug Utilities

```typescript
import { debug } from '@/lib/debug-utils'

// Debug API calls
debug.api('POST', '/api/auth/signin', requestData, responseData)

// Debug database operations
debug.db('CREATE', 'users', userData, result)

// Debug authentication
debug.auth('LOGIN', user, session)

// Performance debugging
const result = debug.perf('Database Query', () => {
  return prisma.user.findMany()
})

// Conditional breakpoints
debug.breakpoint(user.role === 'admin', 'Admin user detected')
```

📖 **For detailed debugging instructions, see [DEBUGGING_GUIDE.md](./DEBUGGING_GUIDE.md)**

## 👥 Test Accounts

After seeding, you can use these test accounts:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password123` | ROLE1 | Administrator with full access |
| `manager` | `password123` | ROLE2 | Team manager with project access |
| `analyst` | `password123` | ROLE3 | Data analyst with analytics access |

## 📁 Project Structure

```
├── app/                          # Next.js 14 App Router
│   ├── (app)/                   # Protected app routes
│   │   ├── all-roles/           # Universal dashboard
│   │   ├── role1/               # Admin dashboard
│   │   ├── role2/               # Manager dashboard
│   │   ├── role3/               # Analyst dashboard
│   │   └── mydata/              # Data management
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── mydata/              # Data CRUD operations
│   │   └── upload/              # File upload endpoints
│   ├── (auth)/                  # Authentication pages (Route Group)
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   ├── header.tsx               # Site header
│   └── footer.tsx               # Site footer
├── lib/                         # Utility libraries
│   ├── validations/             # Zod schemas
│   ├── auth.ts                  # NextAuth configuration
│   ├── db.ts                    # Database connection
│   ├── email.ts                 # Email utilities
│   └── utils.ts                 # General utilities
├── prisma/                      # Database
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding
├── styles/                      # Global styles
├── types/                       # TypeScript definitions
└── uploads/                     # File uploads (gitignored)
```

## 🗄️ Database Schema

### Core Tables
- **User**: Authentication and user data
- **Session**: NextAuth session management
- **VerificationToken**: Email verification
- **PasswordResetToken**: Password reset tokens
- **Upload**: File metadata
- **MyData**: Comprehensive data model with all field types

### MyData Fields
The MyData table demonstrates all common field types:

```typescript
{
  // Identity
  id: string (cuid)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Text fields
  title: string
  description: string (long text)
  
  // User fields
  name: string
  email: string (unique)
  phone: string (optional)
  
  // Numeric fields
  age: number (integer)
  balance: number (decimal)
  rating: number (float)
  
  // Boolean
  isActive: boolean
  
  // Enums
  category: "A" | "B" | "C"
  
  // Dates
  dateOnly: Date
  dateTime: Date
  timeOnly: string
  
  // URLs
  website: string
  avatarUrl: string
  
  // Media
  filePath: string
  
  // JSON
  tags: string[] (stored as JSON)
  
  // Color
  color: string (hex)
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database (careful!)
```

## 📝 Form Input Types

The MyData form demonstrates all modern input types:

### Basic Inputs
- **Text**: Single-line text input
- **Textarea**: Multi-line text input
- **Email**: Email validation
- **Password**: With show/hide toggle
- **Phone**: Telephone number
- **URL**: Website links

### Numeric Inputs
- **Number**: Integer/decimal input
- **Range/Slider**: Visual range selection
- **Rating**: Star rating system

### Selection Inputs
- **Select**: Dropdown selection
- **Multi-select**: Multiple choice dropdown
- **Radio**: Single choice from options
- **Checkbox**: Boolean toggle
- **Switch**: Modern boolean toggle

### Date & Time
- **Date**: Date picker
- **DateTime**: Date and time picker
- **Time**: Time-only picker

### Advanced Inputs
- **Color**: Color picker with hex input
- **File**: File upload with validation
- **Tags**: Dynamic tag creation/removal
- **Search**: Search input with suggestions

## 🎨 Styling & Theming

### TailwindCSS Configuration
- Custom color palette
- Responsive breakpoints
- Animation utilities
- Component variants

### shadcn/ui Components
All components are customizable and follow design system principles:
- Consistent spacing and typography
- Accessible color contrast
- Focus states and keyboard navigation
- Smooth animations

### Custom CSS Classes
```css
.container-custom     # Responsive container
.card-custom         # Elevated card with shadows
.focus-ring          # Accessible focus states
.transition-custom   # Smooth transitions
```

## 🔒 Security Features

### Authentication
- Secure password hashing (bcrypt)
- Email verification required
- Password reset with secure tokens
- Session-based authentication
- Role-based access control

### Input Validation
- Server-side validation with Zod
- Client-side form validation
- File upload security checks
- SQL injection prevention
- XSS protection

### Security Headers
- CSRF protection
- Secure cookies
- Content Security Policy ready
- Rate limiting ready

## 📧 Email Configuration

### SMTP Setup
Configure your email service in `.env`:

```env
SMTP_HOST="smtp.gmail.com"      # Your SMTP server
SMTP_PORT="587"                 # SMTP port
SMTP_SECURE="false"             # Use TLS
SMTP_USER="your-email@gmail.com" # SMTP username
SMTP_PASS="your-app-password"   # SMTP password/app password
FROM_EMAIL="your-email@gmail.com" # From address
```

### Supported Email Services
- **Gmail**: Use app passwords
- **SendGrid**: SMTP relay
- **Mailgun**: SMTP service
- **Amazon SES**: SMTP interface
- **Custom SMTP**: Any SMTP server

## 🚀 Deployment

### Environment Variables
Update these for production:

```env
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
DATABASE_URL="your-production-database-url"
```

### Recommended Platforms
- **Vercel**: Zero-config deployment
- **Netlify**: JAMstack deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform
- **AWS**: Amplify or EC2

### Database Options
- **SQLite**: Development (included)
- **PostgreSQL**: Production recommended
- **MySQL**: Alternative option
- **PlanetScale**: Serverless MySQL
- **Supabase**: PostgreSQL with real-time

## 🧪 Testing

### Test Data
The seed script creates:
- 3 test users (one per role)
- 50 sample MyData records
- Sample file uploads

### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Role-based page access
- [ ] Form validation and submission
- [ ] File upload functionality
- [ ] Responsive design on mobile
- [ ] Accessibility with keyboard navigation

## 🔄 Adding New Features

### Adding New Input Types
1. Update the Zod schema in `lib/validations/mydata.ts`
2. Add the field to Prisma schema
3. Run migration: `npm run db:migrate`
4. Add form field to `components/forms/mydata-form.tsx`
5. Update seed data if needed

### Adding New Pages
1. Create page in `app/(app)/new-page/page.tsx`
2. Add route to sidebar in `app/(app)/layout.tsx`
3. Update middleware if authentication needed
4. Add any required API routes

### Adding New API Endpoints
1. Create route file in `app/api/endpoint/route.ts`
2. Add Zod validation schemas
3. Implement CRUD operations
4. Add error handling
5. Update TypeScript types

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Reset and regenerate database
npm run db:reset
npm run db:generate
npm run db:migrate
npm run db:seed
```

**Email Not Sending**
- Check SMTP credentials in `.env`
- Verify email service allows SMTP
- Check firewall/network settings
- Test with a simple SMTP client

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**TypeScript Errors**
```bash
# Run type checking
npm run type-check
```

## 📚 Learning Resources

### Next.js 14
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Database Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### NextAuth.js
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Providers Configuration](https://next-auth.js.org/providers)

### TailwindCSS
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) team for the amazing framework
- [shadcn](https://github.com/shadcn) for the beautiful UI components
- [Prisma](https://prisma.io) team for the excellent ORM
- [NextAuth.js](https://next-auth.js.org) team for authentication
- All the open-source contributors who made this possible

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
