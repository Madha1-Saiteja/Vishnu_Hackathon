import json
import logging
import os
import re

import PyPDF2
import pytesseract
import requests
from fpdf import FPDF
from PIL import Image

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
)
API_KEY = os.getenv("GEMINI_API_KEY", "")

_ASR_MODEL = None
_NER_PIPELINE = None
_SUMMARIZER = None


def _require_gemini_key():
    if not API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")


def _get_asr_model():
    global _ASR_MODEL
    if _ASR_MODEL is None:
        try:
            import whisper
        except ImportError as exc:
            raise RuntimeError(
                "Audio transcription dependencies are not installed. "
                "Install openai-whisper to enable this feature."
            ) from exc

        _ASR_MODEL = whisper.load_model("base")
    return _ASR_MODEL


def _get_ner_pipeline():
    global _NER_PIPELINE
    if _NER_PIPELINE is None:
        try:
            from transformers import pipeline
        except ImportError as exc:
            raise RuntimeError(
                "NLP dependencies are not installed. Install transformers to enable this feature."
            ) from exc

        _NER_PIPELINE = pipeline("ner", model="Jean-Baptiste/roberta-large-ner-english")
    return _NER_PIPELINE


def _get_summarizer():
    global _SUMMARIZER
    if _SUMMARIZER is None:
        try:
            from transformers import pipeline
        except ImportError as exc:
            raise RuntimeError(
                "Summarization dependencies are not installed. Install transformers to enable this feature."
            ) from exc

        _SUMMARIZER = pipeline("summarization", model="facebook/bart-large-cnn")
    return _SUMMARIZER


def rephrase_text(text):
    _require_gemini_key()
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": text}]}]}
    response = requests.post(
        f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers, timeout=20
    )
    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]


def extract_key_info(text):
    _require_gemini_key()
    prompt = f"""
    From the following medical document text, extract and return a JSON object with:
    - patient_name (string)
    - age (string)
    - gender (string)
    - diseases (list of strings)
    - summary (string)
    If any information is not available, use "Not Provided" for strings or ["Not Provided"] for the diseases list.
    Return the result as valid JSON.
    Text: {text[:1000]}
    """

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers, timeout=20
        )
        response.raise_for_status()
        response_data = response.json()
        result = response_data["candidates"][0]["content"]["parts"][0]["text"]

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return parse_non_json_response(result, text)
    except Exception as exc:
        logger.error("Gemini extract_key_info failed: %s", exc)
        return parse_non_json_response("", text)


def parse_non_json_response(result, text):
    patient_name = "Not Provided"
    age = "Not Provided"
    gender = "Not Provided"
    diseases = ["Not Provided"]
    summary = result if result else "No summary provided"

    for line in result.split("\n"):
        line = line.strip()
        if "Patient" in line or "Name" in line:
            patient_name = line.split(":")[-1].strip() if ":" in line else line
        elif "Age" in line:
            age = line.split(":")[-1].strip() if ":" in line else line
        elif "Gender" in line:
            gender = line.split(":")[-1].strip() if ":" in line else line
        elif "Disease" in line or "Condition" in line:
            diseases = [d.strip() for d in line.split(":")[-1].split(",") if ":" in line] or [line]

    if summary == "No summary provided":
        summary = text[:500] if text else "No summary available"

    return {
        "patient_name": patient_name,
        "age": age,
        "gender": gender,
        "diseases": diseases if diseases else ["Not Provided"],
        "summary": summary,
    }


def transcribe_audio(audio_path):
    asr_model = _get_asr_model()
    result = asr_model.transcribe(audio_path)
    return result["text"]


def generate_medical_notes(transcript):
    ner_pipeline = _get_ner_pipeline()
    summarizer = _get_summarizer()

    entities = ner_pipeline(transcript)
    extracted_info = {entity["word"]: entity["entity"] for entity in entities}

    max_input_length = summarizer.model.config.max_position_embeddings
    if len(summarizer.tokenizer.encode(transcript)) > max_input_length:
        transcript = summarizer.tokenizer.decode(
            summarizer.tokenizer.encode(transcript)[: max_input_length - 10],
            skip_special_tokens=True,
        )

    summary = summarizer(transcript, max_length=150, min_length=40, do_sample=False)
    rephrased_summary = rephrase_text(summary[0]["summary_text"])
    rephrased_transcription = rephrase_text(transcript)

    transcription_key_points = rephrased_transcription.split(". ")
    formatted_transcription = "\n".join(
        [f"- {point.strip()}" for point in transcription_key_points if point.strip()]
    )

    summary_key_points = rephrased_summary.split(". ")
    formatted_summary = "\n".join(
        [f"- {point.strip()}" for point in summary_key_points if point.strip()]
    )
    return extracted_info, formatted_transcription, formatted_summary


def generate_pdf(transcription, summary):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "AI-Generated Medical Transcription", ln=True, align="C")
    pdf.ln(10)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Transcription:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, transcription)
    pdf.ln(10)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Summary:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, summary)
    file_path = "media/transcription.pdf"
    pdf.output(file_path)
    return file_path


def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text


def extract_text_from_image(file_path):
    img = Image.open(file_path)
    return pytesseract.image_to_string(img)


def process_document(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext in [".png", ".jpg", ".jpeg"]:
        return extract_text_from_image(file_path)
    return "Unsupported file format"


def extract_medical_info(text):
    return {
        "Patient Name": re.findall(r"(?:Patient Name|Name)[:\s]*([A-Za-z ]+)", text, re.IGNORECASE),
        "Age": re.findall(r"(?:Age)[:\s]*(\d+)", text, re.IGNORECASE),
        "Disease": re.findall(
            r"(?:Disease|Condition|Diagnosis)[:\s]*([A-Za-z0-9, ]+)", text, re.IGNORECASE
        ),
        "Blood Pressure": re.findall(
            r"(?:Blood Pressure|BP)[:\s](\d+/\d+|\d+)\s(?:mmHg)?", text, re.IGNORECASE
        ),
        "Sugar Levels": re.findall(r"(?:Sugar|Glucose)[:\s](\d+)\s(?:mg/dL)?", text, re.IGNORECASE),
        "Cholesterol Levels": re.findall(
            r"(?:Cholesterol)[:\s](\d+)\s(?:mg/dL)?", text, re.IGNORECASE
        ),
        "Medications": re.findall(
            r"(?:Medications|Prescribed)[:\s]*([A-Za-z0-9, ]+)", text, re.IGNORECASE
        ),
        "Next Consultation": re.findall(
            r"(?:Next Appointment|Consultation|Follow-up)[:\s]*(\d{2}-\d{2}-\d{4}|\d{2}/\d{2}/\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})",
            text,
            re.IGNORECASE,
        ),
        "Doctor's Name": re.findall(r"(?:Doctor|Dr\.)[:\s]*([A-Za-z ]+)", text, re.IGNORECASE),
        "Curing Time": re.findall(
            r"(?:Recovery Time|Curing Period)[:\s]*(\d+ days)", text, re.IGNORECASE
        ),
    }


def generate_short_notes(medical_info):
    if not medical_info:
        return "No medical information found."

    _require_gemini_key()

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

    Please use simple language and avoid medical jargon.
    """

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(
        f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers, timeout=20
    )
    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]
