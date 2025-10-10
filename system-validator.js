window.EPQS_SystemValidator = class EPQS_SystemValidator {
    constructor(appInstance) {
        this.app = appInstance;
        this.results = {};
        this.passed = 0;
        this.failed = 0;
        this.total = 0;
        this.startTime = 0;
        this.endTime = 0;
    }

    init() {
        console.log("EPQS System Validator Initialized.");
        // No auto-run here, will be triggered manually
    }

    async runAllTests() {
        this.results = {};
        this.log("Iniciando validação completa do sistema EPQS...");

        await this.testCoreSystem();
        await this.testToolLoading();
        await this.testDataManagement();
        await this.testUserManagement();
        await this.testSpecificTools();
        await this.testPWAFeatures();
        await this.testPerformanceAndRobustness();

        this.log("Validação concluída.");
        this.displayReport();
    }

    log(message, type = 'info') {
        console.log(`[VALIDATOR][${type.toUpperCase()}] ${message}`);
        // You can also push this to a UI log if available
    }

    addResult(category, testName, status, message = '') {
        if (!this.results[category]) {
            this.results[category] = [];
        }
        this.results[category].push({ testName, status, message });
        this.log(`${testName}: ${status.toUpperCase()} - ${message}`, status);
    }

    async testCoreSystem() {
        this.log("Testando o sistema principal...");
        try {
            if (window.EPQS && window.EPQS.isLoggedIn) {
                this.addResult('Core System', 'Login State', 'success', 'Usuário logado.');
            } else {
                this.addResult('Core System', 'Login State', 'fail', 'Usuário não logado.');
            }
            if (document.getElementById('appContainer') && document.getElementById('appContainer').classList.contains('active')) {
                this.addResult('Core System', 'App Container', 'success', 'Container da aplicação ativo.');
            } else {
                this.addResult('Core System', 'App Container', 'fail', 'Container da aplicação inativo.');
            }
            this.addResult('Core System', 'Theme', 'success', `Tema atual: ${localStorage.getItem('epqs_theme') || 'auto'}`);
            
            // Test dev-server detection
            if (window.location.protocol === 'file:') {
                this.addResult('Core System', 'Protocol Check', 'warning', 'Sistema executando via protocolo file://. Recomenda-se usar um servidor web.');
            } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.addResult('Core System', 'Protocol Check', 'success', 'Sistema executando via servidor web local.');
            } else {
                this.addResult('Core System', 'Protocol Check', 'info', `Sistema executando em ${window.location.protocol}//${window.location.hostname}.`);
            }

        } catch (e) {
            this.addResult('Core System', 'Core System Check', 'error', `Erro: ${e.message}`);
        }
    }

    async testToolLoading() {
        this.log("Testando carregamento de ferramentas...");
        const toolsToTest = Object.keys(window.EPQS.tools);
        for (const toolId of toolsToTest) {
            if (['dashboard', 'reports-dashboard', 'external-integration', 'user-management'].includes(toolId)) {
                // These are internal views, not loaded in iframe
                this.addResult('Tool Loading', `Load ${toolId}`, 'info', 'Ferramenta interna, não testada via iframe.');
                continue;
            }
            try {
                // Simulate loading the tool
                window.EPQS.loadTool(toolId, false);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Give time for iframe to load
                const iframe = document.getElementById('toolIframe');
                if (iframe && iframe.src.includes(toolId) && iframe.contentWindow) {
                    this.addResult('Tool Loading', `Load ${toolId}`, 'success', `Ferramenta ${toolId} carregada com sucesso.`);
                } else {
                    this.addResult('Tool Loading', `Load ${toolId}`, 'fail', `Falha ao carregar ferramenta ${toolId}.`);
                }
            } catch (e) {
                this.addResult('Tool Loading', `Load ${toolId}`, 'error', `Erro ao carregar ${toolId}: ${e.message}`);
            }
        }
    }

    async testDataManagement() {
        this.log("Testando gerenciamento de dados...");
        try {
            const testKey = 'validator_test_data';
            const testValue = { value: 'test_value', timestamp: Date.now() };
            await window.EPQS.saveData(testKey, testValue);
            const loadedValue = await window.EPQS.loadData(testKey);

            if (JSON.stringify(loadedValue) === JSON.stringify(testValue)) {
                this.addResult('Data Management', 'Save/Load Data', 'success', 'Salvamento e carregamento de dados funcionando.');
            } else {
                this.addResult('Data Management', 'Save/Load Data', 'fail', 'Falha no salvamento e carregamento de dados.');
            }
            await window.EPQS.deleteData(testKey);
            const deletedValue = await window.EPQS.loadData(testKey);
            if (!deletedValue) {
                this.addResult('Data Management', 'Delete Data', 'success', 'Exclusão de dados funcionando.');
            } else {
                this.addResult('Data Management', 'Delete Data', 'fail', 'Falha na exclusão de dados.');
            }
        } catch (e) {
            this.addResult('Data Management', 'Data Management Check', 'error', `Erro: ${e.message}`);
        }
    }

    async testUserManagement() {
        this.log("Testando gerenciamento de usuários...");
        try {
            if (window.EPQS.UserManagement) {
                this.addResult('User Management', 'UserManagement Class', 'success', 'Classe UserManagement disponível.');
                const userManager = new window.EPQS.UserManagement();
                const initialUsersCount = userManager.getUsers().length;
                this.addResult('User Management', 'Initial Users Count', 'info', `Usuários iniciais: ${initialUsersCount}`);

                // Test creating a new user
                const testUsername = 'testuser_' + Date.now();
                const testPassword = 'TestPassword123';
                const testProfile = 'User';
                const newUser = userManager.createUser(testUsername, testPassword, testProfile);
                if (newUser && userManager.getUser(newUser.id)) {
                    this.addResult('User Management', 'Create User', 'success', `Usuário ${testUsername} criado.`);
                } else {
                    this.addResult('User Management', 'Create User', 'fail', `Falha ao criar usuário ${testUsername}.`);
                }

                // Test login with new user
                const loginSuccess = await window.EPQS.validateCredentials(testUsername, testPassword);
                if (loginSuccess) {
                    this.addResult('User Management', 'Login New User', 'success', `Login com ${testUsername} bem-sucedido.`);
                } else {
                    this.addResult('User Management', 'Login New User', 'fail', `Falha no login com ${testUsername}.`);
                }

                // Test deleting the user
                if (newUser && userManager.deleteUser(newUser.id)) {
                    this.addResult('User Management', 'Delete User', 'success', `Usuário ${testUsername} excluído.`);
                } else {
                    this.addResult('User Management', 'Delete User', 'fail', `Falha ao excluir usuário ${testUsername}.`);
                }
            } else {
                this.addResult('User Management', 'UserManagement Class', 'fail', 'Classe UserManagement não disponível.');
            }
        } catch (e) {
            this.addResult('User Management', 'User Management Check', 'error', `Erro: ${e.message}`);
        }
    }

    async testSpecificTools() {
        this.log("Testando ferramentas específicas (Mapeamento, Manutenção, SMED, Gap Analysis, RCA)...");
        const toolsToValidate = ['mapeamento-de-processos', 'manutencao', 'smed', 'gap-analysis', 'root-cause-analysis'];

        for (const toolId of toolsToValidate) {
            try {
                window.EPQS.loadTool(toolId, false);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Give more time for complex tools
                const iframe = document.getElementById('toolIframe');
                if (iframe && iframe.src.includes(toolId) && iframe.contentWindow) {
                    this.addResult('Specific Tools', `Load ${toolId}`, 'success', `Ferramenta ${toolId} carregada.`);
                    
                    // Basic check for EPQS integration within the iframe
                    const iframeEPQS = iframe.contentWindow.EPQS;
                    if (iframeEPQS && typeof iframeEPQS.saveData === 'function') {
                        this.addResult('Specific Tools', `${toolId} EPQS Integration`, 'success', `Integração EPQS em ${toolId} detectada.`);
                    } else {
                        this.addResult('Specific Tools', `${toolId} EPQS Integration`, 'fail', `Integração EPQS em ${toolId} não detectada.`);
                    }

                    // Attempt to save/load data within the tool's context
                    const testDataKey = `validator_${toolId}_test`;
                    const testDataValue = { validator: true, timestamp: Date.now() };
                    if (iframeEPQS && typeof iframeEPQS.saveData === 'function') {
                        iframeEPQS.saveData(testDataKey, testDataValue);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        const loadedData = iframeEPQS.loadData(testDataKey);
                        if (loadedData && loadedData.validator) {
                            this.addResult('Specific Tools', `${toolId} Data Save/Load`, 'success', `Salvamento/Carregamento de dados em ${toolId} funcionando.`);
                        } else {
                            this.addResult('Specific Tools', `${toolId} Data Save/Load`, 'fail', `Falha no salvamento/carregamento de dados em ${toolId}.`);
                        }
                    } else {
                        this.addResult('Specific Tools', `${toolId} Data Save/Load`, 'info', `Não foi possível testar salvamento/carregamento em ${toolId} (EPQS API não disponível).`);
                    }

                } else {
                    this.addResult('Specific Tools', `Load ${toolId}`, 'fail', `Falha ao carregar ferramenta ${toolId}.`);
                }
            } catch (e) {
                this.addResult('Specific Tools', `Load ${toolId}`, 'error', `Erro ao testar ${toolId}: ${e.message}`);
            }
        }
    }

    async testPWAFeatures() {
        this.log("Testando funcionalidades PWA...");
        try {
            if ('serviceWorker' in navigator) {
                this.addResult('PWA Features', 'Service Worker Support', 'success', 'Navegador suporta Service Worker.');
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                    this.addResult('PWA Features', 'Service Worker Active', 'success', 'Service Worker ativo.');
                } else {
                    this.addResult('PWA Features', 'Service Worker Active', 'fail', 'Service Worker não ativo.');
                }
            } else {
                this.addResult('PWA Features', 'Service Worker Support', 'fail', 'Navegador não suporta Service Worker.');
            }
            if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
                this.addResult('PWA Features', 'Installed as PWA', 'info', 'Sistema executando como PWA instalada.');
            } else {
                this.addResult('PWA Features', 'Installed as PWA', 'info', 'Sistema executando no navegador.');
            }
        } catch (e) {
            this.addResult('PWA Features', 'PWA Features Check', 'error', `Erro: ${e.message}`);
        }
    }

    async testPerformanceAndRobustness() {
        this.log("Testando performance e robustez...");
        try {
            // Simulate some heavy operations or rapid tool switching
            const startTime = performance.now();
            for (let i = 0; i < 5; i++) {
                const randomTool = Object.keys(window.EPQS.tools)[Math.floor(Math.random() * Object.keys(window.EPQS.tools).length)];
                window.EPQS.loadTool(randomTool, false);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            this.addResult('Performance', 'Rapid Tool Switching', 'success', `Troca rápida de 5 ferramentas em ${duration}ms.`);

            // Check for memory leaks (basic)
            if (performance.memory) {
                const usedJSHeapSize = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2);
                const totalJSHeapSize = (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2);
                this.addResult('Performance', 'Memory Usage', 'info', `Uso de memória JS: ${usedJSHeapSize}MB / ${totalJSHeapSize}MB.`);
            }

            // Check for console errors (requires manual inspection or more advanced setup)
            this.addResult('Robustness', 'Console Errors', 'info', 'Verificar console do navegador para erros.');

        } catch (e) {
            this.addResult('Performance & Robustness', 'Check', 'error', `Erro: ${e.message}`);
        }
    }

    displayReport() {
        const reportContainer = document.createElement('div');
        reportContainer.id = 'validationReport';
        reportContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            z-index: 99999;
            overflow-y: auto;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        reportContainer.innerHTML = `
            <h2 style="color: #22d3ee; text-align: center;">Relatório de Validação do Sistema EPQS</h2>
            <p style="text-align: center; color: #94a3b8;">Data da Validação: ${new Date().toLocaleString()}</p>
            <button onclick="document.getElementById('validationReport').remove()" 
                    style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Fechar
            </button>
            <div id="reportContent" style="margin-top: 20px;"></div>
        `;
        document.body.appendChild(reportContainer);

        const contentDiv = document.getElementById('reportContent');
        for (const category in this.results) {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.cssText = `
                background: #111827;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
                border: 1px solid #334155;
            `;
            categoryDiv.innerHTML = `<h3 style="color: #a78bfa;">${category}</h3>`;

            this.results[category].forEach(test => {
                const testDiv = document.createElement('div');
                let color = '#e5e7eb';
                if (test.status === 'success') color = '#22c55e';
                if (test.status === 'fail') color = '#ef4444';
                if (test.status === 'error') color = '#f59e0b';
                if (test.status === 'warning') color = '#f59e0b'; // Use warn color for warnings

                testDiv.innerHTML = `
                    <p style="margin: 5px 0; color: ${color};">
                        <strong>${test.testName}:</strong> ${test.status.toUpperCase()} - ${test.message}
                    </p>
                `;
                categoryDiv.appendChild(testDiv);
            });
            contentDiv.appendChild(categoryDiv);
        }
    }
}

// Expose to global scope
window.EPQS_SystemValidator = EPQS_SystemValidator;
