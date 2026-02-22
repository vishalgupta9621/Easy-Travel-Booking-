import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flight from '../app/models/Flight.js';
import Destination from '../app/models/Destination.js';

dotenv.config();

const addBangaloreFlights = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO);
    console.log('Connected to MongoDB');

    // Get destination IDs
    const bangalore = await Destination.findOne({ city: 'Bangalore' });
    const delhi = await Destination.findOne({ city: 'Delhi' });

    if (!bangalore || !delhi) {
      console.error('Bangalore or Delhi destination not found');
      return;
    }

    console.log('Bangalore ID:', bangalore._id);
    console.log('Delhi ID:', delhi._id);

    // Create Bangalore to Delhi flights
    const bangaloreToDelhi = [
      {
        flightNumber: '6E4001',
        airline: { name: 'IndiGo', code: '6E' },
        aircraft: { model: 'Airbus A320', capacity: 170 },
        route: {
          origin: bangalore._id,
          destination: delhi._id,
          stops: []
        },
        schedule: {
          departureTime: '06:00',
          arrivalTime: '08:30',
          duration: 150,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        pricing: {
          economy: {
            basePrice: 4500,
            totalSeats: 150,
            availableSeats: 150
          },
          business: {
            basePrice: 8500,
            totalSeats: 15,
            availableSeats: 15
          },
          first: {
            basePrice: 15000,
            totalSeats: 5,
            availableSeats: 5
          }
        },
        amenities: [
          { name: 'WiFi', description: 'Complimentary WiFi', isComplimentary: true },
          { name: 'Meals', description: 'In-flight meals', isComplimentary: true },
          { name: 'Entertainment', description: 'In-flight entertainment', isComplimentary: true }
        ],
        baggage: { cabin: '7 kg', checkedIn: '15 kg' },
        status: 'active',
        isRefundable: true
      },
      {
        flightNumber: 'AI4002',
        airline: { name: 'Air India', code: 'AI' },
        aircraft: { model: 'Airbus A320', capacity: 170 },
        route: {
          origin: bangalore._id,
          destination: delhi._id,
          stops: []
        },
        schedule: {
          departureTime: '09:00',
          arrivalTime: '11:30',
          duration: 150,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        pricing: {
          economy: {
            basePrice: 5000,
            totalSeats: 150,
            availableSeats: 150
          },
          business: {
            basePrice: 9000,
            totalSeats: 15,
            availableSeats: 15
          },
          first: {
            basePrice: 16000,
            totalSeats: 5,
            availableSeats: 5
          }
        },
        amenities: [
          { name: 'WiFi', description: 'Complimentary WiFi', isComplimentary: true },
          { name: 'Meals', description: 'In-flight meals', isComplimentary: true },
          { name: 'Entertainment', description: 'In-flight entertainment', isComplimentary: true }
        ],
        baggage: { cabin: '7 kg', checkedIn: '15 kg' },
        status: 'active',
        isRefundable: true
      },
      {
        flightNumber: 'SG4003',
        airline: { name: 'SpiceJet', code: 'SG' },
        aircraft: { model: 'Airbus A320', capacity: 170 },
        route: {
          origin: bangalore._id,
          destination: delhi._id,
          stops: []
        },
        schedule: {
          departureTime: '12:00',
          arrivalTime: '14:30',
          duration: 150,
          validFrom: new Date(),
          validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          frequency: 'daily',
          operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        pricing: {
          economy: {
            basePrice: 4200,
            totalSeats: 150,
            availableSeats: 150
          },
          business: {
            basePrice: 7800,
            totalSeats: 15,
            availableSeats: 15
          },
          first: {
            basePrice: 14000,
            totalSeats: 5,
            availableSeats: 5
          }
        },
        amenities: [
          { name: 'WiFi', description: 'Complimentary WiFi', isComplimentary: true },
          { name: 'Meals', description: 'In-flight meals', isComplimentary: true },
          { name: 'Entertainment', description: 'In-flight entertainment', isComplimentary: true }
        ],
        baggage: { cabin: '7 kg', checkedIn: '15 kg' },
        status: 'active',
        isRefundable: true
      }
    ];

    // Insert flights
    await Flight.insertMany(bangaloreToDelhi);
    console.log('✅ Added 3 Bangalore to Delhi flights');

    // Verify the flights were added
    const count = await Flight.countDocuments({
      'route.origin': bangalore._id,
      'route.destination': delhi._id
    });
    console.log(`✅ Total Bangalore to Delhi flights: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error adding flights:', error);
    process.exit(1);
  }
};

addBangaloreFlights();
