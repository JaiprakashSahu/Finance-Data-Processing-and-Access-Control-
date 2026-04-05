# Finance Backend API

## Project Overview
Production-ready backend for personal finance data processing with role-based access control, JWT authentication, input validation, and analytics endpoints for dashboard consumption.

Core features:
- JWT authentication (`register`, `login`)
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
- JWT (`jsonwebtoken`)
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
JWT_SECRET=<long_random_secret>
JWT_EXPIRES_IN=1d
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
### Auth Endpoints
- `POST /auth/register`
- `POST /auth/login`

### Token usage
Send JWT in header:
```http
Authorization: Bearer <token>
```

### Roles
- `viewer`
- `analyst`
- `admin`

## API Endpoints
### Auth
- `POST /auth/register`
  - Public signup (creates `viewer` by default)
- `POST /auth/login`
  - Returns `{ user, token }`

### Users
- `POST /users` (admin)
  - Create user with role/status control
- `GET /users` (admin)
  - List users (password excluded)
- `PATCH /users/:id/role` (admin)
  - Update user role

### Records
- `POST /records` (authenticated)
  - Create a record
  - Non-admin users can only create their own records
- `GET /records` (authenticated)
  - List records with filters and pagination
  - Query params:
    - `page` (default: 1)
    - `limit` (default: 10, max: 100)
    - `type` (`income|expense`)
    - `category`
    - `startDate` (ISO)
    - `endDate` (ISO)
    - `userId` (admin only)
- `GET /records/:id` (authenticated)
  - Fetch single record with ownership guard
- `PUT /records/:id` (authenticated)
  - Update record with ownership guard
- `DELETE /records/:id` (authenticated)
  - Delete record with ownership guard

### Dashboard
- `GET /dashboard/summary` (authenticated)
- `GET /dashboard/trends` (authenticated)
- `GET /dashboard/category-wise` (authenticated)
  - Optional query param: `userId` (admin only)

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
- Public registration is limited to creating `viewer` users; elevated roles are admin-managed.
- JWT is the sole authentication mechanism for protected routes.
- Role/ownership checks are enforced on all relevant record operations.
- Pagination is mandatory for record listing and always returned with metadata.
- Passwords are never returned in API payloads.

## Optional Enhancements (Not included yet)
- Swagger/OpenAPI docs
- Automated API tests (Jest/Supertest)
- CI pipeline and cloud deployment manifests
