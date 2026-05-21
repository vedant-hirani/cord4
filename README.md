# Scalable Production-Grade Node.js + Express Backend Boilerplate

Welcome to the **Cord4 Scalable Backend** boilerplate! This project is built using **Node.js, Express, MongoDB (Mongoose)**, and **ES Modules (ESM)**. It implements an enterprise-level architecture separating controllers, services, repositories, schemas, and DTOs to ensure high maintainability, extreme testability, and fast scale.

---

## 🏗️ Flow Architecture & Layer Responsibilities

The request flow strictly adheres to standard corporate guidelines:

```
Client Request
      ↓
Route Definition (src/routes/ & src/modules/)
      ↓
Validation Middleware (Zod Schemas)
      ↓
Auth Middleware (JWT Protect Guards - if protected)
      ↓
Controller (req/res handler, thin controller)
      ↓
Service (Core Business Logic)
      ↓
Repository (Mongoose queries only)
      ↓
DTO Formatting (Data Transfer Object filter)
      ↓
ApiResponse Utility (Consistent success/error shapes)
      ↓
Client Response
```

### Layer Rules
1. **Routes**: Define paths, map middlewares, and pass parameters. No logic.
2. **Validation**: Enforce request structural constraints using **Zod** before controllers execute.
3. **Auth Middleware**: Check signature Bearer tokens, parse roles, and verify status.
4. **Controllers**: Handle incoming Express requests, unpack inputs, call services, and trigger `ApiResponse`.
5. **Services**: Business logic. Encapsulate multi-step database changes, calculate algorithms, and dispatch external resources.
6. **Repositories**: Database interactions only. Keep Mongoose methods out of controllers and services.
7. **DTOs**: Sanitize and construct outgoing database entities (filter password fields, refresh tokens, etc.).
8. **Utils**: Reusable, lightweight functions (OTP, paginator formatters, error models, date extensions).

---

## 📂 Project Directory Layout

```
project-root/
├── src/
│   ├── config/            # DB, Winston Loggers, Env configurations
│   ├── modules/           # Encapsulated Business Modules
│   │   ├── auth/          # Registration, Login, Token renewals
│   │   ├── user/          # User Schema, Profile managers
│   │   └── notification/  # Notification services and dispatches
│   ├── middlewares/       # Core Express interceptor middlewares
│   ├── services/          # Infrastructure Services (S3, Email, SMS)
│   ├── utils/             # Helper Response, Error, and Date utils
│   ├── helpers/           # Multer, token, and bcrypt wrappers
│   ├── validators/        # Standard Password & common regex validators
│   ├── database/          # Migrations & seeders folders
│   ├── routes/            # Central Application Routing tables
│   ├── app.js             # Core Express server settings & security
│   └── server.js          # Startup bootstrap script
├── tests/                 # Complete Jest ESM test runner suite
│   ├── unit/              # AuthService business checks
│   └── integration/       # Route request verification checks
├── uploads/               # Temporary uploads storage folder
├── Dockerfile             # Alpine-based production docker build
├── docker-compose.yml     # Mongo and App environment orchestration
├── .env                   # Local settings configurations
└── README.md              # Project walkthrough guide
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or via Docker)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables setup file (which contains standard ports and secrets):
   ```bash
   # Already created for you in root! Feel free to modify c:\Users\vedant\Desktop\Cord4\.env
   ```

### Running Locally
- Start the server in **development mode** (with hot reloading via nodemon):
  ```bash
   npm run dev
   ```
- Start the server in **production mode**:
  ```bash
   npm run start
   ```

### Running via Docker Compose
Build and run the entire multi-container stack (App + MongoDB database persistence):
```bash
docker-compose up --build
```

---

## 🧪 Testing Suite

Tests run in **ES Modules (ESM) mode** using Jest and Supertest.

To run the complete test suites (unit + integration):
```bash
npm run test
```

---

## 🌐 API Endpoint List

### 🔑 Authentication Module
- `POST /api/v1/auth/register` - Create new user account (Zod validated).
- `POST /api/v1/auth/login` - Authenticate credentials and get JWT token pair.
- `POST /api/v1/auth/refresh` - Rotate expired access tokens using valid refresh tokens.
- `POST /api/v1/auth/logout` - Clear refresh tokens from databases (Protected).

### 👤 User Profile Module
- `GET /api/v1/users/me` - Fetch profile metadata of signed-in user (Protected).
- `PATCH /api/v1/users/me` - Edit profile attributes (Protected).
- `POST /api/v1/users/change-password` - Update account password (Protected).
- `GET /api/v1/users/list` - Paginated administrative user directory (Admin/Manager only).

### 📢 Notifications Module
- `POST /api/v1/notifications/send` - Async multi-channel simulated SMTP/SMS/Push notifications dispatch (Protected).

### 🩺 System Diagnostics
- `GET /api/v1/health` - Basic uptime statistics diagnostic.
