import { HF_API_KEY } from '../config.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/mms-tts-nld", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: req.body.text
            })
        });

        if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/wav');
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS API Error:', error);
        res.status(500).json({ error: 'Text-to-Speech failed' });
    }
} 