
#!/usr/bin/env node

// EPQS Development Server
// Desenvolvido por Marcos Garçon
// Simple HTTP server for local development to avoid CORS issues

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class EPQSDevServer {
    constructor(port = 8000, directory = '.') {
        this.port = port;
        this.directory = path.resolve(directory);
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
    }

    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.mimeTypes[ext] || 'application/octet-stream';
    }

    serveFile(filePath, res) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Arquivo não encontrado</title>
                        <style>
                            body { 
                                font-family: system-ui, sans-serif; 
                                background: #0f172a; 
                                color: #e5e7eb; 
                                text-align: center; 
                                padding: 50px; 
                            }
                            .error { 
                                background: rgba(239, 68, 68, 0.1); 
                                border: 1px solid #ef4444; 
                                border-radius: 12px; 
                                padding: 30px; 
                                max-width: 500px; 
                                margin: 0 auto; 
                            }
                        </style>
                    </head>
                    <body>
                        <div class="error">
                            <h1>404 - Arquivo não encontrado</h1>
                            <p>O arquivo solicitado não foi encontrado no servidor.</p>
                            <p><a href="/" style="color: #22d3ee;">Voltar ao início</a></p>
                        </div>
                    </body>
                    </html>
                `);
                return;
            }

            const mimeType = this.getMimeType(filePath);
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(data);
        });
    }

    serveDirectory(dirPath, res) {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('Erro interno do servidor');
                return;
            }

            const fileList = files.map(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                const isDir = stats.isDirectory();
                const size = isDir ? '-' : this.formatBytes(stats.size);
                const modified = stats.mtime.toLocaleDateString('pt-BR');
                
                return `
                    <tr>
                        <td><a href="${file}${isDir ? '/' : ''}">${isDir ? '📁' : '📄'} ${file}</a></td>
                        <td>${size}</td>
                        <td>${modified}</td>
                    </tr>
                `;
            }).join('');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>EPQS Dev Server - Listagem de Arquivos</title>
                    <style>
                        body { 
                            font-family: system-ui, sans-serif; 
                            background: #0f172a; 
                            color: #e5e7eb; 
                            margin: 0; 
                            padding: 20px; 
                        }
                        .header {
                            background: linear-gradient(135deg, #22d3ee, #3b82f6);
                            color: #0f172a;
                            padding: 20px;
                            border-radius: 12px;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            background: #1e293b; 
                            border-radius: 8px; 
                            overflow: hidden; 
                        }
                        th, td { 
                            padding: 12px; 
                            text-align: left; 
                            border-bottom: 1px solid #334155; 
                        }
                        th { 
                            background: #334155; 
                            font-weight: 600; 
                        }
                        a { 
                            color: #22d3ee; 
                            text-decoration: none; 
                        }
                        a:hover { 
                            text-decoration: underline; 
                        }
                        .info {
                            background: rgba(34, 211, 238, 0.1);
                            border: 1px solid #22d3ee;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🚀 EPQS Development Server</h1>
                        <p>Servidor de desenvolvimento para o sistema EPQS</p>
                    </div>
                    
                    <div class="info">
                        <strong>💡 Dica:</strong> Para acessar o sistema EPQS, clique em <a href="/index.html">index.html</a>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Nome do Arquivo</th>
                                <th>Tamanho</th>
                                <th>Modificado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fileList}
                        </tbody>
                    </table>
                </body>
                </html>
            `);
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    start() {
        const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            let requestPath = decodeURIComponent(parsedUrl.pathname);

            // Default to index.html for root
            if (requestPath === '/' || requestPath === '') {
                requestPath = 'index.html';
            } else if (requestPath.startsWith('/')) {
                requestPath = requestPath.substring(1);
            }

            const filePath = path.join(this.directory, requestPath);

            // Security check - prevent directory traversal
            if (!filePath.startsWith(this.directory)) {
                res.writeHead(403, { 'Content-Type': 'text/html' });
                res.end('Acesso negado');
                return;
            }

            fs.stat(filePath, (err, stats) => {
                if (err) {
                    this.serveFile(filePath, res); // This will handle 404
                    return;
                }

                if (stats.isDirectory()) {
                    // Try to serve index.html from directory
                    const indexPath = path.join(filePath, 'index.html');
                    fs.stat(indexPath, (indexErr) => {
                        if (!indexErr) {
                            this.serveFile(indexPath, res);
                        } else {
                            this.serveDirectory(filePath, res);
                        }
                    });
                } else {
                    this.serveFile(filePath, res);
                }
            });
        });

        server.listen(this.port, () => {
            console.log(`
🚀 EPQS Development Server iniciado!

📍 URL: http://localhost:${this.port}
📁 Diretório: ${this.directory}
🌐 Acesse o sistema: http://localhost:${this.port}/index.html

💡 Este servidor resolve problemas de CORS e SecurityError
   que podem ocorrer ao executar o sistema diretamente do
   sistema de arquivos (file://).

⏹️  Para parar o servidor, pressione Ctrl+C
            `);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Parando o servidor...');
            server.close(() => {
                console.log('✅ Servidor parado com sucesso!');
                process.exit(0);
            });
        });

        return server;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const port = args[0] ? parseInt(args[0]) : 8000;
    const directory = args[1] || '.';

    const server = new EPQSDevServer(port, directory);
    server.start();
}

module.exports = EPQSDevServer;

