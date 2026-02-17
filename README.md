# Property Management System

A comprehensive property management application built with Next.js that helps property managers track properties, appliances, maintenance records, and issues in one centralized dashboard.

## Features

### Property Management
- Add and manage multiple properties
- Track property details and types
- View property-specific analytics

### Appliance Tracking
- Register appliances for each property
- Monitor appliance status and condition
- Track installation dates and warranties

### Maintenance Management
- Schedule and track maintenance records
- Record costs, technicians, and parts replaced
- Set next due dates and warranty periods
- Support multiple maintenance types (routine, repair, inspection, replacement, etc.)

### Issue Tracking
- Report and manage property issues
- Set urgency levels (critical, high, medium, low)
- Track issue resolution progress
- Link issues to specific appliances

### Dashboard Analytics
- Comprehensive overview of all properties and appliances
- Track maintenance costs and trends
- Identify properties needing attention
- View expensive appliances and cost analysis
- Monthly spending reports

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js with credential provider
- **Database**: PostgreSQL with pg adapter
- **Icons**: Lucide React
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd property-management-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/property_management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database
```bash
# Start PostgreSQL (macOS with Homebrew)
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql@14

# Create database and tables (you'll need to set up the schema)
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── properties/   # Property CRUD operations
│   │   ├── appliances/   # Appliance management
│   │   ├── maintenance/  # Maintenance records
│   │   ├── issues/       # Issue tracking
│   │   └── dashboard/    # Analytics endpoints
│   ├── auth/             # Auth pages (signin/signup)
│   └── property/         # Property detail pages
├── components/           # React components
│   ├── features/        # Feature-specific components
│   │   ├── auth/       # Authentication components
│   │   ├── dashboard/  # Dashboard widgets
│   │   ├── properties/ # Property management
│   │   └── maintenance/# Maintenance tracking
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
│   ├── auth.ts        # NextAuth configuration
│   ├── db.js          # Database connection
│   └── utils.ts       # Helper functions
└── types/             # TypeScript definitions
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User authentication and profiles
- `properties` - Property information
- `appliances` - Appliances linked to properties
- `maintenance_records` - Maintenance history and scheduling
- `issues` - Issue tracking and resolution

## Authentication

The app uses NextAuth.js with a credentials provider. Users can:
- Register new accounts
- Sign in with email/password
- Access user-specific data (multi-tenant)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage

1. **Sign up** for a new account or **sign in**
2. **Add properties** to your portfolio
3. **Register appliances** for each property
4. **Schedule maintenance** and track costs
5. **Report issues** and monitor resolution
6. **View dashboard** for analytics and insights

## Development Notes

- Uses Next.js App Router for modern routing
- TypeScript for type safety
- Feature-based component organization
- Responsive design with mobile support
- Error boundaries and loading states
- Database connection pooling with pg

## Future Enhancements

- [ ] Email notifications for maintenance due dates
- [ ] Bulk import/export functionality  
- [ ] Multi-user accounts with role permissions
- [ ] Subscription billing system
- [ ] Vendor management system
- [ ] Document/photo uploads
- [ ] Advanced reporting and analytics

## License

This project is private and not licensed for public use.

## Contributing

This is a personal project. If you have suggestions or find bugs, please create an issue.
