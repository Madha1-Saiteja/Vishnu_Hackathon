from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Correct API endpoint and API key
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)
API_KEY = os.getenv("GEMINI_API_KEY", "")

# Prefix to enforce medical-related questions
MEDICAL_PREFIX = (
    "You are a highly knowledgeable medical assistant. "
    "You only provide responses related to medical advice, health conditions, treatments, symptoms, "
    "and related medical topics. If a question is unrelated to medicine, politely decline to answer. "
    "Now, answer this medical-related question: "
)

# Function to send requests to the Gemini API
def query_gemini(query):
    if not API_KEY:
        return {"error": "GEMINI_API_KEY is not configured"}

    headers = {
        "Content-Type": "application/json"
    }
    medical_query = MEDICAL_PREFIX + query  # Add the medical prefix to ensure relevant queries
    payload = {
        "contents": [{"parts": [{"text": medical_query}]}]
    }
    response = requests.post(f"{GEMINI_API_URL}?key={API_KEY}", json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"API request failed: {response.text}"}

# Route to handle chatbot interactions
@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    # Get a response from Gemini AI
    response = query_gemini(user_input)

    if "error" in response:
        return jsonify({"error": response["error"]}), 500

    # Extract response text
    try:
        response_text = response["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        response_text = "Sorry, I couldn't understand."

    return jsonify({"response": response_text})

if __name__ == "__main__":
    host = os.getenv("CHATBOT_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("CHATBOT_PORT", "5000")))
    debug = os.getenv("CHATBOT_DEBUG", "true").lower() == "true"
    app.run(host=host, port=port, debug=debug)
