@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Script para iniciar o servidor do mini jogo
REM Modo dev (padrão) ou produção
REM ============================================

echo.
echo ============================================
echo   Iniciar Servidor - Mini Jogo
echo ============================================
echo.

REM Verificar modo (dev como padrão)
set "MODE=dev"
if "%1"=="prod" set "MODE=prod"
if "%1"=="production" set "MODE=prod"

if "%MODE%"=="dev" (
    echo [INFO] Modo: DESENVOLVIMENTO (servidor + cliente Vite)
    echo.
) else (
    echo [INFO] Modo: PRODUÇÃO (servidor apenas)
    echo.
)

REM Parar processos existentes
echo [INFO] Parando processos existentes...
echo.

REM Parar processos na porta 3000 (servidor)
echo [INFO] Verificando processos na porta 3000...
set "FOUND_3000=0"
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo [INFO] Encontrado processo PID !PID! na porta 3000
        taskkill /PID !PID! /F >nul 2>&1
        if !ERRORLEVEL! equ 0 (
            echo [OK] Processo !PID! encerrado
            set "FOUND_3000=1"
        ) else (
            echo [AVISO] Nao foi possivel encerrar processo !PID!
        )
    )
)
if !FOUND_3000! equ 0 (
    echo [INFO] Nenhum processo encontrado na porta 3000
)
echo.

REM Parar processos na porta 5173 (cliente Vite) - apenas em modo dev
if "%MODE%"=="dev" (
    echo [INFO] Verificando processos na porta 5173...
    set "FOUND_5173=0"
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        set "PID=%%a"
        if not "!PID!"=="" (
            echo [INFO] Encontrado processo PID !PID! na porta 5173
            taskkill /PID !PID! /F >nul 2>&1
            if !ERRORLEVEL! equ 0 (
                echo [OK] Processo !PID! encerrado
                set "FOUND_5173=1"
            ) else (
                echo [AVISO] Nao foi possivel encerrar processo !PID!
            )
        )
    )
    if !FOUND_5173! equ 0 (
        echo [INFO] Nenhum processo encontrado na porta 5173
    )
    echo.
)

REM Aguardar alguns segundos para garantir encerramento
echo [INFO] Aguardando encerramento completo dos processos...
timeout /t 2 /nobreak >nul
echo.

REM Verificar se estamos no diretório correto
cd /d "%~dp0"
if not exist "package.json" (
    echo [ERRO] Arquivo package.json nao encontrado!
    echo [INFO] Certifique-se de executar este script na raiz do projeto.
    pause
    exit /b 1
)

REM Iniciar servidor baseado no modo
if "%MODE%"=="dev" (
    echo [INFO] Iniciando servidor em modo DESENVOLVIMENTO...
    echo [INFO] Servidor: http://localhost:3000
    echo [INFO] Cliente:  http://localhost:5173
    echo.
    echo [INFO] Para acessar na rede local, use o IP do seu computador:
    echo        http://[SEU_IP]:5173/tv
    echo        http://[SEU_IP]:5173/remote
    echo        http://[SEU_IP]:5173/admin
    echo.
    echo [INFO] Pressione Ctrl+C para parar o servidor
    echo.
    
    REM Usar concurrently para executar servidor e cliente juntos
    npm run dev
    
) else (
    echo [INFO] Iniciando servidor em modo PRODUÇÃO...
    echo [INFO] Servidor: http://localhost:3000
    echo.
    echo [INFO] Para acessar na rede local, use o IP do seu computador:
    echo        http://[SEU_IP]:3000/tv
    echo        http://[SEU_IP]:3000/remote
    echo        http://[SEU_IP]:3000/admin
    echo.
    echo [INFO] Pressione Ctrl+C para parar o servidor
    echo.
    
    cd server
    npm start
)

pause

