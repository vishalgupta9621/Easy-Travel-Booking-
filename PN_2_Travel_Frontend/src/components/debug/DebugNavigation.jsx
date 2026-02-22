import React from 'react';
import { Link } from 'react-router-dom';

const DebugNavigation = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Debug Tools Navigation</h1>
      <p>Use these tools to debug the booking display issue:</p>
      
      <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
        <Link 
          to="/simple-test" 
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 5px 0' }}>Simple Booking Test</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Minimal test showing raw booking data with color coding
          </p>
        </Link>

        <Link 
          to="/debug-bookings" 
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 5px 0' }}>Detailed Booking Debug</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Detailed component that mimics UserAccount logic
          </p>
        </Link>

        <Link 
          to="/api-test" 
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#6f42c1',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 5px 0' }}>API Test Tool</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Test each API endpoint directly to see raw responses
          </p>
        </Link>

        <Link 
          to="/account" 
          style={{
            display: 'block',
            padding: '15px',
            backgroundColor: '#dc3545',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 5px 0' }}>User Account (Modified)</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Original UserAccount component with debug info and auth bypass
          </p>
        </Link>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px' 
      }}>
        <h3>Expected Results:</h3>
        <ul>
          <li><strong>Total bookings:</strong> 32</li>
          <li><strong>Hotel bookings:</strong> 29 (blue/light blue)</li>
          <li><strong>Flight bookings:</strong> 1 (green) - IndiGo 6E2001</li>
          <li><strong>Train bookings:</strong> 1 (orange) - Mumbai Rajdhani Express 12951</li>
          <li><strong>Bus bookings:</strong> 1 (purple) - RedBus Travels DL10MH2001</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link 
          to="/" 
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default DebugNavigation;
