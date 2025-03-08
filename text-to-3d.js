const API_ENDPOINT = 'https://api-inference.huggingface.co/models/openai/shap-e-img2img';
const HF_API_KEY = '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'; // Vul hier je Hugging Face API key in

const MODEL_MAPPINGS = {
    'auto': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Car/glTF-Binary/Car.glb',
    'stoel': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF-Binary/Chair.glb',
    'tafel': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Table/glTF-Binary/Table.glb',
    'camera': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Camera/glTF-Binary/Camera.glb',
    'robot': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb',
    'boom': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Tree/glTF-Binary/Tree.glb',
    'kubus': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
};

class Text3DGenerator {
    constructor() {
        this.generateBtn = document.getElementById('generateBtn');
        this.modelPrompt = document.getElementById('modelPrompt');
        this.modelViewer = document.getElementById('modelViewer');
        this.status = document.getElementById('status');
        this.loadingSpinner = null;
        
        this.init();
    }

    init() {
        this.generateBtn.addEventListener('click', () => this.generate3DModel());
        this.createLoadingSpinner();
    }

    createLoadingSpinner() {
        this.loadingSpinner = document.createElement('div');
        this.loadingSpinner.className = 'loading-spinner';
        this.loadingSpinner.style.display = 'none';
        this.modelViewer.appendChild(this.loadingSpinner);
    }

    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        this.generateBtn.disabled = show;
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

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: {
                        prompt: prompt,
                        num_inference_steps: 50,
                        guidance_scale: 7.5,
                        negative_prompt: "low quality, bad geometry, distorted"
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
            
            AnalyticsManager.trackEvent('3D Generation', 'Success', prompt);

        } catch (error) {
            console.error('Generatie error:', error);
            
            // Alleen fallback gebruiken als het een API error is
            if (error.message.includes('API request mislukt')) {
                this.showStatus('AI generatie niet beschikbaar, gebruik voorgedefinieerd model', 'info');
                const fallbackModel = this.getFallbackModel(prompt);
                await this.loadPredefinedModel(fallbackModel);
            } else {
                this.showStatus('Er ging iets mis bij het genereren. Probeer het opnieuw.', 'error');
            }
            
            AnalyticsManager.trackEvent('3D Generation', 'Error', error.message);
        } finally {
            this.generateBtn.disabled = false;
        }
    }

    getFallbackModel(prompt) {
        // Zoek naar keywords in de prompt
        const keywords = prompt.toLowerCase().split(' ');
        
        // Probeer eerst een exacte match
        for (const [key, url] of Object.entries(MODEL_MAPPINGS)) {
            if (keywords.includes(key)) {
                return url;
            }
        }
        
        // Anders, zoek naar gedeeltelijke matches
        for (const [key, url] of Object.entries(MODEL_MAPPINGS)) {
            if (keywords.some(word => word.includes(key) || key.includes(word))) {
                return url;
            }
        }
        
        // Standaard fallback model (kubus)
        return MODEL_MAPPINGS.kubus;
    }

    async loadPredefinedModel(modelUrl) {
        try {
            this.showLoading(true);
            await this.displayModel(modelUrl);
            this.showStatus('Voorgedefinieerd 3D model geladen!', 'success');
        } catch (error) {
            this.showStatus('Fout bij laden van voorgedefinieerd model', 'error');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    }

    displayModel(modelUrl) {
        const viewer = document.createElement('model-viewer');
        viewer.src = modelUrl;
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('auto-rotate', '');
        viewer.setAttribute('ar', '');
        viewer.setAttribute('shadow-intensity', '1');
        viewer.style.width = '100%';
        viewer.style.height = '500px';

        // Controls toevoegen
        const controls = this.createModelControls(viewer);
        
        this.modelViewer.innerHTML = '';
        this.modelViewer.appendChild(viewer);
        this.modelViewer.appendChild(controls);
    }

    createModelControls(viewer) {
        const controls = document.createElement('div');
        controls.className = 'model-controls';
        
        // Fullscreen knop
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.innerHTML = '<span class="material-icons">fullscreen</span>';
        fullscreenBtn.onclick = () => this.toggleFullscreen(viewer);
        
        // Reset view knop
        const resetBtn = document.createElement('button');
        resetBtn.innerHTML = '<span class="material-icons">restart_alt</span>';
        resetBtn.onclick = () => this.resetView(viewer);
        
        controls.appendChild(fullscreenBtn);
        controls.appendChild(resetBtn);
        
        return controls;
    }

    showStatus(message, type = 'info') {
        const statusClasses = {
            error: 'error-message',
            success: 'success-message',
            info: 'info-message',
            loading: 'loading-message'
        };
        
        this.status.className = `status-message ${statusClasses[type] || 'info-message'}`;
        this.status.textContent = message;
    }

    toggleFullscreen(viewer) {
        if (!document.fullscreenElement) {
            viewer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    resetView(viewer) {
        viewer.cameraOrbit = "45deg 55deg 2.5m";
        viewer.fieldOfView = "30deg";
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