class PjottersVoiceEmbed {
    constructor() {
        this.recording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.createInterface();
        this.initializeElements();
        this.setupEventListeners();
    }

    createInterface() {
        const container = document.querySelector('.pjotters-voice-assistant');
        container.innerHTML = `
            <div class="pva-container">
                <div class="pva-messages"></div>
                <div class="pva-controls">
                    <button class="pva-record">
                        <span class="pva-icon">🎤</span>
                    </button>
                    <div class="pva-volume-bar">
                        <div class="pva-volume-level"></div>
                    </div>
                </div>
            </div>
            <style>
                .pva-container {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .pva-messages {
                    min-height: 100px;
                    max-height: 300px;
                    overflow-y: auto;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                }
                .pva-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .pva-record {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(45deg, #00aeff, #a68eff);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .pva-record:hover {
                    transform: scale(1.1);
                }
                .pva-volume-bar {
                    flex: 1;
                    height: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 5px;
                    overflow: hidden;
                }
                .pva-volume-level {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #00aeff, #a68eff);
                    transition: width 0.1s ease;
                }
            </style>
        `;
    }

    initializeElements() {
        this.container = document.querySelector('.pjotters-voice-assistant');
        this.recordBtn = this.container.querySelector('.pva-record');
        this.volumeLevel = this.container.querySelector('.pva-volume-level');
        this.messages = this.container.querySelector('.pva-messages');
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
            this.recordBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff8866)';
            this.setupVolumeDetection(stream);
        } catch (error) {
            this.addMessage('Kon geen toegang krijgen tot de microfoon', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.recording = false;
            this.recordBtn.style.background = 'linear-gradient(45deg, #00aeff, #a68eff)';
        }
    }

    setupVolumeDetection(stream) {
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        audioSource.connect(analyser);
        
        const checkVolume = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const volume = Math.min(100, Math.round((average / 128) * 100));
            
            this.volumeLevel.style.width = `${volume}%`;
            
            if (this.recording) {
                requestAnimationFrame(checkVolume);
            }
        };
        
        checkVolume();
    }

    async processAudio(audioBlob) {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];
                const transcription = await this.speechToText(base64Audio);
                this.addMessage(transcription, 'user');
                
                if (transcription.includes('?')) {
                    const response = await this.getAIResponse(transcription);
                    this.addMessage(response, 'bot');
                }
            };
        } catch (error) {
            this.addMessage('Er ging iets mis bij het verwerken van de audio', 'error');
        }
    }

    async speechToText(base64Audio) {
        const response = await fetch('https://pjotters-ai.vercel.app/api/whisper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio })
        });
        const data = await response.json();
        return data.text;
    }

    async getAIResponse(text) {
        const response = await fetch('https://pjotters-ai.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        return data.response;
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `pva-message ${type}-message`;
        messageDiv.textContent = text;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    }
}

// Automatisch initialiseren
new PjottersVoiceEmbed(); 