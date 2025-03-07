async function analyzeImage() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    if (!file) return;

    // Laad MobileNet model
    const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    
    // Verwerk afbeelding
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
        const tensor = tf.browser.fromPixels(img)
            .resizeNearestNeighbor([224, 224])
            .expandDims();
        const predictions = await model.predict(tensor).data();
        displayResults(predictions);
    };
} 