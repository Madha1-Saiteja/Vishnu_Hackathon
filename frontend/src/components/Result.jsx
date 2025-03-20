import {useState} from 'react'
import DocumentUpload from './DocumentUpload';
import Dashboard from './Dashboard';
import Form_mp3 from './Form_mp3';
function Result() {
    const [result, setResult] = useState(null); // State for document analysis result
  return (
    <div className='pt-52 h-screen bg-red-300'>
        <div className="flex flex-col items-center justify-center space-y-4">
        {/* Audio Upload */}
        {/* <Form_mp3 /> */}
        {/* Document Upload */}
        <DocumentUpload className="mx-auto" setResult={setResult} />
        {/* Dashboard (only shown if result exists) */}
        {result && <Dashboard result={result} />}
      </div>
    </div>
  )
}

export default Result