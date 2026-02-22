import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class RazorpayService {
  constructor() {
    // Check if Razorpay credentials are properly configured
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If credentials are not set or are placeholder values, use demo mode
    this.isDemoMode = !keyId || !keySecret ||
                     keyId.includes('your_key_id_here') ||
                     keySecret.includes('your_razorpay_secret_here');

    if (!this.isDemoMode) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  // Create Razorpay order
  async createOrder(amount, currency = 'INR', receipt = null) {
    try {
      // If in demo mode, return a mock order
      if (this.isDemoMode) {
        console.log('Razorpay Demo Mode: Creating mock order');
        return {
          success: true,
          order: {
            id: `order_demo_${Date.now()}`,
            amount: amount * 100,
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
            status: 'created'
          }
        };
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
        notes: {
          booking_type: 'travel',
          test_mode: 'true'
        }
      };

      const order = await this.razorpay.orders.create(options);
      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      // If in demo mode, always return true for demo signatures
      if (this.isDemoMode && signature.includes('demo_signature')) {
        console.log('Razorpay Demo Mode: Accepting demo signature');
        return true;
      }

      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Payment signature verification error:', error);
      return false;
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment: payment
      };
    } catch (error) {
      console.error('Get payment details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount = null) {
    try {
      const refundOptions = {};
      if (amount) {
        refundOptions.amount = amount * 100; // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Payment refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get order details
  async getOrderDetails(orderId) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return {
        success: true,
        order: order
      };
    } catch (error) {
      console.error('Get order details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new RazorpayService();
