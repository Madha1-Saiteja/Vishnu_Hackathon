import whisper
import os
import torch
import librosa
from transformers import pipeline
from fpdf import FPDF

# Load Whisper model
asr_model = whisper.load_model("base")

# Set FFmpeg path manually (optional)
os.environ["PATH"] += os.pathsep + "C:/ffmpeg/bin"

# Load NLP models
ner_pipeline = pipeline("ner", model="Jean-Baptiste/roberta-large-ner-english")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def transcribe_audio(audio_path):
    """Convert speech to text."""
    result = asr_model.transcribe(audio_path)
    return result["text"]

def generate_medical_notes(transcript):
    """Extract medical entities and summarize transcript."""
    entities = ner_pipeline(transcript)
    extracted_info = {entity['word']: entity['entity'] for entity in entities}

    max_input_length = summarizer.model.config.max_position_embeddings
    if len(summarizer.tokenizer.encode(transcript)) > max_input_length:
        transcript = summarizer.tokenizer.decode(
            summarizer.tokenizer.encode(transcript)[:max_input_length-10],
            skip_special_tokens=True
        )

    summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)
    return extracted_info, summary[0]['summary_text']

def generate_pdf(transcription, summary):
    """Create a formatted PDF from transcription."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(0, 10, "AI-Generated Medical Transcription", ln=True, align="C")
    pdf.ln(10)

    pdf.multi_cell(0, 10, f"Transcription:\n{transcription}")
    pdf.ln(10)

    pdf.multi_cell(0, 10, f"Summary:\n{summary}")
    
    file_path = "media/transcription.pdf"
    pdf.output(file_path)
    return file_path
