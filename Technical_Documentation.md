# Technical Documentation: Umurava AI Recruiter

## 1. Project Overview
The **Umurava AI Recruiter** is an automated screening platform built for the *Innovation Challenge to build AI Products for the Human Resources Industry*.The system addresses high application volumes by using the **Gemini API** to accurately and transparently shortlist candidates based on structured talent profiles.

## 2. System Architecture & Interaction
The project follows a decoupled monorepo architecture designed for scalability and engineering quality.


### **A. Frontend Layer (Next.js)**
* **Recruiter Dashboard**: Provides a unified interface for creating jobs and managing the recruitment lifecycle.
* **Candidate Visualization**: Renders ranked shortlists and individual candidate cards.
* **State Management**: Uses **Redux Toolkit** to synchronize authentication, job lists, and screening results across the UI.

### **B. Backend Layer (Node.js & TypeScript)**
* **API Orchestration**: An Express-based server that manages job CRUD operations and applicant ingestion pipelines.
* **AI Orchestration Logic**: The `screening.service.ts` prepares job and applicant data to be processed by the AI layer.

### **C. AI Layer (Gemini API - Mandatory)**
* **Intelligent Screening**: Uses the **Gemini API** as the underlying LLM to perform multi-candidate evaluation against job requirements.
* **Scoring & Reasoning**: Generates weighted match scores (0-100) and natural-language explanations regarding candidate strengths and gaps.

### **D. Data Layer (MongoDB Atlas)**
* **Persistence**: Stores all core entities including **Jobs**, **Applicants** (matching Umurava's talent profile schema), and **Screening Results**.

## 3. Technology Stack & Compliance
| Component | Technology | Compliance Status |
| :--- | :--- | :--- |
| **Language** | TypeScript | ✅ Recommended |
| **Frontend** | Next.js & Tailwind CSS | ✅ Recommended |
| **Backend** | Node.js  | ✅ Recommended |
| **AI / LLM** | **Gemini API** | ✅ **Mandatory** |
| **Database** | MongoDB  | ✅ Recommended |

## 4. AI Decision Flow & Explainability
1. **Prompt Engineering**: Uses intentional, documented prompts to ensure recruiter-friendly and structured outputs.
2. **Analysis**: Gemini evaluates skills, experience, and education to produce an objective rank.
3. **Reasoning**: Each shortlist entry includes clear qualitative feedback to preserve human-led final hiring decisions.

## 5. Setup & Deployment
* **Frontend**: Deployed on **Vercel**.
* **Backend**: Hosted on **Railway**.
* **Environment Variables**:
  * `MONGODB_URI`: Connection to the database.
  * `GEMINI_API_KEY`: Authentication for AI services.
  * `JWT_SECRET`: Secure recruiter authentication.

## 6. Local Development
> For a live demo, the application is also accessible at [umurava-ai-recruiter-jet.vercel.app](https://umurava-ai-recruiter-jet.vercel.app).

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI
- Gemini API key

### Backend
```
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, GEMINI_API_KEY, JWT_SECRET
npm run dev
```

### Frontend
```
cd frontend
npm install
npm run dev
```
Then log in at http://localhost:3000/login with `recruiter@umurava.test` / `Umurava!2026`.