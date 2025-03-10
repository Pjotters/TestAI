import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message } = req.body;
        
        // Use Mistral model for chat responses
        const result = await hf.textGeneration({
            model: 'mistralai/Mistral-7B-Instruct-v0.2',
            inputs: `<s>[INST] Je bent een behulpzame Nederlandse AI assistent. 
                    Geef een gedetailleerd antwoord op deze vraag in het Nederlands: ${message} [/INST]`,
            parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
                top_p: 0.95,
                do_sample: true,
                return_full_text: false
            }
        });

        res.status(200).json({ response: result.generated_text });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: 'Chat response failed' });
    }
} 