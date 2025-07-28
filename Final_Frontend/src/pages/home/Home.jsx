
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  console.log('Home component rendering...');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      margin: '0'
    }}>
      {/* Simple Navbar */}
      <nav style={{
        backgroundColor: '#003580',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{color: 'white', fontSize: '1.5rem', fontWeight: 'bold'}}>
          ✈️ TRAVEL Hub
        </div>
        <div style={{display: 'flex', gap: '2rem'}}>
          <Link to="/" style={{color: 'white', textDecoration: 'none'}}>Home</Link>
          <Link to="/flights" style={{color: 'white', textDecoration: 'none'}}>Flights</Link>
          <Link to="/trains" style={{color: 'white', textDecoration: 'none'}}>Trains</Link>
          <Link to="/buses" style={{color: 'white', textDecoration: 'none'}}>Buses</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 1rem 0',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          Find Your Perfect Journey
        </h1>
        <p style={{
          fontSize: '1.3rem',
          margin: '0 0 3rem 0',
          opacity: '0.9'
        }}>
          Book flights, hotels, trains, and buses with the best deals
        </p>
      </div>

      {/* Featured Hotels Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: 'white',
          fontSize: '2.5rem',
          marginBottom: '3rem'
        }}>
          🏨 Featured Hotels
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem'
        }}>
          {/* Hotel Card 1 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop"
              alt="Hotel"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '15px',
                marginBottom: '1rem'
              }}
            />
            <h3 style={{color: '#333', margin: '0 0 0.5rem 0'}}>The Grand Palace Hotel</h3>
            <p style={{color: '#666', margin: '0 0 1rem 0'}}>New Delhi • ⭐ 4.5</p>
            <p style={{color: '#333', fontWeight: 'bold', margin: '0 0 1rem 0'}}>₹5,000 / night</p>
            <Link
              to="/hotels/1/book"
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: '600'
              }}
            >
              🏨 View Details
            </Link>
          </div>

          {/* Hotel Card 2 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop"
              alt="Hotel"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '15px',
                marginBottom: '1rem'
              }}
            />
            <h3 style={{color: '#333', margin: '0 0 0.5rem 0'}}>Mumbai Seaside Resort</h3>
            <p style={{color: '#666', margin: '0 0 1rem 0'}}>Mumbai • ⭐ 4.3</p>
            <p style={{color: '#333', fontWeight: 'bold', margin: '0 0 1rem 0'}}>₹7,500 / night</p>
            <Link
              to="/hotels/2/book"
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: '600'
              }}
            >
              🏨 View Details
            </Link>
          </div>

          {/* Hotel Card 3 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease'
          }}>
            <img
              src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop"
              alt="Hotel"
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '15px',
                marginBottom: '1rem'
              }}
            />
            <h3 style={{color: '#333', margin: '0 0 0.5rem 0'}}>Bangalore Tech Hub Hotel</h3>
            <p style={{color: '#666', margin: '0 0 1rem 0'}}>Bangalore • ⭐ 4.2</p>
            <p style={{color: '#333', fontWeight: 'bold', margin: '0 0 1rem 0'}}>₹4,500 / night</p>
            <Link
              to="/hotels/3/book"
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: '600'
              }}
            >
              🏨 View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#003580',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        marginTop: '4rem'
      }}>
        <p>© 2024 Travel Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
