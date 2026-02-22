import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
import Destination from '../app/models/Destination.js';
import Flight from '../app/models/Flight.js';
import Hotel from '../app/models/Hotel.js';
import Train from '../app/models/Train.js';
import Bus from '../app/models/Bus.js';
import Package from '../app/models/Package.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel_booking');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDestinations = async () => {
  console.log('Seeding destinations...');
  
  const destinations = [
    // Airports
    { name: 'Delhi Airport', code: 'ADEL', city: 'Delhi', state: 'Delhi', country: 'India', type: 'airport', isActive: true },
    { name: 'Mumbai Airport', code: 'AMUM', city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'airport', isActive: true },
    { name: 'Bangalore Airport', code: 'ABAN', city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'airport', isActive: true },
    { name: 'Chennai Airport', code: 'ACHE', city: 'Chennai', state: 'Tamil Nadu', country: 'India', type: 'airport', isActive: true },
    { name: 'Kolkata Airport', code: 'AKOL', city: 'Kolkata', state: 'West Bengal', country: 'India', type: 'airport', isActive: true },
    
    // Railway Stations
    { name: 'New Delhi Railway Station', code: 'RDEL', city: 'Delhi', state: 'Delhi', country: 'India', type: 'railway_station', isActive: true },
    { name: 'Mumbai Central Railway Station', code: 'RMUM', city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'railway_station', isActive: true },
    { name: 'Bangalore City Railway Station', code: 'RBAN', city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'railway_station', isActive: true },
    { name: 'Chennai Central Railway Station', code: 'RCHE', city: 'Chennai', state: 'Tamil Nadu', country: 'India', type: 'railway_station', isActive: true },
    
    // Bus Stations
    { name: 'Delhi Bus Terminal', code: 'BDEL', city: 'Delhi', state: 'Delhi', country: 'India', type: 'bus_station', isActive: true },
    { name: 'Mumbai Bus Station', code: 'BMUM', city: 'Mumbai', state: 'Maharashtra', country: 'India', type: 'bus_station', isActive: true },
    { name: 'Bangalore Bus Terminal', code: 'BBAN', city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'bus_station', isActive: true }
  ];

  for (const dest of destinations) {
    await Destination.findOneAndUpdate(
      { code: dest.code },
      dest,
      { upsert: true, new: true }
    );
  }
  
  console.log('Destinations seeded successfully');
  return destinations;
};

