from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import FileResponse
from .models import AudioFile
from .serializers import AudioFileSerializer
from .utils import transcribe_audio, generate_medical_notes, generate_pdf

import warnings
warnings.simplefilter("ignore", UserWarning)


class AudioUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_serializer = AudioFileSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            audio_path = file_serializer.instance.file.path

            transcription = transcribe_audio(audio_path)
            _, summary = generate_medical_notes(transcription)
            pdf_path = generate_pdf(transcription, summary)

            return Response({"pdf_url": pdf_path})
        return Response(file_serializer.errors, status=400)

class DownloadPDFView(APIView):
    def get(self, request, *args, **kwargs):
        pdf_path = "media/transcription.pdf"
        response = FileResponse(open(pdf_path, "rb"), content_type="application/pdf")
        response["X-Frame-Options"] = "ALLOWALL"  # Allows embedding in iframes
        return response
 