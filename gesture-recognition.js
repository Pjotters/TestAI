// Gebruik dezelfde API key configuratie als andere modules
const HF_API_URL = "https://api-inference.huggingface.co/models/yolov7-object-detection/yolov7";
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
                body: JSON.stringify({
                    inputs: imageData
                })
            });

            if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

            const result = await response.json();
            this.drawDetections(result, ctx);
            this.displayResults(result);

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

    drawDetections(detections, ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(this.webcam, 0, 0, this.canvas.width, this.canvas.height);

        detections.forEach(detection => {
            const [x0, y0, x1, y1] = detection.box;
            const label = detection.label;
            const score = detection.score;

            // Teken bounding box
            ctx.strokeStyle = '#10a37f';
            ctx.lineWidth = 2;
            ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

            // Teken label
            ctx.fillStyle = '#10a37f';
            ctx.font = '16px Arial';
            ctx.fillText(`${label} (${Math.round(score * 100)}%)`, x0, y0 - 5);
        });
    }

    displayResults(detections) {
        this.resultsDiv.innerHTML = '';
        if (detections && detections.length > 0) {
            detections.forEach(detection => {
                const gestureElement = document.createElement('div');
                gestureElement.className = 'prediction-item';
                gestureElement.innerHTML = `
                    <span class="prediction-label">${detection.label}</span>
                    <div class="prediction-details">
                        <p>Betrouwbaarheid: ${Math.round(detection.score * 100)}%</p>
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