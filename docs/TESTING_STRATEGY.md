# Travel Booking System - Testing Strategy

## Overview
This document outlines the comprehensive testing strategy for the Travel Booking System, covering unit tests, integration tests, end-to-end tests, performance tests, and security tests.

## Testing Pyramid

### 1. Unit Tests (70%)
**Purpose:** Test individual components and functions in isolation

**Backend Unit Tests:**
- Model validation and methods
- Controller logic
- Utility functions
- Authentication middleware
- Payment processing logic
- Data transformation functions

**Frontend Unit Tests:**
- Component rendering
- User interactions
- State management
- Form validation
- API service functions
- Utility functions

### 2. Integration Tests (20%)
**Purpose:** Test interaction between different modules

**API Integration Tests:**
- Database operations
- External service integrations
- Authentication flow
- Payment gateway integration
- Email service integration
- File upload functionality

**Frontend Integration Tests:**
- Component interactions
- API communication
- State management flow
- Routing functionality

### 3. End-to-End Tests (10%)
**Purpose:** Test complete user workflows

**Critical User Journeys:**
- User registration and login
- Search and booking flow
- Payment processing
- Booking management
- Admin operations

## Test Environment Setup

### Backend Testing Environment
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Frontend Testing Environment
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.config.js',
        'dist/',
        'build/'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

## Test Categories

### 1. Authentication Tests

**Backend Tests:**
```javascript
describe('Authentication', () => {
  test('should register user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      phone: '9876543210'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.token).toBeDefined();
  });

  test('should reject weak passwords', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: '123', // Weak password
      firstName: 'Test',
      lastName: 'User',
      phone: '9876543210'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('password');
  });
});
```

