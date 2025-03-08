async function generate3DModel(prompt) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Bezig met genereren...';
    
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/openai/shap-e", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: 64,
                    guidance_scale: 7.5
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const result = await response.blob();
        const modelUrl = URL.createObjectURL(result);
        displayModel(modelUrl);
        statusElement.textContent = 'Model succesvol gegenereerd!';
        
    } catch (error) {
        console.error('Generatie error:', error);
        statusElement.textContent = `Error: ${error.message}`;
    }
}

function displayModel(modelUrl) {
    const viewer = document.getElementById('modelViewer');
    viewer.innerHTML = `
        <model-viewer
            src="${modelUrl}"
            auto-rotate
            camera-controls
            shadow-intensity="1"
            style="width: 100%; height: 400px;">
        </model-viewer>
    `;
}

document.getElementById('generateBtn').addEventListener('click', () => {
    const prompt = document.getElementById('modelPrompt').value;
    if (!prompt) {
        alert('Voer eerst een beschrijving in!');
        return;
    }
    generate3DModel(prompt);
}); 