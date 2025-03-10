const HF_API_URL_WHISPER = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";
const HF_API_URL_CHAT = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const HF_API_KEY = config.API_KEY;

class VoiceAssistant {
    constructor() {
        this.recording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.recordBtn = document.getElementById('recordBtn');
        this.statusDiv = document.getElementById('recordingStatus');
        this.messagesDiv = document.getElementById('voiceMessages');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.recordBtn.addEventListener('click', () => {
            if (!this.recording) {
                this.startRecording();
            } else {
                this.stopRecording();
            }
        });
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                await this.processAudio(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.recording = true;
            this.recordBtn.classList.add('recording');
            this.statusDiv.textContent = 'Opname bezig...';
            
            this.setupVolumeDetection(stream);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.statusDiv.textContent = 'Kon geen toegang krijgen tot de microfoon';
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.recording = false;
            this.recordBtn.classList.remove('recording');
            this.statusDiv.textContent = 'Verwerken van audio...';
        }
    }
    
    async processAudio(audioBlob) {
        try {
            // Convert audio to base64
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];
                
                // Get text from speech
                const transcription = await this.speechToText(base64Audio);
                this.addMessage(transcription, 'user-message');
                
                // If it's a question, get AI response
                if (transcription.includes('?')) {
                    const response = await this.getAIResponse(transcription);
                    this.addMessage(response, 'bot-message');
                }
                
                this.statusDiv.textContent = '';
            };
        } catch (error) {
            console.error('Error processing audio:', error);
            this.statusDiv.textContent = 'Er ging iets mis bij het verwerken van de audio';
        }
    }
    
    async speechToText(base64Audio) {
        const response = await fetch(HF_API_URL_WHISPER, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: base64Audio }),
        });
        
        const result = await response.json();
        return result.text;
    }
    
    async getAIResponse(text) {
        const response = await fetch(HF_API_URL_CHAT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: `<s>[INST] Je bent een behulpzame Nederlandse AI assistent. 
                Geef een gedetailleerd antwoord op deze vraag in het Nederlands: ${text} [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    do_sample: true,
                    return_full_text: false
                }
            }),
        });
        
        const result = await response.json();
        return result[0].generated_text.replace(/\[\/INST\]/, '').trim();
    }
    
    addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = className;
        messageDiv.textContent = text;
        this.messagesDiv.appendChild(messageDiv);
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
    
    setupVolumeDetection(stream) {
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        audioSource.connect(analyser);
        
        const volumeBar = document.getElementById('volumeBar');
        const volumeLevel = document.getElementById('volumeLevel');
        
        const checkVolume = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const volume = Math.min(100, Math.round((average / 128) * 100));
            
            volumeBar.style.width = `${volume}%`;
            volumeLevel.textContent = volume;
            
            if (this.recording) {
                requestAnimationFrame(checkVolume);
            }
        };
        
        checkVolume();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistant();
});

function copyCode() {
    const code = document.querySelector('.code-container code').textContent;
    navigator.clipboard.writeText(code);
    
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.innerHTML = '<span class="material-icons">check</span>';
    setTimeout(() => {
        copyBtn.innerHTML = '<span class="material-icons">content_copy</span>';
    }, 2000);
}

document.getElementById('showCodeBtn').addEventListener('click', () => {
    const codeSnippet = document.getElementById('codeSnippet');
    codeSnippet.style.display = codeSnippet.style.display === 'none' ? 'block' : 'none';
}); 