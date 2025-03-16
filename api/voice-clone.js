import { HF_API_KEY } from '../config.js';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
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
        const { text } = req.body;

        const response = await fetch("https://api-inference.huggingface.co/models/suno/bark", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    voice_preset: "v2/nl_speaker_1"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HuggingFace API Error:', errorText);
            throw new Error(`HuggingFace API returned ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/wav');
        res.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('Voice Clone API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 