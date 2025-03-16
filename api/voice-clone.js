import { HF_API_KEY } from '../config.js';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = new formidable.IncomingForm();
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        const audioFile = files.audio;
        const text = fields.text;

        const formData = new FormData();
        formData.append('audio', audioFile);
        formData.append('text', text);

        const response = await fetch("https://api-inference.huggingface.co/models/facebook/fastspeech2-en-ljspeech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/wav');
        res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('Voice Clone API Error:', error);
        res.status(500).json({ error: 'Voice cloning failed' });
    }
} 