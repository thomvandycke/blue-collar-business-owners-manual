# Blue Collar Business Owner's Manual

A production-ready MVP SaaS web app for blue-collar business owners to run their company through 8 fixed business systems using the GRIT framework.

## What This MVP Includes

- Multi-tenant account model (1 account per business)
- Account signup with automatic creation of all 8 systems
- Session-based email/password authentication (secure hashed passwords)
- Invite flow with tokenized invite acceptance
- Direct admin user creation (no invite link required)
- Admin/member role permissions
- Restricted admin user-management area (allowlisted super-admin emails)
- Account branding (name, color, logo upload)
- User profile management (display name, profile image, password change)
- In-app Help / Feature Request form (emails internal team)
- New user registration email notifications
- Dashboard with:
  - system health cards
  - KPI rollup
  - top priorities
  - my tasks
  - overdue tasks
  - upcoming milestones
  - recent activity
- 8 system pages with:
  - default View Mode
  - intentional Edit Mode toggle
  - GRIT sections (Game Plan, Rigging, Indicators, Traction)
  - annual goals
  - quarterly milestones
  - monthly tasks
  - priorities
  - KPI management
- One-page system summary view for print workflows
- Tenant isolation and role checks in all mutations
- Activity logging for important actions

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn-style UI primitives
- Prisma ORM
- PostgreSQL
- Zod validation
- React Hook Form + server actions where useful
- Vercel-compatible deployment

## Business Rules Enforced

- Exactly one instance of each of the 8 systems per account
- Max 3 active users per account (base plan)
- Max 5 active KPIs per system
- Only admins can edit GRIT content and account/user settings
- Members can view all systems and update tasks assigned to them
- User deactivation is soft (`isActive`) to preserve history
- Activity log entries created on major mutations

## Project Structure

- `prisma/schema.prisma` - full data model and enums
- `prisma/migrations/0001_init/migration.sql` - initial SQL migration
- `prisma/seed.ts` - seed script with demo account/users/systems/data
- `src/actions/*` - server actions for auth/settings/system CRUD
- `src/app/(public)/*` - public routes (`/login`, `/signup`, invite/reset flows)
- `src/app/(app)/*` - authenticated app routes
- `src/components/*` - reusable UI/layout/system/dashboard components
- `src/lib/*` - auth/session, validation, Prisma, system data helpers

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - app base URL (`http://localhost:3000` in local dev)
- `GOOGLE_EMAIL_USER` - Google account email used for app notifications
- `GOOGLE_EMAIL_APP_PASSWORD` - Google App Password for SMTP (recommended)
- `GOOGLE_EMAIL_FROM` - optional sender identity, e.g. `Blue Collar Manual <ops@unmatchedgrowth.com>`
- `NEW_USER_NOTIFY_EMAILS` - comma-separated inboxes for new-user registration notifications (defaults to Thom + Brad)

Google setup note:
- Enable 2-Step Verification on the Google account.
- Create an App Password in Google Security settings.
- Use that App Password for `GOOGLE_EMAIL_APP_PASSWORD` (not your main Google password).

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run db:generate
```

3. Apply database migrations

```bash
npm run db:migrate
```

4. Seed demo data

```bash
npm run db:seed
```

5. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Seed Credentials

After `npm run db:seed`:

- Admin: `admin@demo-bluecollar.com` / `Admin123!`
- Member: `member@demo-bluecollar.com` / `Member123!`

## Core Routes

Public:

- `/login`
- `/signup`
- `/accept-invite/[token]`
- `/forgot-password`
- `/reset-password/[token]`

Authenticated:

- `/dashboard`
- `/support`
- `/systems/[systemName]`
- `/systems/[systemName]/summary`
- `/settings/account`
- `/settings/users`
- `/settings/profile`

## Database Notes

- Uses PostgreSQL enums and relational constraints.
- Includes optional `Session` and `PasswordResetToken` models for custom auth.
- Includes `ActivityLog` for mutation history.
- Planning models include notes/status/priority/ownership/date fields.

## Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run db:generate` - Prisma client generate
- `npm run db:migrate` - apply/create migrations
- `npm run db:seed` - seed database

## Vercel Deployment Notes

1. Push this repo to GitHub.
2. Import project into Vercel.
3. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL/domain)
   - `GOOGLE_EMAIL_USER`
   - `GOOGLE_EMAIL_APP_PASSWORD`
   - `GOOGLE_EMAIL_FROM` (optional)
   - `NEW_USER_NOTIFY_EMAILS`
4. Ensure your Postgres instance is reachable from Vercel.
5. Run migrations against production DB before or during first deploy.

Recommended deployment workflow:

- Run `npm run build` locally before pushing
- Run migrations in CI/CD or as a controlled release step

## Current Verification Status

- `npm run lint` passes with non-blocking image-element warnings.
- `npm run build` passes successfully.
