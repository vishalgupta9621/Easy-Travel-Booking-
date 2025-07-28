import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index.js';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Flight from '../models/Flight.js';
import Train from '../models/Train.js';
import Bus from '../models/Bus.js';
import TravelBooking from '../models/TravelBooking.js';

// Test database
const MONGODB_URI = process.env.MONGO_TEST || 'mongodb://localhost:27017/travel_booking_test';

describe('Travel Booking API', () => {
  let authToken;
  let adminToken;
  let userId;
  let adminId;
  let destinations = {};
  let travelServices = {};

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI);
    
    // Clear test database
    await Promise.all([
      User.deleteMany({}),
      Destination.deleteMany({}),
      Flight.deleteMany({}),
      Train.deleteMany({}),
      Bus.deleteMany({}),
      TravelBooking.deleteMany({})
    ]);

    // Create test users
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210'
      });

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        phone: '9876543211',
        role: 'admin'
      });

    // Login users
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'Test123!'
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'Admin123!'
      });

    authToken = userLogin.body.token;
    adminToken = adminLogin.body.token;
    userId = userLogin.body.user._id;
    adminId = adminLogin.body.user._id;

    // Create test destinations
    const destinationData = [
      {
        name: "Test Airport Delhi",
        code: "DEL",
        city: "New Delhi",
        state: "Delhi",
        type: "airport"
      },
      {
        name: "Test Airport Mumbai",
        code: "BOM",
        city: "Mumbai",
        state: "Maharashtra",
        type: "airport"
      },
      {
        name: "Test Station Delhi",
        code: "NDLS",
        city: "New Delhi",
        state: "Delhi",
        type: "railway_station"
      },
      {
        name: "Test Bus Stand Delhi",
        code: "ISBT",
        city: "New Delhi",
        state: "Delhi",
        type: "bus_station"
      }
    ];

    for (const dest of destinationData) {
      const response = await request(app)
        .post('/api/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(dest);
      destinations[dest.code] = response.body.destination._id;
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'NewUser123!',
          firstName: 'New',
          lastName: 'User',
          phone: '9876543212'
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.role).toBe('user');
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Destinations', () => {
    test('should get all destinations', async () => {
      const response = await request(app)
        .get('/api/destinations');

      expect(response.status).toBe(200);
      expect(response.body.destinations).toHaveLength(4);
    });

    test('should get destinations by type', async () => {
      const response = await request(app)
        .get('/api/destinations/type/airport');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should create destination (admin only)', async () => {
      const response = await request(app)
        .post('/api/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: "Test Airport Bangalore",
          code: "BLR",
          city: "Bangalore",
          state: "Karnataka",
          type: "airport"
        });

      expect(response.status).toBe(201);
      expect(response.body.destination.code).toBe('BLR');
    });

    test('should reject destination creation by non-admin', async () => {
      const response = await request(app)
        .post('/api/destinations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: "Unauthorized Airport",
          code: "UNA",
          city: "Unauthorized",
          state: "Test",
          type: "airport"
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Flights', () => {
    beforeAll(async () => {
      // Create test flight
      const flightResponse = await request(app)
        .post('/api/flights')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
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
            origin: destinations.DEL,
            destination: destinations.BOM
          },
          schedule: {
            departureTime: '10:00',
            arrivalTime: '12:30',
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
            }
          }
        });

      travelServices.flight = flightResponse.body.flight._id;
    });

    test('should search flights', async () => {
      const response = await request(app)
        .get('/api/flights/search')
        .query({
          origin: destinations.DEL,
          destination: destinations.BOM,
          departureDate: new Date().toISOString().split('T')[0],
          passengers: 1,
          class: 'economy'
        });

      expect(response.status).toBe(200);
      expect(response.body.flights).toHaveLength(1);
      expect(response.body.flights[0].flightNumber).toBe('AI101');
    });

    test('should get flight availability', async () => {
      const response = await request(app)
        .get(`/api/flights/${travelServices.flight}/availability`)
        .query({
          date: new Date().toISOString().split('T')[0],
          class: 'economy'
        });

      expect(response.status).toBe(200);
      expect(response.body.availableSeats).toBe(150);
      expect(response.body.isAvailable).toBe(true);
    });
  });

  describe('Travel Bookings', () => {
    test('should create a travel booking', async () => {
      const bookingData = {
        travelType: 'flight',
        serviceId: travelServices.flight,
        journey: {
          origin: destinations.DEL,
          destination: destinations.BOM,
          departureDate: new Date(),
          arrivalDate: new Date(),
          departureTime: '10:00',
          arrivalTime: '12:30'
        },
        passengers: [{
          title: 'Mr',
          firstName: 'Test',
          lastName: 'Passenger',
          age: 30,
          gender: 'male',
          seatPreference: 'window'
        }],
        bookingDetails: {
          class: 'economy',
          totalSeats: 1
        },
        contact: {
          email: 'test@example.com',
          phone: '9876543210'
        },
        payment: {
          method: 'credit_card',
          transactionId: 'TXN123456789'
        }
      };

      const response = await request(app)
        .post('/api/travel-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.booking.bookingId).toBeDefined();
      expect(response.body.booking.status).toBe('pending');
      expect(response.body.pointsEarned).toBeGreaterThan(0);
    });

    test('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/travel-bookings/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toHaveLength(1);
    });

    test('should reject booking without authentication', async () => {
      const response = await request(app)
        .post('/api/travel-bookings')
        .send({
          travelType: 'flight',
          serviceId: travelServices.flight
        });

      expect(response.status).toBe(403);
    });

    test('should reject booking with insufficient data', async () => {
      const response = await request(app)
        .post('/api/travel-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          travelType: 'flight'
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Admin Operations', () => {
    test('should get all bookings (admin only)', async () => {
      const response = await request(app)
        .get('/api/travel-bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.bookings).toBeDefined();
    });

    test('should reject admin operations for regular users', async () => {
      const response = await request(app)
        .get('/api/travel-bookings')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    test('should get all flights (admin only)', async () => {
      const response = await request(app)
        .get('/api/flights')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.flights).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid destination ID', async () => {
      const response = await request(app)
        .get('/api/destinations/invalid-id');

      expect(response.status).toBe(404);
    });

    test('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/travel-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          invalidField: 'invalid'
        });

      expect(response.status).toBe(400);
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .post('/api/flights')
        .send({
          flightNumber: 'UNAUTHORIZED'
        });

      expect(response.status).toBe(403);
    });
  });
});
