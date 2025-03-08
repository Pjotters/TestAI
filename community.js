class CommunityManager {
    constructor() {
        this.challengeManager = new WeeklyChallengeManager();
        this.feedManager = new CommunityFeedManager();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterFeed(e.target.dataset.filter));
        });

        document.getElementById('shareCreationBtn')?.addEventListener('click', () => {
            this.showShareModal();
        });
    }

    async loadCommunityFeed(filter = 'recent') {
        const loadingManager = new LoadingStateManager('communityGrid');
        try {
            loadingManager.startLoading('Community creaties laden...');
            const items = await this.feedManager.getFeedItems(filter);
            this.renderFeedItems(items);
        } catch (error) {
            loadingManager.showError(error);
        }
    }

    renderFeedItems(items) {
        const grid = document.getElementById('communityGrid');
        grid.innerHTML = items.map(item => `
            <div class="community-item" data-id="${item.id}">
                <div class="creator-info">
                    <img src="${item.creatorAvatar}" alt="${item.creatorName}" class="avatar">
                    <span>${item.creatorName}</span>
                </div>
                <model-viewer
                    src="${item.modelUrl}"
                    camera-controls
                    auto-rotate
                    ar
                    shadow-intensity="1">
                </model-viewer>
                <div class="item-actions">
                    <button onclick="likeCreation('${item.id}')" class="like-btn">
                        <span class="material-icons">${item.isLiked ? 'favorite' : 'favorite_border'}</span>
                        <span>${item.likes}</span>
                    </button>
                    <button onclick="showComments('${item.id}')" class="comment-btn">
                        <span class="material-icons">comment</span>
                        <span>${item.comments.length}</span>
                    </button>
                    <button onclick="shareCreation('${item.id}')" class="share-btn">
                        <span class="material-icons">share</span>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

class WeeklyChallengeManager {
    constructor() {
        this.currentChallenge = null;
        this.loadCurrentChallenge();
    }

    async loadCurrentChallenge() {
        // API call naar backend voor huidige challenge
        this.renderChallenge();
    }

    renderChallenge() {
        const challengeSection = document.querySelector('.community-challenges');
        if (!this.currentChallenge) return;

        challengeSection.innerHTML = `
            <div class="challenge-card current-challenge">
                <div class="challenge-header">
                    <h3>${this.currentChallenge.title}</h3>
                    <span class="challenge-timer" data-ends="${this.currentChallenge.endDate}"></span>
                </div>
                <p>${this.currentChallenge.description}</p>
                <div class="challenge-prizes">
                    <div class="prize first">🥇 ${this.currentChallenge.prizes.first}</div>
                    <div class="prize second">🥈 ${this.currentChallenge.prizes.second}</div>
                    <div class="prize third">🥉 ${this.currentChallenge.prizes.third}</div>
                </div>
                <button class="cta-primary participate-btn">Doe Mee</button>
            </div>
        `;
    }
} 