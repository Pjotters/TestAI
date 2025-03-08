const HF_API_KEY = config.API_KEY;

const MODEL_MAPPINGS = {
    'bril': 'https://modelviewer.dev/shared-assets/models/glasses.glb',
    'auto': 'https://modelviewer.dev/shared-assets/models/car.glb',
    'stoel': 'https://modelviewer.dev/shared-assets/models/chair.glb',
    'tafel': 'https://modelviewer.dev/shared-assets/models/table.glb',
    // Voeg meer mappings toe
};

async function generate3DModel(prompt) {
    const statusElement = document.getElementById('status');
    const modelViewer = document.getElementById('modelViewer');
    
    // Preview tijdens genereren
    modelViewer.innerHTML = `
        <div class="generation-preview">
            <div class="loading-spinner"></div>
            <p>3D model wordt gegenereerd...</p>
            <div class="progress-bar">
                <div class="update-bar" style="width: 0%"></div>
            </div>
        </div>
    `;

    try {
        // Verbeterde parameters voor hogere kwaliteit
        const response = await fetch("https://api-inference.huggingface.co/models/openai/shap-e", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: 128,
                    guidance_scale: 15.0,
                    noise_level: 0.1,
                    num_views: 12,
                    image_size: 256,
                    output_formats: ["glb", "obj", "usdz"]
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const result = await response.json();
        
        // Toon het 3D model met verbeterde viewer opties
        modelViewer.innerHTML = `
            <model-viewer
                src="${result.glb_url}"
                camera-controls
                auto-rotate
                ar
                shadow-intensity="1"
                exposure="1"
                environment-image="neutral"
                camera-orbit="45deg 55deg 2.5m"
                field-of-view="30deg"
                class="interactive-viewer"
                style="width: 100%; height: 400px;">
                <button class="fullscreen-btn" onclick="toggleFullscreen(this.parentElement)">
                    <span class="material-icons">fullscreen</span>
                </button>
                <div class="model-controls">
                    <button onclick="resetView(this.parentElement.parentElement)">
                        <span class="material-icons">restart_alt</span>
                    </button>
                    <button onclick="toggleAutoRotate(this.parentElement.parentElement)">
                        <span class="material-icons">rotation_3d</span>
                    </button>
                </div>
                <div class="progress-bar hide" slot="progress-bar">
                    <div class="update-bar"></div>
                </div>
            </model-viewer>
            <div class="controls">
                <button onclick="downloadModel('${result.glb_url}', 'glb')" class="cta-primary">Download GLB</button>
                <button onclick="downloadModel('${result.obj_url}', 'obj')" class="cta-secondary">Download OBJ</button>
                <button onclick="downloadModel('${result.usdz_url}', 'usdz')" class="cta-secondary">Download USDZ</button>
            </div>
        `;

        statusElement.textContent = '3D model succesvol gegenereerd!';
        
    } catch (error) {
        console.error('Generatie error:', error);
        statusElement.textContent = `Error: ${error.message}`;
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