// Reports and Dashboard System for EPQS
// Desenvolvido por Marcos Garçon

class EPQSReportsDashboard {
    constructor() {
        this.charts = new Map();
        this.reportData = new Map();
        this.dashboardConfig = {
            refreshInterval: 30000, // 30 seconds
            autoRefresh: true,
            theme: document.documentElement.getAttribute("data-theme") || 'dark'
        };
        
        this.init();
    }

    init() {
        console.log("EPQS Reports Dashboard: Initializing...");
        this.setupChartDefaults();
        this.loadSavedReports();
        
        // Setup auto-refresh if enabled
        if (this.dashboardConfig.autoRefresh) {
            this.setupAutoRefresh();
        }
    }

    setupChartDefaults() {
        // Configure Chart.js defaults for dark theme
        if (typeof Chart !== "undefined") {
            Chart.defaults.color = "#e5e7eb";
            Chart.defaults.backgroundColor = "rgba(34, 211, 238, 0.1)";
            Chart.defaults.borderColor = "#22d3ee";
            Chart.defaults.plugins.legend.labels.color = "#e5e7eb";
            Chart.defaults.scales.linear.grid.color = "rgba(255, 255, 255, 0.1)";
            Chart.defaults.scales.linear.ticks.color = "#94a3b8";
            Chart.defaults.font.family = "'Inter', sans-serif";
            Chart.defaults.font.size = 12;
        }
    }

    async loadSavedReports() {
        try {
            if (window.epqsDataManager) {
                const reportsData = await window.epqsDataManager.loadData("reports_config");
                if (reportsData && reportsData.data) {
                    this.reportData = new Map(Object.entries(reportsData.data));
                }
            }
        } catch (error) {
            console.error("Failed to load saved reports:", error);
            if (window.epqsApp) window.epqsApp.showNotification("Erro ao carregar relatórios salvos.", "error");
        }
    }

    async saveReportsConfig() {
        try {
            if (window.epqsDataManager) {
                const configData = Object.fromEntries(this.reportData);
                await window.epqsDataManager.saveData("reports_config", configData, "reports");
                if (window.epqsApp) window.epqsApp.showNotification("Configuração de relatórios salva com sucesso!", "success");
            }
        } catch (error) {
            console.error("Failed to save reports config:", error);
            if (window.epqsApp) window.epqsApp.showNotification("Erro ao salvar configuração de relatórios.", "error");
        }
    }

    setupAutoRefresh() {
        setInterval(() => {
            this.refreshAllCharts();
            if (window.epqsApp) window.epqsApp.showNotification("Dashboard atualizado automaticamente.", "info", 2000);
        }, this.dashboardConfig.refreshInterval);
    }

    // Create main dashboard
    createMainDashboard() {
        const dashboardView = document.getElementById("reportsDashboardView");
        if (!dashboardView) return;

        dashboardView.innerHTML = `
            <div class="dashboard-header">
                <h2 style="color: var(--accent); margin: 0;">Dashboard de Indicadores</h2>
                <div class="dashboard-controls">
                    <button class="btn" onclick="epqsReportsDashboard.refreshAllCharts()">
                        <i class="ph ph-arrow-clockwise"></i> Atualizar
                    </button>
                    <button class="btn" onclick="epqsReportsDashboard.showReportBuilder()">
                        <i class="ph ph-plus"></i> Novo Relatório
                    </button>
                    <button class="btn" onclick="epqsReportsDashboard.exportDashboard()">
                        <i class="ph ph-download"></i> Exportar
                    </button>
                </div>
            </div>
            
            <div class="dashboard-grid" id="dashboardGrid">
                <!-- KPI Cards -->
                <div class="kpi-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Indicadores Principais</h3>
                    <div class="kpi-grid" id="kpiGrid">
                        ${this.createKPICards()}
                    </div>
                </div>
                
                <!-- Charts Section -->
                <div class="charts-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Gráficos e Análises</h3>
                    <div class="charts-grid" id="chartsGrid">
                        ${this.createDefaultCharts()}
                    </div>
                </div>
                
                <!-- Tools Usage Section -->
                <div class="usage-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Uso das Ferramentas</h3>
                    <div class="usage-grid" id="usageGrid">
                        ${this.createUsageCharts()}
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="activity-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Atividade Recente</h3>
                    <div class="activity-list" id="activityList">
                        ${this.createActivityList()}
                    </div>
                </div>
            </div>
        `;

        // Add dashboard styles
        this.addDashboardStyles();
        
        // Initialize charts after DOM is updated
        this.initializeCharts();
    }

