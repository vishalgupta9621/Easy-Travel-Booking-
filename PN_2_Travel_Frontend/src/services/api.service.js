import axios from 'axios';

const API_BASE_URL = 'http://localhost:8800/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth toke
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Base service class
class ApiService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getAll() {
    const response = await api.get(`/${this.endpoint}`);
    return response.data;
  }

  async getPaginated(page = 1, limit = 10) {
    const response = await api.get(`/${this.endpoint}/paginated`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data) {
    const response = await api.post(`/${this.endpoint}`, data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/${this.endpoint}/${id}`);
    return response.data;
  }
}

// Hotel Service
export class HotelService extends ApiService {
  constructor() {
    super('hotels');
  }

  async search(searchParams) {
    const response = await api.get(`/${this.endpoint}/search`, {
      params: searchParams
    });
    return response.data;
  }

  async getFeatured() {
    const response = await api.get(`/${this.endpoint}/featured`);
    return response.data;
  }

  async getByCity(city) {
    const response = await api.get(`/${this.endpoint}/city/${city}`);
    return response.data;
  }
}

// Flight Service
export class FlightService extends ApiService {
  constructor() {
    super('flights');
  }

  async search(from, to, departureDate, returnDate = null) {
    const params = { from, to, departureDate };
    if (returnDate) params.returnDate = returnDate;

    const response = await api.get(`/v1/${this.endpoint}/search`, { params });
    return response.data;
  }

  async getByRoute(from, to) {
    const response = await api.get(`/v1/${this.endpoint}/route`, {
      params: { from, to }
    });
    return response.data;
  }
}

// Train Service
export class TrainService extends ApiService {
  constructor() {
    super('trains');
  }

  async search(from, to, departureDate) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { from, to, departureDate }
    });
    return response.data;
  }

  async getByRoute(from, to) {
    const response = await api.get(`/v1/${this.endpoint}/route`, {
      params: { from, to }
    });
    return response.data;
  }
}

// Bus Service
export class BusService extends ApiService {
  constructor() {
    super('buses');
  }

  async search(from, to, departureDate) {
    const response = await api.get(`/v1/${this.endpoint}/search`, {
      params: { from, to, departureDate }
    });
    return response.data;
  }

  async getByRoute(from, to) {
    const response = await api.get(`/v1/${this.endpoint}/route`, {
      params: { from, to }
    });
    return response.data;
  }
}

// Package Service
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

  async getPackageOptions(packageId) {
    const response = await api.get(`/v1/${this.endpoint}/${packageId}/options`);
    return response.data;
  }

  async calculateDynamicPrice(packageId, preferences, travelDetails) {
    const response = await api.post(`/v1/${this.endpoint}/${packageId}/calculate-price`, {
      preferences,
      travelDetails
    });
    return response.data;
  }

  async createPackageBooking(bookingData) {
    const response = await api.post(`/${this.endpoint}/book`, bookingData);
    return response.data;
  }

  async createBooking(bookingData) {
    const response = await api.post(`/${this.endpoint}/book`, bookingData);
    return response.data;
  }
}

// User Service
export class UserService extends ApiService {
  constructor() {
    super('users');
  }

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(resetData) {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  }

  async validateResetToken(token, email) {
    const response = await api.get(`/auth/validate-reset-token?token=${token}&email=${encodeURIComponent(email)}`);
    return response.data;
  }
}

// Legacy Booking Service (for old booking endpoints)
export class LegacyBookingService {
  async createHotelBooking(bookingData) {
    const response = await api.post('/hotel-bookings', bookingData);
    return response.data;
  }

  async createTravelBooking(bookingData) {
    const response = await api.post('/travel-bookings', bookingData);
    return response.data;
  }

  async createUniversalBooking(bookingData) {
    const response = await api.post('/universal-bookings', bookingData);
    return response.data;
  }

  async getMyBookings(userId) {
    const response = await api.get(`/universal-bookings/user/${userId}`);
    return response.data;
  }

  async getBookingById(bookingId) {
    const response = await api.get(`/universal-bookings/${bookingId}`);
    return response.data;
  }

  async cancelBooking(bookingId) {
    const response = await api.patch(`/universal-bookings/${bookingId}`, {
      status: 'cancelled'
    });
    return response.data;
  }
}

// Destination Service
export class DestinationService extends ApiService {
  constructor() {
    super('destinations');
  }

  async getByType(type) {
    const response = await api.get(`/destinations?type=${type}`);
    return response.data;
  }

  async searchByCity(city) {
    const response = await api.get(`/destinations/search?city=${city}`);
    return response.data;
  }
}

// Export service instances
export const hotelService = new HotelService();
export const flightService = new FlightService();
export const trainService = new TrainService();
export const busService = new BusService();
export const packageService = new PackageService();
export const userService = new UserService();
export const destinationService = new DestinationService();
export const legacyBookingService = new LegacyBookingService();

// Booking Service (Main unified booking system)
class BookingService extends ApiService {
  constructor() {
    super('bookings');
  }

  async createBooking(bookingData) {
    return await api.post('/bookings', bookingData);
  }

  async getBookingByNumber(bookingNumber) {
    return await api.get(`/bookings/number/${bookingNumber}`);
  }

  async getUserBookings(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/bookings/user/${userId}?${queryString}`);
  }

  async updateBookingStatus(bookingNumber, status, notes) {
    return await api.put(`/bookings/status/${bookingNumber}`, { status, notes });
  }

  async cancelBooking(bookingNumber, reason) {
    return await api.put(`/bookings/cancel/${bookingNumber}`, { reason });
  }

  async getBookingStats() {
    return await api.get('/bookings/stats');
  }
}

export const bookingService = new BookingService();

// Chat Contact Service
export class ChatContactService extends ApiService {
  constructor() {
    super('chat-contacts');
  }

  async submitContact(contactData) {
    const response = await api.post('/chat-contacts', contactData);
    return response.data;
  }

  async getAllContacts(params = {}) {
    const response = await api.get('/chat-contacts', { params });
    return response.data;
  }

  async getPendingContacts() {
    const response = await api.get('/chat-contacts/pending');
    return response.data;
  }

  async updateContactStatus(id, updateData) {
    const response = await api.put(`/chat-contacts/${id}`, updateData);
    return response.data;
  }

  async addNote(id, note) {
    const response = await api.post(`/chat-contacts/${id}/notes`, { note });
    return response.data;
  }

  async getContactStats() {
    const response = await api.get('/chat-contacts/stats');
    return response.data;
  }
}

export const chatContactService = new ChatContactService();

export default api;
