async function generate3DModel(prompt) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = 'Bezig met genereren...';
    
    try {
        const response = await fetch("https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    negative_prompt: "blurry, bad quality, distorted",
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    width: 512,
                    height: 512
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        
        // Toon eerst de gegenereerde afbeelding
        displayGeneratedImage(imageUrl);
        
        // Start de 3D conversie
        convertToGLB(imageUrl);
        
    } catch (error) {
        console.error('Generatie error:', error);
        statusElement.textContent = `Error: ${error.message}`;
    }
}

function displayGeneratedImage(imageUrl) {
    const viewer = document.getElementById('modelViewer');
    viewer.innerHTML = `
        <img src="${imageUrl}" style="max-width: 100%; border-radius: 8px;" />
        <p class="status-message">3D conversie wordt voorbereid...</p>
    `;
}

async function convertToGLB(imageUrl) {
    // Hier kunnen we later de 3D conversie implementeren
    // Voor nu tonen we een bericht dat dit nog in ontwikkeling is
    const statusElement = document.getElementById('status');
    statusElement.innerHTML = `
        <p>🚧 3D conversie functionaliteit is nog in ontwikkeling.</p>
        <p>De afbeelding is wel succesvol gegenereerd!</p>
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