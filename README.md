# 🧠 AI Quiz Generator

An interactive, responsive educational web application built for college internship assessment. The application generates customized 5-question multiple-choice quizzes on any academic subject or topic across three difficulty tiers (Easy, Medium, Hard), provides automatic grading, in-depth explanations for every option, and synthesizes a **Personalized Revision Roadmap** to remediate student misconceptions.

---

## 🌟 Key Features

1. **Custom Topic Generation**: Enter any academic subject, technical domain, or topic (or select from quick-explore chips).
2. **Three Difficulty Levels**: Calibrated for **Easy** (definitions & fundamentals), **Medium** (core application & reasoning), and **Hard** (edge cases & advanced mastery).
3. **5 Multiple-Choice Questions**: Strictly formatted with 4 distinct, plausible answer choices (A, B, C, D).
4. **Interactive Answering**: Real-time progress bar, responsive option selection, keyboard shortcuts (`1-4` or `A-D`, and arrow keys `←`/`→`), and question jumping dots.
5. **Automatic Scoring**: Immediate score calculation with fraction, percentage, and performance tier assessment (e.g., Flawless Mastery, Proficient Achiever, Developing Knowledge).
6. **Detailed Question Review & Explanations**: Side-by-side analysis of verified answers versus student selections, with educational explanations.
7. **Personalized Revision Roadmap**: Automatic tutor feedback synthesizing key misconceptions, targeted action plans, and recommended review topics based on missed questions.
8. **Resilient AI & Offline Engine**: Powered by Google Gemini API on the backend with an educational fallback engine for instant offline testing and zero-crash evaluation.
9. **Dark Glassmorphic UI**: High-contrast, mobile-responsive layout crafted in pure Vanilla CSS without heavy UI frameworks.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 6, JavaScript (JSX), Vanilla CSS | Fast HMR dev server, modular components, responsive glassmorphism |
| **Backend** | Node.js (v20+ / v22+), Express.js | REST API, input validation, safe AI JSON parsing, rate-limit resilience |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) | Backend-only API key encapsulation (never exposed to browser) |
| **Testing** | Node.js native test runner (`node:test`) | Unit tests and end-to-end integration tests |

---

## 📁 Project Structure

```text
ai-quiz/
├── backend/
│   ├── controllers/
│   │   └── quizController.js         # Request validation & HTTP handlers
│   ├── services/
│   │   ├── geminiService.js          # Google Gemini API integration & model fallback
│   │   └── fallbackQuizService.js    # Resilient offline educational engine & option shuffler
│   ├── utils/
│   │   └── validator.js              # Safe JSON extraction, markdown stripping & schema validation
│   ├── test/
│   │   ├── quiz.test.js              # Unit tests for validator and fallback services
│   │   └── integration.test.js       # Live API integration tests
│   ├── .env.example                  # Template for backend environment variables
│   ├── .env                          # Local environment variables
│   ├── package.json                  # Backend dependencies & scripts
│   └── server.js                     # Express app initialization & routes
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Branding, internship badge & API health indicator
│   │   │   ├── QuizConfigForm.jsx    # Topic input, suggestion chips, difficulty selector
│   │   │   ├── LoadingScreen.jsx     # Animated spinner with rotating study tips
│   │   │   ├── QuizActive.jsx        # Question card, 4 options, keyboard shortcuts, navigation
│   │   │   ├── QuizResults.jsx       # Score card, review filters, explanations, revision roadmap
│   │   │   └── ErrorMessage.jsx      # Dismissable alert banners
│   │   ├── App.jsx                   # Central state management & API lifecycle
│   │   ├── App.css                   # Component styles & interactive states
│   │   ├── index.css                 # Global design system, glassmorphism, gradients & typography
│   │   └── main.jsx                  # React application entry point
│   ├── index.html                    # HTML5 shell with Google Fonts (Outfit & Inter)
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite configuration with `/api` proxy to port 5000
│
└── README.md                         # Project documentation and setup guide
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** (v18.0.0 or higher, v20+ / v22+ recommended)
- **npm** (v9+ or higher)

---

### Step 1: Clone or Navigate to the Workspace

```bash
cd c:\Users\aniru\ai-quiz
```

---

### Step 2: Set Up and Start the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env

   # On macOS / Linux:
   cp .env.example .env
   ```
4. (Optional) Add your Google Gemini API key in `backend/.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   CLIENT_ORIGIN=http://localhost:5173
   ```
   > 💡 **Note**: You can get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/). If no key is provided, the backend seamlessly runs in **Educational Fallback Mode**, allowing full offline evaluation of all features without crashing!

