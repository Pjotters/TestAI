async function processVideo() {
    const video = document.getElementById('videoInput');
    const canvas = document.getElementById('videoCanvas');
    const ctx = canvas.getContext('2d');

    // Gebruik webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Process frames
    video.addEventListener('play', () => {
        setInterval(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Voer AI analyse uit op het frame
            analyzeFrame(canvas);
        }, 100);
    });
} 