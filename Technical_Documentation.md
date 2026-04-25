# Technical Documentation: Umurava AI Recruiter

## 1. Project Overview
[cite_start]The **Umurava AI Recruiter** is an automated screening platform built for the *Innovation Challenge to build AI Products for the Human Resources Industry*[cite: 3, 13, 442]. [cite_start]The system addresses high application volumes by using the **Gemini API** to accurately and transparently shortlist candidates based on structured talent profiles[cite: 14, 17, 21, 96].

## 2. System Architecture & Interaction
[cite_start]The project follows a decoupled monorepo architecture designed for scalability and engineering quality[cite: 108, 205, 460].


### **A. Frontend Layer (Next.js)**
* [cite_start]**Recruiter Dashboard**: Provides a unified interface for creating jobs and managing the recruitment lifecycle[cite: 69, 448].
* [cite_start]**Candidate Visualization**: Renders ranked shortlists and individual candidate cards[cite: 74, 129, 286].
* [cite_start]**State Management**: Uses **Redux Toolkit** to synchronize authentication, job lists, and screening results across the UI[cite: 112, 291, 296].

### **B. Backend Layer (Node.js & TypeScript)**
* [cite_start]**API Orchestration**: An Express-based server that manages job CRUD operations and applicant ingestion pipelines[cite: 75, 76, 114, 133, 138, 139].
* [cite_start]**AI Orchestration Logic**: The `screening.service.ts` prepares job and applicant data to be processed by the AI layer[cite: 80, 140, 365].

### **C. AI Layer (Gemini API - Mandatory)**
* [cite_start]**Intelligent Screening**: Uses the **Gemini API** as the underlying LLM to perform multi-candidate evaluation against job requirements[cite: 81, 96, 99].
* [cite_start]**Scoring & Reasoning**: Generates weighted match scores (0-100) and natural-language explanations regarding candidate strengths and gaps[cite: 85, 86, 100, 361].

### **D. Data Layer (MongoDB Atlas)**
* [cite_start]**Persistence**: Stores all core entities including **Jobs**, **Applicants** (matching Umurava's talent profile schema), and **Screening Results**[cite: 87, 89, 90, 92, 164, 359].

## 3. Technology Stack & Compliance
| Component | Technology | Compliance Status |
| :--- | :--- | :--- |
| **Language** | [cite_start]TypeScript [cite: 110, 133] | ✅ Recommended |
| **Frontend** | [cite_start]Next.js & Tailwind CSS [cite: 111, 113] | ✅ Recommended |
| **Backend** | [cite_start]Node.js [cite: 114] | ✅ Recommended |
| **AI / LLM** | [cite_start]**Gemini API** [cite: 81, 96] | ✅ **Mandatory** |
| **Database** | [cite_start]MongoDB [cite: 115] | ✅ Recommended |

## 4. AI Decision Flow & Explainability
1. [cite_start]**Prompt Engineering**: Uses intentional, documented prompts to ensure recruiter-friendly and structured outputs[cite: 97, 144].
2. [cite_start]**Analysis**: Gemini evaluates skills, experience, and education to produce an objective rank[cite: 84, 100, 146].
3. [cite_start]**Reasoning**: Each shortlist entry includes clear qualitative feedback to preserve human-led final hiring decisions[cite: 22, 27, 40, 64].

## 5. Setup & Deployment
* [cite_start]**Frontend**: Deployed on **Vercel**[cite: 162, 457].
* [cite_start]**Backend**: Hosted on **Railway**[cite: 163, 458].
* **Environment Variables**:
  * [cite_start]`MONGODB_URI`: Connection to the database[cite: 328, 387].
  * [cite_start]`GEMINI_API_KEY`: Authentication for AI services[cite: 328, 387].
  * [cite_start]`JWT_SECRET`: Secure recruiter authentication[cite: 328, 387].
