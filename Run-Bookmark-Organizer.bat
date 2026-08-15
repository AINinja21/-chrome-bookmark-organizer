@echo off
title Chrome Bookmark Smart Organizer
echo Starting Chrome Bookmark Smart Organizer...
cd /d "%~dp0"
start http://localhost:5173
cmd /c "npm run dev -- --host --port 5173"
pause
