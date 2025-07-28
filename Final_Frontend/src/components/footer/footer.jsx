import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/list-your-hotel">List Your Hotel</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div className="footer-social">
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} YourBookingSite. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;