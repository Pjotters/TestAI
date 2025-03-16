import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Gebruik Coqui TTS - een betrouwbaar model
        const response = await fetch("https://api-inference.huggingface.co/models/coqui/xtts-v2", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: {
                    text: req.body.text,
                    language: "nl"
                }
            })
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'HuggingFace API Error',
                status: response.status
            });
        }

        // Direct de binary data doorsturen
        const data = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(Buffer.from(data));

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: error.message });
    }
} 