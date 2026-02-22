import React, { useState } from 'react';
import Footer from '../../components/common/Footer';
import './HelpCenter.css';

const HelpCenter = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = {
    general: {
      title: 'General Questions',
      icon: '❓',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Register" button in the top navigation, fill in your details, and verify your email address.'
        },
        {
          question: 'Is my personal information secure?',
          answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information.'
        },
        {
          question: 'How can I contact customer support?',
          answer: 'You can reach us via email at support@travelease.com, call our toll-free number 1800-123-4567, or use the live chat feature.'
        }
      ]
    },
    booking: {
      title: 'Booking & Reservations',
      icon: '📅',
      faqs: [
        {
          question: 'How do I make a booking?',
          answer: 'Search for your desired service (hotel, flight, train, or bus), select your preferred option, fill in passenger details, and complete the payment.'
        },
        {
          question: 'Can I modify my booking after confirmation?',
          answer: 'Yes, you can modify most bookings up to 24 hours before your travel date. Additional charges may apply.'
        },
        {
          question: 'How do I cancel my booking?',
          answer: 'Go to "My Account" > "My Bookings", find your booking, and click "Cancel". Cancellation charges may apply based on the service provider\'s policy.'
        }
      ]
    },
    payment: {
      title: 'Payment & Refunds',
      icon: '💳',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, net banking, UPI, and digital wallets like Paytm, PhonePe, and Google Pay.'
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 5-7 business days after cancellation approval. The amount will be credited to your original payment method.'
        },
        {
          question: 'Are there any hidden charges?',
          answer: 'No, we believe in transparent pricing. All taxes and fees are clearly displayed before you complete your booking.'
        }
      ]
    },
    travel: {
      title: 'Travel Information',
      icon: '✈️',
      faqs: [
        {
          question: 'Do I need to print my tickets?',
          answer: 'No, you can show your e-ticket on your mobile device. However, we recommend keeping a printed copy as backup.'
        },
        {
          question: 'What documents do I need for travel?',
          answer: 'For domestic travel, a government-issued photo ID is required. For international travel, a valid passport and visa (if required) are necessary.'
        },
        {
          question: 'Can I travel with pets?',
          answer: 'Pet policies vary by service provider. Please check the specific terms during booking or contact customer support for assistance.'
        }
      ]
    }
  };

  const contactMethods = [
    {
      title: '24/7 Phone Support',
      icon: '📞',
      details: 'Toll Free: 1800-123-4567',
      description: 'Available round the clock for urgent assistance'
    },
    {
      title: 'Email Support',
      icon: '📧',
      details: 'support@travelease.com',
      description: 'Response within 24 hours'
    },
    {
      title: 'Live Chat',
      icon: '💬',
      details: 'Available on website',
      description: 'Instant support during business hours'
    },
    {
      title: 'WhatsApp',
      icon: '📱',
      details: '+91-98765-43210',
      description: 'Quick queries and updates'
    }
  ];

  const filteredFaqs = faqCategories[activeCategory].faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="help-center">
      <div className="help-header">
        <div className="help-header-content">
          <h1>🆘 Help Center</h1>
          <p>Find answers to your questions and get the support you need</p>
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
      </div>

      <div className="help-content">
        <div className="help-container">
          {/* FAQ Categories */}
          <div className="faq-categories">
            {Object.entries(faqCategories).map(([key, category]) => (
              <button
                key={key}
                className={`category-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-title">{category.title}</span>
              </button>
            ))}
          </div>

          {/* FAQ Content */}
          <div className="faq-content">
            <h2>{faqCategories[activeCategory].title}</h2>
            <div className="faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h3 className="faq-question">{faq.question}</h3>
                    <p className="faq-answer">{faq.answer}</p>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No FAQs found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="contact-section">
          <h2>Still Need Help?</h2>
          <p>Our support team is here to assist you</p>
          
          <div className="contact-methods">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <p className="contact-details">{method.details}</p>
                <p className="contact-description">{method.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn">
              <span>📋</span>
              <span>Check Booking Status</span>
            </button>
            <button className="action-btn">
              <span>🔄</span>
              <span>Modify Booking</span>
            </button>
            <button className="action-btn">
              <span>❌</span>
              <span>Cancel Booking</span>
            </button>
            <button className="action-btn">
              <span>💰</span>
              <span>Request Refund</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
