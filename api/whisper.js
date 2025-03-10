import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { audio } = req.body;
        
        // Convert base64 to audio buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        
        // Use Whisper model for speech-to-text
        const result = await hf.automaticSpeechRecognition({
            model: 'openai/whisper-large-v3',
            data: audioBuffer
        });

        res.status(200).json({ text: result.text });
    } catch (error) {
        console.error('Whisper API Error:', error);
        res.status(500).json({ error: 'Speech recognition failed' });
    }
} 