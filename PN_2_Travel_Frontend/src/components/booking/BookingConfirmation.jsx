import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { bookingNumber } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingConfirmation();
  }, [bookingNumber]);

  const loadBookingConfirmation = () => {
    const confirmation = localStorage.getItem('bookingConfirmation');
    if (confirmation) {
      const data = JSON.parse(confirmation);
      if (data.bookingNumber === bookingNumber) {
        setBookingData(data);
      }
    }
    setLoading(false);
  };

  const downloadTicket = () => {
    try {
      // Generate ticket content as HTML
      const ticketContent = generateTicketHTML();

      // Create a new window for printing/saving
      const printWindow = window.open('', '_blank');
      printWindow.document.write(ticketContent);
      printWindow.document.close();

      // Trigger print dialog (user can save as PDF)
      setTimeout(() => {
        printWindow.print();
      }, 500);

      alert('Ticket opened in new window. You can save it as PDF using your browser\'s print function.');
    } catch (error) {
      console.error('Error generating ticket:', error);
      alert('Error generating ticket. Please try again.');
    }
  };

  const sendToEmail = async () => {
    const email = prompt('Please enter your email address:');

    if (!email) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      // Show loading state
      const originalText = document.querySelector('.email-btn').textContent;
      document.querySelector('.email-btn').textContent = '📧 Sending...';
      document.querySelector('.email-btn').disabled = true;

      // Send email via backend service
      const response = await fetch('/api/v1/tickets/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          bookingData: bookingData,
          userName: bookingData.customerName || 'Customer'
        })
      });

      const result = await response.json();

      if (result.success) {
        if (result.fallback) {
          // Fallback mode - email service not configured
          alert(`Email service is not configured on the server. Please configure EMAIL_USER and EMAIL_PASS in the backend .env file to enable email functionality.\n\nFor now, you can download the ticket and send it manually.`);

          // Fallback to mailto
          const subject = `Your Travel Ticket - Booking ${bookingData.bookingNumber}`;
          const body = generateEmailBody();
          const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          window.open(mailtoLink, '_blank');
        } else {
          // Email sent successfully
          alert(`✅ Booking confirmation sent successfully to ${email}!\n\nPlease check your email inbox (and spam folder) for the confirmation.`);
        }
      } else {
        throw new Error(result.message || 'Failed to send email');
      }

    } catch (error) {
      console.error('Error sending email:', error);

      // Fallback to mailto
      try {
        const subject = `Your Travel Ticket - Booking ${bookingData.bookingNumber}`;
        const body = generateEmailBody();
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');

        alert(`Network error occurred. Email client opened as fallback.\nPlease send the email manually to ${email}.`);
      } catch (fallbackError) {
        alert('Error sending email. Please try again or download the ticket instead.');
      }
    } finally {
      // Reset button state
      document.querySelector('.email-btn').textContent = '📧 Send to Email';
      document.querySelector('.email-btn').disabled = false;
    }
  };

  if (loading) {
    return <div className="loading">Loading confirmation...</div>;
  }

  if (!bookingData) {
    return (
      <div className="no-confirmation">
        <h2>Booking confirmation not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const getItemName = () => {
    const { item, type } = bookingData;
    switch (type) {
      case 'hotel': return item.name;
      case 'flight': return `${item.airline?.name} ${item.flightNumber}`;
      case 'train': return `${item.trainName} (${item.trainNumber})`;
      case 'bus': return `${item.operator} - ${item.busNumber}`;
      case 'package': return item.name;
      default: return 'Unknown';
    }
  };

  // Generate HTML content for ticket
  const generateTicketHTML = () => {
    const itemName = getItemName();
    const itemDetails = getItemSpecificDetails();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Travel Ticket - ${bookingData.bookingNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; font-size: 16px; }
          .booking-number {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .status {
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            font-size: 12px;
          }
          .details-section {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
          }
          .details-section h3 {
            color: #667eea;
            margin-top: 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .footer {
            background: #667eea;
            color: white;
            padding: 20px;
            text-align: center;
            margin-top: 30px;
            border-radius: 10px;
          }
          .footer p { margin: 5px 0; }
          @media print {
            body { margin: 0; }
            .header, .footer { background: #667eea !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎫 Travel Booking Ticket</h1>
          <p>Your Travel Confirmation</p>
        </div>

        <div class="booking-number">
          <h2 style="margin: 0 0 10px 0;">Booking Confirmation</h2>
          <p style="margin: 0; font-size: 18px;"><strong>Booking Number: ${bookingData.bookingNumber}</strong></p>
          <p style="margin: 10px 0 0 0;"><span class="status">CONFIRMED</span></p>
        </div>

        <div class="details-section">
          <h3>📋 Booking Details</h3>
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${bookingData.type.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Item:</span>
            <span class="detail-value">${itemName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value">₹${bookingData.paymentData.amount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${bookingData.paymentData.method}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment ID:</span>
            <span class="detail-value">${bookingData.paymentData.paymentId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Booking Date:</span>
            <span class="detail-value">${new Date(bookingData.bookedAt).toLocaleDateString()}</span>
          </div>
        </div>

        ${itemDetails ? `
        <div class="details-section">
          <h3>${getItemIcon()} ${bookingData.type.charAt(0).toUpperCase() + bookingData.type.slice(1)} Information</h3>
          ${itemDetails}
        </div>
        ` : ''}

        <div class="details-section">
          <h3>📝 Important Notes</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Please carry a valid ID proof during travel</li>
            <li>Arrive at the departure point at least 30 minutes before scheduled time</li>
            <li>For any changes or cancellations, contact our support team</li>
            <li>Keep this ticket handy during your journey</li>
          </ul>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing our travel services!</strong></p>
          <p>📧 support@travelbooking.com | 📞 +91-1234567890</p>
          <p>🌐 www.travelbooking.com</p>
          <p style="font-size: 12px; margin-top: 15px;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Generate email body content
  const generateEmailBody = () => {
    const itemName = getItemName();

    return `Dear Customer,

Thank you for your booking with Travel Booking Services!

BOOKING CONFIRMATION
Booking Number: ${bookingData.bookingNumber}
Status: CONFIRMED

BOOKING DETAILS:
- Type: ${bookingData.type.toUpperCase()}
- Item: ${itemName}
- Amount Paid: ₹${bookingData.paymentData.amount}
- Payment Method: ${bookingData.paymentData.method}
- Payment ID: ${bookingData.paymentData.paymentId}
- Booking Date: ${new Date(bookingData.bookedAt).toLocaleDateString()}

${getItemSpecificEmailDetails()}

IMPORTANT NOTES:
- Please carry a valid ID proof during travel
- Arrive at the departure point at least 30 minutes before scheduled time
- For any changes or cancellations, contact our support team
- Keep this confirmation handy during your journey

Contact Information:
Email: support@travelbooking.com
Phone: +91-1234567890
Website: www.travelbooking.com

Thank you for choosing our services!

Best regards,
Travel Booking Team`;
  };

  // Get item-specific details for HTML
  const getItemSpecificDetails = () => {
    const { item, type } = bookingData;

    switch (type) {
      case 'flight':
        return `
          <div class="detail-row">
            <span class="detail-label">Flight Number:</span>
            <span class="detail-value">${item.flightNumber || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Airline:</span>
            <span class="detail-value">${item.airline?.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${item.route?.origin?.city} → ${item.route?.destination?.city}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Departure:</span>
            <span class="detail-value">${item.schedule?.departureTime || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Arrival:</span>
            <span class="detail-value">${item.schedule?.arrivalTime || 'N/A'}</span>
          </div>
        `;
      case 'train':
        return `
          <div class="detail-row">
            <span class="detail-label">Train Number:</span>
            <span class="detail-value">${item.trainNumber || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Train Name:</span>
            <span class="detail-value">${item.trainName || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${item.route?.origin?.city} → ${item.route?.destination?.city}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Departure:</span>
            <span class="detail-value">${item.schedule?.departureTime || 'N/A'}</span>
          </div>
        `;
      case 'bus':
        return `
          <div class="detail-row">
            <span class="detail-label">Operator:</span>
            <span class="detail-value">${item.operator || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bus Type:</span>
            <span class="detail-value">${item.busType || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Route:</span>
            <span class="detail-value">${item.route?.origin?.city} → ${item.route?.destination?.city}</span>
          </div>
        `;
      case 'hotel':
        return `
          <div class="detail-row">
            <span class="detail-label">Hotel Name:</span>
            <span class="detail-value">${item.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${item.city || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Rating:</span>
            <span class="detail-value">${item.rating ? `⭐ ${item.rating}` : 'N/A'}</span>
          </div>
        `;
      case 'package':
        return `
          <div class="detail-row">
            <span class="detail-label">Package:</span>
            <span class="detail-value">${item.name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${item.duration ? `${item.duration} days` : 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Destinations:</span>
            <span class="detail-value">${item.destinations?.join(', ') || 'N/A'}</span>
          </div>
        `;
      default:
        return '';
    }
  };

  // Get item icon
  const getItemIcon = () => {
    switch (bookingData.type) {
      case 'flight': return '✈️';
      case 'train': return '🚂';
      case 'bus': return '🚌';
      case 'hotel': return '🏨';
      case 'package': return '📦';
      default: return '🎫';
    }
  };

  // Get item-specific details for email
  const getItemSpecificEmailDetails = () => {
    const { item, type } = bookingData;

    switch (type) {
      case 'flight':
        return `FLIGHT INFORMATION:
- Flight: ${item.airline?.name} ${item.flightNumber}
- Route: ${item.route?.origin?.city} → ${item.route?.destination?.city}
- Departure: ${item.schedule?.departureTime}
- Arrival: ${item.schedule?.arrivalTime}`;
      case 'train':
        return `TRAIN INFORMATION:
- Train: ${item.trainName} (${item.trainNumber})
- Route: ${item.route?.origin?.city} → ${item.route?.destination?.city}
- Departure: ${item.schedule?.departureTime}`;
      case 'bus':
        return `BUS INFORMATION:
- Operator: ${item.operator}
- Route: ${item.route?.origin?.city} → ${item.route?.destination?.city}
- Bus Type: ${item.busType}`;
      case 'hotel':
        return `HOTEL INFORMATION:
- Hotel: ${item.name}
- Location: ${item.city}
- Rating: ${item.rating ? `⭐ ${item.rating}` : 'N/A'}`;
      case 'package':
        return `PACKAGE INFORMATION:
- Package: ${item.name}
- Duration: ${item.duration} days
- Destinations: ${item.destinations?.join(', ')}`;
      default:
        return '';
    }
  };

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <div className="success-icon">✅</div>
        <h1>Booking Confirmed!</h1>
        <p>Your booking has been successfully confirmed</p>
      </div>

      <div className="confirmation-content">
        <div className="booking-info">
          <div className="booking-number">
            <h2>Booking Number</h2>
            <div className="number">{bookingData.bookingNumber}</div>
          </div>

          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span>Type:</span>
              <span>{bookingData.type}</span>
            </div>
            <div className="detail-row">
              <span>Item:</span>
              <span>{getItemName()}</span>
            </div>
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span>₹{bookingData.paymentData.amount}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{bookingData.paymentData.method}</span>
            </div>
            <div className="detail-row">
              <span>Payment ID:</span>
              <span>{bookingData.paymentData.paymentId}</span>
            </div>
            <div className="detail-row">
              <span>Booking Date:</span>
              <span>{new Date(bookingData.bookedAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className="status-confirmed">Confirmed</span>
            </div>
          </div>

          {renderItemSpecificDetails()}
        </div>

        <div className="confirmation-actions">
          <button className="download-btn" onClick={downloadTicket}>
            📄 Download Ticket
          </button>
          <button className="email-btn" onClick={sendToEmail}>
            📧 Send to Email
          </button>
          <button className="home-btn" onClick={() => navigate('/')}>
            🏠 Go to Home
          </button>
        </div>
      </div>
    </div>
  );

  function renderItemSpecificDetails() {
    const { item, type } = bookingData;

    switch (type) {
      case 'flight':
        return (
          <div className="flight-ticket-info">
            <h3>Flight Information</h3>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{item.schedule?.arrivalTime}</span>
            </div>
            <div className="detail-row">
              <span>Aircraft:</span>
              <span>{item.aircraft?.model}</span>
            </div>
          </div>
        );

      case 'train':
        return (
          <div className="train-ticket-info">
            <h3>Train Information</h3>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Arrival:</span>
              <span>{item.schedule?.arrivalTime}</span>
            </div>
          </div>
        );

      case 'bus':
        return (
          <div className="bus-ticket-info">
            <h3>Bus Information</h3>
            <div className="detail-row">
              <span>Route:</span>
              <span>{item.route?.origin?.city} → {item.route?.destination?.city}</span>
            </div>
            <div className="detail-row">
              <span>Departure:</span>
              <span>{item.schedule?.departureTime}</span>
            </div>
            <div className="detail-row">
              <span>Bus Type:</span>
              <span>{item.busType}</span>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className="hotel-booking-info">
            <h3>Hotel Information</h3>
            <div className="detail-row">
              <span>Location:</span>
              <span>{item.city}</span>
            </div>
            <div className="detail-row">
              <span>Rating:</span>
              <span>⭐ {item.rating}</span>
            </div>
          </div>
        );

      case 'package':
        return (
          <div className="package-booking-info">
            <h3>Package Information</h3>
            <div className="detail-row">
              <span>Duration:</span>
              <span>{item.duration} days</span>
            </div>
            <div className="detail-row">
              <span>Destinations:</span>
              <span>{item.destinations?.join(', ')}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
};

export default BookingConfirmation;