    createKPICards() {
        const kpis = this.calculateKPIs();
        
        return `
            <div class="kpi-card">
                <div class="kpi-value">${kpis.totalTools}</div>
                <div class="kpi-label">Ferramentas Disponíveis</div>
                <div class="kpi-trend positive">+0%</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value">${kpis.activeUsers}</div>
                <div class="kpi-label">Usuários Ativos</div>
                <div class="kpi-trend positive">+${kpis.userGrowth}%</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value">${kpis.totalReports}</div>
                <div class="kpi-label">Relatórios Gerados</div>
                <div class="kpi-trend positive">+${kpis.reportGrowth}%</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value">${kpis.dataPoints}</div>
                <div class="kpi-label">Pontos de Dados</div>
                <div class="kpi-trend positive">+${kpis.dataGrowth}%</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value">${kpis.avgSessionTime}</div>
                <div class="kpi-label">Tempo Médio de Sessão</div>
                <div class="kpi-trend neutral">~</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-value">${kpis.systemHealth}%</div>
                <div class="kpi-label">Saúde do Sistema</div>
                <div class="kpi-trend ${kpis.systemHealth >= 95 ? 'positive' : 'negative'}">${kpis.systemHealth >= 95 ? '+' : '-'}${Math.abs(100 - kpis.systemHealth)}%</div>
            </div>
        `;
    }

