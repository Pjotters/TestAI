class AIAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        this.initEventListeners();
        this.loadContext();
    }

    initEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async loadContext() {
        // Laad relevante context over de beschikbare tools
        this.context = {
            '3d': {
                beschikbareModellen: Object.keys(MODEL_MAPPINGS),
                voorbeeldPrompts: [
                    'een rode sportauto',
                    'een moderne stoel',
                    'een robotisch figuur'
                ]
            },
            'beeldherkenning': {
                ondersteundeFormaten: ['jpg', 'png', 'gif'],
                maxGrootte: '5MB'
            }
        };
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Toon gebruikersbericht
        this.addMessage(message, 'user');
        this.userInput.value = '';

        try {
            const response = await this.getAIResponse(message);
            this.addMessage(response, 'bot');
        } catch (error) {
            this.addMessage('Sorry, er ging iets mis. Probeer het opnieuw.', 'bot', true);
        }
    }

    addMessage(text, type, isError = false) {
        const div = document.createElement('div');
        div.className = `${type}-message ${isError ? 'error' : ''}`;
        div.textContent = text;
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async getAIResponse(message) {
        // Gebruik dezelfde API als in ai-functions.js
        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: this.createPrompt(message),
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95
                }
            })
        });

        const result = await response.json();
        return result[0].generated_text;
    }

    createPrompt(message) {
        return `<s>[INST] Je bent een behulpzame Nederlandse AI assistent.
Context over beschikbare tools:
${JSON.stringify(this.context, null, 2)}

Vraag: ${message} [/INST]`;
    }
}

// Initialiseer de assistent
const assistant = new AIAssistant(); 