import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar/navbar';
import Footer from '../../components/footer/footer';
import TravelSearch from '../../components/travel-search/TravelSearch';
import SearchResults from '../../components/search-results/SearchResults';
import './TravelBooking.css';

const TravelBooking = () => {
  const [searchParams, setSearchParams] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (params) => {
    setSearchParams(params);
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBooking = (travelData) => {
    // Navigate to booking page with travel data
    navigate('/booking', { 
      state: { 
        travelData, 
        searchParams 
      } 
    });
  };

  return (
    <div className="travel-booking-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <h1>Book Your Perfect Journey</h1>
          <p>Find and book flights, trains, and buses across India with ease</p>
        </div>
        
        <div className="search-container">
          <TravelSearch onSearch={handleSearch} />
        </div>
      </div>

      <div id="search-results" className="results-section">
        <SearchResults 
          searchParams={searchParams} 
          onBooking={handleBooking}
        />
      </div>

      <Footer />
    </div>
  );
};

export default TravelBooking;
