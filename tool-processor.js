// Tool Processor for EPQS - Enhanced Integration System with CORS/Security Error Handling
// Desenvolvido por Marcos Garçon

class EPQSToolProcessor {
    constructor() {
        this.toolsPath = './tools/';
        this.processedTools = new Map();
        this.loadAttempts = new Map();
        this.maxRetries = 3;
        this.isLocalFileProtocol = window.location.protocol === 'file:';
        this.integrationTimeouts = new Map();
        
        this.init();
    }

    init() {
        console.log('EPQS Tool Processor: Initializing...');
        this.checkEnvironment();
        this.setupMessageHandling();
        this.setupErrorHandling();
    }

    checkEnvironment() {
        if (this.isLocalFileProtocol) {
            console.warn('EPQS Tool Processor: Running on file:// protocol. Some features may be limited due to browser security restrictions.');
            console.warn('For full functionality, please run the system on a local web server (e.g., python -m http.server)');
            
            // Show warning to user
            this.showProtocolWarning();
        }
    }

    showProtocolWarning() {
        // Only show warning once per session
        if (sessionStorage.getItem('epqs_protocol_warning_shown')) return;
        
        const warningDiv = document.createElement('div');
        warningDiv.id = 'protocol-warning';
        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #f59e0b;
            color: #1f2937;
            padding: 12px;
            text-align: center;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        warningDiv.innerHTML = `
            ⚠️ Para melhor funcionamento, execute o sistema em um servidor web local. 
            <a href="#" onclick="this.parentElement.style.display='none'; sessionStorage.setItem('epqs_protocol_warning_shown', 'true');" 
               style="color: #1f2937; text-decoration: underline; margin-left: 10px;">Fechar</a>
        `;
        document.body.insertBefore(warningDiv, document.body.firstChild);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.style.display = 'none';
                sessionStorage.setItem('epqs_protocol_warning_shown', 'true');
            }
        }, 10000);
    }

    setupErrorHandling() {
        // Global error handler for iframe loading issues
        window.addEventListener('error', (event) => {
            if (event.target && event.target.tagName === 'IFRAME') {
                console.error('EPQS Tool Processor: Iframe loading error:', event);
                this.handleIframeError(event.target);
            }
        }, true);
    }

    handleIframeError(iframe) {
        const toolName = iframe.dataset.tool;
        if (!toolName) return;

        console.log(`EPQS Tool Processor: Handling error for tool: ${toolName}`);
        
        // Show error message in iframe
        this.showIframeError(iframe, toolName);
        
        // Try alternative loading method
        this.tryAlternativeLoading(iframe, toolName);
    }

    showIframeError(iframe, toolName) {
        const errorHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Erro de Carregamento</title>
                <style>
                    body {
                        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
                        background: #0f172a;
                        color: #e5e7eb;
                        margin: 0;
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .error-container {
                        max-width: 500px;
                        margin: 0 auto;
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid #ef4444;
                        border-radius: 12px;
                        padding: 30px;
                    }
                    .error-icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    .error-title {
                        color: #ef4444;
                        font-size: 24px;
                        margin-bottom: 15px;
                    }
                    .error-message {
                        color: #94a3b8;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .retry-btn {
                        background: #22d3ee;
                        color: #0f172a;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .retry-btn:hover {
                        background: #06b6d4;
                    }
                    .server-instructions {
                        background: rgba(34, 211, 238, 0.1);
                        border: 1px solid #22d3ee;
                        border-radius: 8px;
                        padding: 15px;
                        margin-top: 20px;
                        text-align: left;
                        font-size: 14px;
                    }
                    code {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <h2 class="error-title">Erro de Carregamento</h2>
                    <p class="error-message">
                        Não foi possível carregar a ferramenta <strong>${toolName}</strong>.<br>
                        Isso pode ocorrer devido a restrições de segurança do navegador.
                    </p>
                    <div class="server-instructions">
                        <strong>💡 Solução recomendada:</strong><br>
                        Execute o sistema em um servidor web local:<br><br>
                        <strong>Python:</strong> <code>python -m http.server 8000</code><br>
                        <strong>Node.js:</strong> <code>npx serve .</code><br>
                        <strong>PHP:</strong> <code>php -S localhost:8000</code><br><br>
                        Depois acesse: <code>http://localhost:8000</code>
                    </div>
                    <button class="retry-btn" onclick="parent.location.reload()">
                        Recarregar Sistema
                    </button>
                </div>
            </body>
            </html>
        `;
        
        try {
            const blob = new Blob([errorHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframe.src = url;
            
            // Clean up blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (error) {
            console.error('Failed to show iframe error:', error);
            // Fallback: set iframe content directly
            try {
                iframe.srcdoc = errorHTML;
            } catch (fallbackError) {
                console.error('Failed to set iframe srcdoc:', fallbackError);
            }
        }
    }

    tryAlternativeLoading(iframe, toolName) {
        const attempts = this.loadAttempts.get(toolName) || 0;
        if (attempts >= this.maxRetries) {
            console.error(`EPQS Tool Processor: Max retries reached for tool: ${toolName}`);
            return;
        }

        this.loadAttempts.set(toolName, attempts + 1);
        
        // Try loading with different approach after delay
        setTimeout(() => {
            console.log(`EPQS Tool Processor: Retry attempt ${attempts + 1} for tool: ${toolName}`);
            this.loadToolWithFallback(iframe, toolName);
        }, 1000 * (attempts + 1)); // Exponential backoff
    }

    async loadToolWithFallback(iframe, toolName) {
        try {
            // Method 1: Try direct loading
            const toolPath = `tools/${toolName}.html`;
            
            if (!this.isLocalFileProtocol) {
                // For HTTP/HTTPS, try fetch first to check if file exists
                try {
                    const response = await fetch(toolPath);
                    if (response.ok) {
                        iframe.src = toolPath;
                        this.setupIframeIntegration(iframe, toolName);
                        return;
                    }
                } catch (fetchError) {
                    console.warn(`Fetch failed for ${toolName}, trying direct assignment:`, fetchError);
                }
            }
            
            // Method 2: Direct assignment (works for file:// and as fallback)
            iframe.src = toolPath;
            this.setupIframeIntegration(iframe, toolName);
            
        } catch (error) {
            console.error(`EPQS Tool Processor: Fallback loading failed for ${toolName}:`, error);
            this.showIframeError(iframe, toolName);
        }
    }

    setupIframeIntegration(iframe, toolName) {
        // Clear any existing timeout
        if (this.integrationTimeouts.has(toolName)) {
            clearTimeout(this.integrationTimeouts.get(toolName));
        }

        // Set up integration after iframe loads
        const integrationTimeout = setTimeout(() => {
            this.attemptScriptInjection(iframe, toolName);
        }, 1000);

        this.integrationTimeouts.set(toolName, integrationTimeout);

        // Also try on iframe load event
        iframe.onload = () => {
            clearTimeout(integrationTimeout);
            this.attemptScriptInjection(iframe, toolName);
        };
    }

    attemptScriptInjection(iframe, toolName) {
        try {
            // Check if iframe is accessible
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            if (!iframeDoc) {
                console.warn(`EPQS Tool Processor: Cannot access iframe document for ${toolName}`);
                return;
            }

            // Inject integration script
            this.injectIntegrationScript(iframe, toolName);
            console.log(`EPQS Tool Processor: Successfully integrated ${toolName}`);
            
        } catch (error) {
            console.warn(`EPQS Tool Processor: Script injection failed for ${toolName}:`, error);
            // For file:// protocol or CORS issues, this is expected
            // The tool will still load, just without full integration
        }
    }

    // Setup communication between main app and tool iframes
    setupMessageHandling() {
        window.addEventListener('message', (event) => {
            // Handle messages from tool iframes
            if (event.data && event.data.type === 'EPQS_TOOL_MESSAGE') {
                this.handleToolMessage(event.data);
            }
        });
    }

    handleToolMessage(data) {
        switch (data.action) {
            case 'TOOL_READY':
                console.log(`EPQS Tool Processor: Tool ${data.tool} is ready`);
                this.processedTools.set(data.tool, {
                    name: data.tool,
                    integrated: true,
                    lastProcessed: Date.now(),
                    features: {
                        dataSync: true,
                        notifications: true,
                        export: true,
                        responsive: true
                    }
                });
                break;
            case 'SAVE_DATA':
                this.saveToolData(data.tool, data.key, data.data);
                break;
            case 'LOAD_DATA':
                this.loadToolData(data.tool, data.key);
                break;
            case 'EXPORT_DATA':
                this.exportToolData(data.tool, data.format);
                break;
            case 'NOTIFICATION':
                this.showNotification(data.message, data.type);
                break;
            default:
                console.log('Unknown tool message:', data);
        }
    }

    // Save data from a tool
    async saveToolData(toolName, key, data) {
        try {
            if (window.epqsDataManager) {
                await window.epqsDataManager.saveData(`${toolName}_${key}`, data, toolName);
                this.sendMessageToTool(toolName, {
                    type: 'SAVE_RESPONSE',
                    success: true,
                    key: key
                });
            }
        } catch (error) {
            console.error('Failed to save tool data:', error);
            this.sendMessageToTool(toolName, {
                type: 'SAVE_RESPONSE',
                success: false,
                error: error.message,
                key: key
            });
        }
    }

    // Load data for a tool
    async loadToolData(toolName, key) {
        try {
            if (window.epqsDataManager) {
                const data = await window.epqsDataManager.loadData(`${toolName}_${key}`);
                this.sendMessageToTool(toolName, {
                    type: 'LOAD_RESPONSE',
                    success: true,
                    key: key,
                    data: data ? data.data : null
                });
            }
        } catch (error) {
            console.error('Failed to load tool data:', error);
            this.sendMessageToTool(toolName, {
                type: 'LOAD_RESPONSE',
                success: false,
                error: error.message,
                key: key
            });
        }
    }

    // Export data from a tool
    async exportToolData(toolName, format = 'json') {
        try {
            if (window.epqsDataManager) {
                const toolData = await window.epqsDataManager.getToolData(toolName);
                
                if (format === 'json') {
                    const blob = new Blob([JSON.stringify(toolData, null, 2)], { 
                        type: 'application/json' 
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${toolName}-export-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
                
                this.sendMessageToTool(toolName, {
                    type: 'EXPORT_RESPONSE',
                    success: true,
                    format: format
                });
            }
        } catch (error) {
            console.error('Failed to export tool data:', error);
            this.sendMessageToTool(toolName, {
                type: 'EXPORT_RESPONSE',
                success: false,
                error: error.message
            });
        }
    }

    // Send message to a specific tool iframe
    sendMessageToTool(toolName, message) {
        const iframe = document.getElementById('toolFrame');
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.postMessage({
                    type: 'EPQS_SYSTEM_MESSAGE',
                    tool: toolName,
                    ...message
                }, '*');
            } catch (error) {
                console.warn('Failed to send message to tool:', error);
            }
        }
    }

    // Show notification in main app
    showNotification(message, type = 'info') {
        if (window.epqsApp) {
            window.epqsApp.showNotification(message, type);
        } else {
            // Fallback notification
            console.log(`Notification (${type}): ${message}`);
        }
    }

    // Inject EPQS integration script into tool iframe
    injectIntegrationScript(iframe, toolName) {
        const script = `
            (function() {
                // Define EPQS global object for tool communication
                window.EPQS = {
                    // Save data to main system
                    saveData: function(key, data, category = 'general') {
                        parent.postMessage({
                            type: 'EPQS_TOOL_MESSAGE',
                            action: 'SAVE_DATA',
                            tool: '${toolName}',
                            key: key,
                            data: data,
                            category: category
                        }, '*');
                    },
                    
                    // Load data from main system
                    loadData: function(key) {
                        return new Promise((resolve, reject) => {
                            window.epqsLoadCallback = function(data, error) {
                                if (error) {
                                    reject(new Error(error));
                                } else {
                                    resolve(data);
                                }
                            };
                            parent.postMessage({
                                type: 'EPQS_TOOL_MESSAGE',
                                action: 'LOAD_DATA',
                                tool: '${toolName}',
                                key: key
                            }, '*');
                        });
                    },
                    
                    // Export data via main system
                    exportData: function(format = 'json') {
                        parent.postMessage({
                            type: 'EPQS_TOOL_MESSAGE',
                            action: 'EXPORT_DATA',
                            tool: '${toolName}',
                            format: format
                        }, '*');
                    },
                    
                    // Show notification in main system
                    showNotification: function(message, type = 'info') {
                        try {
                            parent.postMessage({
                                type: 'EPQS_TOOL_MESSAGE',
                                action: 'NOTIFICATION',
                                tool: '${toolName}',
                                message: message,
                                type: type
                            }, '*');
                        } catch (error) {
                            console.warn('EPQS: Failed to show notification:', error);
                        }
                    },
                    
                    // Get current user info
                    getCurrentUser: function() {
                        try {
                            const userData = localStorage.getItem('epqs_current_user');
                            return userData ? JSON.parse(userData) : null;
                        } catch {
                            return null;
                        }
                    }
                };
                
                // Listen for messages from main system
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'EPQS_SYSTEM_MESSAGE') {
                        const data = event.data;
                        
                        switch (data.type) {
                            case 'LOAD_RESPONSE':
                                if (window.epqsLoadCallback) {
                                    window.epqsLoadCallback(data.success ? data.data : null, data.error);
                                    window.epqsLoadCallback = null;
                                }
                                break;
                            case 'SAVE_RESPONSE':
                                if (data.success) {
                                    console.log('EPQS: Data saved successfully:', data.key);
                                } else {
                                    console.error('EPQS: Failed to save data:', data.error);
                                }
                                break;
                            case 'EXPORT_RESPONSE':
                                if (data.success) {
                                    console.log('EPQS: Data exported successfully');
                                } else {
                                    console.error('EPQS: Failed to export data:', data.error);
                                }
                                break;
                        }
                    }
                });
                
                // Override localStorage to use EPQS system (with fallback)
                const originalSetItem = localStorage.setItem;
                const originalGetItem = localStorage.getItem;
                
                localStorage.setItem = function(key, value) {
                    if (key.startsWith('epqs_') || key.includes('${toolName}')) {
                        window.EPQS.saveData(key, value);
                    } else {
                        try {
                            originalSetItem.call(this, key, value);
                        } catch (error) {
                            console.warn('localStorage.setItem failed:', error);
                        }
                    }
                };
                
                localStorage.getItem = function(key) {
                    if (key.startsWith('epqs_') || key.includes('${toolName}')) {
                        // For synchronous compatibility, return from original localStorage
                        // Tools should use EPQS.loadData for async loading
                        try {
                            return originalGetItem.call(this, key);
                        } catch (error) {
                            console.warn('localStorage.getItem failed:', error);
                            return null;
                        }
                    } else {
                        try {
                            return originalGetItem.call(this, key);
                        } catch (error) {
                            console.warn('localStorage.getItem failed:', error);
                            return null;
                        }
                    }
                };
                
                // Add EPQS styles to integrate with main theme
                const epqsStyles = document.createElement('style');
                epqsStyles.textContent = `
                    /* EPQS Integration Styles */
                    .epqs-integrated {
                        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Inter, Arial, sans-serif !important;
                    }
                    
                    /* Hide original header if it exists */
                    header:first-of-type {
                        display: none !important;
                    }
                    
                    /* Adjust body margins */
                    body {
                        margin: 0 !important;
                        padding: 20px !important;
                        background: transparent !important;
                    }
                    
                    /* Ensure content fits in iframe */
                    html, body {
                        height: auto !important;
                        overflow-x: hidden !important;
                    }
                    
                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        body {
                            padding: 10px !important;
                        }
                    }
                `;
                document.head.appendChild(epqsStyles);
                
                // Add integration class to body
                document.body.classList.add('epqs-integrated');
                
                // Notify main system that tool is ready
                try {
                    parent.postMessage({
                        type: 'EPQS_TOOL_MESSAGE',
                        action: 'TOOL_READY',
                        tool: '${toolName}'
                    }, '*');
                } catch (error) {
                    console.warn('EPQS: Failed to notify ready state:', error);
                }
                
                console.log('EPQS Integration: Ready for ${toolName}');
            })();
        `;
        
        // Inject script into iframe
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const scriptElement = iframeDoc.createElement('script');
            scriptElement.textContent = script;
            iframeDoc.head.appendChild(scriptElement);
        } catch (error) {
            console.error('Failed to inject integration script:', error);
            throw error; // Re-throw to be handled by caller
        }
    }

    // Process a tool for integration
    async processToolForIntegration(toolName) {
        if (this.processedTools.has(toolName)) {
            return this.processedTools.get(toolName);
        }

        try {
            const toolConfig = {
                name: toolName,
                integrated: false, // Will be set to true when TOOL_READY message is received
                lastProcessed: Date.now(),
                features: {
                    dataSync: true,
                    notifications: true,
                    export: true,
                    responsive: true
                }
            };

            this.processedTools.set(toolName, toolConfig);
            return toolConfig;
        } catch (error) {
            console.error(`Failed to process tool ${toolName}:`, error);
            return null;
        }
    }

    // Get list of available tools
    getAvailableTools() {
        return Array.from(this.processedTools.keys());
    }

    // Get tool configuration
    getToolConfig(toolName) {
        return this.processedTools.get(toolName) || null;
    }

    // Update tool configuration
    updateToolConfig(toolName, config) {
        if (this.processedTools.has(toolName)) {
            const currentConfig = this.processedTools.get(toolName);
            const updatedConfig = { ...currentConfig, ...config };
            this.processedTools.set(toolName, updatedConfig);
            return updatedConfig;
        }
        return null;
    }

    // Check if tool is integrated
    isToolIntegrated(toolName) {
        const config = this.processedTools.get(toolName);
        return config && config.integrated;
    }

    // Get integration statistics
    getIntegrationStats() {
        const stats = {
            totalTools: this.processedTools.size,
            integratedTools: 0,
            lastProcessed: null,
            protocolWarning: this.isLocalFileProtocol
        };

        for (const [name, config] of this.processedTools) {
            if (config.integrated) {
                stats.integratedTools++;
            }
            if (!stats.lastProcessed || config.lastProcessed > stats.lastProcessed) {
                stats.lastProcessed = config.lastProcessed;
            }
        }

        return stats;
    }

    // Manual tool loading method for debugging
    loadTool(toolName, iframe) {
        console.log(`EPQS Tool Processor: Manually loading tool: ${toolName}`);
        this.loadAttempts.delete(toolName); // Reset attempts
        this.loadToolWithFallback(iframe, toolName);
    }

    // Clear integration timeouts
    clearIntegrationTimeout(toolName) {
        if (this.integrationTimeouts.has(toolName)) {
            clearTimeout(this.integrationTimeouts.get(toolName));
            this.integrationTimeouts.delete(toolName);
        }
    }

    // Cleanup method
    cleanup() {
        // Clear all timeouts
        for (const timeout of this.integrationTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.integrationTimeouts.clear();
        
        // Clear load attempts
        this.loadAttempts.clear();
        
        console.log('EPQS Tool Processor: Cleanup completed');
    }
}

// Initialize global tool processor
window.epqsToolProcessor = new EPQSToolProcessor();

