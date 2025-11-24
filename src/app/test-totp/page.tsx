"use client"
import { useState } from 'react';

export default function TestTOTP() {
  const [username, setUsername] = useState('accountant');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateTOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-totp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to generate TOTP' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">TOTP Test Tool</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={generateTOTP}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate TOTP Code'}
        </button>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            {result.currentCode && (
              <div className="mt-4 p-3 bg-green-100 rounded">
                <p className="font-bold text-green-800">Current TOTP Code:</p>
                <p className="text-2xl font-mono text-green-900">{result.currentCode}</p>
                <p className="text-xs text-gray-600 mt-2">Use this code to login</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 