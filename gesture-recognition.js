// Gebruik TensorFlow.js en HandPose model
class GestureRecognition {
    constructor() {
        this.isDetecting = false;
        this.webcam = document.getElementById('webcam');
        this.canvas = document.getElementById('overlay');
        this.toggleBtn = document.getElementById('toggleBtn');
        this.resultsDiv = document.getElementById('gestureResults');
        this.model = null;
        
        this.setupCamera();
        this.setupEventListeners();
        this.loadModel();
    }

    async loadModel() {
        try {
            this.resultsDiv.innerHTML = 'Model wordt geladen...';
            this.model = await handpose.load();
            this.resultsDiv.innerHTML = 'Model geladen. Klik op Start Herkenning.';
        } catch (error) {
            console.error('Model laden mislukt:', error);
            this.resultsDiv.innerHTML = 'Model laden mislukt. Vernieuw de pagina.';
        }
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
        if (!this.isDetecting || !this.model) return;

        try {
            const predictions = await this.model.estimateHands(this.webcam);
            const ctx = this.canvas.getContext('2d');
            
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.webcam, 0, 0, this.canvas.width, this.canvas.height);

            let totalFingers = 0;
            if (predictions.length > 0) {
                predictions.forEach(hand => {
                    this.drawHand(hand, ctx);
                    totalFingers += this.countFingers(hand);
                });
                this.displayResults(totalFingers, predictions.length);
            } else {
                this.resultsDiv.innerHTML = '<p>Geen handen gedetecteerd</p>';
            }

            if (this.isDetecting) {
                requestAnimationFrame(() => this.detectGestures());
            }
        } catch (error) {
            console.error('Herkenning mislukt:', error);
            if (this.isDetecting) {
                setTimeout(() => this.detectGestures(), 1000);
            }
        }
    }

    countFingers(hand) {
        const fingerTips = [4, 8, 12, 16, 20]; // landmarks voor vingertoppen
        const fingerBases = [2, 6, 10, 14, 18]; // landmarks voor vingerbases
        const palmBase = hand.landmarks[0]; // basis van de palm
        let count = 0;

        // Check voor gesloten vuist (alle vingers gebogen)
        let isFist = true;
        
        fingerTips.forEach((tipId, index) => {
            const tip = hand.landmarks[tipId];
            const base = hand.landmarks[fingerBases[index]];
            
            // Bereken de afstand tussen vingertop en basis
            const tipToPalmY = Math.abs(tip[1] - palmBase[1]);
            const baseToTipY = Math.abs(base[1] - tip[1]);
            
            // Vinger is uitgestoken als:
            // 1. De vingertop significant hoger is dan de basis
            // 2. De afstand tussen top en palm groot genoeg is
            if (tip[1] < base[1] && baseToTipY > 30 && tipToPalmY > 40) {
                count++;
                isFist = false;
            }
        });

        return isFist ? 0 : count;
    }

    drawHand(hand, ctx) {
        // Teken handpunten
        hand.landmarks.forEach(point => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#10a37f';
            ctx.fill();
        });

        // Teken verbindingen
        const fingers = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20]];
        fingers.forEach(finger => {
            ctx.beginPath();
            ctx.moveTo(hand.landmarks[finger[0]][0], hand.landmarks[finger[0]][1]);
            for (let i = 1; i < finger.length; i++) {
                ctx.lineTo(hand.landmarks[finger[i]][0], hand.landmarks[finger[i]][1]);
            }
            ctx.strokeStyle = '#10a37f';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    displayResults(totalFingers, handCount) {
        this.resultsDiv.innerHTML = `
            <div class="prediction-item">
                <span class="prediction-label">Aantal handen</span>
                <div class="prediction-details">
                    <p>${handCount}</p>
                </div>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Totaal aantal vingers</span>
                <div class="prediction-details">
                    <p>${totalFingers}</p>
                </div>
            </div>
        `;
    }
}

// Start de applicatie
document.addEventListener('DOMContentLoaded', () => {
    const gestureRecognition = new GestureRecognition();
}); 