import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentGateway from '../components/payment/PaymentGateway';

describe('PaymentGateway Component', () => {
  const mockProps = {
    amount: 5000,
    paymentMethod: 'credit_card',
    onSuccess: vi.fn(),
    onFailure: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random to ensure consistent test results
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders payment gateway with correct amount', () => {
    render(<PaymentGateway {...mockProps} />);
    
    expect(screen.getByText('Complete Your Payment')).toBeInTheDocument();
    expect(screen.getByText('₹5,000')).toBeInTheDocument();
  });

  test('renders credit card form for credit card payment', () => {
    render(<PaymentGateway {...mockProps} />);
    
    expect(screen.getByText('💳 Credit Card Details')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter cardholder name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
  });

  test('renders UPI form for UPI payment', () => {
    render(<PaymentGateway {...mockProps} paymentMethod="upi" />);
    
    expect(screen.getByText('📱 UPI Payment')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('yourname@paytm')).toBeInTheDocument();
    expect(screen.getByText('Popular UPI Apps:')).toBeInTheDocument();
  });

  test('renders net banking form for net banking payment', () => {
    render(<PaymentGateway {...mockProps} paymentMethod="net_banking" />);
    
    expect(screen.getByText('🏦 Net Banking')).toBeInTheDocument();
    expect(screen.getByText('Choose your bank')).toBeInTheDocument();
    expect(screen.getByText('State Bank of India')).toBeInTheDocument();
  });

  test('renders wallet form for wallet payment', () => {
    render(<PaymentGateway {...mockProps} paymentMethod="wallet" />);
    
    expect(screen.getByText('👛 Digital Wallet')).toBeInTheDocument();
    expect(screen.getByText('💰 Paytm Wallet')).toBeInTheDocument();
    expect(screen.getByText('📱 PhonePe Wallet')).toBeInTheDocument();
  });

  test('formats card number correctly', () => {
    render(<PaymentGateway {...mockProps} />);
    
    const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    fireEvent.change(cardNumberInput, { target: { value: '1234567890123456' } });
    
    expect(cardNumberInput.value).toBe('1234 5678 9012 3456');
  });

  test('formats expiry date correctly', () => {
    render(<PaymentGateway {...mockProps} />);
    
    const expiryInput = screen.getByPlaceholderText('MM/YY');
    fireEvent.change(expiryInput, { target: { value: '1225' } });
    
    expect(expiryInput.value).toBe('12/25');
  });

  test('limits CVV to 4 digits', () => {
    render(<PaymentGateway {...mockProps} />);
    
    const cvvInput = screen.getByPlaceholderText('123');
    fireEvent.change(cvvInput, { target: { value: '12345' } });
    
    expect(cvvInput.value).toBe('1234');
  });

  test('validates card details before payment', async () => {
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PaymentGateway {...mockProps} />);
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter cardholder name');
    
    alertSpy.mockRestore();
  });

  test('validates UPI ID format', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PaymentGateway {...mockProps} paymentMethod="upi" />);
    
    const upiInput = screen.getByPlaceholderText('yourname@paytm');
    fireEvent.change(upiInput, { target: { value: 'invalid-upi' } });
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid UPI ID');
    
    alertSpy.mockRestore();
  });

  test('validates bank selection for net banking', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PaymentGateway {...mockProps} paymentMethod="net_banking" />);
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please select your bank');
    
    alertSpy.mockRestore();
  });

  test('processes successful payment', async () => {
    render(<PaymentGateway {...mockProps} />);
    
    // Fill in valid card details
    fireEvent.change(screen.getByPlaceholderText('Enter cardholder name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '1234567890123456' }
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '1225' }
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' }
    });
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    // Should show processing state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Wait for payment to complete
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionId: expect.stringMatching(/^TXN/),
          amount: 5000,
          paymentMethod: 'credit_card'
        })
      );
    }, { timeout: 4000 });
  });

  test('handles payment failure', async () => {
    // Mock Math.random to return value that triggers failure
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    
    render(<PaymentGateway {...mockProps} />);
    
    // Fill in valid card details
    fireEvent.change(screen.getByPlaceholderText('Enter cardholder name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '1234567890123456' }
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '1225' }
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' }
    });
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(mockProps.onFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Payment failed'),
          code: 'PAYMENT_FAILED'
        })
      );
    }, { timeout: 4000 });
  });

  test('handles payment cancellation', () => {
    render(<PaymentGateway {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  test('disables buttons during processing', async () => {
    render(<PaymentGateway {...mockProps} />);
    
    // Fill in valid card details
    fireEvent.change(screen.getByPlaceholderText('Enter cardholder name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '1234567890123456' }
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
      target: { value: '1225' }
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
      target: { value: '123' }
    });
    
    const payButton = screen.getByText('Pay ₹5,000');
    const cancelButton = screen.getByText('Cancel');
    
    fireEvent.click(payButton);
    
    // Buttons should be disabled during processing
    expect(payButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  test('shows security information', () => {
    render(<PaymentGateway {...mockProps} />);
    
    expect(screen.getByText('🔒 Your payment is secured with 256-bit SSL encryption')).toBeInTheDocument();
    expect(screen.getByText('💳 We don\'t store your card details')).toBeInTheDocument();
  });

  test('handles different payment methods correctly', () => {
    const { rerender } = render(<PaymentGateway {...mockProps} paymentMethod="debit_card" />);
    expect(screen.getByText('💳 Debit Card Details')).toBeInTheDocument();
    
    rerender(<PaymentGateway {...mockProps} paymentMethod="upi" />);
    expect(screen.getByText('📱 UPI Payment')).toBeInTheDocument();
    
    rerender(<PaymentGateway {...mockProps} paymentMethod="net_banking" />);
    expect(screen.getByText('🏦 Net Banking')).toBeInTheDocument();
    
    rerender(<PaymentGateway {...mockProps} paymentMethod="wallet" />);
    expect(screen.getByText('👛 Digital Wallet')).toBeInTheDocument();
  });

  test('validates complete card form', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PaymentGateway {...mockProps} />);
    
    // Fill incomplete card details
    fireEvent.change(screen.getByPlaceholderText('Enter cardholder name'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
      target: { value: '123' } // Too short
    });
    
    const payButton = screen.getByText('Pay ₹5,000');
    fireEvent.click(payButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid card number');
    
    alertSpy.mockRestore();
  });
});
