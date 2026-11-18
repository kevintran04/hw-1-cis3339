# CIS 3339 Homework 1 — CampusDesk Student Management System

A full-stack student, course, and enrollment manager built with Vue 3 Composition API, Vue Router, Pinia, Express, Mongoose, and MongoDB Community Edition.

## Requirements
- Node.js 18+ and npm
- MongoDB Community Edition running locally
- A modern browser

## Environment
The repository includes a root `.env` configured for local development:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
PORT=3000
```

This file contains no passwords or cloud credentials. If you change the database or port, update this file.

## Start MongoDB
Start the MongoDB Community Edition service using the method for your operating system. For example, on macOS with Homebrew:

```bash
brew services start mongodb-community
```

On Windows, start the MongoDB Server service from Services, or use the MongoDB service installed by the Community Edition installer. On Linux systems using systemd:

```bash
sudo systemctl start mongod
```

## Install dependencies
From the repository root:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Build and run production
From the repository root:

```bash
npm run build
npm start
```

Open **http://localhost:3000**. Express serves the compiled Vue application and the `/api` REST endpoints. Refreshing a Vue Router route is supported by the Express fallback.

## Development mode
In two terminals, run:

```bash
# Terminal 1 — backend
npm --prefix backend run dev

# Terminal 2 — Vue/Vite frontend
npm --prefix frontend run dev
```

Open http://localhost:5173. Vite proxies `/api` requests to the Express server at port 3000.

## Features
- Students: create, search by name or student ID, list, and delete.
- Courses: create, list, and delete.
- Enrollments: enroll existing students in existing courses, prevent duplicate enrollments, filter/view a course roster, and remove an enrollment.
- MongoDB persistence with unique student/course IDs and a unique student-course enrollment pair.
- Cascading enrollment deletion when a student or course is deleted.
- Form validation, loading feedback, success/error messages, responsive layout, and accessible labels.

## API endpoints
All endpoints are prefixed with `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/students?search=` | List/search students |
| GET | `/students/:id` | Get a student |
| POST | `/students` | Create a student |
| DELETE | `/students/:id` | Delete a student and its enrollments |
| GET | `/courses` | List courses |
| POST | `/courses` | Create a course |
| DELETE | `/courses/:id` | Delete a course and its enrollments |
| GET | `/enrollments?courseId=` | List enrollments, optionally filtered by course |
| POST | `/enrollments` | Create an enrollment |
| DELETE | `/enrollments/:id` | Remove an enrollment |
| GET | `/health` | Server/database status |

## Database initialization
Mongoose connects using `MONGODB_URI`. MongoDB creates the database and collections on first write. Schema indexes are initialized during application startup, including unique indexes used to reject duplicate records. No seed, migration, or manual database creation command is required.

## Assignment test examples
- Student: John, `1001`, `555-1234`, `77001`
- Student: Jane, `1002`, `555-5678`, `77002`
- Course: `CIS 3339`, Enterprise Applications Development
- Course: `CIS 3368`, Advanced Object-Oriented Programming

Create these through the application UI, test duplicate IDs and duplicate enrollments, then stop/restart the server and confirm that records remain in MongoDB.

## Notes
- Do not commit `node_modules/` or generated `frontend/dist/` files.
- The old standalone HTML/JavaScript frontend and JSON-file persistence have been replaced by the Vue application and MongoDB API.
