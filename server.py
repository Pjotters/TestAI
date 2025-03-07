from flask import Flask, request, jsonify
from transformers import pipeline
import tensorflow as tf
import cv2
import numpy as np

app = Flask(__name__)

# Laad het basis GPT2 model
chatbot = pipeline("text-generation", 
                  model="openai-community/gpt2",
                  max_length=50)

# Voeg rate limiting toe voor verschillende abonnementen
RATE_LIMITS = {
    'Basic': 100,    # 100 requests per dag
    'Pro': 1000,     # 1000 requests per dag
    'Premium': float('inf')  # Ongelimiteerd
}

# Fine-tune voor Nederlands gebruik
def preprocess_text(text):
    return f"Nederlandse tekst: {text}"

@app.route('/chat', methods=['POST'])
def chat():
    user_subscription = request.headers.get('X-Subscription-Type', 'Basic')
    if not check_rate_limit(user_subscription):
        return jsonify({'error': 'Dagelijks limiet bereikt'}), 429
        
    text = request.json['message']
    response = chatbot(text, max_length=50)[0]['generated_text']
    return jsonify({'response': response})

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    file = request.files['image']
    # Verwerk de afbeelding met TensorFlow
    # Stuur resultaten terug
    return jsonify({'results': results})

if __name__ == '__main__':
    app.run(debug=True) 