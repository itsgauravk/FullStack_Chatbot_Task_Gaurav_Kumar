# DroneTV AI Support & Lead Assistant

A responsive full-stack web application with a rule-based chatbot that answers questions about DroneTV (drone, GIS and AI technologies) and collects customer and student enquiries. An admin dashboard lets staff search, filter, update and delete enquiries.

Built as a take-home assignment for the IPAGE Group Full Stack Developer Intern role.

## Features

- Responsive pages: Home, Chatbot, Services, Courses, Contact / Enquiry form, Admin dashboard
- Rule-based chatbot (no external AI API) with the predefined questions, session history, a graceful fallback for unknown questions, and a clear / reset option
- Conversational enquiry collection: the chatbot asks for details one step at a time and validates each answer
- Contact form with client-side and server-side validation and clear success / error messages
- REST API with full CRUD for enquiries
- Admin dashboard: search, filter by Student / Customer / status, view full details, change status (New, Contacted, In Progress, Closed), delete
- Admin area protected by a password checked on the server
- Security: input validation on both sides, sanitisation of user text, rate limiting, secure HTTP headers (Helmet), CORS restricted to the frontend, secrets kept in environment variables
- Friendly error messages: technical details are never shown to users

## Technologies Used

- Frontend: React, TypeScript, Vite, React Router, plain CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB (MongoDB Atlas) with Mongoose
- Validation and security: Zod, Helmet, CORS, express-rate-limit

## Project Structure

    FullStack_Chatbot_Task_Gaurav_Kumar/
    ├── frontend/
    │   └── src/
    │       ├── components/    Navbar, EnquiryForm, AdminDashboard
    │       ├── pages/         Home, Chat, Services, Courses, Contact, Admin
    │       ├── chatbot/       rules.ts (answers), enquiryFlow.ts (step-by-step enquiry)
    │       ├── data/          content.ts (services and courses)
    │       ├── api.ts         all calls to the backend
    │       └── types.ts       shared TypeScript types
    └── server/
        ├── .env.example
        └── src/
            ├── index.ts       app setup, security middleware, startup
            ├── models/        Enquiry.ts (Mongoose schema)
            ├── routes/        enquiries.ts (REST endpoints)
            ├── middleware/    adminAuth.ts (admin password check)
            └── validation.ts  Zod validation rules

## Setup Instructions

Requirements: Node.js 18 or newer, npm, and a MongoDB database (a free MongoDB Atlas cluster works).

    git clone https://github.com/itsgauravk/FullStack_Chatbot_Task_Gaurav_Kumar.git
    cd FullStack_Chatbot_Task_Gaurav_Kumar

### Environment Variables

Backend (`server/.env`, copy it from `server/.env.example`):

| Variable | Description |
| --- | --- |
| `PORT` | Port for the API (default 5001) |
| `MONGODB_URI` | MongoDB connection string |
| `ADMIN_PASSWORD` | Password for the admin dashboard |
| `CLIENT_URL` | Frontend address allowed by CORS (default http://localhost:5173) |

Frontend (optional): `VITE_API_URL` is the backend address (default http://localhost:5001).

Never commit the real `.env` file.

### Database Setup

1. Create a free cluster on MongoDB Atlas.
2. Create a database user and allow your IP address under Network Access.
3. Copy the connection string into `MONGODB_URI` in `server/.env`.

The `enquiries` collection is created automatically on the first enquiry. No manual schema setup is needed.

Enquiry fields: `name`, `email`, `phone`, `userType` (Student / Customer / Other), `interest`, `message`, `status` (New / Contacted / In Progress / Closed, default New), plus `createdAt` and `updatedAt`.

## How to Run

Backend:

    cd server
    npm install
    cp .env.example .env     # then edit .env with your own values
    npm run dev              # http://localhost:5001

Frontend (in a second terminal):

    cd frontend
    npm install
    npm run dev              # http://localhost:5173

Production builds: run `npm run build` inside `frontend` or `server`.

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| GET | `/api/health` | Server health check | Public |
| POST | `/api/enquiries` | Create a new enquiry | Public |
| GET | `/api/enquiries` | Get all enquiries (supports `?search=`, `?userType=`, `?status=`) | Admin |
| GET | `/api/enquiries/:id` | Get a single enquiry | Admin |
| PATCH | `/api/enquiries/:id` | Update an enquiry (for example its status) | Admin |
| DELETE | `/api/enquiries/:id` | Delete an enquiry | Admin |

Admin requests must send the header `x-admin-password: <ADMIN_PASSWORD>`.

Example:

    curl -X POST http://localhost:5001/api/enquiries \
      -H "Content-Type: application/json" \
      -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","userType":"Student","interest":"Drone Pilot Training","message":"I want to know about the course fees."}'

Status codes: 201 created, 400 validation error, 401 unauthorized, 404 not found, 429 too many requests, 500 server error.

## Screenshots

Screenshots are in the `02_Screenshots` folder of the submission package.

## Live Demo

Not deployed.
