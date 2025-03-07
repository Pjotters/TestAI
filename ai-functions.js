// Gebruik de Transformers.js pipeline
const { pipeline } = window.transformers;

// Wacht tot Transformers.js geladen is
let model;

async function initializeAI() {
    try {
        // Wacht tot de pipeline beschikbaar is
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/dist/transformers.min.js');
        model = await pipeline('text-generation', 'Xenova/gpt2');
        console.log('AI model geladen!');
    } catch (error) {
        console.error('Error bij laden AI:', error);
    }
}

// Start initialisatie wanneer de pagina geladen is
window.addEventListener('load', initializeAI);

// Chatbot functie met Hugging Face
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value;
    if (!message) return;

    // Toon gebruikersbericht
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    userInput.value = '';

    try {
        if (!model) {
            throw new Error('AI model is nog niet geladen');
        }

        // Genereer antwoord
        const result = await model(message, {
            max_length: 50,
            temperature: 0.7
        });
        
        // Toon AI antwoord
        const response = result[0].generated_text;
        chatMessages.innerHTML += `<div class="bot-message">${response}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error:', error);
        chatMessages.innerHTML += `<div class="bot-message error">Sorry, er ging iets mis: ${error.message}</div>`;
    }
}

// Beeldherkenning met TensorFlow.js
async function analyzeImage() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
        // Laad MobileNet model
        const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
        
        // Voorbewerk de afbeelding
        const tensor = tf.browser.fromPixels(img)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims();

        // Maak voorspelling
        const predictions = await model.predict(tensor).data();
        displayImageResults(predictions);
    };
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

function displayImageResults(predictions) {
    const resultsDiv = document.getElementById('imageResults');
    resultsDiv.innerHTML = '<h3>Resultaten:</h3>';
    
    // Toon top 3 voorspellingen
    for (let i = 0; i < 3; i++) {
        resultsDiv.innerHTML += `<p>Voorspelling ${i + 1}: ${predictions[i]}</p>`;
    }
} 