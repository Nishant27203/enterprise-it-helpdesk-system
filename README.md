# Enterprise IT Help Desk & Ticket Management System

A production-quality full-stack IT support platform built as a portfolio project for IT Support Engineer roles. Simulates a realistic internal help desk used by a medium-sized company.

## Business Problem

Organizations need a centralized system to manage IT support requests, track SLAs, assign technicians, escalate complex issues, and maintain an audit trail. This application solves that with role-based portals, real-time SLA tracking, and comprehensive reporting.

## Features

- **Authentication & RBAC** — JWT auth with Employee, Technician, Manager, Admin roles
- **Ticket Management** — Full lifecycle: create → assign → work → resolve → close
- **SLA Engine** — Configurable policies, auto-calculation, at-risk/breach detection, cron monitor
- **Escalation** — L1 → L2 → L3 with history and notifications
- **Comments** — Public comments + internal notes (hidden from employees)
- **Audit Trail** — Complete ticket activity timeline
- **Knowledge Base** — Searchable articles with troubleshooting steps
- **Notifications** — In-app notifications with 30s polling
- **Dashboards** — KPI cards and Recharts analytics from real PostgreSQL data
- **User Management** — Admin CRUD for users, roles, departments
- **SLA Administration** — Admin-configurable response/resolution times

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Recharts, date-fns, lucide-react |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcryptjs, RBAC |
| Validation | Zod |
| Security | Helmet, CORS, rate limiting |

## Architecture

```
React Frontend → Axios → Express (Routes → Controllers → Services → Prisma) → PostgreSQL
```

## Project Structure

```
/client/src/          → React frontend
/server/src/          → Express API
  config/             → Environment, Prisma
  controllers/        → HTTP handlers
  routes/             → API routes
  services/           → Business logic
  middleware/         → Auth, validation, errors
  jobs/               → SLA cron monitor
  validators/         → Zod schemas
/server/prisma/       → Schema, migrations, seed
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

> **macOS note:** Port 5000 is often used by AirPlay. Default API port is **5001**.

## Installation

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server `.env`:**
```
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/helpdesk_db
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
SLA_CHECK_INTERVAL_CRON=*/5 * * * *
```

**Client `.env`:**
```
VITE_API_URL=http://localhost:5001/api
```

### 3. Database setup

```bash
createdb helpdesk_db
cd server
npx prisma migrate dev
npm run db:seed
```

### 4. Start the application

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5001/api

## Demo Credentials

Password for all accounts: **`Demo@123`**

| Role | Email |
|------|-------|
| Employee | employee@company.com |
| IT Technician (L1) | tech.l1@company.com |
| IT Technician (L2) | tech.l2@company.com |
| IT Manager | manager@company.com |
| Admin | admin@company.com |

## API Overview

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Auth |
| POST | /api/auth/logout | Auth |
| POST/GET | /api/tickets | Auth |
| POST | /api/tickets/:id/accept | IT |
| POST | /api/tickets/:id/assign | Manager+ |
| POST | /api/tickets/:id/status | IT |
| POST | /api/tickets/:id/comments | Auth |
| POST | /api/tickets/:id/escalate | IT |
| POST | /api/tickets/:id/resolve | IT |
| POST | /api/tickets/:id/close | Auth |
| POST | /api/tickets/:id/feedback | Employee |
| GET | /api/dashboard/stats | Manager+ |
| GET | /api/knowledge-base | Auth |
| GET/POST/PATCH | /api/users | Admin |
| GET/PATCH | /api/sla-policies | Admin |
| GET | /api/notifications | Auth |

## Role Permissions

| Action | Employee | Technician | Manager | Admin |
|--------|----------|------------|---------|-------|
| Create tickets | ✓ | ✓ | ✓ | ✓ |
| View own tickets | ✓ | — | — | — |
| View assigned/queue | — | ✓ | ✓ | ✓ |
| View all tickets | — | — | ✓ | ✓ |
| Internal notes | — | ✓ | ✓ | ✓ |
| Assign tickets | — | — | ✓ | ✓ |
| Escalate | — | ✓ | ✓ | ✓ |
| Dashboard/Reports | — | — | ✓ | ✓ |
| User management | — | — | — | ✓ |
| SLA configuration | — | — | — | ✓ |

## Database Models

User, Department, Category, Subcategory, SLAPolicy, Ticket, TicketComment, TicketHistory, Escalation, KnowledgeArticle, Notification, TicketCounter

## Screenshots

_Screenshots placeholder — add after deployment._

## Future Improvements

- Email notifications
- File attachments on tickets
- Business-hours SLA clock
- Refresh token rotation
- Real-time WebSocket notifications
- CSV/PDF report export

## License

MIT
