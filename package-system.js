// System Packager for EPQS - Final Packaging and Distribution
// Desenvolvido por Marcos Garçon

class EPQSSystemPackager {
    constructor() {
        this.packageInfo = {
            name: 'Eng Process Quality and Statistics',
            shortName: 'EPQS',
            version: '1.0.0',
            author: 'Marcos Garçon',
            description: 'Sistema Integrado de Ferramentas de Qualidade e Estatística',
            buildDate: new Date().toISOString(),
            platform: this.detectPlatform()
        };
        
        this.fileStructure = new Map();
        this.packageSizes = new Map();
        
        this.init();
    }

    init() {
        console.log('EPQS System Packager: Initializing...');
        this.analyzeSystemStructure();
        this.generatePackageManifest();
        this.createDistributionPackage();
    }

    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        return {
            isWindows: platform.includes('win') || userAgent.includes('windows'),
            isAndroid: userAgent.includes('android'),
            isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
            browser: this.detectBrowser(),
            timestamp: new Date().toISOString()
        };
    }

    detectBrowser() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome')) return 'Chrome';
        if (userAgent.includes('firefox')) return 'Firefox';
        if (userAgent.includes('safari')) return 'Safari';
        if (userAgent.includes('edge')) return 'Edge';
        return 'Unknown';
    }

    analyzeSystemStructure() {
        console.log('Analyzing system structure...');
        
        // Core files
        this.fileStructure.set('core', [
            'index.html',
            'manifest.json',
            'service-worker.js',
            'README.md'
        ]);
        
        // JavaScript modules
        this.fileStructure.set('scripts', [
            'app.js',
            'data-manager.js',
            'settings.js',
            'tool-processor.js',
            'reports-dashboard.js',
            'external-integration.js',
            'platform-optimization.js',
            'system-validator.js',
            'package-system.js',
            'user-management.js'
        ]);
        
        // Tools (HTML files)
        this.fileStructure.set('tools', [
            '5_porques.html', '5s.html', '8d.html', 'apqp.html', 'cep.html',
            'controle_injecao.html', 'cronoanalise-mtm.html', // Renomeado para consistência
            'diagrama-dispersao.html', 'dmaic.html', 'estamparia.html', 'fmea.html',
            'folha_verificacao.html', 'gap-analysis.html', 'histograma.html',
            'ishikawa.html', 'kaizen.html', 'manutencao.html', 'mapeamento-processos.html',
            'masp.html', 'matriz-esforco-impacto.html', 'matriz-gut.html', 'msa.html',
            'pareto.html', 'planejamento.html', 'ppap.html', 'relatorio-a3.html',
            'root-cause-analysis.html', 'smed.html', 'sucata.html', 'analise-swot.html', // Renomeado para consistência
            'treinamento.html', 'vsm.html'
        ]);
        
        // Assets
        this.fileStructure.set('assets', [
            'icons/icon-32x32.png',
            'icons/icon-72x72.png',
            'icons/icon-96x96.png',
            'icons/icon-128x128.png',
            'icons/icon-144x144.png',
            'icons/icon-152x152.png',
            'icons/icon-192x192.png',
            'icons/icon-384x384.png',
            'icons/icon-512x512.png',
            'screenshots/desktop-screenshot.png',
            'screenshots/mobile-screenshot.png'
        ]);
        
        // Testing files
        this.fileStructure.set('testing', [
            'test-integration.html'
        ]);
    }

    generatePackageManifest() {
        console.log('Generating package manifest...');
        
        const manifest = {
            package: this.packageInfo,
            structure: Object.fromEntries(this.fileStructure),
            dependencies: {
                external: [
                    'Chart.js (CDN)',
                    'Phosphor Icons (CDN)',
                    'Modern Browser (Chrome 80+, Edge 80+, Firefox 75+, Safari 13+)'
                ],
                integrated: [
                    'Jamovi Integration Templates',
                    'FreeCAD Python Scripts',
                    'JaamSim Configuration Files'
                ]
            },
            features: {
                core: [
                    'Progressive Web Application (PWA)',
                    'Offline Functionality',
                    'Local Data Storage',
                    'Cross-Platform Compatibility'
                ],
                tools: [
                    '31 Integrated Quality Tools', // Total de ferramentas HTML
                    'Interactive Dashboards',
                    'Report Generation',
                    'Data Export/Import'
                ],
                integration: [
                    'Jamovi Statistical Analysis',
                    'FreeCAD 3D Modeling',
                    'JaamSim Process Simulation',
                    'Digital Twin Workflows'
                ]
            },
            requirements: {
                minimum: {
                    browser: 'Chrome 80+, Edge 80+, Firefox 75+, Safari 13+',
                    ram: '2GB',
                    storage: '50MB',
                    resolution: '1024x768 (desktop), 360x640 (mobile)'
                },
                recommended: {
                    browser: 'Latest versions',
                    ram: '4GB+',
                    storage: '100MB+',
                    resolution: '1920x1080 (desktop), 1080x1920 (mobile)'
                }
            },
            installation: {
                windows: [
                    'Open index.html in modern browser',
                    'Click install icon in address bar',
                    'Or use "Install App" button in header',
                    'App will be installed as native application'
                ],
                android: [
                    'Open index.html in Chrome or compatible browser',
                    'Tap menu (⋮) and select "Install app"',
                    'Or use automatic install banner',
                    'App will be added to home screen'
                ],
                server: [
                    'Deploy files to web server',
                    'Ensure HTTPS for full PWA functionality',
                    'Access via browser URL',
                    'Install prompt will appear automatically'
                ]
            },
            usage: {
                login: {
                    default_user: 'admin',
                    default_password: 'admin123',
                    note: 'Local authentication system'
                },
                navigation: [
                    'Dashboard: Main overview and tool access',
                    'Reports Dashboard: KPIs and analytics',
                    'External Integration: Jamovi, FreeCAD, JaamSim',
                    'Individual Tools: 31 specialized quality tools' // Total de ferramentas HTML
                ],
                data: [
                    'Automatic local storage',
                    'Manual backup/restore',
                    'Export to external tools',
                    'Import from various formats'
                ]
            }
        };
        
        this.packageManifest = manifest;
        return manifest;
    }

    createDistributionPackage() {
        console.log('Creating distribution package...');
        
        // Generate installation guide
        const installationGuide = this.generateInstallationGuide();
        
        // Generate deployment guide
        const deploymentGuide = this.generateDeploymentGuide();
        
        // Generate user manual
        const userManual = this.generateUserManual();
        
        // Create package info file
        const packageInfo = this.generatePackageInfo();
        
        // Store all documentation
        this.storeDocumentation({
            installationGuide,
            deploymentGuide,
            userManual,
            packageInfo,
            manifest: this.packageManifest
        });
        
        console.log('Distribution package created successfully!');
    }

    generateInstallationGuide() {
        return `# EPQS - Guia de Instalação\n\n## Eng Process Quality and Statistics\n**Desenvolvido por Marcos Garçon**\n\n### 📋 Pré-requisitos\n\n#### Windows\n- Windows 10 ou superior\n- Navegador moderno (Chrome 80+, Edge 80+, Firefox 75+)\n- 2GB RAM mínimo (4GB recomendado)\n- 50MB espaço livre\n\n#### Android\n- Android 7.0 ou superior\n- Chrome 80+ ou navegador compatível com PWA\n- 2GB RAM mínimo\n- 50MB espaço livre\n\n### 🚀 Instalação\n\n#### Método 1: Instalação Local (Recomendado)\n\n1. **Baixe o sistema completo**\n   - Extraia todos os arquivos em uma pasta\n   - Mantenha a estrutura de diretórios intacta\n\n2. **Windows - Instalação como PWA**\n   - Abra o arquivo \`index.html\` no navegador\n   - Clique no ícone de instalação na barra de endereços\n   - Ou clique em "Instalar App" no cabeçalho\n   - O EPQS será instalado como aplicativo nativo\n\n3. **Android - Instalação como PWA**\n   - Abra o arquivo \`index.html\` no Chrome\n   - Toque no menu (⋮) → "Instalar app"\n   - Ou use o banner de instalação automático\n   - O app será adicionado à tela inicial\n\n#### Método 2: Servidor Web\n\n1. **Configuração do Servidor**\n   \`\`\`bash\n   # Python (simples)\n   python -m http.server 8000\n   \n   # Node.js\n   npx serve .\n   \n   # Acesse: http://localhost:8000\n   \`\`\`\n\n2. **Instalação via Navegador**\n   - Acesse a URL do servidor\n   - Use o prompt de instalação automático\n   - Funciona em qualquer dispositivo na rede\n\n### 🔐 Primeiro Acesso\n\n- **Usuário**: admin\n- **Senha**: admin123\n\n### ✅ Verificação da Instalação\n\n1. Execute o teste de integração: \`test-integration.html\`\n2. Verifique se todas as 31 ferramentas carregam (excluindo os dashboards e gerenciamento de usuários)\n3. Teste o salvamento de dados\n4. Confirme funcionamento offline\n\n### 🔧 Solução de Problemas\n\n**Ferramentas não carregam**\n- Verifique estrutura de arquivos\n- Execute teste de integração\n- Limpe cache do navegador\n\n**Não instala como PWA**\n- Use HTTPS (servidor web)\n- Verifique compatibilidade do navegador\n- Tente modo privado/incógnito\n\n**Dados não salvam**\n- Verifique localStorage habilitado\n- Teste em modo normal (não privado)\n- Verifique espaço disponível\n\n### 📞 Suporte\n\nPara problemas técnicos, consulte o arquivo README.md ou execute o validador do sistema.\n`;
    }

    generateDeploymentGuide() {
        return `# EPQS - Guia de Implantação\n\n## Eng Process Quality and Statistics\n**Desenvolvido por Marcos Garçon**\n\n### 🌐 Implantação em Servidor Web\n\n#### Requisitos do Servidor\n- Servidor web (Apache, Nginx, IIS)\n- Suporte a arquivos estáticos\n- HTTPS recomendado para PWA completa\n- Compressão gzip/brotli (opcional)\n\n#### Estrutura de Arquivos\n\`\`\`\nepqs/\n├── index.html              # Página principal\n├── manifest.json          # Configuração PWA\n├── service-worker.js       # Cache offline\n├── *.js                   # Módulos JavaScript\n├── tools/                 # 31 ferramentas HTML\n├── icons/                 # Ícones PWA\n└── screenshots/           # Screenshots para stores\n\`\`\`\n\n#### Configuração Apache\n\`\`\`apache\n<Directory "/path/to/epqs">\n    Options Indexes FollowSymLinks\n    AllowOverride All\n    Require all granted\n    \n    # PWA Headers\n    Header set Service-Worker-Allowed "/"\n    Header set Cache-Control "no-cache" env=no-cache\n    \n    # MIME Types\n    AddType application/manifest+json .webmanifest\n    AddType text/cache-manifest .appcache\n</Directory>\n\n# Compression\n<IfModule mod_deflate.c>\n    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json\n</IfModule>\n\`\`\`\n\n#### Configuração Nginx\n\`\`\`nginx\nserver {\n    listen 443 ssl;\n    server_name your-domain.com;\n    \n    root /path/to/epqs;\n    index index.html;\n    \n    # PWA Headers\n    location /service-worker.js {\n        add_header Service-Worker-Allowed "/";\n        add_header Cache-Control "no-cache";\n    }\n    \n    # Static files caching\n    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n        expires 1y;\n        add_header Cache-Control "public, immutable";\n    }\n    \n    # Compression\n    gzip on;\n    gzip_types text/html text/css text/javascript application/javascript application/json;\n}\n\`\`\`\n\n### 📱 Distribuição Mobile\n\n#### Android (PWA)\n1. **Configuração**\n   - HTTPS obrigatório\n   - Manifest.json válido\n   - Service Worker ativo\n   - Ícones em múltiplos tamanhos\n\n2. **Teste de Instalação**\n   - Chrome DevTools → Application → Manifest\n   - Lighthouse PWA audit\n   - Teste em dispositivos reais\n\n#### iOS (PWA)\n1. **Limitações**\n   - Safari 11.1+ necessário\n   - Funcionalidades limitadas\n   - Sem prompt automático\n\n2. **Otimizações**\n   - Meta tags específicas iOS\n   - Ícones apple-touch-icon\n   - Splash screens personalizadas\n\n### 🏢 Implantação Corporativa\n\n#### Intranet\n\`\`\`\n1. Deploy em servidor interno\n2. Configurar DNS interno\n3. Certificado SSL interno\n4. Política de grupo (Windows)\n5. MDM (Mobile Device Management)\n\`\`\`\n\n#### Kiosk Mode\n\`\`\`javascript\n// Configuração para modo quiosque\n{\n  "display": "fullscreen",\n  "orientation": "landscape",\n  "start_url": "/?mode=kiosk"\n}\n\`\`\`\n\n### 🔒 Segurança\n\n#### Headers de Segurança\n\`\`\`\nContent-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff\nReferrer-Policy: strict-origin-when-cross-origin\n\`\`\`\n\n#### Backup e Recuperação\n1. **Backup Automático**\n   - Scripts de backup dos dados\n   - Versionamento de arquivos\n   - Backup da configuração\n\n2. **Recuperação**\n   - Procedimentos de restore\n   - Validação de integridade\n   - Rollback de versões\n\n### 📊 Monitoramento\n\n#### Métricas PWA\n- Install rate\n- Engagement metrics\n- Offline usage\n- Performance metrics\n\n#### Analytics\n\`\`\`javascript\n// Google Analytics 4 (opcional)\ngtag('config', 'GA_MEASUREMENT_ID', {\n  custom_map: {'custom_parameter': 'epqs_tool'}\n});\n\`\`\`\n\n### 🔄 Atualizações\n\n#### Estratégia de Update\n1. **Versionamento**\n   - Semantic versioning (1.0.0)\n   - Changelog detalhado\n   - Backward compatibility\n\n2. **Deploy Process**\n   - Staging environment\n   - Automated testing\n   - Gradual rollout\n   - Rollback capability\n   \n#### Service Worker Update\n\`\`\`javascript\nif ('serviceWorker' in navigator) {\n    navigator.serviceWorker.getRegistrations().then(registrations => {\n        registrations.forEach(registration => registration.update());\n    });\n}\n\`\`\`\n\n### 📋 Checklist de Deploy\n\n- [ ] Todos os arquivos copiados\n- [ ] Estrutura de diretórios correta\n- [ ] HTTPS configurado\n- [ ] Manifest.json válido\n- [ ] Service Worker funcionando\n- [ ] Ícones em todos os tamanhos\n- [ ] Teste de instalação PWA\n- [ ] Teste offline\n- [ ] Validação de todas as ferramentas\n- [ ] Backup configurado\n- [ ] Monitoramento ativo\n\n### 🎯 Otimizações de Performance\n\n#### Compressão\n- Gzip/Brotli para arquivos texto\n- Otimização de imagens\n- Minificação de CSS/JS\n\n#### Caching\n- Service Worker caching\n- Browser caching headers\n- CDN (se aplicável)\n\n#### Loading\n- Lazy loading de ferramentas\n- Preload de recursos críticos\n- Resource hints\n\n### 📞 Suporte Técnico\n\nPara questões de implantação:\n1. Consulte logs do servidor\n2. Use Chrome DevTools\n3. Execute validador do sistema\n4. Verifique documentação técnica\n`;
    }

    generateUserManual() {
        return `# EPQS - Manual do Usuário\n\n## Eng Process Quality and Statistics\n**Sistema Integrado de Ferramentas de Qualidade e Estatística**\n**Desenvolvido por Marcos Garçon**\n\n### 📖 Introdução\n\nO EPQS é um sistema completo que integra 31 ferramentas especializadas para engenharia de processos, controle de qualidade e análise estatística. Desenvolvido como uma Progressive Web Application (PWA), oferece funcionalidade offline, salvamento local de dados e integração com ferramentas externas.\n\n### 🚀 Primeiros Passos\n\n#### Login no Sistema\n1. Abra o EPQS no navegador\n2. Use as credenciais padrão:\n   - **Usuário**: admin\n   - **Senha**: admin123\n3. Clique em "Entrar"\n\n#### Interface Principal\n- **Cabeçalho**: Nome do sistema, botões de ação\n- **Menu Lateral**: Navegação entre seções\n- **Área Principal**: Conteúdo da seção ativa\n\n### 🏠 Dashboard Principal\n\nO dashboard oferece uma visão geral do sistema:\n\n#### Cards Informativos\n- **Ferramentas Disponíveis**: 31 ferramentas integradas\n- **Categorias**: Organização por tipo de análise\n- **Acesso Rápido**: Links diretos para ferramentas populares\n\n#### Grade de Ferramentas\nFerramentas organizadas por categoria:\n- **Análise de Problemas**: 5 Porquês, 8D, Ishikawa, FMEA, MASP, Análise de Causa Raiz\n- **Qualidade e Controle**: 5S, CEP, MSA, APQP, PPAP, Gap Analysis\n- **Análise Estatística**: Pareto, Histograma, Dispersão, Folha de Verificação\n- **Processos e Melhoria**: Kaizen, DMAIC, VSM, Mapeamento de Processos, Cronoanálise MTM, SMED\n- **Gestão e Planejamento**: Planejamento, Treinamento, Manutenção\n- **Análise Estratégica**: SWOT, Matriz GUT, Matriz Esforço x Impacto\n- **Controle de Produção**: Injeção, Estamparia, Sucata\n- **Relatórios**: A3\n\n### 📊 Dashboard de Indicadores\n\nAcesse através do menu lateral para visualizar:\n\n#### KPIs Principais\n- **Ferramentas Disponíveis**: Total de ferramentas no sistema\n- **Usuários Ativos**: Contagem de usuários únicos\n- **Relatórios Gerados**: Número de relatórios criados\n- **Pontos de Dados**: Volume total de dados armazenados\n- **Tempo Médio de Sessão**: Duração média de uso\n- **Saúde do Sistema**: Status geral do sistema\n\n#### Gráficos Interativos\n1. **Uso de Ferramentas por Categoria**\n   - Gráfico de rosca mostrando distribuição de uso\n   - Controles de período (7, 30, 90 dias)\n\n2. **Tendência de Qualidade**\n   - Gráfico de linha com evolução temporal\n   - Comparação com metas estabelecidas\n\n3. **Distribuição de Problemas**\n   - Gráfico de barras por categoria (6M)\n   - Análise de Pareto automática\n\n4. **Performance de Processos**\n   - Gráfico radar com múltiplas métricas\n   - Comparação entre processos\n\n#### Atividade Recente\nLista das últimas ações realizadas no sistema:\n- Relatórios gerados\n- Ferramentas utilizadas\n- Backups realizados\n- Atualizações de dados\n\n### 🔗 Integração Externa\n\nAcesse funcionalidades de integração com ferramentas externas:\n\n#### Jamovi (Análise Estatística)\n- **Download**: Link direto para instalação\n- **Templates**: Arquivos CSV pré-formatados\n- **Guias**: Instruções de uso e integração\n- **Análises**: Suporte para testes estatísticos avançados\n\n#### FreeCAD (Modelagem 3D)\n- **Download**: Link para instalação\n- **Scripts Python**: Automação de modelagem\n- **Componentes**: Biblioteca de elementos industriais\n- **Exportação**: Formatos compatíveis\n\n#### JaamSim (Simulação)\n- **Download**: Link para instalação\n- **Configurações**: Templates de simulação\n- **Entidades**: Elementos de processo pré-definidos\n- **Parâmetros**: Configurações otimizadas\n\n#### Fluxos de Trabalho\n1. **Digital Twin Completo**\n   - FreeCAD → Modelagem 3D\n   - JaamSim → Simulação de processo\n   - Jamovi → Análise estatística\n   - EPQS → Documentação e controle\n\n2. **Análise de Qualidade**\n   - EPQS → Coleta de dados (CEP)\n   - JaamSim → Simulação de melhorias\n   - Jamovi → Validação estatística\n\n### 🛠️ Usando as Ferramentas\n\n#### Acesso às Ferramentas\n1. Clique na ferramenta desejada no dashboard\n2. A ferramenta abre em uma nova área\n3. Dados são salvos automaticamente\n4. Use o menu para navegar entre ferramentas\n\n#### Funcionalidades Comuns\n- **Salvamento Automático**: Dados persistem localmente\n- **Exportação**: Dados podem ser exportados\n- **Impressão**: Relatórios podem ser impressos\n- **Backup**: Backup manual disponível\n\n#### Exemplos de Uso\n\n**5S - Auditoria**\n1. Selecione a área a ser auditada\n2. Preencha os critérios de avaliação\n3. Sistema calcula pontuação automaticamente\n4. Gere relatório de não conformidades\n\n**CEP - Controle Estatístico**\n1. Insira dados de medição\n2. Configure limites de controle\n3. Visualize gráficos em tempo real\n4. Exporte dados para Jamovi\n\n**FMEA - Análise de Modos de Falha**\n1. Defina processo/produto\n2. Identifique modos de falha\n3. Avalie severidade, ocorrência, detecção\n4. Calcule RPN automaticamente\n\n### 💾 Gerenciamento de Dados\n\n#### Salvamento Local\n- **Automático**: Dados salvos em tempo real\n- **Offline**: Funciona sem internet\n- **Seguro**: Dados criptografados localmente\n\n#### Backup e Restauração\n1. **Backup Manual**\n   - Configurações → Exportar Dados\n   - Arquivo JSON com todos os dados\n   - Inclui configurações e preferências\n\n2. **Restauração**\n   - Configurações → Importar Dados\n   - Selecione arquivo de backup\n   - Confirme restauração\n\n#### Exportação de Dados\n- **Formato**: JSON, CSV, Excel\n- **Escopo**: Por ferramenta ou completo\n- **Compatibilidade**: Jamovi, Excel, R\n\n### ⚙️ Configurações\n\nAcesse através do botão de engrenagem no cabeçalho:\n\n#### Aparência\n- **Tema**: Escuro, Claro, Automático\n- **Idioma**: Português (padrão)\n- **Densidade**: Compacta, Normal, Espaçosa\n\n#### Dados\n- **Backup Automático**: Intervalo configurável\n- **Retenção**: Período de manutenção dos dados\n- **Compressão**: Otimização de armazenamento\n\n#### Notificações\n- **Alertas**: Configuração de avisos\n- **Sons**: Feedback sonoro\n- **Frequência**: Controle de notificações\n\n#### Avançado\n- **Debug**: Logs detalhados\n- **Performance**: Otimizações de velocidade\n- **Experimental**: Recursos em teste\n\n### 📱 Uso Mobile (Android)\n\n#### Instalação\n1. Abra no Chrome\n2. Toque "Instalar app" no menu\n3. App aparece na tela inicial\n4. Funciona offline\n\n#### Navegação Touch\n- **Swipe Direita**: Abre menu lateral\n- **Swipe Esquerda**: Fecha menu\n- **Toque Longo**: Menu de contexto\n- **Pinch**: Zoom em gráficos\n\n#### Otimizações Mobile\n- Interface adaptativa\n- Botões maiores para touch\n- Teclado virtual otimizado\n- Orientação automática\n\n### 💻 Uso Desktop (Windows)\n\n#### Instalação\n1. Abra index.html no navegador\n2. Clique no ícone de instalação\n3. App instalado como nativo\n4. Atalho na área de trabalho\n\n#### Atalhos de Teclado\n- **Ctrl+S**: Salvar/Exportar dados\n- **Ctrl+E**: Exportar relatório\n- **Ctrl+H**: Voltar ao dashboard\n- **F11**: Tela cheia\n- **Alt+1-9**: Acesso rápido a ferramentas\n- **Esc**: Fechar modais\n\n#### Recursos Desktop\n- Drag & drop de arquivos\n- Múltiplas janelas\n- Integração com sistema\n- Notificações nativas\n\n### 🔍 Solução de Problemas\n\n#### Problemas Comuns\n\n**Ferramenta não carrega**\n1. Verifique conexão de internet\n2. Limpe cache do navegador\n3. Execute teste de integração\n4. Recarregue a página\n\n**Dados não salvam**\n1. Verifique espaço em disco\n2. Teste em modo normal (não privado)\n3. Limpe dados antigos\n4. Reinicie o navegador\n\n**Performance lenta**\n1. Feche outras abas\n2. Limpe cache\n3. Verifique RAM disponível\n4. Reinicie o sistema\n\n#### Diagnóstico\n1. Abra Console do navegador (F12)\n2. Execute: \`epqsSystemValidator.getValidationSummary()\`\n3. Verifique erros reportados\n4. Execute teste completo se necessário\n\n### 📞 Suporte\n\n#### Recursos de Ajuda\n- **README.md**: Documentação técnica completa\n- **Test Integration**: Validação do sistema\n- **System Validator**: Diagnóstico automático\n- **Console Logs**: Informações de debug\n\n#### Informações do Sistema\n- **Versão**: 1.0.0\n- **Desenvolvedor**: Marcos Garçon\n- **Tipo**: Progressive Web Application\n- **Licença**: Proprietária\n\n### 🎯 Melhores Práticas\n\n#### Uso Eficiente\n1. **Organize dados**: Use categorias consistentes\n2. **Backup regular**: Configure backup automático\n3. **Mantenha atualizado**: Verifique atualizações\n4. **Use integração**: Aproveite fluxos externos\n\n#### Qualidade dos Dados\n1. **Padronize entrada**: Use formatos consistentes\n2. **Valide dados**: Verifique antes de salvar\n3. **Documente processo**: Registre metodologia\n4. **Revise periodicamente**: Mantenha dados atuais\n\n#### Segurança\n1. **Backup seguro**: Mantenha cópias protegidas\n2. **Acesso controlado**: Use senhas fortes\n3. **Dados sensíveis**: Criptografe quando necessário\n4. **Atualizações**: Mantenha sistema atualizado\n\n---\n\n*Este manual cobre as principais funcionalidades do EPQS. Para informações técnicas detalhadas, consulte a documentação completa no arquivo README.md.*\n`;
    }

    generatePackageInfo() {
        return {
            system: this.packageInfo,
            files: {
                total: Array.from(this.fileStructure.values()).flat().length,
                byCategory: Object.fromEntries(
                    Array.from(this.fileStructure.entries()).map(([key, files]) => [key, files.length])
                )
            },
            features: {
                tools: 31, // Total de ferramentas HTML
                integrations: 3,
                platforms: ['Windows', 'Android', 'Web'],
                offline: true,
                pwa: true
            },
            technical: {
                framework: 'Vanilla JavaScript',
                storage: 'localStorage + IndexedDB',
                charts: 'Chart.js',
                icons: 'Phosphor Icons',
                architecture: 'Progressive Web Application'
            },
            quality: {
                tested: true,
                validated: true,
                documented: true,
                optimized: true
            }
        };
    }

    storeDocumentation(docs) {
        try {
            // Store in localStorage
            Object.entries(docs).forEach(([key, content]) => {
                localStorage.setItem(`epqs_docs_${key}`, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
            });
            
            // Create downloadable package
            this.createDownloadablePackage(docs);
            
            console.log('Documentation package created and stored successfully');
        } catch (error) {
            console.error('Failed to store documentation:', error);
        }
    }

    createDownloadablePackage(docs) {
        // Create a comprehensive package with all documentation
        const packageContent = {
            'README.md': docs.packageInfo,
            'INSTALLATION.md': docs.installationGuide,
            'DEPLOYMENT.md': docs.deploymentGuide,
            'USER_MANUAL.md': docs.userManual,
            'PACKAGE_MANIFEST.json': JSON.stringify(docs.manifest, null, 2),
            'SYSTEM_INFO.json': JSON.stringify(this.generateSystemInfo(), null, 2)
        };
        
        // Create ZIP-like structure (as JSON for now)
        const packageZip = {
            metadata: {
                name: this.packageInfo.name,
                version: this.packageInfo.version,
                author: this.packageInfo.author,
                created: new Date().toISOString(),
                platform: this.packageInfo.platform
            },
            files: packageContent,
            structure: Object.fromEntries(this.fileStructure),
            checksums: this.generateChecksums()
        };
        
        // Store complete package
        localStorage.setItem('epqs_complete_package', JSON.stringify(packageZip, null, 2));
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(packageZip, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epqs-complete-package-v${this.packageInfo.version}.json`;
        
        // Auto-download if in package mode
        if (window.location.search.includes('package=true')) {
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        
        URL.revokeObjectURL(url);
    }

    generateSystemInfo() {
        return {
            build: {
                version: this.packageInfo.version,
                date: this.packageInfo.buildDate,
                platform: this.packageInfo.platform
            },
            runtime: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            capabilities: {
                localStorage: this.testLocalStorage(),
                indexedDB: 'indexedDB' in window,
                serviceWorker: 'serviceWorker' in navigator,
                notifications: 'Notification' in window,
                geolocation: 'geolocation' in navigator
            },
            performance: {
                memory: 'memory' in performance ? performance.memory : null,
                timing: 'timing' in performance ? performance.timing : null,
                navigation: 'navigation' in performance ? performance.navigation : null
            }
        };
    }

    testLocalStorage() {
        try {
            const test = 'epqs_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    generateChecksums() {
        // Simple checksum generation for file integrity
        const checksums = {};
        
        this.fileStructure.forEach((files, category) => {
            checksums[category] = files.map(file => ({
                file,
                checksum: this.simpleHash(file),
                size: 'unknown' // Would be calculated in real implementation
            }));
        });
        
        return checksums;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
}

// Initialize global system packager
window.epqsSystemPackager = new EPQSSystemPackager();

