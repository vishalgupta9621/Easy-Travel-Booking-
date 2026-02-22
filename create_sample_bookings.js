const axios = require('axios');

const API_BASE = 'http://localhost:8800/api/v1';
const USER_ID = '689043e5b457708e6fb079c0'; // testuser@gmail.com

const sampleBookings = [
  // Flight Booking
  {
    bookingType: 'flight',
    userId: USER_ID,
    itemId: 'flight_ai101',
    itemDetails: {
      flightNumber: 'AI101',
      airline: {
        name: 'Air India',
        code: 'AI'
      },
      route: {
        origin: {
          city: 'Delhi',
          airport: 'DEL'
        },
        destination: {
          city: 'Bangalore',
          airport: 'BLR'
        }
      },
      schedule: {
        departureTime: '14:30',
        arrivalTime: '17:00',
        duration: '2h 30m'
      },
      class: 'Economy',
      seats: ['15A']
    },
    customerInfo: {
      name: 'Test User',
      email: 'testuser@gmail.com',
      phone: '8787876543'
    },
    totalAmount: 6500,
    travelDate: '2025-08-25T00:00:00.000Z',
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_flight_001',
      amount: 6500,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date().toISOString()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: '15A'
    }]
  },
  
  // Train Booking
  {
    bookingType: 'train',
    userId: USER_ID,
    itemId: 'train_12951',
    itemDetails: {
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      route: {
        origin: {
          city: 'New Delhi',
          station: 'NDLS'
        },
        destination: {
          city: 'Mumbai',
          station: 'MMCT'
        }
      },
      schedule: {
        departureTime: '16:55',
        arrivalTime: '08:35',
        duration: '15h 40m'
      },
      class: '3A',
      seats: ['S1/25']
    },
    customerInfo: {
      name: 'Test User',
      email: 'testuser@gmail.com',
      phone: '8787876543'
    },
    totalAmount: 3200,
    travelDate: '2025-08-28T00:00:00.000Z',
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_train_001',
      amount: 3200,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date().toISOString()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: 'S1/25'
    }]
  },
  
  // Bus Booking
  {
    bookingType: 'bus',
    userId: USER_ID,
    itemId: 'bus_rb456',
    itemDetails: {
      busNumber: 'RB456',
      operator: {
        name: 'RedBus Travels',
        code: 'RBT'
      },
      route: {
        origin: {
          city: 'Delhi',
          station: 'Kashmere Gate'
        },
        destination: {
          city: 'Manali',
          station: 'Manali Bus Stand'
        }
      },
      schedule: {
        departureTime: '20:00',
        arrivalTime: '08:00',
        duration: '12h'
      },
      busType: 'AC Sleeper',
      seats: ['L1']
    },
    customerInfo: {
      name: 'Test User',
      email: 'testuser@gmail.com',
      phone: '8787876543'
    },
    totalAmount: 1800,
    travelDate: '2025-08-30T00:00:00.000Z',
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_bus_001',
      amount: 1800,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date().toISOString()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: 'L1'
    }]
  }
];

async function createBookings() {
  console.log('Creating sample bookings for testuser@gmail.com...');
  
  for (const booking of sampleBookings) {
    try {
      const response = await axios.post(`${API_BASE}/bookings`, booking);
      console.log(`✅ Created ${booking.bookingType} booking:`, response.data.data.bookingNumber);
    } catch (error) {
      console.error(`❌ Failed to create ${booking.bookingType} booking:`, error.response?.data || error.message);
    }
  }
  
  console.log('\n🎉 Sample bookings creation completed!');
  console.log('Now refresh the account page to see all booking types.');
}

createBookings();
