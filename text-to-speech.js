const HF_API_URL_TTS = "https://api-inference.huggingface.co/models/facebook/mms-tts-nld";
const HF_API_KEY = config.API_KEY;

class TextToSpeech {
    constructor() {
        this.audioPlayer = new Audio();
    }

    async convertToSpeech(text) {
        try {
            const response = await fetch(HF_API_URL_TTS, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: text
                })
            });

            if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            this.audioPlayer.src = audioUrl;
            await this.audioPlayer.play();

            return true;
        } catch (error) {
            console.error('Text-to-Speech mislukt:', error);
            return false;
        }
    }
} 