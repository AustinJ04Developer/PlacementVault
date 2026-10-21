# PlacementVault — Campus Placement Drive Questions & Answers Repository

PlacementVault is a production-oriented, full-stack academic and career-preparation web application designed to preserve real-world campus recruitment experiences. It empowers students to share questions asked during actual recruitment drives, publish comprehensive solutions and code algorithms, and allows future batches to search, filter, and study past placement experiences without informal or lost notes.

> **Zero-AI Guarantee**: In accordance with system requirements, PlacementVault does not employ any AI APIs, machine-learning models, automated chatbots, or generative engines. All search, filtering, duplicate identification, metrics, and analytics operate deterministically using conventional database indexes, token-similarity algorithms, and relational aggregations.

---

## 🚀 Key Features

### For Students
1. **Authenticated Access**: Secure registration, login with HTTP-only cookies and Bearer tokens, password hashing with `bcryptjs`.
2. **Search & Multi-Facet Filtering**: Full-text keyword search across titles, descriptions, and tags. Filter by Recruiting Company, Recruitment Batch Year, Interview Round (OA, Technical 1/2, HR), Category, Difficulty (Easy, Medium, Hard), and Programming Language.
3. **Question Submission**: Detailed structured submission form covering company, drive, interview round, job role, topics, difficulty, experience notes, tags, and initial solutions.
4. **Community Solutions & Code Highlighting**: Browse community-contributed answers with formatted code snippets, copy-to-clipboard functionality, and helpful upvotes.
5. **Interactive Community**: Helpful vote toggling, threaded question discussion comments, and content flagging (reporting inappropriate/confidential material).
6. **Bookmarks & Contributions Tracker**: One-click bookmarking of questions for revision and dedicated dashboard tracking personal submissions and metrics.

### For Placement Officers & Administrators
1. **Administrative Telemetry Dashboard**: Live statistics compiled from real database records (total students, companies, active drives, questions, answers, and pending reports) with Recharts visual charts.
2. **Content Moderation & Resolution**: Comprehensive moderation console reviewing reported questions, answers, and comments with actions to hide, restore, or remove content with audit justification notes.
3. **Student Account Management**: Inspect student activity, monitor contributions, and toggle account activation or suspension.
4. **Company & Drive Catalog**: Full CRUD management of official recruiting companies and batch-wise placement drives with interview round sequences.
5. **Algorithmic Duplicate Identifier**: Deterministic Jaccard token-similarity analysis discovering potential duplicate questions within companies or cross-company records.
6. **Data CSV Exports**: Instant CSV spreadsheet downloads for Questions, Registered Students, and Companies for placement cell reporting and accreditation.
7. **Immutable Audit Trail**: Automatic logging of all administrative actions (actor, action, target entity, IP address, timestamp).

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend Framework** | React 18 with TypeScript |
| **Build Tool & Dev Server** | Vite 6 |
| **Styling & Design System** | Tailwind CSS with typography & custom design tokens |
| **Icons** | Lucide React |
| **HTTP Client** | Axios with centralized interceptors |
| **Form & Data Validation** | Zod schemas |
| **Analytics & Data Visuals** | Recharts (AreaChart, BarChart) |
| **Backend Runtime** | Node.js (v20+) with Express 4 / Express 5 types |
| **Language & Transpiler** | TypeScript, TSX, tsx watch |
| **Database & ODM** | MongoDB with Mongoose |
| **Authentication & Security** | JWT (jsonwebtoken), bcryptjs, Helmet, Express Rate Limit, Cookie-Parser |
| **Testing Suite** | Vitest, React Testing Library, Supertest |

---

## 📁 Repository Architecture

