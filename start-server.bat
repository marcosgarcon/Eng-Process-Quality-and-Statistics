@echo off
SETLOCAL

:: Verifica se o Node.js está instalado
node -v > NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Node.js não encontrado. Por favor, instale o Node.js para executar o servidor.
    ECHO Download: https://nodejs.org/en/download/
    PAUSE
    EXIT /B 1
)

:: Verifica se o 'serve' está instalado globalmente
serve -v > NUL 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO O pacote 'serve' não está instalado globalmente.
    ECHO Instalando 'serve' globalmente (requer permissões de administrador na primeira vez)...
    npm install -g serve
    IF %ERRORLEVEL% NEQ 0 (
        ECHO Falha ao instalar 'serve'. Por favor, execute este script como administrador ou instale 'serve' manualmente: npm install -g serve
        PAUSE
        EXIT /B 1
    )
)

ECHO Iniciando o servidor de desenvolvimento EPQS com 'serve'...
ECHO Acesse o sistema em: http://localhost:5000
ECHO Pressione Ctrl+C para parar o servidor.

serve -s . -l 5000

ENDLOCAL
