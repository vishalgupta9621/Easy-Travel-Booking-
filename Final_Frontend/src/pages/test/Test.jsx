import React from 'react';

function Test() {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{color: '#333', fontSize: '3rem'}}>Test Page</h1>
      <p style={{color: '#666', fontSize: '1.5rem'}}>This is a test page to verify the application is working.</p>
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px auto',
        maxWidth: '500px'
      }}>
        <h2>Application Status: ✅ Working</h2>
        <p>If you can see this page, the React application is running correctly.</p>
      </div>
    </div>
  );
}

export default Test;
