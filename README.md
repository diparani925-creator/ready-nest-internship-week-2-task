# Smart Campus Utility App

A premium, full-stack campus portal application designed to streamline student schedules, task management, attendance logging, and note-taking. The application supports a dynamic dark/light interface, real-time analytics, and role-based permissions for students and academic administrators.

---

## 🌟 Key Features

### For Students
*   📊 **Interactive Dashboard**: Real-time summary of today's schedule, pending tasks, overall attendance statistics, and recent notices.
*   📅 **Timetable Planner**: Visually structured calendar grid displaying class timings, subject colors, classrooms, and instructors.
*   📝 **Task Manager**: Organize deadlines, prioritize items (High, Medium, Low), and attach resources.
*   📈 **Attendance Log**: Track attendance logs by subject, complete with auto-calculated percentage alerts (ensuring students stay above the required threshold).
*   📒 **Quick Notes**: A colorful grid of categorized student notebooks supporting tag filters and rich markdown text.
*   👤 **Student Profile**: Customize avatar choices, edit name details, and manage password settings.

### For Administrators
*   📢 **Noticeboard Panel**: Create, publish, pin, and target announcements to specific academic departments or broadcast to the entire campus.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: Next.js 15 (App Router, Turbopack enabled)
*   **Library**: React 19
*   **Styling**: Tailwind CSS 4 & Lucide Icons
*   **Charts**: Recharts (for attendance analytics)

### Backend
*   **Framework**: Node.js & Express (TypeScript)
*   **Database ORM**: Prisma ORM
*   **Authentication**: JSON Web Tokens (JWT) & bcryptjs hashing
*   **Validation**: Zod Schemas

### Database
*   **Type**: MySQL Database

---

## 📂 Project Structure

```
SMART CAMPUS UTILITY APP/
├── backend/                  # Express REST API (TypeScript)
│   ├── prisma/               # Schema configuration & migrations
│   └── src/                  # Source files (controllers, routes, middleware)
├── frontend/                 # Next.js Application
│   └── src/                  # App components, layout, API helpers, & global CSS
└── DEPLOYMENT.md             # Multi-platform Cloud deployment guide
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MySQL Server (v8 or higher)

### 1. Database Setup
1.  Ensure MySQL is running on your machine.
2.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
3.  Configure database credentials in the `.env` file:
    ```env
    DATABASE_URL="mysql://<user>:<password>@localhost:3306/smart_campus"
    ```
4.  Run Prisma migrations to set up schema structures:
    ```bash
    npx prisma db push
    ```
5.  Populate default testing entries:
    ```bash
    npm run seed
    ```

### 2. Run Backend API
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Launch backend dev server:
    ```bash
    npm run dev
    ```
    *API will run at `http://localhost:5000`.*

### 3. Run Frontend Portal
1.  Navigate to the `frontend/` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch Next.js development portal:
    ```bash
    npm run dev
    ```
    *The web portal will boot at `http://localhost:3000`.*

---

## 🔒 Default Test Accounts

Use these pre-seeded accounts to explore the portal features:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `password123` |
| **Admin** | `admin@campus.edu` | `password123` |

---

## 🧪 Integration Tests
To execute backend API validation, run:
```bash
cd backend
npx ts-node src/scripts/test_api.ts
```
