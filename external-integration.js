// External Integration System for EPQS - Jamovi, FreeCAD, JaamSim
// Desenvolvido por Marcos Garçon

class EPQSExternalIntegration {
    constructor() {
        this.integrations = {
            jamovi: {
                name: 'Jamovi',
                description: 'Software estatístico gratuito baseado no R',
                version: '2.3+',
                website: 'https://jamovi.org',
                downloadUrl: 'https://jamovi.org/download.html',
                status: 'available',
                dataFormats: ['csv', 'xlsx', 'sav', 'ods'],
                capabilities: [
                    'Análises estatísticas descritivas',
                    'Testes de hipóteses',
                    'Regressão linear e logística',
                    'ANOVA e ANCOVA',
                    'Análise de confiabilidade',
                    'Gráficos estatísticos avançados'
                ],
                integrationMethods: ['export', 'import', 'api']
            },
            freecad: {
                name: 'FreeCAD',
                description: 'Software CAD 3D open source para modelagem paramétrica',
                version: '0.20+',
                website: 'https://freecad.org',
                downloadUrl: 'https://freecad.org/downloads.php',
                status: 'available',
                dataFormats: ['step', 'iges', 'stl', 'obj', 'dxf', 'svg'],
                capabilities: [
                    'Modelagem paramétrica 3D',
                    'Simulação de movimento',
                    'Análise de elementos finitos',
                    'Desenho técnico 2D',
                    'Renderização fotorrealística',
                    'Scripting em Python'
                ],
                integrationMethods: ['export', 'python_api', 'macro']
            },
            jaamsim: {
                name: 'JaamSim',
                description: 'Software open source de simulação discreta',
                version: '2023-06+',
                website: 'https://jaamsim.com',
                downloadUrl: 'https://jaamsim.com/downloads.html',
                status: 'available',
                dataFormats: ['cfg', 'csv', 'xlsx', 'txt'],
                capabilities: [
                    'Simulação de eventos discretos',
                    'Modelagem de processos produtivos',
                    'Análise de filas e gargalos',
                    'Otimização de recursos',
                    'Visualização 3D de simulações',
                    'Relatórios estatísticos'
                ],
                integrationMethods: ['export', 'config_files', 'batch_processing']
            }
        };
        
        this.workflows = new Map();
        this.exportTemplates = new Map();
        
        this.init();
    }

    init() {
        console.log('EPQS External Integration: Initializing...');
        this.setupWorkflows();
        this.setupExportTemplates();
        this.loadIntegrationSettings();
    }

