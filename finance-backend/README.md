# Finance Backend API

## Project Overview
Backend for personal finance data processing with role-based access control (RBAC), input validation, records management, and dashboard analytics.

Core features:
- Mock authentication middleware for RBAC demonstrations
- RBAC (`viewer`, `analyst`, `admin`)
- Records CRUD with ownership checks
- Records filtering and pagination
- Dashboard analytics (summary, trends, category-wise expenses)
- Standardized API responses
- Centralized error handling and structured logging

## Tech Stack
- Node.js
- Express
- MongoDB + Mongoose
- Validation (`Joi`)
- Security middleware (`helmet`, `cors`)

## Setup Instructions
### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create or update `.env`:
```env
PORT=3000
MONGO_URI=<your_mongodb_connection_string>
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run in production mode
```bash
npm start
```

## API Response Format
All endpoints return:

```json
{
  "message": "string",
  "data": {},
  "error": null
}
```

For failures:

```json
{
  "message": "string",
  "data": null,
  "error": "string"
}
```

## Authentication & Authorization
Authentication is simulated using mock middleware. Roles are injected into requests to demonstrate RBAC. This can be replaced with JWT-based authentication in production.

### Mock user injection
All protected routes automatically receive `req.user` from middleware:

```js
req.user = {
  id: '000000000000000000000001',
  role: 'admin' // admin | analyst | viewer
};
```

### Dynamic role switching (recommended for testing)
Override role and user id per request using headers:

```http
x-user-role: viewer
x-user-id: 65f1c9f7605f5d6f9f9c0a11
```

If headers are not provided or invalid, middleware falls back to the default mock user.

### Roles
- `viewer`
- `analyst`
- `admin`

## API Endpoints
### Users
- `POST /users` (admin)
  - Create user with role/status control
- `GET /users` (admin)
  - List users (password excluded)
- `PATCH /users/:id/role` (admin)
  - Update user role

### Records
- `POST /records` (admin)
  - Create a record
- `GET /records` (admin, analyst, viewer)
  - List records with filters and pagination
  - Query params:
    - `page` (default: 1)
    - `limit` (default: 10, max: 100)
    - `type` (`income|expense`)
    - `category`
    - `startDate` (ISO)
    - `endDate` (ISO)
    - `userId` (admin only)
- `GET /records/:id` (admin, analyst, viewer)
  - Fetch single record with ownership guard
- `PUT /records/:id` (admin)
  - Update record with ownership guard
- `DELETE /records/:id` (admin)
  - Delete record with ownership guard

### Dashboard
- `GET /dashboard/summary` (admin, analyst, viewer)
- `GET /dashboard/trends` (admin, analyst, viewer)
- `GET /dashboard/category-wise` (admin, analyst, viewer)
  - Optional query param: `userId` (admin only)

## RBAC Behavior
- Admin: full access to all routes and data.
- Analyst: read-only access to records and dashboard data.
- Viewer: limited read-only access to records and dashboard data.

Ownership simulation still applies for non-admin users via `req.user.id`.

## Validation
Joi-based request validation is applied to:
- request body
- URL params
- query params

Validation failures return meaningful `400` responses with aggregated field messages.

## Logging & Error Handling
- Centralized error middleware handles all thrown errors.
- Structured logs include method, path, status, and error message.
- In production mode (`NODE_ENV=production`), internal errors are masked.

## Project Structure
```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validation/
```

## Assumptions Made
- Authentication is mocked for demonstration and can be replaced by real authentication later.
- Role/ownership checks are enforced on all relevant record operations.
- Pagination is mandatory for record listing and always returned with metadata.
- Passwords are never returned in API payloads.

## Optional Enhancements (Not included yet)
- Swagger/OpenAPI docs
- Automated API tests (Jest/Supertest)
- CI pipeline and cloud deployment manifests
