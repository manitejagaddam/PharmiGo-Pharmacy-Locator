@echo off
echo ============================================
echo  Pharmigo Backend - First-Time Setup
echo ============================================

echo.
echo [1/4] Creating virtual environment...
python -m venv .venv
if errorlevel 1 (echo ERROR: python not found & pause & exit /b 1)

echo.
echo [2/4] Installing dependencies...
.venv\Scripts\pip install -r requirements.txt
if errorlevel 1 (echo ERROR: pip install failed & pause & exit /b 1)

echo.
echo [3/4] Running database migrations...
.venv\Scripts\python manage.py migrate
if errorlevel 1 (echo ERROR: migrate failed & pause & exit /b 1)

echo.
echo [4/4] Starting development server...
echo.
echo  Backend running at: http://127.0.0.1:8000
echo  Press Ctrl+C to stop.
echo.
.venv\Scripts\python manage.py runserver
