# 📖 Daily Taskbook

A full-stack task management application built with React, Node.js, Express, and PostgreSQL. Organize your tasks, track progress, and boost your productivity with an intuitive interface.

## ✨ Features

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
- 🔐 **Authentication** - JWT-based user authentication and authorization
- 🛡 **Security** - Helmet, rate limiting, validation

## 🛠 Tech Stack

- **Frontend**: React 18, React Router, Recharts, Lucide Icons, Vite
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Other**: Helmet, morgan, express-rate-limit, node-cron

## 📸 Screenshots

<!-- Add screenshots here -->
> _Screenshots coming soon_

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)
- Docker (optional, for containerized setup)

### 1. Clone the repository

```bash
git clone https://github.com/arshadfaysal5-netizen/daily-taskbook.git
cd daily-taskbook
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your PostgreSQL credentials and JWT secret.

### 4. Create the database

```bash
npm run db:setup
```

### 5. Run the application

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🐳 Docker Setup

### Using Docker Compose

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 15 database
- Build and run the application
- Expose the app on port 5000

### Stop services

```bash
docker-compose down
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Tasks

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

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `daily_taskbook` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 📁 Project Structure

```
daily-taskbook/
├── server/                    # Backend
│   ├── config/              # DB config & setup
│   ├── middleware/           # Express middleware
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utilities
│   ├── __tests__/           # Server tests
│   └── index.js             # Server entry
├── client/                   # Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # State management
│   │   ├── pages/           # Page components
│   │   ├── styles/          # Global styles
│   │   └── utils/           # API & helpers
│   └── index.html
├── .github/workflows/        # CI/CD
├── Dockerfile                # Docker build
├── docker-compose.yml        # Docker Compose
└── package.json              # Root package
```

## 🧪 Testing

### Run server tests

```bash
npm test
```

### Run client linting

```bash
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**arshadfaysal5-netizen**

---

⭐ Star this repository if you find it helpful!
