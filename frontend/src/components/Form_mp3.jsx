import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Form_mp3() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const allowedTypes = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Invalid file type! Please upload an MP3, WAV, or OGG file.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async(e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a valid MP3, WAV, or OGG file.");
      return;
    }
 
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("response:---",response)
      if (response.status === 200) {
        setPdfUrl(`http://127.0.0.1:8000/media/transcription.pdf`); // Update PDF URL
      } else {
        setError("File uploaded but no transcript found.");
      }
    } catch (error) {
      console.error("File upload failed:", error);
      setError("File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = () => {
    if (pdfUrl) {
      navigate("/pdf-viewer", { state: { pdfUrl } });
    } else {
      setError("Transcript not available yet.");
    }
  }

  
  console.log(pdfUrl)

  return (
    <div className="max-w-md mx-auto mt-40 border-2 border-red-400 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Upload MP3 File</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label htmlFor="mp3" className="block text-gray-700 mb-2">
            Choose MP3, WAV, or OGG File
          </label>
          <input
            type="file"
            id="mp3"
            accept=".mp3,.wav,.ogg"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {file && <p className="text-green-600 text-sm mt-2">Selected: {file.name}</p>}
        </div>

        <button
          type="submit"
          className={`w-full ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          } text-white font-semibold py-2 rounded transition duration-200`}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {pdfUrl && (
        <button
          onClick={handleViewPdf}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded transition duration-200"
        >
  View Transcript
        </button>
      )}
    </div>
  );
}
export default Form_mp3;