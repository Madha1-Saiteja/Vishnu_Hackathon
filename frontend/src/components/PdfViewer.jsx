import React from "react";

function PdfViewer() {
  const pdfUrl = "http://127.0.0.1:8000/media/transcription.pdf";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-20">
      <div className="max-w-4xl w-full bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Transcription PDF</h2>
        {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="600px"
          >
            <p>
              Your browser does not support PDFs. 
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                Click here to download the PDF.
              </a>
            </p>
          </object>
        ) : (
          <p className="text-red-500 text-center">No PDF available.</p>
        )}
      </div>
    </div>
  );
}

export default PdfViewer; 