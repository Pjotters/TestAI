const HF_API_KEY = config.API_KEY;
const API_ENDPOINT = 'https://api-inference.huggingface.co/models/shap-e/shap-e';

const MODEL_MAPPINGS = {
    'bril': 'https://modelviewer.dev/shared-assets/models/glasses.glb',
    'auto': 'https://modelviewer.dev/shared-assets/models/car.glb',
    'stoel': 'https://modelviewer.dev/shared-assets/models/chair.glb',
    'tafel': 'https://modelviewer.dev/shared-assets/models/table.glb',
    // Voeg meer mappings toe
};

class Text3DGenerator {
    constructor() {
        this.generateBtn = document.getElementById('generateBtn');
        this.modelPrompt = document.getElementById('modelPrompt');
        this.modelViewer = document.getElementById('modelViewer');
        this.status = document.getElementById('status');
        
        this.init();
    }

    init() {
        this.generateBtn.addEventListener('click', () => this.generate3DModel());
    }

    async generate3DModel() {
        const prompt = this.modelPrompt.value.trim();
        
        if (!prompt) {
            this.showStatus('Voer eerst een beschrijving in', 'error');
            return;
        }

        try {
            this.showStatus('Bezig met genereren...', 'loading');
            this.generateBtn.disabled = true;

            // Eerst checken of we een voorgedefinieerd model hebben
            const mappedModel = MODEL_MAPPINGS[prompt.toLowerCase()];
            if (mappedModel) {
                await this.loadPredefinedModel(mappedModel);
                return;
            }

            // Anders genereren we een nieuw model via Hugging Face
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        num_inference_steps: 50,
                        guidance_scale: 7.5
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API request mislukt: ${response.status}`);
            }

            const modelData = await response.blob();
            const modelUrl = URL.createObjectURL(modelData);
            
            this.displayModel(modelUrl);
            this.showStatus('3D model succesvol gegenereerd!', 'success');
            
            // Trigger feedback event
            document.dispatchEvent(new CustomEvent('modelGenerated'));
            
            // Track successful generation
            AnalyticsManager.trackEvent('3D Generation', 'Success', prompt);

        } catch (error) {
            this.showStatus('Er ging iets mis bij het genereren', 'error');
            console.error('Generatie error:', error);
            
            // Track error
            AnalyticsManager.trackEvent('3D Generation', 'Error', error.message);
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    async loadPredefinedModel(modelUrl) {
        try {
            this.displayModel(modelUrl);
            this.showStatus('3D model succesvol geladen!', 'success');
        } catch (error) {
            this.showStatus('Er ging iets mis bij het laden', 'error');
        }
    }

    displayModel(modelUrl) {
        const modelViewer = document.createElement('model-viewer');
        modelViewer.src = modelUrl;
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('ar', '');
        
        this.modelViewer.innerHTML = '';
        this.modelViewer.appendChild(modelViewer);
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status-message ${type}`;
    }
}

// Initialiseer de generator wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    new Text3DGenerator();
});

// Verbeterde download functie voor verschillende formaten
async function downloadModel(url, format) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `generated-model.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error(`Download error: ${error}`);
        alert(`Download mislukt: ${error.message}`);
    }
}

function displayGeneratedImage(imageUrl) {
    const viewer = document.getElementById('modelViewer');
    viewer.innerHTML = `
        <img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" />
        <p class="status-message">3D conversie wordt voorbereid...</p>
    `;
}

async function convertToGLB(imageUrl, prompt) {
    const statusElement = document.getElementById('status');
    const modelViewer = document.getElementById('modelViewer');
    
    try {
        // Bepaal welk 3D model we moeten laden gebaseerd op de prompt
        let modelUrl = 'https://modelviewer.dev/shared-assets/models/default.glb'; // standaard model
        
        for (const [keyword, url] of Object.entries(MODEL_MAPPINGS)) {
            if (prompt.toLowerCase().includes(keyword)) {
                modelUrl = url;
                break;
            }
        }

        // Toon 3D preview met het juiste model
        modelViewer.innerHTML = `
            <model-viewer
                src="${modelUrl}"
                environment-image="neutral"
                camera-controls
                auto-rotate
                ar
                shadow-intensity="1"
                style="width: 100%; height: 400px;">
            </model-viewer>
        `;

        statusElement.textContent = '3D model succesvol geladen!';
        
    } catch (error) {
        console.error('3D conversie error:', error);
        statusElement.textContent = `3D conversie mislukt: ${error.message}`;
    }
}

// Helper functie voor het downloaden van het GLB bestand
async function downloadGLB() {
    const modelViewer = document.querySelector('model-viewer');
    const glbBlob = await modelViewer.exportScene();
    const downloadUrl = URL.createObjectURL(glbBlob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'model.glb';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
}

// Fullscreen functie
function toggleFullscreen(viewer) {
    if (!document.fullscreenElement) {
        viewer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Reset view functie
function resetView(viewer) {
    viewer.cameraOrbit = "45deg 55deg 2.5m";
    viewer.fieldOfView = "30deg";
}

// Toggle auto-rotate
function toggleAutoRotate(viewer) {
    viewer.autoRotate = !viewer.autoRotate;
} 