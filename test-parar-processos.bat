@echo off
setlocal enabledelayedexpansion

echo ============================================
echo Teste: Parar Processos
echo ============================================
echo.

REM Simular a lógica do script principal
set "MODE=dev"

echo [INFO] Modo: %MODE%
echo.

REM Parar processos na porta 3000
echo [INFO] Verificando processos na porta 3000...
set "FOUND_3000=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo [INFO] Encontrado processo PID !PID! na porta 3000
        echo [TEST] Simulando: taskkill /PID !PID! /F
        set "FOUND_3000=1"
    )
)
if !FOUND_3000! equ 0 (
    echo [INFO] Nenhum processo encontrado na porta 3000
)
echo.

REM Parar processos na porta 5173
if "%MODE%"=="dev" (
    echo [INFO] Verificando processos na porta 5173...
    set "FOUND_5173=0"
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        set "PID=%%a"
        if not "!PID!"=="" (
            echo [INFO] Encontrado processo PID !PID! na porta 5173
            echo [TEST] Simulando: taskkill /PID !PID! /F
            set "FOUND_5173=1"
        )
    )
    if !FOUND_5173! equ 0 (
        echo [INFO] Nenhum processo encontrado na porta 5173
    )
    echo.
)

echo [INFO] Teste concluido.
echo [INFO] Se os PIDs foram detectados, o script esta funcionando corretamente.

