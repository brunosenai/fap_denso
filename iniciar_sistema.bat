@echo off
title FAP - Denso
color 0A

:: Garante que o script rode na pasta onde ele esta localizado
cd /d "%~dp0"

echo ===================================================
echo       INICIANDO O SISTEMA FAP - DENSO
echo ===================================================
echo.

:: Verifica se a pasta node_modules existe
if not exist "node_modules\" (
    echo [INFO] Instalando dependencias do projeto Node.js...
    call npm install
) else (
    echo [INFO] Dependencias Node.js encontradas.
)
echo.

echo [INFO] Iniciando o servidor web...
echo.
echo Para encerrar o sistema, feche esta janela ou pressione Ctrl+C.
echo ===================================================


:: Abre a tela de splash (carregamento) imediatamente
:: start splash.html

call npm run dev

pause
