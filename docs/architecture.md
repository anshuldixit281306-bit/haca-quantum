# QuantumLearn Architecture & Hosting Guide

Comprehensive architectural overview, component relationships, setup workflows, and production deployment guide for **QuantumLearn** (Mac & Quantum).

---

## 1. System Overview

QuantumLearn is a modern, interactive learning platform for Quantum Computing. It offers:
- An **Interactive Quantum Circuit Simulator** (Qiskit-powered).
- Standard quantum algorithm explorations (**Superposition**, **Bell State**, **Grover's Algorithm**, **Quantum Teleportation**).
- An **Interactive Code Lab** for running custom Python quantum experiments.
- An **AI Tutor** capable of operating in **100% offline mode** using a domain-specific knowledge base or via cloud LLM providers (**Groq**, **NVIDIA DeepSeek**, **OpenAI**).
- Full **Student Journey & Gamification** (XP, Badges, Streaks, Course Tracking, Assessments).

---

## 2. Component Architecture

```
                    +------------------------------------------+
                    |             Web Browser (User)           |
                    +------------------------------------------+
                                         |
                                         | HTTP / REST / JSON
                                         v
+-----------------------------------------------------------------------------------+
| FRONTEND (Port 5173 / Production CDN)                                              |
| - React 19 + Vite SPA                                                             |
| - React Router 7 client routing                                                   |
| - Interactive Bloch Sphere / Circuit visualizations                              |
| - Offline state badges, gamified dashboard, markdown explanations                  |
+-----------------------------------------------------------------------------------+
                                         |
                                         | REST API
                                         v
+-----------------------------------------------------------------------------------+
| BACKEND (Port 8000 / Production API Server)                                       |
| - FastAPI with Uvicorn ASGI server                                                |
| - Modular route handlers (/api/auth, /api/quantum, /api/ai, /api/lectures, etc.)  |
| - JWT Bearer Authentication + Passlib (PBKDF2 / Bcrypt)                           |
+-----------------------------------------------------------------------------------+
             |                                    |                          |
             v                                    v                          v
+------------------------+       +------------------------+      +-------------------+
| DATABASE               |       | QUANTUM ENGINE         |      | AI TUTOR          |
| - Local: SQLite        |       | - Local Qiskit 2.x     |      | - Offline KB      |
| - Production: Postgres |       | - Qiskit Aer backend   |      | - Groq / OpenAI / |
| - Auto-migrating tables|       | - Circuit validation   |      |   NVIDIA APIs     |
+------------------------+       +------------------------+      +-------------------+
```

---

## 3. Directory Layout

```
QuantumLearn/
├── backend/
│   ├── app/
│   │   ├── core/               # App configuration, security, JWT
│   │   ├── database/           # SQLAlchemy connection, base, and seeds
│   │   ├── models/             # ORM models (User, Lecture, Progress, Assessment)
│   │   ├── routes/             # API endpoints (auth, quantum, ai, lectures, admin)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic, quantum service, code execution
│   │   └── main.py             # FastAPI entrypoint and CORS setup
│   ├── Dockerfile              # Production container build
│   └── requirements.txt        # Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, Circuit visualizer)
│   │   ├── pages/              # SPA views (Dashboard, Simulator, CodeLab, etc.)
│   │   ├── services/           # API fetch helpers (api.js, lectureApi.js)
│   │   └── App.jsx             # React router configuration
│   ├── vercel.json             # Vercel SPA rewrites
│   ├── public/_redirects       # Netlify / Cloudflare Pages SPA rewrites
│   └── package.json            # Node.js dependencies and scripts
├── quantum_engine/             # Local Qiskit algorithm wrappers & circuit simulator
├── ai_assisstance/             # Offline AI knowledge base & cloud LLM adapters
├── docker-compose.yml          # Full-stack Docker orchestration
├── setup_env.ps1               # Automated Python environment setup script
├── start.ps1                   # Smart launcher script for Windows PowerShell
└── start.bat                   # 1-Click double-clickable launcher
```

---

## 4. Local Development

### Prerequisites
- **Python 3.10 to 3.14**
- **Node.js 18+**

### Running the Application (One-Click)
Double-click `start.bat` or run:
```powershell
.\start.ps1
```
The script will:
1. Verify the Python environment (and automatically install dependencies via `setup_env.ps1` if missing or broken).
2. Start the FastAPI backend at `http://127.0.0.1:8000` (docs at `/docs`).
3. Start the Vite frontend dev server at `http://127.0.0.1:5173`.
4. Open the health check verification.

Default administrator credentials:
- **Email**: `admin@quantumlearn.com`
- **Password**: `Admin@12345`

---

## 5. Deployment & Hosting Blueprint

Because the project has a separated Frontend and Backend, the best practice is to host each part where it performs best.

### Option A: Static Frontend (Vercel) + Containerized Backend (Render) [RECOMMENDED]

#### Step 1: Deploy Database (PostgreSQL)
1. Create a free managed PostgreSQL instance on **[Neon.tech](https://neon.tech)** or **[Supabase](https://supabase.com)** or **[Render](https://render.com)**.
2. Copy the connection string, e.g.:
   `postgresql://username:password@ep-host.neon.tech/quantumlearn?sslmode=require`

#### Step 2: Deploy Backend to Render
1. Push your code to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New + Web Service**.
3. Select your repository.
4. Set:
   - **Environment**: `Docker` (Render will detect `backend/Dockerfile`)
   - **Docker Context**: `.` (Root of the repository)
   - **Dockerfile Path**: `backend/Dockerfile`
5. Configure Environment Variables on Render:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `SECRET_KEY`: A secure random 32+ character string.
   - `AI_PROVIDER`: `auto` or `local` or `groq`.
   - `GROQ_API_KEY`: (Optional) Your Groq API key.
   - `CORS_ORIGINS`: `https://your-frontend-domain.vercel.app`
6. Click **Deploy**. Note your backend URL (e.g. `https://quantumlearn-backend.onrender.com`).

#### Step 3: Deploy Frontend to Vercel
1. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
2. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://quantumlearn-backend.onrender.com` (your backend URL)
4. Click **Deploy**.
5. Once deployed, copy your Vercel domain and update the `CORS_ORIGINS` variable in Render.

---

### Option B: Unified Docker Deployment (Single VPS / Railway / Fly.io)

You can run the entire stack with Docker Compose on any cloud VPS (DigitalOcean, Hetzner, AWS EC2):

```bash
# 1. Clone repository
git clone https://github.com/your-user/QuantumLearn.git
cd QuantumLearn

# 2. Launch PostgreSQL and Backend
docker compose up -d --build

# 3. Build frontend
cd frontend
npm install
npm run build
```

Then serve `frontend/dist` via Nginx or Caddy reverse proxy routing `/api` requests to `http://127.0.0.1:8000`.

---

## 6. Security Best Practices Checklist
- [x] `.gitignore` configured to never commit `.env`, `*.db`, or virtual environment files.
- [ ] Replace default `SECRET_KEY` in production with a cryptographically secure token (`python -c "import secrets; print(secrets.token_urlsafe(32))"`).
- [ ] Ensure `CORS_ORIGINS` is set to your production frontend domain in production environment variables.
- [ ] Store LLM provider API keys only in cloud environment variables, never hardcoded in source code.