```text
PlacementVault/
├── server/
│   ├── src/
│   │   ├── config/          # Environment variables & MongoDB connection
│   │   ├── controllers/     # HTTP controllers (auth, questions, answers, companies, admin)
│   │   ├── middleware/      # Auth guard, rate limiters, error handling, audit logger
│   │   ├── models/          # Mongoose models (User, Company, PlacementDrive, Question, Answer, etc.)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic & CSV export helpers
│   │   ├── utils/           # JWT helpers & token management
│   │   ├── validators/      # Zod validation schemas
│   │   ├── app.ts           # Express application setup with Helmet & CORS
│   │   └── server.ts        # Server entrypoint
│   ├── scripts/
│   │   ├── seed.ts          # Database seed script with realistic demo data
│   │   └── testE2E.ts       # Automated end-to-end REST test runner
│   ├── tests/
│   │   └── api.test.ts      # Vitest & Supertest API integration tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, layout wrappers
│   │   ├── contexts/        # AuthContext, ToastContext
│   │   ├── layouts/         # MainLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Reports, Questions, Students, Companies, Duplicates, etc.
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── public/      # AccessDenied, NotFound
│   │   │   └── student/     # Dashboard, BrowseQuestions, QuestionDetails, SubmitQuestion, etc.
│   │   ├── routes/          # AppRoutes, ProtectedRoute guard
│   │   ├── services/        # Centralized Axios API services
│   │   ├── types/           # TypeScript interfaces (User, Question, Answer, etc.)
│   │   ├── App.tsx          # Root router & context providers
│   │   └── main.tsx         # React DOM entrypoint
│   ├── tests/
│   │   └── App.test.tsx     # Vitest & React Testing Library tests
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas URI

---

## 🚀 Quickstart Installation & Setup

### 1. Server Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env or update values
cp .env.example .env

# Seed the database with sample companies, drives, questions, and default administrator
npm run seed

# Run automated tests
npm test

# Build for production
npm run build

# Start the development server
npm run dev
# The API will be running at http://localhost:5000/api/v1
```

### 2. Client Setup

In a new terminal window:

```bash
cd client

# Install dependencies
npm install

# Run client test suite
npm test

# Build production bundle
npm run build

# Start the Vite development server
npm run dev
# Access the web app at http://localhost:5174/ (or http://localhost:5173/)
```

---

## 🔑 Default Demonstration Accounts

The database seed script (`npm run seed`) automatically populates the following verified accounts:

### Administrator Account
- **Role**: Administrator / Placement Officer
- **Email**: `admin@placementvault.edu`
- **Password**: `AdminSecure@2026!`
- **Access**: Full access to the Administrator Portal (`/admin`), Moderation Reports, Student Accounts, Company Records, Duplicate Question Identifier, and CSV Exports.

### Student Accounts
- **Student 1**: `arun.student@placementvault.edu` / `StudentPass@123`
- **Student 2**: `priya.student@placementvault.edu` / `StudentPass@123`
- **Student 3**: `rahul.student@placementvault.edu` / `StudentPass@123`

*Tip: The Login page provides one-click "Fill Student Demo" and "Fill Admin Demo" buttons to speed up local testing.*

---

## 🧪 Testing

### Server Integration Tests
Tests verify user registration, login authentication, student role restrictions, admin dashboard protection, questions query and search, and company endpoints:
```bash
cd server
npm test
```

### Client Integration Tests
Tests verify application initialization, brand navigation, questions browsing links, and authentication action buttons:
```bash
cd client
npm test
```

### Automated End-to-End API Pipeline
Runs 14 consecutive real-world scenarios against the live server:
```bash
cd server
npx tsx scripts/testE2E.ts
```

---

## 🔒 Security Measures Implemented

1. **Password Security**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10). Plaintext passwords are never stored or logged.
2. **Server-Side Validation**: All request bodies validated against strict Zod schemas before hitting database layers.
3. **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on authentication routes (`/api/v1/auth/login` and `/api/v1/auth/register`).
4. **Security Headers**: HTTP headers hardened via `helmet`.
5. **NoSQL Injection Defense**: Strict Mongoose schemas with sanitized object parameters and validation guards.
6. **Audit Trails**: All sensitive actions taken by administrators (suspending accounts, hiding questions, resolving flags) are written to the `AuditLog` collection.
7. **Strict Role-Based Access Control**: Sensitive routes enforced via server-side middleware `requireAuth` and `requireRole('admin')`.

---

## 📜 License & Acknowledgments

Developed for campus training and placement departments to democratize access to authentic technical recruitment assessments.
