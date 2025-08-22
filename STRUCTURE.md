# Project Structure Documentation

## 🏗️ **New Organized Structure**

This project has been reorganized to clearly separate **public website pages** from **authenticated application pages** using Next.js App Router conventions.

## 📁 **Directory Structure**

```
app/
├── (public)/                    # 🌐 Public Website Pages (Unauthenticated)
│   ├── layout.tsx              # Public layout with header/footer
│   ├── page.tsx                # Landing page (/)
│   ├── company/                # Company information pages
│   │   ├── about/page.tsx      # /company/about
│   │   ├── mission/page.tsx    # /company/mission
│   │   ├── leadership/page.tsx # /company/leadership
│   │   └── careers/page.tsx    # /company/careers
│   ├── services/               # Service offering pages
│   │   ├── overview/page.tsx   # /services/overview
│   │   ├── solutions/page.tsx  # /services/solutions
│   │   ├── industries/page.tsx # /services/industries
│   │   └── case-studies/page.tsx # /services/case-studies
│   └── resources/              # Public resource pages
│       ├── blog/page.tsx       # /resources/blog
│       ├── news/page.tsx       # /resources/news
│       ├── events/page.tsx     # /resources/events
│       └── support/page.tsx    # /resources/support
├── (app)/                      # 🔐 Protected Application Pages (Authenticated)
│   ├── layout.tsx              # Protected layout with sidebar
│   ├── page.tsx                # Dashboard (/dashboard)
│   ├── mydata/                 # Data management
│   │   ├── page.tsx            # /mydata
│   │   ├── import/page.tsx     # /mydata/import
│   │   └── list/page.tsx       # /mydata/list
│   ├── role1/page.tsx          # /role1
│   ├── role2/page.tsx          # /role2
│   ├── role3/page.tsx          # /role3
│   └── all-roles/page.tsx      # /all-roles
├── auth/                       # 🔑 Authentication Pages
│   ├── signin/page.tsx         # /auth/signin
│   ├── signup/page.tsx         # /auth/signup
│   ├── verify/page.tsx         # /auth/verify
│   ├── forgot-password/page.tsx # /auth/forgot-password
│   └── reset-password/page.tsx # /auth/reset-password
├── api/                        # 🚀 API Routes
│   ├── auth/                   # Authentication APIs
│   ├── mydata/                 # Data management APIs
│   └── upload/                 # File upload APIs
├── layout.tsx                  # Root layout
└── page.tsx                    # Root page (redirects to public)
```

## 🎯 **Key Benefits of New Structure**

### **1. Clear Separation of Concerns**
- **`(public)/`** - Marketing website, company info, public resources
- **`(app)/`** - Protected application features, user dashboard
- **`auth/`** - Authentication flows
- **`api/`** - Backend API endpoints

### **2. Next.js App Router Best Practices**
- **Route Groups** `(public)` and `(app)` organize related routes
- **No nested "pages" folder** - follows App Router conventions
- **Proper layout hierarchy** - each section has its own layout

### **3. Better User Experience**
- **Public users** see marketing content and can sign up
- **Authenticated users** get redirected to dashboard
- **Clear navigation** between public and private areas

### **4. SEO and Performance**
- **Public pages** are indexed and optimized for search
- **Protected pages** have lower SEO priority
- **Proper sitemap** structure for search engines

## 🔄 **URL Structure**

### **Public Website URLs**
- `/` - Landing page
- `/company/*` - Company information
- `/services/*` - Service offerings
- `/resources/*` - Public resources

### **Application URLs (Protected)**
- `/dashboard` - Main dashboard
- `/mydata/*` - Data management
- `/role1`, `/role2`, `/role3` - Role-specific features

### **Authentication URLs**
- `/auth/signin` - Sign in
- `/auth/signup` - Sign up
- `/auth/verify` - Email verification
- `/auth/forgot-password` - Password reset

## 🛡️ **Authentication & Protection**

### **Public Pages**
- No authentication required
- Accessible to all visitors
- SEO optimized

### **Protected Pages**
- Require valid session
- Redirect to signin if unauthenticated
- User-specific content and features

## 📱 **Responsive Design**

- **Public pages** - Marketing-focused, mobile-first design
- **Application pages** - Dashboard-style, sidebar navigation
- **Consistent UI components** across both sections

## 🚀 **Getting Started**

1. **Public users** start at `/` and can explore company/services
2. **Sign up** at `/auth/signup` to create an account
3. **Verify email** via the link sent to their email
4. **Sign in** at `/auth/signin` to access the application
5. **Dashboard** at `/dashboard` provides access to all features

## 🔧 **Development Notes**

- **Route groups** `(public)` and `(app)` are Next.js conventions
- **Layouts** cascade properly from root → section → page
- **Metadata** is properly configured for SEO
- **Sitemap** includes all public pages with appropriate priorities
