import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAccess.css';

const AdminAccess = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Simple admin access - in production, this should be proper authentication
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      // Set admin flag in localStorage (temporary solution)
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Invalid admin password');
      setPassword('');
    }
  };

  return (
    <div className="admin-access">
      <div className="admin-access-container">
        <div className="admin-access-header">
          <h2>🛡️ Admin Access</h2>
          <p>Enter admin password to access the dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="password">Admin Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button type="submit" className="admin-submit-btn">
            Access Admin Panel
          </button>
        </form>
        
        <div className="admin-info">
          <h3>Admin Panel Features</h3>
          <ul>
            <li>🤖 Manage chatbot contacts and inquiries</li>
            <li>📊 View dashboard statistics</li>
            <li>📞 Track customer support requests</li>
            <li>✅ Update contact status and add notes</li>
            <li>📈 Monitor response times and metrics</li>
          </ul>
          
         
        </div>
        
        <div className="back-link">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
