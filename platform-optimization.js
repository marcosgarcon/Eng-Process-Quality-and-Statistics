// Platform Optimization for EPQS - Windows and Android Compatibility
// Desenvolvido por Marcos Garçon

class EPQSPlatformOptimization {
    constructor() {
        this.platform = this.detectPlatform();
        this.capabilities = this.detectCapabilities();
        this.optimizations = new Map();
        
        this.init();
    }

    init() {
        console.log('EPQS Platform Optimization: Initializing...');
        console.log('Detected platform:', this.platform);
        console.log('Device capabilities:', this.capabilities);
        
        this.applyPlatformOptimizations();
        this.setupResponsiveDesign();
        this.optimizePerformance();
        this.setupPWAFeatures();
        this.handlePlatformSpecificFeatures();
    }

    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();
        
        const detection = {
            isWindows: platform.includes('win') || userAgent.includes('windows'),
            isAndroid: userAgent.includes('android'),
            isIOS: /ipad|iphone|ipod/.test(userAgent),
            isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
            isTablet: /ipad|android(?!.*mobile)/i.test(userAgent),
            isDesktop: !(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)),
            isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
        };

        // Determine primary platform
        if (detection.isWindows) return 'windows';
        if (detection.isAndroid) return 'android';
        if (detection.isIOS) return 'ios';
        if (detection.isMobile) return 'mobile';
        return 'desktop';
    }

    detectCapabilities() {
        return {
            // Storage capabilities
            localStorage: this.testLocalStorage(),
            indexedDB: 'indexedDB' in window,
            webSQL: 'openDatabase' in window,
            
            // Network capabilities
            online: navigator.onLine,
            serviceWorker: 'serviceWorker' in navigator,
            
            // Hardware capabilities
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 1,
            
            // Display capabilities
            screenWidth: screen.width,
            screenHeight: screen.height,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: screen.colorDepth,
            
            // Input capabilities
            touch: 'ontouchstart' in window,
            pointer: window.PointerEvent ? 'pointer' : 'mouse',
            
            // Browser capabilities
            webGL: this.testWebGL(),
            canvas: !!document.createElement('canvas').getContext,
            webWorkers: typeof Worker !== 'undefined',
            
            // PWA capabilities
            beforeInstallPrompt: 'onbeforeinstallprompt' in window,
            notification: 'Notification' in window,
            geolocation: 'geolocation' in navigator,
            
            // Performance capabilities
            performanceObserver: 'PerformanceObserver' in window,
            intersectionObserver: 'IntersectionObserver' in window
        };
    }

    testLocalStorage() {
        try {
            const test = 'epqs_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    applyPlatformOptimizations() {
        // Windows-specific optimizations
        if (this.platform === 'windows') {
            this.optimizeForWindows();
        }
        
        // Android-specific optimizations
        if (this.platform === 'android') {
            this.optimizeForAndroid();
        }
        
        // Mobile optimizations
        if (this.capabilities.touch) {
            this.optimizeForTouch();
        }
        
        // Desktop optimizations
        if (!this.capabilities.touch) {
            this.optimizeForDesktop();
        }
    }

    optimizeForWindows() {
        console.log('Applying Windows optimizations...');
        
        // Windows-specific CSS
        this.addPlatformCSS('windows', `
            /* Windows-specific styles */
            .app-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            /* Windows scrollbar styling */
            ::-webkit-scrollbar {
                width: 12px;
            }
            
            ::-webkit-scrollbar-track {
                background: var(--muted);
                border-radius: 6px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: var(--accent);
                border-radius: 6px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: var(--accent2);
            }
            
            /* Windows-style buttons */
            .btn {
                border-radius: 4px;
                font-weight: 400;
            }
            
            /* Windows-style inputs */
            input, select, textarea {
                border-radius: 4px;
                border: 2px solid var(--muted);
            }
            
            input:focus, select:focus, textarea:focus {
                border-color: var(--accent);
                outline: none;
            }
            
            /* Windows-style modals */
            .modal-content {
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            }
        `);
        
        // Windows keyboard shortcuts
        this.setupWindowsKeyboardShortcuts();
        
        // Windows file handling
        this.setupWindowsFileHandling();
    }

    optimizeForAndroid() {
        console.log('Applying Android optimizations...');
        
        // Android-specific CSS
        this.addPlatformCSS('android', `
            /* Android-specific styles */
            .app-container {
                font-family: 'Roboto', 'Droid Sans', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            /* Android Material Design elements */
            .btn {
                border-radius: 8px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: box-shadow 0.2s, transform 0.2s;
            }
            
            .btn:active {
                transform: translateY(1px);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }
            
            /* Android-style cards */
            .tool-card, .kpi-card, .chart-container {
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: box-shadow 0.2s, transform 0.2s;
            }
            
            .tool-card:active, .kpi-card:active {
                transform: scale(0.98);
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            }
            
            /* Android-style inputs */
            input, select, textarea {
                border-radius: 8px;
                border: 1px solid var(--muted);
                padding: 12px 16px;
            }
            
            /* Android-style navigation */
            .sidebar {
                border-radius: 0 16px 16px 0;
            }
            
            .menu-item {
                border-radius: 12px;
                margin: 4px 8px;
                padding: 12px 16px;
            }
            
            /* Android-style floating action button */
            .fab {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--accent);
                color: white;
                border: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                font-size: 24px;
                cursor: pointer;
                z-index: 1000;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .fab:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            }
        `);
        
        // Android touch optimizations
        this.setupAndroidTouchOptimizations();
        
        // Android back button handling
        this.setupAndroidBackButton();
        
        // Android status bar
        this.setupAndroidStatusBar();
    }

    optimizeForTouch() {
        console.log('Applying touch optimizations...');
        
        // Touch-specific CSS
        this.addPlatformCSS('touch', `
            /* Touch-friendly sizing */
            .btn, .menu-item, .tool-card {
                min-height: 44px;
                min-width: 44px;
            }
            
            /* Touch feedback */
            .btn:active, .menu-item:active, .tool-card:active {
                background-color: rgba(255, 255, 255, 0.1);
            }
            
            /* Larger touch targets */
            .chart-controls button {
                padding: 12px;
                margin: 4px;
            }
            
            /* Touch-friendly spacing */
            .tools-grid {
                gap: 20px;
            }
            
            .kpi-grid {
                gap: 16px;
            }
            
            /* Swipe indicators */
            .swipeable {
                position: relative;
            }
            
            .swipeable::after {
                content: '';
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                width: 40px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
            }
        `);
        
        // Touch gesture handling
        this.setupTouchGestures();
        
        // Virtual keyboard handling
        this.setupVirtualKeyboardHandling();
    }

    optimizeForDesktop() {
        console.log('Applying desktop optimizations...');
        
        // Desktop-specific CSS
        this.addPlatformCSS('desktop', `
            /* Desktop hover effects */
            .btn:hover, .menu-item:hover, .tool-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            /* Desktop tooltips */
            [data-tooltip] {
                position: relative;
            }
            
            [data-tooltip]:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
            }
            
            /* Desktop context menus */
            .context-menu {
                position: fixed;
                background: var(--panel);
                border: 1px solid var(--muted);
                border-radius: 8px;
                padding: 8px 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 2000;
                min-width: 150px;
            }
            
            .context-menu-item {
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .context-menu-item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
        `);
        
        // Desktop keyboard shortcuts
        this.setupDesktopKeyboardShortcuts();
        
        // Desktop drag and drop
        this.setupDragAndDrop();
    }

    setupResponsiveDesign() {
        // Add responsive breakpoints
        this.addPlatformCSS('responsive', `
            /* Mobile First Responsive Design */
            
            /* Small devices (phones, 576px and up) */
            @media (min-width: 576px) {
                .container {
                    max-width: 540px;
                }
            }
            
            /* Medium devices (tablets, 768px and up) */
            @media (min-width: 768px) {
                .container {
                    max-width: 720px;
                }
                
                .sidebar {
                    position: fixed;
                    transform: translateX(0);
                }
                
                .main-content {
                    margin-left: 280px;
                }
                
                .mobile-menu-btn {
                    display: none !important;
                }
            }
            
            /* Large devices (desktops, 992px and up) */
            @media (min-width: 992px) {
                .container {
                    max-width: 960px;
                }
                
                .tools-grid {
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                }
                
                .charts-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            /* Extra large devices (large desktops, 1200px and up) */
            @media (min-width: 1200px) {
                .container {
                    max-width: 1140px;
                }
                
                .tools-grid {
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                }
                
                .charts-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
            
            /* Ultra wide screens (1400px and up) */
            @media (min-width: 1400px) {
                .container {
                    max-width: 1320px;
                }
                
                .charts-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
            
            /* Portrait orientation */
            @media (orientation: portrait) {
                .charts-grid {
                    grid-template-columns: 1fr;
                }
                
                .kpi-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            /* Landscape orientation */
            @media (orientation: landscape) and (max-width: 768px) {
                .header {
                    height: 60px;
                }
                
                .header-title h1 {
                    font-size: 18px;
                }
                
                .sidebar {
                    width: 240px;
                }
            }
        `);
        
        // Setup viewport meta tag optimization
        this.optimizeViewport();
    }

    optimizePerformance() {
        console.log('Applying performance optimizations...');
        
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Virtual scrolling for large lists
        this.setupVirtualScrolling();
        
        // Debounced resize handling
        this.setupDebouncedResize();
        
        // Memory management
        this.setupMemoryManagement();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    setupPWAFeatures() {
        console.log('Setting up PWA features...');
        
        // Install prompt handling
        this.setupInstallPrompt();
        
        // Offline functionality
        this.setupOfflineHandling();
        
        // Background sync
        this.setupBackgroundSync();
        
        // Push notifications (if supported)
        this.setupPushNotifications();
    }

    handlePlatformSpecificFeatures() {
        // Windows-specific features
        if (this.platform === 'windows') {
            this.setupWindowsIntegration();
        }
        
        // Android-specific features
        if (this.platform === 'android') {
            this.setupAndroidIntegration();
        }
        
        // Cross-platform features
        this.setupCrossPlatformFeatures();
    }

    // Utility methods
    addPlatformCSS(platform, css) {
        const styleId = `epqs-${platform}-styles`;
        let styleElement = document.getElementById(styleId);
        
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = css;
    }

    setupWindowsKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S for save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.triggerSave();
            }
            
            // Ctrl+E for export
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.triggerExport();
            }
            
            // Ctrl+H for home/dashboard
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                if (window.epqsApp) {
                    window.epqsApp.loadTool('dashboard');
                }
            }
            
            // F11 for fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
    }

    setupAndroidTouchOptimizations() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent pull-to-refresh
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupAndroidBackButton() {
        // Handle Android back button
        window.addEventListener('popstate', (e) => {
            if (this.platform === 'android') {
                // Custom back button logic
                const modals = document.querySelectorAll('.modal, .settings-modal, .report-builder-modal');
                if (modals.length > 0) {
                    modals[modals.length - 1].remove();
                    return;
                }
                
                // Navigate back in app
                if (window.epqsApp && window.epqsApp.currentTool !== 'dashboard') {
                    window.epqsApp.loadTool('dashboard');
                }
            }
        });
    }

    setupAndroidStatusBar() {
        // Set status bar color for Android
        if (this.platform === 'android') {
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.content = '#0f172a'; // Match app background
            }
        }
    }

    setupTouchGestures() {
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Swipe detection
            if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 300) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            
            startX = startY = null;
        }, { passive: true });
    }

    handleSwipeRight() {
        // Open sidebar on swipe right
        if (window.epqsApp) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('active')) {
                window.epqsApp.toggleMobileMenu();
            }
        }
    }

    handleSwipeLeft() {
        // Close sidebar on swipe left
        if (window.epqsApp) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                window.epqsApp.toggleMobileMenu();
            }
        }
    }

    setupVirtualKeyboardHandling() {
        // Handle virtual keyboard appearance
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                const viewport = window.visualViewport;
                const isKeyboardOpen = viewport.height < window.innerHeight * 0.75;
                
                document.body.classList.toggle('keyboard-open', isKeyboardOpen);
                
                if (isKeyboardOpen) {
                    // Adjust layout for keyboard
                    document.documentElement.style.setProperty('--vh', `${viewport.height * 0.01}px`);
                } else {
                    // Reset layout
                    document.documentElement.style.removeProperty('--vh');
                }
            });
        }
    }

    setupDesktopKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt+1-9 for quick tool access
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const toolIndex = parseInt(e.key) - 1;
                this.selectToolByIndex(toolIndex);
            }
            
            // Ctrl+/ for search
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });
    }

    setupDragAndDrop() {
        // Enable drag and drop for file uploads
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            this.handleDroppedFiles(files);
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupDebouncedResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('EPQS installed successfully');
            this.hideInstallButton();
        });
    }

    optimizeViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            if (this.platform === 'android') {
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            } else {
                viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            }
        }
    }

    // Event handlers and utility methods
    triggerSave() {
        if (window.epqsApp) {
            window.epqsApp.exportData();
        }
    }

    triggerExport() {
        if (window.epqsApp) {
            window.epqsApp.exportData();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    handleResize() {
        // Update CSS custom properties
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        document.documentElement.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
        
        // Trigger chart resize if needed
        if (window.epqsReportsDashboard) {
            window.epqsReportsDashboard.refreshAllCharts();
        }
    }

    showInstallButton() {
        // Show install button in header
        const installBtn = document.createElement('button');
        installBtn.className = 'btn install-btn';
        installBtn.innerHTML = '<i class="ph ph-download"></i> Instalar App';
        installBtn.onclick = () => this.promptInstall();
        
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            headerActions.insertBefore(installBtn, headerActions.firstChild);
        }
    }

    hideInstallButton() {
        const installBtn = document.querySelector('.install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    promptInstall() {
        // Trigger install prompt
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                this.deferredPrompt = null;
            });
        }
    }

    // Platform detection utilities
    getPlatformInfo() {
        return {
            platform: this.platform,
            capabilities: this.capabilities,
            optimizations: Array.from(this.optimizations.keys())
        };
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['navigation', 'paint'] });
        }
    }

    setupMemoryManagement() {
        // Clean up unused resources periodically
        setInterval(() => {
            this.cleanupUnusedResources();
        }, 300000); // Every 5 minutes
    }

    cleanupUnusedResources() {
        // Clear unused chart instances
        if (window.epqsReportsDashboard) {
            // Implementation would depend on chart library
        }
        
        // Clear old localStorage entries
        this.cleanupOldStorageEntries();
    }

    cleanupOldStorageEntries() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        const now = Date.now();
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('epqs_temp_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp && (now - data.timestamp) > maxAge) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Remove invalid entries
                    localStorage.removeItem(key);
                }
            }
        }
    }
}

// Initialize platform optimization
window.epqsPlatformOptimization = new EPQSPlatformOptimization();
