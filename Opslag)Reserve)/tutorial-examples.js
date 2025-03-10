class TutorialExamples {
    constructor() {
        this.examples = {
            promptExample: {
                text: "een rode sportauto met vleugels",
                animation: this.createTypingAnimation
            },
            modelViewerExample: {
                actions: ["rotate", "zoom", "pan"],
                animation: this.createModelViewerAnimation
            },
            galleryExample: {
                items: ["like", "comment", "share"],
                animation: this.createGalleryInteraction
            }
        };
    }

    createTypingAnimation(container) {
        const cursor = document.createElement('div');
        cursor.className = 'tutorial-cursor';
        
        const text = document.createElement('div');
        text.className = 'tutorial-typing';
        text.textContent = this.examples.promptExample.text;
        
        container.appendChild(cursor);
        container.appendChild(text);
    }

    createModelViewerAnimation(container) {
        const viewer = document.createElement('div');
        viewer.className = 'tutorial-model-viewer';
        
        this.examples.modelViewerExample.actions.forEach(action => {
            const hint = document.createElement('div');
            hint.className = `viewer-hint ${action}`;
            hint.innerHTML = `
                <span class="material-icons">${this.getActionIcon(action)}</span>
                <span class="hint-text">${this.getActionText(action)}</span>
            `;
            viewer.appendChild(hint);
        });
        
        container.appendChild(viewer);
    }

    getActionIcon(action) {
        const icons = {
            rotate: '3d_rotation',
            zoom: 'zoom_in',
            pan: 'pan_tool'
        };
        return icons[action];
    }

    getActionText(action) {
        const texts = {
            rotate: 'Draai het model',
            zoom: 'Zoom in/uit',
            pan: 'Verplaats het model'
        };
        return texts[action];
    }

    createGalleryInteraction(container) {
        const gallery = document.createElement('div');
        gallery.className = 'tutorial-gallery';
        
        this.examples.galleryExample.items.forEach(item => {
            const button = document.createElement('button');
            button.className = `gallery-action ${item}`;
            button.innerHTML = `
                <span class="material-icons">${this.getGalleryIcon(item)}</span>
                <span class="action-text">${this.getGalleryText(item)}</span>
            `;
            gallery.appendChild(button);
        });
        
        container.appendChild(gallery);
    }

    getGalleryIcon(item) {
        const icons = {
            like: 'favorite',
            comment: 'chat',
            share: 'share'
        };
        return icons[item];
    }

    getGalleryText(item) {
        const texts = {
            like: 'Like dit model',
            comment: 'Plaats een reactie',
            share: 'Deel met anderen'
        };
        return texts[item];
    }
}

// Voeg de voorbeelden toe aan de TutorialManager
TutorialManager.prototype.showExample = function(step) {
    const examples = new TutorialExamples();
    const container = document.createElement('div');
    container.className = 'tutorial-example';
    
    switch(step) {
        case 1:
            examples.examples.promptExample.animation(container);
            break;
        case 2:
            examples.createModelViewerAnimation(container);
            break;
        case 3:
            examples.createGalleryInteraction(container);
            break;
    }
    
    this.tooltip.appendChild(container);
}; 