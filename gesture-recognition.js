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
        const fingerTips = [4, 8, 12, 16, 20];
        const fingerMids = [3, 7, 11, 15, 19];
        const fingerBases = [2, 6, 10, 14, 18];
        const palmBase = hand.landmarks[0];
        let count = 0;
        
        // Verbeterde vuistdetectie
        let extendedFingers = 0;
        let fingerDistances = [];
        
        // Bereken eerst alle vinger-tot-palm afstanden
        fingerTips.forEach((tipId, index) => {
            const tip = hand.landmarks[tipId];
            const mid = hand.landmarks[fingerMids[index]];
            const base = hand.landmarks[fingerBases[index]];
            
            // Afstand tussen vingertop en palm
            const tipToPalmDist = Math.hypot(
                tip[0] - palmBase[0],
                tip[1] - palmBase[1]
            );
            
            // Afstand tussen basis en palm
            const baseToPalmDist = Math.hypot(
                base[0] - palmBase[0],
                base[1] - palmBase[1]
            );
            
            // Verhouding tussen deze afstanden
            const ratio = tipToPalmDist / baseToPalmDist;
            fingerDistances.push(ratio);
            
            // Check voor uitgestoken vinger
            const isExtended = ratio > 1.3; // Vinger is significant langer dan basis
            
            if (isExtended) {
                count++;
                extendedFingers++;
            }
        });
        
        // Vuistdetectie: alle vingers hebben vergelijkbare ratio's en zijn dicht bij de palm
        const avgRatio = fingerDistances.reduce((a, b) => a + b, 0) / fingerDistances.length;
        const maxDeviation = Math.max(...fingerDistances.map(r => Math.abs(r - avgRatio)));
        
        const isClosedFist = maxDeviation < 0.2 && avgRatio < 1.2;
        
        // Detecteer speciale gebaren
        const specialGesture = this.detectSpecialGesture(hand);
        if (specialGesture) {
            return specialGesture;
        }
        
        return isClosedFist ? "vuist" : count;
    }

    detectSpecialGesture(hand) {
        const thumb = {
            tip: hand.landmarks[4],
            mid: hand.landmarks[3],
            base: hand.landmarks[2]
        };
        
        const indexFinger = {
            tip: hand.landmarks[8],
            mid: hand.landmarks[7],
            base: hand.landmarks[6]
        };
        
        // Duim omhoog detectie
        if (this.isThumbUp(thumb, hand.landmarks[0])) {
            return "duim_omhoog";
        }
        
        // Duim omlaag detectie
        if (this.isThumbDown(thumb, hand.landmarks[0])) {
            return "duim_omlaag";
        }
        
        // Peace teken
        if (this.isPeaceSign(indexFinger, hand.landmarks[12])) {
            return "peace";
        }
        
        // OK teken
        if (this.isOkSign(thumb, indexFinger)) {
            return "ok";
        }
        
        return null;
    }

    isThumbUp(thumb, palm) {
        return thumb.tip[1] < palm[1] && thumb.tip[1] < thumb.base[1];
    }

    isThumbDown(thumb, palm) {
        return thumb.tip[1] > palm[1] && thumb.tip[1] > thumb.base[1];
    }

    isPeaceSign(indexFinger, middleFinger) {
        return indexFinger.tip[1] < indexFinger.base[1] && 
               middleFinger[1] < indexFinger.base[1] &&
               Math.abs(indexFinger.tip[0] - middleFinger[0]) > 30;
    }

    isOkSign(thumb, indexFinger) {
        const distance = Math.hypot(
            thumb.tip[0] - indexFinger.tip[0],
            thumb.tip[1] - indexFinger.tip[1]
        );
        return distance < 20;
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

    displayResults(handGestures, handCount) {
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
        
        // Toon gebaren per hand
        if (Array.isArray(handGestures)) {
            handGestures.forEach((gesture, index) => {
                const gestureElement = document.createElement('div');
                gestureElement.className = 'prediction-item';
                
                let gestureText;
                switch(gesture) {
                    case "duim_omhoog": gestureText = "👍 Duim omhoog"; break;
                    case "duim_omlaag": gestureText = "👎 Duim omlaag"; break;
                    case "peace": gestureText = "✌️ Peace"; break;
                    case "ok": gestureText = "👌 OK"; break;
                    case "vuist": gestureText = "✊ Vuist"; break;
                    default: gestureText = `${gesture} vingers`;
                }
                
                gestureElement.innerHTML = `
                    <span class="prediction-label">Hand ${index + 1}</span>
                    <div class="prediction-details">
                        <p>${gestureText}</p>
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