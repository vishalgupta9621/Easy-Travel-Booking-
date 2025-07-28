import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import Flight from '../models/Flight.js';
import Train from '../models/Train.js';
import Bus from '../models/Bus.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const MONGO_URI = process.env.MONGO || 'mongodb://localhost:27017/travel_booking';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Destination.deleteMany({}),
      Flight.deleteMany({}),
      Train.deleteMany({}),
      Bus.deleteMany({}),
      Hotel.deleteMany({}),
      Room.deleteMany({})
    ]);

    // Create Destinations
    const destinations = await Destination.insertMany([
      // Airports
      {
        name: "Indira Gandhi International Airport",
        code: "DEL",
        city: "New Delhi",
        state: "Delhi",
        type: "airport",
        coordinates: { latitude: 28.5562, longitude: 77.1000 }
      },
      {
        name: "Chhatrapati Shivaji International Airport",
        code: "BOM",
        city: "Mumbai",
        state: "Maharashtra",
        type: "airport",
        coordinates: { latitude: 19.0896, longitude: 72.8656 }
      },
      {
        name: "Kempegowda International Airport",
        code: "BLR",
        city: "Bangalore",
        state: "Karnataka",
        type: "airport",
        coordinates: { latitude: 13.1986, longitude: 77.7066 }
      },
      {
        name: "Chennai International Airport",
        code: "MAA",
        city: "Chennai",
        state: "Tamil Nadu",
        type: "airport",
        coordinates: { latitude: 12.9941, longitude: 80.1709 }
      },
      // Railway Stations
      {
        name: "New Delhi Railway Station",
        code: "NDLS",
        city: "New Delhi",
        state: "Delhi",
        type: "railway_station",
        coordinates: { latitude: 28.6434, longitude: 77.2197 }
      },
      {
        name: "Mumbai Central Railway Station",
        code: "BCT",
        city: "Mumbai",
        state: "Maharashtra",
        type: "railway_station",
        coordinates: { latitude: 18.9690, longitude: 72.8205 }
      },
      {
        name: "Bangalore City Railway Station",
        code: "SBC",
        city: "Bangalore",
        state: "Karnataka",
        type: "railway_station",
        coordinates: { latitude: 12.9767, longitude: 77.5993 }
      },
      // Bus Stations
      {
        name: "ISBT Kashmere Gate",
        code: "ISBT",
        city: "New Delhi",
        state: "Delhi",
        type: "bus_station",
        coordinates: { latitude: 28.6667, longitude: 77.2167 }
      },
      {
        name: "Mumbai Central Bus Station",
        code: "MCBS",
        city: "Mumbai",
        state: "Maharashtra",
        type: "bus_station",
        coordinates: { latitude: 18.9690, longitude: 72.8205 }
      }
    ]);

    console.log('Destinations created:', destinations.length);

    // Create Flights
    const flights = await Flight.insertMany([
      {
        flightNumber: 'AI101',
        airline: {
          name: 'Air India',
          code: 'AI'
        },
        aircraft: {
          model: 'Boeing 737',
          capacity: 180
        },
        route: {
          origin: destinations.find(d => d.code === 'DEL')._id,
          destination: destinations.find(d => d.code === 'BOM')._id
        },
        schedule: {
          departureTime: '06:00',
          arrivalTime: '08:30',
          duration: 150,
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        pricing: {
          economy: {
            basePrice: 5000,
            taxes: 500,
            totalSeats: 150
          },
          business: {
            basePrice: 12000,
            taxes: 1200,
            totalSeats: 20
          },
          first: {
            basePrice: 25000,
            taxes: 2500,
            totalSeats: 10
          }
        },
        amenities: [
          { name: 'WiFi', description: 'Free in-flight WiFi', isComplimentary: true },
          { name: 'Meals', description: 'Complimentary meals', isComplimentary: true },
          { name: 'Entertainment', description: 'In-flight entertainment system', isComplimentary: true }
        ],
        status: 'active'
      },
      {
        flightNumber: 'SG202',
        airline: {
          name: 'SpiceJet',
          code: 'SG'
        },
        aircraft: {
          model: 'Boeing 737',
          capacity: 189
        },
        route: {
          origin: destinations.find(d => d.code === 'BOM')._id,
          destination: destinations.find(d => d.code === 'BLR')._id
        },
        schedule: {
          departureTime: '14:00',
          arrivalTime: '15:30',
          duration: 90,
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        pricing: {
          economy: {
            basePrice: 4500,
            taxes: 450,
            totalSeats: 169
          },
          business: {
            basePrice: 8500,
            taxes: 850,
            totalSeats: 20
          }
        },
        amenities: [
          { name: 'WiFi', description: 'Free in-flight WiFi', isComplimentary: true },
          { name: 'Snacks', description: 'Light snacks', isComplimentary: true }
        ],
        status: 'active'
      }
    ]);

    console.log('Flights created:', flights.length);

    // Create Trains
    const trains = await Train.insertMany([
      {
        trainNumber: '12951',
        trainName: 'Mumbai Rajdhani Express',
        trainType: 'rajdhani',
        route: {
          origin: destinations.find(d => d.code === 'NDLS')._id,
          destination: destinations.find(d => d.code === 'BCT')._id
        },
        schedule: {
          departureTime: '16:55',
          arrivalTime: '08:35',
          duration: '15h 40m',
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        classes: [
          {
            name: 'First AC',
            code: '1A',
            basePrice: 3500,
            totalSeats: 18
          },
          {
            name: 'Second AC',
            code: '2A',
            basePrice: 2500,
            totalSeats: 54
          },
          {
            name: 'Third AC',
            code: '3A',
            basePrice: 1800,
            totalSeats: 72
          }
        ],
        amenities: [
          { name: 'Meals', description: 'Complimentary meals', isComplimentary: true },
          { name: 'Bedding', description: 'Clean bedding provided', isComplimentary: true },
          { name: 'Charging Points', description: 'Mobile charging points', isComplimentary: true }
        ],
        status: 'active'
      }
    ]);

    console.log('Trains created:', trains.length);

    // Create Buses
    const buses = await Bus.insertMany([
      {
        busNumber: 'DL01AB1234',
        operator: {
          name: 'RedBus Travels',
          code: 'RBT'
        },
        busType: 'ac_sleeper',
        route: {
          origin: destinations.find(d => d.code === 'ISBT')._id,
          destination: destinations.find(d => d.code === 'MCBS')._id
        },
        schedule: {
          departureTime: '20:00',
          arrivalTime: '12:00',
          duration: '16h 00m',
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        seating: {
          totalSeats: 40,
          layout: '2+1',
          seatConfiguration: [
            { seatNumber: 'L1', seatType: 'window', isAvailable: true, price: 1200 },
            { seatNumber: 'L2', seatType: 'aisle', isAvailable: true, price: 1200 },
            { seatNumber: 'U1', seatType: 'window', isAvailable: true, price: 1200 },
            { seatNumber: 'U2', seatType: 'aisle', isAvailable: true, price: 1200 }
          ]
        },
        basePrice: 1200,
        taxes: 120,
        amenities: [
          { name: 'WiFi', description: 'Free WiFi', isComplimentary: true },
          { name: 'Charging Points', description: 'Mobile charging points', isComplimentary: true },
          { name: 'Blanket', description: 'Clean blankets provided', isComplimentary: true },
          { name: 'Water', description: 'Complimentary water bottles', isComplimentary: true }
        ],
        status: 'active'
      }
    ]);

    console.log('Buses created:', buses.length);

    // Create Hotels
    const hotels = await Hotel.insertMany([
      {
        name: "The Grand Palace Hotel",
        type: "hotel",
        city: "New Delhi",
        address: "Connaught Place, New Delhi",
        distance: "2km from city center",
        photos: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500"
        ],
        title: "Luxury hotel in the heart of Delhi",
        desc: "Experience luxury and comfort at The Grand Palace Hotel, located in the heart of New Delhi. Our hotel offers world-class amenities and exceptional service.",
        rating: 4.5,
        cheapestPrice: 5000,
        featured: true
      },
      {
        name: "Mumbai Business Hotel",
        type: "hotel",
        city: "Mumbai",
        address: "Bandra West, Mumbai",
        distance: "5km from airport",
        photos: [
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500"
        ],
        title: "Modern business hotel in Mumbai",
        desc: "Perfect for business travelers, our hotel offers modern amenities and easy access to Mumbai's business district.",
        rating: 4.2,
        cheapestPrice: 4000,
        featured: true
      }
    ]);

    console.log('Hotels created:', hotels.length);

    console.log('✅ Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