    setupWorkflows() {
        // Digital Twin Workflow: FreeCAD → JaamSim → Jamovi
        this.workflows.set('digital_twin', {
            name: 'Fluxo Digital Twin',
            description: 'Modelagem 3D → Simulação → Análise Estatística',
            steps: [
                {
                    tool: 'freecad',
                    action: 'model_creation',
                    description: 'Criar modelo 3D do equipamento/layout',
                    inputs: ['dimensões', 'especificações técnicas'],
                    outputs: ['modelo 3D', 'desenhos técnicos']
                },
                {
                    tool: 'jaamsim',
                    action: 'process_simulation',
                    description: 'Simular processo produtivo',
                    inputs: ['layout 3D', 'parâmetros de processo'],
                    outputs: ['dados de simulação', 'métricas de performance']
                },
                {
                    tool: 'jamovi',
                    action: 'statistical_analysis',
                    description: 'Analisar resultados estatisticamente',
                    inputs: ['dados de simulação', 'dados reais'],
                    outputs: ['relatórios estatísticos', 'insights']
                }
            ],
            benefits: [
                'Validação virtual antes da implementação',
                'Otimização de recursos e layout',
                'Redução de custos e riscos',
                'Tomada de decisão baseada em dados'
            ]
        });

        // Quality Analysis Workflow
        this.workflows.set('quality_analysis', {
            name: 'Fluxo de Análise de Qualidade',
            description: 'CEP → Simulação → Análise Estatística',
            steps: [
                {
                    tool: 'epqs',
                    action: 'cep_analysis',
                    description: 'Análise CEP dos dados de processo',
                    inputs: ['dados de medição', 'especificações'],
                    outputs: ['gráficos de controle', 'índices de capabilidade']
                },
                {
                    tool: 'jaamsim',
                    action: 'process_optimization',
                    description: 'Simular melhorias no processo',
                    inputs: ['parâmetros atuais', 'propostas de melhoria'],
                    outputs: ['cenários simulados', 'previsões de melhoria']
                },
                {
                    tool: 'jamovi',
                    action: 'comparative_analysis',
                    description: 'Comparar cenários estatisticamente',
                    inputs: ['dados antes/depois', 'resultados simulados'],
                    outputs: ['testes de significância', 'recomendações']
                }
            ],
            benefits: [
                'Melhoria contínua baseada em evidências',
                'Validação estatística de melhorias',
                'Previsão de resultados',
                'Documentação científica'
            ]
        });

        // Process Design Workflow
        this.workflows.set('process_design', {
            name: 'Fluxo de Design de Processo',
            description: 'VSM → Modelagem 3D → Simulação → Validação',
            steps: [
                {
                    tool: 'epqs',
                    action: 'vsm_mapping',
                    description: 'Mapear estado atual e futuro',
                    inputs: ['processo atual', 'objetivos'],
                    outputs: ['VSM atual', 'VSM futuro']
                },
                {
                    tool: 'freecad',
                    action: 'layout_design',
                    description: 'Projetar novo layout',
                    inputs: ['VSM futuro', 'restrições físicas'],
                    outputs: ['layout 3D', 'plantas baixas']
                },
                {
                    tool: 'jaamsim',
                    action: 'validation_simulation',
                    description: 'Validar novo processo',
                    inputs: ['layout proposto', 'parâmetros operacionais'],
                    outputs: ['métricas de performance', 'gargalos identificados']
                },
                {
                    tool: 'jamovi',
                    action: 'roi_analysis',
                    description: 'Analisar retorno do investimento',
                    inputs: ['custos', 'benefícios projetados'],
                    outputs: ['análise de ROI', 'payback']
                }
            ],
            benefits: [
                'Design otimizado desde o início',
                'Redução de retrabalho',
                'Validação antes da implementação',
                'Justificativa financeira sólida'
            ]
        });
    }

    setupExportTemplates() {
        // Jamovi Export Templates
        this.exportTemplates.set('jamovi_cep', {
            name: 'Dados CEP para Jamovi',
            description: 'Template para análise de controle estatístico',
            format: 'csv',
            columns: [
                { name: 'sample_id', type: 'integer', description: 'ID da amostra' },
                { name: 'timestamp', type: 'datetime', description: 'Data/hora da coleta' },
                { name: 'measurement', type: 'numeric', description: 'Valor medido' },
                { name: 'operator', type: 'factor', description: 'Operador responsável' },
                { name: 'machine', type: 'factor', description: 'Máquina utilizada' },
                { name: 'shift', type: 'factor', description: 'Turno de trabalho' },
                { name: 'specification_lower', type: 'numeric', description: 'Limite inferior' },
                { name: 'specification_upper', type: 'numeric', description: 'Limite superior' }
            ],
            jamoviAnalysis: [
                'Descriptives → Descriptive Statistics',
                'T-Tests → One Sample T-Test',
                'ANOVA → One-Way ANOVA',
                'Regression → Linear Regression',
                'Factor → Reliability Analysis'
            ]
        });

        this.exportTemplates.set('jamovi_quality', {
            name: 'Dados de Qualidade para Jamovi',
            description: 'Template para análise de indicadores de qualidade',
            format: 'csv',
            columns: [
                { name: 'date', type: 'date', description: 'Data do registro' },
                { name: 'defect_type', type: 'factor', description: 'Tipo de defeito' },
                { name: 'defect_count', type: 'integer', description: 'Quantidade de defeitos' },
                { name: 'production_volume', type: 'integer', description: 'Volume produzido' },
                { name: 'defect_rate', type: 'numeric', description: 'Taxa de defeitos (%)' },
                { name: 'cost_impact', type: 'numeric', description: 'Impacto financeiro' },
                { name: 'root_cause', type: 'factor', description: 'Causa raiz identificada' }
            ],
            jamoviAnalysis: [
                'Exploration → Descriptives',
                'Frequencies → Contingency Tables',
                'T-Tests → Paired Samples T-Test',
                'ANOVA → Repeated Measures ANOVA',
                'Regression → Logistic Regression'
            ]
        });

        // FreeCAD Export Templates
        this.exportTemplates.set('freecad_layout', {
            name: 'Layout de Fábrica para FreeCAD',
            description: 'Template para modelagem de layout industrial',
            format: 'python_script',
            components: [
                'Máquinas e equipamentos',
                'Estações de trabalho',
                'Áreas de armazenamento',
                'Fluxos de material',
                'Sistemas de transporte',
                'Áreas de segurança'
            ],
            freecadWorkbenches: [
                'Part Design → Modelagem paramétrica',
                'Assembly → Montagem de componentes',
                'Draft → Desenho 2D',
                'Arch → Elementos arquitetônicos',
                'Path → Usinagem CNC'
            ]
        });

        // JaamSim Export Templates
        this.exportTemplates.set('jaamsim_process', {
            name: 'Processo Produtivo para JaamSim',
            description: 'Template para simulação de processo',
            format: 'cfg',
            entities: [
                'EntityGenerator → Geração de entidades',
                'Queue → Filas de espera',
                'Server → Estações de processamento',
                'Branch → Pontos de decisão',
                'Combine → Montagem de componentes',
                'Separate → Desmontagem',
                'EntitySink → Saída do sistema'
            ],
            parameters: [
                'Tempos de processamento',
                'Taxas de chegada',
                'Capacidades de recursos',
                'Probabilidades de falha',
                'Tempos de setup',
                'Políticas de manutenção'
            ]
        });
    }

