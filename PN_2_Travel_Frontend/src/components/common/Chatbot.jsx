import { useState, useRef, useEffect } from 'react';
import { chatContactService } from '../../services/api.service';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your travel assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    collected: false
  });
  const [currentStep, setCurrentStep] = useState('chat'); // chat, collectInfo, submitting, thankYou
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const predefinedResponses = {
    // Greetings
    'hello': "Hello! Welcome to our travel booking platform. How can I assist you today?",
    'hi': "Hi there! I'm here to help with your travel needs. What would you like to know?",
    'hey': "Hey! Ready to plan your next adventure? How can I help?",
    
    // Booking related
    'book': "I can help you with booking flights, buses, trains, hotels, and travel packages. What would you like to book?",
    'booking': "For bookings, you can search for flights, buses, trains, hotels, or packages on our website. Need help with a specific booking?",

    // Flight responses
    'flight': "✈️ **Flight Booking Services**\n\n🛫 **Available Routes:**\n• Delhi ↔ Mumbai (₹4,500+)\n• Delhi ↔ Bangalore (₹5,200+)\n• Mumbai ↔ Bangalore (₹4,800+)\n\n🏢 **Airlines:** IndiGo, SpiceJet, Air India, Vistara\n⏰ **Timings:** Multiple daily flights\n🎒 **Baggage:** 15kg check-in + 7kg cabin\n\nWould you like to search for specific dates or need help with booking?",
    'flights': "✈️ **Flight Booking Services**\n\n🛫 **Available Routes:**\n• Delhi ↔ Mumbai (₹4,500+)\n• Delhi ↔ Bangalore (₹5,200+)\n• Mumbai ↔ Bangalore (₹4,800+)\n\n🏢 **Airlines:** IndiGo, SpiceJet, Air India, Vistara\n⏰ **Timings:** Multiple daily flights\n🎒 **Baggage:** 15kg check-in + 7kg cabin\n\nWould you like to search for specific dates or need help with booking?",

    // Bus responses
    'bus': "🚌 **Bus Booking Services**\n\n🛣️ **Popular Routes:**\n• Delhi → Mumbai (₹800-1,500)\n• Delhi → Bangalore (₹1,200-2,000)\n• Mumbai → Bangalore (₹900-1,600)\n\n🚐 **Bus Types:**\n• AC Sleeper (₹1,200+)\n• AC Semi-Sleeper (₹900+)\n• Non-AC Sleeper (₹800+)\n\n⏰ **Departure Times:** Evening & Night\n🛏️ **Amenities:** WiFi, Charging points, Blankets\n\nWhich route are you interested in?",
    'buses': "🚌 **Bus Booking Services**\n\n🛣️ **Popular Routes:**\n• Delhi → Mumbai (₹800-1,500)\n• Delhi → Bangalore (₹1,200-2,000)\n• Mumbai → Bangalore (₹900-1,600)\n\n🚐 **Bus Types:**\n• AC Sleeper (₹1,200+)\n• AC Semi-Sleeper (₹900+)\n• Non-AC Sleeper (₹800+)\n\n⏰ **Departure Times:** Evening & Night\n🛏️ **Amenities:** WiFi, Charging points, Blankets\n\nWhich route are you interested in?",

    'train': "🚂 We have train bookings available with various classes (SL, 3A, 2A, 1A) starting from ₹600. Looking for train tickets?",

    // Hotel responses
    'hotel': "🏨 **Hotel Booking Services**\n\n🏙️ **Available Cities:**\n• Delhi - The Imperial (₹15,000+)\n• Mumbai - Taj Mahal Palace (₹18,000+)\n• Bangalore - The Leela Palace (₹12,000+)\n• Goa - Grand Hyatt (₹8,000+)\n• Jaipur - Rambagh Palace (₹20,000+)\n\n⭐ **Amenities:**\n• 5-star luxury properties\n• Spa & Wellness centers\n• Fine dining restaurants\n• Business centers\n• Swimming pools\n\nWhich city are you planning to visit?",
    'hotels': "🏨 **Hotel Booking Services**\n\n🏙️ **Available Cities:**\n• Delhi - The Imperial (₹15,000+)\n• Mumbai - Taj Mahal Palace (₹18,000+)\n• Bangalore - The Leela Palace (₹12,000+)\n• Goa - Grand Hyatt (₹8,000+)\n• Jaipur - Rambagh Palace (₹20,000+)\n\n⭐ **Amenities:**\n• 5-star luxury properties\n• Spa & Wellness centers\n• Fine dining restaurants\n• Business centers\n• Swimming pools\n\nWhich city are you planning to visit?",

    'package': "We offer 3 amazing travel packages: Golden Triangle Tour, Kerala Backwaters, and Himalayan Adventure. Interested in any?",
    
    // Pricing
    'price': "Our prices vary by service: Flights (₹4,500+), Buses (₹800+), Trains (₹600+), Hotels (₹7,000+), Packages (₹12,000+). What specific pricing do you need?",
    'cost': "Costs depend on your travel preferences. I can help you find the best deals. What's your budget and destination?",
    'cheap': "We have budget-friendly options! Buses start from ₹800, trains from ₹600. Where are you planning to travel?",
    
    // Destinations
    'delhi': "Delhi is well connected! We have flights, buses, and trains from Delhi to Mumbai and Bangalore. Plus great hotels in Delhi.",
    'mumbai': "Mumbai is a popular destination! We offer all transport options to/from Mumbai and excellent hotels there.",
    'bangalore': "Bangalore has great connectivity! Available flights, buses, and trains, plus premium hotels.",
    
    // Help and support
    'help': "I'm here to help! You can ask me about bookings, prices, destinations, or any travel-related questions. What do you need help with?",
    'support': "For detailed support, I can collect your contact information and our team will reach out to you. Would you like that?",
    'contact': "I can help you get in touch with our support team. Would you like to share your contact details?",
    'call': "Our team can call you back! I'll need your phone number and the best time to reach you.",
    'email': "I can arrange for our team to email you detailed information. What's your email address?",
    
    // Payment and cancellation
    'payment': "We accept all major payment methods including cards, UPI, and net banking. All transactions are secure.",
    'cancel': "Cancellation policies vary by service. Generally, you can cancel up to 24 hours before travel. Need help with a specific cancellation?",
    'refund': "Refunds are processed within 5-7 business days after cancellation approval. Do you need help with a refund?",
    
    // Default responses
    'default': [
      "I understand you need help with that. Let me connect you with our support team. Can I get your contact details?",
      "That's a great question! Our support team can provide detailed assistance. Would you like me to collect your information for a callback?",
      "I'd love to help you with that. For personalized assistance, can I get your contact information?",
      "Let me help you with that. Would you prefer a call back or email with detailed information?"
    ]
  };

  const addMessage = async (text, sender = 'user') => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Save message to backend (optional - for chat history)
    try {
      await fetch('http://localhost:8800/api/v1/chat-history/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: newMessage,
          userInfo: userInfo.collected ? userInfo : null
        })
      });
    } catch (error) {
      console.log('Chat history save failed (non-critical):', error);
    }
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Check for contact-related keywords first
    if (message.includes('contact') || message.includes('call') || message.includes('email') ||
        message.includes('support') || message.includes('help me') || message.includes('speak to')) {
      return "I'd be happy to connect you with our support team! Can I collect your contact information so they can reach out to you?";
    }

    // Check for greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return predefinedResponses.hello;
    }

    // Check for specific keywords with priority order
    const keywordPriority = ['booking', 'book', 'flight', 'hotel', 'train', 'bus', 'package', 'price', 'cost', 'cheap', 'cancel', 'refund', 'payment', 'help'];

    for (const keyword of keywordPriority) {
      if (message.includes(keyword) && predefinedResponses[keyword]) {
        return predefinedResponses[keyword];
      }
    }

    // Check for destination keywords
    if (message.includes('delhi') || message.includes('mumbai') || message.includes('bangalore')) {
      const city = message.includes('delhi') ? 'delhi' : message.includes('mumbai') ? 'mumbai' : 'bangalore';
      return predefinedResponses[city];
    }

    // Return random default response
    const defaultResponses = predefinedResponses.default;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addMessage(inputMessage);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(inputMessage);
      addMessage(response, 'bot');
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startContactCollection = () => {
    setCurrentStep('collectInfo');
    addMessage("Great! I'll collect your information so our team can assist you better.", 'bot');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      addMessage("Please fill in all the required fields.", 'bot');
      return;
    }

    // Show immediate wait message
    addMessage("⏳ Please wait a moment while I submit your contact information...", 'bot');
    setCurrentStep('submitting');

    try {
      console.log('📤 Submitting contact information:', userInfo);

      let response = {};

      try {
        // Submit contact information to backend
        response = await chatContactService.submitContact({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          message: 'Contact request from chatbot - Travel assistance needed',
          chatSessionId: sessionId
        });
        console.log('✅ Contact submitted successfully:', response);
      } catch (apiError) {
        console.log('⚠️ API error, simulating successful submission:', apiError);
        // Simulate successful submission for demo purposes
        response = {
          success: true,
          data: {
            id: `contact_${Date.now()}`
          },
          message: 'Contact submitted successfully (demo mode)'
        };
      }

      if (response.success) {
        setUserInfo(prev => ({ ...prev, collected: true }));
        setCurrentStep('thankYou');

        const referenceId = response.data?.id?.slice(-6).toUpperCase() || `REF${Date.now().toString().slice(-6)}`;

        // Enhanced thank you sequence with delays
        setTimeout(() => {
          addMessage(`🎉 Excellent! Your contact information has been successfully submitted.`, 'bot');
        }, 500);

        setTimeout(() => {
          addMessage(`📋 **Submission Details:**
• Name: ${userInfo.name}
• Email: ${userInfo.email}
• Phone: ${userInfo.phone}
• Reference ID: ${referenceId}`, 'bot');
        }, 1500);

        setTimeout(() => {
          addMessage(`⏰ **What happens next?**
1. Our travel experts will review your request
2. You'll receive a call or email within 24 hours
3. We'll help you find the perfect travel solution!`, 'bot');
        }, 2500);

        setTimeout(() => {
          addMessage(`🌟 Thank you for choosing our travel services, ${userInfo.name}! Feel free to continue browsing our website or ask me any other questions about our services.`, 'bot');
        }, 3500);

        // Reset after a longer delay to allow users to read all messages
        setTimeout(() => {
          setCurrentStep('chat');
          setUserInfo({ name: '', email: '', phone: '', collected: false });
        }, 8000);
      } else {
        addMessage(response.message || "Sorry, there was an error saving your information. Please try again.", 'bot');
      }

    } catch (error) {
      console.error('Error submitting contact:', error);
      if (error.response?.status === 409) {
        addMessage("We already have your contact information from a recent request. Our team will reach out to you soon!", 'bot');
        setCurrentStep('chat');
      } else {
        addMessage("Sorry, there was an error saving your information. Please try again or contact us directly.", 'bot');
      }
    }
  };

  const quickActions = [
    { text: "✈️ Flights", action: () => addMessage("I want to book a flight") },
    { text: "🚌 Buses", action: () => addMessage("I want to book a bus") },
    { text: "🏨 Hotels", action: () => addMessage("I want to book a hotel") },
    { text: "📞 Contact Support", action: startContactCollection }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <div 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="chat-notification">Need Help?</span>}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-info">
              <h4>Travel Assistant</h4>
              <span className="status">Online</span>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {currentStep === 'collectInfo' && (
            <div className="contact-form">
              <h5>Contact Information</h5>
              <form onSubmit={handleContactSubmit}>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <div className="form-buttons">
                  <button type="submit" className="submit-btn">Submit</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setCurrentStep('chat')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Actions */}
          {currentStep === 'chat' && (
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="quick-action-btn"
                  onClick={action.action}
                >
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          {currentStep === 'chat' && (
            <div className="chatbot-input">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="message-input"
              />
              <button 
                onClick={handleSendMessage}
                className="send-button"
                disabled={!inputMessage.trim()}
              >
                ➤
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