5. Start the backend server:
   ```bash
   # Development mode with auto-reload:
   npm run dev

   # Or standard production start:
   npm start
   ```
   The backend will be running at `http://localhost:5000`. You can verify by opening `http://localhost:5000/api/health` in your browser.

---

### Step 3: Set Up and Start the Frontend

1. Open a new terminal window and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## 🧪 Running Tests

Both unit and integration test suites are included to verify input validation, AI parsing safety, option distribution, and live API endpoints.

### 1. Run Backend Unit Tests

Tests JSON extraction, option prefix stripping, option distribution, and revision calculations:
```bash
cd backend
npm test
```

### 2. Run End-to-End API Integration Tests

Ensure the backend server is running (`http://localhost:5000`), then run:
```bash
cd backend
node --test test/integration.test.js
```

### 3. Verify Frontend Production Build

```bash
cd frontend
npm run build
```

---

## 📡 Backend API Reference

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "AI Quiz Generator API",
    "version": "1.0.0",
    "hasApiKey": true,
    "timestamp": "2026-10-12T08:44:01.899Z"
  }
  ```

### 2. Generate Quiz
- **Endpoint**: `POST /api/quiz/generate`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "topic": "JavaScript ES6",
    "difficulty": "Medium"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "topic": "JavaScript ES6",
      "difficulty": "Medium",
      "totalQuestions": 5,
      "questions": [
        {
          "id": 1,
          "question": "What is the primary difference between let and var in ES6?",
          "options": [
            "let is block-scoped, while var is function-scoped",
            "var cannot be reassigned",
            "let is hoisted to the global object",
            "There is no difference in modern engines"
          ],
          "correctAnswerIndex": 0,
          "correctAnswer": "let is block-scoped, while var is function-scoped",
          "explanation": "Variables declared with let have block scope and are not hoisted to the global window object.",
          "topicConcept": "Variable Scoping"
        }
      ]
    }
  }
  ```

### 3. Generate Revision Roadmap
- **Endpoint**: `POST /api/quiz/revision`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "topic": "JavaScript ES6",
    "difficulty": "Medium",
    "score": 3,
    "totalQuestions": 5,
    "incorrectAnswers": [
      {
        "question": "...",
        "selectedAnswer": "...",
        "correctAnswer": "...",
        "explanation": "...",
        "topicConcept": "Variable Scoping"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "summary": "Great job! You scored 3/5 (60%) with a solid foundation in core syntax.",
      "score": 3,
      "totalQuestions": 5,
      "percentage": 60,
      "keyMisconceptions": [ ... ],
      "revisionPlan": [ "Step 1: ...", "Step 2: ...", "Step 3: ..." ],
      "recommendedResources": [ "..." ]
    }
  }
  ```

---

## 🔒 Security & AI Safety Considerations

1. **No Client-Side API Keys**: The Gemini API key is strictly stored in `backend/.env` and referenced exclusively through backend services. No frontend bundle contains secrets.
2. **Defensive Parsing**: Large Language Model responses frequently contain markdown wrappers (e.g. ` ```json `). The backend strips fences, uses regular-expression fallback for embedded JSON, sanitizes duplicate options, removes duplicate option prefixes ("A) ", "1. "), and validates question counts.
3. **Graceful Degradation**: If network drops or the Gemini API hits rate limits, the app does not crash—it serves high-quality curated quizzes and diagnostic feedback with clear UI indicators.

---

## 🚢 Deployment Guidelines

### Backend Deployment (e.g. Render, Railway, Fly.io)
1. Set the root directory to `backend/`.
2. Set Build Command: `npm install`.
3. Set Start Command: `node server.js`.
4. Add Environment Variables:
   - `PORT=5000` (or host provided port)
   - `GEMINI_API_KEY=your_key`
   - `CLIENT_ORIGIN=https://your-frontend-domain.vercel.app`

### Frontend Deployment (e.g. Vercel, Netlify)
1. Set the root directory to `frontend/`.
2. Set Build Command: `npm run build`.
3. Set Output Directory: `dist`.
4. Configure environment variable or rewrite rules to forward `/api` requests to your deployed backend URL.

---

## 🎓 Academic / Internship Attribution
- **Project**: AI Quiz Generator
- **Focus**: AI-driven adaptive educational assessments and misconception diagnosis
- **Stack**: React, Vite, Node.js, Express, Google Gemini API
- **License**: MIT (Free & Open Source)
