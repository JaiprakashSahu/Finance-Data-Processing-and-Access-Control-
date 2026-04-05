# 💼 Finance Dashboard - Role-Based Personal Finance Management

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)

### 🚀 [Run Locally](#-getting-started) | 📖 [Features](#-key-features)

*A full-stack dashboard for finance records, role-aware access control, and analytics insights with a clean multi-page interface.*

</div>

---

## 🌟 Overview

Finance Dashboard is a practical full-stack project that connects backend access control with frontend analytics UX. It is built to showcase production-style patterns: service-layer architecture, consistent API contracts, secure defaults, and filterable insights.

### 💡 Why This Project?

- **RBAC-Driven**: Role-based behavior for `admin`, `analyst`, and `viewer`
- **Ownership-Safe**: Non-admin access is scoped to owned records
- **Analytics Ready**: Summary, monthly trends, and category insights
- **Demo Friendly**: Header-driven mock auth for instant role simulation
- **Modern UI**: Responsive React pages with charts and clear state handling

---

## ✨ Key Features

### 🔐 Role-Based Access Control
- Header-based role simulation via `x-user-role` and `x-user-id`
- Least-privilege fallback behavior defaults to `viewer`
- Route-level authorization with clean middleware boundaries

### 🧾 Records Management
- CRUD APIs for financial records
- Validation for request body, params, and query filters
- Pagination and filtering support for scalable lists

### 📊 Dashboard Analytics
- **Summary**: total income, total expense, net balance
- **Trends**: monthly aggregation using `YYYY-MM` grouping
- **Category-Wise**: grouped insights with date/type filters

### 🖥️ Multi-Page Frontend
- **Dashboard** page with trend and category visuals
- **Income & Expenses** page for transaction-centric flow
- **Assets & Goals** page for broader planning context
- Role switcher for live RBAC behavior demonstration

### 🧪 Developer Workflow
- Demo seed script for meaningful data out of the box
- Postman collection for quick endpoint validation
- Frontend lint/build scripts for pre-deploy quality checks

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite 8
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose
- **Validation**: Joi
- **Security**: Helmet, CORS

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- npm

### Installation

1. **Clone and enter the repository**
  ```bash
  git clone <your-repo-url>
  cd Zorvyn
  ```

2. **Install dependencies**
  ```bash
  npm --prefix finance-backend install
  npm --prefix finance-frontend install
  ```

3. **Environment setup**

  **Backend (`finance-backend/.env`)**
  ```env
  PORT=3000
  MONGO_URI=<your_mongodb_connection_string>
  ```

  **Frontend (`finance-frontend/.env`)**
  ```env
  VITE_API_BASE_URL=http://localhost:3000
  ```

  Reference templates:
  - `finance-backend/.env.example`
  - `finance-frontend/.env.example`

4. **Seed demo data**
  ```bash
  npm --prefix finance-backend run seed:demo
  ```

5. **Run services**

  **Terminal 1 (Backend)**
  ```bash
  npm --prefix finance-backend run dev
  ```

  **Terminal 2 (Frontend)**
  ```bash
  npm --prefix finance-frontend run dev
  ```

  Open `http://localhost:5173`

---

## 📁 Project Structure

```text
Zorvyn/
├── finance-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validation/
│   └── package.json
├── finance-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── postman/
│   └── Finance-Dashboard.postman_collection.json
└── docs/
   └── screenshots/
```

---

## 🧠 Architecture Highlights

- Controllers stay thin and delegate to service methods
- Services centralize business logic, ownership, and filtering rules
- Middleware handles auth simulation and RBAC checks before controllers
- API responses follow a unified envelope:

```json
{
  "message": "string",
  "data": {},
  "error": null
}
```

---

## 🔌 API Overview

### Health
- `GET /health`

### Users
- `POST /users` (admin)
- `GET /users` (admin)
- `PATCH /users/:id/role` (admin)

### Records
- `POST /records` (admin)
- `GET /records` (admin, analyst, viewer)
- `GET /records/:id` (admin, analyst, viewer)
- `PUT /records/:id` (admin)
- `DELETE /records/:id` (admin)

### Dashboard
- `GET /dashboard/summary` (admin, analyst, viewer)
- `GET /dashboard/trends` (admin, analyst, viewer)
- `GET /dashboard/category-wise` (admin, analyst, viewer)

---

## 🧪 Quick API Smoke Test

```bash
BASE_URL="http://localhost:3000"
ADMIN_H="x-user-role: admin"
VIEWER_H="x-user-role: viewer"

curl -i "$BASE_URL/health"
curl -i -H "$ADMIN_H" "$BASE_URL/users"
curl -i -H "$VIEWER_H" "$BASE_URL/users"
curl -i "$BASE_URL/records?page=1&limit=5"
curl -i -H "$ADMIN_H" "$BASE_URL/dashboard/summary?startDate=2025-11-01&endDate=2026-04-30&type=expense"
```

---

## 📮 Postman Collection

Import the collection from:

- [postman/Finance-Dashboard.postman_collection.json](postman/Finance-Dashboard.postman_collection.json)

---

## 🖼️ Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Income & Expenses
![Income & Expenses](docs/screenshots/income-expenses.png)

### Assets & Goals
![Assets & Goals](docs/screenshots/assets-goals.png)

---

## 🚀 Deployment

### Backend (Render / Railway)

1. Set root directory to `finance-backend`
2. Build command:
  ```bash
  npm install
  ```
3. Start command:
  ```bash
  npm start
  ```
4. Environment variables:
  - `MONGO_URI`
  - `PORT` (if platform requires explicit port)

### Frontend (Vercel / Netlify)

1. Set root directory to `finance-frontend`
2. Build command:
  ```bash
  npm run build
  ```
3. Output directory: `dist`
4. Environment variable:
  - `VITE_API_BASE_URL=<deployed_backend_url>`

### Post-Deploy Checklist

1. Confirm `GET /health` returns `200`
2. Confirm dashboard pages load with API data
3. Confirm role switching changes data scope as expected

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-change`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to your branch (`git push origin feature/your-change`)
5. Open a Pull Request

---

## 📝 License

No license file has been added yet.

---

<div align="center">

**Built for clean architecture, reliable APIs, and practical role-based analytics demos.**

</div>
