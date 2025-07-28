import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import Flight from '../models/Flight.js';
import Train from '../models/Train.js';
import Bus from '../models/Bus.js';
import { connectDB } from '../utils/db.js';

// Sample destinations data
const destinations = [
  // Airports
  {
    name: "Indira Gandhi International Airport",
    code: "DEL",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    type: "airport",
    coordinates: { latitude: 28.5562, longitude: 77.1000 }
  },
  {
    name: "Chhatrapati Shivaji Maharaj International Airport",
    code: "BOM",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    type: "airport",
    coordinates: { latitude: 19.0896, longitude: 72.8656 }
  },
  {
    name: "Kempegowda International Airport",
    code: "BLR",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    type: "airport",
    coordinates: { latitude: 13.1986, longitude: 77.7066 }
  },
  {
    name: "Chennai International Airport",
    code: "MAA",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    type: "airport",
    coordinates: { latitude: 12.9941, longitude: 80.1709 }
  },
  
  // Railway Stations
  {
    name: "New Delhi Railway Station",
    code: "NDLS",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    type: "railway_station",
    coordinates: { latitude: 28.6434, longitude: 77.2197 }
  },
  {
    name: "Mumbai Central",
    code: "BCT",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    type: "railway_station",
    coordinates: { latitude: 18.9690, longitude: 72.8205 }
  },
  {
    name: "Bangalore City Junction",
    code: "SBC",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    type: "railway_station",
    coordinates: { latitude: 12.9767, longitude: 77.5993 }
  },
  {
    name: "Chennai Central",
    code: "MAS",
    city: "Chennai",
    state: "Tamil Nadu",
    country: "India",
    type: "railway_station",
    coordinates: { latitude: 13.0827, longitude: 80.2707 }
  },
  
  // Bus Stations
  {
    name: "ISBT Kashmere Gate",
    code: "ISBT-KG",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    type: "bus_station",
    coordinates: { latitude: 28.6667, longitude: 77.2167 }
  },
  {
    name: "Mumbai Central Bus Depot",
    code: "MCBD",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    type: "bus_station",
    coordinates: { latitude: 18.9690, longitude: 72.8205 }
  }
];

const seedDestinations = async () => {
  try {
    await Destination.deleteMany({});
    const createdDestinations = await Destination.insertMany(destinations);
    console.log('✅ Destinations seeded successfully');
    return createdDestinations;
  } catch (error) {
    console.error('❌ Error seeding destinations:', error);
    throw error;
  }
};

const seedFlights = async (destinations) => {
  try {
    await Flight.deleteMany({});
    
    const airports = destinations.filter(d => d.type === 'airport');
    const flights = [];
    
    // Create sample flights between major airports
    const flightRoutes = [
      { from: 'DEL', to: 'BOM', airline: 'Air India', code: 'AI', duration: 135 },
      { from: 'DEL', to: 'BLR', airline: 'IndiGo', code: '6E', duration: 165 },
      { from: 'DEL', to: 'MAA', airline: 'SpiceJet', code: 'SG', duration: 150 },
      { from: 'BOM', to: 'BLR', airline: 'Vistara', code: 'UK', duration: 90 },
      { from: 'BOM', to: 'MAA', airline: 'Air India', code: 'AI', duration: 105 },
      { from: 'BLR', to: 'MAA', airline: 'IndiGo', code: '6E', duration: 75 }
    ];
    
    for (const route of flightRoutes) {
      const origin = airports.find(a => a.code === route.from);
      const destination = airports.find(a => a.code === route.to);
      
      if (origin && destination) {
        // Create multiple flights for each route with different times
        const times = [
          { dep: '06:00', arr: '08:15' },
          { dep: '10:30', arr: '12:45' },
          { dep: '15:20', arr: '17:35' },
          { dep: '19:45', arr: '22:00' }
        ];
        
        times.forEach((time, index) => {
          flights.push({
            flightNumber: `${route.code}${Math.floor(Math.random() * 9000) + 1000}`,
            airline: {
              name: route.airline,
              code: route.code
            },
            aircraft: {
              model: 'Boeing 737',
              capacity: 180
            },
            route: {
              origin: origin._id,
              destination: destination._id,
              stops: []
            },
            schedule: {
              departureTime: time.dep,
              arrivalTime: time.arr,
              duration: route.duration,
              frequency: 'daily',
              operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
              validFrom: new Date(),
              validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            },
            pricing: {
              economy: {
                basePrice: Math.floor(Math.random() * 5000) + 3000,
                taxes: 500,
                totalSeats: 150
              },
              business: {
                basePrice: Math.floor(Math.random() * 8000) + 8000,
                taxes: 800,
                totalSeats: 20
              }
            },
            amenities: [
              { name: 'In-flight meal', description: 'Complimentary meal service' },
              { name: 'Entertainment', description: 'In-seat entertainment system' }
            ],
            baggage: {
              cabin: '7 kg',
              checkedIn: '15 kg'
            },
            status: 'active'
          });
        });
      }
    }
    
    await Flight.insertMany(flights);
    console.log('✅ Flights seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding flights:', error);
    throw error;
  }
};

