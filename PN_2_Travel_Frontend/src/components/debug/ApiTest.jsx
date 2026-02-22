import React, { useState } from 'react';

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('688e504c39f0aa6cf44ca1b3');

  const testApi = async (endpoint) => {
    setLoading(true);
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult({
        endpoint,
        status: response.status,
        data: data,
        count: Array.isArray(data.data) ? data.data.length : 'N/A',
        types: Array.isArray(data.data) ? 
          data.data.reduce((acc, item) => {
            const type = item.bookingType || item.travelType || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}) : {}
      });
    } catch (error) {
      console.error('API test error:', error);
      setResult({
        endpoint,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    `http://localhost:8800/api/v1/bookings/user/${userId}`,
    `http://localhost:8800/api/v1/universal-bookings/user/${userId}`,
    `http://localhost:8800/api/v1/hotel-bookings/user/${userId}`,
    `http://localhost:8800/api/v1/travel-bookings/user/${userId}`,
    `http://localhost:8800/api/v1/packages/bookings/all?userId=${userId}`
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          User ID: 
          <input 
            type="text" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Endpoints:</h3>
        {endpoints.map((endpoint, index) => (
          <button
            key={index}
            onClick={() => testApi(endpoint)}
            disabled={loading}
            style={{
              display: 'block',
              margin: '5px 0',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {endpoint}
          </button>
        ))}
      </div>

      {loading && <div>Loading...</div>}

      {result && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <h3>Result for: {result.endpoint}</h3>
          
          {result.error ? (
            <div style={{ color: 'red' }}>
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <>
              <div><strong>Status:</strong> {result.status}</div>
              <div><strong>Count:</strong> {result.count}</div>
              
              {Object.keys(result.types).length > 0 && (
                <div>
                  <strong>Types:</strong>
                  <ul>
                    {Object.entries(result.types).map(([type, count]) => (
                      <li key={type}>{type}: {count}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <details style={{ marginTop: '15px' }}>
                <summary>Raw Response Data</summary>
                <pre style={{
                  backgroundColor: '#f1f3f4',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTest;
