import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API service class
class ApiService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll() {
    const response = await api.get(`/v1/${this.endpoint}`);
    return response.data;
  }

  async getPaginated(page = 1, limit = 10) {
    const response = await api.get(`/v1/${this.endpoint}/paginated`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/v1/${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data) {
    const response = await api.post(`/v1/${this.endpoint}`, data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/v1/${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/v1/${this.endpoint}/${id}`);
    return response.data;
  }

  async updateStatus(id, status) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/status`, { status });
    return response.data;
  }
}

// Specific service classes
export class UserService extends ApiService {
  constructor() {
    super('users');
  }

  async login(credentials) {
    const response = await api.post('/v1/users/login', credentials);
    return response.data;
  }
}

export class BusService extends ApiService {
  constructor() {
    super('buses');
  }

  async search(origin, destination, date) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { origin, destination, date }
    });
    return response.data;
  }

  async getByOperator(operatorCode) {
    const response = await api.get(`/v1/${this.endpoint}/operator/${operatorCode}`);
    return response.data;
  }
}

export class FlightService extends ApiService {
  constructor() {
    super('flights');
  }

  async search(origin, destination, date, flightClass) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { origin, destination, date, class: flightClass }
    });
    return response.data;
  }

  async getByAirline(airlineCode) {
    const response = await api.get(`/v1/${this.endpoint}/airline/${airlineCode}`);
    return response.data;
  }

  async getAvailableSeats(id, date, flightClass) {
    const response = await api.get(`/v1/${this.endpoint}/${id}/seats`, {
      params: { date, class: flightClass }
    });
    return response.data;
  }
}

export class TrainService extends ApiService {
  constructor() {
    super('trains');
  }

  async search(origin, destination, date, trainClass) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { origin, destination, date, class: trainClass }
    });
    return response.data;
  }

  async getByType(trainType) {
    const response = await api.get(`/v1/${this.endpoint}/type/${trainType}`);
    return response.data;
  }

  async getSchedule(id) {
    const response = await api.get(`/v1/${this.endpoint}/${id}/schedule`);
    return response.data;
  }

  async getAvailableSeats(id, date, trainClass) {
    const response = await api.get(`/v1/${this.endpoint}/${id}/seats`, {
      params: { date, class: trainClass }
    });
    return response.data;
  }
}

export class HotelService extends ApiService {
  constructor() {
    super('hotels');
  }
}

export class TravelBookingService extends ApiService {
  constructor() {
    super('travel-bookings');
  }

  async getByUser(userId) {
    const response = await api.get(`/v1/${this.endpoint}/user/${userId}`);
    return response.data;
  }

  async getByType(travelType) {
    const response = await api.get(`/v1/${this.endpoint}/type/${travelType}`);
    return response.data;
  }

  async updatePaymentStatus(id, paymentStatus, transactionId) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/payment`, {
      paymentStatus,
      transactionId
    });
    return response.data;
  }

  async cancelBooking(id, cancellationReason) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/cancel`, {
      cancellationReason
    });
    return response.data;
  }

  async getByDateRange(startDate, endDate) {
    const response = await api.get(`/v1/${this.endpoint}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export class HotelBookingService extends ApiService {
  constructor() {
    super('hotel-bookings');
  }

  async getByUser(userId) {
    const response = await api.get(`/v1/${this.endpoint}/user/${userId}`);
    return response.data;
  }

  async getByHotel(hotelId) {
    const response = await api.get(`/v1/${this.endpoint}/hotel/${hotelId}`);
    return response.data;
  }

  async updatePaymentStatus(id, paymentStatus, transactionId) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/payment`, {
      paymentStatus,
      transactionId
    });
    return response.data;
  }

  async checkIn(id) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/checkin`);
    return response.data;
  }

  async checkOut(id) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/checkout`);
    return response.data;
  }

  async getByDateRange(startDate, endDate) {
    const response = await api.get(`/v1/${this.endpoint}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
}

export class UniversalBookingService extends ApiService {
  constructor() {
    super('universal-bookings');
  }
}

// New unified booking service
export class BookingService extends ApiService {
  constructor() {
    super('bookings');
  }

  async getByUser(userId) {
    const response = await api.get(`/v1/${this.endpoint}/user/${userId}`);
    return response.data;
  }

  async getByType(bookingType) {
    const response = await api.get(`/v1/${this.endpoint}/type/${bookingType}`);
    return response.data;
  }

  async search(query, type, status) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { query, type, status }
    });
    return response.data;
  }

  async getStats() {
    const response = await api.get(`/v1/${this.endpoint}/stats`);
    return response.data;
  }

  async updatePaymentStatus(id, paymentStatus, transactionId) {
    const response = await api.patch(`/v1/${this.endpoint}/${id}/payment`, {
      paymentStatus,
      transactionId
    });
    return response.data;
  }

  async getByDateRange(startDate, endDate) {
    const response = await api.get(`/v1/${this.endpoint}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
}
export class PackageService extends ApiService {
  constructor() {
    super('packages');
  }

  async search(searchParams) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: searchParams
    });
    return response.data;
  }

  async getPopular(limit = 10) {
    const response = await api.get(`/v1/${this.endpoint}/popular`, {
      params: { limit }
    });
    return response.data;
  }

  async getByDestination(destination, filters = {}) {
    const response = await api.get(`/v1/${this.endpoint}/destination/${destination}`, {
      params: filters
    });
    return response.data;
  }

  async getDetails(packageId) {
    const response = await api.get(`/v1/${this.endpoint}/${packageId}`);
    return response.data;
  }

  async createBooking(bookingData) {
    const response = await api.post(`/v1/${this.endpoint}/book`, bookingData);
    return response.data;
  }

  // ✅ Add this override if needed:
  async delete(id) {
    // If your backend expects normal RESTful delete:
    const response = await api.delete(`/v1/packages/${id}`);
    return response.data;

    // OR if your backend expects custom route:
    // const response = await api.delete(`/v1/packages/delete/${id}`);
    // return response.data;
  }
}


// Export service instances
export const userService = new UserService();
export const busService = new BusService();
export const flightService = new FlightService();
export const trainService = new TrainService();
export const hotelService = new HotelService();
export const travelBookingService = new TravelBookingService();
export const hotelBookingService = new HotelBookingService();
export const universalBookingService = new UniversalBookingService();
export const bookingService = new BookingService();
export const packageService = new PackageService();

// Add method to get package bookings
packageService.getPackageBookings = async function(page = 1, limit = 10, filters = {}) {
  const params = { page, limit, ...filters };
  const response = await api.get('/v1/packages/bookings/all', { params });
  return response.data;
};

// Override methods for admin package management
packageService.create = async function(packageData) {
  const response = await api.post('/v1/packages', packageData);
  return response.data;
};

packageService.updateById = async function(id, packageData) {
  const response = await api.put(`/v1/packages/${id}`, packageData);
  return response.data;
};

packageService.deleteById = async function(id) {
  const response = await api.delete(`/v1/packages/${id}`);
  return response.data;
};

packageService.getPaginated = async function(page = 1, limit = 10) {
  const response = await api.get('/v1/packages/popular', {
    params: { page, limit: 50 } // Get more packages for admin
  });

  // Transform the response to match expected format
  const packages = response.data.packages || [];
  return {
    packages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: packages.length,
      pages: Math.ceil(packages.length / limit)
    }
  };
};

export default api;
