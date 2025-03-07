// Globale variabelen
const HF_API_URL = "https://api-inference.huggingface.co/models/GroNLP/gpt2-small-dutch";  // Ander Nederlands model
const HF_API_KEY = config.API_KEY;

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value;
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    userInput.value = '';

    try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/' + HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
                "Origin": window.location.origin
            },
            body: JSON.stringify({
                inputs: message,
                parameters: {
                    max_length: 100,
                    temperature: 0.7,
                    top_p: 0.9,
                    do_sample: true
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request mislukt: ${response.status}`);
        }

        const result = await response.json();
        const generatedText = result[0].generated_text;
        chatMessages.innerHTML += `<div class="bot-message">${generatedText}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
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