import React, { useState, useEffect } from 'react';
import './header.css';

const Header = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Beautiful travel destination images
  const backgroundImages = [
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&auto=format&fit=crop&q=80',
      title: 'Luxury Hotels',
      subtitle: 'Experience world-class hospitality'
    },
    {
      url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&auto=format&fit=crop&q=80',
      title: 'Scenic Flights',
      subtitle: 'Soar above breathtaking landscapes'
    },
    {
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&auto=format&fit=crop&q=80',
      title: 'Adventure Awaits',
      subtitle: 'Discover exotic destinations'
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&auto=format&fit=crop&q=80',
      title: 'Mountain Escapes',
      subtitle: 'Find peace in nature\'s beauty'
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80',
      title: 'Beach Paradise',
      subtitle: 'Relax on pristine shores'
    }
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="header">
      {/* Background Carousel */}
      <div className="header-carousel">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`header-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image.url})` }}
          />
        ))}

        {/* Carousel Navigation */}
        <button className="header-nav prev" onClick={prevSlide}>
          <span>‹</span>
        </button>
        <button className="header-nav next" onClick={nextSlide}>
          <span>›</span>
        </button>

        {/* Dots Indicator */}
        <div className="header-dots">
          {backgroundImages.map((_, index) => (
            <button
              key={index}
              className={`header-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Header Content */}
      <div className="headerContainer">
        <div className="headerContent">
          <h1 className="headerTitle">Find Your Perfect Stay</h1>
          <p className="headerSubtitle">
            Discover amazing hotels, flights, trains, and complete travel packages
          </p>
          <div className="header-features">
            <div className="feature-item">
              <span className="feature-icon">🏨</span>
              <span>1,200+ Hotels</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✈️</span>
              <span>500+ Destinations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⭐</span>
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;