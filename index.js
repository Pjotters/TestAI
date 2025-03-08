class HomePageManager {
    constructor() {
        this.featureCards = document.querySelectorAll('.feature-card');
        this.initializeFeatureCards();
        this.setupScrollAnimations();
    }

    initializeFeatureCards() {
        this.featureCards.forEach(card => {
            // Hover effecten
            card.addEventListener('mouseenter', () => this.handleCardHover(card, true));
            card.addEventListener('mouseleave', () => this.handleCardHover(card, false));

            // Click handling (naast de onclick in HTML)
            const button = card.querySelector('.cta-primary');
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Voorkom dubbele navigatie
                const href = card.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.handleButtonClick(href);
            });
        });
    }

    handleCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-10px)';
            const button = card.querySelector('.cta-primary');
            button.style.backgroundColor = 'var(--primary-hover)';
        } else {
            card.style.transform = 'translateY(0)';
            const button = card.querySelector('.cta-primary');
            button.style.backgroundColor = 'var(--primary)';
        }
    }

    handleButtonClick(href) {
        // Voeg een loading animatie toe voordat we navigeren
        const button = event.target;
        const originalText = button.textContent;
        button.innerHTML = '<span class="material-icons loading">sync</span>';
        
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }

    setupScrollAnimations() {
        // Fade-in animatie bij scrollen
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        this.featureCards.forEach(card => {
            card.classList.add('fade-in');
            observer.observe(card);
        });
    }
}

// Initialiseer de homepage manager
document.addEventListener('DOMContentLoaded', () => {
    const homeManager = new HomePageManager();
}); 