# 🏗️ Technical Architecture - Travel Booking System

## 📐 **System Architecture Overview**

The Travel Booking System follows a modern **3-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Customer Portal (React)  │  Admin Dashboard (React)       │
│  - User Interface         │  - Management Interface        │
│  - Search & Booking       │  - Analytics & Reports         │
│  - User Account           │  - Content Management          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                   REST API Server (Node.js/Express)        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Controllers │ │  Services   │ │ Middleware  │           │
│  │ - Request   │ │ - Business  │ │ - Auth      │           │
│  │   Handling  │ │   Logic     │ │ - CORS      │           │
│  │ - Response  │ │ - Data      │ │ - Logging   │           │
│  │   Formatting│ │   Processing│ │ - Error     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  MongoDB    │ │ Repositories│ │   Models    │           │
│  │ - Document  │ │ - Data      │ │ - Schema    │           │
│  │   Storage   │ │   Access    │ │   Definition│           │
│  │ - Indexing  │ │ - Query     │ │ - Validation│           │
│  │ - Replication│ │   Builder   │ │ - Relations │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Technology Stack**

### **Frontend Technologies**
```
React.js 18.x
├── React Router DOM 6.x      # Client-side routing
├── Context API               # State management
├── CSS3 & Flexbox           # Styling and layout
├── Fetch API                # HTTP client
└── Modern ES6+ JavaScript   # Language features
```

### **Backend Technologies**
```
Node.js 18.x
├── Express.js 5.x           # Web framework
├── MongoDB 6.x              # NoSQL database
├── Mongoose 8.x             # ODM for MongoDB
├── JWT                      # Authentication
├── bcryptjs                 # Password hashing
├── Nodemailer               # Email service
├── Multer                   # File upload
└── CORS                     # Cross-origin requests
```

### **Development Tools**
```
Development Environment
├── Nodemon                  # Auto-restart server
├── ESLint                   # Code linting
├── Prettier                 # Code formatting
├── Git                      # Version control
└── VS Code                  # IDE
```

## 🗂️ **Database Design**

### **Entity Relationship Diagram**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │  Bookings   │    │   Hotels    │
│─────────────│    │─────────────│    │─────────────│
│ _id (PK)    │◄──┤ userId (FK) │    │ _id (PK)    │
│ username    │    │ bookingNum  │    │ name        │
│ email       │    │ bookingType │───►│ city        │
│ password    │    │ itemId (FK) │    │ rating      │
│ phone       │    │ totalAmount │    │ price       │
└─────────────┘    │ status      │    └─────────────┘
                   │ travelDate  │
                   └─────────────┘
                          │
                          ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Payments   │    │   Flights   │
                   │─────────────│    │─────────────│
                   │ _id (PK)    │    │ _id (PK)    │
                   │ paymentId   │    │ flightNum   │
                   │ bookingNum  │    │ airline     │
                   │ amount      │    │ route       │
                   │ method      │    │ schedule    │
                   │ status      │    │ pricing     │
                   └─────────────┘    └─────────────┘
```

### **Collection Schemas**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String (unique, indexed),
  age: Number,
  address: String,
  isAdmin: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Bookings Collection**
```javascript
{
  _id: ObjectId,
  bookingNumber: String (unique, indexed),
  bookingType: Enum ['hotel', 'flight', 'train', 'bus', 'package'],
  itemId: ObjectId (indexed),
  itemDetails: Mixed,
  userId: ObjectId (ref: Users, indexed),
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: Object
  },
  paymentInfo: Object,
  totalAmount: Number,
  bookingStatus: Enum ['pending', 'confirmed', 'cancelled'],
  travelDate: Date (indexed),
  returnDate: Date,
  passengers: Array,
  specialRequests: Array,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

### **Indexing Strategy**
```javascript
// Performance-critical indexes
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "username": 1 })
db.bookings.createIndex({ "bookingNumber": 1 })
db.bookings.createIndex({ "userId": 1 })
db.bookings.createIndex({ "travelDate": 1 })
db.bookings.createIndex({ "bookingStatus": 1 })
db.hotels.createIndex({ "city": 1 })
db.flights.createIndex({ "route.origin": 1, "route.destination": 1 })
```

## 🔄 **API Architecture**