    loadIntegrationSettings() {
        try {
            const settings = localStorage.getItem('epqs_integration_settings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                Object.assign(this.integrations, parsedSettings);
            }
        } catch (error) {
            console.error('Failed to load integration settings:', error);
        }
    }

    saveIntegrationSettings() {
        try {
            localStorage.setItem('epqs_integration_settings', JSON.stringify(this.integrations));
        } catch (error) {
            console.error('Failed to save integration settings:', error);
        }
    }

    // Create integration guide
    createIntegrationGuide() {
        const guide = document.createElement('div');
        guide.className = 'integration-guide';
        guide.innerHTML = `
            <div class="integration-header">
                <h2 style="color: var(--accent); margin: 0;">Integração com Ferramentas Externas</h2>
                <p style="color: #94a3b8; margin: 10px 0 0 0;">
                    Conecte o EPQS com Jamovi, FreeCAD e JaamSim para um fluxo completo de Digital Twin
                </p>
            </div>
            
            <div class="integration-content">
                <div class="tools-section">
                    <h3 style="color: var(--accent2); margin-bottom: 20px;">Ferramentas Integradas</h3>
                    <div class="tools-grid">
                        ${this.createToolCards()}
                    </div>
                </div>
                
                <div class="workflows-section">
                    <h3 style="color: var(--accent2); margin-bottom: 20px;">Fluxos de Trabalho</h3>
                    <div class="workflows-grid">
                        ${this.createWorkflowCards()}
                    </div>
                </div>
                
                <div class="export-section">
                    <h3 style="color: var(--accent2); margin-bottom: 20px;">Templates de Exportação</h3>
                    <div class="export-grid">
                        ${this.createExportCards()}
                    </div>
                </div>
                
                <div class="tutorial-section">
                    <h3 style="color: var(--accent2); margin-bottom: 20px;">Tutoriais e Documentação</h3>
                    <div class="tutorial-grid">
                        ${this.createTutorialCards()}
                    </div>
                </div>
            </div>
        `;

        this.addIntegrationStyles();
        return guide;
    }

