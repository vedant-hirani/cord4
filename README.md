# SpendAI — Production-Grade AI-Powered Expense Tracker Backend & SPA

Welcome to **SpendAI**, a highly scalable, production-grade AI-powered Expense Tracker! This application is built inside a modular **Node.js, Express, MongoDB (Mongoose)** workspace using **ES Modules (ESM)**. 

SpendAI includes full-stack capabilities, serving a premium dark-mode Single Page Application (SPA) directly from the Express `/public` static asset directory. It features JWT authentication, category-wise expense CRUD, CSV exports, dynamic analytics charts (via Chart.js CDNs), monthly budget threshold progress bars, and real-time transaction extraction from raw receipts or SMS bills using the OpenAI-compatible **xAI Grok completions API**.

---

## 🏗️ Layered Architecture & Request Flow

SpendAI follows a rigid enterprise-level layered architecture separating concerns at every level:

```
Client (Single Page Application / Postman)
      ↓
Route Definition (src/routes/)
      ↓
Validation Middleware (Joi Schemas - decoupled from hardcoded strings)
      ↓
Auth Middleware (JWT Bearer Token Guard)
      ↓
Controller Layer (thin handler, extracts parameters, invokes services)
      ↓
Service Layer (core business logic, Grok xAI API integrations, stats aggregations)
      ↓
Database Layer (Mongoose schemas & models with compound unique indexing)
      ↓
ApiResponse / ApiError Wrapper (centralized response standards)
      ↓
Client Response
```

### Decoupled Constants Guideline
To prevent leakage of hardcoded user-facing strings or validation errors into controllers or services, all success message templates and Joi validation text strings reside strictly inside [constants.js](file:///c:/Users/vedant/Desktop/Cord4/src/utils/constants.js).

---

## 📂 Modular Structure & New Core Files

The new expense, budget, and AI modules are fully integrated:

```
src/
├── controllers/
│   ├── ai.controller.js       # AI text parsing endpoint handler
│   ├── budget.controller.js   # Budget configuration & alerts endpoint handler
│   └── expense.controller.js  # Expense CRUD, stats, & CSV endpoint handler
├── models/
│   ├── ai/
│   │   └── ai.service.js      # Grok v2 Chat Completion API parser client
│   ├── budget/
│   │   ├── budget.model.js    # Budget limit schema (unique index: userId, category, month)
│   │   └── budget.service.js  # Upserts targets & computes alert thresholds (80% / 100%)
│   └── expense/
│       ├── expense.model.js   # Expense schema (amount, category, date, note, userId)
│       └── expense.service.js # Ledger CRUD, CSV generators, & analytical stats aggregators
├── routes/
│   ├── ai.routes.js           # Mounted at /api/v1/ai
│   ├── budget.routes.js       # Mounted at /api/v1/budgets
│   ├── expense.routes.js      # Mounted at /api/v1/expenses
│   └── index.js               # Central sub-routers mount index
├── validators/
│   ├── ai.validation.js       # Joi schema validating raw receipt text payloads
│   ├── budget.validation.js   # Joi schema validating budget limits
│   └── expense.validation.js  # Joi schema validating expense creation/updates
└── app.js                     # Configured to serve SPA assets from public/

public/
└── index.html                 # Stunning dark-mode glassmorphism full-stack dashboard SPA
```

---

## ⚡ Core Features Walkthrough

1. **Token Authentication Gate**: Seamless user registration, login, profile caching, and authorization guards protecting all financial endpoints.
2. **Interactive Spend Ledger**:
   - Save, modify, or delete manual transactions.
   - Filter ledger list by month or specific category.
   - Live download of all-time or monthly-filtered transactions in raw **CSV format** (complete with escaped values).
3. **xAI Grok AutoFill Extractor**:
   - Pastes receipt transcriptions, invoice copies, or SMS texts.
   - Sends payload to `https://api.x.ai/v1/chat/completions` using the `GROK_API_KEY`.
   - Returns structured JSON containing amount, category, transaction date, and descriptive notes.
   - Auto-fills a confirm/edit form block on the SPA dashboard for seamless ledger additions.
4. **Dynamic Analytics Charts**:
   - Beautiful responsive Category Breakdown Donut chart (Color-coded mapping to Food, Transport, Utilities, Entertainment, Shopping, and Other).
   - 6-Month Expenditure Trends bar chart featuring custom gradient overlays.
5. **Progressive Budget Threshold Indicators**:
   - Configure category spend limit targets (e.g. Food, Utilities) for any YYYY-MM month.
   - Dynamic progress indicators:
     - **Green/Emerald**: Normal spending status under 80% limit capacity.
     - **Vibrant Amber/Yellow Warning**: Triggers when current spending hits 80% to 99% capacity.
     - **Pulsing Crimson/Red Danger Alert**: Triggers when spending meets or exceeds 100% budget limit capacity.

---

## 🚀 Installation & Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy [.env.example](file:///c:/Users/vedant/Desktop/Cord4/.env.example) to `.env` and fill in your keys:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_access_secret_key
GROK_API_KEY=your_grok_xai_api_key
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5000`. Open this address in your browser to interact with the premium Single Page Application dashboard!

---

## 🧪 Postman & Automated Verification

### Postman Collections
A comprehensive, production-grade Postman collection file containing all authentication, expense CRUD, CSV exports, budget limits, dynamic alerts, and Grok AI text extractions is saved in the root directory:
👉 **[cord4_expense_tracker_postman.json](file:///c:/Users/vedant/Desktop/Cord4/cord4_expense_tracker_postman.json)**

### Run Jest & Supertest Verification Suites
To verify imports, syntax correctness, and structural integrity:
```bash
npm run test
```
