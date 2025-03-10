// Gallery Manager Class
class GalleryManager {
    constructor() {
        this.galleryGrid = document.querySelector('.gallery-grid');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.uploadButton = document.querySelector('.upload-btn');
        this.modal = document.querySelector('.modal');
        this.uploadForm = document.querySelector('#uploadForm');
        this.tagInput = document.querySelector('.tag-input input');
        this.tagsContainer = document.querySelector('.tags');
        
        this.currentTags = new Set();
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.items = [];
        
        this.initializeEventListeners();
        this.init();
    }

    initializeEventListeners() {
        // Filter knoppen
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.filterGallery(btn.dataset.filter));
        });

        // Upload modal
        this.uploadButton.addEventListener('click', () => this.toggleModal(true));
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.toggleModal(false);
        });

        // Tag systeem
        this.tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(this.tagInput.value.trim());
            }
        });

        // Upload form
        this.uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpload();
        });
    }

    async init() {
        await this.loadGalleryItems();
        this.setupFilters();
        this.setupLoadMore();
    }

    async loadGalleryItems() {
        try {
            // Simuleer API call (vervang dit met echte backend call)
            const response = await fetch('/api/gallery-items');
            const data = await response.json();
            
            this.items = data.items;
            this.renderItems();
        } catch (error) {
            console.error('Galerij laden mislukt:', error);
        }
    }

    renderItems() {
        const grid = document.querySelector('.gallery-grid');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        const itemsToShow = this.items.slice(startIndex, endIndex);
        
        itemsToShow.forEach(item => {
            const itemElement = this.createGalleryItem(item);
            grid.appendChild(itemElement);
        });
    }

    createGalleryItem(item) {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.dataset.type = item.type;
        
        div.innerHTML = `
            <div class="item-preview">
                ${item.type === '3d' 
                    ? `<model-viewer src="${item.url}" camera-controls auto-rotate></model-viewer>`
                    : `<img src="${item.url}" alt="${item.title}">`
                }
            </div>
            <div class="item-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="item-stats">
                    <span>❤️ ${item.likes}</span>
                    <span>💬 ${item.comments}</span>
                </div>
            </div>
        `;
        
        return div;
    }

    filterGallery(filter) {
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            if (filter === 'all' || item.dataset.type === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleModal(show) {
        this.modal.classList.toggle('active', show);
        if (!show) {
            this.uploadForm.reset();
            this.clearTags();
        }
    }

    addTag(tag) {
        if (!tag || this.currentTags.has(tag)) return;
        
        this.currentTags.add(tag);
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <button onclick="this.parentElement.remove();gallery.removeTag('${tag}')">
                <span class="material-icons">close</span>
            </button>
        `;
        this.tagsContainer.appendChild(tagElement);
        this.tagInput.value = '';
    }

    removeTag(tag) {
        this.currentTags.delete(tag);
    }

    async handleUpload() {
        try {
            // Implementeer hier de upload logica
            const formData = new FormData(this.uploadForm);
            formData.append('tags', Array.from(this.currentTags));
            
            // Simuleer upload (vervang met echte API call)
            await this.uploadToServer(formData);
            
            this.toggleModal(false);
            this.loadGalleryItems(); // Herlaad gallery
        } catch (error) {
            console.error('Upload fout:', error);
        }
    }

    async uploadToServer(formData) {
        // Implementeer hier de server upload
        console.log('Uploading:', formData);
        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    setupFilters() {
        // Implementeer filter logica
    }

    setupLoadMore() {
        // Implementeer load more logica
    }
}

// Initialiseer de gallery
const gallery = new GalleryManager(); 