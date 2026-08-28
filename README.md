# JobGenie 🪄 — AI-Powered Career Assistant & Matching Engine

JobGenie is a modern, single-page AI career guidance platform designed to help job seekers understand their strengths, explore suitable career paths, and access active job listings based on their professional attributes.

The application guides users through an interactive, conversational chat interface, matches them with seeded career roles using a weighted algorithm, queries LLMs for personalized summaries/roadmaps, and aggregates live opportunities from across the web.

## Chat conversation Flow
🤖 What's your name?
        ↓
👤 Name

🤖 What's your email address?
        ↓
👤 Email

🤖 What's your phone number?
        ↓
👤 Phone Number

🤖 List your skills (comma separated)
        ↓
👤 Skills

🤖 How many years of experience do you have?
        ↓
👤 Experience

🤖 What's your education?
        ↓
👤 Education

🤖 Where are you from?
        ↓
👤 Location
        ↓
Results Dashboard (Job Matching + AI Analysis)



## ⚙️ Environment Variables (.env)

### Backend Configuration
Create a `.env` file in the `/backend` folder:
```env
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_credential_key
RAPIDAPI_KEY=your_rapidapi_jsearch_key
RAPIDAPI_HOST=jsearch.p.rapidapi.com
JWT_SECRET=your_cryptographic_jwt_token_signature_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
---

```

## 📂 Quick Start


### 1. Backend Server Setup
```bash
cd backend
npm install
node src/seed/seedRoles.js   # Seed target career roles into MongoDB
npm run dev                  # Start backend dev server on port 4000
```

### 2. Frontend Client Setup
```bash
cd frontend
npm install
npm run dev                  # Start Vite dev server on port 5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.




