import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    console.log('TTS API Request ontvangen:', req.body);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Valideer input
        if (!req.body || !req.body.text) {
            return res.status(400).json({ error: 'Geen tekst gevonden in request' });
        }

        // Gebruik een simpeler model met basic input format
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/tts_transformer-nl", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            // Vereenvoudigde request body
            body: JSON.stringify(req.body.text)
        });

        // Log de response voor debugging
        console.log('HuggingFace response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HuggingFace error:', errorText);
            return res.status(500).json({
                error: 'TTS API Error',
                details: errorText
            });
        }

        const audioBuffer = await response.arrayBuffer();
        
        // Stuur audio terug
        res.setHeader('Content-Type', 'audio/wav');
        return res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Server Error',
            message: error.message
        });
    }
} 