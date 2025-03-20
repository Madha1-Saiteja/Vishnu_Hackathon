from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from django.conf import settings
import os
import warnings
from .models import AudioFile
from .serializers import AudioFileSerializer
from .utils import (
    transcribe_audio, 
    generate_medical_notes, 
    generate_pdf, 
    process_document, 
    predict_outcome,
    extract_key_info,
    extract_medical_info,  # Add this function to utils.py
    generate_short_notes  # Add this function to utils.py
)

warnings.simplefilter("ignore", UserWarning)

class AudioUploadView(APIView):
    """Handle audio file upload and transcription (Feature 1)."""
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = AudioFileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            audio_path = file_serializer.instance.file.path
            transcription = transcribe_audio(audio_path)
            extracted_info, formatted_transcription, formatted_summary = generate_medical_notes(transcription)
            pdf_path = generate_pdf(formatted_transcription, formatted_summary)
            return Response({
                "pdf_url": pdf_path,
                "entities": extracted_info
            }, status=status.HTTP_200_OK)
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DownloadPDFView(APIView):
    """Serve the generated PDF for download or display (Feature 1)."""
    def get(self, request, *args, **kwargs):
        pdf_path = "media/transcription.pdf"
        if not os.path.exists(pdf_path):
            return Response({"error": "PDF not found"}, status=status.HTTP_404_NOT_FOUND)
        response = FileResponse(open(pdf_path, "rb"), content_type="application/pdf")
        response["X-Frame-Options"] = "ALLOWALL"
        return response

class DocumentUploadView(APIView):
    """Handle document upload, text extraction, and prediction (Feature 2)."""
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('document')
        if not file_obj:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.name)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Extract text from the uploaded document
        extracted_text = process_document(file_path)
        if extracted_text == "Unsupported file format":
            os.remove(file_path)
            return Response({"error": extracted_text}, status=status.HTTP_400_BAD_REQUEST)

        # Extract key medical information using Gemini API
        key_info = extract_key_info(extracted_text)

        # Generate a medical summary
        medical_info = extract_medical_info(extracted_text)  # Add this function to utils.py
        summary = generate_short_notes(medical_info)  # Add this function to utils.py

        os.remove(file_path)

        return Response({
            "key_info": key_info,
            "medical_info": medical_info,
            "summary": summary
        }, status=status.HTTP_200_OK)