import React from 'react';

const Dashboard = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No data available. Please upload a document to analyze.</p>
      </div>
    );
  }

  const { key_info, prediction } = result;
  console.log('Result:', result);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Patient Overview</h2>

      {/* Patient Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Patient Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
          <p><span className="font-medium">Name:</span> {key_info?.patient_name || 'Not Provided'}</p>
          <p><span className="font-medium">Age:</span> {key_info?.age || 'Not Provided'}</p>
          <p><span className="font-medium">Gender:</span> {key_info?.gender || 'Not Provided'}</p>
          <p>
            <span className="font-medium">Conditions:</span>{' '}
            {key_info?.diseases?.join(', ') || 'Not Provided'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-700 mb-2">Health Summary</h3>
  <div className="bg-blue-50 p-4 rounded-md text-gray-700 border-l-4 border-blue-500">
    {(() => {
      try {
        // Parse the summary JSON string
        const summaryData = JSON.parse(key_info?.summary);

        // Render key-value pairs
        return (
          <ul>
            {Object.entries(summaryData).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>{" "}
                {Array.isArray(value) ? value.join(', ') : value}
              </li>
            ))}
          </ul>
        );
      } catch (error) {
        // If parsing fails, render the raw summary text
        return <p>{key_info?.summary || 'No summary available'}</p>;
      }
    })()}
  </div>
</div>

      {/* Prediction */}
      {prediction && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Health Assessment</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">
              <span className="font-medium">Risk Level: </span>
              <span className={prediction.outcome === 'positive' ? 'text-green-600' : 'text-red-600'}>
                {prediction.outcome === 'positive' ? 'Low' : 'High'}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Confidence: </span>
              <span className="text-blue-600">{prediction.confidence.toFixed(2)}%</span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Impact: </span>
              {prediction.confidence > 70 
                ? 'Significant concern requiring attention' 
                : prediction.confidence > 50 
                ? 'Moderate risk, monitor closely' 
                : 'Low immediate concern'}
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  prediction.confidence > 70 ? 'bg-red-500' : prediction.confidence > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;