const seedTrains = async (destinations) => {
  try {
    await Train.deleteMany({});
    
    const stations = destinations.filter(d => d.type === 'railway_station');
    const trains = [];
    
    const trainRoutes = [
      { from: 'NDLS', to: 'BCT', name: 'Rajdhani Express', number: '12951', type: 'rajdhani' },
      { from: 'NDLS', to: 'SBC', name: 'Karnataka Express', number: '12627', type: 'express' },
      { from: 'NDLS', to: 'MAS', name: 'Tamil Nadu Express', number: '12621', type: 'express' },
      { from: 'BCT', to: 'SBC', name: 'Udyan Express', number: '11301', type: 'express' },
      { from: 'BCT', to: 'MAS', name: 'Chennai Express', number: '11041', type: 'express' }
    ];
    
    for (const route of trainRoutes) {
      const origin = stations.find(s => s.code === route.from);
      const destination = stations.find(s => s.code === route.to);
      
      if (origin && destination) {
        trains.push({
          trainNumber: route.number,
          trainName: route.name,
          trainType: route.type,
          route: {
            origin: origin._id,
            destination: destination._id,
            stations: []
          },
          schedule: {
            departureTime: '20:30',
            arrivalTime: '08:45',
            duration: '12:15',
            frequency: 'daily',
            operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            validFrom: new Date(),
            validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          classes: [
            { name: 'Sleeper', code: 'SL', basePrice: 800, totalSeats: 72 },
            { name: '3rd AC', code: '3A', basePrice: 1500, totalSeats: 64 },
            { name: '2nd AC', code: '2A', basePrice: 2200, totalSeats: 48 },
            { name: '1st AC', code: '1A', basePrice: 3500, totalSeats: 24 }
          ],
          amenities: [
            { name: 'Pantry Car', description: 'Food service available' },
            { name: 'Bedding', description: 'Clean bedding provided' }
          ],
          pantryAvailable: true,
          wifiAvailable: route.type === 'rajdhani',
          status: 'active'
        });
      }
    }
    
    await Train.insertMany(trains);
    console.log('✅ Trains seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding trains:', error);
    throw error;
  }
};

const seedBuses = async (destinations) => {
  try {
    await Bus.deleteMany({});
    
    const busStations = destinations.filter(d => d.type === 'bus_station');
    const buses = [];
    
    const busRoutes = [
      { from: 'ISBT-KG', to: 'MCBD', operator: 'RedBus Travels', type: 'ac_sleeper' },
      { from: 'ISBT-KG', to: 'MCBD', operator: 'Sharma Travels', type: 'ac_seater' },
      { from: 'ISBT-KG', to: 'MCBD', operator: 'VRL Travels', type: 'volvo' }
    ];
    
    for (const route of busRoutes) {
      const origin = busStations.find(s => s.code === route.from);
      const destination = busStations.find(s => s.code === route.to);
      
      if (origin && destination) {
        const times = [
          { dep: '22:00', arr: '12:00' },
          { dep: '23:30', arr: '13:30' }
        ];
        
        times.forEach((time, index) => {
          buses.push({
            busNumber: `${route.operator.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 900) + 100}`,
            operator: {
              name: route.operator,
              code: route.operator.substring(0, 3).toUpperCase(),
              rating: Math.floor(Math.random() * 2) + 4 // 4-5 rating
            },
            busType: route.type,
            route: {
              origin: origin._id,
              destination: destination._id,
              stops: []
            },
            schedule: {
              departureTime: time.dep,
              arrivalTime: time.arr,
              duration: '14:00',
              frequency: 'daily',
              operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
              validFrom: new Date(),
              validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            seating: {
              totalSeats: route.type.includes('sleeper') ? 40 : 45,
              layout: route.type.includes('sleeper') ? '2+1' : '2+2',
              seatConfiguration: Array.from({ length: route.type.includes('sleeper') ? 40 : 45 }, (_, i) => ({
                seatNumber: `${Math.floor(i / (route.type.includes('sleeper') ? 3 : 4)) + 1}${String.fromCharCode(65 + (i % (route.type.includes('sleeper') ? 3 : 4)))}`,
                seatType: i % 4 === 0 ? 'window' : i % 4 === 3 ? 'window' : 'aisle',
                isAvailable: true,
                price: Math.floor(Math.random() * 500) + 1000
              }))
            },
            amenities: [
              { name: 'AC', description: 'Air conditioning' },
              { name: 'Charging Point', description: 'Mobile charging facility' }
            ],
            basePrice: Math.floor(Math.random() * 500) + 1000,
            taxes: 100,
            status: 'active',
            rating: Math.floor(Math.random() * 2) + 4,
            reviews: Math.floor(Math.random() * 500) + 100
          });
        });
      }
    }
    
    await Bus.insertMany(buses);
    console.log('✅ Buses seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding buses:', error);
    throw error;
  }
};

const seedTravelData = async () => {
  try {
    console.log('🌱 Starting travel data seeding...');
    
    // Connect to database
    await connectDB();
    
    // Seed destinations first
    const destinations = await seedDestinations();
    
    // Seed travel options
    await Promise.all([
      seedFlights(destinations),
      seedTrains(destinations),
      seedBuses(destinations)
    ]);
    
    console.log('🎉 All travel data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error seeding travel data:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTravelData();
}

export default seedTravelData;
