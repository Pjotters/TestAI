class RateLimiter {
    constructor() {
        this.limits = {
            'basic': 100,
            'pro': 1000,
            'premium': Infinity
        };
        this.usage = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    }

    async checkLimit(userType) {
        const today = new Date().toDateString();
        this.usage[today] = this.usage[today] || 0;
        
        if (this.usage[today] >= this.limits[userType]) {
            throw new Error('Dagelijks limiet bereikt');
        }
        
        this.usage[today]++;
        localStorage.setItem('ai_usage', JSON.stringify(this.usage));
        return true;
    }
} 