document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");

    // 1. Initialize core components
    const dataManager = new DataManager();
    const settings = new SystemSettings();
    const userManagement = new UserManagement();

    // Expose to global scope for other scripts
    window.dataManager = dataManager;
    window.settings = settings;
    window.userManagement = userManagement;

    // 2. Initialize the main application
    const app = new EPQSApp();
    window.EPQS = app; // Expose app instance

    // 3. Initialize and run the system validator
    if (window.EPQS_SystemValidator) {
        const validator = new window.EPQS_SystemValidator(app);
        validator.runAllTests();
    } else {
        console.warn("EPQS System Validator not found. Cannot run tests.");
    }
});
