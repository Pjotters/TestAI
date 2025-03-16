// Globale variabelen
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const HF_API_KEY = config.API_KEY;

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value;
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    
    // Voeg laad-animatie toe
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'bot-message loading';
    loadingDiv.innerHTML = 'Antwoord wordt gegenereerd<span class="dots">...</span>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    userInput.value = '';

    try {
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: `<s>[INST] Je bent een behulpzame Nederlandse AI assistent. 
Geef een gedetailleerd antwoord op deze vraag in het Nederlands: ${message} [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        // Verwijder laad-animatie
        chatMessages.removeChild(loadingDiv);

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const result = await response.json();
        let generatedText = result[0].generated_text;
        
        // Verwijder de prompt uit het antwoord
        generatedText = generatedText.replace(/\[\/INST\]/, '').trim();
        
        chatMessages.innerHTML += `<div class="bot-message">${generatedText}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        // Verwijder laad-animatie bij error
        chatMessages.removeChild(loadingDiv);
        console.error('Error:', error);
        chatMessages.innerHTML += `<div class="bot-message error">Sorry, er ging iets mis: ${error.message}</div>`;
    }
}

// Start wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    console.log('Chat systeem gereed');
});

// Beeldherkenning met TensorFlow.js
async function analyzeImage() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    if (!file) return;

    const resultsDiv = document.getElementById('imageResults');
    resultsDiv.innerHTML = '<div class="loading">Afbeelding wordt geanalyseerd<span class="dots">...</span></div>';

    try {
        // Converteer afbeelding naar base64
        const base64Image = await getBase64(file);
        
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/resnet-50", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: base64Image,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const result = await response.json();
        displayImageResults(result);
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `<div class="error">Sorry, er ging iets mis: ${error.message}</div>`;
    }
}

// Helper functie om afbeelding naar base64 te converteren
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function displayImageResults(predictions) {
    const resultsDiv = document.getElementById('imageResults');
    resultsDiv.innerHTML = '<h3>Resultaten:</h3>';
    
    predictions.slice(0, 5).forEach((prediction, index) => {
        const percentage = (prediction.score * 100).toFixed(1);
        resultsDiv.innerHTML += `
            <div class="prediction-item">
                <span class="prediction-label">${prediction.label}</span>
                <div class="prediction-bar">
                    <div class="bar" style="width: ${percentage}%"></div>
                    <span class="percentage">${percentage}%</span>
                </div>
            </div>`;
    });
}

// Beeldbewerking met OpenCV.js
function applyFilter(filterType) {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    
    let src = cv.imread(canvas);
    let dst = new cv.Mat();

    switch(filterType) {
        case 'brightness':
            src.convertTo(dst, -1, 1.2, 20);
            break;
        case 'contrast':
            src.convertTo(dst, -1, 1.5, 0);
            break;
        case 'blur':
            cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0);
            break;
        case 'edge':
            cv.Canny(src, dst, 50, 150);
            break;
    }

    cv.imshow(canvas, dst);
    src.delete();
    dst.delete();
}

async function textToSpeech(text) {
    try {
        const response = await fetch("/api/tts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API verzoek mislukt: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();

        return true;
    } catch (error) {
        console.error('Text-to-Speech mislukt:', error);
        return false;
    }
}

async function cloneVoice(audioBlob, text) {
    try {
        // Convert audioBlob to base64
        const reader = new FileReader();
        const audioData = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(audioBlob);
        });

        const response = await fetch("/api/voice-clone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
                audioData,
                text 
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API verzoek mislukt: ${response.status}`);
        }

        const clonedAudioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(clonedAudioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();

        return true;
    } catch (error) {
        console.error('Voice cloning mislukt:', error);
        return false;
    }
} 