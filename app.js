// Main Application Logic for EPQS
// Desenvolvido por Marcos Garçon

class EPQSApp {
    constructor() {
        this.currentUser = null;
        this.currentTool = 'dashboard';
        this.tools = {};
        this.isLoggedIn = false;
        this.viewHistory = [];
        this.maxHistory = 10;
        
        this.init();
    }

    init() {
        console.log('EPQS App: Initializing...');
        
        this.setupGlobalNotificationSystem();
        this.setupGlobalModals();
        this.registerServiceWorker();
        this.checkLoginStatus();
        this.setupEventListeners();
        this.loadToolsConfig();
        this.setupResponsive();
        
        console.log("EPQS App: Initialized successfully");
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registrado com sucesso:', registration);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async checkLoginStatus() {
        const savedUser = localStorage.getItem('epqs_current_user');
        const loginTime = localStorage.getItem('epqs_login_time');
        
        if (savedUser && loginTime) {
            const now = Date.now();
            const loginTimestamp = parseInt(loginTime);
            const hoursDiff = (now - loginTimestamp) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                this.showApp();
                return;
            }
        }
        
        try {
            const response = await fetch('/api/check-session');
            if (response.ok) {
                const data = await response.json();
                if (data.is_logged_in) {
                    this.currentUser = data.user;
                    this.isLoggedIn = true;
                    localStorage.setItem('epqs_current_user', JSON.stringify(this.currentUser));
                    localStorage.setItem('epqs_login_time', Date.now().toString());
                    this.showApp();
                    return;
                }
            }
        } catch (error) {
            console.warn('Backend session check failed:', error);
        }

