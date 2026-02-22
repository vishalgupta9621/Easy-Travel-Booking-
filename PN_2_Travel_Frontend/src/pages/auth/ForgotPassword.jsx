import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset email sent successfully!');
        setIsSubmitted(true);

        // If fallback mode (email service not configured), show additional info
        if (data.fallback && data.resetToken) {
          setMessage(
            `Password reset initiated! Since email service is not configured, you can use this reset token: ${data.resetToken}. ` +
            `Go to the reset password page and enter this token along with your email.`
          );
        }
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setMessage('');
    setError('');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <div className="form-header">
          <h2>🔐 Forgot Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="reset-btn" 
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending Reset Email...
                </>
              ) : (
                <>
                  <span className="btn-icon">📧</span>
                  Send Reset Email
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Reset Email Sent!</h3>
            <p className="success-text">{message}</p>
            
            <div className="next-steps">
              <h4>What's next?</h4>
              <ol>
                <li>Check your email inbox for the reset link</li>
                <li>Click the link in the email to reset your password</li>
                <li>If you don't see the email, check your spam folder</li>
              </ol>
            </div>

            <div className="action-buttons">
              <button onClick={handleResend} className="resend-btn">
                <span className="btn-icon">🔄</span>
                Send Another Email
              </button>
              <Link to="/login" className="back-to-login-btn">
                <span className="btn-icon">🔙</span>
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {!isSubmitted && (
          <div className="form-footer">
            <p>
              Remember your password? <Link to="/login">Sign in here</Link>
            </p>
            <p>
              Don't have an account? <Link to="/register">Create one here</Link>
            </p>
          </div>
        )}
      </div>

      <div className="help-section">
        <h3>Need Help?</h3>
        <div className="help-item">
          <span className="help-icon">❓</span>
          <div>
            <strong>Can't find the reset email?</strong>
            <p>Check your spam or junk folder. The email might take a few minutes to arrive.</p>
          </div>
        </div>
        <div className="help-item">
          <span className="help-icon">⏰</span>
          <div>
            <strong>Reset link expired?</strong>
            <p>Reset links expire after 1 hour for security. Request a new one if needed.</p>
          </div>
        </div>
        <div className="help-item">
          <span className="help-icon">🔒</span>
          <div>
            <strong>Account security</strong>
            <p>We take your security seriously. Only you can reset your password with access to your email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
