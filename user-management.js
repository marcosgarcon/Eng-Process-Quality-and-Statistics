// User Management System for EPQS
// Desenvolvido por Marcos Garçon
// Versão Aprimorada

class UserManagement {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.userProfiles = ['admin', 'user', 'viewer'];
        this.permissions = {
            admin: ['read', 'write', 'delete', 'export', 'manage_users', 'system_config', 'view_logs'],
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
            if (this.users.find(user => user.username.toLowerCase() === userData.username.toLowerCase())) {
                throw new Error('Nome de usuário já existe');
            }

            // Validate password strength
            const passwordValidation = this.validatePasswordStrength(userData.password);
            if (!passwordValidation.isValid) {
                throw new Error(passwordValidation.message);
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
                updatedAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                forcePasswordChange: userData.forcePasswordChange || false,
                preferences: this.getDefaultPreferences(),
                permissions: this.permissions[userData.profile] || this.permissions.viewer
            };

            this.users.push(newUser);
            this.saveUsers();
            
            this.logActivity('user_created', `Usuário ${newUser.username} criado`, { userId: newUser.id });
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
            const originalUser = { ...user };
            
            // Update allowed fields
            if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
            if (updateData.email !== undefined) user.email = updateData.email;
            if (updateData.department !== undefined) user.department = updateData.department;
            if (updateData.profile !== undefined) {
                user.profile = updateData.profile;
                user.permissions = this.permissions[updateData.profile] || this.permissions.viewer;
            }
            if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
            if (updateData.forcePasswordChange !== undefined) user.forcePasswordChange = updateData.forcePasswordChange;
            
            // Update password if provided
            if (updateData.password) {
                const passwordValidation = this.validatePasswordStrength(updateData.password);
                if (!passwordValidation.isValid) {
                    throw new Error(passwordValidation.message);
                }
                user.password = this.hashPassword(updateData.password);
            }

            user.updatedAt = new Date().toISOString();
            this.saveUsers();
            
            const changes = this.getChanges(originalUser, user);
            this.logActivity('user_updated', `Usuário ${user.username} atualizado. Alterações: ${changes}`, { userId: user.id });
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
                throw new Error('Não é possível excluir o último administrador ativo.');
            }

            this.users.splice(userIndex, 1);
            this.saveUsers();
            
            // Clean user data
            this.cleanUserData(userId);
            
