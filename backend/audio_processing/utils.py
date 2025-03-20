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
import logging
import json
import re

# Configure the logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

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

# Dummy training data for predictive analytics
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

def extract_key_info(text):
    """Extract key patient information using Gemini API with improved error handling."""
    prompt = f"""
    From the following medical document text, extract and return a JSON object with:
    - patient_name (string)
    - age (string)
    - gender (string)
    - diseases (list of strings)
    - summary (string)
    If any information is not available, use "Not Provided" for strings or ["Not Provided"] for the diseases list.
    Return the result as a valid JSON string (e.g., {{"patient_name": "John Doe", ...}}).
    Text: {text[:1000]}  # Limit to 1000 chars to avoid token limits
    """
    
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        logger.debug(f"Sending request to Gemini API with prompt length: {len(prompt)}")
        response = requests.post(f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers, timeout=10)
        response.raise_for_status()  # Raise exception for bad status codes
        
        logger.debug(f"Gemini API full response: {response.text}")
        response_data = response.json()
        
        # Check if expected structure exists
        if "candidates" not in response_data or not response_data["candidates"]:
            logger.error("No 'candidates' in response")
            raise KeyError("No 'candidates' in response")
        if "content" not in response_data["candidates"][0] or "parts" not in response_data["candidates"][0]["content"]:
            logger.error("Invalid response structure")
            raise KeyError("Invalid response structure")
        
        result = response_data["candidates"][0]["content"]["parts"][0]["text"]
        logger.debug(f"Extracted result text: '{result}'")
        
        # Handle empty or non-JSON responses
        if not result or result.isspace():
            logger.warning("Gemini returned empty response")
            return local_extract_key_info(text)  # Fallback to local processing
        
        # Try parsing as JSON
        try:
            parsed_result = json.loads(result)
            logger.debug(f"Parsed result: {parsed_result}")
            return parsed_result
        except json.JSONDecodeError:
            logger.warning(f"Gemini response is not JSON: '{result}'")
            # Attempt manual parsing if possible
            return parse_non_json_response(result, text)
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API request failed: {str(e)} - Status: {e.response.status_code if e.response else 'No response'}")
        return extract_key_info(text)
    except KeyError as e:
        logger.error(f"Failed to access Gemini API response structure: {str(e)}")
        return extract_key_info(text)

def parse_non_json_response(result, text):
    """Attempt to parse non-JSON response from Gemini."""
    logger.info("Attempting to parse non-JSON Gemini response")
    patient_name = "Not Provided"
    age = "Not Provided"
    gender = "Not Provided"
    diseases = ["Not Provided"]
    summary = result if result else "No summary provided by Gemini"

    # Basic text parsing (adjust based on actual response format)
    lines = result.split('\n')
    for line in lines:
        line = line.strip()
        if "Patient" in line or "Name" in line:
            patient_name = line.split(":")[-1].strip() if ":" in line else line
        elif "Age" in line:
            age = line.split(":")[-1].strip() if ":" in line else line
        elif "Gender" in line:
            gender = line.split(":")[-1].strip() if ":" in line else line
        elif "Disease" in line or "Condition" in line:
            diseases = [d.strip() for d in line.split(":")[-1].split(",") if ":" in line] or [line]

    # Fallback summary if none extracted
    if summary == "No summary provided by Gemini":
        max_input_length = summarizer.model.config.max_position_embeddings
        truncated_text = text[:max_input_length-10] if len(text) > max_input_length else text
        summary = summarizer(truncated_text, max_length=150, min_length=40, do_sample=False)[0]['summary_text']

    return {
        "patient_name": patient_name,
        "age": age,
        "gender": gender,
        "diseases": diseases if diseases else ["Not Provided"],
        "summary": summary
    }
    
def transcribe_audio(audio_path):
    """Convert speech to text using Whisper model."""
    result = asr_model.transcribe(audio_path)
    return result["text"]

