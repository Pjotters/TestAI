class ExperimentLab {
    constructor() {
        this.experimentCards = document.querySelectorAll('.experiment-card');
        this.metrics = {
            processingTime: document.getElementById('processingTime'),
            accuracy: document.getElementById('accuracy'),
            resourceUsage: document.getElementById('resourceUsage')
        };
        
        this.models = {
            'text-to-speech': {
                whisper1: { name: 'Whisper v1', params: ['speed', 'pitch'] },
                whisper2: { name: 'Whisper v2', params: ['speed', 'pitch', 'clarity'] }
            },
            'image-generation': {
                stableDiffusion: { name: 'Stable Diffusion', params: ['steps', 'guidance'] },
                dalle: { name: 'DALL-E', params: ['quality', 'style'] }
            },
            'code-completion': {
                codex: { name: 'Codex', params: ['temperature', 'maxTokens'] }
            }
        };

        this.initializeExperiments();
    }

    initializeExperiments() {
        this.experimentCards.forEach(card => {
            const modelType = card.dataset.model;
            const controls = card.querySelector('.experiment-controls');
            const results = card.querySelector('.experiment-results');
            const runButton = card.querySelector('.run-experiment');

            runButton.addEventListener('click', () => this.runExperiment(modelType, controls, results));
            
            // Model selectie event listener
            const modelSelect = controls.querySelector('.model-select');
            modelSelect.addEventListener('change', () => this.updateParameters(modelType, modelSelect.value, controls));
        });
    }

    async runExperiment(modelType, controls, results) {
        const startTime = performance.now();
        const parameters = this.gatherParameters(controls);
        
        try {
            results.innerHTML = '<div class="loading-spinner"></div>';
            
            // Experiment uitvoeren op basis van modelType
            const output = await this.executeModel(modelType, parameters);
            
            const endTime = performance.now();
            this.updateMetrics(endTime - startTime, output);
            
            this.displayResults(output, results);
        } catch (error) {
            results.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    }

    gatherParameters(controls) {
        const params = {};
        controls.querySelectorAll('.parameter-control input').forEach(input => {
            params[input.dataset.param] = input.value;
        });
        return params;
    }

    async executeModel(modelType, parameters) {
        // Simulatie van model executie (vervang dit met echte API calls)
        switch (modelType) {
            case 'text-to-speech':
                return await this.textToSpeechExperiment(parameters);
            case 'image-generation':
                return await this.imageGenerationExperiment(parameters);
            case 'code-completion':
                return await this.codeCompletionExperiment(parameters);
            default:
                throw new Error('Onbekend experiment type');
        }
    }

    updateMetrics(processingTime, output) {
        this.metrics.processingTime.textContent = `${Math.round(processingTime)}ms`;
        this.metrics.accuracy.textContent = `${output.accuracy || 0}%`;
        this.metrics.resourceUsage.textContent = `${output.resourceUsage || 0}MB`;
    }

    displayResults(output, resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="experiment-output">
                <h4>Resultaten</h4>
                <div class="output-content">${this.formatOutput(output)}</div>
                <div class="output-metrics">
                    <span>Nauwkeurigheid: ${output.accuracy}%</span>
                    <span>Geheugengebruik: ${output.resourceUsage}MB</span>
                </div>
            </div>
        `;
    }

    formatOutput(output) {
        // Output formatteren op basis van type
        if (output.audio) {
            return `<audio controls src="${output.audio}"></audio>`;
        } else if (output.image) {
            return `<img src="${output.image}" alt="Gegenereerde afbeelding">`;
        } else if (output.code) {
            return `<pre><code>${output.code}</code></pre>`;
        }
        return output.text || 'Geen output beschikbaar';
    }

    // Voorbeeld experiment implementaties
    async textToSpeechExperiment(parameters) {
        await this.simulateProcessing();
        return {
            audio: 'path/to/generated/audio.mp3',
            accuracy: 95,
            resourceUsage: 128
        };
    }

    async imageGenerationExperiment(parameters) {
        await this.simulateProcessing();
        return {
            image: 'path/to/generated/image.jpg',
            accuracy: 88,
            resourceUsage: 256
        };
    }

    async codeCompletionExperiment(parameters) {
        await this.simulateProcessing();
        return {
            code: 'function example() {\n    console.log("Generated code");\n}',
            accuracy: 92,
            resourceUsage: 64
        };
    }

    simulateProcessing() {
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Initialiseer het experiment lab
document.addEventListener('DOMContentLoaded', () => {
    const experimentLab = new ExperimentLab();
}); 