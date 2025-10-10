// Settings Manager for EPQS
// Desenvolvido por Marcos Garçon

class EPQSSettings {
    constructor() {
        this.defaultSettings = {
            // Appearance
            theme: 'dark', // 'dark', 'light', 'auto'
            language: 'pt-BR',
            fontSize: 'medium', // 'small', 'medium', 'large'
            
            // Data Management
            autoSave: true,
            autoBackup: true,
            backupInterval: 24, // hours
            maxBackups: 10,
            
            // Notifications
            showNotifications: true,
            notificationDuration: 3000, // milliseconds
            
            // Tools
            defaultTool: 'dashboard',
            showToolTips: true,
            confirmBeforeDelete: true,
            
            // Export/Import
            exportFormat: 'json', // 'json', 'csv', 'pdf'
            includeMetadata: true,
            
            // Performance
            enableOfflineMode: true,
            cacheTools: true,
            preloadTools: false,
            
            // Security
            sessionTimeout: 24, // hours
            requirePasswordChange: false,
            
            // Integration
            jamovi: {
                enabled: false,
                path: '',
                autoExport: false
            },
            freecad: {
                enabled: false,
                path: '',
                autoExport: false
            },
            jaamsim: {
                enabled: false,
                path: '',
                autoExport: false
            }
        };
        
        this.currentSettings = {};
        this.settingsKey = 'epqs_settings';
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.applySettings();
        console.log('EPQS Settings: Initialized');
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.settingsKey);
            if (savedSettings) {
                this.currentSettings = { ...this.defaultSettings, ...JSON.parse(savedSettings) };
            } else {
                this.currentSettings = { ...this.defaultSettings };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.currentSettings));
            this.applySettings();
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    applySettings() {
        // Apply theme
        this.applyTheme();
        
        // Apply font size
        this.applyFontSize();
        
        // Apply language
        this.applyLanguage();
        
        // Setup auto-backup if enabled
        if (this.currentSettings.autoBackup && window.epqsDataManager) {
            window.epqsDataManager.setupAutoBackup(this.currentSettings.backupInterval);
        }
    }

    applyTheme() {
        const theme = this.currentSettings.theme;
        const root = document.documentElement;
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setThemeColors(prefersDark ? 'dark' : 'light');
        } else {
            this.setThemeColors(theme);
        }
    }

    setThemeColors(theme) {
        const root = document.documentElement;
        
        if (theme === 'light') {
            root.style.setProperty('--bg', '#f8fafc');
            root.style.setProperty('--panel', '#ffffff');
            root.style.setProperty('--muted', '#e2e8f0');
            root.style.setProperty('--card', '#ffffff');
            root.style.setProperty('--text', '#1e293b');
            root.style.setProperty('--accent', '#0ea5e9');
            root.style.setProperty('--accent2', '#8b5cf6');
        } else {
            // Dark theme (default)
            root.style.setProperty('--bg', '#0f172a');
            root.style.setProperty('--panel', '#111827');
            root.style.setProperty('--muted', '#1f2937');
            root.style.setProperty('--card', '#0b1220');
            root.style.setProperty('--text', '#e5e7eb');
            root.style.setProperty('--accent', '#22d3ee');
            root.style.setProperty('--accent2', '#a78bfa');
        }
    }

    applyFontSize() {
        const fontSize = this.currentSettings.fontSize;
        const root = document.documentElement;
        
        switch (fontSize) {
            case 'small':
                root.style.setProperty('--base-font-size', '13px');
                break;
            case 'large':
                root.style.setProperty('--base-font-size', '16px');
                break;
            default: // medium
                root.style.setProperty('--base-font-size', '14px');
        }
    }

    applyLanguage() {
        // Language application would go here
        // For now, we'll just store the preference
        document.documentElement.lang = this.currentSettings.language;
    }

    // Getter methods
    get(key) {
        return this.currentSettings[key];
    }

    getAll() {
        return { ...this.currentSettings };
    }

    // Setter methods
    set(key, value) {
        this.currentSettings[key] = value;
        return this.saveSettings();
    }

    setMultiple(settings) {
        Object.assign(this.currentSettings, settings);
        return this.saveSettings();
    }

    // Reset to defaults
    reset() {
        this.currentSettings = { ...this.defaultSettings };
        return this.saveSettings();
    }

    resetSection(section) {
        if (this.defaultSettings[section]) {
            this.currentSettings[section] = { ...this.defaultSettings[section] };
            return this.saveSettings();
        }
        return false;
    }

    // Export/Import settings
    export() {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            settings: this.currentSettings
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epqs-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    if (importData.settings) {
                        this.currentSettings = { ...this.defaultSettings, ...importData.settings };
                        this.saveSettings();
                        resolve(true);
                    } else {
                        reject(new Error('Invalid settings file'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Settings validation
    validate(settings) {
        const errors = [];
        
        // Validate theme
        if (settings.theme && !['dark', 'light', 'auto'].includes(settings.theme)) {
            errors.push('Invalid theme value');
        }
        
        // Validate language
        if (settings.language && typeof settings.language !== 'string') {
            errors.push('Invalid language value');
        }
        
        // Validate fontSize
        if (settings.fontSize && !['small', 'medium', 'large'].includes(settings.fontSize)) {
            errors.push('Invalid fontSize value');
        }
        
        // Validate numeric values
        const numericFields = ['backupInterval', 'maxBackups', 'notificationDuration', 'sessionTimeout'];
        numericFields.forEach(field => {
            if (settings[field] !== undefined && (typeof settings[field] !== 'number' || settings[field] < 0)) {
                errors.push(`Invalid ${field} value`);
            }
        });
        
        return errors;
    }

    // Create settings UI
    createSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const content = document.createElement('div');
        content.className = 'settings-content';
        content.style.cssText = `
            background: var(--panel);
            border: 1px solid var(--muted);
            border-radius: var(--radius);
            padding: 30px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow);
        `;

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: var(--accent);">Configurações</h2>
                <button class="close-btn" style="background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            
            <div class="settings-sections">
                <div class="settings-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Aparência</h3>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #93c5fd;">Tema</label>
                        <select id="theme-select" style="width: 100%; padding: 8px; background: var(--card); border: 1px solid var(--muted); border-radius: 8px; color: var(--text);">
                            <option value="dark">Escuro</option>
                            <option value="light">Claro</option>
                            <option value="auto">Automático</option>
                        </select>
                    </div>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #93c5fd;">Tamanho da Fonte</label>
                        <select id="fontSize-select" style="width: 100%; padding: 8px; background: var(--card); border: 1px solid var(--muted); border-radius: 8px; color: var(--text);">
                            <option value="small">Pequena</option>
                            <option value="medium">Média</option>
                            <option value="large">Grande</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Dados</h3>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; color: #93c5fd;">
                            <input type="checkbox" id="autoSave-check" style="margin-right: 8px;">
                            Salvamento Automático
                        </label>
                    </div>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; color: #93c5fd;">
                            <input type="checkbox" id="autoBackup-check" style="margin-right: 8px;">
                            Backup Automático
                        </label>
                    </div>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #93c5fd;">Intervalo de Backup (horas)</label>
                        <input type="number" id="backupInterval-input" min="1" max="168" style="width: 100%; padding: 8px; background: var(--card); border: 1px solid var(--muted); border-radius: 8px; color: var(--text);">
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 style="color: var(--accent2); margin-bottom: 15px;">Notificações</h3>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; color: #93c5fd;">
                            <input type="checkbox" id="showNotifications-check" style="margin-right: 8px;">
                            Mostrar Notificações
                        </label>
                    </div>
                    
                    <div class="setting-item" style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: #93c5fd;">Duração da Notificação (ms)</label>
                        <input type="number" id="notificationDuration-input" min="1000" max="10000" step="500" style="width: 100%; padding: 8px; background: var(--card); border: 1px solid var(--muted); border-radius: 8px; color: var(--text);">
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button class="save-btn btn primary" style="flex: 1; padding: 12px; background: linear-gradient(180deg, #0ea5e9, #2563eb); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">Salvar</button>
                <button class="reset-btn btn" style="flex: 1; padding: 12px; background: var(--muted); border: 1px solid var(--muted); border-radius: 8px; color: var(--text); font-weight: 600; cursor: pointer;">Restaurar Padrões</button>
                <button class="cancel-btn btn" style="flex: 1; padding: 12px; background: transparent; border: 1px solid var(--muted); border-radius: 8px; color: var(--text); font-weight: 600; cursor: pointer;">Cancelar</button>
            </div>
        `;

        modal.appendChild(content);

        // Populate current values
        this.populateSettingsForm(content);

        // Event listeners
        content.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        content.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        content.querySelector('.save-btn').addEventListener('click', () => {
            this.saveSettingsFromForm(content);
            document.body.removeChild(modal);
            if (window.epqsApp) {
                window.epqsApp.showNotification('Configurações salvas com sucesso!', 'success');
            }
        });

        content.querySelector('.reset-btn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
                this.reset();
                this.populateSettingsForm(content);
                if (window.epqsApp) {
                    window.epqsApp.showNotification('Configurações restauradas!', 'info');
                }
            }
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        document.body.appendChild(modal);
    }

    populateSettingsForm(content) {
        content.querySelector('#theme-select').value = this.currentSettings.theme;
        content.querySelector('#fontSize-select').value = this.currentSettings.fontSize;
        content.querySelector('#autoSave-check').checked = this.currentSettings.autoSave;
        content.querySelector('#autoBackup-check').checked = this.currentSettings.autoBackup;
        content.querySelector('#backupInterval-input').value = this.currentSettings.backupInterval;
        content.querySelector('#showNotifications-check').checked = this.currentSettings.showNotifications;
        content.querySelector('#notificationDuration-input').value = this.currentSettings.notificationDuration;
    }

    saveSettingsFromForm(content) {
        const newSettings = {
            theme: content.querySelector('#theme-select').value,
            fontSize: content.querySelector('#fontSize-select').value,
            autoSave: content.querySelector('#autoSave-check').checked,
            autoBackup: content.querySelector('#autoBackup-check').checked,
            backupInterval: parseInt(content.querySelector('#backupInterval-input').value),
            showNotifications: content.querySelector('#showNotifications-check').checked,
            notificationDuration: parseInt(content.querySelector('#notificationDuration-input').value)
        };

        this.setMultiple(newSettings);
    }
}

// Initialize global settings manager
window.epqsSettings = new EPQSSettings();
