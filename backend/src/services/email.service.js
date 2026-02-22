import nodemailer from 'nodemailer';
import crypto from 'crypto';

class EmailService {
  constructor() {
    this.transporter = null;
    // Don't initialize immediately - wait for environment variables to be loaded
  }

  // Method to initialize or reinitialize the transporter
  ensureInitialized() {
    if (!this.transporter) {
      this.initializeTransporter();
    }
  }

  initializeTransporter() {
    try {
      // Configure email transporter based on environment variables
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        console.log('✅ Email service configured successfully!');
      } else {
        console.log('Email service not configured. Using fallback mode.');
      }
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendPasswordResetEmail(email, resetToken, userName = '') {
    try {
      this.ensureInitialized();
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      // Determine the correct frontend URL
      const frontendUrl = process.env.FRONTEND_URL?.trim() || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      console.log('🔗 Generated reset URL:', resetUrl);

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request - Travel Booking System',
        html: this.generatePasswordResetEmailTemplate(userName, resetUrl, resetToken)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  generatePasswordResetEmailTemplate(userName, resetUrl, resetToken) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 10px;
            }
            .title {
                color: #333;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }
            .reset-button:hover {
                opacity: 0.9;
            }
            .token-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }
            .warning {
                background: #fff3cd;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #ffc107;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🧳 Travel Booking System</div>
                <h2 class="title">Password Reset Request</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName || 'User'},</p>
                
                <p>We received a request to reset your password for your Travel Booking System account. If you made this request, please click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="reset-button">Reset My Password</a>
                </div>
                
                <div class="token-info">
                    <strong>Reset Token:</strong> ${resetToken}<br>
                    <small>You can also use this token manually if the button doesn't work.</small>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul>
                        <li>This link will expire in 1 hour for security reasons</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Never share this reset link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    ${resetUrl}
                </p>
                
                <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Travel Booking System</p>
                <p>If you have any questions, please contact our support team.</p>
                <p><small>This is an automated email, please do not reply.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async sendPasswordChangeConfirmation(email, userName = '') {
    try {
      this.ensureInitialized();
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Changed Successfully - Travel Booking System',
        html: this.generatePasswordChangeConfirmationTemplate(userName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password change confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password change confirmation email:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(email, bookingData, userName = '') {
    try {
      this.ensureInitialized();
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: `Booking Confirmation - ${bookingData.bookingNumber} | Travel Booking System`,
        html: this.generateBookingConfirmationTemplate(bookingData, userName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw error;
    }
  }

  async sendHotelOwnerRegistration(registrationData) {
    try {
      this.ensureInitialized();
      if (!this.transporter) {
        throw new Error('Email service not configured');
      }

      // Send email to project travel email
      const adminMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to your project travel email
        subject: `New Hotel Owner Registration - ${registrationData.hotelName}`,
        html: this.generateHotelOwnerRegistrationTemplate(registrationData)
      };

      // Send confirmation email to hotel owner
      const ownerMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: registrationData.ownerEmail,
        subject: 'Hotel Registration Received - TravelEase',
        html: this.generateHotelOwnerConfirmationTemplate(registrationData)
      };

      // Send both emails
      const adminResult = await this.transporter.sendMail(adminMailOptions);
      const ownerResult = await this.transporter.sendMail(ownerMailOptions);

      console.log('Hotel owner registration emails sent:', {
        admin: adminResult.messageId,
        owner: ownerResult.messageId
      });

      return {
        success: true,
        adminMessageId: adminResult.messageId,
        ownerMessageId: ownerResult.messageId
      };
    } catch (error) {
      console.error('Error sending hotel owner registration emails:', error);
      throw error;
    }
  }

  generatePasswordChangeConfirmationTemplate(userName) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #28a745;
                margin-bottom: 10px;
            }
            .success-icon {
                font-size: 48px;
                color: #28a745;
                margin-bottom: 20px;
            }
            .title {
                color: #333;
                margin-bottom: 20px;
            }
            .content {
                margin-bottom: 30px;
            }
            .info-box {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #28a745;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🧳 Travel Booking System</div>
                <div class="success-icon">✅</div>
                <h2 class="title">Password Changed Successfully</h2>
            </div>
            
            <div class="content">
                <p>Hello ${userName || 'User'},</p>
                
                <div class="info-box">
                    <strong>✅ Success!</strong> Your password has been changed successfully.
                </div>
                
                <p>Your Travel Booking System account password was recently updated. You can now use your new password to log in to your account.</p>
                
                <p><strong>What's next?</strong></p>
                <ul>
                    <li>You can now log in with your new password</li>
                    <li>Make sure to keep your password secure</li>
                    <li>Consider using a password manager for better security</li>
                </ul>
                
                <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from Travel Booking System</p>
                <p>If you have any questions, please contact our support team.</p>
                <p><small>This is an automated email, please do not reply.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateBookingConfirmationTemplate(bookingData, userName) {
    const itemName = this.getItemName(bookingData);
    const itemDetails = this.getItemSpecificDetails(bookingData);
    const itemIcon = this.getItemIcon(bookingData.type);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${bookingData.bookingNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
          .email-container { background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .booking-number { background: #e8f5e8; border: 2px solid #28a745; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 30px; }
          .booking-number h2 { margin: 0; color: #28a745; font-size: 24px; }
          .booking-number p { margin: 5px 0 0 0; color: #666; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .detail-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; }
          .detail-label { font-weight: 600; color: #555; font-size: 14px; margin-bottom: 5px; }
          .detail-value { color: #333; font-size: 16px; }
          .item-details { background: #fff8e1; border: 1px solid #ffc107; border-radius: 10px; padding: 25px; margin: 30px 0; }
          .item-details h3 { margin: 0 0 20px 0; color: #333; font-size: 20px; }
          .status-confirmed { background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
          .important-notes { background: #e3f2fd; border: 1px solid #2196f3; border-radius: 10px; padding: 25px; margin: 30px 0; }
          .important-notes h3 { margin: 0 0 15px 0; color: #1976d2; }
          .important-notes ul { margin: 0; padding-left: 20px; }
          .important-notes li { margin-bottom: 8px; color: #333; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6; }
          .footer p { margin: 5px 0; color: #666; }
          .footer strong { color: #333; }
          .button { display: inline-block; padding: 15px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; margin: 20px 10px; font-weight: 600; }
          .button:hover { background: #218838; }
          @media (max-width: 600px) {
            .details-grid { grid-template-columns: 1fr; }
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Thank you for choosing Travel Booking System</p>
          </div>

          <div class="content">
            <div class="booking-number">
              <h2>Booking #${bookingData.bookingNumber}</h2>
              <p>Your booking has been successfully confirmed</p>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Type</div>
                <div class="detail-value">${bookingData.type.toUpperCase()}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Item</div>
                <div class="detail-value">${itemName}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Amount Paid</div>
                <div class="detail-value">₹${bookingData.paymentData.amount}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Payment Method</div>
                <div class="detail-value">${bookingData.paymentData.method}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Payment ID</div>
                <div class="detail-value">${bookingData.paymentData.paymentId}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Booking Date</div>
                <div class="detail-value">${new Date(bookingData.bookedAt).toLocaleDateString()}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value"><span class="status-confirmed">CONFIRMED</span></div>
              </div>
            </div>

            ${itemDetails ? `
            <div class="item-details">
              <h3>${itemIcon} ${bookingData.type.charAt(0).toUpperCase() + bookingData.type.slice(1)} Information</h3>
              ${itemDetails}
            </div>
            ` : ''}

            <div class="important-notes">
              <h3>📋 Important Information</h3>
              <ul>
                <li><strong>ID Proof:</strong> Please carry a valid government-issued ID during travel</li>
                <li><strong>Arrival Time:</strong> Arrive at least 30 minutes before scheduled departure</li>
                <li><strong>Contact Support:</strong> For changes or cancellations, contact our support team</li>
                <li><strong>Keep Handy:</strong> Save this confirmation for your journey</li>
                <li><strong>Weather Check:</strong> Check weather conditions before travel</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings" class="button">View My Bookings</a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" class="button">Book Again</a>
            </div>
          </div>

          <div class="footer">
            <p><strong>Travel Booking System</strong></p>
            <p>📧 support@travelbooking.com | 📞 +91-1234567890</p>
            <p>🌐 www.travelbooking.com</p>
            <p style="font-size: 12px; margin-top: 20px;">
              This email was sent to ${userName || 'you'} regarding booking ${bookingData.bookingNumber}.<br>
              Generated on: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getItemName(bookingData) {
    const { item, type } = bookingData;
    if (!item) return 'N/A';

    switch (type) {
      case 'hotel':
        return item.name || 'Hotel Booking';
      case 'flight':
        return `${item.from} → ${item.to}`;
      case 'train':
        return `${item.from} → ${item.to}`;
      case 'bus':
        return `${item.from} → ${item.to}`;
      case 'package':
        return item.name || 'Travel Package';
      default:
        return 'Travel Booking';
    }
  }

  getItemIcon(type) {
    switch (type) {
      case 'hotel': return '🏨';
      case 'flight': return '✈️';
      case 'train': return '🚂';
      case 'bus': return '🚌';
      case 'package': return '📦';
      default: return '🎫';
    }
  }

  getItemSpecificDetails(bookingData) {
    const { item, type } = bookingData;
    if (!item) return '';

    switch (type) {
      case 'hotel':
        return `
          <div class="detail-item">
            <div class="detail-label">Location</div>
            <div class="detail-value">${item.city || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Rating</div>
            <div class="detail-value">⭐ ${item.rating || 'N/A'}</div>
          </div>
        `;
      case 'flight':
      case 'train':
      case 'bus':
        return `
          <div class="detail-item">
            <div class="detail-label">From</div>
            <div class="detail-value">${item.from || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">To</div>
            <div class="detail-value">${item.to || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Departure</div>
            <div class="detail-value">${item.departureTime || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Arrival</div>
            <div class="detail-value">${item.arrivalTime || 'N/A'}</div>
          </div>
        `;
      case 'package':
        return `
          <div class="detail-item">
            <div class="detail-label">Duration</div>
            <div class="detail-value">${item.duration || 'N/A'}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Destinations</div>
            <div class="detail-value">${item.destinations || 'N/A'}</div>
          </div>
        `;
      default:
        return '';
    }
  }

  generateHotelOwnerRegistrationTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Hotel Owner Registration</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .section { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
            .section h3 { margin-top: 0; color: #2c3e50; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: bold; color: #555; }
            .info-value { color: #333; margin-left: 10px; }
            .amenities { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .amenity-tag { background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
            .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .urgent { background: #fff3cd; border-left-color: #ffc107; }
            @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 New Hotel Owner Registration</h1>
                <p>A new hotel owner has submitted a registration request</p>
                <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="content">
                <div class="section urgent">
                    <h3>⚡ Action Required</h3>
                    <p><strong>Hotel Name:</strong> ${data.hotelName}</p>
                    <p><strong>Owner:</strong> ${data.ownerName}</p>
                    <p><strong>Email:</strong> ${data.ownerEmail}</p>
                    <p><strong>Phone:</strong> ${data.ownerPhone}</p>
                </div>

                <div class="section">
                    <h3>👤 Owner Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Full Name:</span>
                            <span class="info-value">${data.ownerName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${data.ownerEmail}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${data.ownerPhone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Address:</span>
                            <span class="info-value">${data.ownerAddress || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>🏨 Hotel Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Hotel Name:</span>
                            <span class="info-value">${data.hotelName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Type:</span>
                            <span class="info-value">${data.hotelType}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">City:</span>
                            <span class="info-value">${data.city}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">State:</span>
                            <span class="info-value">${data.state || 'Not provided'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Country:</span>
                            <span class="info-value">${data.country || 'Not provided'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pincode:</span>
                            <span class="info-value">${data.pincode || 'Not provided'}</span>
                        </div>
                    </div>
                    ${data.hotelAddress ? `
                    <div class="info-item" style="margin-top: 15px;">
                        <span class="info-label">Address:</span>
                        <span class="info-value">${data.hotelAddress}</span>
                    </div>
                    ` : ''}
                    ${data.description ? `
                    <div class="info-item" style="margin-top: 15px;">
                        <span class="info-label">Description:</span>
                        <span class="info-value">${data.description}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="section">
                    <h3>💼 Business Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Business License:</span>
                            <span class="info-value">${data.businessLicense}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">GST Number:</span>
                            <span class="info-value">${data.gstNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">PAN Number:</span>
                            <span class="info-value">${data.panNumber || 'Not provided'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Bank Account:</span>
                            <span class="info-value">${data.bankAccountNumber || 'Not provided'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">IFSC Code:</span>
                            <span class="info-value">${data.ifscCode || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>⭐ Hotel Features</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Total Rooms:</span>
                            <span class="info-value">${data.totalRooms}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Check-in Time:</span>
                            <span class="info-value">${data.checkInTime}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Check-out Time:</span>
                            <span class="info-value">${data.checkOutTime}</span>
                        </div>
                    </div>
                    ${data.amenities && data.amenities.length > 0 ? `
                    <div class="info-item" style="margin-top: 15px;">
                        <span class="info-label">Amenities:</span>
                        <div class="amenities">
                            ${data.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                        </div>
                    </div>
                    ` : ''}
                    ${data.cancellationPolicy ? `
                    <div class="info-item" style="margin-top: 15px;">
                        <span class="info-label">Cancellation Policy:</span>
                        <span class="info-value">${data.cancellationPolicy}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="section">
                    <h3>📋 Registration Details</h3>
                    <div class="info-item">
                        <span class="info-label">Terms Accepted:</span>
                        <span class="info-value">${data.termsAccepted ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Marketing Consent:</span>
                        <span class="info-value">${data.marketingConsent ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Submission Time:</span>
                        <span class="info-value">${new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p><strong>TravelEase Hotel Partner Registration System</strong></p>
                <p>Please review this application and contact the hotel owner within 2-3 business days.</p>
                <p><small>This is an automated email from the hotel registration system.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateHotelOwnerConfirmationTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hotel Registration Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
            .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .next-steps { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Registration Received!</h1>
                <p>Thank you for your interest in partnering with TravelEase</p>
            </div>

            <div class="content">
                <div class="success-box">
                    <h2>✅ Registration Submitted Successfully</h2>
                    <p>Dear ${data.ownerName},</p>
                    <p>We have received your hotel registration for <strong>${data.hotelName}</strong>.</p>
                </div>

                <div class="info-box">
                    <h3>📋 Registration Summary</h3>
                    <p><strong>Hotel Name:</strong> ${data.hotelName}</p>
                    <p><strong>Location:</strong> ${data.city}${data.state ? ', ' + data.state : ''}</p>
                    <p><strong>Type:</strong> ${data.hotelType}</p>
                    <p><strong>Total Rooms:</strong> ${data.totalRooms}</p>
                    <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="next-steps">
                    <h3>📅 What Happens Next?</h3>
                    <ul>
                        <li><strong>Review Process:</strong> Our team will review your application within 2-3 business days</li>
                        <li><strong>Verification:</strong> We may contact you for additional documentation or clarification</li>
                        <li><strong>Approval:</strong> Once approved, you'll receive login credentials and onboarding materials</li>
                        <li><strong>Setup:</strong> Our team will help you set up your hotel profile and room listings</li>
                    </ul>
                </div>

                <div class="contact-info">
                    <h3>📞 Need Help?</h3>
                    <p>If you have any questions about your registration, please contact our partner support team:</p>
                    <p><strong>Email:</strong> partners@travelease.com</p>
                    <p><strong>Phone:</strong> +91-80-4567-8900</p>
                    <p><strong>Support Hours:</strong> Monday to Friday, 9:00 AM - 6:00 PM</p>
                </div>

                <div class="info-box">
                    <h3>🎯 Why Partner With TravelEase?</h3>
                    <ul>
                        <li>✅ Reach 50,000+ active travelers</li>
                        <li>✅ 24/7 customer support</li>
                        <li>✅ Easy-to-use management dashboard</li>
                        <li>✅ Competitive commission rates</li>
                        <li>✅ Marketing support and promotion</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p><strong>TravelEase Technologies Pvt. Ltd.</strong></p>
                <p>123 Business Park, Sector 18, Bangalore, Karnataka 560001</p>
                <p>This email was sent to ${data.ownerEmail}</p>
                <p><small>Please do not reply to this automated email.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateHotelOwnerConfirmationTemplate(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hotel Registration Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
            .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .next-steps { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Registration Received!</h1>
                <p>Thank you for your interest in partnering with TravelEase</p>
            </div>

            <div class="content">
                <div class="success-box">
                    <h2>✅ Registration Submitted Successfully</h2>
                    <p>Dear ${data.ownerName},</p>
                    <p>We have received your hotel registration for <strong>${data.hotelName}</strong>.</p>
                </div>

                <div class="info-box">
                    <h3>📋 Registration Summary</h3>
                    <p><strong>Hotel Name:</strong> ${data.hotelName}</p>
                    <p><strong>Location:</strong> ${data.city}${data.state ? ', ' + data.state : ''}</p>
                    <p><strong>Type:</strong> ${data.hotelType}</p>
                    <p><strong>Total Rooms:</strong> ${data.totalRooms}</p>
                    <p><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                <div class="next-steps">
                    <h3>📅 What Happens Next?</h3>
                    <ul>
                        <li><strong>Review Process:</strong> Our team will review your application within 2-3 business days</li>
                        <li><strong>Verification:</strong> We may contact you for additional documentation or clarification</li>
                        <li><strong>Approval:</strong> Once approved, you'll receive login credentials and onboarding materials</li>
                        <li><strong>Setup:</strong> Our team will help you set up your hotel profile and room listings</li>
                    </ul>
                </div>

                <div class="contact-info">
                    <h3>📞 Need Help?</h3>
                    <p>If you have any questions about your registration, please contact our partner support team:</p>
                    <p><strong>Email:</strong> partners@travelease.com</p>
                    <p><strong>Phone:</strong> +91-80-4567-8900</p>
                    <p><strong>Support Hours:</strong> Monday to Friday, 9:00 AM - 6:00 PM</p>
                </div>

                <div class="info-box">
                    <h3>🎯 Why Partner With TravelEase?</h3>
                    <ul>
                        <li>✅ Reach 50,000+ active travelers</li>
                        <li>✅ 24/7 customer support</li>
                        <li>✅ Easy-to-use management dashboard</li>
                        <li>✅ Competitive commission rates</li>
                        <li>✅ Marketing support and promotion</li>
                    </ul>
                </div>
            </div>

            <div class="footer">
                <p><strong>TravelEase Technologies Pvt. Ltd.</strong></p>
                <p>123 Business Park, Sector 18, Bangalore, Karnataka 560001</p>
                <p>This email was sent to ${data.ownerEmail}</p>
                <p><small>Please do not reply to this automated email.</small></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export default new EmailService();