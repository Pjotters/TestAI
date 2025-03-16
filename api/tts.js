import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
    // Log incoming request
    console.log('TTS API Request:', {
        method: req.method,
        body: req.body,
        headers: req.headers
    });

    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Controleer of we text hebben ontvangen
        if (!req.body.text) {
            console.error('Geen tekst ontvangen');
            return res.status(400).json({ error: 'Tekst is verplicht' });
        }

        console.log('Sending request to HuggingFace with text:', req.body.text);

        // Probeer een eenvoudiger model
        const response = await fetch("https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: req.body.text
            })
        });

        // Log de HuggingFace response
        console.log('HuggingFace Response Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('HuggingFace API Error:', errorText);
            return res.status(500).json({ 
                error: 'HuggingFace API Error', 
                details: errorText,
                status: response.status 
            });
        }

        const audioBuffer = await response.arrayBuffer();
        console.log('Received audio buffer of size:', audioBuffer.byteLength);

        res.setHeader('Content-Type', 'audio/wav');
        res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        // Gedetailleerde error logging
        console.error('TTS API Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return res.status(500).json({ 
            error: 'TTS Failed', 
            details: error.message,
            type: error.name
        });
    }
} 