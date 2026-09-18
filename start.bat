@echo off
title QuantumLearn Launcher
cd /d "%~dp0"

echo ============================================================
echo   Starting QuantumLearn Platform...
echo ============================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo An error occurred during startup.
    pause
)
