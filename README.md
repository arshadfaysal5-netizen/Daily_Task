# 📖 Daily Taskbook

A full-stack task management application built with React, Node.js, Express, and PostgreSQL.

## Features

- ✅ **Task Management** - Create, edit, delete, and organize tasks
- 🗂 **Status Tracking** - Pending, In Progress, Completed, Cancelled
- 🔥 **Priority Levels** - Urgent, High, Medium, Low with visual indicators
- 📅 **Calendar View** - Monthly calendar with task visualization
- 🆕 **Recurring Tasks** - Daily, weekly, monthly, yearly repetition patterns
- 🧩 **Subtasks** - Break tasks into smaller checkable items
- 🏷 **Tags & Categories** - Organize and filter tasks
- 🔍 **Advanced Search & Filters** - Filter by status, priority, category, date range
- 📊 **Statistics Dashboard** - Charts showing completion rates, priority distribution, trends
- 🎨 **Dark Mode** - Full dark/light theme toggle
- 📦 **Drag & Drop** - Reorder tasks easily
- 🗄 **Archive** - Archive completed or inactive tasks
- ⏰ **Auto-Archive** - Automatic archiving via cron job
- 🛡 **Security** - Helmet, rate limiting, validation

## Tech Stack

- **Frontend**: React 18, React Router, Recharts, Lucide Icons, Vite
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Other**: Helmet, morgan, express-rate-limit, node-cron

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)

## Installation

### 1. Install dependencies

```bash
cd daily-taskbook
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your PostgreSQL credentials.

### 3. Create the database

```bash
npm run db:setup
```

### 4. Run the application

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (with filters) |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| PATCH | `/api/tasks/:id/priority` | Update task priority |
| PATCH | `/api/tasks/reorder` | Reorder tasks |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/tasks/:id/toggle-archive` | Toggle archive |
| GET | `/api/tasks/stats` | Get statistics |
| GET | `/api/tasks/calendar` | Calendar tasks |
| POST | `/api/tasks/:id/subtasks` | Add subtask |
| PUT | `/api/tasks/:id/subtasks/:subtaskId` | Update subtask |
| DELETE | `/api/tasks/:id/subtasks/:subtaskId` | Delete subtask |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

## Project Structure

```
daily-taskbook/
├── server/                 # Backend
│   ├── config/           # DB config & setup
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── index.js          # Server entry
└── client/                # Frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # State management
    │   ├── pages/        # Page components
    │   ├── styles/       # Global styles
    │   └── utils/        # API & helpers
    └── index.html
```
