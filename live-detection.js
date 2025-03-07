let isDetecting = false;
let detectInterval;

async function setupWebcam() {
    const video = document.getElementById('webcam');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise(resolve => video.onloadedmetadata = () => resolve());
}

async function detectObjects() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('overlay');
    const ctx = canvas.getContext('2d');
    
    // Neem een screenshot van de video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Converteer naar base64
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
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

        const result = await response.json();
        drawDetections(result, ctx);
    } catch (error) {
        console.error('Error:', error);
    }
}

function drawDetections(detections, ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    detections.forEach(detection => {
        const [x0, y0, x1, y1] = detection.box;
        const label = `${detection.label} ${Math.round(detection.score * 100)}%`;
        
        ctx.strokeStyle = '#10a37f';
        ctx.lineWidth = 2;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
        
        ctx.fillStyle = '#10a37f';
        ctx.fillRect(x0, y0 - 20, ctx.measureText(label).width + 10, 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter';
        ctx.fillText(label, x0 + 5, y0 - 5);
    });
}

function toggleDetection() {
    const btn = document.getElementById('toggleBtn');
    isDetecting = !isDetecting;
    
    if (isDetecting) {
        btn.textContent = 'Stop Detectie';
        detectInterval = setInterval(detectObjects, 1000); // Elke seconde detecteren
    } else {
        btn.textContent = 'Start Detectie';
        clearInterval(detectInterval);
    }
}

// Start webcam wanneer de pagina laadt
setupWebcam();
