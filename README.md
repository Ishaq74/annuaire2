# Annuaire2 - Multilingual Directory with Better Auth

A modern Astro-based multilingual directory and magazine platform with advanced authentication, role-based permissions, and organization management.

## ✨ Features

- **🔐 Better Auth Integration**
  - Email/password authentication
  - OTP verification
  - Email verification with Nodemailer SMTP
  - Role-based access control (RBAC)
  - Organizations and team management
  - Multi-session support

- **🌍 Full Internationalization**
  - Support for French (fr), English (en), and Spanish (es)
  - URL-based language routing
  - Localized content and UI

- **🗂️ Content Management**
  - Articles with rich content
  - Categories with translations
  - Comments system with moderation
  - Author profiles and bios

- **🏢 Organizations**
  - Create and manage organizations
  - Invite team members
  - Role-based permissions within organizations

- **⚡ Modern Tech Stack**
  - Astro with Server-Side Rendering
  - PostgreSQL with Prisma ORM
  - Tailwind CSS with custom components
  - TypeScript throughout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- SMTP server for email functionality

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd annuaire2
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/annuaire2"
   
   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:4321"
   
   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="your-email@gmail.com"
   SMTP_FROM_NAME="Annuaire2"
   
   # Admin
   ADMIN_EMAIL="admin@example.com"
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with initial data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:4321` to see your application.

## 🛠️ Available Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with initial data |

## 📁 Project Structure

```text
/
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   └── init-db.ts            # Database initialization
├── src/
│   ├── components/           # Reusable components
│   ├── i18n/                # Internationalization
│   │   ├── ui.ts            # Translation strings
│   │   └── utils.ts         # i18n utilities
│   ├── lib/                 # Core utilities
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── auth-client.ts   # Client-side auth utilities
│   │   ├── email.ts         # Email functionality
│   │   ├── magazine.ts      # Magazine/article services
│   │   ├── otp.ts           # OTP utilities
│   │   ├── permissions.ts   # RBAC utilities
│   │   └── prisma.ts        # Prisma client
│   ├── middleware.ts        # Auth middleware
│   ├── pages/
│   │   ├── [lang]/          # Localized pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── profile.astro # User profile
│   │   │   └── [magazine_slug]/ # Magazine pages
│   │   └── api/             # API endpoints
│   └── styles/              # Global styles
└── package.json
```

## 🔐 Authentication Features

### User Registration & Login
- Email/password authentication
- Email verification required
- Password reset functionality
- OTP verification support

### Role-Based Access Control
- **Admin**: Full system access
- **Editor**: Content creation and publishing
- **Moderator**: Comment moderation
- **Author**: Article creation
- **User**: Basic access and commenting

### Organizations
- Create and manage organizations
- Invite team members via email
- Organization-level permissions
- Team collaboration features

## 🌐 Internationalization

The application supports three languages:
- **French (fr)** - Default language
- **English (en)**
- **Spanish (es)**

### URL Structure
- `/fr/` - French content
- `/en/` - English content  
- `/es/` - Spanish content

### Adding Translations
Edit `src/i18n/ui.ts` to add new translation strings:

```typescript
export const ui = {
  fr: {
    'key': 'Français text',
  },
  en: {
    'key': 'English text', 
  },
  es: {
    'key': 'Spanish text',
  }
}
```

## 📧 Email Configuration

The application uses Nodemailer for email functionality. Supported features:
- Welcome emails with verification links
- Password reset emails
- OTP verification codes
- Organization invitations

Configure your SMTP settings in `.env`:
- Gmail: Use app passwords
- Outlook: Use app passwords
- Custom SMTP: Use your provider's settings

## 🗃️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:
- **User**: Authentication and user data
- **Profile**: Extended user information
- **Organization**: Team management
- **Role/Permission**: RBAC system
- **Article**: Content management
- **Category**: Content organization
- **Comment**: User engagement

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Deploy** to your preferred platform (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on the GitHub repository or contact the development team.