        this.showLogin();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileOverlay = document.getElementById('mobileOverlay');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                const tool = menuItem.getAttribute('data-tool');
                if (tool) {
                    this.loadTool(tool);
                    this.closeMobileMenu();
                }
            }

            const toolCard = e.target.closest('.tool-card');
            if (toolCard) {
                const tool = toolCard.getAttribute('data-tool');
                if (tool) {
                    this.loadTool(tool);
                }
            }
        });

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        window.addEventListener('popstate', (e) => {
            const tool = e.state?.tool || 'dashboard';
            this.loadTool(tool, false);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const toolParam = urlParams.get('tool');
        if (toolParam && this.isLoggedIn) {
            this.loadTool(toolParam, false);
        }
    }

    setupResponsive() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        const checkMobile = () => {
            if (window.innerWidth <= 768) {
                if (mobileMenuBtn) mobileMenuBtn.style.display = 'block';
            } else {
                if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
                this.closeMobileMenu();
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isLoggedIn = true;
                localStorage.setItem('epqs_current_user', JSON.stringify(this.currentUser));
                localStorage.setItem('epqs_login_time', Date.now().toString());
                this.showApp();
                this.showNotification('Login realizado com sucesso!', 'success');
            } else {
                const errorData = await response.json();
                this.showNotification(`Erro de login: ${errorData.error}`, 'error');
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (username === "admin" && password === "admin123") {
                this.isLoggedIn = true;
                this.currentUser = { username: "admin" };
                localStorage.setItem('epqs_current_user', JSON.stringify(this.currentUser));
                localStorage.setItem('epqs_login_time', Date.now().toString());
                this.showApp();
                this.showNotification("Login bem-sucedido (modo offline)!", "success");
            } else {
                this.showNotification("Credenciais inválidas (modo offline).", "error");
            }
        }
    }

    async handleLogout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout failed on server:', error);
        }
        localStorage.removeItem('epqs_current_user');
        localStorage.removeItem('epqs_login_time');
        this.currentUser = null;
        this.isLoggedIn = false;
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        this.showLogin();
        this.showNotification('Logout realizado com sucesso!', 'info');
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').classList.remove('active');
    }

    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').classList.add('active');
        this.loadTool(this.currentTool || 'dashboard', false);
    }

    async loadToolsConfig() {
        try {
            const response = await fetch('/api/tools');
            if (!response.ok) throw new Error('API response not OK');
            const data = await response.json();
            this.tools = {};
            data.tools.forEach(tool => {
                this.tools[tool.file_path.replace('.html', '')] = {
                    name: tool.name,
                    description: tool.description,
                    category: tool.category,
                    icon: this.getIconForTool(tool.name)
                };
            });
            this.addStaticTools();
            this.renderSidebarMenu();
            this.renderDashboardToolCards();
        } catch (error) {
            console.error('Error fetching tools from API, loading fallback:', error);
            this.loadFallbackTools();
        }
    }

    addStaticTools() {
        this.tools['dashboard'] = { name: 'Dashboard', description: 'Painel principal do sistema', category: 'Sistema', icon: 'ph-house' };
        this.tools['reports-dashboard'] = { name: 'Dashboard de Indicadores', description: 'Relatórios e indicadores de performance', category: 'Sistema', icon: 'ph-chart-pie' };
        this.tools['external-integration'] = { name: 'Integração Externa', description: 'Integração com Jamovi, FreeCAD e JaamSim', category: 'Sistema', icon: 'ph-link' };
        this.tools['user-management'] = { name: 'Gerenciar Usuários', description: 'Criação, edição e exclusão de contas', category: 'Sistema', icon: 'ph-users' };
    }

    loadFallbackTools() {
        console.warn('Loading fallback tools configuration.');
        this.tools = {
            '5_porques': { name: '5 Porquês', description: 'Análise de causa raiz através dos 5 porquês', category: 'Análise de Problemas', icon: 'ph-question' },
            '8d': { name: 'Relatório 8D', description: 'Metodologia 8D para resolução de problemas', category: 'Análise de Problemas', icon: 'ph-clipboard-text' },
            'ishikawa': { name: 'Diagrama Ishikawa', description: 'Diagrama de causa e efeito (espinha de peixe)', category: 'Análise de Problemas', icon: 'ph-tree-structure' },
            'fmea': { name: 'FMEA', description: 'Análise de Modo e Efeito de Falha', category: 'Análise de Problemas', icon: 'ph-warning' },
            'masp': { name: 'MASP', description: 'Método de Análise e Solução de Problemas', category: 'Análise de Problemas', icon: 'ph-flow-arrow' },
            'root-cause-analysis': { name: 'Análise de Causa Raiz', description: 'RCA Avançada com 5 Porquês, Ishikawa e Timeline', category: 'Análise de Problemas', icon: 'ph-magnifying-glass' },
            '5s': { name: 'Auditoria 5S', description: 'Sistema de organização e limpeza 5S', category: 'Qualidade e Controle', icon: 'ph-broom' },
            'cep': { name: 'CEP e Capabilidade', description: 'Controle Estatístico de Processo', category: 'Qualidade e Controle', icon: 'ph-chart-line' },
            'msa': { name: 'MSA', description: 'Análise do Sistema de Medição', category: 'Qualidade e Controle', icon: 'ph-ruler' },
            'apqp': { name: 'APQP', description: 'Planejamento Avançado da Qualidade do Produto', category: 'Qualidade e Controle', icon: 'ph-calendar-check' },
            'ppap': { name: 'PPAP', description: 'Processo de Aprovação de Peça de Produção', category: 'Qualidade e Controle', icon: 'ph-certificate' },
            'gap-analysis': { name: 'Gap Analysis', description: 'Análise de Lacunas entre Estado Atual e Desejado', category: 'Qualidade e Controle', icon: 'ph-arrows-left-right' },
            'pareto': { name: 'Diagrama de Pareto', description: 'Análise de Pareto para priorização', category: 'Análise Estatística', icon: 'ph-chart-bar' },
            'histograma': { name: 'Histograma', description: 'Análise de distribuição de dados', category: 'Análise Estatística', icon: 'ph-chart-bar-horizontal' },
            'diagrama-dispersao': { name: 'Diagrama de Dispersão', description: 'Análise de correlação entre variáveis', category: 'Análise Estatística', icon: 'ph-scatter-chart' },
            'folha_verificacao': { name: 'Folha de Verificação', description: 'Coleta estruturada de dados', category: 'Análise Estatística', icon: 'ph-check-square' },
            'kaizen': { name: 'Kaizen', description: 'Melhoria contínua', category: 'Processos e Melhoria', icon: 'ph-trend-up' },
            'dmaic': { name: 'DMAIC', description: 'Metodologia DMAIC para projetos Seis Sigma', category: 'Processos e Melhoria', icon: 'ph-cycle' },
            'vsm': { name: 'VSM', description: 'Mapeamento do Fluxo de Valor', category: 'Processos e Melhoria', icon: 'ph-map-trifold' },
            'mapeamento-processos': { name: 'Mapeamento de Processos', description: 'Desenho e análise de fluxos de trabalho', category: 'Processos e Melhoria', icon: 'ph-flow-chart' },
            'cronoanalise-mtm': { name: 'Cronoanálise MTM', description: 'Estudo de tempos e movimentos', category: 'Processos e Melhoria', icon: 'ph-timer' },
            'smed': { name: 'SMED', description: 'Troca Rápida de Ferramentas', category: 'Processos e Melhoria', icon: 'ph-gear-six' },
            'planejamento': { name: 'Planejamento', description: 'Ferramentas de planejamento estratégico e tático', category: 'Gestão e Planejamento', icon: 'ph-calendar' },
            'treinamento': { name: 'Treinamento', description: 'Gestão de treinamentos e competências', category: 'Gestão e Planejamento', icon: 'ph-graduation-cap' },
            'manutencao': { name: 'Manutenção', description: 'Planejamento e Controle de Manutenção', category: 'Gestão e Planejamento', icon: 'ph-wrench' },
            'analise-swot': { name: 'Análise SWOT', description: 'Análise de Forças, Fraquezas, Oportunidades e Ameaças', category: 'Análise Estratégica', icon: 'ph-target' },
            'matriz-gut': { name: 'Matriz GUT', description: 'Priorização por Gravidade, Urgência e Tendência', category: 'Análise Estratégica', icon: 'ph-matrix-logo' },
            'matriz-esforco-impacto': { name: 'Matriz Esforço x Impacto', description: 'Priorização de ações com base em esforço e impacto', category: 'Análise Estratégica', icon: 'ph-chart-scatter' },
            'controle_injecao': { name: 'Controle de Injeção', description: 'Controle de processo de injeção plástica', category: 'Controle de Produção', icon: 'ph-factory' },
            'estamparia': { name: 'Estamparia', description: 'Controle de processo de estamparia', category: 'Controle de Produção', icon: 'ph-hammer' },
            'sucata': { name: 'Controle de Sucata', description: 'Gestão e controle de sucata na produção', category: 'Controle de Produção', icon: 'ph-trash' },
            'relatorio-a3': { name: 'Relatório A3', description: 'Relatório estruturado A3 para resolução de problemas', category: 'Relatórios', icon: 'ph-file-text' }
        };
        this.addStaticTools();
        this.renderSidebarMenu();
        this.renderDashboardToolCards();
    }

    getIconForTool(toolName) {
        const iconMap = {
            '5 Porquês': 'ph-question', 'Relatório 8D': 'ph-clipboard-text', 'Diagrama Ishikawa': 'ph-tree-structure', 'FMEA': 'ph-warning', 'MASP': 'ph-flow-arrow', 'Auditoria 5S': 'ph-broom', 'CEP e Capabilidade': 'ph-chart-line', 'MSA': 'ph-ruler', 'APQP': 'ph-calendar-check', 'PPAP': 'ph-certificate', 'Diagrama de Pareto': 'ph-chart-bar', 'Histograma': 'ph-chart-bar-horizontal', 'Diagrama de Dispersão': 'ph-scatter-chart', 'Folha de Verificação': 'ph-check-square', 'Kaizen': 'ph-trend-up', 'DMAIC': 'ph-cycle', 'VSM': 'ph-map-trifold', 'Mapeamento de Processos': 'ph-flow-chart', 'Cronoanálise MTM': 'ph-timer', 'SMED': 'ph-gear-six', 'Planejamento': 'ph-calendar', 'Treinamento': 'ph-graduation-cap', 'Manutenção': 'ph-wrench', 'Análise SWOT': 'ph-target', 'Matriz GUT': 'ph-matrix-logo', 'Matriz Esforço x Impacto': 'ph-chart-scatter', 'Controle de Injeção': 'ph-factory', 'Estamparia': 'ph-hammer', 'Controle de Sucata': 'ph-trash', 'Relatório A3': 'ph-file-text', 'Análise de Causa Raiz': 'ph-magnifying-glass', 'Gap Analysis': 'ph-arrows-left-right', 'Dashboard de Indicadores': 'ph-chart-pie', 'Integração Externa': 'ph-link', 'Gerenciar Usuários': 'ph-users'
        };
        return iconMap[toolName] || 'ph-gear';
    }

    renderSidebarMenu() {
        const sidebarMenu = document.querySelector('.sidebar .menu');
        if (!sidebarMenu) return;

        sidebarMenu.innerHTML = '';
        const categories = {};
        for (const key in this.tools) {
            const tool = this.tools[key];
            if (!categories[tool.category]) categories[tool.category] = [];
            categories[tool.category].push({ key, ...tool });
        }

        const orderedCategories = [ 'Sistema', 'Análise de Problemas', 'Qualidade e Controle', 'Análise Estatística', 'Processos e Melhoria', 'Gestão e Planejamento', 'Análise Estratégica', 'Controle de Produção', 'Relatórios' ];

        orderedCategories.forEach(categoryName => {
            if (categories[categoryName]) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'menu-category';
                categoryDiv.textContent = categoryName;
                sidebarMenu.appendChild(categoryDiv);

                categories[categoryName].sort((a, b) => a.name.localeCompare(b.name)).forEach(tool => {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item';
                    menuItem.setAttribute('data-tool', tool.key);
                    menuItem.innerHTML = `<i class="ph ${tool.icon}"></i><span>${tool.name}</span>`;
                    sidebarMenu.appendChild(menuItem);
                });
            }
        });
    }

    renderDashboardToolCards() {
        const dashboardView = document.getElementById('dashboardView');
        if (!dashboardView) return;

        let toolsGrid = dashboardView.querySelector('.tools-grid');
        if (!toolsGrid) {
            toolsGrid = document.createElement('div');
            toolsGrid.className = 'tools-grid';
            dashboardView.appendChild(toolsGrid);
        }
        toolsGrid.innerHTML = '';

        const toolKeys = Object.keys(this.tools).filter(key => !['dashboard', 'reports-dashboard', 'external-integration', 'user-management'].includes(key));

        toolKeys.sort((a, b) => this.tools[a].name.localeCompare(this.tools[b].name)).forEach(key => {
            const tool = this.tools[key];
            const toolCard = document.createElement('div');
            toolCard.className = 'tool-card';
            toolCard.setAttribute('data-tool', key);
            toolCard.innerHTML = `<h4><i class="ph ${tool.icon}"></i> ${tool.name}</h4><p>${tool.description}</p>`;
            toolsGrid.appendChild(toolCard);
        });
    }

    async loadTool(toolName, updateHistory = true) {
        console.log('Loading tool:', toolName);
        
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tool') === toolName) item.classList.add('active');
        });

        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('tool', toolName);
            history.pushState({ tool: toolName }, '', url);
        }

        this.currentTool = toolName;

        // Hide all views first
        ['dashboardView', 'reportsDashboardView', 'externalIntegrationView', 'userManagementView', 'toolIframe'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.classList.add('hidden');
        });

        // Show the correct view
        switch (toolName) {
            case 'dashboard':
                const dashboardView = document.getElementById('dashboardView');
                if (dashboardView) {
                    dashboardView.classList.remove('hidden');
                    this.renderDashboardToolCards();
                }
                break;
            case 'reports-dashboard':
                const reportsDashboardView = document.getElementById('reportsDashboardView');
                if (reportsDashboardView) {
                    reportsDashboardView.classList.remove('hidden');
                    if (window.epqsReportsDashboard) {
                        window.epqsReportsDashboard.createMainDashboard();
                    } else {
                        console.error('Reports Dashboard module not loaded');
                        this.showNotification('Módulo de Dashboard de Indicadores não carregado', 'error');
                    }
                }
                break;
            case 'external-integration':
                const externalIntegrationView = document.getElementById('externalIntegrationView');
                if (externalIntegrationView) {
                    externalIntegrationView.classList.remove('hidden');
                    if (window.epqsExternalIntegration) {
                        externalIntegrationView.innerHTML = '';
                        externalIntegrationView.appendChild(window.epqsExternalIntegration.createIntegrationGuide());
                    } else {
                        console.error('External Integration module not loaded');
                        this.showNotification('Módulo de Integração Externa não carregado', 'error');
                    }
                }
                break;
            case 'user-management':
                const userManagementView = document.getElementById('userManagementView');
                if (userManagementView) {
                    userManagementView.classList.remove('hidden');
                    if (window.userManagementUI) {
                        window.userManagementUI.render();
                    } else {
                        console.error('User Management module not loaded');
                        this.showNotification('Módulo de Gerenciamento de Usuários não carregado', 'error');
                    }
                }
                break;
            default:
                const toolFrame = document.getElementById('toolIframe');
                if (toolFrame) {
                    toolFrame.classList.remove('hidden');
                    const toolUrl = `tools/${toolName}.html`;
                    
                    // Check if tool exists in our tools list
                    if (!this.tools[toolName]) {
                        console.error(`Tool ${toolName} not found in tools list`);
                        this.showNotification(`Ferramenta ${toolName} não encontrada`, 'error');
                        this.loadTool('dashboard');
                        return;
                    }
                    
                    if (toolFrame.src.endsWith(toolUrl)) {
                        toolFrame.contentWindow.location.reload();
                    } else {
                        toolFrame.src = toolUrl;
                    }
                    
                    this.showNotification(`Carregando ${this.tools[toolName]?.name || toolName}...`, 'info', 2000);
                    
                    // Setup iframe load handlers
                    toolFrame.onload = () => {
                        console.log(`Tool ${toolName} loaded successfully`);
                        if (window.epqsToolProcessor) {
                            window.epqsToolProcessor.processToolForIntegration(toolName);
                            setTimeout(() => {
                                window.epqsToolProcessor.injectIntegrationScript(toolFrame, toolName);
                            }, 500);
                        }
                    };
                    
                    toolFrame.onerror = () => {
                        console.error(`Failed to load tool: ${toolName}`);
                        this.showNotification(`Erro ao carregar a ferramenta ${toolName}`, 'error');
                        this.loadTool('dashboard');
                    };
                }
                break;
        }
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobileOverlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    }

    async exportData() {
        try {
            if (window.epqsDataManager) {
                const success = await window.epqsDataManager.createBackup();
                if (success) this.showNotification('Dados exportados com sucesso!', 'success');
                else this.showNotification('Erro ao exportar dados', 'error');
            } else {
                // Fallback export
                const exportData = {
                    version: '1.0.0',
                    exportDate: new Date().toISOString(),
                    user: this.currentUser?.username || 'unknown',
                    data: {}
                };

                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('epqs_')) {
                        try {
                            exportData.data[key] = JSON.parse(localStorage.getItem(key));
                        } catch {
                            exportData.data[key] = localStorage.getItem(key);
                        }
                    }
                }

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `epqs-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showNotification('Dados exportados com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Erro ao exportar dados', 'error');
        }
    }

    showSettings() {
        if (window.epqsSettings) {
            window.epqsSettings.createSettingsModal();
        } else {
            this.showNotification('Sistema de configurações não disponível', 'error');
        }
    }

    setupGlobalNotificationSystem() {
        if (!document.getElementById("epqs-notification-container")) {
            const container = document.createElement("div");
            container.id = "epqs-notification-container";
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = "info", duration = 5000) {
        const container = document.getElementById("epqs-notification-container");
        if (!container) return;

        const notification = document.createElement("div");
        notification.className = `epqs-notification epqs-notification-${type}`;
        notification.style.cssText = `
            background-color: var(--${type === 'success' ? 'ok' : type === 'error' ? 'bad' : type === 'warning' ? 'warn' : 'accent'});
            color: var(--bg);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            min-width: 250px;
        `;
        notification.innerHTML = `
            <i class="ph ph-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'warning' : 'info'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = 1;
            notification.style.transform = "translateX(0)";
        }, 10);

        setTimeout(() => {
            notification.style.opacity = 0;
            notification.style.transform = "translateX(100%)";
            notification.addEventListener("transitionend", () => notification.remove());
        }, duration);
    }

    setupGlobalModals() {
        if (!document.getElementById("epqs-modal-container")) {
            const container = document.createElement("div");
            container.id = "epqs-modal-container";
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                visibility: hidden;
                opacity: 0;
                transition: visibility 0s, opacity 0.3s ease-out;
            `;
            container.onclick = (e) => { if (e.target.id === 'epqs-modal-container') this.hideModal(); };
            document.body.appendChild(container);
        }
    }

    showModal(title, content, actions = []) {
        const container = document.getElementById("epqs-modal-container");
        if (!container) return;

        const actionsHtml = actions.map(action => 
            `<button class="btn ${action.class || ''}" onclick="${action.onclick || ''};">${action.text}</button>`
        ).join('');

        container.innerHTML = `
            <div class="epqs-modal-content" style="
                background: var(--panel);
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div class="epqs-modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--muted);
                    padding-bottom: 15px;
                ">
                    <h3 style="margin: 0; color: var(--accent);">${title}</h3>
                    <button class="close-btn" onclick="window.epqsApp.hideModal()" style="
                        background: none;
                        border: none;
                        color: var(--text);
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">&times;</button>
                </div>
                <div class="epqs-modal-body" style="margin-bottom: 20px; color: var(--text);">${content}</div>
                <div class="epqs-modal-actions" style="
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                ">
                    <button class="btn" onclick="window.epqsApp.hideModal()">Fechar</button>
                    ${actionsHtml}
                </div>
            </div>
        `;
        container.style.visibility = 'visible';
        container.style.opacity = '1';
    }

    hideModal() {
        const container = document.getElementById("epqs-modal-container");
        if (container) {
            container.style.visibility = 'hidden';
            container.style.opacity = '0';
        }
    }

    showUpdateNotification() {
        this.showNotification("Nova versão disponível! Atualizando...", "info", 10000);
        setTimeout(() => window.location.reload(), 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.epqsApp = new EPQSApp();
});

// Handle app installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('App can be installed');
});
window.addEventListener('appinstalled', () => {
    console.log('App was installed');
    deferredPrompt = null;
});


