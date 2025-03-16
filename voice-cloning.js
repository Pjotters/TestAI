const HF_API_URL_VOICE = "https://api-inference.huggingface.co/models/facebook/fastspeech2-en-ljspeech";
const HF_API_KEY = config.API_KEY;

class VoiceCloning {
    constructor() {
        this.audioPlayer = new Audio();
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('Opname starten mislukt:', error);
            return false;
        }
    }

    async stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }

    async cloneVoice(audioBlob, text) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('text', text);

            const response = await fetch(HF_API_URL_VOICE, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`
                },
                body: formData
            });

            if (!response.ok) throw new Error(`API verzoek mislukt: ${response.status}`);

            const clonedAudioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(clonedAudioBlob);
            this.audioPlayer.src = audioUrl;
            await this.audioPlayer.play();

            return true;
        } catch (error) {
            console.error('Voice cloning mislukt:', error);
            return false;
        }
    }
} 