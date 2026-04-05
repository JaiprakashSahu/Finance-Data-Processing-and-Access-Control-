# Finance Dashboard Project

Role-based finance dashboard with analytics APIs.

A full-stack system showcasing backend engineering fundamentals (RBAC, validation, response consistency, service-layer design) with a multi-page React frontend.

## Features

- Role-based access control with mock authentication
  - Roles: admin, analyst, viewer
  - Header-driven role simulation via x-user-role and x-user-id
- Records API
  - CRUD endpoints for financial records
  - Input validation and ownership restrictions
  - Filtering and pagination support
- Dashboard analytics
  - Summary (income, expense, net balance)
  - Monthly trends
  - Category-wise expense aggregation
  - Dashboard APIs support filtering by date range and transaction type, implemented using MongoDB aggregation pipelines
- Frontend multi-page UX
  - Dashboard
  - Income & Expenses
  - Assets & Goals
  - Functional sidebar routing with active state
- Consistent API response envelope
  - Success and error responses use:
    {
      "message": string,
      "data": any,
      "error": null | string
    }

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- Joi validation

### Frontend
- React (functional components)
- Tailwind CSS
- React Router DOM
- Axios
- Recharts

## Project Structure

- finance-backend
  - src/controllers
  - src/services
  - src/routes
  - src/middleware
  - src/models
  - src/validation
  - src/scripts/seedDemoData.js
- finance-frontend
  - src/components
  - src/pages
  - src/services/api.js
- postman
  - Finance-Dashboard.postman_collection.json
- docs/screenshots

## Architecture

- Request flow:
  - Routes apply authentication and RBAC middleware
  - Controllers stay thin and delegate business logic to services
  - Services enforce ownership, filtering, and aggregation logic
- Data layer:
  - MongoDB + Mongoose models for User and Record entities
  - Aggregation pipelines power dashboard analytics (summary, trends, category-wise)
- API contract:
  - Unified response envelope for success and failure
  - Joi validation for body, params, and query inputs
- Auth model:
  - Mock auth via headers for demonstration (`x-user-role`, `x-user-id`)
  - Least-privilege fallback role is `viewer`
  - RBAC authorization is route-driven, not controller-hardcoded

## Setup Instructions

## 1) Clone and install

```bash
# from project root
npm --prefix finance-backend install
npm --prefix finance-frontend install
```

## 2) Environment variables

### Backend (finance-backend/.env)

```env
PORT=3000
MONGO_URI=<your_mongodb_connection_string>
```

Reference template: finance-backend/.env.example

### Frontend (finance-frontend/.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

Reference template: finance-frontend/.env.example

## 3) Seed demo data

```bash
npm --prefix finance-backend run seed:demo
```

This seeds sample users and records so dashboards are meaningful.

## 4) Run backend and frontend

```bash
npm --prefix finance-backend run dev
npm --prefix finance-frontend run dev
```

Frontend default URL: http://localhost:5173

## Mock Authentication (Assumption)

Authentication is intentionally simulated for demonstration quality and evaluator clarity.

- Protected requests use middleware-injected req.user.
- You can test roles without login flows using headers:
  - x-user-role: admin | analyst | viewer
  - x-user-id: <mongo object id>
- If role headers are not provided, the API falls back to least-privilege viewer mode backed by a seeded default demo viewer.

This can be replaced with real JWT auth in production without changing business logic boundaries.

## API Endpoints

### Health
- GET /health

### Users
- POST /users (admin)
- GET /users (admin)
- PATCH /users/:id/role (admin)

### Records
- POST /records (admin)
- GET /records (admin, analyst, viewer)
- GET /records/:id (admin, analyst, viewer)
- PUT /records/:id (admin)
- DELETE /records/:id (admin)

### Dashboard
- GET /dashboard/summary (admin, analyst, viewer)
- GET /dashboard/trends (admin, analyst, viewer)
- GET /dashboard/category-wise (admin, analyst, viewer)

## Test Matrix (curl-ready)

Set base URL and reusable headers:

```bash
BASE_URL="http://localhost:3000"
ADMIN_H="x-user-role: admin"
ANALYST_H="x-user-role: analyst"
VIEWER_H="x-user-role: viewer"
```

1. Health check (expect 200)

```bash
curl -i "$BASE_URL/health"
```

2. Admin users list (expect 200)

```bash
curl -i -H "$ADMIN_H" "$BASE_URL/users"
```

3. Viewer users list blocked (expect 403)

```bash
curl -i -H "$VIEWER_H" "$BASE_URL/users"
```

4. Missing role defaults to viewer, users blocked (expect 403)

```bash
curl -i "$BASE_URL/users"
```

5. Records list for default viewer mode (expect 200 + pagination)

```bash
curl -i "$BASE_URL/records?page=1&limit=5"
```

6. Dashboard summary with date and type filters (expect 200)

```bash
curl -i -H "$ADMIN_H" "$BASE_URL/dashboard/summary?startDate=2025-11-01&endDate=2026-04-30&type=expense"
```

7. Dashboard trends year-month aggregation (expect 200, `month` like `YYYY-MM`)

```bash
curl -i -H "$ADMIN_H" "$BASE_URL/dashboard/trends?startDate=2025-11-01&endDate=2026-04-30"
```

8. Category-wise dashboard filter by type (expect 200)

```bash
curl -i -H "$ADMIN_H" "$BASE_URL/dashboard/category-wise?type=income"
```

9. Invalid dashboard date range validation (expect 400)

```bash
curl -i -H "$ADMIN_H" "$BASE_URL/dashboard/summary?startDate=2026-12-31&endDate=2025-01-01"
```

10. Duplicate email conflict (expect 409)

```bash
curl -i -H "$ADMIN_H" -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"viewer.demo@finance.local","password":"Pass@1234","role":"viewer"}' \
  "$BASE_URL/users"
```

## Postman Collection

Import:
- postman/Finance-Dashboard.postman_collection.json

Collection includes health, users, records, and dashboard requests with role header examples.

## UI Screenshots

- Dashboard
  - ![Dashboard](docs/screenshots/dashboard.png)
- Income & Expenses
  - ![Income & Expenses](docs/screenshots/income-expenses.png)
- Assets & Goals
  - ![Assets & Goals](docs/screenshots/assets-goals.png)

## Final Validation Notes

The project has been prepared for submission with:
- cleaned modular frontend structure
- consistent backend response envelope
- route-level RBAC checks and ownership behavior
- sample data seeding support
- multi-page frontend navigation and loading/empty/error states

## Optional Deployment (Enhancement)

Suggested targets:
- Backend: Render or Railway
- Frontend: Vercel or Netlify

After deployment, add live links here for submission.
