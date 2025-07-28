# 🚀 Full-Stack Travel Booking System

A comprehensive travel booking platform similar to MakeMyTrip, built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This system allows users to search, compare, and book flights, trains, and buses across India.

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login** with JWT authentication
- **Role-based Access Control** (Admin & User roles)
- **Profile Management** with preferences and loyalty points
- **Password Security** with bcrypt hashing
- **Session Management** with secure cookies

### 🎫 Travel Booking System
- **Multi-modal Search**: Flights, Trains, and Buses
- **Real-time Availability** checking with seat management
- **Dynamic Pricing** with taxes and service fees
- **Advanced Filtering** by price, time, duration, and amenities
- **Seat Selection** for buses with interactive seat maps
- **Booking Management** with cancellation and refund policies

### 🏨 Hotel Booking (Existing)
- **City-based Hotel Search** with availability checking
- **Room Type Management** with pricing tiers
- **Date Range Booking** with conflict prevention
- **Guest Management** for multiple occupants

### 👨‍💼 Admin Dashboard
- **Comprehensive Management** of all travel services
- **Real-time Analytics** with booking statistics
- **CRUD Operations** for destinations, flights, trains, and buses
- **Booking Monitoring** with status tracking
- **User Management** with role assignments

### 🎨 Modern UI/UX
- **Responsive Design** optimized for all devices
- **Intuitive Search Interface** with autocomplete
- **Interactive Components** with smooth animations
- **Material-UI Admin Panel** with dark mode support
- **Professional Styling** with gradient themes

## 🏗️ Architecture

### Backend (Express.js + MongoDB)
```
Final_Backend/
├── controllers/          # Business logic
│   ├── auth.js          # Authentication & user management
│   ├── flight.js        # Flight search & management
│   ├── train.js         # Train search & management
│   ├── bus.js           # Bus search & management
│   ├── destination.js   # Destination management
│   ├── travelBooking.js # Travel booking operations
│   └── booking.js       # Hotel booking operations
├── models/              # Database schemas
│   ├── User.js          # Enhanced user model with roles
│   ├── Destination.js   # Airports, stations, bus stops
│   ├── Flight.js        # Flight details & pricing
│   ├── Train.js         # Train details & classes
│   ├── Bus.js           # Bus details & seat configuration
│   ├── TravelBooking.js # Travel booking records
│   └── HotelBooking.js  # Hotel booking records
├── routes/              # API endpoints
├── utils/               # Utilities & middleware
├── seeders/             # Database seeding scripts
└── index.js             # Server entry point
```

### Frontend (React.js + Vite)
```
Final_Frontend/
├── src/
│   ├── components/
│   │   ├── travel-search/     # Multi-modal search interface
│   │   ├── search-results/    # Results display with filtering
│   │   ├── booking-form/      # Comprehensive booking form
│   │   └── navbar/            # Enhanced navigation
│   ├── pages/
│   │   ├── travel/            # Main travel booking page
│   │   └── booking-confirmation/ # Booking success page
│   └── context/               # React context for state management
```

### Admin Panel (React.js + Material-UI)
```
Final_Admin/
├── src/
│   ├── pages/
│   │   └── travel/            # Travel management dashboard
│   └── components/            # Reusable admin components
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CDACProject
```

2. **Backend Setup**
```bash
cd Final_Backend
npm install

# Create .env file
echo "MONGO=mongodb://localhost:27017/travel_booking
JWT=your_jwt_secret_key_here
PORT=5000" > .env

# Seed the database with sample data
node seeders/travelSeeder.js

# Start the backend server
npm start
```

3. **Frontend Setup**
```bash
cd ../Final_Frontend
npm install
npm run dev
```

4. **Admin Panel Setup**
```bash
cd ../Final_Admin
npm install
npm start
```

### Environment Variables

Create `.env` files in the backend directory:

```env
# Database
MONGO=mongodb://localhost:27017/travel_booking

# Authentication
JWT=your_super_secret_jwt_key_minimum_32_characters

# Server
PORT=5000
NODE_ENV=development

# Optional: Email service (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 📊 Database Schema

### Core Models

**User Model**
- Enhanced with role-based access, preferences, and loyalty points
- Secure authentication with password hashing
- Profile management with address and contact details

**Destination Model**
- Unified model for airports, railway stations, and bus stops
- Geolocation support with coordinates
- Facility and amenity information

**Travel Service Models (Flight/Train/Bus)**
- Comprehensive scheduling with frequency patterns
- Dynamic pricing with multiple classes/types
- Seat configuration and availability tracking
- Amenity and policy management

**Booking Models**
- Separate models for travel and hotel bookings
- Passenger details with identity verification
- Payment tracking with transaction IDs
- Cancellation and refund management

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Travel Search
- `GET /api/flights/search` - Search flights
- `GET /api/trains/search` - Search trains
- `GET /api/buses/search` - Search buses
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/type/:type` - Get destinations by type

