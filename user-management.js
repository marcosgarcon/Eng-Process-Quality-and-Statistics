<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CEP e Análise de Capabilidade</title>
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/css/phosphor.css">

    <style>
        :root {
            --bg: #0f172a;
            --panel: #1e293b;
            --muted: #334155;
            --card: #0b1220;
            --text: #e5e7eb;
            --accent: #22d3ee;
            --accent2: #a78bfa;
            --ok: #22c55e;
            --warn: #f59e0b;
            --bad: #ef4444;
            --shadow: 0 10px 30px rgba(0,0,0,.35);
            --radius: 12px;
        }

        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }

        .container {
            max-width: 1400px;
            margin: auto;
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--muted);
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            color: var(--accent);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .header-actions button {
            background: var(--muted);
            color: var(--text);
            border: 1px solid #243041;
            border-radius: 8px;
            padding: 10px 15px;
            cursor: pointer;
            transition: 0.2s;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .header-actions button:hover {
            border-color: var(--accent);
            transform: translateY(-1px);
        }

        .header-actions button.primary {
            background: linear-gradient(180deg, #0ea5e9, #2563eb);
            border-color: transparent;
        }
        
        .header-actions button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .card {
            background-color: var(--panel);
            border-radius: var(--radius);
            padding: 20px;
            border: 1px solid var(--muted);
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .tab-button {
            padding: 10px 20px;
            cursor: pointer;
            background: none;
            border: 1px solid var(--muted);
            color: var(--text);
            border-radius: 8px;
            font-weight: 600;
        }
        
        .tab-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .tab-button.active {
            background-color: var(--accent);
            color: var(--bg);
            border-color: var(--accent);
        }
        
        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.5s; }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-group { display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 8px; font-size: 14px; color: #93c5fd; }
        .form-group input, .form-group select {
            width: 100%;
            background: #0b1220;
            border: 1px solid #243041;
            color: var(--text);
            padding: 10px;
            border-radius: 8px;
            outline: none;
            box-sizing: border-box;
        }
        .form-group input:focus, .form-group select:focus {
            border-color: var(--accent);
        }
        
        #data-input-grid {
            display: grid;
            gap: 8px;
            margin-top: 15px;
            max-height: 400px;
            overflow-y: auto;
            padding: 10px;
            background: #0b1220;
            border-radius: 8px;
        }
        #data-input-grid input { text-align: center; padding: 8px; }

        .data-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
        }

        .results-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .stat-card {
            background: #0b1220;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid var(--muted);
            text-align: center;
        }

        .stat-card h4 {
            margin: 0 0 5px 0;
            font-size: 14px;
            color: var(--accent2);
            font-weight: 600;
            text-transform: uppercase;
        }

        .stat-card p {
            margin: 0;
            font-size: 22px;
            font-weight: bold;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            width: 100%;
            margin-top: 20px;
        }
        
        .interpretation-box {
            background: #0b1220;
            border: 1px solid var(--muted);
            padding: 15px;
            margin-top: 20px;
            border-radius: 8px;
            line-height: 1.6;
        }
        .interpretation-box h3 { margin: 0 0 10px 0; color: var(--accent); }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
        }
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        .modal-content {
            background-color: var(--panel);
            padding: 30px;
            border-radius: var(--radius);
            border: 1px solid var(--muted);
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .modal-header h2 { margin: 0; color: var(--accent); }
        .modal-close-btn { background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer; }
        .saved-analysis-list { list-style: none; padding: 0; margin: 0; }
        .saved-analysis-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #0b1220;
            border: 1px solid var(--muted);
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .saved-analysis-item:hover { border-color: var(--accent2); }
        .analysis-name { font-weight: bold; }
        .analysis-date { font-size: 12px; color: #94a3b8; }
        .analysis-actions button {
            background: var(--muted);
            color: var(--text);
            border: 1px solid #243041;
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            margin-left: 10px;
        }
         .analysis-actions button.btn-danger { background: var(--bad); color: var(--text); }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1><i class="ph ph-chart-line-up"></i> CEP e Análise de Capabilidade</h1>
        <div class="header-actions">
            <button id="new-analysis-btn" title="Limpar tudo e começar uma nova análise"><i class="ph ph-file-plus"></i> Nova Análise</button>
            <button id="save-analysis-btn" title="Salvar estudo atual no navegador"><i class="ph ph-floppy-disk"></i> Salvar Análise</button>
            <button id="load-analysis-btn" title="Carregar um estudo salvo"><i class="ph ph-folder-open"></i> Carregar Análise</button>
            <button id="export-pdf-btn" class="primary" title="Exportar um relatório completo em PDF" disabled><i class="ph ph-file-pdf"></i> Exportar Relatório PDF</button>
        </div>
    </div>

    <div id="report-content">
        <div class="card">
            <div class="tabs">
                <button class="tab-button active" data-tab="data-input">1. Entrada de Dados</button>
                <button class="tab-button" data-tab="control-charts" disabled>2. Gráficos de Controle</button>
                <button class="tab-button" data-tab="capability" disabled>3. Análise de Capabilidade</button>
                <button class="tab-button" data-tab="histogram" disabled>4. Histograma</button>
            </div>

            <div id="data-input-tab" class="tab-content active">
                <form id="params-form">
                    <h3>Parâmetros do Processo</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="process-name">Nome do Processo/Peça</label>
                            <input type="text" id="process-name" placeholder="Ex: Diâmetro do Eixo AB-123">
                        </div>
                        <div class="form-group">
                            <label for="spec-lower">Limite de Espec. Inferior (LIE)</label>
                            <input type="number" step="any" id="spec-lower" placeholder="Ex: 9.8">
                        </div>
                        <div class="form-group">
                            <label for="spec-upper">Limite de Espec. Superior (LSE)</label>
                            <input type="number" step="any" id="spec-upper" placeholder="Ex: 10.2">
                        </div>
                        <div class="form-group">
                            <label for="target-value">Valor Alvo (Opcional)</label>
                            <input type="number" step="any" id="target-value" placeholder="Ex: 10.0">
                        </div>
                    </div>

                    <h3>Configuração da Amostragem</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="num-subgroups">Número de Subgrupos</label>
                            <input type="number" id="num-subgroups" value="25" min="2" max="100">
                        </div>
                        <div class="form-group">
                            <label for="subgroup-size">Tamanho do Subgrupo (n)</label>
                            <input type="number" id="subgroup-size" value="5" min="1" max="25">
                        </div>
                        <div class="form-group">
                            <label for="chart-type">Tipo de Gráfico</label>
                            <select id="chart-type">
                                <option value="xbar-r" selected>X-barra R (Variáveis, n >= 2)</option>
                                <option value="i-mr">I-AM (Individual, n = 1)</option>
                            </select>
                        </div>
                    </div>
                </form>

                <div id="data-input-container">
                    <p>Insira as medições abaixo (use Enter para pular para o próximo campo), cole de uma planilha ou importe de um arquivo CSV.</p>
                    <div id="data-input-grid"></div>
                </div>

                <div class="data-actions">
                    <button id="process-data-btn" class="primary"><i class="ph ph-calculator"></i> Processar Dados</button>
                    <button id="import-csv-btn"><i class="ph ph-file-csv"></i> Importar CSV</button>
                    <input type="file" id="csv-file-input" style="display: none;" accept=".csv, text/csv">
                </div>
            </div>

            <div id="control-charts-tab" class="tab-content">
                <h3>Gráficos de Controle</h3>
                <div class="chart-container"><canvas id="xBarChart"></canvas></div>
                <div class="chart-container"><canvas id="rChart"></canvas></div>
                <div class="interpretation-box">
                    <h3><i class="ph ph-magnifying-glass"></i> Interpretação dos Gráficos</h3>
                    <p id="chart-interpretation">Aguardando processamento...</p>
                </div>
            </div>

            <div id="capability-tab" class="tab-content">
                <h3>Análise de Capabilidade do Processo</h3>
                <div class="results-dashboard" id="capability-dashboard"></div>
                <div class="interpretation-box">
                    <h3><i class="ph ph-magnifying-glass"></i> Interpretação da Capabilidade</h3>
                    <p id="capability-interpretation">Aguardando processamento...</p>
                </div>
            </div>

            <div id="histogram-tab" class="tab-content">
                <h3>Histograma de Frequência</h3>
                <div class="chart-container"><canvas id="histogramChart"></canvas></div>
                <div class="interpretation-box">
                    <h3><i class="ph ph-magnifying-glass"></i> Interpretação do Histograma</h3>
                    <p id="histogram-interpretation">Aguardando processamento...</p>
                </div>
            </div>
        </div>

        <div class="card" id="results-card" style="display: none;">
             <h2><i class="ph ph-gauge"></i> Dashboard de Resultados</h2>
            <div class="results-dashboard" id="main-results-dashboard">
                <div class="stat-card"><h4>Status do Processo</h4><p id="process-status">-</p></div>
                <div class="stat-card"><h4>Média Geral (X&#773;&#773;)</h4><p id="grand-average">-</p></div>
                <div class="stat-card"><h4>Amplitude Média (R&#773;)</h4><p id="average-range">-</p></div>
                <div class="stat-card"><h4>Desvio Padrão (σ)</h4><p id="std-dev">-</p></div>
                <div class="stat-card"><h4>Cp</h4><p id="cp-index">-</p></div>
                <div class="stat-card"><h4>Cpk</h4><p id="cpk-index">-</p></div>
                <div class="stat-card"><h4>Pp</h4><p id="pp-index">-</p></div>
                <div class="stat-card"><h4>Ppk</h4><p id="ppk-index">-</p></div>
            </div>
        </div>
    </div>
</div>

<div id="load-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h2><i class="ph ph-folder-open"></i> Histórico de Análises</h2>
            <button id="modal-close-btn" class="modal-close-btn"><i class="ph ph-x"></i></button>
        </div>
        <div id="saved-analyses-container">
            <ul id="saved-analysis-list" class="saved-analysis-list"></ul>
        </div>
    </div>
</div>

<script>
// Motor de Lógica e Cálculos para a Ferramenta de CEP
const spcEngine = {
    controlChartConstants: {
        2: { A2: 1.880, D3: 0, D4: 3.267, d2: 1.128 }, 3: { A2: 1.023, D3: 0, D4: 2.574, d2: 1.693 },
        4: { A2: 0.729, D3: 0, D4: 2.282, d2: 2.059 }, 5: { A2: 0.577, D3: 0, D4: 2.114, d2: 2.326 },
        6: { A2: 0.483, D3: 0, D4: 2.004, d2: 2.534 }, 7: { A2: 0.419, D3: 0.076, D4: 1.924, d2: 2.704 },
        8: { A2: 0.373, D3: 0.136, D4: 1.864, d2: 2.847 }, 9: { A2: 0.337, D3: 0.184, D4: 1.816, d2: 2.970 },
        10: { A2: 0.308, D3: 0.223, D4: 1.777, d2: 3.078 }, 11: { A2: 0.285, D3: 0.256, D4: 1.744, d2: 3.173 },
        12: { A2: 0.266, D3: 0.283, D4: 1.717, d2: 3.258 }, 13: { A2: 0.249, D3: 0.307, D4: 1.693, d2: 3.336 },
        14: { A2: 0.235, D3: 0.328, D4: 1.672, d2: 3.407 }, 15: { A2: 0.223, D3: 0.347, D4: 1.653, d2: 3.472 },
        16: { A2: 0.212, D3: 0.363, D4: 1.637, d2: 3.532 }, 17: { A2: 0.203, D3: 0.378, D4: 1.622, d2: 3.588 },
        18: { A2: 0.194, D3: 0.391, D4: 1.609, d2: 3.640 }, 19: { A2: 0.187, D3: 0.403, D4: 1.597, d2: 3.689 },
        20: { A2: 0.180, D3: 0.415, D4: 1.585, d2: 3.735 }, 21: { A2: 0.173, D3: 0.425, D4: 1.575, d2: 3.778 },
        22: { A2: 0.167, D3: 0.434, D4: 1.566, d2: 3.819 }, 23: { A2: 0.162, D3: 0.443, D4: 1.557, d2: 3.858 },
        24: { A2: 0.157, D3: 0.451, D4: 1.549, d2: 3.895 }, 25: { A2: 0.153, D3: 0.459, D4: 1.541, d2: 3.931 },
    },
    calculate(data, n, chartType, specs) {
        if (chartType === 'xbar-r') return this.calculateXbarR(data, n, specs);
        return null;
    },
    calculateXbarR(data, n, specs) {
        const { lse, lie } = specs;
        const constants = this.controlChartConstants[n];
        if (!constants) return { error: `Constantes para n=${n} não disponíveis.` };

        const subgroupAverages = data.map(sg => sg.reduce((a, b) => a + b, 0) / n);
        const subgroupRanges = data.map(sg => Math.max(...sg) - Math.min(...sg));
        const allReadings = data.flat();

        const grandAverage = subgroupAverages.reduce((a, b) => a + b, 0) / subgroupAverages.length;
        const averageRange = subgroupRanges.reduce((a, b) => a + b, 0) / subgroupRanges.length;

        const xBarUCL = grandAverage + (constants.A2 * averageRange);
        const xBarLCL = grandAverage - (constants.A2 * averageRange);
        const rUCL = constants.D4 * averageRange;
        const rLCL = constants.D3 * averageRange;
        
        const stdDevWithin = averageRange / constants.d2;
        const overallStdDev = allReadings.length > 1 ? Math.sqrt(allReadings.reduce((s, v) => s + Math.pow(v - grandAverage, 2), 0) / (allReadings.length - 1)) : 0;

        let cp = null, cpk = null, pp = null, ppk = null;
        if (lse !== null && lie !== null) {
            if (stdDevWithin > 0) {
                cp = (lse - lie) / (6 * stdDevWithin);
                cpk = Math.min((lse - grandAverage) / (3 * stdDevWithin), (grandAverage - lie) / (3 * stdDevWithin));
            }
            if (overallStdDev > 0) {
                pp = (lse - lie) / (6 * overallStdDev);
                ppk = Math.min((lse - grandAverage) / (3 * overallStdDev), (grandAverage - lie) / (3 * overallStdDev));
            }
        }
        return {
            grandAverage, averageRange, stdDevWithin, overallStdDev,
            subgroupAverages, subgroupRanges, allReadings,
            xBar: { ucl: xBarUCL, lcl: xBarLCL, centerLine: grandAverage },
            r: { ucl: rUCL, lcl: rLCL, centerLine: averageRange },
            capability: { cp, cpk, pp, ppk }
        };
    }
};

class CEPToolUI {
    constructor() {
        this.charts = {};
        this.results = null;
        this.storageKey = 'cepAnalyses_v1';
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.updateGrid();
    }

    bindEvents() {
        document.querySelectorAll('.tab-button').forEach(btn => btn.addEventListener('click', () => this.switchTab(btn.dataset.tab)));
        document.getElementById('num-subgroups').addEventListener('change', () => this.updateGrid());
        document.getElementById('subgroup-size').addEventListener('change', () => this.updateGrid());
        document.getElementById('process-data-btn').addEventListener('click', () => this.processData());
        document.getElementById('import-csv-btn').addEventListener('click', () => document.getElementById('csv-file-input').click());
        document.getElementById('csv-file-input').addEventListener('change', e => this.handleCSVImport(e));
        document.getElementById('new-analysis-btn').addEventListener('click', () => this.clearData());
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportToPDF());
        
        const dataGrid = document.getElementById('data-input-grid');
        dataGrid.addEventListener('paste', e => this.handlePaste(e));
        dataGrid.addEventListener('keydown', e => this.handleGridNavigation(e));

        document.getElementById('save-analysis-btn').addEventListener('click', () => this.saveAnalysis());
        document.getElementById('load-analysis-btn').addEventListener('click', () => this.showLoadModal());
        document.getElementById('modal-close-btn').addEventListener('click', () => this.hideLoadModal());
        document.getElementById('load-modal').addEventListener('click', e => {
            if (e.target.id === 'load-modal') this.hideLoadModal();
        });
    }

    switchTab(tabId) {
        if (document.querySelector(`.tab-button[data-tab="${tabId}"]`).disabled) return;
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    updateGrid() {
        const numSubgroups = parseInt(document.getElementById('num-subgroups').value) || 25;
        const subgroupSize = parseInt(document.getElementById('subgroup-size').value) || 5;
        const grid = document.getElementById('data-input-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${subgroupSize}, 1fr)`;
        for (let i = 0; i < numSubgroups * subgroupSize; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.placeholder = `-`;
            grid.appendChild(input);
        }
    }
    
    collectData(raw = false) {
        const numSubgroups = parseInt(document.getElementById('num-subgroups').value);
        const subgroupSize = parseInt(document.getElementById('subgroup-size').value);
        const data = [];
        const inputs = Array.from(document.querySelectorAll('#data-input-grid input'));
        for (let i = 0; i < numSubgroups; i++) {
            const subgroup = [];
            let hasValue = false;
            for (let j = 0; j < subgroupSize; j++) {
                const input = inputs[i * subgroupSize + j];
                const value = input.value;
                if (value !== '') {
                    subgroup.push(parseFloat(value));
                    hasValue = true;
                } else {
                    subgroup.push(raw ? null : '');
                }
            }
            if (raw || (hasValue && !subgroup.includes(''))) {
                data.push(subgroup);
            }
        }
        return data;
    }
    
    processData() {
        const data = this.collectData();
        if (data.length < 2) {
            alert('Por favor, insira dados para pelo menos 2 subgrupos completos.');
            return;
        }

        const subgroupSize = parseInt(document.getElementById('subgroup-size').value);
        const chartType = document.getElementById('chart-type').value;
        const specs = {
            lse: document.getElementById('spec-upper').value !== '' ? parseFloat(document.getElementById('spec-upper').value) : null,
            lie: document.getElementById('spec-lower').value !== '' ? parseFloat(document.getElementById('spec-lower').value) : null,
        };

        this.results = spcEngine.calculate(data, subgroupSize, chartType, specs);
        
        if (!this.results || this.results.error) {
            alert(`Erro ao processar: ${this.results?.error || 'Verifique os dados e parâmetros.'}`);
            return;
        }
        
        this.updateAllUI();
        document.getElementById('export-pdf-btn').disabled = false;
        document.querySelectorAll('.tab-button').forEach(btn => btn.disabled = false);
        document.getElementById('results-card').style.display = 'block';
        this.switchTab('control-charts');
        this.showNotification('Dados processados com sucesso!', 'success');
    }

    updateAllUI() {
        if (!this.results) return;
        this.updateDashboard();
        this.renderCharts();
        this.updateInterpretations();
    }
    
    updateDashboard() {
        const { grandAverage, averageRange, stdDevWithin, capability } = this.results;
        document.getElementById('grand-average').textContent = grandAverage.toFixed(4);
        document.getElementById('average-range').textContent = averageRange.toFixed(4);
        document.getElementById('std-dev').textContent = stdDevWithin.toFixed(4);
        document.getElementById('cp-index').textContent = capability.cp?.toFixed(2) || '-';
        document.getElementById('cpk-index').textContent = capability.cpk?.toFixed(2) || '-';
        document.getElementById('pp-index').textContent = capability.pp?.toFixed(2) || '-';
        document.getElementById('ppk-index').textContent = capability.ppk?.toFixed(2) || '-';
    }

    renderCharts() {
        if (!this.results) return;
        const { subgroupAverages, subgroupRanges, xBar, r } = this.results;
        const labels = Array.from({ length: subgroupAverages.length }, (_, i) => `Subg. ${i + 1}`);

        if (this.charts.xBar) this.charts.xBar.destroy();
        if (this.charts.r) this.charts.r.destroy();

        const xBarCtx = document.getElementById('xBarChart').getContext('2d');
        this.charts.xBar = new Chart(xBarCtx, this.getChartConfig('Médias (X-barra)', labels, subgroupAverages, xBar));
        
        const rCtx = document.getElementById('rChart').getContext('2d');
        this.charts.r = new Chart(rCtx, this.getChartConfig('Amplitudes (R)', labels, subgroupRanges, r));
    }

    getChartConfig(title, labels, data, limits) {
        return {
            type: 'line', data: { labels, datasets: [{ label: title, data, borderColor: 'var(--accent)', borderWidth: 2, pointRadius: 4, pointBackgroundColor: 'var(--accent)' }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: `Gráfico de ${title}`, color: 'var(--text)', font: { size: 16 } },
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                    annotation: {
                        annotations: {
                            ucl: { type: 'line', yMin: limits.ucl, yMax: limits.ucl, borderColor: 'var(--bad)', borderWidth: 2, label: { content: `LSC = ${limits.ucl.toFixed(3)}`, enabled: true, position: 'end', color: 'var(--bad)', backgroundColor: 'rgba(15, 23, 42, 0.7)' } },
                            lcl: { type: 'line', yMin: limits.lcl, yMax: limits.lcl, borderColor: 'var(--bad)', borderWidth: 2, label: { content: `LIC = ${limits.lcl.toFixed(3)}`, enabled: true, position: 'end', color: 'var(--bad)', backgroundColor: 'rgba(15, 23, 42, 0.7)' } },
                            center: { type: 'line', yMin: limits.centerLine, yMax: limits.centerLine, borderColor: 'var(--ok)', borderWidth: 2, borderDash: [6, 6], label: { content: `LC = ${limits.centerLine.toFixed(3)}`, enabled: true, position: 'end', color: 'var(--ok)', backgroundColor: 'rgba(15, 23, 42, 0.7)' } }
                        }
                    }
                },
                scales: { x: { ticks: { color: 'var(--text)' }, grid: { color: 'var(--muted)' } }, y: { ticks: { color: 'var(--text)' }, grid: { color: 'var(--muted)' } } }
            }
        };
    }

    updateInterpretations() {
        if (!this.results) return;
        const { subgroupAverages, subgroupRanges, xBar, r } = this.results;
        
        const xBarOutOfControl = subgroupAverages.some(p => p > xBar.ucl || p < xBar.lcl);
        const rOutOfControl = subgroupRanges.some(p => p > r.ucl || p < r.lcl);
        
        let interpretation = '';
        if (xBarOutOfControl || rOutOfControl) {
            interpretation = 'O processo está FORA DE CONTROLE estatístico. Causas especiais podem estar atuando. Ações corretivas são necessárias antes de avaliar a capabilidade.';
            document.getElementById('process-status').innerHTML = `<span style="color: var(--bad);">Instável</span>`;
        } else {
            interpretation = 'O processo está SOB CONTROLE estatístico. Não há evidências de causas especiais. A análise de capabilidade pode ser realizada.';
            document.getElementById('process-status').innerHTML = `<span style="color: var(--ok);">Estável</span>`;
        }
        document.getElementById('chart-interpretation').textContent = interpretation;
    }
    
    handleGridNavigation(event) {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        
        const currentInput = event.target;
        const allInputs = Array.from(document.querySelectorAll('#data-input-grid input'));
        const currentIndex = allInputs.indexOf(currentInput);
        
        if (currentIndex > -1 && currentIndex < allInputs.length - 1) {
            const nextInput = allInputs[currentIndex + 1];
            nextInput.focus();
            nextInput.select();
        }
    }
    
    handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            complete: (results) => this.fillGridWithData(results.data),
            error: (err) => alert(`Erro ao ler o arquivo CSV: ${err.message}`)
        });
        event.target.value = '';
    }
    
    fillGridWithData(data) {
        const flatData = data.flat().map(cell => typeof cell === 'string' ? cell.trim().replace(',', '.') : cell).filter(cell => cell !== '');
        const inputs = document.querySelectorAll('#data-input-grid input');
        
        inputs.forEach((input, i) => {
            input.value = (i < flatData.length) ? flatData[i] : '';
        });
        this.showNotification('Dados importados com sucesso!', 'success');
    }

    handlePaste(event) {
        event.preventDefault();
        const pasteData = (event.clipboardData || window.clipboardData).getData('text');
        this.fillGridWithData(pasteData.split(/\s+/).map(line => line.split('\t')));
        this.showNotification('Dados colados com sucesso!', 'success');
    }

    clearData() {
        if (!confirm('Tem certeza que deseja limpar todos os dados para uma nova análise?')) return;
        
        document.getElementById('params-form').reset();
        this.updateGrid();
        
        this.results = null;
        if (this.charts.xBar) this.charts.xBar.destroy();
        if (this.charts.r) this.charts.r.destroy();
        
        document.getElementById('results-card').style.display = 'none';
        document.querySelectorAll('.results-dashboard p').forEach(p => p.textContent = '-');
        document.getElementById('process-status').innerHTML = '-';
        document.querySelectorAll('.interpretation-box p').forEach(p => p.textContent = 'Aguardando processamento...');
        
        document.getElementById('export-pdf-btn').disabled = true;
        document.querySelectorAll('.tab-button').forEach((btn, index) => { 
            if (index > 0) btn.disabled = true;
            btn.classList.remove('active');
        });
        document.querySelector('.tab-button[data-tab="data-input"]').classList.add('active');
        this.switchTab('data-input');
        
        this.showNotification('Pronto para uma nova análise.', 'info');
    }
    
    async exportToPDF() {
        // Implementação do exportToPDF
    }

    getCurrentState() {
        return {
            processName: document.getElementById('process-name').value,
            specLower: document.getElementById('spec-lower').value,
            specUpper: document.getElementById('spec-upper').value,
            targetValue: document.getElementById('target-value').value,
            numSubgroups: document.getElementById('num-subgroups').value,
            subgroupSize: document.getElementById('subgroup-size').value,
            chartType: document.getElementById('chart-type').value,
            data: this.collectData(true),
            savedAt: new Date().toISOString()
        };
    }

    saveAnalysis() {
        const processName = document.getElementById('process-name').value;
        if (!processName) {
            alert("Por favor, dê um nome ao processo/peça antes de salvar.");
            return;
        }

        const newName = prompt("Salvar análise como:", processName);
        if (!newName) return;

        const analyses = this.getSavedAnalyses();
        if (analyses.some(a => a.name === newName)) {
            if (!confirm(`Uma análise com o nome "${newName}" já existe. Deseja sobrescrevê-la?`)) {
                return;
            }
        }
        
        const state = this.getCurrentState();
        const saveData = { name: newName, ...state };
        
        const otherAnalyses = analyses.filter(a => a.name !== newName);
        localStorage.setItem(this.storageKey, JSON.stringify([saveData, ...otherAnalyses]));
        
        this.showNotification(`Análise "${newName}" salva com sucesso!`, 'success');
    }

    getSavedAnalyses() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]').sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));
    }

    showLoadModal() {
        const analyses = this.getSavedAnalyses();
        const listEl = document.getElementById('saved-analysis-list');
        listEl.innerHTML = '';

        if (analyses.length === 0) {
            listEl.innerHTML = '<p>Nenhuma análise salva encontrada.</p>';
        } else {
            analyses.forEach(analysis => {
                const item = document.createElement('li');
                item.className = 'saved-analysis-item';
                item.innerHTML = `
                    <div>
                        <div class="analysis-name">${analysis.name}</div>
                        <div class="analysis-date">Salvo em: ${new Date(analysis.savedAt).toLocaleString('pt-BR')}</div>
                    </div>
                    <div class="analysis-actions">
                        <button data-action="load" data-name="${analysis.name}" title="Carregar"><i class="ph ph-folder-notch-open"></i></button>
                        <button data-action="rename" data-name="${analysis.name}" title="Renomear"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-danger" data-action="delete" data-name="${analysis.name}" title="Excluir"><i class="ph ph-trash"></i></button>
                    </div>`;
                listEl.appendChild(item);
            });
        }
        
        listEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const name = e.currentTarget.dataset.name;
                e.stopPropagation();
                if (action === 'load') this.loadAnalysis(name);
                if (action === 'rename') this.renameAnalysis(name);
                if (action === 'delete') this.deleteAnalysis(name);
            });
        });
        
        document.getElementById('load-modal').classList.add('active');
    }

    hideLoadModal() {
        document.getElementById('load-modal').classList.remove('active');
    }

    loadAnalysis(name) {
        const analyses = this.getSavedAnalyses();
        const analysisToLoad = analyses.find(a => a.name === name);
        if (!analysisToLoad) return alert('Análise não encontrada.');

        document.getElementById('process-name').value = analysisToLoad.processName || analysisToLoad.name;
        document.getElementById('spec-lower').value = analysisToLoad.specLower || '';
        document.getElementById('spec-upper').value = analysisToLoad.specUpper || '';
        document.getElementById('target-value').value = analysisToLoad.targetValue || '';
        document.getElementById('num-subgroups').value = analysisToLoad.numSubgroups || 25;
        document.getElementById('subgroup-size').value = analysisToLoad.subgroupSize || 5;
        document.getElementById('chart-type').value = analysisToLoad.chartType || 'xbar-r';

        this.updateGrid();
        const inputs = document.querySelectorAll('#data-input-grid input');
        const flatData = (analysisToLoad.data || []).flat();
        inputs.forEach((input, i) => { input.value = flatData[i] !== null && flatData[i] !== undefined ? flatData[i] : ''; });

        this.hideLoadModal();
        this.processData();
        this.showNotification(`Análise "${name}" carregada.`, 'info');
    }

    renameAnalysis(oldName) {
        const newName = prompt(`Renomear análise "${oldName}" para:`, oldName);
        if (!newName || newName === oldName) return;
        
        let analyses = this.getSavedAnalyses();
        if (analyses.some(a => a.name === newName)) return alert(`Uma análise com o nome "${newName}" já existe.`);
        
        const analysisIndex = analyses.findIndex(a => a.name === oldName);
        if (analysisIndex > -1) {
            analyses[analysisIndex].name = newName;
            localStorage.setItem(this.storageKey, JSON.stringify(analyses));
            this.showLoadModal();
        }
    }

    deleteAnalysis(name) {
        if (!confirm(`Tem certeza que deseja excluir a análise "${name}"?`)) return;
        let analyses = this.getSavedAnalyses();
        const updatedAnalyses = analyses.filter(a => a.name !== name);
        localStorage.setItem(this.storageKey, JSON.stringify(updatedAnalyses));
        this.showLoadModal();
    }
    
    showNotification(message, type = "info") {
        if (window.parent && window.parent.epqsApp && typeof window.parent.epqsApp.showNotification === 'function') {
            window.parent.epqsApp.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CEPToolUI();
});
</script>

</body>
</html>
