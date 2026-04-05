# Finance Dashboard Project

A full-stack finance dashboard showcasing backend engineering fundamentals (RBAC, validation, response consistency, service-layer design) with a multi-page React frontend.

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
