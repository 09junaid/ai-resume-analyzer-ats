# RESUME AI

AI-powered resume and interview preparation platform with a React frontend and an Express/MongoDB backend.

The app lets a user:

- register and log in with cookie-based authentication
- upload a resume PDF
- paste a job description
- add a self-description
- generate an AI interview report with:
  - match score
  - technical questions
  - behavioral questions
  - skill gaps
  - day-wise preparation plan
- reopen previous reports
- generate a tailored resume PDF

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Axios
- Sass
- React Icons

**Backend**

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT auth with cookies
- Multer for PDF upload
- `pdf-parse` for resume text extraction
- Google Gemini via `@google/genai`
- Puppeteer for resume PDF generation
- Zod for AI response validation

## Project Structure

```text
01-RESUME/
├─ frontend/
│  ├─ src/
│  │  ├─ features/
│  │  │  ├─ auth/
│  │  │  └─ interview/
│  │  ├─ routes/
│  │  ├─ App.jsx
│  │  └─ main.jsx
│  └─ package.json
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middlewares/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  └─ app.js
│  ├─ server.js
│  └─ package.json
└─ README.md
```

## Frontend Overview

Main areas:

- `src/features/auth`
  - login/register pages
  - auth context and `useAuth` hook
  - route guards: `Protected` and `GuestOnly`
- `src/features/interview`
  - landing/home/interview pages
  - interview context and `useInterview` hook
  - API layer for report generation, report fetch, and resume PDF download

Frontend behavior:

- uses `withCredentials: true` in Axios
- expects backend at `http://localhost:3000`
- protects workspace routes for authenticated users
- stores auth/report state in React context

## Backend Overview

Main responsibilities:

- handle authentication
- parse uploaded resume PDFs
- call Gemini to generate structured interview reports
- save reports to MongoDB
- generate tailored resume PDFs using AI + Puppeteer

Important backend modules:

- `src/controllers/auth.controller.js`
- `src/controllers/interview.controller.js`
- `src/services/ai.service.js`
- `src/models/interviewReport.model.js`
- `src/middlewares/auth.middleware.js`
- `src/middlewares/file.middleware.js`

## Environment Variables

Create `backend/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

Security notes:

- Never commit `.env` files, real API keys, JWT secrets, or database credentials.
- Rotate any secret immediately if it was ever pushed to GitHub or shared publicly.
- Use a strong, unique `JWT_SECRET` in every environment.
- Give `GOOGLE_GENAI_API_KEY` only the minimum access needed for this project.

## Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd 01-RESUME
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../backend
npm install
```

## Running the Project

### Start backend

From `backend/`:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:3000
```

### Start frontend

From `frontend/`:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
```

## API Summary

### Auth Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/get-me`

### Interview Routes

- `POST /api/interview`
  - multipart form-data
  - fields:
    - `resume` (PDF)
    - `jobDescription`
    - `selfDescription`
- `GET /api/interview`
- `GET /api/interview/report/:interviewId`
- `POST /api/interview/resume/pdf/:interviewReportId`

## Interview Report Shape

Generated report data includes:

```json
{
  "title": "Job Title",
  "matchScore": 78,
  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],
  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}
```

## Project Screenshots

To give you a visual tour of the platform, here are the key interface highlights:

| **Main Dashboard / Analysis** | **Input Workspace** |
|:---:|:---:|
| ![Analysis Result](https://i.ibb.co/wF1k5B1v/img1.png) | ![Workspace](https://i.ibb.co/G3sKkmTt/img2.png) |

| **AI Report Generation** | **Detailed Feedback** |
|:---:|:---:|
| ![AI Report](https://i.ibb.co/mVMwKrCW/img3.png) | ![Detailed Analysis](https://i.ibb.co/2YNzf4Fq/img4.png) |

| **Generated Resume Preview** |
|:---:|
| ![Resume Final](https://i.ibb.co/8DZKsGHr/img5.png) |
