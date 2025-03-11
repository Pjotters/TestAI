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
        // Detecteer eerst speciale gebaren
        const specialGesture = this.detectSpecialGesture(hand);
        if (specialGesture) {
            return specialGesture;
        }

        const fingerTips = [4, 8, 12, 16, 20];
        const fingerMids = [3, 7, 11, 15, 19];
        const fingerBases = [2, 6, 10, 14, 18];
        const palmBase = hand.landmarks[0];
        let count = 0;
        
        fingerTips.forEach((tipId, index) => {
            const tip = hand.landmarks[tipId];
            const mid = hand.landmarks[fingerMids[index]];
            const base = hand.landmarks[fingerBases[index]];
            
            // Verbeterde vingerdetectie
            if (index === 0) { // Duim
                // Duim wordt apart gecontroleerd in detectSpecialGesture
                return;
            } else {
                // Voor andere vingers
                const fingerIsExtended = tip[1] < base[1] - 30;
                if (fingerIsExtended) {
                    count++;
                }
            }
        });
        
        return count > 0 ? count : "vuist";
    }

    detectSpecialGesture(hand) {
        const thumb = {
            tip: hand.landmarks[4],
            mid: hand.landmarks[3],
            base: hand.landmarks[2]
        };
        
        // Duim omhoog
        if (this.isThumbUp(thumb, hand.landmarks[0])) {
            return "duim_omhoog";
        }
        
        // Duim omlaag
        if (this.isThumbDown(thumb, hand.landmarks[0])) {
            return "duim_omlaag";
        }
        
        // Duim links
        if (this.isThumbLeft(thumb, hand.landmarks[0])) {
            return "duim_links";
        }
        
        // Duim rechts
        if (this.isThumbRight(thumb, hand.landmarks[0])) {
            return "duim_rechts";
        }
        
        return null;
    }

    isThumbUp(thumb, palm) {
        return thumb.tip[1] < palm[1] && thumb.tip[1] < thumb.base[1];
    }

    isThumbDown(thumb, palm) {
        return thumb.tip[1] > palm[1] && thumb.tip[1] > thumb.base[1];
    }

    isThumbLeft(thumb, palm) {
        return thumb.tip[0] < palm[0] - 30 && 
               Math.abs(thumb.tip[1] - palm[1]) < 50;
    }

    isThumbRight(thumb, palm) {
        return thumb.tip[0] > palm[0] + 30 && 
               Math.abs(thumb.tip[1] - palm[1]) < 50;
    }

    drawHand(hand, ctx) {
        // Haal de kleur van de Start/Stop knop
        const buttonColor = getComputedStyle(this.toggleBtn).backgroundColor;
        
        // Teken de handpunten
        hand.landmarks.forEach(point => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 3 * Math.PI);
            ctx.fillStyle = buttonColor;
            ctx.fill();
        });

        // Teken de verbindingen
        const fingers = [[0,1,2,3,4], [0,5,6,7,8], [0,9,10,11,12], [0,13,14,15,16], [0,17,18,19,20]];
        fingers.forEach(finger => {
            ctx.beginPath();
            ctx.moveTo(hand.landmarks[finger[0]][0], hand.landmarks[finger[0]][1]);
            for (let i = 1; i < finger.length; i++) {
                ctx.lineTo(hand.landmarks[finger[i]][0], hand.landmarks[finger[i]][1]);
            }
            ctx.strokeStyle = buttonColor;
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
                    case "duim_links": gestureText = "👈 Duim links"; break;
                    case "duim_rechts": gestureText = "👉 Duim rechts"; break;
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