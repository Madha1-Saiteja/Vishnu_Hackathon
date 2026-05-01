import React, { useState } from 'react';
import axios from 'axios';

const DocumentUpload = ({ setResult }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('Selected file:', selectedFile);
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload-document/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Upload response:', response.data);
      setResult(response.data); // Pass the entire response to the parent component
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      console.error('Upload failed:', errorMsg);
      setError(`Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload Medical Document</h2>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="my-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`mt-2 py-2 px-4 rounded-md text-white font-medium ${
          uploading || !file
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default DocumentUpload;