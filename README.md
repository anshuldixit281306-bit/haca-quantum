# Mac & Quantum — QuantumLearn

AI-powered, interactive quantum computing learning platform
(FastAPI backend + React/Vite frontend + local Qiskit simulation).

## ✅ Fully offline-capable

This project is designed to run **without an internet connection**:

| Component | How it works offline |
| --- | --- |
| Backend API | FastAPI + Uvicorn on `127.0.0.1:8000` |
| Database | SQLite (`backend/quantumlearn.db`) — no server required |
| Quantum engine | Qiskit + Qiskit Aer run **locally** |
| AI Tutor / Circuit AI | `AI_PROVIDER=local` → built-in knowledge base, **no API keys** |
| Frontend | Vite dev server on `127.0.0.1:5173`, all assets local (no CDN fonts) |
| Default login | `admin@quantumlearn.com` / `Admin@12345` |

## 🚀 Quick start (Windows)

Prereqs already present in this folder: `backend/venv` (Python 3.11) and `frontend/node_modules`.

```powershell
# 1) Launch backend + frontend in separate windows
.\start.ps1

# 2) Open the app
#    http://127.0.0.1:5173
#    Backend docs: http://127.0.0.1:8000/docs
```

`start.ps1` verifies the Python environment, creates `backend\.env` from
`.env.example` if missing (offline defaults), launches both servers, and
waits for the backend health check.

The default database is SQLite. For production, set `DATABASE_URL` in
`backend\.env` to a PostgreSQL SQLAlchemy URL such as
`postgresql+psycopg://user:password@host:5432/quantumlearn`. The same
SQLAlchemy models and startup migrations create the lecture timeline,
interaction history, progress, and gamification fields on either database.

### Manual start

```powershell
# Backend  (terminal 1)
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Frontend (terminal 2)
cd frontend
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

> If the checked-in `backend\.venv` is broken (it may reference another
> machine's Python), use `backend\venv` or recreate it:
>
> ```powershell
> py -3.11 -m venv backend\venv
> backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
> ```

## 🔌 Re-enabling cloud AI (optional, requires internet)

Edit `backend\.env`:

1. Uncomment and fill `GROQ_API_KEY` (or `NVIDIA_API_KEY` / `OPENAI_API_KEY`).
2. Set `AI_PROVIDER=groq` (or `nvidia` / `openai` / `auto`).

Set `AI_PROVIDER=local` (the default) to return to offline mode.

## 🧩 Project layout

```
backend/            FastAPI application (routes, models, services, SQLite db)
frontend/           React + Vite single-page app
quantum_engine/     Local quantum algorithms (Grover, Teleportation, QFT, …)
ai_assisstance/     Offline AI tutor knowledge base & explainers
database/           SQL schema notes
scripts/            Helper scripts
```

## 🧪 Smoke test

```powershell
# Health check
Invoke-RestMethod http://127.0.0.1:8000/health

# Offline AI tutor (no network call)
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/ai/ask `
  -ContentType 'application/json' `
  -Body '{"question":"What is a qubit?"}'

# Local quantum simulation
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/quantum/bell-state
```

## ⚠️ Notes

- Lecture videos (YouTube) and course thumbnails require internet; offline the
  thumbnails show a graceful "Offline" placeholder.
- `frontend/node_modules` is required for `npm run dev`; if you ever need to
  reinstall it you need internet once: `npm install` inside `frontend/`.
