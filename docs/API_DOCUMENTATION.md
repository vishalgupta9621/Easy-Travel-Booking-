# Travel Booking System API Documentation

## Overview
This document provides comprehensive documentation for the Travel Booking System API endpoints, including authentication, travel search, booking management, and admin operations.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "error": null
}
```

## Error Handling
Error responses include:
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-20 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "password": "string (min 6 chars, must contain uppercase, lowercase, number)",
  "firstName": "string (max 50 chars)",
  "lastName": "string (max 50 chars)",
  "phone": "string (valid Indian mobile number)",
  "role": "string (optional, 'user' or 'admin', defaults to 'user')"
}
```

**Response:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "loyaltyPoints": 0
  },
  "token": "string"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string"
}
```

### Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "loyaltyPoints": "number",
    "preferences": {},
    "createdAt": "date"
  }
}
```

## Destination Endpoints

### Get All Destinations
**GET** `/destinations`

Retrieve all active destinations with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by destination type (airport, railway_station, bus_station)
- `city` (optional): Filter by city name
- `state` (optional): Filter by state name
- `search` (optional): Search in name, city, or code
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "destinations": [
    {
      "_id": "string",
      "name": "string",
      "code": "string",
      "city": "string",
      "state": "string",
      "type": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      }
    }
  ],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalDestinations": "number",
    "hasNext": "boolean",
    "hasPrev": "boolean"
  }
}
```

### Get Destinations by Type
**GET** `/destinations/type/:type`

Get destinations filtered by type.

**Parameters:**
- `type`: airport, railway_station, or bus_station

**Query Parameters:**
- `search` (optional): Search term
- `state` (optional): Filter by state

## Flight Endpoints

### Search Flights
**GET** `/flights/search`

Search for available flights.

**Query Parameters:**
- `origin` (required): Origin destination ID
- `destination` (required): Destination ID
- `departureDate` (required): Departure date (YYYY-MM-DD)
- `passengers` (optional): Number of passengers (default: 1)
- `class` (optional): Travel class (economy, business, first)

**Response:**
```json
{
  "flights": [
    {
      "_id": "string",
      "flightNumber": "string",
      "airline": {
        "name": "string",
        "code": "string"
      },
      "route": {
        "origin": {
          "name": "string",
          "code": "string",
          "city": "string"
        },
        "destination": {
          "name": "string",
          "code": "string",
          "city": "string"
        }
      },
      "schedule": {
        "departureTime": "string",
        "arrivalTime": "string",
        "duration": "number"
      },
      "pricing": {
        "economy": {
          "basePrice": "number",
          "taxes": "number"
        }
      },
      "availableSeats": "number",
      "pricePerPerson": "number"
    }
  ],
  "searchCriteria": {},
  "totalResults": "number"
}
```

### Get Flight Availability
**GET** `/flights/:id/availability`

Check seat availability for a specific flight and date.

**Parameters:**
- `id`: Flight ID

**Query Parameters:**
- `date` (required): Date to check (YYYY-MM-DD)
- `class` (optional): Travel class (default: economy)

## Train Endpoints

### Search Trains
**GET** `/trains/search`

Search for available trains.

**Query Parameters:**
- `origin` (required): Origin station ID
- `destination` (required): Destination station ID
- `departureDate` (required): Departure date (YYYY-MM-DD)
- `class` (optional): Train class (SL, 3A, 2A, 1A, CC)
- `passengers` (optional): Number of passengers (default: 1)

**Response:**
```json
{
  "trains": [
    {
      "_id": "string",
      "trainNumber": "string",
      "trainName": "string",
      "trainType": "string",
      "route": {
        "origin": {
          "name": "string",
          "code": "string",
          "city": "string"
        },
        "destination": {
          "name": "string",
          "code": "string",
          "city": "string"
        }
      },
      "schedule": {
        "departureTime": "string",
        "arrivalTime": "string",
        "duration": "string"
      },
      "availableClasses": [
        {
          "name": "string",
          "code": "string",
          "basePrice": "number",
          "availableSeats": "number",
          "pricePerPerson": "number"
        }
      ]
    }
  ]
}
```

## Bus Endpoints

### Search Buses
**GET** `/buses/search`

Search for available buses.

**Query Parameters:**
- `origin` (required): Origin bus station ID
- `destination` (required): Destination bus station ID
- `departureDate` (required): Departure date (YYYY-MM-DD)
- `passengers` (optional): Number of passengers (default: 1)
- `busType` (optional): Bus type filter

**Response:**
```json
{
  "buses": [
    {
      "_id": "string",
      "busNumber": "string",
      "operator": {
        "name": "string",
        "code": "string"
      },
      "busType": "string",
      "route": {
        "origin": {
          "name": "string",
          "city": "string"
        },
        "destination": {
          "name": "string",
          "city": "string"
        }
      },
      "schedule": {
        "departureTime": "string",
        "arrivalTime": "string",
        "duration": "string"
      },
      "seating": {
        "totalSeats": "number",
        "layout": "string"
      },
      "availableSeats": "number",
      "pricePerPerson": "number"
    }
  ]
}
```

### Get Bus Seat Map
**GET** `/buses/:id/seatmap`

Get detailed seat map for bus booking.

**Parameters:**
- `id`: Bus ID

**Query Parameters:**
- `date` (required): Travel date (YYYY-MM-DD)

## Travel Booking Endpoints

### Create Travel Booking
**POST** `/travel-bookings`

Create a new travel booking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "travelType": "string (flight, train, bus)",
  "serviceId": "string",
  "journey": {
    "origin": "string",
    "destination": "string",
    "departureDate": "date",
    "arrivalDate": "date",
    "departureTime": "string",
    "arrivalTime": "string"
  },
  "passengers": [
    {
      "title": "string",
      "firstName": "string",
      "lastName": "string",
      "age": "number",
      "gender": "string",
      "seatPreference": "string"
    }
  ],
  "bookingDetails": {
    "class": "string (for flights)",
    "trainClass": "string (for trains)",
    "busType": "string (for buses)",
    "totalSeats": "number"
  },
  "contact": {
    "email": "string",
    "phone": "string"
  },
  "payment": {
    "method": "string",
    "transactionId": "string"
  }
}
```

