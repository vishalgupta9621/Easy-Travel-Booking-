import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    email: searchParams.get('email') || '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    if (!formData.token || !formData.email) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidating(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/auth/validate-reset-token?token=${formData.token}&email=${encodeURIComponent(formData.email)}`
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        setIsValidToken(true);
        setUserInfo(data.user);
      } else {
        setError(data.message || 'Invalid or expired reset token.');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          email: formData.email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset successfully!');
        setIsSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <div className="validating-message">
            <div className="loading-spinner-large"></div>
            <h3>Validating Reset Link...</h3>
            <p>Please wait while we verify your password reset request.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <div className="error-state">
            <div className="error-icon-large">❌</div>
            <h3>Invalid Reset Link</h3>
            <p className="error-text">{error}</p>
            
            <div className="error-actions">
              <Link to="/forgot-password" className="request-new-btn">
                <span className="btn-icon">🔄</span>
                Request New Reset Link
              </Link>
              <Link to="/login" className="back-to-login-btn">
                <span className="btn-icon">🔙</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-form">
          <div className="success-state">
            <div className="success-icon-large">✅</div>
            <h3>Password Reset Successful!</h3>
            <p className="success-text">{message}</p>
            
            <div className="success-info">
              <p>You will be redirected to the login page in a few seconds...</p>
              <Link to="/login" className="login-now-btn">
                <span className="btn-icon">🔐</span>
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <div className="form-header">
          <h2>🔐 Reset Your Password</h2>
          {userInfo && (
            <p>Hello {userInfo.firstName || userInfo.username}! Create a new password for your account.</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">Reset Token</label>
            <input
              type="text"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder="Enter reset token"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              disabled={loading}
              minLength="6"
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
            disabled={loading || !formData.newPassword || !formData.confirmPassword}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Resetting Password...
              </>
            ) : (
              <>
                <span className="btn-icon">🔒</span>
                Reset Password
              </>
            )}
          </button>
        </form>

        <div className="form-footer">
          <p>
            Remember your password? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>

      <div className="security-info">
        <h3>🔒 Security Information</h3>
        <div className="security-item">
          <span className="security-icon">🛡️</span>
          <div>
            <strong>Secure Reset</strong>
            <p>Your password is encrypted and secure. Only you can reset it with this unique token.</p>
          </div>
        </div>
        <div className="security-item">
          <span className="security-icon">⏰</span>
          <div>
            <strong>Token Expiry</strong>
            <p>Reset tokens expire after 1 hour for your security. Request a new one if this expires.</p>
          </div>
        </div>
        <div className="security-item">
          <span className="security-icon">🔐</span>
          <div>
            <strong>Strong Password</strong>
            <p>Choose a strong password with at least 6 characters for better account security.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
