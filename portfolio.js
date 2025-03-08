class PortfolioManager {
    constructor() {
        this.historyManager = new HistoryManager('3d-models-history');
        this.grid = document.getElementById('portfolioGrid');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterItems(e.target.dataset.filter));
        });
    }

    async loadPortfolio() {
        const items = this.historyManager.getHistory();
        this.renderItems(items);
    }

    renderItems(items) {
        this.grid.innerHTML = items.map(item => `
            <div class="portfolio-item" data-timestamp="${item.timestamp}">
                <model-viewer
                    src="${item.modelUrl}"
                    camera-controls
                    auto-rotate
                    ar
                    shadow-intensity="1">
                </model-viewer>
                <div class="item-details">
                    <h3>${item.prompt}</h3>
                    <div class="share-buttons">
                        <button onclick="shareToSocial('twitter', '${item.modelUrl}')">
                            Twitter
                        </button>
                        <button onclick="shareToSocial('facebook', '${item.modelUrl}')">
                            Facebook
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
} 