**Response:**
```json
{
  "booking": {
    "_id": "string",
    "bookingId": "string",
    "userId": "string",
    "travelType": "string",
    "status": "string",
    "journey": {},
    "passengers": [],
    "pricing": {
      "basePrice": "number",
      "taxes": "number",
      "serviceFee": "number",
      "totalAmount": "number"
    },
    "payment": {},
    "createdAt": "date"
  },
  "pointsEarned": "number"
}
```

### Get User Bookings
**GET** `/travel-bookings/user`

Get current user's travel bookings.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by booking status
- `travelType` (optional): Filter by travel type

### Cancel Travel Booking
**PUT** `/travel-bookings/:id/cancel`

Cancel a travel booking.

**Headers:** `Authorization: Bearer <token>`

**Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "cancellationReason": "string"
}
```

## Admin Endpoints

All admin endpoints require admin role authentication.

### Get All Bookings (Admin)
**GET** `/travel-bookings`

**Headers:** `Authorization: Bearer <admin_token>`

### Create Flight (Admin)
**POST** `/flights`

**Headers:** `Authorization: Bearer <admin_token>`

### Update Flight (Admin)
**PUT** `/flights/:id`

**Headers:** `Authorization: Bearer <admin_token>`

### Delete Flight (Admin)
**DELETE** `/flights/:id`

**Headers:** `Authorization: Bearer <admin_token>`

Similar endpoints exist for trains, buses, and destinations.

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Search endpoints: 100 requests per minute
- Booking endpoints: 10 requests per minute
- Admin endpoints: 50 requests per minute

## Testing

### Running Tests
```bash
# Backend tests
cd Final_Backend
npm test

# Frontend tests
cd Final_Frontend
npm test

# Test coverage
npm run test:coverage
```

### Test Environment
Tests use a separate test database to avoid affecting development data.

## Examples

### Complete Booking Flow
1. Register/Login user
2. Search for travel options
3. Select a service
4. Create booking with passenger details
5. Process payment
6. Receive booking confirmation

### Sample cURL Commands
```bash
# Search flights
curl -X GET "http://localhost:5000/api/flights/search?origin=DEL&destination=BOM&departureDate=2024-01-15&passengers=1&class=economy"

# Create booking
curl -X POST "http://localhost:5000/api/travel-bookings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "travelType": "flight",
    "serviceId": "FLIGHT_ID",
    "journey": {...},
    "passengers": [...],
    "contact": {...},
    "payment": {...}
  }'
```
