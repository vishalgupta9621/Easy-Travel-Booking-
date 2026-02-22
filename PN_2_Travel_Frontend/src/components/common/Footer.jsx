import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Business Partners Section - Only 2 buttons */}
        <div className="footer-section business-partners centered">
          <div className="partner-buttons">
            <Link to="/hotel-owner-registration" className="partner-btn hotel-owner-btn">
              🏨 Hotel Owner Access
              <span className="btn-subtitle">Join 1,200+ Partner Hotels</span>
            </Link>
            <Link to="/admin-access" className="partner-btn admin-btn">
              🛡️ Admin Access
              <span className="btn-subtitle">Management Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-left">
            <p>&copy; 2024 TravelEase Technologies Pvt. Ltd. All rights reserved.</p>
            <p>CIN: U72900KA2020PTC134567 | GST: 29ABCDE1234F1Z5</p>
          </div>
          <div className="footer-right">
            <div className="social-links">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="LinkedIn">💼</a>
            </div>
            <div className="certifications">
              <span className="cert-badge">🔒 SSL Secured</span>
              <span className="cert-badge">✅ ISO Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
