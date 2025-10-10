// Eng Process Quality and Statistics - Main Application
// Desenvolvido por Marcos Garçon

class EPQSApp {
    constructor() {
        this.currentUser = null;
        this.currentTool = 'dashboard';
        this.tools = {};
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        console.log('EPQS App: Initializing...');
        
        // Register service worker
        this.registerServiceWorker();
        
        // Check if user is already logged in
        this.checkLoginStatus();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load tools configuration
        this.loadToolsConfig();
        
        // Setup responsive behavior
        this.setupResponsive();
        
        console.log("EPQS App: Initialized successfully");
        // Validator will be run after tools config is loaded

    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered successfully:', registration);
                
                // Listen for updates
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

    checkLoginStatus() {
        const savedUser = localStorage.getItem('epqs_current_user');
        const loginTime = localStorage.getItem('epqs_login_time');
        
        // Check if login is still valid (24 hours)
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
        
        // Show login screen
        this.showLogin();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Menu items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.menu-item')) {
                const menuItem = e.target.closest('.menu-item');
                const tool = menuItem.getAttribute('data-tool');
                if (tool) {
                    this.loadTool(tool);
                    this.closeMobileMenu();
                }
            }
        });

        // Tool cards in dashboard
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tool-card')) {
                const toolCard = e.target.closest('.tool-card');
                const tool = toolCard.getAttribute('data-tool');
                if (tool) {
                    this.loadTool(tool);
                }
            }
        });

        // Header buttons
        const exportBtn = document.getElementById('exportBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const tool = e.state?.tool || 'dashboard';
            this.loadTool(tool, false);
        });

        // Handle URL parameters on load
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

    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (in production, this would be more secure)
        if (this.validateCredentials(username, password)) {
            this.currentUser = {
                username: username,
                loginTime: Date.now(),
                permissions: ['read', 'write', 'export']
            };
            
            // Save login state
            localStorage.setItem('epqs_current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('epqs_login_time', this.currentUser.loginTime.toString());
            
            this.isLoggedIn = true;
            this.showApp();
            
            this.showNotification('Login realizado com sucesso!', 'success');
        } else {
            this.showNotification('Credenciais inválidas. Tente novamente.', 'error');
        }
    }

    validateCredentials(username, password) {
        // Use the user management system for authentication
        if (window.userManagement) {
            const result = window.userManagement.authenticate(username, password);
            if (result.success) {
                // Store user data for the session
                this.currentUser = result.user;
                return true;
            }
            return false;
        }
        
        // Fallback to default credentials if user management is not available
        const defaultUsers = [
            { username: 'admin', password: 'admin123' },
            { username: 'user', password: 'user123' },
            { username: 'marcos', password: 'garcon123' }
        ];
        
        return defaultUsers.some(user => user.username === username && user.password === password);
    }

    handleLogout() {
        // Clear login state
        localStorage.removeItem('epqs_current_user');
        localStorage.removeItem('epqs_login_time');
        
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Reset form
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
        
        // Load dashboard by default
        this.loadTool('dashboard', false);
    }

    loadToolsConfig() {
        this.tools = {
            'dashboard': {
                name: 'Dashboard',
                description: 'Painel principal do sistema',
                category: 'Sistema',
                icon: 'ph-house'
            },
            'reports-dashboard': {
                name: 'Dashboard de Indicadores',
                description: 'Relatórios e indicadores de performance',
                category: 'Sistema',
                icon: 'ph-chart-pie'
            },
            'external-integration': {
                name: 'Integração Externa',
                description: 'Integração com Jamovi, FreeCAD e JaamSim',
                category: 'Sistema',
                icon: 'ph-link'
            },
            '5_porques': {
                name: '5 Porquês',
                description: 'Análise de causa raiz através dos 5 porquês',
                category: 'Análise de Problemas',
                icon: 'ph-question'
            },
            '8d': {
                name: 'Relatório 8D',
                description: 'Metodologia 8D para resolução de problemas',
                category: 'Análise de Problemas',
                icon: 'ph-clipboard-text'
            },
            'ishikawa': {
                name: 'Diagrama Ishikawa',
                description: 'Diagrama de causa e efeito (espinha de peixe)',
                category: 'Análise de Problemas',
                icon: 'ph-tree-structure'
            },
            'fmea': {
                name: 'FMEA',
                description: 'Análise de Modo e Efeito de Falha',
                category: 'Análise de Problemas',
                icon: 'ph-warning'
            },
            'masp': {
                name: 'MASP',
                description: 'Método de Análise e Solução de Problemas',
                category: 'Análise de Problemas',
                icon: 'ph-flow-arrow'
            },
            '5s': {
                name: 'Auditoria 5S',
                description: 'Sistema de organização e limpeza 5S',
                category: 'Qualidade e Controle',
                icon: 'ph-broom'
            },
            'cep': {
                name: 'CEP e Capabilidade',
                description: 'Controle Estatístico de Processo',
                category: 'Qualidade e Controle',
                icon: 'ph-chart-line'
            },
            'msa': {
                name: 'MSA',
                description: 'Análise do Sistema de Medição',
                category: 'Qualidade e Controle',
                icon: 'ph-ruler'
            },
            'apqp': {
                name: 'APQP',
                description: 'Planejamento Avançado da Qualidade do Produto',
                category: 'Qualidade e Controle',
                icon: 'ph-calendar-check'
            },
            'ppap': {
                name: 'PPAP',
                description: 'Processo de Aprovação de Peça de Produção',
                category: 'Qualidade e Controle',
                icon: 'ph-certificate'
            },
            'pareto': {
                name: 'Diagrama de Pareto',
                description: 'Análise de Pareto para priorização',
                category: 'Análise Estatística',
                icon: 'ph-chart-bar'
            },
            'histograma': {
                name: 'Histograma',
                description: 'Análise de distribuição de dados',
                category: 'Análise Estatística',
                icon: 'ph-chart-bar-horizontal'
            },
            'diagrama-dispersao': {
                name: 'Diagrama de Dispersão',
                description: 'Análise de correlação entre variáveis',
                category: 'Análise Estatística',
                icon: 'ph-scatter-chart'
            },
            'folha_verificacao': {
                name: 'Folha de Verificação',
                description: 'Coleta estruturada de dados',
                category: 'Análise Estatística',
                icon: 'ph-check-square'
            },
            'kaizen': {
                name: 'Kaizen',
                description: 'Melhoria contínua de processos',
                category: 'Processos e Melhoria',
                icon: 'ph-trend-up'
            },
            'dmaic': {
                name: 'DMAIC',
                description: 'Metodologia Six Sigma DMAIC',
                category: 'Processos e Melhoria',
                icon: 'ph-cycle'
            },
            'vsm': {
                name: 'VSM',
                description: 'Mapeamento do Fluxo de Valor',
                category: 'Processos e Melhoria',
                icon: 'ph-map-trifold'
            },
            'mapeamento-de-processos': {
                name: 'Mapeamento de Processos',
                description: 'Documentação e análise de processos',
                category: 'Processos e Melhoria',
                icon: 'ph-flow-arrow'
            },
            'cronoanalise': {
                name: 'Cronoanálise MTM',
                description: 'Análise de tempos e métodos',
                category: 'Processos e Melhoria',
                icon: 'ph-timer'
            },
            'smed': {
                name: 'SMED',
                description: 'Troca Rápida de Ferramentas (Single-Minute Exchange of Die)',
                category: 'Processos e Melhoria',
                icon: 'ph-timer'
            },
            'gap-analysis': {
                name: 'Gap Analysis',
                description: 'Análise de Lacunas entre Estado Atual e Desejado',
                category: 'Análise de Problemas',
                icon: 'ph-chart-line-up'
            },
            'root-cause-analysis': {
                name: 'Análise de Causa Raiz',
                description: 'RCA Avançada com 5 Porquês, Ishikawa e Timeline',
                category: 'Análise de Problemas',
                icon: 'ph-tree-structure'
            },
            'planejamento': {
                name: 'Planejamento',
                description: 'Ferramentas de planejamento estratégico',
                category: 'Gestão e Planejamento',
                icon: 'ph-calendar'
            },
            'treinamento': {
                name: 'Treinamento',
                description: 'Gestão de treinamentos e capacitação',
                category: 'Gestão e Planejamento',
                icon: 'ph-graduation-cap'
            },
            'manutencao': {
                name: 'Manutenção',
                description: 'Gestão de manutenção preventiva e corretiva',
                category: 'Gestão e Planejamento',
                icon: 'ph-wrench'
            },
            'swot': {
                name: 'Análise SWOT',
                description: 'Análise de forças, fraquezas, oportunidades e ameaças',
                category: 'Análise Estratégica',
                icon: 'ph-target'
            },
            'matriz-gut': {
                name: 'Matriz GUT',
                description: 'Priorização por Gravidade, Urgência e Tendência',
                category: 'Análise Estratégica',
                icon: 'ph-matrix-logo'
            },
            'matriz-esforco-impacto': {
                name: 'Matriz Esforço x Impacto',
                description: 'Priorização de ações por esforço e impacto',
                category: 'Análise Estratégica',
                icon: 'ph-chart-scatter'
            },
            'controle_injecao': {
                name: 'Controle de Injeção',
                description: 'Controle de processo de injeção de plásticos',
                category: 'Controle de Produção',
                icon: 'ph-factory'
            },
            'estamparia': {
                name: 'Estamparia',
                description: 'Controle de processo de estamparia',
                category: 'Controle de Produção',
                icon: 'ph-hammer'
            },
            'sucata': {
                name: 'Controle de Sucata',
                description: 'Gestão e controle de sucata e rejeitos',
                category: 'Controle de Produção',
                icon: 'ph-trash'
            },
            'relatorio-a3': {
                name: 'Relatório A3',
                description: 'Relatório estruturado em formato A3',
                category: 'Relatórios e Dashboards',
                icon: 'ph-file-text'
            },
            'DashboarddeIndicadores': {
                name: 'Dashboard de Indicadores',
                description: 'Painel de indicadores de performance',
                category: 'Relatórios e Dashboards',
                icon: 'ph-chart-pie'
            },
            'GerenciadordeDashboards': {
                name: 'Gerenciador de Dashboards',
                description: 'Gestão centralizada de dashboards',
                category: 'Relatórios e Dashboards',
                icon: 'ph-monitor'
            }
        };

        this.populateToolsGrid();


    }

    populateToolsGrid() {
        const toolsGrid = document.getElementById('toolsGrid');
        if (!toolsGrid) return;

        toolsGrid.innerHTML = '';

        Object.entries(this.tools).forEach(([key, tool]) => {
            if (key === 'dashboard' || key === 'reports-dashboard' || key === 'external-integration') return; // Skip system tools in tools grid

            const toolCard = document.createElement('div');
            toolCard.className = 'tool-card';
            toolCard.setAttribute('data-tool', key);
            
            toolCard.innerHTML = `
                <h4><i class="${tool.icon}"></i> ${tool.name}</h4>
                <p>${tool.description}</p>
                <small style="color: var(--accent); font-size: 12px;">${tool.category}</small>
            `;

            toolsGrid.appendChild(toolCard);
        });
    }

    async loadTool(toolName, updateHistory = true) {
        console.log('Loading tool:', toolName);
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tool') === toolName) {
                item.classList.add('active');
            }
        });

        // Update URL and history
        if (updateHistory) {
            const url = new URL(window.location);
            url.searchParams.set('tool', toolName);
            history.pushState({ tool: toolName }, '', url);
        }

        this.currentTool = toolName;

        if (toolName === 'dashboard') {
            this.showDashboard();
        } else if (toolName === 'reports-dashboard') {
            this.showReportsDashboard();
        } else if (toolName === 'external-integration') {
            this.showExternalIntegration();
        } else if (toolName === 'user-management') {
            this.showUserManagement();
        } else {
            await this.showTool(toolName);
        }
    }

    showDashboard() {
        const dashboard = document.getElementById('dashboard');
        const toolFrame = document.getElementById('toolFrame');

        if (dashboard) dashboard.classList.remove('hidden');
        if (toolFrame) toolFrame.classList.add('hidden');
        
        // Hide reports dashboard if visible
        const reportsDashboard = document.getElementById('reportsDashboard');
        if (reportsDashboard) reportsDashboard.classList.add('hidden');
    }

    showReportsDashboard() {
        const dashboard = document.getElementById('dashboard');
        const toolFrame = document.getElementById('toolFrame');
        let reportsDashboard = document.getElementById('reportsDashboard');

        if (dashboard) dashboard.classList.add('hidden');
        if (toolFrame) toolFrame.classList.add('hidden');

        // Hide external integration if visible
        const externalIntegration = document.getElementById('externalIntegration');
        if (externalIntegration) externalIntegration.classList.add('hidden');

        // Create reports dashboard if it doesn't exist
        if (!reportsDashboard) {
            reportsDashboard = window.epqsReportsDashboard.createMainDashboard();
            reportsDashboard.id = 'reportsDashboard';
            document.getElementById('mainContent').appendChild(reportsDashboard);
            
            // Initialize charts after a short delay
            setTimeout(() => {
                window.epqsReportsDashboard.initializeCharts();
            }, 100);
        } else {
            reportsDashboard.classList.remove('hidden');
        }
    }

    showExternalIntegration() {
        const dashboard = document.getElementById('dashboard');
        const toolFrame = document.getElementById('toolFrame');
        const reportsDashboard = document.getElementById('reportsDashboard');
        let externalIntegration = document.getElementById('externalIntegration');

        if (dashboard) dashboard.classList.add('hidden');
        if (toolFrame) toolFrame.classList.add('hidden');
        if (reportsDashboard) reportsDashboard.classList.add('hidden');

        // Create external integration if it doesn't exist
        if (!externalIntegration) {
            externalIntegration = window.epqsExternalIntegration.createIntegrationGuide();
            externalIntegration.id = 'externalIntegration';
            document.getElementById('mainContent').appendChild(externalIntegration);
        } else {
            externalIntegration.classList.remove('hidden');
        }
    }

    showUserManagement() {
        const dashboard = document.getElementById('dashboard');
        const toolFrame = document.getElementById('toolFrame');
        const reportsDashboard = document.getElementById('reportsDashboard');
        const externalIntegration = document.getElementById('externalIntegration');
        let userManagement = document.getElementById('userManagement');

        if (dashboard) dashboard.classList.add('hidden');
        if (toolFrame) toolFrame.classList.add('hidden');
        if (reportsDashboard) reportsDashboard.classList.add('hidden');
        if (externalIntegration) externalIntegration.classList.add('hidden');

        // Create user management if it doesn't exist
        if (!userManagement) {
            userManagement = document.createElement('div');
            userManagement.id = 'userManagement';
            userManagement.className = 'user-management-view';
            
            // Check if user has permission to manage users
            if (this.currentUser && this.currentUser.permissions && this.currentUser.permissions.includes('manage_users')) {
                userManagement.innerHTML = window.userManagementUI.render();
                document.getElementById('mainContent').appendChild(userManagement);
            } else {
                userManagement.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: var(--text);">
                        <i class="ph ph-lock" style="font-size: 4rem; color: var(--warn); margin-bottom: 20px;"></i>
                        <h2>Acesso Negado</h2>
                        <p>Você não tem permissão para acessar o gerenciamento de usuários.</p>
                        <p>Entre em contato com um administrador para obter acesso.</p>
                        <button class="btn btn-primary" onclick="epqsApp.loadTool('dashboard')" style="margin-top: 20px;">
                            <i class="ph ph-house"></i> Voltar ao Dashboard
                        </button>
                    </div>
                `;
                document.getElementById('mainContent').appendChild(userManagement);
            }
        } else {
            userManagement.classList.remove('hidden');
        }
    }

    async showTool(toolName) {
        const dashboard = document.getElementById('dashboard');
        const toolFrame = document.getElementById('toolFrame');
        const reportsDashboard = document.getElementById('reportsDashboard');
        const externalIntegration = document.getElementById('externalIntegration');

        if (dashboard) dashboard.classList.add('hidden');
        if (reportsDashboard) reportsDashboard.classList.add('hidden');
        if (externalIntegration) externalIntegration.classList.add('hidden');
        if (toolFrame) {
            toolFrame.classList.remove('hidden');
            
            // Load the tool HTML file
            try {
                const toolUrl = `tools/${toolName}.html`;
                toolFrame.src = toolUrl;
                
                // Show loading state
                this.showNotification(`Carregando ${this.tools[toolName]?.name || toolName}...`, 'info');
                
                // Handle iframe load
                toolFrame.onload = () => {
                    console.log(`Tool ${toolName} loaded successfully`);
                    
                    // Process tool for integration
                    if (window.epqsToolProcessor) {
                        window.epqsToolProcessor.processToolForIntegration(toolName);
                        
                        // Inject integration script after a short delay
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
                
            } catch (error) {
                console.error('Error loading tool:', error);
                this.showNotification('Erro ao carregar a ferramenta', 'error');
                this.loadTool('dashboard');
            }
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
                if (success) {
                    this.showNotification('Dados exportados com sucesso!', 'success');
                } else {
                    this.showNotification('Erro ao exportar dados', 'error');
                }
            } else {
                // Fallback to simple localStorage export
                const exportData = {
                    version: '1.0.0',
                    exportDate: new Date().toISOString(),
                    user: this.currentUser?.username || 'unknown',
                    data: {}
                };

                // Collect all EPQS data from localStorage
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

                // Create and download file
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                    type: 'application/json' 
                });
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--ok)' : type === 'error' ? 'var(--bad)' : 'var(--accent)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            font-weight: 600;
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showUpdateNotification() {
        const updateNotification = document.createElement('div');
        updateNotification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--accent);
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 1000;
            font-weight: 600;
            max-width: 300px;
        `;
        updateNotification.innerHTML = `
            <div>Nova versão disponível!</div>
            <button onclick="window.location.reload()" style="
                background: white;
                color: var(--accent);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                margin-top: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Atualizar</button>
        `;

        document.body.appendChild(updateNotification);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.epqsApp = new EPQSApp();
});

// Handle app installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or notification
    console.log('App can be installed');
});

window.addEventListener('appinstalled', () => {
    console.log('App was installed');
    deferredPrompt = null;
});
