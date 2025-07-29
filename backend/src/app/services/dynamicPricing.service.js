import Package from '../models/Package.js';
import Hotel from '../models/Hotel.js';
import Flight from '../models/Flight.js';
import Train from '../models/Train.js';
import Bus from '../models/Bus.js';

class DynamicPricingService {
  
  /**
   * Calculate dynamic pricing for a package based on user preferences
   * @param {string} packageId - Package ID
   * @param {Object} preferences - User preferences
   * @param {Object} travelDetails - Travel details
   * @returns {Object} Pricing breakdown
   */
  async calculatePackagePrice(packageId, preferences, travelDetails) {
    try {
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new Error('Package not found');
      }

      const { hotelCategory, transportType, transportClass, addOns = [] } = preferences;
      const { startDate, endDate, numberOfTravelers } = travelDetails;
      
      // Calculate number of nights
      const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      
      // Get base package price
      const basePackagePrice = packageData.pricing?.basePackagePrice || packageData.basePrice || packageData.price;
      
      // Calculate hotel pricing
      const hotelPrice = await this.calculateHotelPrice(
        packageData, 
        hotelCategory, 
        nights, 
        numberOfTravelers
      );
      
      // Calculate transport pricing
      const transportPrice = await this.calculateTransportPrice(
        packageData,
        transportType,
        transportClass,
        numberOfTravelers,
        startDate,
        endDate
      );
      
      // Calculate add-ons pricing
      const addOnsPrice = this.calculateAddOnsPrice(addOns, numberOfTravelers);
      
      // Calculate taxes and fees
      const subtotal = basePackagePrice + hotelPrice + transportPrice + addOnsPrice;
      const taxes = this.calculateTaxes(subtotal);
      const serviceFee = this.calculateServiceFee(subtotal);
      
      // Apply any discounts
      const discount = await this.calculateDiscount(packageData, subtotal, travelDetails);
      
      const totalAmount = subtotal + taxes + serviceFee - discount;
      
      return {
        basePackagePrice: basePackagePrice * numberOfTravelers,
        hotelPrice,
        transportPrice,
        addOnsPrice,
        taxes,
        serviceFee,
        discount,
        totalAmount,
        breakdown: {
          pricePerPerson: {
            basePackage: basePackagePrice,
            hotel: hotelPrice / numberOfTravelers,
            transport: transportPrice / numberOfTravelers,
            addOns: addOnsPrice / numberOfTravelers
          },
          nights,
          travelers: numberOfTravelers
        }
      };
      
    } catch (error) {
      console.error('Dynamic pricing calculation error:', error);
      throw error;
    }
  }
  
  /**
   * Calculate hotel pricing based on category and duration
   */
  async calculateHotelPrice(packageData, hotelCategory, nights, numberOfTravelers) {
    try {
      // Find hotel option from package pricing
      const hotelOption = packageData.pricing?.hotelOptions?.find(
        option => option.category === hotelCategory
      );
      
      if (!hotelOption) {
        // Fallback to default pricing
        const defaultPrices = {
          budget: 1500,
          standard: 3000,
          luxury: 6000
        };
        return defaultPrices[hotelCategory] * nights * Math.ceil(numberOfTravelers / 2); // Assuming 2 people per room
      }
      
      const roomsNeeded = Math.ceil(numberOfTravelers / 2); // Assuming 2 people per room
      return hotelOption.pricePerNight * nights * roomsNeeded;
      
    } catch (error) {
      console.error('Hotel price calculation error:', error);
      // Return fallback pricing
      const fallbackPrices = {
        budget: 1500,
        standard: 3000,
        luxury: 6000
      };
      return fallbackPrices[hotelCategory] * nights * Math.ceil(numberOfTravelers / 2);
    }
  }
  
  /**
   * Calculate transport pricing based on type and class
   */
  async calculateTransportPrice(packageData, transportType, transportClass, numberOfTravelers, startDate, endDate) {
    try {
      // Find transport option from package pricing
      const transportOption = packageData.pricing?.transportOptions?.find(
        option => option.type === transportType && 
        (!transportClass || option.class === transportClass)
      );
      
      if (!transportOption) {
        // Fallback to default pricing
        const defaultPrices = {
          flight: { economy: 8000, business: 15000, first: 25000 },
          train: { SL: 800, '3A': 1500, '2A': 2500, '1A': 4000 },
          bus: { ac: 1200, 'non-ac': 800, sleeper: 1500 }
        };
        
        const classPrice = defaultPrices[transportType]?.[transportClass] || 
                          Object.values(defaultPrices[transportType] || {})[0] || 2000;
        
        return classPrice * numberOfTravelers * 2; // Round trip
      }
      
      return transportOption.basePrice * numberOfTravelers * 2; // Round trip
      
    } catch (error) {
      console.error('Transport price calculation error:', error);
      // Return fallback pricing
      return 4000 * numberOfTravelers; // Default round trip price
    }
  }
  
  /**
   * Calculate add-ons pricing
   */
  calculateAddOnsPrice(addOns, numberOfTravelers) {
    return addOns.reduce((total, addOn) => {
      return total + (addOn.price * numberOfTravelers);
    }, 0);
  }
  
  /**
   * Calculate taxes (GST, etc.)
   */
  calculateTaxes(subtotal) {
    const gstRate = 0.18; // 18% GST
    return Math.round(subtotal * gstRate);
  }
  
  /**
   * Calculate service fee
   */
  calculateServiceFee(subtotal) {
    const serviceFeeRate = 0.02; // 2% service fee
    const minServiceFee = 100;
    const maxServiceFee = 500;
    
    const calculatedFee = subtotal * serviceFeeRate;
    return Math.min(Math.max(calculatedFee, minServiceFee), maxServiceFee);
  }
  
  /**
   * Calculate applicable discounts
   */
  async calculateDiscount(packageData, subtotal, travelDetails) {
    let discount = 0;
    
    // Early bird discount (booking 30 days in advance)
    const daysInAdvance = Math.ceil((new Date(travelDetails.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysInAdvance >= 30) {
      discount += subtotal * 0.05; // 5% early bird discount
    }
    
    // Group discount (more than 4 travelers)
    if (travelDetails.numberOfTravelers >= 4) {
      discount += subtotal * 0.03; // 3% group discount
    }
    
    // Seasonal discount (off-peak periods)
    const month = new Date(travelDetails.startDate).getMonth();
    const offPeakMonths = [5, 6, 7, 8]; // June to September
    if (offPeakMonths.includes(month)) {
      discount += subtotal * 0.02; // 2% off-peak discount
    }
    
    return Math.round(discount);
  }
  
  /**
   * Get available options for a package
   */
  async getPackageOptions(packageId) {
    try {
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        throw new Error('Package not found');
      }
      
      return {
        hotelOptions: packageData.pricing?.hotelOptions || [
          { category: 'budget', pricePerNight: 1500, description: 'Basic accommodation' },
          { category: 'standard', pricePerNight: 3000, description: 'Comfortable stay' },
          { category: 'luxury', pricePerNight: 6000, description: 'Premium experience' }
        ],
        transportOptions: packageData.pricing?.transportOptions || [
          { type: 'flight', class: 'economy', basePrice: 8000, description: 'Quick and convenient' },
          { type: 'train', class: '3A', basePrice: 1500, description: 'Comfortable journey' },
          { type: 'bus', class: 'ac', basePrice: 1200, description: 'Budget-friendly option' }
        ],
        addOns: packageData.preferences?.optionalAddOns || []
      };
      
    } catch (error) {
      console.error('Get package options error:', error);
      throw error;
    }
  }
}

export default new DynamicPricingService();
