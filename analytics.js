class AnalyticsManager {
    static instance = null;
    
    constructor() {
        if (AnalyticsManager.instance) {
            return AnalyticsManager.instance;
        }
        
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.initializeStorage();
        AnalyticsManager.instance = this;
    }

    static getInstance() {
        if (!AnalyticsManager.instance) {
            AnalyticsManager.instance = new AnalyticsManager();
        }
        return AnalyticsManager.instance;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializeStorage() {
        if (!localStorage.getItem('pjotters_analytics')) {
            localStorage.setItem('pjotters_analytics', JSON.stringify([]));
        }
    }

    static trackEvent(category, action, label = null, value = null) {
        const instance = AnalyticsManager.getInstance();
        instance.logEvent(category, action, label, value);
    }

    logEvent(category, action, label = null, value = null) {
        const event = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            category,
            action,
            label,
            value,
            page: window.location.pathname,
            userAgent: navigator.userAgent
        };

        this.events.push(event);
        this.saveToStorage(event);
        this.sendToServer(event);

        // Debug logging in development
        if (window.location.hostname === 'localhost') {
            console.log('Analytics Event:', event);
        }
    }

    saveToStorage(event) {
        try {
            const stored = JSON.parse(localStorage.getItem('pjotters_analytics') || '[]');
            stored.push(event);
            
            // Bewaar maximaal 100 events
            if (stored.length > 100) {
                stored.shift();
            }
            
            localStorage.setItem('pjotters_analytics', JSON.stringify(stored));
        } catch (error) {
            console.error('Analytics storage error:', error);
        }
    }

    async sendToServer(event) {
        // Implementeer later server-side tracking
        // Voor nu alleen mock implementatie
        if (window.location.hostname === 'localhost') {
            console.log('Would send to server:', event);
        }
    }

    static getEventHistory() {
        const instance = AnalyticsManager.getInstance();
        return instance.events;
    }

    static clearHistory() {
        const instance = AnalyticsManager.getInstance();
        instance.events = [];
        localStorage.setItem('pjotters_analytics', JSON.stringify([]));
    }
}

// Event listeners voor automatische tracking
document.addEventListener('DOMContentLoaded', () => {
    // Page view tracking
    AnalyticsManager.trackEvent('Page', 'View');

    // Error tracking
    window.addEventListener('error', (event) => {
        AnalyticsManager.trackEvent('Error', 'JavaScript', event.message);
    });

    // Performance tracking
    if (window.performance) {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        AnalyticsManager.trackEvent('Performance', 'PageLoad', null, loadTime);
    }
});

// Export voor gebruik in andere modules
window.AnalyticsManager = AnalyticsManager; 