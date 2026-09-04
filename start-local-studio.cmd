@echo off
setlocal
cd /d "%~dp0"
bun tauri dev
if errorlevel 1 pause
endlocal
