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
        this.loadingManager = new LoadingStateManager('modelViewer');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generateBtn')?.addEventListener('click', () => {
            const prompt = document.getElementById('prompt').value;
            this.generate3DModel(prompt);
        });
    }

    async generate3DModel(prompt) {
        try {
            this.loadingManager.startLoading('3D model wordt gegenereerd...', true);
            
            // Eerst checken of we een voorgedefinieerd model hebben
            const mappedModel = MODEL_MAPPINGS[prompt.toLowerCase()];
            if (mappedModel) {
                await this.loadPredefinedModel(mappedModel);
                return;
            }

            // Anders genereren we een nieuw model
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
            this.loadingManager.stopLoading(true);
            
            // Trigger feedback event
            document.dispatchEvent(new CustomEvent('modelGenerated'));
            
            // Track successful generation
            AnalyticsManager.trackEvent('3D Generation', 'Success', prompt);

        } catch (error) {
            console.error('Generatie error:', error);
            this.loadingManager.showError(error);
            
            // Track error
            AnalyticsManager.trackEvent('3D Generation', 'Error', error.message);
        }
    }

    async loadPredefinedModel(modelUrl) {
        try {
            this.displayModel(modelUrl);
            this.loadingManager.stopLoading(true);
        } catch (error) {
            this.loadingManager.showError(error);
        }
    }

    displayModel(modelUrl) {
        const modelViewer = document.getElementById('modelViewer');
        modelViewer.innerHTML = `
            <model-viewer
                src="${modelUrl}"
                camera-controls
                auto-rotate
                ar
                shadow-intensity="1"
                exposure="1"
                style="width: 100%; height: 500px;"
            ></model-viewer>
            <div class="model-controls">
                <button onclick="downloadModel('${modelUrl}')" class="cta-secondary">
                    <span class="material-icons">download</span> Download
                </button>
                <button onclick="shareModel('${modelUrl}')" class="cta-secondary">
                    <span class="material-icons">share</span> Deel
                </button>
            </div>
        `;
    }
}

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

document.getElementById('generateBtn').addEventListener('click', () => {
    const prompt = document.getElementById('modelPrompt').value;
    if (!prompt) {
        alert('Voer eerst een beschrijving in!');
        return;
    }
    generate3DModel(prompt);
}); 