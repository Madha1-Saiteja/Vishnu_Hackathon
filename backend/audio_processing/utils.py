import whisper
import os
import torch
import librosa
from transformers import pipeline
from fpdf import FPDF
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
import numpy as np
import PyPDF2
from PIL import Image
import pytesseract

# Load Whisper model
asr_model = whisper.load_model("base")

# Set FFmpeg path manually (optional)
os.environ["PATH"] += os.pathsep + "C:/ffmpeg/bin"

# Load NLP models
ner_pipeline = pipeline("ner", model="Jean-Baptiste/roberta-large-ner-english")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Gemini API configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
API_KEY = "AIzaSyD9SV5wslzcoW_KE0X7ipP73i8XzWNhBs8"  # Replace with your actual API key

# Dummy training data for predictive analytics (Feature 2)
X_train = ["fever infection pain", "healthy recovery good", "infection severe complications"]
y_train = ["negative", "positive", "negative"]
vectorizer = CountVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
model = MultinomialNB()
model.fit(X_train_vec, y_train)

def rephrase_text(text):
    """Rephrase text using Gemini API."""
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": text}]}]}
    response = requests.post(f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers)
    if response.status_code == 200:
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    return text

def transcribe_audio(audio_path):
    """Convert speech to text using Whisper model."""
    result = asr_model.transcribe(audio_path)
    return result["text"]

def generate_medical_notes(transcript):
    """Generate comprehensive medical notes from audio transcript (Feature 1)."""
    # Extract named entities
    entities = ner_pipeline(transcript)
    extracted_info = {entity['word']: entity['entity'] for entity in entities}

    # Handle token length limitation
    max_input_length = summarizer.model.config.max_position_embeddings
    if len(summarizer.tokenizer.encode(transcript)) > max_input_length:
        transcript = summarizer.tokenizer.decode(
            summarizer.tokenizer.encode(transcript)[:max_input_length-10],
            skip_special_tokens=True
        )

    # Generate summary
    summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)
    rephrased_summary = rephrase_text(summary[0]['summary_text'])
    rephrased_transcription = rephrase_text(transcript)

    # Format transcription and summary into bullet points
    transcription_key_points = rephrased_transcription.split('. ')
    formatted_transcription = '\n'.join([f"- {point.strip()}" for point in transcription_key_points if point.strip()])

    summary_key_points = rephrased_summary.split('. ')
    formatted_summary = '\n'.join([f"- {point.strip()}" for point in summary_key_points if point.strip()])

    return extracted_info, formatted_transcription, formatted_summary

def generate_pdf(transcription, summary):
    """Create a professionally formatted PDF from transcription (Feature 1)."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Header
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "AI-Generated Medical Transcription", ln=True, align="C")
    pdf.ln(10)

    # Transcription Section
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Transcription:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, transcription)
    pdf.ln(10)

    # Summary Section
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Summary:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, summary)

    file_path = "media/transcription.pdf"
    pdf.output(file_path)
    return file_path

# Feature 2 Functions
def extract_text_from_pdf(file_path):
    """Extract text from PDF files (Feature 2)."""
    text = ""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def extract_text_from_image(file_path):
    """Extract text from images using OCR (Feature 2)."""
    img = Image.open(file_path)
    text = pytesseract.image_to_string(img)
    return text

def process_document(file_path):
    """Process uploaded document and extract text (Feature 2)."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['.png', '.jpg', '.jpeg']:
        return extract_text_from_image(file_path)
    return "Unsupported file format"

def predict_outcome(text):
    """Predict patient outcome based on extracted text (Feature 2)."""
    text_vec = vectorizer.transform([text])
    prediction = model.predict(text_vec)[0]
    probability = model.predict_proba(text_vec)[0]
    return {"outcome": prediction, "confidence": max(probability) * 100}