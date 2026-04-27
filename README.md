# Content Broadcasting System

A backend API for educational environments where teachers upload subject-based content (question papers, announcements, materials), Principals approve/reject it, and approved content is broadcasted via public API endpoints with scheduling and rotation.

**Developed by: Arbaz Ali**

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Sequelize v6 |
| Authentication | JWT + bcrypt |
| File Upload | Cloudinary (Persistent Cloud Storage) |
| Validation | Joi |
| API Docs | Swagger (OpenAPI 3.0) |
| Caching | Redis (optional) |
| Security | helmet, cors, express-rate-limit |

## Features

- ✅ JWT Authentication with role-based access control (Principal / Teacher)
- ✅ Cloud-based file storage using **Cloudinary** (Persistent & Scalable)
- ✅ Support for **Images, PDFs, and MP4 Videos**
- ✅ Approval workflow (pending → approved / rejected with reason)
- ✅ Public broadcasting API with per-teacher, per-subject content
- ✅ Time-window scheduling (start_time / end_time)
- ✅ Subject-based rotation logic (configurable duration per content)
- ✅ Edge case handling (no content, expired, invalid teacher/subject)
- ✅ Swagger API documentation
- ✅ Redis caching with graceful fallback
- ✅ Rate limiting on public API
- ✅ Pagination and filtering
- ✅ Comprehensive error handling
- ✅ Deployment ready (Render, Vercel, etc.)

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 12+ running locally
- **Redis** (optional, for caching)

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd content-broadcasting-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_FILE_SIZE=10485760

REDIS_URL=redis://localhost:6379
```

### 4. Create the database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE content_broadcasting;
\q
```

### 5. Seed the database (optional)

```bash
npm run seed
```

This creates:
- 1 Principal (`principal@school.edu` / `password123`)
- 3 Teachers (`teacher1@school.edu`, `teacher2@school.edu`, `teacher3@school.edu` / `password123`)
- Sample content in various statuses (approved, pending, rejected)
- Content schedules for rotation testing

### 6. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 7. Access the app

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/auth/me` | Yes | Get current profile |

### Content Management (Teacher)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/content/upload` | Yes | Teacher | Upload content with file |
| GET | `/api/content/my` | Yes | Teacher | View own content |
| GET | `/api/content/:id` | Yes | Both | View content details |

### Approval (Principal)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/content/all` | Yes | Principal | View all content |
| GET | `/api/content/pending` | Yes | Principal | View pending content |
| PATCH | `/api/content/:id/approve` | Yes | Principal | Approve content |
| PATCH | `/api/content/:id/reject` | Yes | Principal | Reject with reason |

### Public Broadcasting (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content/live/:teacherId` | Get live content for a teacher |
| GET | `/api/content/live/:teacherId?subject=maths` | Filter by subject |

## API Usage Examples

### Register a Teacher

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mr. Smith",
    "email": "smith@school.edu",
    "password": "password123",
    "role": "teacher"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smith@school.edu",
    "password": "password123"
  }'
```

### Upload Content (Teacher)

```bash
curl -X POST http://localhost:3000/api/content/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Maths Chapter 1" \
  -F "subject=maths" \
  -F "description=Question paper for Chapter 1" \
  -F "start_time=2026-04-27T09:00:00Z" \
  -F "end_time=2026-04-27T17:00:00Z" \
  -F "rotation_duration=5" \
  -F "file=@/path/to/question-paper.jpg"
```

### Approve Content (Principal)

```bash
curl -X PATCH http://localhost:3000/api/content/1/approve \
  -H "Authorization: Bearer <PRINCIPAL_TOKEN>"
```

### Reject Content (Principal)

```bash
curl -X PATCH http://localhost:3000/api/content/1/reject \
  -H "Authorization: Bearer <PRINCIPAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Image quality is too low. Please re-upload."
  }'
```

### Get Live Content (Public)

```bash
# All subjects for teacher
curl http://localhost:3000/api/content/live/2

# Filter by subject
curl http://localhost:3000/api/content/live/2?subject=maths
```

## Scheduling & Rotation Logic

### How It Works

1. Teachers upload content with optional `start_time`, `end_time`, and `rotation_duration`
2. Content without time window is never shown (even if approved)
3. Multiple approved content items in the same subject ROTATE based on duration
4. The system calculates which item is "active" at any point in time using modular arithmetic

### Example

Three maths items by Teacher 1, each with 5-minute rotation:
```
Content A → minutes 0-5
Content B → minutes 5-10
Content C → minutes 10-15
  → Loop restarts →
Content A → minutes 15-20
...
```

At 7 minutes elapsed: `7 % 15 = 7` → Content B is active  
At 23 minutes elapsed: `23 % 15 = 8` → Content B is active again

## Project Structure

```
src/
├── config/          # Database, Redis, Swagger configuration
├── controllers/     # Request handlers (thin layer)
├── middlewares/      # Auth, RBAC, upload, validation, error
├── models/          # Sequelize models & associations
├── routes/          # Express routes with Swagger JSDoc
├── services/        # Core business logic
├── utils/           # Constants, ApiError, ApiResponse helpers
├── validations/     # Joi schemas
├── seeders/         # Database seed script
└── app.js           # Express app setup

server.js            # Entry point
architecture-notes.txt  # Detailed architecture documentation
```

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| No approved content for teacher | Returns `{ data: [], message: "No content available" }` |
| Approved but outside time window | Excluded from results |
| Approved but no time window set | Excluded from results |
| Invalid/unknown subject filter | Returns empty (not error) |
| Invalid teacher ID | Returns empty (not error) |
| File too large (>10MB) | 413 error |
| Invalid file type | 400 error |
| Missing required fields | 400 validation error |
| Rejection without reason | 400 validation error |
| Unauthorized access | 401 error |
| Wrong role accessing endpoint | 403 error |

## Assumptions

1. Principal and Teacher accounts are created via the register endpoint (no admin seeding required in production)
2. Content files are stored locally in `/uploads` directory
3. Rotation is continuous and loops indefinitely within the active time window
4. Each content item has its own rotation_duration (default 5 minutes)
5. The system clock is trusted for time-based scheduling
6. Redis is optional — the system works without it (just no caching)

