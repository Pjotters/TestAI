class TutorialManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        
        // Maak de popup elementen aan
        this.createPopupElements();
        
        // Wacht tot de pagina geladen is
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    createPopupElements() {
        // Maak popup container
        this.popup = document.createElement('div');
        this.popup.className = 'tutorial-popup';
        this.popup.innerHTML = `
            <h3>Welkom bij Pjotters-AI!</h3>
            <p>Wil je een korte rondleiding door de features?</p>
            <div class="tutorial-buttons">
                <button id="startTutorial" class="cta-primary">Start Tutorial</button>
                <button id="skipTutorial" class="cta-secondary">Overslaan</button>
            </div>
        `;
        
        // Maak overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        
        // Voeg toe aan body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);
    }

    init() {
        // Toon popup alleen als gebruiker voor het eerst komt
        if (!localStorage.getItem('tutorialShown')) {
            this.showPopup();
        }

        // Event listeners voor knoppen
        document.getElementById('startTutorial')?.addEventListener('click', () => {
            this.startTutorial();
        });

        document.getElementById('skipTutorial')?.addEventListener('click', () => {
            this.hidePopup();
        });
    }

    showPopup() {
        this.overlay.style.display = 'block';
        this.popup.style.display = 'block';
    }

    hidePopup() {
        this.overlay.style.display = 'none';
        this.popup.style.display = 'none';
        localStorage.setItem('tutorialShown', 'true');
    }

    startTutorial() {
        this.hidePopup();
        this.showTutorialStep(1);
    }

    showTutorialStep(step) {
        const steps = {
            1: {
                element: '.feature-card:nth-child(1)',
                title: 'AI Chat Assistant',
                text: 'Begin hier met het chatten met onze AI assistent',
                position: 'bottom'
            },
            2: {
                element: '.feature-card:nth-child(2)',
                title: 'Beeldherkenning',
                text: 'Upload afbeeldingen voor AI analyse',
                position: 'right'
            },
            3: {
                element: '.feature-card:nth-child(3)',
                title: 'Live Detectie',
                text: 'Gebruik je camera voor real-time object herkenning',
                position: 'left'
            },
            4: {
                element: '.feature-card:nth-child(4)',
                title: '3D Generator',
                text: 'Maak 3D modellen van tekst',
                position: 'right'
            },
            5: {
                element: '.feature-card:nth-child(7)',
                title: 'Voice Chat',
                text: 'Praat met de AI via je microfoon',
                position: 'bottom'
            },
     6: {
                element: '.feature-card:nth-child(7)',
                title: 'Speaking Voice',
                text: 'Met jouw stem kan alles!',
                position: 'bottom'
            }

        };

        const stepInfo = steps[step];
        if (!stepInfo) return;

        // Verwijder bestaande tooltip
        document.querySelector('.tutorial-tooltip')?.remove();

        const element = document.querySelector(stepInfo.element);
        if (!element) return;

        // Maak nieuwe tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tutorial-tooltip ${stepInfo.position}`;
        tooltip.innerHTML = `
            <h4>${stepInfo.title}</h4>
            <p>${stepInfo.text}</p>
            <div class="step-dots">
                ${Array(this.totalSteps).fill(0).map((_, i) => 
                    `<div class="dot ${i + 1 === step ? 'active' : ''}"></div>`
                ).join('')}
            </div>
            <div class="tutorial-buttons">
                <button class="prev-btn" ${step === 1 ? 'disabled' : ''}>Vorige</button>
                <button class="next-btn">${step === this.totalSteps ? 'Afronden' : 'Volgende'}</button>
            </div>
        `;

        // Highlight element
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        const rect = element.getBoundingClientRect();
        highlight.style.top = `${rect.top - 5}px`;
        highlight.style.left = `${rect.left - 5}px`;
        highlight.style.width = `${rect.width + 10}px`;
        highlight.style.height = `${rect.height + 10}px`;

        // Voeg toe aan DOM
        document.body.appendChild(highlight);
        document.body.appendChild(tooltip);

        // Positioneer tooltip
        const tooltipRect = tooltip.getBoundingClientRect();
        let top, left;
        switch(stepInfo.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 20;
                break;
        }
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        // Event listeners voor navigatie
        this.setupTooltipNavigation(tooltip);
    }

    setupTooltipNavigation(tooltip) {
        const prevBtn = tooltip.querySelector('.prev-btn');
        const nextBtn = tooltip.querySelector('.next-btn');

        prevBtn?.addEventListener('click', () => {
            if (this.currentStep > 1) {
                // Verwijder huidige highlight en tooltip
                document.querySelector('.tutorial-highlight')?.remove();
                tooltip.remove();
                
                // Ga naar vorige stap
                this.currentStep--;
                this.showTutorialStep(this.currentStep);
            }
        });

        nextBtn?.addEventListener('click', () => {
            if (this.currentStep < this.totalSteps) {
                // Verwijder huidige highlight en tooltip
                document.querySelector('.tutorial-highlight')?.remove();
                tooltip.remove();
                
                // Ga naar volgende stap
                this.currentStep++;
                this.showTutorialStep(this.currentStep);
            } else {
                // Tutorial afronden
                this.endTutorial();
            }
        });
    }

    endTutorial() {
        // Verwijder alle tutorial elementen
        document.querySelector('.tutorial-highlight')?.remove();
        document.querySelector('.tutorial-tooltip')?.remove();
        document.querySelector('.tutorial-overlay')?.remove();
        
        // Sla op dat tutorial is voltooid
        localStorage.setItem('tutorialShown', 'true');
    }
}

// Initialiseer de tutorial
new TutorialManager(); 
