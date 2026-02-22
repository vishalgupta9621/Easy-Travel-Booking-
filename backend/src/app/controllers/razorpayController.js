import razorpayService from '../services/razorpay.service.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency, bookingNumber, customerInfo } = req.body;

    if (!amount || !bookingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Amount and booking number are required'
      });
    }

    // Create Razorpay order
    const orderResult = await razorpayService.createOrder(
      amount,
      currency || 'INR',
      `booking_${bookingNumber}`
    );

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: orderResult.error
      });
    }

    // Save payment record with pending status
    const payment = new Payment({
      paymentId: orderResult.order.id,
      bookingNumber: bookingNumber,
      orderId: orderResult.order.id,
      amount: amount,
      currency: currency || 'INR',
      method: 'razorpay',
      status: 'pending',
      customerInfo: customerInfo,
      paymentDetails: {
        gateway: 'razorpay',
        orderId: orderResult.order.id
      }
    });

    await payment.save();

    res.json({
      success: true,
      order: orderResult.order,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
      isDemoMode: razorpayService.isDemoMode
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingNumber 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Verify payment signature
    const isValidSignature = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay (skip in demo mode)
    let paymentResult = { success: true, payment: { method: 'demo' } };

    if (!razorpayService.isDemoMode) {
      paymentResult = await razorpayService.getPaymentDetails(razorpay_payment_id);

      if (!paymentResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch payment details',
          error: paymentResult.error
        });
      }
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        status: 'success',
        signature: razorpay_signature,
        'paymentDetails.transactionId': razorpay_payment_id,
        'paymentDetails.paymentMethod': paymentResult.payment.method,
        'paymentDetails.bankReference': paymentResult.payment.acquirer_data?.bank_transaction_id,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update booking status to confirmed
    if (bookingNumber) {
      await Booking.findOneAndUpdate(
        { bookingNumber: bookingNumber },
        { 
          bookingStatus: 'confirmed',
          'paymentInfo.status': 'success',
          'paymentInfo.paymentId': razorpay_payment_id,
          'paymentInfo.signature': razorpay_signature
        }
      );
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: payment,
      paymentDetails: paymentResult.payment
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Handle payment failure
export const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId, error } = req.body;

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId: orderId },
      {
        status: 'failed',
        'paymentDetails.errorCode': error.code,
        'paymentDetails.errorDescription': error.description,
        updatedAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });

  } catch (error) {
    console.error('Payment failure handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment failure',
      error: error.message
    });
  }
};

// Get Razorpay key for frontend
export const getRazorpayKey = async (req, res) => {
  try {
    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      isDemoMode: razorpayService.isDemoMode
    });
  } catch (error) {
    console.error('Get Razorpay key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Razorpay key',
      error: error.message
    });
  }
};

// Test Razorpay connection
export const testConnection = async (req, res) => {
  try {
    if (razorpayService.isDemoMode) {
      return res.json({
        success: true,
        message: 'Running in demo mode',
        isDemoMode: true
      });
    }

    // Try to create a test order with minimal amount
    const testOrder = await razorpayService.createOrder(1, 'INR', 'test_connection');

    res.json({
      success: testOrder.success,
      message: testOrder.success ? 'Razorpay connection successful' : 'Razorpay connection failed',
      isDemoMode: false,
      error: testOrder.error || null
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Razorpay connection',
      error: error.message
    });
  }
};
