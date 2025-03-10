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
                element: '.chat-container',
                title: 'Chat Assistent',
                text: 'Hier kun je met de AI chatten. Stel vragen en krijg direct antwoord!',
                position: 'bottom'
            },
            2: {
                element: '.voice-controls',
                title: 'Voice Control',
                text: 'Klik op de microfoon om te praten met de AI',
                position: 'top'
            },
            3: {
                element: '.volume-bar',
                title: 'Volume Indicator',
                text: 'Hier zie je je spraakvolume tijdens het opnemen',
                position: 'right'
            },
            4: {
                element: '.developer-section',
                title: 'Voor Developers',
                text: 'Voeg deze AI toe aan je eigen website!',
                position: 'top'
            },
            5: {
                element: '.chat-messages',
                title: 'Chat Geschiedenis',
                text: 'Hier verschijnen alle berichten',
                position: 'bottom'
            }
        };

        const stepInfo = steps[step];
        const element = document.querySelector(stepInfo.element);
        
        if (element) {
            this.highlightElement(element, stepInfo);
        }
    }

    highlightElement(element, stepInfo) {
        const rect = element.getBoundingClientRect();
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'tutorial-highlight';
        this.highlightElement.style.top = `${rect.top + window.scrollY}px`;
        this.highlightElement.style.left = `${rect.left}px`;
        this.highlightElement.style.width = `${rect.width}px`;
        this.highlightElement.style.height = `${rect.height}px`;

        this.showTooltip(stepInfo, rect);

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (stepInfo.example) {
            const exampleContainer = document.createElement('div');
            exampleContainer.className = 'tutorial-example';
            
            switch(stepInfo.example.type) {
                case 'typing':
                    this.examples.createTypingAnimation(exampleContainer, stepInfo.example.text);
                    break;
                case 'button':
                    exampleContainer.innerHTML = `
                        <button class="demo-btn ${stepInfo.example.animation}">
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

        this.positionTooltip(tooltip, stepInfo.position, elementRect);
        
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

// Initialiseer de tutorial
new TutorialManager(); 