### **RESTful API Design**
```
HTTP Method │ Endpoint Pattern           │ Purpose
────────────┼───────────────────────────┼─────────────────
GET         │ /api/v1/resource          │ List all items
GET         │ /api/v1/resource/:id      │ Get single item
POST        │ /api/v1/resource          │ Create new item
PUT         │ /api/v1/resource/:id      │ Update entire item
PATCH       │ /api/v1/resource/:id      │ Partial update
DELETE      │ /api/v1/resource/:id      │ Delete item
GET         │ /api/v1/resource/search   │ Search items
```

### **Request/Response Flow**
```
Client Request
      │
      ▼
┌─────────────┐
│   CORS      │ ← Cross-origin validation
│ Middleware  │
└─────────────┘
      │
      ▼
┌─────────────┐
│    Auth     │ ← JWT token validation
│ Middleware  │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Route       │ ← URL pattern matching
│ Handler     │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Controller  │ ← Request processing
│ Function    │
└─────────────┘
      │
      ▼
┌─────────────┐
│  Service    │ ← Business logic
│  Layer      │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Repository  │ ← Data access
│   Layer     │
└─────────────┘
      │
      ▼
┌─────────────┐
│  MongoDB    │ ← Database operations
│  Database   │
└─────────────┘
```

### **Error Handling Strategy**
```javascript
// Centralized error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

## 🔐 **Security Architecture**

### **Authentication Flow**
```
User Login Request
      │
      ▼
┌─────────────┐
│  Validate   │ ← Email/password validation
│ Credentials │
└─────────────┘
      │
      ▼
┌─────────────┐
│   bcrypt    │ ← Password hash comparison
│  Verify     │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Generate    │ ← JWT token creation
│ JWT Token   │
└─────────────┘
      │
      ▼
┌─────────────┐
│   Return    │ ← Send token to client
│   Token     │
└─────────────┘
```

### **Authorization Middleware**
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};
```

### **Data Validation**
```javascript
// Input validation using Mongoose schemas
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});
```

## 📊 **Performance Optimization**

### **Database Optimization**
```javascript
// Aggregation pipeline for complex queries
const bookingStats = await Booking.aggregate([
  { $match: { bookingStatus: 'confirmed' } },
  { $group: {
      _id: '$bookingType',
      count: { $sum: 1 },
      totalRevenue: { $sum: '$totalAmount' }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);
```

### **Caching Strategy**
```javascript
// In-memory caching for frequently accessed data
const cache = new Map();

const getCachedData = (key, fetchFunction, ttl = 300000) => {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }
  
  const data = fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};
```

### **Frontend Optimization**
```javascript
// Lazy loading components
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const BookingDetails = lazy(() => import('./components/booking/BookingDetails'));

// Memoization for expensive calculations
const MemoizedSearchResults = memo(({ results, filters }) => {
  const filteredResults = useMemo(() => {
    return results.filter(item => 
      item.price >= filters.minPrice && 
      item.price <= filters.maxPrice
    );
  }, [results, filters]);
  
  return <SearchResultsList results={filteredResults} />;
});
```

## 🔄 **Data Flow Architecture**

### **Search Flow**
```
User Input (Search Form)
      │
      ▼
Frontend Validation
      │
      ▼
API Request (/api/v1/hotels/search)
      │
      ▼
Backend Controller
      │
      ▼
Service Layer (Business Logic)
      │
      ▼
Repository Layer (Data Access)
      │
      ▼
MongoDB Query Execution
      │
      ▼
Results Processing
      │
      ▼
JSON Response
      │
      ▼
Frontend State Update
      │
      ▼
UI Re-render
```

### **Booking Flow**
```
User Selection
      │
      ▼
Booking Form Submission
      │
      ▼
Frontend Validation
      │
      ▼
API Request (/api/v1/bookings)
      │
      ▼
Authentication Check
      │
      ▼
Booking Creation
      │
      ▼
Payment Processing
      │
      ▼
Confirmation Generation
      │
      ▼
Email Notification
      │
      ▼
Booking Confirmation Page
```

## 🚀 **Deployment Architecture**

### **Production Environment**
```
┌─────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                        │
│                      (Nginx/CloudFlare)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     WEB SERVERS                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Node.js   │ │   Node.js   │ │   Node.js   │           │
│  │  Instance 1 │ │  Instance 2 │ │  Instance 3 │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE CLUSTER                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  MongoDB    │ │  MongoDB    │ │  MongoDB    │           │
│  │  Primary    │ │ Secondary 1 │ │ Secondary 2 │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### **Monitoring & Logging**
```javascript
// Application monitoring
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

This technical architecture provides a scalable, maintainable, and secure foundation for the travel booking system with clear separation of concerns and modern best practices. 🏗️
