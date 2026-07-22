@echo off
echo ========================================================
echo   UnionDesk Bangladesh SaaS Platform - 1-Click Launch
echo ========================================================
echo.
echo Starting Backend Server on http://localhost:5000...
start "UnionDesk Backend Server" cmd /k "cd server && npm run dev"
echo.
echo Starting Frontend Client on http://localhost:5173...
start "UnionDesk Frontend Client" cmd /k "cd client && npm run dev"
echo.
echo Launching App in your default web browser...
timeout /t 4 >nul
start http://localhost:5173