def generate_medical_notes(transcript):
    """Generate comprehensive medical notes from audio transcript (Feature 1)."""
    entities = ner_pipeline(transcript)
    extracted_info = {entity['word']: entity['entity'] for entity in entities}
    max_input_length = summarizer.model.config.max_position_embeddings
    if len(summarizer.tokenizer.encode(transcript)) > max_input_length:
        transcript = summarizer.tokenizer.decode(
            summarizer.tokenizer.encode(transcript)[:max_input_length-10],
            skip_special_tokens=True
        )
    summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)
    rephrased_summary = rephrase_text(summary[0]['summary_text'])
    rephrased_transcription = rephrase_text(transcript)
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
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "AI-Generated Medical Transcription", ln=True, align="C")
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Transcription:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, transcription)
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Summary:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, summary)
    file_path = "media/transcription.pdf"
    pdf.output(file_path)
    return file_path

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

def extract_medical_info(text):
    """Extract key medical details from text using regex."""
    medical_info = {
        "Patient Name": re.findall(r"(?:Patient Name|Name)[:\s]*([A-Za-z ]+)", text, re.IGNORECASE),
        "Age": re.findall(r"(?:Age)[:\s]*(\d+)", text, re.IGNORECASE),
        "Disease": re.findall(r"(?:Disease|Condition|Diagnosis)[:\s]*([A-Za-z0-9, ]+)", text, re.IGNORECASE),
        "Blood Pressure": re.findall(r"(?:Blood Pressure|BP)[:\s](\d+/\d+|\d+)\s(?:mmHg)?", text, re.IGNORECASE),
        "Sugar Levels": re.findall(r"(?:Sugar|Glucose)[:\s](\d+)\s(?:mg/dL)?", text, re.IGNORECASE),
        "Cholesterol Levels": re.findall(r"(?:Cholesterol)[:\s](\d+)\s(?:mg/dL)?", text, re.IGNORECASE),
        "Medications": re.findall(r"(?:Medications|Prescribed)[:\s]*([A-Za-z0-9, ]+)", text, re.IGNORECASE),
        "Next Consultation": re.findall(r"(?:Next Appointment|Consultation|Follow-up)[:\s]*(\d{2}-\d{2}-\d{4}|\d{2}/\d{2}/\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})", text, re.IGNORECASE),
        "Doctor's Name": re.findall(r"(?:Doctor|Dr\.)[:\s]*([A-Za-z ]+)", text, re.IGNORECASE),
        "Curing Time": re.findall(r"(?:Recovery Time|Curing Period)[:\s]*(\d+ days)", text, re.IGNORECASE),
    }
    return medical_info

def generate_short_notes(medical_info):
    """Generate a structured medical summary using Gemini."""
    if not medical_info:
        return "No medical information found."

    summary_text = ""
    for key, value in medical_info.items():
        if value:
            summary_text += f"{key}: {', '.join(value)}\n"

    prompt = f"""
    Summarize the following medical details for an elderly patient in simple terms:

    {summary_text}

    Example Output Format:

    ## Key Health Details
    * *Patient Name:* [Patient Name]
    * *Age:* [Age]
    * *Main Health Concern:* [Disease/Condition]
    * *Blood Pressure:* [BP]
    * *Sugar Levels:* [Sugar Levels]
    * *Cholesterol Levels:* [Cholesterol Levels]

    ## Doctor's Advice & Next Steps
    * *Doctor's Advice:* [Treatment Plan]
    * *Next Steps:* [Lifestyle Recommendations]
    * *Next Appointment:* [Date]

    ## Medications & Emergency Signs
    * *Medications:* [Prescribed Drugs]
    * *Emergency Signs to Watch For:* [Critical Symptoms]

    Please Note: This summary is for an elderly patient. Use simple language and avoid medical jargon.
    """

    try:
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        response = requests.post(f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        return f"API Error: {str(e)}"