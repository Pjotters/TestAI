// Globale variabelen
const HF_API_KEY = config.API_KEY;

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
    
    detections.forEach(detection => {
        const [x0, y0, x1, y1] = detection.box;
        const label = `${detection.label} ${Math.round(detection.score * 100)}%`;
        
        ctx.strokeStyle = '#10a37f';
        ctx.lineWidth = 3;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        
        ctx.fillStyle = '#10a37f';
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x0, y0 - 25, textWidth + 10, 25);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Inter';
        ctx.fillText(label, x0 + 5, y0 - 7);
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

// Start webcam wanneer de pagina laadt
document.addEventListener('DOMContentLoaded', setupWebcam);