**Frontend Tests:**
```javascript
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows error for invalid credentials', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    
    render(<Login onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'wronguser' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Search Functionality Tests

**Backend Tests:**
```javascript
describe('Flight Search', () => {
  test('should return flights for valid search criteria', async () => {
    const searchParams = {
      origin: originId,
      destination: destinationId,
      departureDate: '2024-01-15',
      passengers: 1,
      class: 'economy'
    };
    
    const response = await request(app)
      .get('/api/flights/search')
      .query(searchParams);
    
    expect(response.status).toBe(200);
    expect(response.body.flights).toBeInstanceOf(Array);
    expect(response.body.flights.length).toBeGreaterThan(0);
  });

  test('should return empty array for no matching flights', async () => {
    const searchParams = {
      origin: originId,
      destination: destinationId,
      departureDate: '2030-01-01', // Far future date
      passengers: 1,
      class: 'economy'
    };
    
    const response = await request(app)
      .get('/api/flights/search')
      .query(searchParams);
    
    expect(response.status).toBe(200);
    expect(response.body.flights).toHaveLength(0);
  });
});
```

### 3. Booking Process Tests

**Backend Tests:**
```javascript
describe('Travel Booking', () => {
  test('should create booking with valid data', async () => {
    const bookingData = {
      travelType: 'flight',
      serviceId: flightId,
      journey: {
        origin: originId,
        destination: destinationId,
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
        gender: 'male'
      }],
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
  });

  test('should reject booking without authentication', async () => {
    const response = await request(app)
      .post('/api/travel-bookings')
      .send({});
    
    expect(response.status).toBe(403);
  });
});
```

### 4. Payment Integration Tests

**Mock Payment Gateway:**
```javascript
describe('Payment Processing', () => {
  test('should process successful payment', async () => {
    const paymentData = {
      amount: 5000,
      method: 'credit_card',
      cardDetails: {
        number: '4111111111111111',
        expiry: '12/25',
        cvv: '123',
        name: 'Test User'
      }
    };
    
    const result = await processPayment(paymentData);
    
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    expect(result.amount).toBe(paymentData.amount);
  });

  test('should handle payment failure', async () => {
    const paymentData = {
      amount: 5000,
      method: 'credit_card',
      cardDetails: {
        number: '4000000000000002', // Declined card
        expiry: '12/25',
        cvv: '123',
        name: 'Test User'
      }
    };
    
    const result = await processPayment(paymentData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### 5. Performance Tests

**Load Testing with Artillery:**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "Search flights"
    weight: 70
    flow:
      - get:
          url: "/api/flights/search?origin={{ origin }}&destination={{ destination }}&departureDate=2024-01-15"
  
  - name: "User registration"
    weight: 20
    flow:
      - post:
          url: "/api/auth/register"
          json:
            username: "user{{ $randomString() }}"
            email: "user{{ $randomString() }}@example.com"
            password: "Test123!"
            firstName: "Test"
            lastName: "User"
            phone: "9876543210"
  
  - name: "Create booking"
    weight: 10
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "testuser"
            password: "Test123!"
          capture:
            - json: "$.token"
              as: "authToken"
      - post:
          url: "/api/travel-bookings"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            travelType: "flight"
            serviceId: "{{ flightId }}"
            # ... booking data
```

**Database Performance Tests:**
```javascript
describe('Database Performance', () => {
  test('flight search should complete within 500ms', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/flights/search')
      .query({
        origin: originId,
        destination: destinationId,
        departureDate: '2024-01-15'
      });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500);
  });

  test('should handle concurrent bookings', async () => {
    const bookingPromises = Array.from({ length: 10 }, () =>
      request(app)
        .post('/api/travel-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBookingData)
    );
    
    const results = await Promise.all(bookingPromises);
    
    // Only one should succeed due to seat availability
    const successfulBookings = results.filter(r => r.status === 201);
    expect(successfulBookings).toHaveLength(1);
  });
});
```

### 6. Security Tests

**Authentication Security:**
```javascript
describe('Security Tests', () => {
  test('should prevent SQL injection in search', async () => {
    const maliciousQuery = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .get('/api/flights/search')
      .query({
        origin: maliciousQuery,
        destination: destinationId,
        departureDate: '2024-01-15'
      });
    
    expect(response.status).toBe(400);
    // Verify database is still intact
    const userCount = await User.countDocuments();
    expect(userCount).toBeGreaterThan(0);
  });

  test('should prevent XSS in user input', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        firstName: xssPayload,
        lastName: 'User',
        phone: '9876543210'
      });
    
    expect(response.status).toBe(400);
  });

  test('should rate limit API requests', async () => {
    const requests = Array.from({ length: 20 }, () =>
      request(app).post('/api/auth/login').send({
        username: 'testuser',
        password: 'wrongpassword'
      })
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## End-to-End Testing

**Cypress Configuration:**
```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720
  }
});
```

**E2E Test Example:**
```javascript
// cypress/e2e/booking-flow.cy.js
describe('Complete Booking Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('testuser', 'Test123!');
  });

  it('should complete flight booking successfully', () => {
    // Search for flights
    cy.get('[data-testid="travel-type-flights"]').click();
    cy.get('[data-testid="origin-input"]').type('Delhi');
    cy.get('[data-testid="destination-dropdown"]').contains('DEL').click();
    cy.get('[data-testid="destination-input"]').type('Mumbai');
    cy.get('[data-testid="destination-dropdown"]').contains('BOM').click();
    cy.get('[data-testid="departure-date"]').click();
    cy.get('[data-testid="date-picker"]').contains('15').click();
    cy.get('[data-testid="search-button"]').click();

    // Select flight
    cy.get('[data-testid="flight-card"]').first().within(() => {
      cy.get('[data-testid="book-button"]').click();
    });

    // Fill passenger details
    cy.get('[data-testid="passenger-first-name"]').type('John');
    cy.get('[data-testid="passenger-last-name"]').type('Doe');
    cy.get('[data-testid="passenger-age"]').type('30');
    cy.get('[data-testid="contact-email"]').type('john@example.com');
    cy.get('[data-testid="contact-phone"]').type('9876543210');

    // Select payment method
    cy.get('[data-testid="payment-credit-card"]').click();
    cy.get('[data-testid="proceed-payment"]').click();

    // Mock payment success
    cy.intercept('POST', '/api/travel-bookings', {
      statusCode: 201,
      body: { booking: { bookingId: 'TEST123' } }
    });

    // Complete payment
    cy.get('[data-testid="card-number"]').type('4111111111111111');
    cy.get('[data-testid="card-expiry"]').type('12/25');
    cy.get('[data-testid="card-cvv"]').type('123');
    cy.get('[data-testid="card-name"]').type('John Doe');
    cy.get('[data-testid="pay-button"]').click();

    // Verify booking confirmation
    cy.url().should('include', '/booking-confirmation');
    cy.contains('Booking Confirmed!').should('be.visible');
    cy.contains('TEST123').should('be.visible');
  });
});
```

## Test Data Management

**Test Database Seeding:**
```javascript
// tests/seeders/testData.js
export const seedTestData = async () => {
  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Destination.deleteMany({}),
    Flight.deleteMany({}),
    TravelBooking.deleteMany({})
  ]);

  // Create test destinations
  const destinations = await Destination.insertMany([
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
    }
  ]);

  // Create test flights
  await Flight.create({
    flightNumber: 'TEST101',
    airline: { name: 'Test Airlines', code: 'TA' },
    route: {
      origin: destinations[0]._id,
      destination: destinations[1]._id
    },
    schedule: {
      departureTime: '10:00',
      arrivalTime: '12:30',
      duration: 150
    },
    pricing: {
      economy: { basePrice: 5000, taxes: 500, totalSeats: 150 }
    }
  });

  return { destinations };
};
```

## Continuous Integration

**GitHub Actions Workflow:**
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd Final_Backend && npm ci
          cd ../Final_Frontend && npm ci
      
      - name: Run backend tests
        run: |
          cd Final_Backend
          npm run test:coverage
        env:
          MONGO_TEST: mongodb://localhost:27017/travel_booking_test
          JWT: test_jwt_secret
          NODE_ENV: test
      
      - name: Run frontend tests
        run: |
          cd Final_Frontend
          npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage
```

## Test Reporting

**Coverage Reports:**
- Minimum 80% code coverage required
- Branch coverage tracking
- Function coverage tracking
- Statement coverage tracking

**Test Metrics:**
- Test execution time
- Test success/failure rates
- Performance benchmarks
- Security vulnerability scans

**Reporting Tools:**
- Jest/Vitest for unit test reports
- Artillery for performance reports
- Cypress Dashboard for E2E reports
- SonarQube for code quality

This comprehensive testing strategy ensures the Travel Booking System is reliable, secure, and performant across all user scenarios.
