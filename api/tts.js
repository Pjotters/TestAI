import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Gebruik Microsoft's Speech-to-Text model
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/speecht5_tts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: {
                    text: req.body.text,
                    model_id: "v3_nl"
                }
            })
        });

        // Log voor debugging
        console.log('HuggingFace Status:', response.status);
        
        if (!response.ok) {
            // Probeer een alternatief model als het eerste faalt
            const backupResponse = await fetch("https://api-inference.huggingface.co/models/facebook/mms-tts-eng", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: req.body.text
                })
            });

            if (!backupResponse.ok) {
                throw new Error(`Both TTS models failed`);
            }

            const backupData = await backupResponse.arrayBuffer();
            res.setHeader('Content-Type', 'audio/wav');
            return res.status(200).send(Buffer.from(backupData));
        }

        const data = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        return res.status(200).send(Buffer.from(data));

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: error.message });
    }
} 