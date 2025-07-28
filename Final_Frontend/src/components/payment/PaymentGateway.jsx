import { useState } from 'react';
import './PaymentGateway.css';

const PaymentGateway = ({ amount, onSuccess, onFailure, onCancel, paymentMethod }) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [netBankingBank, setNetBankingBank] = useState('');

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCardDetails = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
    
    if (!cardholderName.trim()) {
      alert('Please enter cardholder name');
      return false;
    }
    
    if (cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return false;
    }
    
    if (expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    
    if (cvv.length < 3) {
      alert('Please enter a valid CVV');
      return false;
    }
    
    return true;
  };

  const validateUPI = () => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      alert('Please enter a valid UPI ID');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    setLoading(true);
    
    try {
      // Validate based on payment method
      if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && !validateCardDetails()) {
        setLoading(false);
        return;
      }
      
      if (paymentMethod === 'upi' && !validateUPI()) {
        setLoading(false);
        return;
      }
      
      if (paymentMethod === 'net_banking' && !netBankingBank) {
        alert('Please select your bank');
        setLoading(false);
        return;
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
        onSuccess({
          transactionId,
          amount,
          paymentMethod,
          timestamp: new Date().toISOString()
        });
      } else {
        onFailure({
          error: 'Payment failed due to insufficient funds or network error',
          code: 'PAYMENT_FAILED'
        });
      }
    } catch (error) {
      onFailure({
        error: 'An unexpected error occurred during payment processing',
        code: 'SYSTEM_ERROR'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return (
          <div className="card-payment-form">
            <h3>💳 {paymentMethod === 'credit_card' ? 'Credit' : 'Debit'} Card Details</h3>
            
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="Enter cardholder name"
                value={cardDetails.cardholderName}
                onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                maxLength={50}
              />
            </div>
            
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                maxLength={19}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', e.target.value)}
                  maxLength={5}
                />
              </div>
              
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );
        
      case 'upi':
        return (
          <div className="upi-payment-form">
            <h3>📱 UPI Payment</h3>
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="yourname@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
            <div className="upi-apps">
              <p>Popular UPI Apps:</p>
              <div className="upi-app-icons">
                <span>📱 PhonePe</span>
                <span>💰 Paytm</span>
                <span>🏦 Google Pay</span>
                <span>💳 BHIM</span>
              </div>
            </div>
          </div>
        );
        
      case 'net_banking':
        return (
          <div className="netbanking-payment-form">
            <h3>🏦 Net Banking</h3>
            <div className="form-group">
              <label>Select Your Bank</label>
              <select
                value={netBankingBank}
                onChange={(e) => setNetBankingBank(e.target.value)}
              >
                <option value="">Choose your bank</option>
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
                <option value="kotak">Kotak Mahindra Bank</option>
                <option value="pnb">Punjab National Bank</option>
                <option value="bob">Bank of Baroda</option>
                <option value="canara">Canara Bank</option>
              </select>
            </div>
          </div>
        );
        
      case 'wallet':
        return (
          <div className="wallet-payment-form">
            <h3>👛 Digital Wallet</h3>
            <div className="wallet-options">
              <div className="wallet-option">
                <span>💰 Paytm Wallet</span>
                <span>Balance: ₹2,500</span>
              </div>
              <div className="wallet-option">
                <span>📱 PhonePe Wallet</span>
                <span>Balance: ₹1,200</span>
              </div>
              <div className="wallet-option">
                <span>🏦 Amazon Pay</span>
                <span>Balance: ₹800</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Unsupported payment method</div>;
    }
  };

  return (
    <div className="payment-gateway">
      <div className="payment-header">
        <h2>Complete Your Payment</h2>
        <div className="amount-display">
          <span className="amount">₹{amount.toLocaleString()}</span>
        </div>
      </div>
      
      {renderPaymentForm()}
      
      <div className="payment-actions">
        <button 
          className="cancel-btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        
        <button 
          className="pay-btn"
          onClick={processPayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            `Pay ₹${amount.toLocaleString()}`
          )}
        </button>
      </div>
      
      <div className="security-info">
        <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        <p>💳 We don't store your card details</p>
      </div>
    </div>
  );
};

export default PaymentGateway;
