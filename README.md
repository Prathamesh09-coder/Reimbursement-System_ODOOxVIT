# Reimbursement System (ODOO x VIT)

A full-stack reimbursement management platform with role-based approvals, workflow automation, notifications, and multi-company support.

## Overview

This repository contains two apps:

- `backend`: Node.js + Express + TypeScript REST API using Prisma and MySQL.
- `frontend`: React + TypeScript SPA built with Vite and Tailwind.

The system supports:

- Authentication (signup/login/forgot-password)
- Expense creation, submission, and tracking
- Multi-step approval workflows
- Role and user management
- Notification management
- Currency-aware expense records

## Tech Stack

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- MySQL
- Nodemailer (Mailjet config support)

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- React Router
- React Query

## Repository Structure

```text
Reimbursement-System_ODOOxVIT/
|-- backend/
|   |-- FEATURE_VERIFICATION_REPORT.md
|   |-- package.json
|   |-- tsconfig.json
|   |-- prisma/
|   |   |-- schema.prisma
|   |-- src/
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- config/
|   |   |   |-- db.ts
|   |   |   |-- mail.ts
|   |   |-- middleware/
|   |   |   |-- authMiddleware.ts
|   |   |   |-- error.middleware.ts
|   |   |   |-- rbac.middleware.ts
|   |   |-- modules/
|   |   |   |-- approvals/
|   |   |   |   |-- approval.controller.ts
|   |   |   |   |-- approval.routes.ts
|   |   |   |   |-- approval.service.ts
|   |   |   |-- auth/
|   |   |   |   |-- auth.controller.ts
|   |   |   |   |-- auth.routes.ts
|   |   |   |   |-- auth.service.ts
|   |   |   |-- currency/
|   |   |   |   |-- currency.service.ts
|   |   |   |-- expenses/
|   |   |   |   |-- expense.controller.ts
|   |   |   |   |-- expense.routes.ts
|   |   |   |   |-- expense.service.ts
|   |   |   |-- notifications/
|   |   |   |   |-- notification.controller.ts
|   |   |   |   |-- notification.routes.ts
|   |   |   |   |-- notification.service.ts
|   |   |   |-- ocr/
|   |   |   |   |-- ocr.service.ts
|   |   |   |-- users/
|   |   |   |   |-- ...
|   |   |   |-- workflow/
|   |   |   |   |-- ...
|   |   |-- routes/
|   |   |   |-- approval.routes.ts
|   |   |   |-- auth.routes.ts
|   |   |   |-- expense.routes.ts
|   |   |-- scripts/
|   |   |   |-- checkCategories.ts
|   |   |   |-- comprehensiveTest.ts
|   |   |   |-- generateReport.ts
|   |   |   |-- resetAdminPassword.ts
|   |   |   |-- seedAdmin.ts
|   |   |   |-- showAllData.ts
|   |   |   |-- testConnection.ts
|   |   |   |-- testDataFetch.ts
|   |   |   |-- testNewFeatures.ts
|   |   |   |-- validateRequirements.ts
|   |   |-- services/
|   |   |   |-- approvalEngine.ts
|   |   |   |-- currencyService.ts
|   |   |   |-- emailService.ts
|   |   |   |-- workflowService.ts
|   |   |-- types/
|   |   |   |-- express.d.ts
|   |   |-- utils/
|   |       |-- password.ts
|   |       |-- token.ts
|   |       |-- uuid.ts
|-- frontend/
|   |-- components.json
|   |-- index.html
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.ts
|   |-- tsconfig.app.json
|   |-- tsconfig.json
|   |-- tsconfig.node.json
|   |-- vite.config.ts
|   |-- public/
|   |   |-- robots.txt
|   |-- src/
|       |-- App.css
|       |-- App.tsx
|       |-- index.css
|       |-- main.tsx
|       |-- vite-env.d.ts
|       |-- components/
|       |   |-- AppLayout.tsx
|       |   |-- NavLink.tsx
|       |   |-- NotificationDropdown.tsx
|       |   |-- StatusBadge.tsx
|       |   |-- SummaryCard.tsx
|       |   |-- ui/
|       |       |-- ...
|       |-- contexts/
|       |   |-- AuthContext.tsx
|       |   |-- NotificationContext.tsx
|       |-- data/
|       |   |-- mockData.ts
|       |-- hooks/
|       |   |-- use-mobile.tsx
|       |   |-- use-toast.ts
|       |-- lib/
|       |   |-- api.ts
|       |   |-- domain.ts
|       |   |-- utils.ts
|       |-- pages/
|       |   |-- AddExpensePage.tsx
|       |   |-- ApprovalsPage.tsx
|       |   |-- DashboardPage.tsx
|       |   |-- ExpenseDetailPage.tsx
|       |   |-- ExpenseListPage.tsx
|       |   |-- Index.tsx
|       |   |-- LoginPage.tsx
|       |   |-- NotFound.tsx
|       |   |-- NotificationsPage.tsx
|       |   |-- SignupPage.tsx
|       |   |-- UsersPage.tsx
|       |   |-- WorkflowsPage.tsx
|       |-- types/
|           |-- index.ts
|-- .gitignore
```

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+

## Environment Variables

Create a `.env` file in `backend/` with at least:

```env
PORT=5000
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
JWT_SECRET="change_me"

MAILJET_API_KEY=""
MAILJET_SECRET_KEY=""
MAILJET_FROM_EMAIL="no-reply@reimburseiq.app"
MAILJET_FROM_NAME="ReimburseIQ"
MAIL_SIMULATION=true
```

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Getting Started

### 1. Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

### 2. Setup database (backend)

From `backend/`:

```bash
npx prisma generate
npx prisma db push
```

Optional seed/admin utilities:

```bash
npm run seed:admin
```

### 3. Run development servers

Backend (from `backend/`):

```bash
npm run dev
```

Frontend (from `frontend/`):

```bash
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `GET /health`

## Backend Scripts

From `backend/`:

- `npm run dev` - start API in dev mode
- `npm run seed:admin` - seed admin user
- `npm run reset:admin` - reset admin password
- `npm run test:connection` - test DB/API connection

## Frontend Scripts

From `frontend/`:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - run ESLint
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode

## API Route Groups

- `/api/auth`
- `/api/expenses`
- `/api/approvals`
- `/api/users`
- `/api/workflows`
- `/api/notifications`

## Notes

- Authentication middleware protects all route groups except auth endpoints.
- Prisma schema uses MySQL and includes companies, users, roles, workflows, expenses, approvals, notifications, and audit logs.
- Mail sending can run in simulation mode with `MAIL_SIMULATION=true`.
