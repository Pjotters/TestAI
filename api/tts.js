import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/speecht5_tts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: req.body.text
            })
        });

        if (!response.ok) {
            console.error('HuggingFace API Error:', await response.text());
            throw new Error(`HuggingFace API returned ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 