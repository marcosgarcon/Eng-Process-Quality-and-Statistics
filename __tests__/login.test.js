
const EPQSApp = require("../app.js"); // Assuming EPQSApp is exported

describe("EPQSApp Login", () => {
    let app;

    beforeEach(() => {
        // Mock localStorage
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true,
        });

        // Mock DOM elements
        document.body.innerHTML = `
            <div id="loginScreen">
                <form id="loginForm">
                    <input id="username" value="" />
                    <input id="password" value="" />
                    <button type="submit"></button>
                </form>
            </div>
            <div id="appContainer" class="hidden"></div>
            <div id="dashboard" class="hidden"></div>
            <div id="notification-container"></div>
        `;

        // Mock Date to return a fixed date
        const MOCK_DATE = '2025-10-01T00:00:00.000Z';
        const mockDate = new Date(MOCK_DATE);
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        app = new EPQSApp();
    });

    test("should show error for empty credentials", async () => {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const loginForm = document.getElementById("loginForm");

        usernameInput.value = "";
        passwordInput.value = "";

        // Mock showNotification
        app.showNotification = jest.fn();

        await app.handleLogin({ preventDefault: () => {} });

        expect(app.showNotification).toHaveBeenCalledWith("Por favor, preencha todos os campos", "error");
        expect(app.isLoggedIn).toBe(false);
    });

    test("should log in with valid credentials", async () => {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const loginForm = document.getElementById("loginForm");

        usernameInput.value = "admin";
        passwordInput.value = "admin123";

        // Mock showNotification and showMainApp
        app.showNotification = jest.fn();
        app.showMainApp = jest.fn();
        app.populateToolsGrid = jest.fn();

        await app.handleLogin({ preventDefault: () => {} });

        expect(app.showNotification).toHaveBeenCalledWith("Bem-vindo, admin!", "success");
        expect(app.isLoggedIn).toBe(true);
        expect(app.showMainApp).toHaveBeenCalled();
        expect(app.populateToolsGrid).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith("epqs_current_user", JSON.stringify({ username: "admin", loginTime: expect.any(String) }));
    });

    test("should not log in with invalid credentials", async () => {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const loginForm = document.getElementById("loginForm");

        usernameInput.value = "invalid";
        passwordInput.value = "invalid";

        // Mock showNotification
        app.showNotification = jest.fn();

        await app.handleLogin({ preventDefault: () => {} });

        expect(app.showNotification).toHaveBeenCalledWith("Credenciais inválidas", "error");
        expect(app.isLoggedIn).toBe(false);
    });

    test("should log out successfully", () => {
        app.isLoggedIn = true;
        app.currentUser = { username: "admin" };
        app.showNotification = jest.fn();
        app.showLoginScreen = jest.fn();

        app.handleLogout();

        expect(app.isLoggedIn).toBe(false);
        expect(app.currentUser).toBe(null);
        expect(localStorage.removeItem).toHaveBeenCalledWith("epqs_current_user");
        expect(app.showLoginScreen).toHaveBeenCalled();
        expect(app.showNotification).toHaveBeenCalledWith("Logout realizado com sucesso", "info");
    });
});

