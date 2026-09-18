# ============================================================
# QuantumLearn launcher
# Starts the local FastAPI backend used by the Firebase-hosted frontend.
# ============================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath  = Join-Path $projectRoot "backend"

Write-Host ""
Write-Host "QuantumLearn - starting in OFFLINE mode..." -ForegroundColor Cyan
Write-Host "=========================================="

# ------------------------------------------------------------
# 1. Backend Python interpreter
# ------------------------------------------------------------
$backendPython = "python"
& $backendPython -c "import fastapi, uvicorn, qiskit" 2>$null
if ($LASTEXITCODE -ne 0) {
    $venvPython = Join-Path $backendPath "venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        $backendPython = $venvPython
    } else {
        Write-Host "Configuring Python virtual environment..." -ForegroundColor Cyan
        $setupScript = Join-Path $projectRoot "setup_env.ps1"
        if (Test-Path $setupScript) {
            & powershell.exe -ExecutionPolicy Bypass -File $setupScript
            $backendPython = $venvPython
        }
    }
}


# Backend environment - verify offline mode is enabled.
$envFile = Join-Path $backendPath ".env"
if (-not (Test-Path $envFile)) {
    Copy-Item (Join-Path $backendPath ".env.example") $envFile
    Write-Host "Created backend/.env from .env.example (offline defaults)." -ForegroundColor Green
}

# ------------------------------------------------------------
# 2. Launch backend (FastAPI / uvicorn) on 127.0.0.1:8000
# ------------------------------------------------------------
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backendPath'; & '$backendPython' -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

# ------------------------------------------------------------
# 3. Wait for the backend to become healthy
# ------------------------------------------------------------
Write-Host ""
Write-Host "Waiting for backend on http://127.0.0.1:8000 ..." -ForegroundColor DarkGray

$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 1000
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        # Backend not up yet - keep waiting.
    }
}

if ($ready) {
    Write-Host "Backend  = online  http://127.0.0.1:8000  (docs at /docs)" -ForegroundColor Green
} else {
    Write-Host "Backend: could not confirm it is up yet - check the backend window for errors." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Firebase frontend = https://macnquant.web.app" -ForegroundColor Green
Write-Host "Backend API       = http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Open the Firebase URL after starting this script." -ForegroundColor DarkGray
Write-Host ""