    createToolCards() {
        return Object.entries(this.integrations).map(([key, tool]) => `
            <div class="tool-card" data-tool="${key}">
                <div class="tool-header">
                    <h4>${tool.name}</h4>
                    <span class="tool-status ${tool.status}">${tool.status === 'available' ? 'Disponível' : 'Indisponível'}</span>
                </div>
                <p class="tool-description">${tool.description}</p>
                <div class="tool-info">
                    <div class="tool-version">Versão: ${tool.version}</div>
                    <div class="tool-formats">
                        <strong>Formatos:</strong> ${tool.dataFormats.join(', ')}
                    </div>
                </div>
                <div class="tool-capabilities">
                    <strong>Principais recursos:</strong>
                    <ul>
                        ${tool.capabilities.slice(0, 3).map(cap => `<li>${cap}</li>`).join('')}
                    </ul>
                </div>
                <div class="tool-actions">
                    <button class="btn primary" onclick="epqsExternalIntegration.downloadTool('${key}')">
                        <i class="ph ph-download"></i> Download
                    </button>
                    <button class="btn" onclick="epqsExternalIntegration.showToolGuide('${key}')">
                        <i class="ph ph-book"></i> Guia
                    </button>
                    <button class="btn" onclick="epqsExternalIntegration.exportForTool('${key}')">
                        <i class="ph ph-export"></i> Exportar
                    </button>
                </div>
            </div>
        `).join('');
    }

