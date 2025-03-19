from django.urls import path
from .views import AudioUploadView, DownloadPDFView

urlpatterns = [
    path('upload/', AudioUploadView.as_view(), name='upload_audio'),
    path('download/', DownloadPDFView.as_view(), name='download_pdf'),
]
