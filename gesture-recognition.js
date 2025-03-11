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

            if (predictions.length > 0) {
                const handGestures = predictions.map(hand => {
                    this.drawHand(hand, ctx);
                    return this.countFingers(hand);
                });
                this.displayResults(handGestures, predictions.length);
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
        const fingerMids = [3, 7, 11, 15, 19]; // middelste kootje
        const fingerBases = [2, 6, 10, 14, 18]; // vingerbases
        const palmBase = hand.landmarks[0]; // basis van de palm
        let count = 0;
        
        // Verbeterde vuistdetectie
        let extendedFingers = 0;
        let totalDistance = 0;
        
        fingerTips.forEach((tipId, index) => {
            const tip = hand.landmarks[tipId];
            const mid = hand.landmarks[fingerMids[index]];
            const base = hand.landmarks[fingerBases[index]];
            
            // Bereken hoeken en afstanden
            const angleBase = Math.atan2(mid[1] - base[1], mid[0] - base[0]);
            const angleTip = Math.atan2(tip[1] - mid[1], tip[0] - mid[0]);
            const fingerAngle = Math.abs(angleTip - angleBase);
            
            const tipToMidDist = Math.hypot(tip[0] - mid[0], tip[1] - mid[1]);
            const midToBaseDist = Math.hypot(mid[0] - base[0], mid[1] - base[1]);
            
            totalDistance += tipToMidDist;
            
            // Vinger is uitgestoken als:
            // 1. De hoek tussen de kootjes relatief recht is
            // 2. De afstand tussen de gewrichten significant is
            // 3. De vingertop hoger is dan de basis (behalve voor de duim)
            const isExtended = (
                (fingerAngle < 0.5 || index === 0) && // Minder streng voor de duim
                tipToMidDist > 20 &&
                midToBaseDist > 20 &&
                (index === 0 ? tip[0] < base[0] : tip[1] < base[1]) // Speciale check voor duim
            );
            
            if (isExtended) {
                count++;
                extendedFingers++;
            }
        });
        
        // Vuistdetectie: als vingers dicht bij elkaar en gebogen zijn
        const isClosedFist = totalDistance < 150 && extendedFingers === 0;
        
        return isClosedFist ? "vuist" : count;
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
        this.resultsDiv.innerHTML = '';
        
        // Toon aantal handen
        const handsElement = document.createElement('div');
        handsElement.className = 'prediction-item';
        handsElement.innerHTML = `
            <span class="prediction-label">Aantal handen</span>
            <div class="prediction-details">
                <p>${handCount}</p>
            </div>
        `;
        this.resultsDiv.appendChild(handsElement);
        
        // Toon gebaar per hand
        if (Array.isArray(totalFingers)) {
            totalFingers.forEach((gesture, index) => {
                const gestureElement = document.createElement('div');
                gestureElement.className = 'prediction-item';
                gestureElement.innerHTML = `
                    <span class="prediction-label">Hand ${index + 1}</span>
                    <div class="prediction-details">
                        <p>${gesture === "vuist" ? "Vuist" : `${gesture} vingers`}</p>
                    </div>
                `;
                this.resultsDiv.appendChild(gestureElement);
            });
        }
    }
}

// Start de applicatie
document.addEventListener('DOMContentLoaded', () => {
    const gestureRecognition = new GestureRecognition();
}); 