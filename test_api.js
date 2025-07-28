// Simple test to check if API is working
import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    console.log('Testing API endpoints...');
    
    // Test destinations endpoint
    const destResponse = await fetch('http://localhost:5000/api/destinations');
    if (destResponse.ok) {
      const destinations = await destResponse.json();
      console.log('✅ Destinations API working:', destinations.length, 'destinations found');
    } else {
      console.log('❌ Destinations API failed:', destResponse.status);
    }
    
    // Test flights endpoint
    const flightResponse = await fetch('http://localhost:5000/api/flights');
    if (flightResponse.ok) {
      const flights = await flightResponse.json();
      console.log('✅ Flights API working:', flights.length, 'flights found');
    } else {
      console.log('❌ Flights API failed:', flightResponse.status);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
};

testAPI();
