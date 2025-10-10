// Data Manager for EPQS - Local Storage and IndexedDB Management
// Desenvolvido por Marcos Garçon

class EPQSDataManager {
    constructor() {
        this.dbName = 'EPQS_Database';
        this.dbVersion = 1;
        this.db = null;
        this.storeName = 'epqs_data';
        
        this.init();
    }

    async init() {
        try {
            await this.initIndexedDB();
            console.log('EPQS Data Manager: Initialized successfully');
        } catch (error) {
            console.error('EPQS Data Manager: Initialization failed:', error);
            // Fallback to localStorage only
        }
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('tool', 'tool', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('user', 'user', { unique: false });
                }
            };
        });
    }

    // Save data to both localStorage and IndexedDB
    async saveData(key, data, toolName = 'system') {
        const timestamp = Date.now();
        const user = this.getCurrentUser();
        
        const dataObject = {
            id: key,
            tool: toolName,
            data: data,
            timestamp: timestamp,
            user: user,
            version: '1.0.0'
        };

        // Save to localStorage
        try {
            localStorage.setItem(`epqs_${key}`, JSON.stringify(dataObject));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }

        // Save to IndexedDB
        if (this.db) {
            try {
                await this.saveToIndexedDB(dataObject);
            } catch (error) {
                console.error('Failed to save to IndexedDB:', error);
            }
        }

        return dataObject;
    }

    async saveToIndexedDB(dataObject) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(dataObject);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Load data from localStorage or IndexedDB
    async loadData(key) {
        // Try localStorage first
        try {
            const localData = localStorage.getItem(`epqs_${key}`);
            if (localData) {
                return JSON.parse(localData);
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }

        // Try IndexedDB
        if (this.db) {
            try {
                return await this.loadFromIndexedDB(key);
            } catch (error) {
                console.error('Failed to load from IndexedDB:', error);
            }
        }

        return null;
    }

    async loadFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get all data for a specific tool
    async getToolData(toolName) {
        const allData = {};

        // Get from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('epqs_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.tool === toolName) {
                        allData[key] = data;
                    }
                } catch (error) {
                    console.error('Error parsing localStorage data:', error);
                }
            }
        }

        // Get from IndexedDB
        if (this.db) {
            try {
                const indexedData = await this.getToolDataFromIndexedDB(toolName);
                Object.assign(allData, indexedData);
            } catch (error) {
                console.error('Error getting IndexedDB data:', error);
            }
        }

        return allData;
    }

    async getToolDataFromIndexedDB(toolName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('tool');
            const request = index.getAll(toolName);

            request.onsuccess = () => {
                const result = {};
                request.result.forEach(item => {
                    result[item.id] = item;
                });
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Export all data
    async exportAllData() {
        const exportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            user: this.getCurrentUser(),
            localStorage: {},
            indexedDB: {}
        };

        // Export localStorage data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('epqs_')) {
                try {
                    exportData.localStorage[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    exportData.localStorage[key] = localStorage.getItem(key);
                }
            }
        }

        // Export IndexedDB data
        if (this.db) {
            try {
                exportData.indexedDB = await this.exportIndexedDBData();
            } catch (error) {
                console.error('Failed to export IndexedDB data:', error);
            }
        }

        return exportData;
    }

    async exportIndexedDBData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const result = {};
                request.result.forEach(item => {
                    result[item.id] = item;
                });
                resolve(result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Import data
    async importData(importData) {
        if (!importData || typeof importData !== 'object') {
            throw new Error('Invalid import data');
        }

        let importedCount = 0;

        // Import localStorage data
        if (importData.localStorage) {
            for (const [key, value] of Object.entries(importData.localStorage)) {
                try {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    importedCount++;
                } catch (error) {
                    console.error(`Failed to import localStorage item ${key}:`, error);
                }
            }
        }

        // Import IndexedDB data
        if (importData.indexedDB && this.db) {
            for (const [key, value] of Object.entries(importData.indexedDB)) {
                try {
                    await this.saveToIndexedDB(value);
                    importedCount++;
                } catch (error) {
                    console.error(`Failed to import IndexedDB item ${key}:`, error);
                }
            }
        }

        return importedCount;
    }

    // Clear all data
    async clearAllData() {
        // Clear localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('epqs_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear IndexedDB
        if (this.db) {
            try {
                await this.clearIndexedDB();
            } catch (error) {
                console.error('Failed to clear IndexedDB:', error);
            }
        }

        return keysToRemove.length;
    }

    async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get storage statistics
    async getStorageStats() {
        const stats = {
            localStorage: {
                count: 0,
                size: 0
            },
            indexedDB: {
                count: 0,
                size: 0
            },
            total: {
                count: 0,
                size: 0
            }
        };

        // Calculate localStorage stats
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('epqs_')) {
                stats.localStorage.count++;
                const value = localStorage.getItem(key);
                stats.localStorage.size += new Blob([value]).size;
            }
        }

        // Calculate IndexedDB stats
        if (this.db) {
            try {
                const indexedData = await this.exportIndexedDBData();
                stats.indexedDB.count = Object.keys(indexedData).length;
                stats.indexedDB.size = new Blob([JSON.stringify(indexedData)]).size;
            } catch (error) {
                console.error('Failed to calculate IndexedDB stats:', error);
            }
        }

        // Calculate totals
        stats.total.count = stats.localStorage.count + stats.indexedDB.count;
        stats.total.size = stats.localStorage.size + stats.indexedDB.size;

        return stats;
    }

    // Backup data to file
    async createBackup() {
        try {
            const exportData = await this.exportAllData();
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

            return true;
        } catch (error) {
            console.error('Failed to create backup:', error);
            return false;
        }
    }

    // Restore data from file
    async restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    const importedCount = await this.importData(importData);
                    resolve(importedCount);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Utility methods
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('epqs_current_user');
            return userData ? JSON.parse(userData).username : 'anonymous';
        } catch {
            return 'anonymous';
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Auto-backup functionality
    setupAutoBackup(intervalHours = 24) {
        const interval = intervalHours * 60 * 60 * 1000; // Convert to milliseconds
        
        setInterval(async () => {
            try {
                const stats = await this.getStorageStats();
                if (stats.total.count > 0) {
                    console.log('EPQS Data Manager: Performing auto-backup...');
                    await this.createBackup();
                }
            } catch (error) {
                console.error('Auto-backup failed:', error);
            }
        }, interval);
    }

    // Data validation
    validateData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const requiredFields = ['id', 'tool', 'data', 'timestamp', 'user', 'version'];
        return requiredFields.every(field => data.hasOwnProperty(field));
    }

    // Data migration (for future versions)
    async migrateData(fromVersion, toVersion) {
        console.log(`EPQS Data Manager: Migrating data from ${fromVersion} to ${toVersion}`);
        
        // Migration logic would go here
        // This is a placeholder for future version migrations
        
        return true;
    }
}

// Initialize global data manager
window.epqsDataManager = new EPQSDataManager();

