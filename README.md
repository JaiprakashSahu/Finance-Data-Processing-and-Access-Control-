# Finance Data Processing and Access Control

Finance Data Processing and Access Control is a full-stack application for managing personal finance records with role-based permissions.
It separates a React frontend and an Express/MongoDB backend for clean deployment and maintainability.
The project demonstrates secure API access, analytics dashboards, and production-ready repository structure.

## Tech Stack

- React (Vite)
- Node.js
- Express
- MongoDB (Mongoose)

## Key Features

- Role-Based Access Control (admin, analyst, viewer)
- Dashboard analytics (summary, trends, category-wise insights)
- Record filtering and pagination
- API security middleware (CORS, Helmet, validation)
- Consistent API response envelope and error handling

## Architecture

- Frontend: React application in `finance-frontend/`
- Backend: Node.js + Express API in `finance-backend/`
- Documentation and artifacts: `docs/`
- API collection: `postman/`

This separation enables independent frontend/backend deployment and easier scaling.

## Local Setup

1. Install dependencies:

```bash
npm --prefix finance-backend install
npm --prefix finance-frontend install
```

2. Configure environment files from examples:

- `finance-backend/.env.example`
- `finance-frontend/.env.example`

3. Run backend:

```bash
npm --prefix finance-backend run dev
```

4. Run frontend:

```bash
npm --prefix finance-frontend run dev
```

## Production Setup

1. Backend deploy target: Render
- Configure environment values for `MONGO_URI` and `JWT_SECRET`

2. Frontend deploy target: Vercel
- Set `VITE_API_URL` to backend URL

3. Ensure frontend routes are rewritten to `index.html` for SPA routing (configured via `finance-frontend/vercel.json`).

## Deployment Links

- Frontend: https://finance-data-processing-and-access-pied-one.vercel.app
- Backend: https://finance-data-processing-and-access-ow1l.onrender.com

## Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Income & Expenses
![Income and Expenses](docs/screenshots/income-expenses.png)

### Assets & Goals
![Assets and Goals](docs/screenshots/assets-goals.png)

## API Documentation

- Postman Collection: [postman/Finance-Dashboard.postman_collection.json](postman/Finance-Dashboard.postman_collection.json)
- Swagger (optional): Not configured in this repository.

## Repository Structure

```text
finance-backend/
finance-frontend/
docs/
postman/
```
