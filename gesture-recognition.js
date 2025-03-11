// Gebruik dezelfde API key configuratie als andere modules
const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/hand-pose-recognition-0.1";
const HF_API_KEY = config.API_KEY;

class GestureRecognition {
    constructor() {
        this.isDetecting = false;
        this.webcam = document.getElementById('webcam');
        this.canvas = document.getElementById('overlay');
        this.toggleBtn = document.getElementById('toggleBtn');
        this.resultsDiv = document.getElementById('gestureResults');
        
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
            this.resultsDiv.innerHTML = 'Camera toegang is vereist voor gebarentaal herkenning';
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
                body: JSON.stringify({ inputs: imageData })
            });

            if (!response.ok) throw new Error('API verzoek mislukt');

            const result = await response.json();
            this.displayResults(result);

            // Volgende frame
            if (this.isDetecting) {
                setTimeout(() => this.detectGestures(), 100);
            }
        } catch (error) {
            console.error('Herkenning mislukt:', error);
            if (this.isDetecting) {
                setTimeout(() => this.detectGestures(), 1000);
            }
        }
    }

    displayResults(results) {
        this.resultsDiv.innerHTML = '';
        if (Array.isArray(results) && results.length > 0) {
            results.forEach(gesture => {
                const gestureElement = document.createElement('div');
                gestureElement.className = 'prediction-item';
                gestureElement.innerHTML = `
                    <span class="prediction-label">${gesture.label}</span>
                    <div class="prediction-bar">
                        <div class="bar" style="width: ${gesture.score * 100}%"></div>
                        <span class="percentage">${Math.round(gesture.score * 100)}%</span>
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