### Booking Management
- `POST /api/travel-bookings` - Create travel booking
- `GET /api/travel-bookings/user` - Get user bookings
- `GET /api/travel-bookings/:id` - Get booking details
- `PUT /api/travel-bookings/:id/cancel` - Cancel booking

### Admin Operations
- `GET /api/flights` - Get all flights (Admin)
- `POST /api/flights` - Create flight (Admin)
- `PUT /api/flights/:id` - Update flight (Admin)
- `DELETE /api/flights/:id` - Delete flight (Admin)
- Similar endpoints for trains, buses, and destinations

## 🎯 Key Features Implementation

### 1. Multi-Modal Search
- Unified search interface for flights, trains, and buses
- Real-time availability checking with seat counting
- Advanced filtering and sorting options
- Responsive design with mobile optimization

### 2. Booking Engine
- Transaction-safe booking process with MongoDB sessions
- Automatic price calculation with taxes and fees
- Passenger validation and seat assignment
- Loyalty points integration

### 3. Admin Dashboard
- Comprehensive travel service management
- Real-time booking analytics and statistics
- User management with role-based permissions
- Data visualization with charts and graphs

### 4. Security Features
- JWT-based authentication with role verification
- Input validation and sanitization
- Rate limiting and CORS protection
- Secure password handling with bcrypt

## 🧪 Testing

The system includes comprehensive testing with 80%+ code coverage:

### Backend Testing
```bash
cd Final_Backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd Final_Frontend
npm test                   # Run all tests
npm run test:ui           # Visual test runner
npm run test:coverage     # Coverage report
```

### End-to-End Testing
```bash
cd Final_Frontend
npx cypress open          # Interactive mode
npx cypress run           # Headless mode
```

### Performance Testing
```bash
cd Final_Backend
npm run test:performance  # Load testing with Artillery
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin requests

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Date Range** - Date picker
- **CSS3** - Styling with animations

### Admin Panel
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **React Context** - State management

## 🚀 Deployment

### Production Build
```bash
# Backend
cd Final_Backend
npm run build

# Frontend
cd Final_Frontend
npm run build

# Admin Panel
cd Final_Admin
npm run build
```

### Environment Setup
- Configure production MongoDB connection
- Set secure JWT secrets
- Enable HTTPS in production
- Configure email services for notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[User Manual](docs/USER_MANUAL.md)** - End-user guide
- **[Testing Strategy](docs/TESTING_STRATEGY.md)** - Testing approach and examples

## 📊 Project Statistics

- **Backend**: 15+ API endpoints, 8 database models, 50+ unit tests
- **Frontend**: 25+ React components, responsive design, PWA ready
- **Admin Panel**: Material-UI dashboard with real-time analytics
- **Database**: MongoDB with optimized indexes and aggregation pipelines
- **Testing**: 80%+ code coverage, E2E tests, performance tests
- **Security**: JWT authentication, input validation, rate limiting

## 🚀 Live Demo

- **Frontend**: [https://travel-booking-demo.vercel.app](https://travel-booking-demo.vercel.app)
- **Admin Panel**: [https://travel-admin-demo.vercel.app](https://travel-admin-demo.vercel.app)
- **API Documentation**: [https://api-docs-travel.vercel.app](https://api-docs-travel.vercel.app)

*Demo credentials available in the deployment documentation*

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Full-Stack Development** - Complete MERN stack implementation
- **UI/UX Design** - Modern, responsive interface design
- **Database Design** - Comprehensive schema architecture
- **API Development** - RESTful API with authentication
- **DevOps** - Docker containerization and CI/CD pipeline
- **Testing** - Comprehensive test suite with high coverage

## 🙏 Acknowledgments

- Inspired by MakeMyTrip and other leading travel platforms
- Built with modern web development best practices
- Designed for scalability and maintainability
- Community feedback and contributions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/travel-booking-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/travel-booking-system/discussions)
- **Email**: support@travelbookingsystem.com

---

**🌟 Star this repository if you found it helpful!**

**📢 Follow us for updates**: [@TravelBookingSystem](https://twitter.com/TravelBookingSystem)
