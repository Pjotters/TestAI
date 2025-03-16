const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Basis middleware
app.use(express.json({limit: '2mb'})); // Beperkte grootte voor snellere verwerking

// ESP32 specifieke endpoint
app.post('/api/ar-gesture', async (req, res) => {
    try {
        const { image } = req.body; // Base64 gecodeerde afbeelding
        
        // Snelle response voor real-time AR
        const gesture = await detectGestureFromImage(image);
        
        // Stuur minimale data terug
        res.json({
            gesture: gesture.type,      // bijv. "vuist", "2", "duim_omhoog"
            confidence: gesture.score,   // 0-1 score
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({ error: 'Detectie mislukt' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`AR Gesture API draait op poort ${port}`);
});
