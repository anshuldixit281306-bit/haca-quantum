# ============================================================
# QuantumLearn - Virtual Environment Setup Script
# Recreates a clean Python virtual environment and installs
# all dependencies for the backend and quantum simulation.
# ============================================================

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$venvPath    = Join-Path $backendPath "venv"
$reqFile     = Join-Path $backendPath "requirements.txt"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " QuantumLearn - Setting Up Backend Python Environment" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detect active Python interpreter
$pythonCmd = "python"
try {
    $versionOutput = & $pythonCmd --version 2>&1
    Write-Host "Found system Python: $versionOutput" -ForegroundColor Green
} catch {
    try {
        $pythonCmd = "py"
        $versionOutput = & $pythonCmd --version 2>&1
        Write-Host "Found py launcher: $versionOutput" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: No Python installation found on PATH or py launcher." -ForegroundColor Red
        Write-Host "Please install Python 3.10+ from https://python.org or Microsoft Store." -ForegroundColor Yellow
        exit 1
    }
}

# 2. Remove any existing / broken venv
if (Test-Path $venvPath) {
    Write-Host "Removing existing/previous virtualenv..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $venvPath
}
if (Test-Path (Join-Path $backendPath ".venv")) {
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue (Join-Path $backendPath ".venv")
}

# 3. Create fresh venv
Write-Host "Creating fresh virtual environment in backend/venv ..." -ForegroundColor Cyan
& $pythonCmd -m venv $venvPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create virtual environment." -ForegroundColor Red
    exit 1
}

$venvPython = Join-Path $venvPath "Scripts\python.exe"
$venvPip    = Join-Path $venvPath "Scripts\pip.exe"

# 4. Upgrade pip and install requirements
Write-Host "Installing backend and quantum dependencies (FastAPI, Qiskit, SQLAlchemy)..." -ForegroundColor Cyan
& $venvPython -m pip install --upgrade pip
& $venvPip install -r $reqFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Backend Python environment is ready!" -ForegroundColor Green
    Write-Host " You can now run .\start.ps1 or start.bat to launch the app." -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
} else {
    Write-Host "Pip install exited with errors. Please check the output above." -ForegroundColor Red
}
