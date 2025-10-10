// User Management System for EPQS
// Desenvolvido por Marcos Garçon

class UserManagement {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.userProfiles = ['admin', 'user', 'viewer'];
        this.permissions = {
            admin: ['read', 'write', 'delete', 'export', 'manage_users', 'system_config'],
            user: ['read', 'write', 'export'],
            viewer: ['read']
        };
        this.init();
    }

    init() {
        this.loadUsers();
        this.setupDefaultUsers();
    }

    // User CRUD Operations
    createUser(userData) {
        try {
            // Validate required fields
            if (!userData.username || !userData.password || !userData.profile) {
                throw new Error('Campos obrigatórios: username, password, profile');
            }

            // Check if username already exists
            if (this.users.find(user => user.username === userData.username)) {
                throw new Error('Nome de usuário já existe');
            }

            // Validate password strength
            if (!this.validatePasswordStrength(userData.password)) {
                throw new Error('Senha deve ter pelo menos 6 caracteres, incluindo letras e números');
            }

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                username: userData.username,
                password: this.hashPassword(userData.password),
                profile: userData.profile,
                fullName: userData.fullName || userData.username,
                email: userData.email || '',
                department: userData.department || '',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                preferences: this.getDefaultPreferences(),
                permissions: this.permissions[userData.profile] || this.permissions.viewer
            };

            this.users.push(newUser);
            this.saveUsers();
            
            this.logActivity('user_created', `Usuário ${newUser.username} criado`);
            return { success: true, user: this.sanitizeUser(newUser) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateUser(userId, updateData) {
        try {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                throw new Error('Usuário não encontrado');
            }

            const user = this.users[userIndex];
            
            // Update allowed fields
            if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
            if (updateData.email !== undefined) user.email = updateData.email;
            if (updateData.department !== undefined) user.department = updateData.department;
            if (updateData.profile !== undefined) {
                user.profile = updateData.profile;
                user.permissions = this.permissions[updateData.profile] || this.permissions.viewer;
            }
            if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
            
            // Update password if provided
            if (updateData.password) {
                if (!this.validatePasswordStrength(updateData.password)) {
                    throw new Error('Senha deve ter pelo menos 6 caracteres, incluindo letras e números');
                }
                user.password = this.hashPassword(updateData.password);
            }

            user.updatedAt = new Date().toISOString();
            this.saveUsers();
            
            this.logActivity('user_updated', `Usuário ${user.username} atualizado`);
            return { success: true, user: this.sanitizeUser(user) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteUser(userId) {
        try {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                throw new Error('Usuário não encontrado');
            }

            const user = this.users[userIndex];
            
            // Prevent deletion of admin users if it's the last one
            const adminUsers = this.users.filter(u => u.profile === 'admin' && u.isActive);
            if (user.profile === 'admin' && adminUsers.length <= 1) {
                throw new Error('Não é possível excluir o último administrador');
            }

            this.users.splice(userIndex, 1);
            this.saveUsers();
            
            // Clean user data
            this.cleanUserData(userId);
            
            this.logActivity('user_deleted', `Usuário ${user.username} excluído`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getUsers() {
        return this.users.map(user => this.sanitizeUser(user));
    }

    getUserById(userId) {
        const user = this.users.find(user => user.id === userId);
        return user ? this.sanitizeUser(user) : null;
    }

    getUserByUsername(username) {
        const user = this.users.find(user => user.username === username);
        return user ? this.sanitizeUser(user) : null;
    }

    // Authentication
    authenticate(username, password) {
        try {
            const user = this.users.find(u => u.username === username && u.isActive);
            if (!user) {
                throw new Error('Usuário não encontrado ou inativo');
            }

            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Senha incorreta');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            this.logActivity('user_login', `Usuário ${username} fez login`);
            return { success: true, user: this.sanitizeUser(user) };
        } catch (error) {
            this.logActivity('login_failed', `Falha de login para ${username}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    // Password Management
    hashPassword(password) {
        // Simple hash for demo purposes - in production, use bcrypt or similar
        const salt = this.generateSalt();
        return btoa(salt + password + salt);
    }

    verifyPassword(password, hashedPassword) {
        try {
            const decoded = atob(hashedPassword);
            const salt = decoded.substring(0, 8);
            const originalPassword = decoded.substring(8, decoded.length - 8);
            return password === originalPassword;
        } catch {
            return false;
        }
    }

    validatePasswordStrength(password) {
        // At least 6 characters, contains letters and numbers
        const minLength = password.length >= 6;
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return minLength && hasLetters && hasNumbers;
    }

    generateSalt() {
        return Math.random().toString(36).substring(2, 10);
    }

    // User Preferences
    updateUserPreferences(userId, preferences) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.preferences = { ...user.preferences, ...preferences };
            this.saveUsers();
            return { success: true };
        }
        return { success: false, error: 'Usuário não encontrado' };
    }

    getUserPreferences(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.preferences : this.getDefaultPreferences();
    }

    getDefaultPreferences() {
        return {
            theme: 'dark',
            language: 'pt-BR',
            autoSave: true,
            notifications: true,
            dashboardLayout: 'grid',
            itemsPerPage: 10
        };
    }

    // Data Management
    saveUsers() {
        try {
            localStorage.setItem('epqs_users', JSON.stringify(this.users));
            localStorage.setItem('epqs_users_backup', JSON.stringify({
                users: this.users,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('epqs_users');
            if (saved) {
                this.users = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = [];
        }
    }

    setupDefaultUsers() {
        // Create default admin user if no users exist
        if (this.users.length === 0) {
            this.createUser({
                username: 'admin',
                password: 'admin123',
                profile: 'admin',
                fullName: 'Administrador',
                email: 'admin@epqs.com',
                department: 'TI'
            });

            this.createUser({
                username: 'marcos',
                password: 'garcon123',
                profile: 'admin',
                fullName: 'Marcos Garçon',
                email: 'marcos@epqs.com',
                department: 'Engenharia'
            });

            this.createUser({
                username: 'user',
                password: 'user123',
                profile: 'user',
                fullName: 'Usuário Padrão',
                email: 'user@epqs.com',
                department: 'Produção'
            });
        }
    }

    // User Data Isolation
    getUserData(userId, dataKey) {
        try {
            const userDataKey = `epqs_user_${userId}_${dataKey}`;
            const data = localStorage.getItem(userDataKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    }

    saveUserData(userId, dataKey, data) {
        try {
            const userDataKey = `epqs_user_${userId}_${dataKey}`;
            localStorage.setItem(userDataKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    cleanUserData(userId) {
        try {
            // Remove all user-specific data
            const keys = Object.keys(localStorage);
            const userKeys = keys.filter(key => key.startsWith(`epqs_user_${userId}_`));
            userKeys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error cleaning user data:', error);
        }
    }

    // Activity Logging
    logActivity(action, description, userId = null) {
        try {
            const activity = {
                id: Date.now(),
                action: action,
                description: description,
                userId: userId || (this.currentUser ? this.currentUser.id : null),
                timestamp: new Date().toISOString(),
                ip: 'localhost', // In production, get real IP
                userAgent: navigator.userAgent
            };

            const activities = this.getActivities();
            activities.unshift(activity);
            
            // Keep only last 1000 activities
            if (activities.length > 1000) {
                activities.splice(1000);
            }

            localStorage.setItem('epqs_activities', JSON.stringify(activities));
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    getActivities(limit = 100) {
        try {
            const activities = JSON.parse(localStorage.getItem('epqs_activities') || '[]');
            return activities.slice(0, limit);
        } catch (error) {
            console.error('Error loading activities:', error);
            return [];
        }
    }

    // Statistics
    getUserStatistics() {
        const stats = {
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.isActive).length,
            adminUsers: this.users.filter(u => u.profile === 'admin').length,
            regularUsers: this.users.filter(u => u.profile === 'user').length,
            viewerUsers: this.users.filter(u => u.profile === 'viewer').length,
            recentLogins: this.users.filter(u => {
                if (!u.lastLogin) return false;
                const loginDate = new Date(u.lastLogin);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return loginDate > dayAgo;
            }).length
        };

        return stats;
    }

    // Utility Functions
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }

    hasPermission(userId, permission) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.permissions.includes(permission) : false;
    }

    // Export/Import
    exportUsers() {
        const exportData = {
            users: this.users.map(user => this.sanitizeUser(user)),
            activities: this.getActivities(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    importUsers(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('Formato de dados inválido');
            }

            // Backup current users
            const backup = {
                users: this.users,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('epqs_users_import_backup', JSON.stringify(backup));

            // Import users (passwords will need to be reset)
            data.users.forEach(userData => {
                if (!this.users.find(u => u.username === userData.username)) {
                    const newUser = {
                        ...userData,
                        password: this.hashPassword('temp123'), // Temporary password
                        id: this.generateUserId(),
                        importedAt: new Date().toISOString()
                    };
                    this.users.push(newUser);
                }
            });

            this.saveUsers();
            this.logActivity('users_imported', `${data.users.length} usuários importados`);
            
            return { success: true, imported: data.users.length };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// User Management UI
class UserManagementUI {
    constructor(userManagement) {
        this.userManagement = userManagement;
        this.currentView = 'list';
        this.selectedUser = null;
    }

    render() {
        return `
            <div class="user-management-container">
                <div class="user-management-header">
                    <h2 class="section-title">
                        <i class="ph ph-users"></i>
                        Gerenciamento de Usuários
                    </h2>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="userManagementUI.showCreateUser()">
                            <i class="ph ph-plus"></i> Novo Usuário
                        </button>
                        <button class="btn btn-secondary" onclick="userManagementUI.showStatistics()">
                            <i class="ph ph-chart-bar"></i> Estatísticas
                        </button>
                        <button class="btn btn-secondary" onclick="userManagementUI.showActivities()">
                            <i class="ph ph-list"></i> Atividades
                        </button>
                        <button class="btn btn-secondary" onclick="userManagementUI.exportUsers()">
                            <i class="ph ph-download"></i> Exportar
                        </button>
                    </div>
                </div>

                <div class="user-management-content">
                    <div id="user-list-view" class="view-content">
                        ${this.renderUserList()}
                    </div>
                    
                    <div id="user-form-view" class="view-content" style="display: none;">
                        ${this.renderUserForm()}
                    </div>
                    
                    <div id="user-statistics-view" class="view-content" style="display: none;">
                        ${this.renderStatistics()}
                    </div>
                    
                    <div id="user-activities-view" class="view-content" style="display: none;">
                        ${this.renderActivities()}
                    </div>
                </div>
            </div>

            <style>
                .user-management-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .user-management-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .header-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .user-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: #1e293b;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #334155;
                }

                .user-table th,
                .user-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #334155;
                }

                .user-table th {
                    background: #374151;
                    font-weight: 600;
                    color: #f1f5f9;
                }

                .user-table tbody tr:hover {
                    background: #374151;
                }

                .user-status {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .user-status.active {
                    background: #10b981;
                    color: #ffffff;
                }

                .user-status.inactive {
                    background: #ef4444;
                    color: #ffffff;
                }

                .user-profile {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .user-profile.admin {
                    background: #3b82f6;
                    color: #ffffff;
                }

                .user-profile.user {
                    background: #10b981;
                    color: #ffffff;
                }

                .user-profile.viewer {
                    background: #6b7280;
                    color: #ffffff;
                }

                .user-form {
                    background: #1e293b;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #334155;
                    max-width: 600px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .stat-card {
                    background: #374151;
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    border: 1px solid #4b5563;
                }

                .stat-card h3 {
                    font-size: 0.9rem;
                    color: #a78bfa;
                    margin-bottom: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #22d3ee;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                .activity-item {
                    background: #374151;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    border: 1px solid #4b5563;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .activity-info {
                    flex: 1;
                }

                .activity-action {
                    font-weight: 600;
                    color: #22d3ee;
                    margin-bottom: 4px;
                }

                .activity-description {
                    color: #e5e7eb;
                    font-size: 14px;
                    margin-bottom: 4px;
                }

                .activity-timestamp {
                    color: #94a3b8;
                    font-size: 12px;
                }

                @media (max-width: 768px) {
                    .user-management-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .header-actions {
                        justify-content: center;
                    }

                    .user-table {
                        font-size: 14px;
                    }

                    .user-table th,
                    .user-table td {
                        padding: 8px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
        `;
    }

    renderUserList() {
        const users = this.userManagement.getUsers();
        
        return `
            <div class="table-container">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Nome Completo</th>
                            <th>Email</th>
                            <th>Departamento</th>
                            <th>Perfil</th>
                            <th>Status</th>
                            <th>Último Login</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td><strong>${user.username}</strong></td>
                                <td>${user.fullName}</td>
                                <td>${user.email}</td>
                                <td>${user.department}</td>
                                <td><span class="user-profile ${user.profile}">${user.profile.toUpperCase()}</span></td>
                                <td><span class="user-status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Ativo' : 'Inativo'}</span></td>
                                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                                <td>
                                    <button class="btn btn-small btn-secondary" onclick="userManagementUI.editUser('${user.id}')">
                                        <i class="ph ph-pencil"></i>
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="userManagementUI.deleteUser('${user.id}')">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderUserForm() {
        const isEdit = this.selectedUser !== null;
        const user = isEdit ? this.userManagement.getUserById(this.selectedUser) : {};
        
        return `
            <div class="user-form">
                <h3 class="section-subtitle">
                    <i class="ph ph-${isEdit ? 'pencil' : 'plus'}"></i>
                    ${isEdit ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                
                <form id="user-form" onsubmit="userManagementUI.saveUser(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label" for="form-username">Nome de Usuário *</label>
                            <input type="text" class="form-input" id="form-username" value="${user.username || ''}" ${isEdit ? 'readonly' : ''} required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="form-fullname">Nome Completo *</label>
                            <input type="text" class="form-input" id="form-fullname" value="${user.fullName || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="form-email">Email</label>
                            <input type="email" class="form-input" id="form-email" value="${user.email || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="form-department">Departamento</label>
                            <input type="text" class="form-input" id="form-department" value="${user.department || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="form-profile">Perfil *</label>
                            <select class="form-select" id="form-profile" required>
                                <option value="viewer" ${user.profile === 'viewer' ? 'selected' : ''}>Visualizador</option>
                                <option value="user" ${user.profile === 'user' ? 'selected' : ''}>Usuário</option>
                                <option value="admin" ${user.profile === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="form-password">${isEdit ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}</label>
                            <input type="password" class="form-input" id="form-password" ${!isEdit ? 'required' : ''}>
                        </div>
                        
                        ${isEdit ? `
                        <div class="form-group">
                            <label class="form-label" for="form-active">Status</label>
                            <select class="form-select" id="form-active">
                                <option value="true" ${user.isActive ? 'selected' : ''}>Ativo</option>
                                <option value="false" ${!user.isActive ? 'selected' : ''}>Inativo</option>
                            </select>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 24px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="ph ph-floppy-disk"></i> ${isEdit ? 'Atualizar' : 'Criar'} Usuário
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="userManagementUI.showUserList()">
                            <i class="ph ph-x"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    renderStatistics() {
        const stats = this.userManagement.getUserStatistics();
        
        return `
            <div class="statistics-container">
                <h3 class="section-subtitle">
                    <i class="ph ph-chart-bar"></i>
                    Estatísticas de Usuários
                </h3>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total de Usuários</h3>
                        <div class="stat-value">${stats.totalUsers}</div>
                        <div class="stat-label">usuários cadastrados</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Usuários Ativos</h3>
                        <div class="stat-value">${stats.activeUsers}</div>
                        <div class="stat-label">usuários ativos</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Administradores</h3>
                        <div class="stat-value">${stats.adminUsers}</div>
                        <div class="stat-label">administradores</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Usuários Padrão</h3>
                        <div class="stat-value">${stats.regularUsers}</div>
                        <div class="stat-label">usuários padrão</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Visualizadores</h3>
                        <div class="stat-value">${stats.viewerUsers}</div>
                        <div class="stat-label">visualizadores</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Logins Recentes</h3>
                        <div class="stat-value">${stats.recentLogins}</div>
                        <div class="stat-label">últimas 24h</div>
                    </div>
                </div>
                
                <div style="margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="userManagementUI.showUserList()">
                        <i class="ph ph-arrow-left"></i> Voltar à Lista
                    </button>
                </div>
            </div>
        `;
    }

    renderActivities() {
        const activities = this.userManagement.getActivities(50);
        
        return `
            <div class="activities-container">
                <h3 class="section-subtitle">
                    <i class="ph ph-list"></i>
                    Atividades Recentes
                </h3>
                
                <div class="activities-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-info">
                                <div class="activity-action">${this.getActionLabel(activity.action)}</div>
                                <div class="activity-description">${activity.description}</div>
                                <div class="activity-timestamp">${new Date(activity.timestamp).toLocaleString('pt-BR')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 24px;">
                    <button class="btn btn-secondary" onclick="userManagementUI.showUserList()">
                        <i class="ph ph-arrow-left"></i> Voltar à Lista
                    </button>
                </div>
            </div>
        `;
    }

    // UI Actions
    showUserList() {
        this.currentView = 'list';
        this.selectedUser = null;
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById('user-list-view').style.display = 'block';
        document.getElementById('user-list-view').innerHTML = this.renderUserList();
    }

    showCreateUser() {
        this.currentView = 'form';
        this.selectedUser = null;
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById('user-form-view').style.display = 'block';
        document.getElementById('user-form-view').innerHTML = this.renderUserForm();
    }

    editUser(userId) {
        this.currentView = 'form';
        this.selectedUser = userId;
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById('user-form-view').style.display = 'block';
        document.getElementById('user-form-view').innerHTML = this.renderUserForm();
    }

    showStatistics() {
        this.currentView = 'statistics';
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById('user-statistics-view').style.display = 'block';
        document.getElementById('user-statistics-view').innerHTML = this.renderStatistics();
    }

    showActivities() {
        this.currentView = 'activities';
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById('user-activities-view').style.display = 'block';
        document.getElementById('user-activities-view').innerHTML = this.renderActivities();
    }

    saveUser(event) {
        event.preventDefault();
        
        const formData = {
            username: document.getElementById('form-username').value,
            fullName: document.getElementById('form-fullname').value,
            email: document.getElementById('form-email').value,
            department: document.getElementById('form-department').value,
            profile: document.getElementById('form-profile').value,
            password: document.getElementById('form-password').value
        };

        if (this.selectedUser) {
            formData.isActive = document.getElementById('form-active').value === 'true';
        }

        let result;
        if (this.selectedUser) {
            result = this.userManagement.updateUser(this.selectedUser, formData);
        } else {
            result = this.userManagement.createUser(formData);
        }

        if (result.success) {
            this.showNotification(`Usuário ${this.selectedUser ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            this.showUserList();
        } else {
            this.showNotification(result.error, 'error');
        }
    }

    deleteUser(userId) {
        const user = this.userManagement.getUserById(userId);
        if (!user) return;

        if (confirm(`Tem certeza que deseja excluir o usuário "${user.username}"?\n\nEsta ação não pode ser desfeita.`)) {
            const result = this.userManagement.deleteUser(userId);
            
            if (result.success) {
                this.showNotification('Usuário excluído com sucesso!', 'success');
                this.showUserList();
            } else {
                this.showNotification(result.error, 'error');
            }
        }
    }

    exportUsers() {
        const data = this.userManagement.exportUsers();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `epqs-users-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados de usuários exportados com sucesso!', 'success');
    }

    // Utility Functions
    getActionLabel(action) {
        const labels = {
            'user_created': 'Usuário Criado',
            'user_updated': 'Usuário Atualizado',
            'user_deleted': 'Usuário Excluído',
            'user_login': 'Login',
            'login_failed': 'Falha de Login',
            'users_imported': 'Usuários Importados'
        };
        return labels[action] || action;
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system from the main app
        if (window.epqsApp && typeof window.epqsApp.showNotification === 'function') {
            window.epqsApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Global instances
let userManagement;
let userManagementUI;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    userManagement = new UserManagement();
    userManagementUI = new UserManagementUI(userManagement);
});
