// Centrale error handling en loading states
class ErrorHandler {
    static handleError(error, component) {
        console.error(`[${component}] Error:`, error);
        
        // Stuur error naar analytics
        this.logErrorToAnalytics(error, component);
        
        return {
            message: this.getUserFriendlyMessage(error),
            code: error.code || 'UNKNOWN_ERROR',
            component
        };
    }

    static getUserFriendlyMessage(error) {
        const errorMessages = {
            'NETWORK_ERROR': 'Er is een netwerkprobleem. Controleer je internetverbinding.',
            'API_ERROR': 'Er ging iets mis met onze servers. Probeer het later opnieuw.',
            'AUTH_ERROR': 'Je bent niet geautoriseerd voor deze actie.',
            'DEFAULT': 'Er ging iets mis. Probeer het opnieuw.'
        };

        return errorMessages[error.code] || errorMessages.DEFAULT;
    }

    static async logErrorToAnalytics(error, component) {
        try {
            await fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: error.message,
                    component,
                    timestamp: new Date().toISOString(),
                    stack: error.stack
                })
            });
        } catch (e) {
            console.error('Failed to log error:', e);
        }
    }
}

// Uitgebreide loading state manager
class LoadingStateManager {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.originalContent = '';
        this.progressBar = null;
        this.loadingTimeout = null;
    }

    startLoading(message = 'Laden...', showProgress = false) {
        clearTimeout(this.loadingTimeout);
        this.originalContent = this.element.innerHTML;
        
        const loadingHTML = `
            <div class="loading-state" role="alert" aria-busy="true">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
                ${showProgress ? '<div class="progress-bar"><div class="progress"></div></div>' : ''}
            </div>
        `;
        
        this.element.innerHTML = loadingHTML;
        
        // Timeout voor lange laadtijden
        this.loadingTimeout = setTimeout(() => {
            this.updateLoadingMessage('Dit duurt langer dan verwacht...');
        }, 10000);
    }

    updateProgress(percentage) {
        const progressBar = this.element.querySelector('.progress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    updateLoadingMessage(message) {
        const messageElement = this.element.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    stopLoading(success = true, message = '') {
        clearTimeout(this.loadingTimeout);
        
        if (success) {
            this.element.innerHTML = this.originalContent;
        } else {
            this.showError({ message });
        }
    }

    showError(error) {
        const errorDetails = ErrorHandler.handleError(error, this.element.id);
        
        this.element.innerHTML = `
            <div class="error-state" role="alert">
                <span class="material-icons error-icon">error_outline</span>
                <p class="error-message">${errorDetails.message}</p>
                <div class="error-actions">
                    <button onclick="location.reload()" class="retry-btn">
                        <span class="material-icons">refresh</span>
                        Probeer opnieuw
                    </button>
                    <button onclick="window.history.back()" class="back-btn">
                        <span class="material-icons">arrow_back</span>
                        Ga terug
                    </button>
                </div>
            </div>
        `;
    }
}

// Analytics en tracking
class AnalyticsManager {
    static async trackEvent(category, action, label = '', value = null) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    action,
                    label,
                    value,
                    timestamp: new Date().toISOString(),
                    sessionId: this.getSessionId()
                })
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    static getSessionId() {
        let sessionId = localStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }
}

// API call wrapper met error handling
async function safeApiCall(apiFunction, loadingManager) {
    try {
        loadingManager.startLoading();
        const result = await apiFunction();
        loadingManager.stopLoading();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        loadingManager.showError(error);
        throw error;
    }
}

// Local storage manager voor geschiedenis
class HistoryManager {
    constructor(key) {
        this.storageKey = key;
    }

    saveItem(item) {
        const history = this.getHistory();
        history.unshift({
            ...item,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(history.slice(0, 50)));
    }

    getHistory() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }
} 