class TutorialManager {
    constructor() {
        // Eerst checken of we op de juiste pagina zijn
        if (!document.querySelector('.tutorial-section')) {
            console.log('Geen tutorial sectie gevonden op deze pagina');
            return;
        }
        
        // Alleen initialiseren als we op de tutorial pagina zijn
        this.popup = document.createElement('div');
        this.popup.className = 'tutorial-popup';
        document.body.appendChild(this.popup);
        
        this.currentStep = 1;
        this.totalSteps = 5;
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'tutorial-highlight';
        
        this.init();
    }

    init() {
        if (!this.popup) return; // Extra check
        // Toon popup alleen als gebruiker voor het eerst komt
        if (!localStorage.getItem('tutorialShown')) {
            this.showPopup();
        }

        document.getElementById('startTutorial').addEventListener('click', () => {
            this.startTutorial();
        });

        document.getElementById('skipTutorial').addEventListener('click', () => {
            this.hidePopup();
        });
    }

    showPopup() {
        if (!this.popup) return; // Extra check
        document.body.appendChild(this.overlay);
        this.popup.style.display = 'block';
    }

    hidePopup() {
        if (!this.popup) return; // Extra check
        document.body.removeChild(this.overlay);
        this.popup.style.display = 'none';
        localStorage.setItem('tutorialShown', 'true');
    }

    startTutorial() {
        this.hidePopup();
        this.showTutorialStep(1);
        document.body.appendChild(this.highlightElement);
    }

    showTutorialStep(step) {
        const steps = {
            1: {
                element: '.prompt-container',
                title: 'Beschrijf je 3D model',
                text: 'Type hier wat voor 3D model je wilt genereren',
                position: 'bottom',
                example: {
                    type: 'typing',
                    text: 'een rode sportauto met vleugels'
                }
            },
            2: {
                element: '#generateBtn',
                title: 'Genereer je model',
                text: 'Klik hier om je beschrijving om te zetten naar een 3D model',
                position: 'right',
                example: {
                    type: 'button',
                    animation: 'pulse'
                }
            },
            3: {
                element: '#modelViewer',
                title: 'Bekijk je model',
                text: 'Hier verschijnt je gegenereerde 3D model',
                position: 'top',
                example: {
                    type: 'viewer',
                    actions: ['rotate', 'zoom', 'pan']
                }
            },
            4: {
                element: '.model-controls',
                title: 'Pas je model aan',
                text: 'Gebruik deze knoppen om je model te draaien en in te zoomen',
                position: 'left',
                example: {
                    type: 'controls',
                    highlight: true
                }
            },
            5: {
                element: '.gallery-section',
                title: 'Deel je creatie',
                text: 'Deel je mooiste modellen in de galerij!',
                position: 'bottom',
                example: {
                    type: 'gallery',
                    items: ['like', 'comment', 'share']
                }
            }
        };

        const currentStepInfo = steps[step];
        const element = document.querySelector(currentStepInfo.element);
        
        if (!element) return;

        // Highlight het element
        const rect = element.getBoundingClientRect();
        this.highlightElement.style.top = `${rect.top + window.scrollY}px`;
        this.highlightElement.style.left = `${rect.left}px`;
        this.highlightElement.style.width = `${rect.width}px`;
        this.highlightElement.style.height = `${rect.height}px`;

        // Toon tooltip
        this.showTooltip(currentStepInfo, rect);

        // Scroll naar element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Voeg interactief voorbeeld toe
        if (currentStepInfo.example) {
            const exampleContainer = document.createElement('div');
            exampleContainer.className = 'tutorial-example';
            
            switch(currentStepInfo.example.type) {
                case 'typing':
                    this.examples.createTypingAnimation(exampleContainer, currentStepInfo.example.text);
                    break;
                case 'button':
                    exampleContainer.innerHTML = `
                        <button class="demo-btn ${currentStepInfo.example.animation}">
                            <span class="material-icons">3d_rotation</span>
                            Genereer 3D Model
                        </button>
                    `;
                    break;
                case 'viewer':
                    this.examples.createModelViewerAnimation(exampleContainer);
                    break;
                case 'controls':
                    this.examples.createControlsDemo(exampleContainer);
                    break;
                case 'gallery':
                    this.examples.createGalleryInteraction(exampleContainer);
                    break;
            }
            
            this.tooltip.appendChild(exampleContainer);
        }
    }

    showTooltip(stepInfo, elementRect) {
        const tooltip = document.createElement('div');
        tooltip.className = `tutorial-tooltip ${stepInfo.position}`;
        tooltip.innerHTML = `
            <h3>${stepInfo.title}</h3>
            <p>${stepInfo.text}</p>
            <div class="tutorial-nav">
                <button class="prev-btn" ${this.currentStep === 1 ? 'disabled' : ''}>Vorige</button>
                <div class="step-dots">
                    ${this.createStepDots()}
                </div>
                <button class="next-btn">${this.currentStep === this.totalSteps ? 'Afronden' : 'Volgende'}</button>
            </div>
        `;

        // Positie tooltip
        this.positionTooltip(tooltip, stepInfo.position, elementRect);
        
        // Event listeners voor navigatie
        this.setupTooltipNavigation(tooltip);
    }

    createStepDots() {
        return Array.from({length: this.totalSteps}, (_, i) => 
            `<span class="dot ${i + 1 === this.currentStep ? 'active' : ''}"></span>`
        ).join('');
    }

    setupTooltipNavigation(tooltip) {
        tooltip.querySelector('.prev-btn').addEventListener('click', () => {
            if (this.currentStep > 1) {
                this.currentStep--;
                this.showTutorialStep(this.currentStep);
            }
        });

        tooltip.querySelector('.next-btn').addEventListener('click', () => {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showTutorialStep(this.currentStep);
            } else {
                this.endTutorial();
            }
        });
    }

    endTutorial() {
        this.highlightElement.remove();
        document.querySelector('.tutorial-tooltip')?.remove();
        localStorage.setItem('tutorialCompleted', 'true');
    }
}

// Alleen initialiseren als het document geladen is
document.addEventListener('DOMContentLoaded', () => {
    new TutorialManager();
}); 