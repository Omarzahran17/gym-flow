# Gym Administration System

A comprehensive gym management system built with Next.js 15, TypeScript, BetterAuth, Stripe, and Vercel Blob.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Auth | BetterAuth + @better-auth/stripe |
| UI | Shadcn/ui + Tailwind CSS |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| File Storage | Vercel Blob |
| Payments | Stripe (via Better Auth) |
| QR Codes | qrcode.react |
| Video Player | React Player |
| PDF Export | @react-pdf/renderer |

## Features

### Admin Dashboard
- Overview statistics (members, trainers, attendance, revenue)
- Member management (CRUD, profiles, QR codes)
- Trainer management (CRUD, workload tracking)
- Subscription plan management
- Class scheduling
- Equipment management
- PDF reports generation

### Trainer Portal
- Assigned member management
- Workout plan creation and assignment
- Exercise library management
- Class scheduling
- Progress tracking

### Member Portal
- Subscription management
- Workout plan viewing
- Progress tracking (measurements, photos, PRs)
- Class booking
- Attendance history

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon)
- Stripe account
- Vercel Blob account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gym-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```env
# Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system uses the following main tables:

- **members** - Gym member profiles with QR codes
- **trainers** - Trainer profiles with specializations
- **subscription_plans** - Subscription tier definitions
- **member_subscriptions** - Active member subscriptions
- **attendance** - Check-in/out records
- **exercises** - Exercise library
- **workout_plans** - Member workout programs
- **plan_exercises** - Exercises within workout plans
- **measurements** - Body measurements tracking
- **progress_photos** - Progress photo storage
- **personal_records** - PR tracking
- **achievements** - Achievement definitions
- **member_achievements** - Earned achievements
- **classes** - Group fitness classes
- **class_schedules** - Class schedules
- **class_bookings** - Member class bookings
- **equipment** - Gym equipment inventory
- **equipment_maintenance** - Maintenance logs
- **messages** - In-app messaging

## API Routes

### Authentication
- `POST /api/auth/sign-in/email` - Email sign in
- `POST /api/auth/sign-up/email` - Email sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### Admin
- `GET/POST /api/admin/members` - Member management
- `GET/PUT /api/admin/members/[id]` - Single member
- `GET/POST /api/admin/trainers` - Trainer management
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET/POST /api/admin/subscriptions/plans` - Subscription plans

### General
- `POST /api/blob/upload` - Upload files to Vercel Blob
- `POST /api/blob/delete` - Delete files from Vercel Blob
- `GET/POST /api/attendance` - Attendance records

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── members/
│   │   │   ├── trainers/
│   │   │   ├── subscriptions/
│   │   │   ├── classes/
│   │   │   ├── equipment/
│   │   │   └── page.tsx
│   │   ├── trainer/
│   │   ├── member/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── blob/
│   │   ├── attendance/
│   │   └── admin/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layout/
│   └── pdf/
├── lib/
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   ├── auth.ts
│   ├── blob.ts
│   └── utils.ts
├── hooks/
├── stores/
└── types/
```

## Stripe Integration

The system uses BetterAuth's Stripe plugin for subscription management:

1. Create subscription products in your Stripe dashboard
2. Set up pricing (monthly/annual)
3. Configure webhooks to point to `/api/auth/stripe/webhook`
4. Add price IDs to your subscription plans

## Deployment

### Vercel
1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

### Database Migrations
```bash
npm run db:migrate
```

## License

MIT
