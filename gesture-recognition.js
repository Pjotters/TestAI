// Gebruik dezelfde API key configuratie als andere modules
const HF_API_URL = "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32";
const HF_API_KEY = config.API_KEY;

class GestureRecognition {
    constructor() {
        this.isDetecting = false;
        this.webcam = document.getElementById('webcam');
        this.canvas = document.getElementById('overlay');
        this.toggleBtn = document.getElementById('toggleBtn');
        this.resultsDiv = document.getElementById('gestureResults');
        
        // Vooraf gedefinieerde gebaren voor CLIP model
        this.gestures = [
            "a hand making thumbs up gesture",
            "a hand waving hello",
            "a hand making peace sign",
            "a hand pointing",
            "a closed fist",
            "an open palm",
            "counting numbers with fingers",
            "sign language letter A",
            "sign language letter B",
            "sign language letter C"
        ];
        
        this.setupCamera();
        this.setupEventListeners();
    }

    async setupCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 } 
            });
            this.webcam.srcObject = stream;
            this.canvas.width = 640;
            this.canvas.height = 480;
        } catch (error) {
            console.error('Camera toegang mislukt:', error);
            this.resultsDiv.innerHTML = 'Camera toegang is vereist voor gebarenherkenning';
        }
    }

    setupEventListeners() {
        this.toggleBtn.addEventListener('click', () => {
            this.isDetecting = !this.isDetecting;
            this.toggleBtn.textContent = this.isDetecting ? 'Stop Herkenning' : 'Start Herkenning';
            if (this.isDetecting) {
                this.detectGestures();
            }
        });
    }

    async detectGestures() {
        if (!this.isDetecting) return;

        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.webcam, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.canvas.toDataURL('image/jpeg').split(',')[1];

        try {
            const response = await fetch(HF_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: {
                        image: imageData,
                        text: this.gestures
                    }
                })
            });

            if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

            const result = await response.json();
            this.displayGestureResults(result);

            if (this.isDetecting) {
                setTimeout(() => this.detectGestures(), 500);
            }
        } catch (error) {
            console.error('Herkenning mislukt:', error);
            if (this.isDetecting) {
                setTimeout(() => this.detectGestures(), 1000);
            }
        }
    }

    displayGestureResults(results) {
        this.resultsDiv.innerHTML = '';
        if (results && Array.isArray(results)) {
            // Sorteer op hoogste score
            const bestMatches = results
                .map((score, index) => ({
                    gesture: this.gestures[index].replace('a hand making ', '')
                        .replace('sign language ', '')
                        .replace('a ', '')
                        .replace('an ', ''),
                    score: score
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3); // Toon top 3 matches

            bestMatches.forEach(match => {
                const gestureElement = document.createElement('div');
                gestureElement.className = 'prediction-item';
                gestureElement.innerHTML = `
                    <span class="prediction-label">${match.gesture}</span>
                    <div class="prediction-details">
                        <p>Betrouwbaarheid: ${Math.round(match.score * 100)}%</p>
                    </div>
                `;
                this.resultsDiv.appendChild(gestureElement);
            });
        } else {
            this.resultsDiv.innerHTML = '<p>Geen gebaren gedetecteerd</p>';
        }
    }
}

// Start de applicatie
document.addEventListener('DOMContentLoaded', () => {
    const gestureRecognition = new GestureRecognition();
}); 