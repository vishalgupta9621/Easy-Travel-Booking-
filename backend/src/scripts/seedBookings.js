import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../app/models/Booking.js';
import HotelBooking from '../app/models/HotelBooking.js';
import TravelBooking from '../app/models/TravelBooking.js';
import PackageBooking from '../app/models/PackageBooking.js';
import User from '../app/models/users.model.js';
import Hotel from '../app/models/Hotel.js';
import Flight from '../app/models/Flight.js';
import Package from '../app/models/Package.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding bookings');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedBookings = async () => {
  try {
    console.log('Seeding sample bookings...');
    
    // Find a sample user (or create one)
    let sampleUser = await User.findOne({ email: 'rajalaxmisarangi2025@gmail.com' });
    if (!sampleUser) {
      sampleUser = await User.findOne();
    }
    
    if (!sampleUser) {
      console.log('No users found. Creating a sample user...');
      sampleUser = new User({
        name: 'Sample User',
        email: 'sample@example.com',
        password: 'password123',
        phone: '1234567890'
      });
      await sampleUser.save();
    }

    console.log('Using user:', sampleUser.email);

    // Find sample items
    const sampleHotel = await Hotel.findOne();
    const sampleFlight = await Flight.findOne();
    const samplePackage = await Package.findOne();

    // Clear existing bookings for this user
    await Booking.deleteMany({ userId: sampleUser._id });
    await HotelBooking.deleteMany({ userId: sampleUser._id });
    await TravelBooking.deleteMany({ userId: sampleUser._id });
    await PackageBooking.deleteMany({ userId: sampleUser._id });

    const bookings = [];

    // 1. Create a unified hotel booking
    if (sampleHotel) {
      const hotelBooking = new Booking({
        bookingNumber: `BK${Date.now()}001`,
        bookingType: 'hotel',
        itemId: sampleHotel._id,
        itemDetails: {
          name: sampleHotel.name,
          city: sampleHotel.city,
          address: sampleHotel.address,
          rating: sampleHotel.rating,
          checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          roomType: 'Deluxe Room',
          guests: 2
        },
        userId: sampleUser._id,
        customerInfo: {
          name: sampleUser.name,
          email: sampleUser.email,
          phone: sampleUser.phone || '1234567890'
        },
        paymentInfo: {
          paymentId: `pay_${Date.now()}001`,
          amount: 15000,
          currency: 'INR',
          method: 'card',
          status: 'success'
        },
        bookingStatus: 'confirmed',
        totalAmount: 15000,
        travelDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await hotelBooking.save();
      bookings.push(hotelBooking);
    }

    // 2. Create a unified flight booking
    if (sampleFlight) {
      const flightBooking = new Booking({
        bookingNumber: `BK${Date.now()}002`,
        bookingType: 'flight',
        itemId: sampleFlight._id,
        itemDetails: {
          flightNumber: sampleFlight.flightNumber,
          airline: sampleFlight.airline,
          route: {
            origin: 'Delhi',
            destination: 'Mumbai'
          },
          schedule: {
            departureTime: sampleFlight.schedule.departureTime,
            arrivalTime: sampleFlight.schedule.arrivalTime,
            duration: sampleFlight.schedule.duration
          },
          class: 'Economy',
          seats: ['12A', '12B']
        },
        userId: sampleUser._id,
        customerInfo: {
          name: sampleUser.name,
          email: sampleUser.email,
          phone: sampleUser.phone || '1234567890'
        },
        paymentInfo: {
          paymentId: `pay_${Date.now()}002`,
          amount: 8500,
          currency: 'INR',
          method: 'upi',
          status: 'success'
        },
        bookingStatus: 'confirmed',
        totalAmount: 8500,
        travelDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        passengers: [
          { name: sampleUser.name, age: 30, gender: 'Male', seatNumber: '12A' },
          { name: 'Travel Companion', age: 28, gender: 'Female', seatNumber: '12B' }
        ]
      });
      await flightBooking.save();
      bookings.push(flightBooking);
    }

    // 3. Create a bus booking
    const busBooking = new Booking({
      bookingNumber: `BK${Date.now()}003`,
      bookingType: 'bus',
      itemId: new mongoose.Types.ObjectId(),
      itemDetails: {
        operator: { name: 'RedBus Express' },
        busNumber: 'RB123',
        route: {
          origin: 'Delhi',
          destination: 'Jaipur'
        },
        schedule: {
          departureTime: '22:00',
          arrivalTime: '06:00',
          duration: '8h'
        },
        busType: 'AC Sleeper',
        seats: ['S1', 'S2']
      },
      userId: sampleUser._id,
      customerInfo: {
        name: sampleUser.name,
        email: sampleUser.email,
        phone: sampleUser.phone || '1234567890'
      },
      paymentInfo: {
        paymentId: `pay_${Date.now()}003`,
        amount: 1200,
        currency: 'INR',
        method: 'wallet',
        status: 'success'
      },
      bookingStatus: 'confirmed',
      totalAmount: 1200,
      travelDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    });
    await busBooking.save();
    bookings.push(busBooking);

    // 4. Create a package booking
    if (samplePackage) {
      const packageBooking = new PackageBooking({
        bookingNumber: `PKG${Date.now()}001`,
        packageId: samplePackage._id,
        userId: sampleUser._id,
        customerInfo: {
          name: sampleUser.name,
          email: sampleUser.email,
          phone: sampleUser.phone || '1234567890'
        },
        travelDetails: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000),
          travelers: 2,
          rooms: 1
        },
        selectedPreferences: {
          hotelCategory: 'standard',
          transportType: 'flight',
          addOns: []
        },
        pricingBreakdown: {
          basePackagePrice: 15000,
          hotelPrice: 8000,
          transportPrice: 5000,
          addOnsPrice: 0,
          taxes: 2800,
          serviceFee: 500,
          discount: 0,
          totalAmount: 31300
        },
        paymentInfo: {
          paymentId: `pay_${Date.now()}004`,
          amount: 31300,
          currency: 'INR',
          method: 'card',
          status: 'success'
        },
        bookingStatus: 'confirmed'
      });
      await packageBooking.save();
      bookings.push(packageBooking);
    }

    console.log(`Successfully seeded ${bookings.length} sample bookings for user: ${sampleUser.email}`);
    console.log('Booking types created:', bookings.map(b => b.bookingType || 'package').join(', '));
    
  } catch (error) {
    console.error('Error seeding bookings:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedBookings();
  await mongoose.connection.close();
  console.log('Booking seeding completed');
};

runSeed();
