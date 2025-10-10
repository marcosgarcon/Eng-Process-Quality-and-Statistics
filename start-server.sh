#!/bin/bash

# EPQS Development Server - Linux/macOS Script
# Desenvolvido por Marcos Garçon

echo ""
echo "========================================"
echo "  EPQS Development Server - Linux/macOS"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "ERRO: Node.js não encontrado!"
    echo ""
    echo "Por favor, instale o Node.js:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

echo "Node.js encontrado: $(node -v)"
echo ""

# Check if 'serve' is installed globally
if ! command -v serve &> /dev/null
then
    echo "O pacote 'serve' não está instalado globalmente."
    echo "Instalando 'serve' globalmente (pode requerer 'sudo' na primeira vez)..."
    npm install -g serve
    if [ $? -ne 0 ]; then
        echo "Falha ao instalar 'serve'. Por favor, execute 'sudo npm install -g serve' manualmente."
        exit 1
    fi
fi

echo "Iniciando o servidor de desenvolvimento EPQS com 'serve'..."
echo "Acesse o sistema em: http://localhost:5000"
echo "Pressione Ctrl+C para parar o servidor."
echo ""

serve -s . -l 5000

