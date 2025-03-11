// Gebruik dezelfde API key configuratie als andere modules
const HF_API_URL = "https://api-inference.huggingface.co/models/google/mediapipe-hands";
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
                body: JSON.stringify({ inputs: imageData })
            });

            if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

            const result = await response.json();
            this.drawHandLandmarks(result, ctx);
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

    drawHandLandmarks(results, ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.webcam, 0, 0, this.canvas.width, this.canvas.height);

        if (Array.isArray(results) && results.length > 0) {
            results.forEach(hand => {
                // Teken handpunten
                hand.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.x * this.canvas.width, point.y * this.canvas.height, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#10a37f';
                    ctx.fill();
                });
            });
        }
    }

    displayResults(results) {
        this.resultsDiv.innerHTML = '';
        if (Array.isArray(results) && results.length > 0) {
            const handCount = results.length;
            const gestureElement = document.createElement('div');
            gestureElement.className = 'prediction-item';
            gestureElement.innerHTML = `
                <span class="prediction-label">Gedetecteerde handen: ${handCount}</span>
                <div class="prediction-details">
                    ${results.map((hand, index) => `
                        <p>Hand ${index + 1}: ${hand.length} landmarks gedetecteerd</p>
                    `).join('')}
                </div>
            `;
            this.resultsDiv.appendChild(gestureElement);
        } else {
            this.resultsDiv.innerHTML = '<p>Geen handen gedetecteerd</p>';
        }
    }
}

// Start de applicatie
document.addEventListener('DOMContentLoaded', () => {
    const gestureRecognition = new GestureRecognition();
}); 