    createDefaultCharts() {
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Uso de Ferramentas por Categoria</h4>
                    <div class="chart-controls">
                        <select onchange="epqsReportsDashboard.updateChart('toolsUsage', this.value)">
                            <option value="7d">Últimos 7 dias</option>
                            <option value="30d">Últimos 30 dias</option>
                            <option value="90d">Últimos 90 dias</option>
                        </select>
                    </div>
                </div>
                <canvas id="toolsUsageChart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Tendência de Qualidade</h4>
                    <div class="chart-controls">
                        <button onclick="epqsReportsDashboard.toggleChartType('qualityTrend')">
                            <i class="ph ph-chart-line"></i>
                        </button>
                    </div>
                </div>
                <canvas id="qualityTrendChart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Distribuição de Problemas</h4>
                    <div class="chart-controls">
                        <button onclick="epqsReportsDashboard.refreshChart('problemsDistribution')">
                            <i class="ph ph-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <canvas id="problemsDistributionChart" width="400" height="200"></canvas>
            </div>
            
            <div class="chart-container">
                <div class="chart-header">
                    <h4>Performance de Processos</h4>
                    <div class="chart-controls">
                        <select onchange="epqsReportsDashboard.updateChart('processPerformance', this.value)">
                            <option value="efficiency">Eficiência</option>
                            <option value="quality">Qualidade</option>
                            <option value="cost">Custo</option>
                        </select>
                    </div>
                </div>
                <canvas id="processPerformanceChart" width="400" height="200"></canvas>
            </div>
        `;
    }

    createUsageCharts() {
        return `
            <div class="usage-chart-container">
                <h4>Ferramentas Mais Utilizadas</h4>
                <canvas id="topToolsChart" width="400" height="300"></canvas>
            </div>
            
            <div class="usage-chart-container">
                <h4>Horários de Maior Uso</h4>
                <canvas id="usageTimeChart" width="400" height="300"></canvas>
            </div>
        `;
    }

    createActivityList() {
        const activities = this.getRecentActivities();
        
        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="ph ph-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
                <div class="activity-status ${activity.status}">
                    ${activity.statusText}
                </div>
            </div>
        `).join("");
    }

    calculateKPIs() {
        // Calculate KPIs based on available data
        const totalTools = Object.keys(window.epqsApp?.tools || {}).length - 4; // Exclude dashboard, reports, external, user-management
        const activeUsers = this.getActiveUsersCount();
        const totalReports = this.getTotalReportsCount();
        const dataPoints = this.getTotalDataPoints();
        
        return {
            totalTools,
            activeUsers,
            userGrowth: Math.round(Math.random() * 20), // Simulated growth
            totalReports,
            reportGrowth: Math.round(Math.random() * 15),
            dataPoints,
            dataGrowth: Math.round(Math.random() * 25),
            avgSessionTime: this.getAverageSessionTime(),
            systemHealth: this.getSystemHealth()
        };
    }

    getActiveUsersCount() {
        // Count unique users from localStorage
        try {
            const users = new Set();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("epqs_") && key.includes("user")) {
                    const data = JSON.parse(localStorage.getItem(key) || "{}");
                    if (data.user) users.add(data.user);
                }
            }
            return users.size || 1;
        } catch {
            return 1;
        }
    }

    getTotalReportsCount() {
        // Count reports from localStorage
        try {
            let count = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("epqs_") && key.includes("report")) {
                    count++;
                }
            }
            return count;
        } catch {
            return 0;
        }
    }

    getTotalDataPoints() {
        // Count total data points
        try {
            let count = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("epqs_")) {
                    const data = localStorage.getItem(key);
                    if (data) count += Math.ceil(data.length / 100); // Approximate data points
                }
            }
            return count;
        } catch {
            return 0;
        }
    }

    getAverageSessionTime() {
        // Calculate average session time
        const sessions = this.getSessionData();
        if (sessions.length === 0) return "0min";
        
        const avgMinutes = sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length;
        return `${Math.round(avgMinutes)}min`;
    }

    getSystemHealth() {
        // Calculate system health based on various factors
        let health = 100;
        
        // Check localStorage usage
        try {
            const used = JSON.stringify(localStorage).length;
            const maxSize = 5 * 1024 * 1024; // 5MB estimate
            if (used > maxSize * 0.8) health -= 10;
        } catch {
            health -= 5;
        }
        
        // Check for errors in console (simulated)
        const errorRate = Math.random() * 0.05; // 0-5% error rate
        health -= errorRate * 100;
        
        return Math.max(85, Math.round(health));
    }

    getSessionData() {
        // Get session data for analysis
        try {
            const sessionData = localStorage.getItem("epqs_session_data");
            return sessionData ? JSON.parse(sessionData) : [];
        } catch {
            return [];
        }
    }

    getRecentActivities() {
        // Generate recent activities based on data
        const activities = [
            {
                icon: "chart-line",
                title: "Relatório CEP Gerado",
                description: "Análise de capabilidade do processo de injeção",
                time: "2 minutos atrás",
                status: "success",
                statusText: "Concluído"
            },
            {
                icon: "warning",
                title: "FMEA Atualizado",
                description: "Novo modo de falha identificado no processo",
                time: "15 minutos atrás",
                status: "warning",
                statusText: "Atenção"
            },
            {
                icon: "check-circle",
                title: "Auditoria 5S Concluída",
                description: "Setor de produção - Pontuação: 92%",
                time: "1 hora atrás",
                status: "success",
                statusText: "Aprovado"
            },
            {
                icon: "clock",
                title: "Cronoanálise Iniciada",
                description: "Estudo de tempos na linha de montagem",
                time: "2 horas atrás",
                status: "info",
                statusText: "Em andamento"
            },
            {
                icon: "download",
                title: "Backup Automático",
                description: "Dados salvos com sucesso",
                time: "3 horas atrás",
                status: "success",
                statusText: "Concluído"
            }
        ];
        
        return activities;
    }

    // Chart creation methods
    async initializeCharts() {
        if (typeof Chart === "undefined") {
            console.error("Chart.js not loaded");
            if (window.epqsApp) window.epqsApp.showNotification("Erro: Chart.js não carregado para o dashboard.", "error");
            return;
        }

        // Destroy existing charts before re-creating
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();

        // Tools Usage Chart
        this.createToolsUsageChart();
        
        // Quality Trend Chart
        this.createQualityTrendChart();
        
        // Problems Distribution Chart
        this.createProblemsDistributionChart();
        
        // Process Performance Chart
        this.createProcessPerformanceChart();
        
        // Top Tools Chart
        this.createTopToolsChart();
        
        // Usage Time Chart
        this.createUsageTimeChart();
    }

    createToolsUsageChart() {
        const ctx = document.getElementById("toolsUsageChart");
        if (!ctx) return;

        const data = {
            labels: ["Análise de Problemas", "Qualidade e Controle", "Análise Estatística", "Processos e Melhoria", "Gestão e Planejamento", "Análise Estratégica", "Controle de Produção", "Relatórios"],
            datasets: [{
                label: "Uso de Ferramentas",
                data: [12, 19, 3, 5, 2, 3, 7, 4],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(199, 199, 199, 0.7)",
                    "rgba(83, 102, 255, 0.7)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                    "rgba(199, 199, 199, 1)",
                    "rgba(83, 102, 255, 1)"
                ],
                borderWidth: 1
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: Chart.defaults.color
                    }
                },
                title: {
                    display: false,
                    text: "Uso de Ferramentas por Categoria"
                }
            }
        };

        this.charts.set("toolsUsage", new Chart(ctx, {
            type: "doughnut",
            data: data,
            options: options
        }));
    }

    createQualityTrendChart() {
        const ctx = document.getElementById("qualityTrendChart");
        if (!ctx) return;

        const data = {
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
            datasets: [{
                label: "Índice de Qualidade",
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1
            }, {
                label: "Meta",
                data: [70, 70, 70, 70, 70, 70, 70],
                fill: false,
                borderColor: "rgb(255, 99, 132)",
                borderDash: [5, 5],
                tension: 0.1
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: Chart.defaults.color
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                },
                x: {
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                }
            }
        };

        this.charts.set("qualityTrend", new Chart(ctx, {
            type: "line",
            data: data,
            options: options
        }));
    }

    createProblemsDistributionChart() {
        const ctx = document.getElementById("problemsDistributionChart");
        if (!ctx) return;

        const data = {
            labels: ["Mão de Obra", "Máquina", "Material", "Método", "Meio Ambiente", "Medição"],
            datasets: [{
                label: "Número de Problemas",
                data: [30, 20, 15, 10, 5, 20],
                backgroundColor: "rgba(255, 159, 64, 0.7)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: Chart.defaults.color
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                },
                x: {
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                }
            }
        };

        this.charts.set("problemsDistribution", new Chart(ctx, {
            type: "bar",
            data: data,
            options: options
        }));
    }

    createProcessPerformanceChart() {
        const ctx = document.getElementById("processPerformanceChart");
        if (!ctx) return;

        const data = {
            labels: ["Eficiência", "Qualidade", "Custo", "Tempo", "Flexibilidade"],
            datasets: [{
                label: "Processo A",
                data: [65, 59, 90, 81, 56],
                fill: true,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                pointBackgroundColor: "rgba(255, 99, 132, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(255, 99, 132, 1)"
            }, {
                label: "Processo B",
                data: [28, 48, 40, 19, 96],
                fill: true,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                pointBackgroundColor: "rgba(54, 162, 235, 1)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgba(54, 162, 235, 1)"
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: Chart.defaults.color
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    pointLabels: {
                        color: Chart.defaults.scales.linear.ticks.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color,
                        backdropColor: "transparent"
                    }
                }
            }
        };

        this.charts.set("processPerformance", new Chart(ctx, {
            type: "radar",
            data: data,
            options: options
        }));
    }

    createTopToolsChart() {
        const ctx = document.getElementById("topToolsChart");
        if (!ctx) return;

        const data = {
            labels: ["5 Porquês", "CEP", "FMEA", "Kaizen", "Pareto"],
            datasets: [{
                label: "Usos",
                data: [50, 45, 40, 35, 30],
                backgroundColor: "rgba(153, 102, 255, 0.7)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1
            }]
        };

        const options = {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                },
                y: {
                    grid: {
                        color: Chart.defaults.scales.linear.grid.color
                    },
                    ticks: {
                        color: Chart.defaults.scales.linear.ticks.color
                    }
                }
            }
        };

        this.charts.set("topTools", new Chart(ctx, {
            type: "bar",
            data: data,
            options: options
        }));
    }

    createUsageTimeChart() {
        const ctx = document.getElementById("usageTimeChart");
        if (!ctx) return;

        const data = {
            labels: ["0-6h", "6-12h", "12-18h", "18-24h"],
            datasets: [{
                label: "Sessões",
                data: [5, 25, 40, 30],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)"
                ],
                borderWidth: 1
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: Chart.defaults.color
                    }
                }
            }
        };

        this.charts.set("usageTime", new Chart(ctx, {
            type: "pie",
            data: data,
            options: options
        }));
    }

    refreshAllCharts() {
        this.charts.forEach(chart => chart.update());
        // Re-render KPI cards and activity list as well
        const kpiGrid = document.getElementById("kpiGrid");
        if (kpiGrid) kpiGrid.innerHTML = this.createKPICards();
        const activityList = document.getElementById("activityList");
        if (activityList) activityList.innerHTML = this.createActivityList();
    }

    updateChart(chartKey, value) {
        const chart = this.charts.get(chartKey);
        if (!chart) return;

        // Simulate data update based on value (e.g., 7d, 30d, 90d for toolsUsage)
        if (chartKey === "toolsUsage") {
            const newData = this.getToolsUsageData(value);
            chart.data.datasets[0].data = newData;
        } else if (chartKey === "processPerformance") {
            const newData = this.getProcessPerformanceData(value);
            chart.data.datasets[0].data = newData.dataA;
            chart.data.datasets[1].data = newData.dataB;
        }
        chart.update();
        if (window.epqsApp) window.epqsApp.showNotification(`Gráfico '${chartKey}' atualizado para '${value}'.`, "info", 2000);
    }

    toggleChartType(chartKey) {
        const chart = this.charts.get(chartKey);
        if (!chart) return;

        if (chartKey === "qualityTrend") {
            const newType = chart.config.type === "line" ? "bar" : "line";
            chart.config.type = newType;
            chart.update();
            if (window.epqsApp) window.epqsApp.showNotification(`Tipo de gráfico '${chartKey}' alterado para '${newType}'.`, "info", 2000);
        }
    }

    refreshChart(chartKey) {
        const chart = this.charts.get(chartKey);
        if (!chart) return;

        // Simulate data refresh
        if (chartKey === "problemsDistribution") {
            chart.data.datasets[0].data = [Math.random() * 40, Math.random() * 30, Math.random() * 20, Math.random() * 15, Math.random() * 10, Math.random() * 25].map(Math.round);
        }
        chart.update();
        if (window.epqsApp) window.epqsApp.showNotification(`Gráfico '${chartKey}' atualizado.`, "info", 2000);
    }

    getToolsUsageData(period) {
        // Simulated data based on period
        switch (period) {
            case "7d": return [15, 22, 5, 8, 3, 5, 10, 6];
            case "30d": return [40, 55, 15, 20, 10, 12, 25, 18];
            case "90d": return [120, 150, 45, 60, 30, 35, 70, 50];
            default: return [12, 19, 3, 5, 2, 3, 7, 4];
        }
    }

    getProcessPerformanceData(metric) {
        // Simulated data based on metric
        switch (metric) {
            case "efficiency": return { dataA: [70, 65, 80, 75, 60], dataB: [30, 50, 60, 40, 70] };
            case "quality": return { dataA: [60, 70, 85, 70, 65], dataB: [40, 60, 50, 30, 80] };
            case "cost": return { dataA: [80, 75, 60, 90, 70], dataB: [50, 40, 70, 60, 90] };
            default: return { dataA: [65, 59, 90, 81, 56], dataB: [28, 48, 40, 19, 96] };
        }
    }

    showReportBuilder() {
        if (window.epqsApp) {
            window.epqsApp.showModal(
                "Construtor de Relatórios",
                `
                <p>Aqui você pode criar novos relatórios personalizados.</p>
                <div style="margin-top: 20px;">
                    <label for="reportName" style="display: block; margin-bottom: 5px; color: var(--text-strong);">Nome do Relatório:</label>
                    <input type="text" id="reportName" placeholder="Ex: Relatório Mensal de Qualidade" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--input-bg);
                        color: var(--text);
                    ">
                </div>
                <div style="margin-top: 15px;">
                    <label for="reportType" style="display: block; margin-bottom: 5px; color: var(--text-strong);">Tipo de Relatório:</label>
                    <select id="reportType" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--input-bg);
                        color: var(--text);
                    ">
                        <option value="summary">Sumário Executivo</option>
                        <option value="detailed">Detalhado</option>
                        <option value="trend">Análise de Tendência</option>
                    </select>
                </div>
                <div style="margin-top: 15px;">
                    <label for="reportDataSources" style="display: block; margin-bottom: 5px; color: var(--text-strong);">Fontes de Dados:</label>
                    <textarea id="reportDataSources" placeholder="Ex: Dados de CEP, FMEA, 5S" rows="3" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--input-bg);
                        color: var(--text);
                        resize: vertical;
                    "></textarea>
                </div>
                `,
                [
                    { text: "Criar Relatório", class: "primary", onclick: "epqsReportsDashboard.createCustomReport()" }
                ]
            );
        }
    }

    createCustomReport() {
        const reportName = document.getElementById("reportName").value;
        const reportType = document.getElementById("reportType").value;
        const reportDataSources = document.getElementById("reportDataSources").value;

        if (!reportName) {
            if (window.epqsApp) window.epqsApp.showNotification("Por favor, insira um nome para o relatório.", "warning");
            return;
        }

        const newReport = {
            id: `report_${Date.now()}`,
            name: reportName,
            type: reportType,
            dataSources: reportDataSources.split(",").map(s => s.trim()),
            createdAt: new Date().toISOString(),
            createdBy: window.epqsApp?.currentUser?.username || "anonymous"
        };

        this.reportData.set(newReport.id, newReport);
        this.saveReportsConfig();
        if (window.epqsApp) window.epqsApp.showNotification(`Relatório '${reportName}' criado com sucesso!`, "success");
        if (window.epqsApp) window.epqsApp.hideModal();
        this.createMainDashboard(); // Re-render dashboard to show new report if applicable
    }

    exportDashboard() {
        if (window.epqsApp) {
            window.epqsApp.showModal(
                "Exportar Dashboard",
                `
                <p>Selecione o formato para exportar o dashboard de indicadores.</p>
                <div style="margin-top: 20px;">
                    <label for="exportFormat" style="display: block; margin-bottom: 5px; color: var(--text-strong);">Formato:</label>
                    <select id="exportFormat" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--input-bg);
                        color: var(--text);
                    ">
                        <option value="pdf">PDF</option>
                        <option value="png">PNG (Imagens dos Gráficos)</option>
                        <option value="csv">CSV (Dados dos KPIs)</option>
                    </select>
                </div>
                `,
                [
                    { text: "Exportar", class: "primary", onclick: "epqsReportsDashboard.performExport()" }
                ]
            );
        }
    }

    async performExport() {
        const format = document.getElementById("exportFormat").value;
        if (window.epqsApp) window.epqsApp.hideModal();

        if (format === "pdf") {
            if (window.epqsApp) window.epqsApp.showNotification("Gerando PDF do dashboard...", "info");
            await this.exportToPdf();
        } else if (format === "png") {
            if (window.epqsApp) window.epqsApp.showNotification("Gerando imagens PNG dos gráficos...", "info");
            await this.exportChartsToPng();
        } else if (format === "csv") {
            if (window.epqsApp) window.epqsApp.showNotification("Exportando dados dos KPIs para CSV...", "info");
            this.exportKpisToCsv();
        }
    }

    async exportToPdf() {
        if (typeof html2pdf === "undefined") {
            console.error("html2pdf.js not loaded");
            if (window.epqsApp) window.epqsApp.showNotification("Erro: Biblioteca html2pdf.js não carregada.", "error");
            return;
        }

        const element = document.getElementById("reportsDashboardView");
        if (!element) {
            if (window.epqsApp) window.epqsApp.showNotification("Erro: Elemento do dashboard não encontrado para exportação.", "error");
            return;
        }

        const opt = {
            margin: 1,
            filename: `epqs_dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            if (window.epqsApp) window.epqsApp.showNotification("Dashboard exportado para PDF com sucesso!", "success");
        } catch (error) {
            console.error("Erro ao exportar dashboard para PDF:", error);
            if (window.epqsApp) window.epqsApp.showNotification("Erro ao exportar dashboard para PDF.", "error");
        }
    }

    async exportChartsToPng() {
        const chartCanvases = document.querySelectorAll("#chartsGrid canvas, #usageGrid canvas");
        if (chartCanvases.length === 0) {
            if (window.epqsApp) window.epqsApp.showNotification("Nenhum gráfico encontrado para exportar.", "warning");
            return;
        }

        for (const canvas of chartCanvases) {
            try {
                const chartName = canvas.id.replace("Chart", "");
                const imageUrl = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = imageUrl;
                a.download = `epqs_chart_${chartName}_${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } catch (error) {
                console.error("Erro ao exportar gráfico para PNG:", error);
                if (window.epqsApp) window.epqsApp.showNotification(`Erro ao exportar gráfico ${canvas.id} para PNG.`, "error");
            }
        }
        if (window.epqsApp) window.epqsApp.showNotification("Gráficos exportados para PNG com sucesso!", "success");
    }

    exportKpisToCsv() {
        const kpis = this.calculateKPIs();
        let csvContent = "KPI,Value\n";
        for (const key in kpis) {
            csvContent += `${key},${kpis[key]}\n`;
        }

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `epqs_kpis_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (window.epqsApp) window.epqsApp.showNotification("Dados dos KPIs exportados para CSV com sucesso!", "success");
    }

    addDashboardStyles() {
        if (document.getElementById("dashboard-styles")) return;

        const styles = document.createElement("style");
        styles.id = "dashboard-styles";
        styles.textContent = `
            .dashboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .dashboard-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 30px;
            }
            
            @media (min-width: 768px) {
                .dashboard-grid {
                    grid-template-columns: 2fr 1fr; /* Main content and sidebar-like section */
                }
                .kpi-section { grid-column: 1 / 3; } /* Span full width */
                .charts-section { grid-column: 1 / 2; } /* Left column */
                .usage-section { grid-column: 2 / 3; } /* Right column */
                .activity-section { grid-column: 1 / 3; } /* Span full width */
            }

            .kpi-section, .charts-section, .usage-section, .activity-section {
                background: var(--panel);
                border-radius: var(--radius);
                padding: 25px;
                box-shadow: var(--shadow);
            }

            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
            }

            .kpi-card {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
                text-align: center;
                box-shadow: var(--shadow-sm);
            }

            .kpi-value {
                font-size: 2.2em;
                font-weight: 700;
                color: var(--accent);
                margin-bottom: 5px;
            }

            .kpi-label {
                font-size: 0.9em;
                color: var(--text-light);
                margin-bottom: 10px;
            }

            .kpi-trend {
                font-size: 0.8em;
                font-weight: 600;
            }

            .kpi-trend.positive { color: var(--ok); }
            .kpi-trend.negative { color: var(--bad); }
            .kpi-trend.neutral { color: var(--warn); }

            .charts-grid, .usage-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 20px;
            }

            @media (min-width: 1024px) {
                .charts-grid {
                    grid-template-columns: 1fr 1fr;
                }
            }

            .chart-container, .usage-chart-container {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 20px;
                box-shadow: var(--shadow-sm);
            }

            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }

            .chart-header h4 {
                margin: 0;
                color: var(--text-strong);
            }

            .chart-controls select, .chart-controls button {
                background: var(--input-bg);
                border: 1px solid var(--border);
                color: var(--text);
                padding: 5px 10px;
                border-radius: 6px;
                cursor: pointer;
            }

            .activity-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .activity-item {
                display: flex;
                align-items: center;
                gap: 15px;
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 15px;
                box-shadow: var(--shadow-sm);
            }

            .activity-icon {
                font-size: 1.8em;
                color: var(--accent);
                flex-shrink: 0;
            }

            .activity-content {
                flex-grow: 1;
            }

            .activity-title {
                font-weight: 600;
                color: var(--text-strong);
                margin-bottom: 2px;
            }

            .activity-description {
                font-size: 0.9em;
                color: var(--text-light);
            }

            .activity-time {
                font-size: 0.8em;
                color: var(--text-light);
                margin-top: 5px;
            }

            .activity-status {
                padding: 5px 10px;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: 600;
                text-transform: uppercase;
                flex-shrink: 0;
            }

            .activity-status.success { background: rgba(34, 197, 94, 0.2); color: var(--ok); }
            .activity-status.warning { background: rgba(245, 158, 11, 0.2); color: var(--warn); }
            .activity-status.info { background: rgba(59, 130, 246, 0.2); color: var(--accent); }
            .activity-status.error { background: rgba(239, 68, 68, 0.2); color: var(--bad); }

            /* Modal Styles (from app.js, ensure consistency) */
            .epqs-modal-container {
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
            }
            .epqs-modal-container.active {
                visibility: visible;
                opacity: 1;
            }
            .epqs-modal-content {
                background: var(--panel);
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                transform: translateY(-20px);
                opacity: 0;
                transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            }
            .epqs-modal-container.active .epqs-modal-content {
                transform: translateY(0);
                opacity: 1;
            }
            .epqs-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }
            .epqs-modal-body {
                color: var(--text);
                line-height: 1.6;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize global reports dashboard
window.epqsReportsDashboard = new EPQSReportsDashboard();

