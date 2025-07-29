import Payment from '../models/Payment.js';

// Get all payments (for admin)
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments();

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

// Get payments by booking number
export const getPaymentsByBooking = async (req, res) => {
  try {
    const { bookingNumber } = req.params;

    const payments = await Payment.find({ bookingNumber })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Get payments by booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

// Get payments by user (based on customer email)
export const getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // For now, we'll use customer email to find payments
    // In a real app, you'd have proper user relationships
    const payments = await Payment.find({
      'customerInfo.email': { $exists: true }
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({
      'customerInfo.email': { $exists: true }
    });

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user payments',
      error: error.message
    });
  }
};

// Get payment by payment ID
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, transactionId, bankReference } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { paymentId },
      { 
        status,
        'paymentDetails.transactionId': transactionId,
        'paymentDetails.bankReference': bankReference,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'success' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    const totalAmount = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const methodStats = await Payment.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalAmount: totalAmount[0]?.total || 0,
        methodStats
      }
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment statistics',
      error: error.message
    });
  }
};
