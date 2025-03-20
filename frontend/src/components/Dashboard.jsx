import React from 'react';

const Dashboard = ({ result }) => {
  if (!result) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No data available. Please upload a document to analyze.</p>
      </div>
    );
  }

  // Sort word frequency by percentage (descending) and take top 10
  const sortedAnalysis = Object.entries(result.analysis)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Document Analysis Results</h2>

      {/* Extracted Text */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Extracted Text</h3>
        <div className="bg-gray-50 p-4 rounded-md max-h-72 overflow-y-auto text-sm text-gray-600">
          <pre className="">{result.text}</pre>
        </div>
      </div>

      {/* Word Frequency */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Top 10 Word Frequencies (%)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedAnalysis.map(([word, percent]) => (
            <div key={word} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">{word}</span>
              <span className="text-blue-600">{percent.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Prediction */}
      {result.prediction && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Predicted Outcome</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-700">
              <span className="font-medium">Outcome: </span>
              <span className={result.prediction.outcome === 'positive' ? 'text-green-600' : 'text-red-600'}>
                {result.prediction.outcome}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Confidence: </span>
              <span className="text-blue-600">{result.prediction.confidence.toFixed(2)}%</span>
            </p>
            {/* Progress bar for confidence */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  result.prediction.confidence > 70 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${result.prediction.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;