            this.logActivity('user_deleted', `Usuário ${user.username} (ID: ${user.id}) foi excluído.`);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getUsers(filter = {}) {
        let filteredUsers = [...this.users];
        if (filter.searchTerm) {
            const searchTerm = filter.searchTerm.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.username.toLowerCase().includes(searchTerm) ||
                user.fullName.toLowerCase().includes(searchTerm) ||
                (user.email && user.email.toLowerCase().includes(searchTerm))
            );
        }
        return filteredUsers.map(user => this.sanitizeUser(user));
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
            const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.isActive);
            if (!user) {
                throw new Error('Usuário não encontrado ou inativo');
            }

            if (!this.verifyPassword(password, user.password)) {
                throw new Error('Senha incorreta');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();
            
            this.logActivity('user_login', `Usuário ${username} fez login`, { userId: user.id });
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
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d]/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { isValid: false, message: `A senha deve ter no mínimo ${minLength} caracteres.` };
        }
        if (!hasUpperCase) {
            return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
        }
        if (!hasLowerCase) {
            return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' };
        }
        if (!hasNumbers) {
            return { isValid: false, message: 'A senha deve conter pelo menos um número.' };
        }
        if (!hasSpecialChars) {
            return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial.' };
        }
        return { isValid: true };
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
                password: 'Admin@123',
                profile: 'admin',
                fullName: 'Administrador',
                email: 'admin@epqs.com',
                department: 'TI'
            });

            this.createUser({
                username: 'marcos',
                password: 'Garcon@123',
                profile: 'admin',
                fullName: 'Marcos Garçon',
                email: 'marcos@epqs.com',
                department: 'Engenharia'
            });

            this.createUser({
                username: 'user',
                password: 'User@123',
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
            const keys = Object.keys(localStorage);
            const userKeys = keys.filter(key => key.startsWith(`epqs_user_${userId}_`));
            userKeys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error cleaning user data:', error);
        }
    }

    // Activity Logging
    logActivity(action, description, details = {}) {
        try {
            const activity = {
                id: Date.now(),
                action: action,
                description: description,
                details: details,
                userId: this.currentUser ? this.currentUser.id : null,
                username: this.currentUser ? this.currentUser.username : 'System',
                timestamp: new Date().toISOString(),
            };

            const activities = this.getActivities();
            activities.unshift(activity);
            
            if (activities.length > 1000) {
                activities.splice(1000);
            }

            localStorage.setItem('epqs_activities', JSON.stringify(activities));
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    getActivities(limit = null) {
        try {
            const activities = JSON.parse(localStorage.getItem('epqs_activities') || '[]');
            return limit ? activities.slice(0, limit) : activities;
        } catch (error) {
            console.error('Error loading activities:', error);
            return [];
        }
    }

    // Statistics
    getUserStatistics() {
        return {
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.isActive).length,
            inactiveUsers: this.users.filter(u => !u.isActive).length,
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
    
    getChanges(original, updated) {
        const changes = [];
        for (const key in updated) {
            if (key !== 'password' && key !== 'updatedAt' && original[key] !== updated[key]) {
                changes.push(`${key}: de '${original[key]}' para '${updated[key]}'`);
            }
        }
        return changes.join(', ') || 'Nenhuma alteração de dados.';
    }

    // Export/Import
    exportUsers(format = 'json') {
       if (format === 'json') {
            const exportData = {
                users: this.users.map(user => this.sanitizeUser(user)),
                exportDate: new Date().toISOString(),
                version: '1.1'
            };
            return JSON.stringify(exportData, null, 2);
        }
        // Could add CSV export here later
    }

    exportActivities(format = 'csv') {
        const activities = this.getActivities();
        if (format === 'csv') {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Timestamp,Username,Action,Description,Details\r\n";
            activities.forEach(log => {
                const row = [
                    `"${new Date(log.timestamp).toLocaleString('pt-BR')}"`,
                    `"${log.username}"`,
                    `"${log.action}"`,
                    `"${log.description}"`,
                    `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
                ].join(',');
                csvContent += row + "\r\n";
            });
            return encodeURI(csvContent);
        }
    }
}

// User Management UI
class UserManagementUI {
    constructor(userManagement) {
        this.userManagement = userManagement;
        this.currentView = 'list';
        this.selectedUser = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchTerm = '';
    }

    render() {
        const container = document.getElementById('userManagementView');
        if (!container) return;

        container.innerHTML = `
            <div class="user-management-container">
                <div class="user-management-header">
                    <h2 class="section-title">
                        <i class="ph ph-users"></i>
                        Gerenciamento de Usuários
                    </h2>
                    <div class="header-actions">
                        <button class.="btn btn-primary" id="btn-new-user" title="Adicionar novo usuário">
                            <i class="ph ph-plus"></i> Novo Usuário
                        </button>
                        <button class="btn btn-secondary" id="btn-show-stats" title="Ver estatísticas de usuários">
                            <i class="ph ph-chart-bar"></i> Estatísticas
                        </button>
                        <button class="btn btn-secondary" id="btn-show-activities" title="Ver logs de atividade">
                            <i class="ph ph-list-checks"></i> Atividades
                        </button>
                        <button class="btn btn-secondary" id="btn-export-users" title="Exportar lista de usuários">
                            <i class="ph ph-download-simple"></i> Exportar Usuários
                        </button>
                    </div>
                </div>

                <div class="user-management-content">
                    <div id="user-list-view" class="view-content"></div>
                    <div id="user-form-view" class="view-content" style="display: none;"></div>
                    <div id="user-details-view" class="view-content" style="display: none;"></div>
                    <div id="user-statistics-view" class="view-content" style="display: none;"></div>
                    <div id="user-activities-view" class="view-content" style="display: none;"></div>
                </div>
            </div>

            <style>
                .user-management-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
                .user-management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 16px; }
                .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }
                .list-controls { margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                .search-bar { position: relative; }
                .search-bar input { background: #0b1220; border: 1px solid #243041; color: var(--text); padding: 10px 16px 10px 40px; border-radius: 10px; outline: none; font-family: inherit; font-size: 14px; min-width: 300px; }
                .search-bar i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; }
                .user-table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
                .user-table th, .user-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #334155; }
                .user-table th { background: #374151; font-weight: 600; color: #f1f5f9; }
                .user-table tbody tr:hover { background: #374151; cursor: pointer; }
                .user-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
                .user-status.active { background: #10b981; color: #ffffff; }
                .user-status.inactive { background: #ef4444; color: #ffffff; }
                .user-profile { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
                .user-profile.admin { background: #3b82f6; color: #ffffff; }
                .user-profile.user { background: #a78bfa; color: #ffffff; }
                .user-profile.viewer { background: #6b7280; color: #ffffff; }
                .user-form { background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; max-width: 800px; margin: auto; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group.full-width { grid-column: 1 / -1; }
                .password-strength { font-size: 12px; margin-top: 8px; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .stat-card { background: #374151; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #4b5563; }
                .stat-card h3 { font-size: 0.9rem; color: #a78bfa; margin-bottom: 12px; text-transform: uppercase; }
                .stat-value { font-size: 2.5rem; font-weight: 700; color: #22d3ee; }
                .activity-item { background: #374151; border-radius: 8px; padding: 16px; margin-bottom: 12px; border: 1px solid #4b5563; }
                .pagination { display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 8px; }
                .pagination button { background: var(--muted); border: 1px solid #243041; color: var(--text); padding: 8px 12px; border-radius: 6px; cursor: pointer; }
                .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
                .pagination button.active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
            </style>
        `;
        this.attachEventListeners();
        this.showUserList();
    }

    attachEventListeners() {
        document.getElementById('btn-new-user').addEventListener('click', () => this.showCreateUser());
        document.getElementById('btn-show-stats').addEventListener('click', () => this.showStatistics());
        document.getElementById('btn-show-activities').addEventListener('click', () => this.showActivities());
        document.getElementById('btn-export-users').addEventListener('click', () => this.exportUsers());
    }
    
    switchView(viewId) {
        document.querySelectorAll('.view-content').forEach(view => view.style.display = 'none');
        document.getElementById(viewId).style.display = 'block';
    }

    // LIST VIEW
    showUserList() {
        this.currentView = 'list';
        this.selectedUser = null;
        this.switchView('user-list-view');
        this.renderUserList();
    }

    renderUserList() {
        const users = this.userManagement.getUsers({ searchTerm: this.searchTerm });
        const totalPages = Math.ceil(users.length / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, totalPages || 1);
        const paginatedUsers = users.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);

        const view = document.getElementById('user-list-view');
        view.innerHTML = `
            <div class="list-controls">
                <div class="search-bar">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" id="user-search" placeholder="Buscar por nome, usuário ou email..." value="${this.searchTerm}">
                </div>
            </div>
            <div class="table-container">
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Nome Completo</th>
                            <th>Perfil</th>
                            <th>Status</th>
                            <th>Último Login</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paginatedUsers.length > 0 ? paginatedUsers.map(user => this.renderUserRow(user)).join('') : '<tr><td colspan="6" style="text-align:center; padding: 20px;">Nenhum usuário encontrado.</td></tr>'}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(totalPages, users.length)}
        `;
        document.getElementById('user-search').addEventListener('input', (e) => this.handleSearch(e));
    }

    renderUserRow(user) {
        return `
            <tr data-user-id="${user.id}" title="Clique para ver detalhes">
                <td><strong>${user.username}</strong></td>
                <td>${user.fullName}</td>
                <td><span class="user-profile ${user.profile}">${user.profile}</span></td>
                <td><span class="user-status ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Ativo' : 'Inativo'}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                <td class="actions-cell">
                    <button class="btn btn-small" onclick="event.stopPropagation(); userManagementUI.editUser('${user.id}')" title="Editar"><i class="ph ph-pencil"></i></button>
                    <button class="btn btn-small btn-danger" onclick="event.stopPropagation(); userManagementUI.deleteUser('${user.id}')" title="Excluir"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `;
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.currentPage = 1;
        this.renderUserList();
    }

    renderPagination(totalPages, totalItems) {
        if (totalItems <= this.itemsPerPage) return '';
        let paginationHtml = `<div class="pagination"><button id="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>&laquo;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHtml += `<button id="next-page" ${this.currentPage === totalPages ? 'disabled' : ''}>&raquo;</button></div>`;
        
        // Attach event listeners after rendering
        setTimeout(() => {
            document.getElementById('prev-page')?.addEventListener('click', () => { this.currentPage--; this.renderUserList(); });
            document.getElementById('next-page')?.addEventListener('click', () => { this.currentPage++; this.renderUserList(); });
            document.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => { this.currentPage = parseInt(e.target.dataset.page); this.renderUserList(); });
            });
        }, 0);

        return paginationHtml;
    }

    // FORM VIEW (Create/Edit)
    showCreateUser() {
        this.selectedUser = null;
        this.switchView('user-form-view');
        this.renderUserForm();
    }

    editUser(userId) {
        this.selectedUser = userId;
        this.switchView('user-form-view');
        this.renderUserForm();
    }

    renderUserForm() {
        const isEdit = this.selectedUser !== null;
        const user = isEdit ? this.userManagement.getUserById(this.selectedUser) : {};
        
        const view = document.getElementById('user-form-view');
        view.innerHTML = `
            <div class="user-form">
                <h3 class="section-subtitle">
                    <i class="ph ph-${isEdit ? 'pencil' : 'plus'}"></i>
                    ${isEdit ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
                
                <form id="user-form">
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
                        <div class="form-group full-width">
                            <label class="form-label" for="form-profile">Perfil *</label>
                            <select class="form-select" id="form-profile" required>
                                <option value="viewer" ${user.profile === 'viewer' ? 'selected' : ''}>Visualizador</option>
                                <option value="user" ${user.profile === 'user' ? 'selected' : ''}>Usuário</option>
                                <option value="admin" ${user.profile === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="form-password">${isEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</label>
                            <input type="password" class="form-input" id="form-password" ${!isEdit ? 'required' : ''}>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="form-password-confirm">${isEdit ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}</label>
                            <input type="password" class="form-input" id="form-password-confirm" ${!isEdit ? 'required' : ''}>
                        </div>
                        <div class="form-group full-width">
                            <div id="password-strength-indicator" class="password-strength"></div>
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
                        <div class="form-group">
                            <label class="form-label" for="force-password-change">
                                <input type="checkbox" id="force-password-change" ${user.forcePasswordChange ? 'checked' : ''}>
                                Forçar alteração de senha no próximo login
                            </label>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px; margin-top: 24px;">
                        <button type="submit" class="btn btn-primary"><i class="ph ph-floppy-disk"></i> ${isEdit ? 'Atualizar' : 'Criar'}</button>
                        <button type="button" class="btn btn-secondary" id="btn-cancel-form"><i class="ph ph-x"></i> Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('user-form').addEventListener('submit', (e) => this.saveUser(e));
        document.getElementById('btn-cancel-form').addEventListener('click', () => this.showUserList());
        document.getElementById('form-password').addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
    }

    checkPasswordStrength(password) {
        const indicator = document.getElementById('password-strength-indicator');
        if (!indicator) return;
        const result = this.userManagement.validatePasswordStrength(password);
        if (password.length === 0) {
            indicator.innerHTML = '';
            return;
        }
        if (result.isValid) {
            indicator.innerHTML = '<span style="color: var(--ok);">Força da senha: Forte</span>';
        } else {
            indicator.innerHTML = `<span style="color: var(--warn);">Força da senha: Fraca (${result.message})</span>`;
        }
    }

    saveUser(event) {
        event.preventDefault();
        
        const password = document.getElementById('form-password').value;
        const passwordConfirm = document.getElementById('form-password-confirm').value;

        if (password !== passwordConfirm) {
            this.showNotification('As senhas não coincidem.', 'error');
            return;
        }

        const formData = {
            username: document.getElementById('form-username').value,
            fullName: document.getElementById('form-fullname').value,
            email: document.getElementById('form-email').value,
            department: document.getElementById('form-department').value,
            profile: document.getElementById('form-profile').value,
            forcePasswordChange: document.getElementById('force-password-change').checked,
            password: password,
        };

        if (this.selectedUser) {
            formData.isActive = document.getElementById('form-active').value === 'true';
        }

        const result = this.selectedUser 
            ? this.userManagement.updateUser(this.selectedUser, formData)
            : this.userManagement.createUser(formData);

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

    // STATISTICS VIEW
    showStatistics() {
        this.switchView('user-statistics-view');
        this.renderStatistics();
    }

    renderStatistics() {
        const stats = this.userManagement.getUserStatistics();
        document.getElementById('user-statistics-view').innerHTML = `
            <h3 class="section-subtitle"><i class="ph ph-chart-bar"></i> Estatísticas de Usuários</h3>
            <div class="stats-grid">
                ${this.renderStatCard('Total de Usuários', stats.totalUsers)}
                ${this.renderStatCard('Usuários Ativos', stats.activeUsers)}
                ${this.renderStatCard('Usuários Inativos', stats.inactiveUsers)}
                ${this.renderStatCard('Administradores', stats.adminUsers)}
                ${this.renderStatCard('Usuários Padrão', stats.regularUsers)}
                ${this.renderStatCard('Visualizadores', stats.viewerUsers)}
            </div>
            <button class="btn btn-secondary" id="back-to-list-stats"><i class="ph ph-arrow-left"></i> Voltar</button>
        `;
        document.getElementById('back-to-list-stats').addEventListener('click', () => this.showUserList());
    }
    
    renderStatCard(title, value) {
        return `
            <div class="stat-card">
                <h3>${title}</h3>
                <div class="stat-value">${value}</div>
            </div>
        `;
    }

    // ACTIVITIES VIEW
    showActivities() {
        this.switchView('user-activities-view');
        this.renderActivities();
    }
    
    renderActivities() {
        const activities = this.userManagement.getActivities(100);
        document.getElementById('user-activities-view').innerHTML = `
            <div style="display:flex; justify-content: space-between; align-items: center;">
                 <h3 class="section-subtitle"><i class="ph ph-list-checks"></i> Atividades Recentes</h3>
                 <button class="btn btn-secondary" id="btn-export-activities"><i class="ph ph-download-simple"></i> Exportar CSV</button>
            </div>
            <div class="activities-list">
                ${activities.map(act => `
                    <div class="activity-item">
                        <div>
                            <strong>${act.username || 'System'}</strong> - ${this.getActionLabel(act.action)}
                            <p style="font-size: 14px; margin: 4px 0 0; color: #cbd5e1;">${act.description}</p>
                        </div>
                        <small style="color: #94a3b8;">${new Date(act.timestamp).toLocaleString('pt-BR')}</small>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-secondary" id="back-to-list-activities"><i class="ph ph-arrow-left"></i> Voltar</button>
        `;
        document.getElementById('back-to-list-activities').addEventListener('click', () => this.showUserList());
        document.getElementById('btn-export-activities').addEventListener('click', () => this.exportActivities());
    }

    // EXPORT
    exportUsers() {
        const data = this.userManagement.exportUsers('json');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `epqs-users-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Dados de usuários exportados!', 'success');
    }

    exportActivities() {
        const encodedUri = this.userManagement.exportActivities('csv');
        const a = document.createElement('a');
        a.href = encodedUri;
        a.download = `epqs-activities-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        this.showNotification('Log de atividades exportado!', 'success');
    }

    // UTILS
    getActionLabel(action) {
        const labels = {
            'user_created': 'Usuário Criado', 'user_updated': 'Usuário Atualizado', 'user_deleted': 'Usuário Excluído',
            'user_login': 'Login', 'login_failed': 'Falha de Login',
        };
        return labels[action] || action;
    }

    showNotification(message, type = 'info') {
        if (window.epqsApp && typeof window.epqsApp.showNotification === 'function') {
            window.epqsApp.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Global instances
document.addEventListener('DOMContentLoaded', () => {
    if (!window.userManagement) {
        window.userManagement = new UserManagement();
        window.userManagementUI = new UserManagementUI(window.userManagement);
    }
});
