import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Log de binnenkomende request
        console.log('TTS Request:', req.body.text);

        // Gebruik een betrouwbaar en simpel model
        const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: req.body.text
            })
        });

        // Check direct de response status
        if (!response.ok) {
            // Lees de error response één keer
            const errorBody = await response.text();
            console.error('HuggingFace API Error:', errorBody);
            return res.status(500).json({
                error: 'TTS API Error',
                message: errorBody
            });
        }

        // Lees de success response één keer
        const audioBuffer = await response.arrayBuffer();
        
        // Stuur de audio terug
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS Server Error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
} 