const seedFlights = async (destinations) => {
  console.log('Seeding flights...');
  
  const airports = destinations.filter(d => d.type === 'airport');
  const delhiAirport = airports.find(a => a.city === 'Delhi');
  const mumbaiAirport = airports.find(a => a.city === 'Mumbai');
  const bangaloreAirport = airports.find(a => a.city === 'Bangalore');
  const chennaiAirport = airports.find(a => a.city === 'Chennai');

  const flights = [
    {
      flightNumber: 'AI101',
      airline: { name: 'Air India', code: 'AI' },
      aircraft: { model: 'Boeing 737', capacity: 180 },
      route: {
        origin: delhiAirport._id,
        destination: mumbaiAirport._id
      },
      schedule: {
        departureTime: '09:00',
        arrivalTime: '11:30',
        duration: 150,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      pricing: {
        economy: { basePrice: 5500, totalSeats: 150, availableSeats: 150 },
        business: { basePrice: 12000, totalSeats: 20, availableSeats: 20 },
        first: { basePrice: 18000, totalSeats: 10, availableSeats: 10 }
      },
      status: 'active'
    },
    {
      flightNumber: 'SG201',
      airline: { name: 'SpiceJet', code: 'SG' },
      aircraft: { model: 'Boeing 737', capacity: 180 },
      route: {
        origin: mumbaiAirport._id,
        destination: delhiAirport._id
      },
      schedule: {
        departureTime: '14:00',
        arrivalTime: '16:30',
        duration: 150,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      pricing: {
        economy: { basePrice: 4800, totalSeats: 150, availableSeats: 150 },
        business: { basePrice: 11000, totalSeats: 20, availableSeats: 20 }
      },
      status: 'active'
    },
    {
      flightNumber: 'UK301',
      airline: { name: 'Vistara', code: 'UK' },
      aircraft: { model: 'Airbus A320', capacity: 180 },
      route: {
        origin: delhiAirport._id,
        destination: bangaloreAirport._id
      },
      schedule: {
        departureTime: '07:30',
        arrivalTime: '10:00',
        duration: 150,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      pricing: {
        economy: { basePrice: 6200, totalSeats: 150, availableSeats: 150 },
        business: { basePrice: 13500, totalSeats: 20, availableSeats: 20 }
      },
      status: 'active'
    }
  ];

  for (const flight of flights) {
    await Flight.findOneAndUpdate(
      { flightNumber: flight.flightNumber },
      flight,
      { upsert: true, new: true }
    );
  }
  
  console.log('Flights seeded successfully');
};

const seedHotels = async () => {
  console.log('Seeding hotels...');
  
  const hotels = [
    {
      name: 'Taj Mahal Palace Mumbai',
      city: 'Mumbai',
      address: 'Apollo Bunder, Colaba, Mumbai',
      desc: 'Luxury heritage hotel with stunning views of the Gateway of India',
      cheapestPrice: 15000,
      featured: true,
      photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
      rating: 4.8,
      rooms: [
        { title: 'Deluxe Room', price: 15000, maxPeople: 2, desc: 'Elegant room with city view' },
        { title: 'Premium Suite', price: 25000, maxPeople: 4, desc: 'Spacious suite with harbor view' }
      ]
    },
    {
      name: 'The Leela Palace New Delhi',
      city: 'Delhi',
      address: 'Diplomatic Enclave, New Delhi',
      desc: 'Opulent hotel in the heart of the diplomatic district',
      cheapestPrice: 18000,
      featured: true,
      photos: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400'],
      rating: 4.9,
      rooms: [
        { title: 'Royal Club Room', price: 18000, maxPeople: 2, desc: 'Luxurious room with garden view' },
        { title: 'Grand Suite', price: 35000, maxPeople: 4, desc: 'Presidential suite with butler service' }
      ]
    },
    {
      name: 'ITC Gardenia Bangalore',
      city: 'Bangalore',
      address: 'Residency Road, Bangalore',
      desc: 'Contemporary luxury hotel in the IT capital',
      cheapestPrice: 12000,
      featured: true,
      photos: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400'],
      rating: 4.6,
      rooms: [
        { title: 'Executive Room', price: 12000, maxPeople: 2, desc: 'Modern room with tech amenities' },
        { title: 'Club Suite', price: 20000, maxPeople: 3, desc: 'Spacious suite with lounge access' }
      ]
    }
  ];

  for (const hotel of hotels) {
    await Hotel.findOneAndUpdate(
      { name: hotel.name },
      hotel,
      { upsert: true, new: true }
    );
  }
  
  console.log('Hotels seeded successfully');
};

const seedPackages = async () => {
  console.log('Seeding packages...');
  
  const packages = [
    {
      name: 'Golden Triangle Tour',
      description: 'Explore Delhi, Agra, and Jaipur in this classic India tour',
      destinations: ['Delhi', 'Agra', 'Jaipur'],
      duration: 6,
      type: 'cultural',
      basePrice: 25000,
      images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400'],
      inclusions: ['Accommodation', 'Meals', 'Transportation', 'Guide'],
      exclusions: ['Flights', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrival in Delhi', activities: ['Airport pickup', 'Hotel check-in', 'Red Fort visit'] },
        { day: 2, title: 'Delhi Sightseeing', activities: ['India Gate', 'Lotus Temple', 'Qutub Minar'] }
      ]
    },
    {
      name: 'Kerala Backwaters Experience',
      description: 'Serene houseboat experience in Gods Own Country',
      destinations: ['Kochi', 'Alleppey', 'Kumarakom'],
      duration: 4,
      type: 'leisure',
      basePrice: 18000,
      images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400'],
      inclusions: ['Houseboat stay', 'All meals', 'Transfers'],
      exclusions: ['Flights', 'Shopping'],
      itinerary: [
        { day: 1, title: 'Arrival in Kochi', activities: ['Airport pickup', 'City tour'] },
        { day: 2, title: 'Houseboat Journey', activities: ['Board houseboat', 'Backwater cruise'] }
      ]
    }
  ];

  for (const pkg of packages) {
    await Package.findOneAndUpdate(
      { name: pkg.name },
      pkg,
      { upsert: true, new: true }
    );
  }
  
  console.log('Packages seeded successfully');
};

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Starting data seeding...');
    
    const destinations = await seedDestinations();
    await seedFlights(destinations);
    await seedHotels();
    await seedPackages();
    
    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeding
seedData();
