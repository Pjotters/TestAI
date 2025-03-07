// Globale variabelen
let isDetecting = false;
let detectInterval;

async function setupWebcam() {
    try {
        const video = document.getElementById('webcam');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640,
                height: 480 
            } 
        });
        video.srcObject = stream;
        await video.play();
        
        const canvas = document.getElementById('overlay');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log('Webcam setup succesvol');
    } catch (error) {
        console.error('Webcam setup error:', error);
    }
}

async function detectObjects() {
    if (!isDetecting) return;
    
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(detectObjects);
        return;
    }
    
    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

        const response = await fetch("https://api-inference.huggingface.co/models/facebook/detr-resnet-50", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: base64Image,
            }),
        });

        if (!response.ok) throw new Error(`API request mislukt: ${response.status}`);

        const result = await response.json();
        drawDetections(result, ctx);
        
        if (isDetecting) {
            setTimeout(detectObjects, 1000);
        }
    } catch (error) {
        console.error('Detectie error:', error);
        if (isDetecting) {
            setTimeout(detectObjects, 1000);
        }
    }
}

function drawDetections(detections, ctx) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Controleer of detections een array is
    if (!Array.isArray(detections)) {
        console.error('Geen geldige detecties ontvangen');
        return;
    }
    
    detections.forEach(detection => {
        // Controleer of we een geldig box object hebben
        if (!detection.box || typeof detection.box !== 'object') {
            console.error('Ongeldige box data:', detection);
            return;
        }
        
        // Haal de coördinaten op uit het box object
        const { xmin, ymin, xmax, ymax } = detection.box;
        
        // Bereken score percentage
        const score = detection.score || 0;
        const label = `${detection.label || 'Object'} ${Math.round(score * 100)}%`;
        
        // Teken box
        ctx.strokeStyle = '#10a37f';
        ctx.lineWidth = 3;
        ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);
        
        // Teken label achtergrond
        ctx.fillStyle = '#10a37f';
        ctx.font = '16px Inter';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(xmin, ymin - 25, textWidth + 10, 25);
        
        // Teken label tekst
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, xmin + 5, ymin - 7);
    });
}

function toggleDetection() {
    const btn = document.getElementById('toggleBtn');
    isDetecting = !isDetecting;
    
    if (isDetecting) {
        btn.textContent = 'Stop Detectie';
        detectObjects();
    } else {
        btn.textContent = 'Start Detectie';
        const canvas = document.getElementById('overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupWebcam();
    const toggleBtn = document.getElementById('toggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleDetection);
    }
});
