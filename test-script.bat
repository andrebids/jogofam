@echo off
setlocal enabledelayedexpansion

echo Testando deteccao de processos...
echo.

REM Testar porta 3000
echo [TEST] Porta 3000:
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    echo   PID encontrado: !PID!
)

echo.

REM Testar porta 5173
echo [TEST] Porta 5173:
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    echo   PID encontrado: !PID!
)

echo.
echo Teste concluido.

