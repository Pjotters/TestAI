class FeedbackSystem {
    constructor() {
        this.feedbackContainer = document.createElement('div');
        this.feedbackContainer.className = 'feedback-container';
        document.body.appendChild(this.feedbackContainer);
        this.loadingManager = new LoadingStateManager('feedbackStatus');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Globale feedback trigger
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                this.showFeedbackForm();
            }
        });

        // Feedback na belangrijke acties
        document.addEventListener('modelGenerated', () => {
            setTimeout(() => this.requestFeedback('3D Model Generatie'), 2000);
        });
    }

    async handleFeedbackSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        try {
            this.loadingManager.startLoading('Feedback wordt verwerkt...');
            
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: formData.get('rating'),
                    feedback: formData.get('feedback'),
                    category: formData.get('category'),
                    sessionId: AnalyticsManager.getSessionId()
                })
            });

            if (!response.ok) throw new Error('Feedback verzenden mislukt');

            this.loadingManager.stopLoading();
            this.showThankYouMessage();
            
            // Track successful feedback
            AnalyticsManager.trackEvent('Feedback', 'Submit', formData.get('category'));
            
        } catch (error) {
            this.loadingManager.showError(error);
        }
    }

    showThankYouMessage() {
        this.feedbackContainer.innerHTML = `
            <div class="feedback-thank-you" role="alert">
                <span class="material-icons success">check_circle</span>
                <h3>Bedankt voor je feedback!</h3>
                <p>We gebruiken dit om onze diensten te verbeteren.</p>
                <button onclick="this.closeFeedback()" class="cta-secondary">Sluiten</button>
            </div>
        `;
        
        setTimeout(() => this.closeFeedback(), 3000);
    }

    requestFeedback(category) {
        const lastFeedback = localStorage.getItem(`lastFeedback_${category}`);
        const now = new Date().getTime();
        
        if (!lastFeedback || (now - parseInt(lastFeedback)) > 24 * 60 * 60 * 1000) {
            this.showFeedbackForm(category);
        }
    }

    closeFeedback() {
        this.feedbackContainer.innerHTML = '';
    }

    showFeedbackForm(category) {
        this.feedbackContainer.innerHTML = `
            <div class="feedback-modal" role="dialog" aria-labelledby="feedbackTitle">
                <h2 id="feedbackTitle">Help ons verbeteren!</h2>
                <form id="feedbackForm" class="feedback-form">
                    <div class="rating-container">
                        <label>Hoe tevreden ben je?</label>
                        <div class="star-rating" role="radiogroup">
                            ${Array.from({length: 5}, (_, i) => `
                                <button type="button" class="star-btn" data-rating="${i + 1}" aria-label="${i + 1} sterren">
                                    <span class="material-icons">star</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <textarea 
                        name="feedback" 
                        placeholder="Deel je ervaring..."
                        aria-label="Feedback tekst"
                        required
                    ></textarea>
                    <input type="hidden" name="category" value="${category}">
                    <button type="submit" class="cta-primary">Verstuur Feedback</button>
                </form>
            </div>
        `;
        this.setupFeedbackListeners();
    }

    setupFeedbackListeners() {
        const form = document.getElementById('feedbackForm');
        form.addEventListener('submit', this.handleFeedbackSubmit.bind(this));
    }
} 