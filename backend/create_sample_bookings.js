import mongoose from 'mongoose';
import Booking from './src/app/models/Booking.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/travel_booking');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

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
    travelDate: new Date('2025-08-25'),
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_flight_001',
      amount: 6500,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: '15A'
    }],
    bookingNumber: `BK${Date.now()}001`,
    bookingDate: new Date(),
    refundAmount: 0,
    emailSent: false
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
    travelDate: new Date('2025-08-28'),
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_train_001',
      amount: 3200,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: 'S1/25'
    }],
    bookingNumber: `BK${Date.now()}002`,
    bookingDate: new Date(),
    refundAmount: 0,
    emailSent: false
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
    travelDate: new Date('2025-08-30'),
    bookingStatus: 'confirmed',
    paymentInfo: {
      paymentId: 'demo_bus_001',
      amount: 1800,
      currency: 'INR',
      method: 'demo',
      status: 'success',
      timestamp: new Date()
    },
    passengers: [{
      name: 'Test User',
      age: 30,
      gender: 'Male',
      seatNumber: 'L1'
    }],
    bookingNumber: `BK${Date.now()}003`,
    bookingDate: new Date(),
    refundAmount: 0,
    emailSent: false
  }
];

async function createSampleBookings() {
  await connectDB();
  
  console.log('Creating sample bookings for testuser@gmail.com...');
  
  try {
    for (const bookingData of sampleBookings) {
      const booking = new Booking(bookingData);
      await booking.save();
      console.log(`✅ Created ${bookingData.bookingType} booking: ${booking.bookingNumber}`);
    }
    
    console.log('\n🎉 All sample bookings created successfully!');
    console.log('Now refresh the account page to see all booking types.');
    
  } catch (error) {
    console.error('❌ Error creating bookings:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
}

createSampleBookings();
