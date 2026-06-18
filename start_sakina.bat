@echo off
TITLE Sakina — Emotional Intelligence System
color 0B
echo.
echo  ============================================================
echo   SAKINA — Emotional Intelligence System
echo   Launching Full Stack Environment...
echo  ============================================================
echo.

:: -- 0. Check for Python --
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python to run the AI service.
    pause
    exit /b
)

:: -- 1. Kill any leftover processes on our ports --
echo [1/4] Clearing ports 5000 (Backend), 5001 (AI Service), 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5001 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul

:: -- 2. Python AI Microservice --
echo [2/4] Starting AI Microservice on port 5001...
echo      (Note: Loading TensorFlow/Models may take 5-10 seconds)
start "Sakina — AI Microservice" /D "%~dp0ai-main" cmd /k "echo AI Microservice starting... && pip install --user -r requirements.txt && uvicorn main:app --port 5001 --host 0.0.0.0"

:: Wait longer for AI service to initialize models
timeout /t 8 /nobreak >nul

:: -- 3. Express Backend --
echo [3/4] Starting Express Backend on port 5000...
start "Sakina — Backend" /D "%~dp0backend" cmd /k "echo Backend starting... && npm run dev"

timeout /t 3 /nobreak >nul

:: -- 4. React Frontend (Vite) --
echo [4/4] Starting Frontend on port 5173...
start "Sakina — Frontend" /D "%~dp0frontend" cmd /k "echo Frontend starting... && npm run dev"

timeout /t 5 /nobreak >nul

:: -- Summary --
echo.
echo  ============================================================
echo   ALL SERVICES LAUNCHED SUCCESSFULLY
echo  ============================================================
echo.
echo   [FRONTEND]   :  http://localhost:5173
echo   [BACKEND]    :  http://localhost:5000
echo   [AI SERVICE] :  http://localhost:5001/
echo.
echo   Check the AI Service window for "Running on http://127.0.0.1:5001"
echo   before starting your therapy session.
echo.
echo   Close individual windows to stop each service.
echo  ============================================================
echo.
pause
