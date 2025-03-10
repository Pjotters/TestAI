class TutorialPopup {
    constructor() {
        this.popup = document.createElement('div');
        this.popup.className = 'tutorial-popup';
        document.body.appendChild(this.popup);
    }

    show(content, position) {
        this.popup.innerHTML = content;
        this.popup.style.display = 'block';
        // Positie logica hier
    }

    hide() {
        this.popup.style.display = 'none';
    }
} 