    createWorkflowCards() {
        return Array.from(this.workflows.entries()).map(([key, workflow]) => `
            <div class="workflow-card" data-workflow="${key}">
                <div class="workflow-header">
                    <h4>${workflow.name}</h4>
                    <span class="workflow-steps-count">${workflow.steps.length} Etapas</span>
                </div>
                <p class="workflow-description">${workflow.description}</p>
                <div class="workflow-steps">
                    ${workflow.steps.map(step => `
                        <div class="workflow-step">
                            <div class="step-tool">${this.integrations[step.tool]?.name || step.tool.toUpperCase()}</div>
                            <div class="step-description">${step.description}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="workflow-actions">
                    <button class="btn primary" onclick="epqsExternalIntegration.startWorkflow('${key}')">
                        <i class="ph ph-play-circle"></i> Iniciar Fluxo
                    </button>
                    <button class="btn" onclick="epqsExternalIntegration.showWorkflowGuide('${key}')">
                        <i class="ph ph-book"></i> Detalhes
                    </button>
                </div>
            </div>
        `).join('');
    }

    createExportCards() {
        return Array.from(this.exportTemplates.entries()).map(([key, template]) => `
            <div class="export-card" data-template="${key}">
                <div class="export-header">
                    <h4>${template.name}</h4>
                    <span class="export-format">.${template.format.toUpperCase()}</span>
                </div>
                <p class="export-description">${template.description}</p>
                <div class="export-details">
                    <div class="export-columns">
                        <strong>Colunas:</strong> ${template.columns ? template.columns.map(col => col.name).join(', ') : 'N/A'}
                    </div>
                    <div class="export-components">
                        <strong>Componentes:</strong> ${template.components ? template.components.join(', ') : 'N/A'}
                    </div>
                </div>
                <div class="export-actions">
                    <button class="btn primary" onclick="epqsExternalIntegration.downloadTemplate('${key}')">
                        <i class="ph ph-download"></i> Baixar Template
                    </button>
                </div>
            </div>
        `).join('');
    }

    createTutorialCards() {
        const tutorials = [
            {
                title: 'Introdução ao Jamovi com EPQS',
                description: 'Guia passo a passo para suas primeiras análises estatísticas.',
                level: 'iniciante',
                duration: '15 min',
                link: 'https://www.youtube.com/watch?v=example1'
            },
            {
                title: 'Modelagem 3D no FreeCAD para Layouts Industriais',
                description: 'Crie modelos detalhados de fábricas e equipamentos.',
                level: 'intermediário',
                duration: '30 min',
                link: 'https://www.youtube.com/watch?v=example2'
            },
            {
                title: 'Simulação de Processos com JaamSim e Dados do EPQS',
                description: 'Otimize seus processos produtivos com simulações avançadas.',
                level: 'avançado',
                duration: '45 min',
                link: 'https://www.youtube.com/watch?v=example3'
            }
        ];

        return tutorials.map(tutorial => `
            <div class="tutorial-card">
                <h4>${tutorial.title}</h4>
                <p class="tutorial-description">${tutorial.description}</p>
                <div class="tutorial-meta">
                    <span class="tutorial-level ${tutorial.level}">${tutorial.level}</span>
                    <span class="tutorial-duration"><i class="ph ph-timer"></i> ${tutorial.duration}</span>
                </div>
                <div class="tutorial-actions">
                    <button class="btn primary" onclick="window.open('${tutorial.link}', '_blank')">
                        <i class="ph ph-play-circle"></i> Assistir Tutorial
                    </button>
                </div>
            </div>
        `).join('');
    }

    downloadTool(toolKey) {
        const tool = this.integrations[toolKey];
        if (tool && tool.downloadUrl) {
            window.open(tool.downloadUrl, '_blank');
            if (window.epqsApp) {
                window.epqsApp.showNotification(`Redirecionando para download de ${tool.name}...`, 'info');
            }
        } else {
            if (window.epqsApp) {
                window.epqsApp.showNotification(`Link de download não disponível para ${toolKey}`, 'error');
            }
        }
    }

    showToolGuide(toolKey) {
        const tool = this.integrations[toolKey];
        if (!tool) return;

        if (window.epqsApp) {
            window.epqsApp.showModal(
                `Guia de Integração - ${tool.name}`,
                `
                <div class="guide-content">
                    <div class="guide-section">
                        <h3 style="color: var(--accent2);">Sobre o ${tool.name}</h3>
                        <p>${tool.description}</p>
                        <p><strong>Versão recomendada:</strong> ${tool.version}</p>
                        <p><strong>Website oficial:</strong> <a href="${tool.website}" target="_blank" style="color: var(--accent);">${tool.website}</a></n>
                    </div>
                    
                    <div class="guide-section">
                        <h3 style="color: var(--accent2);">Principais Recursos</h3>
                        <ul>
                            ${tool.capabilities.map(cap => `<li>${cap}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="guide-section">
                        <h3 style="color: var(--accent2);">Formatos Suportados</h3>
                        <p>O ${tool.name} trabalha com os seguintes formatos de arquivo:</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
                            ${tool.dataFormats.map(format => `
                                <span style="
                                    background: var(--muted);
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                    font-family: monospace;
                                    font-size: 12px;
                                ">.${format}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="guide-section">
                        <h3 style="color: var(--accent2);">Métodos de Integração</h3>
                        <ul>
                            ${tool.integrationMethods.map(method => {
                                const methodNames = {
                                    'export': 'Exportação de dados',
                                    'import': 'Importação de dados',
                                    'api': 'Integração via API',
                                    'python_api': 'API Python',
                                    'macro': 'Macros e scripts',
                                    'config_files': 'Arquivos de configuração',
                                    'batch_processing': 'Processamento em lote'
                                };
                                return `<li>${methodNames[method] || method}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
                `,
                [
                    { text: `Download ${tool.name}`, class: 'primary', onclick: `epqsExternalIntegration.downloadTool('${toolKey}')` }
                ]
            );
        }
    }

    exportForTool(toolKey) {
        // Find relevant export templates for the tool
        const relevantTemplates = Array.from(this.exportTemplates.entries())
            .filter(([key, template]) => key.includes(toolKey));

        if (relevantTemplates.length === 0) {
            if (window.epqsApp) {
                window.epqsApp.showNotification(`Nenhum template de exportação disponível para ${toolKey}`, 'info');
            }
            return;
        }

        // Show export options using the global modal
        const templateOptionsHtml = templates.map(([key, template]) => `
            <div class="template-option" style="
                background: var(--card);
                border: 1px solid var(--muted);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                cursor: pointer;
            " onclick="epqsExternalIntegration.downloadTemplate('${key}'); epqsApp.hideModal();">
                <h4 style="margin: 0 0 8px 0; color: var(--accent2);">${template.name}</h4>
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">${template.description}</p>
                <div style="font-size: 12px; color: #64748b;">
                    Formato: <strong>${template.format.toUpperCase()}</strong>
                </div>
            </div>
        `).join('');

        if (window.epqsApp) {
            window.epqsApp.showModal(
                `Exportar para ${this.integrations[toolKey].name}`,
                `<div class="export-templates">${templateOptionsHtml}</div>`
            );
        }
    }

    downloadTemplate(templateKey) {
        const template = this.exportTemplates.get(templateKey);
        if (!template) return;

        let content = '';
        let filename = '';
        let mimeType = '';

        switch (template.format) {
            case 'csv':
                content = this.generateCSVTemplate(template);
                filename = `${templateKey}_template.csv`;
                mimeType = 'text/csv';
                break;
            case 'python_script':
                content = this.generatePythonTemplate(template);
                filename = `${templateKey}_template.py`;
                mimeType = 'text/x-python';
                break;
            case 'cfg':
                content = this.generateConfigTemplate(template);
                filename = `${templateKey}_template.cfg`;
                mimeType = 'text/plain';
                break;
            default:
                content = JSON.stringify(template, null, 2);
                filename = `${templateKey}_template.json`;
                mimeType = 'application/json';
        }

        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.epqsApp) {
            window.epqsApp.showNotification(`Template ${template.name} baixado!`, 'success');
        }
    }

    generateCSVTemplate(template) {
        if (!template.columns) return '';

        const headers = template.columns.map(col => col.name).join(',');
        const sampleData = template.columns.map(col => {
            switch (col.type) {
                case 'integer': return '1';
                case 'numeric': return '1.0';
                case 'datetime': return '2024-01-01 12:00:00';
                case 'date': return '2024-01-01';
                case 'factor': return 'Sample';
                default: return 'Sample';
            }
        }).join(',');

        return `${headers}\n${sampleData}\n# Template para ${template.name}\n# ${template.description}`;
    }

    generatePythonTemplate(template) {
        return `#!/usr/bin/env python3\n"""\n${template.name}\n${template.description}\n\nGerado automaticamente pelo EPQS\n"""\n\nimport FreeCAD as App\nimport FreeCADGui as Gui\nimport Part\nimport Draft\n\ndef create_layout():\n    """Criar layout de fábrica"""\n    doc = App.newDocument("Factory_Layout")\n    \n    # Adicionar componentes do layout\n    ${template.components ? template.components.map(comp => `\n    # ${comp}\n    # Adicionar código específico aqui`).join('\n    ') : ''}\n    \n    doc.recompute()\n    return doc\n\nif __name__ == "__main__":\n    layout_doc = create_layout()\n    print("Layout criado com sucesso!")\n`;
    }

    generateConfigTemplate(template) {
        return `# ${template.name}\n# ${template.description}\n# Gerado automaticamente pelo EPQS\n\nDefine ObjectType {\n    EntityGenerator\n    Queue  \n    Server\n    EntitySink\n}\n\n# Configurações do modelo\n${template.entities ? template.entities.map(entity => `\n# ${entity}\nDefine ${entity.split(' →')[0]} { Example${entity.split(' →')[0]} }`).join('\n') : ''}\n\n# Parâmetros do processo\n${template.parameters ? template.parameters.map(param => `\n# ${param}: [valor]`).join('\n') : ''}\n\n# Executar simulação\nDefine SimEntity { DefaultEntity }\nDefine View { View1 }\n`;
    }

    startWorkflow(workflowKey) {
        const workflow = this.workflows.get(workflowKey);
        if (!workflow) return;

        this.showWorkflowGuide(workflow);
    }

    showWorkflowGuide(workflow) {
        if (window.epqsApp) {
            window.epqsApp.showModal(
                `${workflow.name}`,
                `
                <p style="color: #94a3b8; margin-bottom: 30px;">${workflow.description}</p>
                
                <div class="workflow-steps-detailed">
                    ${workflow.steps.map((step, index) => `
                        <div class="workflow-step-detailed" style="
                            background: var(--card);
                            border: 1px solid var(--muted);
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 20px;
                        ">
                            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                <div style="
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    background: var(--accent);
                                    color: var(--bg);
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: bold;
                                    margin-right: 15px;
                                ">${index + 1}</div>
                                <div>
                                    <h4 style="margin: 0; color: var(--accent2);">${this.integrations[step.tool]?.name || step.tool.toUpperCase()}</h4>
                                    <div style="font-size: 14px; color: #94a3b8;">${step.description}</div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 10px;">
                                <strong>Entradas:</strong> ${step.inputs.join(', ')}
                            </div>
                            <div>
                                <strong>Saídas:</strong> ${step.outputs.join(', ')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="workflow-benefits" style="margin-top: 30px;">
                    <h3 style="color: var(--accent2);">Benefícios</h3>
                    <ul>
                        ${workflow.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
                `
            );
        }
    }

    addIntegrationStyles() {
        if (document.getElementById('integration-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'integration-styles';
        styles.textContent = `
            .integration-guide {
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .integration-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .integration-content > div {
                margin-bottom: 60px;
            }
            
            .tools-grid, .workflows-grid, .export-grid, .tutorial-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 25px;
            }
            
            .tool-card, .workflow-card, .export-card, .tutorial-card {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                padding: 25px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: var(--shadow);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .tool-card:hover, .workflow-card:hover, .export-card:hover, .tutorial-card:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-hover);
            }
            
            .tool-header, .workflow-header, .export-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .tool-header h4, .workflow-header h4, .export-header h4, .tutorial-card h4 {
                margin: 0;
                color: var(--text-strong);
                font-size: 1.2em;
            }
            
            .tool-status {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 0.8em;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .tool-status.available {
                background: rgba(34, 197, 94, 0.2);
                color: var(--ok);
            }
            
            .tool-description, .workflow-description, .export-description, .tutorial-description {
                color: #94a3b8;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .tool-info, .tool-capabilities {
                margin-bottom: 15px;
                font-size: 14px;
            }
            
            .tool-version, .tool-formats {
                margin-bottom: 8px;
            }
            
            .tool-capabilities ul, .workflow-benefits ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            
            .tool-capabilities li, .workflow-benefits li {
                margin-bottom: 4px;
                color: #cbd5e1;
            }
            
            .tool-actions, .workflow-actions, .export-actions, .tutorial-actions {
                display: flex;
                gap: 8px;
                margin-top: 15px;
            }
            
            .tool-actions .btn, .workflow-actions .btn, .export-actions .btn, .tutorial-actions .btn {
                flex: 1;
                padding: 8px 12px;
                font-size: 12px;
                text-align: center;
            }
            
            .workflow-steps {
                margin: 15px 0;
            }
            
            .workflow-step {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
            }
            
            .step-number {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--accent);
                color: var(--bg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .step-content {
                flex: 1;
            }
            
            .step-tool {
                font-weight: 600;
                color: var(--accent2);
                font-size: 12px;
                text-transform: uppercase;
            }
            
            .step-description {
                font-size: 13px;
                color: #94a3b8;
                margin-top: 2px;
            }
            
            .workflow-steps-count {
                background: var(--muted);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .export-format {
                background: var(--accent);
                color: var(--bg);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            
            .export-columns, .export-components {
                margin-bottom: 10px;
                font-size: 13px;
                color: #cbd5e1;
            }
            
            .tutorial-level {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .tutorial-level.iniciante {
                background: rgba(34, 197, 94, 0.2);
                color: var(--ok);
            }
            
            .tutorial-level.intermediário {
                background: rgba(245, 158, 11, 0.2);
                color: var(--warn);
            }
            
            .tutorial-level.avançado {
                background: rgba(239, 68, 68, 0.2);
                color: var(--bad);
            }
            
            .tutorial-meta {
                margin: 15px 0;
                display: flex;
                align-items: center;
                gap: 15px;
                font-size: 13px;
                color: #94a3b8;
            }
            
            .tutorial-duration {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            @media (max-width: 768px) {
                .tools-grid, .workflows-grid, .export-grid, .tutorial-grid {
                    grid-template-columns: 1fr;
                }
                
                .tool-actions, .workflow-actions, .export-actions, .tutorial-actions {
                    flex-direction: column;
                }
                
                .workflow-step {
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Initialize global external integration
window.epqsExternalIntegration = new EPQSExternalIntegration();

