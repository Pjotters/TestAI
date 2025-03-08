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
        this.initializeEventListeners();
        this.loadGalleryItems();
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

    async loadGalleryItems() {
        try {
            // Simuleer API call (vervang dit later met echte API)
            const items = await this.fetchGalleryItems();
            this.renderGalleryItems(items);
        } catch (error) {
            console.error('Fout bij laden gallery items:', error);
        }
    }

    async fetchGalleryItems() {
        // Voorbeeld data (vervang met echte API call)
        return [
            {
                id: 1,
                type: 'image',
                url: 'path/to/ai-art-1.jpg',
                title: 'AI Kunstwerk 1',
                creator: '@gebruiker1',
                likes: 42,
                tags: ['portret', 'abstract']
            },
            // Meer items...
        ];
    }

    renderGalleryItems(items) {
        this.galleryGrid.innerHTML = items.map(item => this.createGalleryItemHTML(item)).join('');
    }

    createGalleryItemHTML(item) {
        return `
            <div class="gallery-item" data-type="${item.type}">
                ${this.getMediaElement(item)}
                <div class="overlay">
                    <h3>${item.title}</h3>
                    <p>Door: ${item.creator}</p>
                    <div class="item-actions">
                        <button class="like-btn">
                            <span class="material-icons">favorite</span>
                            ${item.likes}
                        </button>
                        <button class="share-btn">
                            <span class="material-icons">share</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getMediaElement(item) {
        switch(item.type) {
            case 'image':
                return `<img src="${item.url}" alt="${item.title}">`;
            case '3d':
                return `<model-viewer src="${item.url}" auto-rotate camera-controls>`;
            case 'animation':
                return `<video src="${item.url}" loop muted autoplay>`;
            default:
                return `<img src="${item.url}" alt="${item.title}">`;
        }
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
}

// Initialiseer de gallery
const gallery = new GalleryManager(); 